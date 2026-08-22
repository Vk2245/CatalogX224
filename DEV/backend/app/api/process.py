"""
Process API: upload PDFs and stream pipeline progress via SSE.

The /api/process endpoint:
  1. Accepts a PDF upload
  2. Saves it to the database
  3. Runs the AI-ML pipeline
  4. Streams progress updates as Server-Sent Events
  5. Saves the result to the database with a tamper-proof hash
"""

import sys
import hashlib
import asyncio
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import Document, ProductRecord, Report, AuditLog, get_db, async_session_factory
from app.api.auth import get_current_user, User
from app.core.security import (
    compute_content_hash, generate_safe_filename, validate_file_upload,
)
from app.core.config import (
    UPLOAD_DIR, REPORTS_DIR, ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_MB,
    AI_ML_DIR, DEFAULT_PROVIDER,
)


router = APIRouter(prefix="/api", tags=["process"])


# ---------------------------------------------------------------------------
# Upload endpoint
# ---------------------------------------------------------------------------

@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a product PDF for analysis.

    Returns the document ID. Use /api/process/{doc_id} to start
    processing and stream progress.
    """
    # Read file content
    content = await file.read()
    file_size = len(content)

    # Validate
    is_valid, error = validate_file_upload(
        file.filename or "unknown",
        file_size,
        ALLOWED_EXTENSIONS,
        MAX_UPLOAD_SIZE_MB,
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    # Generate safe filename and save
    safe_name = generate_safe_filename(file.filename or "document.pdf")
    file_path = UPLOAD_DIR / safe_name
    file_path.write_bytes(content)

    # Compute file hash
    file_hash = hashlib.sha256(content).hexdigest()

    # Save to database
    doc = Document(
        owner_id=user.id,
        original_filename=file.filename or "document.pdf",
        stored_filename=safe_name,
        file_size_bytes=file_size,
        file_hash=file_hash,
        status="uploaded",
    )
    db.add(doc)
    await db.flush()

    # Audit log
    db.add(AuditLog(
        user_id=user.id,
        action="upload_document",
        resource_type="document",
        resource_id=doc.id,
        ip_address=request.client.host if request.client else None,
        details=f"filename={file.filename}, size={file_size}",
    ))

    return {
        "document_id": doc.id,
        "filename": file.filename,
        "file_hash": file_hash,
        "status": "uploaded",
        "message": "Document uploaded successfully. Use /api/process/{id} to start analysis.",
    }


# ---------------------------------------------------------------------------
# Process + SSE streaming endpoint
# ---------------------------------------------------------------------------

@router.get("/process/{doc_id}")
async def process_document(
    doc_id: int,
    request: Request,
    user: User = Depends(get_current_user),
):
    """
    Process a document and stream progress via Server-Sent Events.

    Each SSE event is a JSON object with:
      - progress: 0-100 (or -1 for error)
      - message: human-readable status message
      - data: optional payload (final result at 100%)
    """
    # Use a manual session for the initial lookup so we can close it
    # BEFORE returning the StreamingResponse. This prevents the
    # "no active connection" and "database is locked" errors that
    # occur when FastAPI's get_db dependency auto-closes mid-stream.
    async with async_session_factory() as init_db:
        result = await init_db.execute(
            select(Document).where(Document.id == doc_id, Document.owner_id == user.id)
        )
        doc = result.scalar_one_or_none()

        if doc is None:
            raise HTTPException(status_code=404, detail="Document not found")

        if doc.status == "processing":
            raise HTTPException(status_code=409, detail="Document is already being processed")

        # Update status and commit
        doc.status = "processing"
        await init_db.commit()

        # Capture what we need before session closes
        pdf_path = str(UPLOAD_DIR / doc.stored_filename)
        user_id = user.id

    # Session is now cleanly closed. Build the SSE stream.
    async def event_stream():
        """Generator that runs the pipeline and yields SSE events."""
        # Add AI-ML to Python path
        if str(AI_ML_DIR) not in sys.path:
            sys.path.insert(0, str(AI_ML_DIR))

        try:
            from pipeline.run import run_pipeline

            for update in run_pipeline(pdf_path, provider=DEFAULT_PROVIDER):
                progress = update.get("progress", 0)
                message = update.get("message", "")
                data = update.get("data")

                event_data = {
                    "progress": progress,
                    "message": message,
                }

                if progress == 100 and data:
                    # Save results to database
                    record_data = data.get("record", {})
                    record_data["risks_summary"] = data.get("risks", {})
                    record_data["agent_log"] = data.get("agent_log", [])
                    content_hash = compute_content_hash(record_data)

                    async with async_session_factory() as bg_db:
                        bg_doc = await bg_db.get(Document, doc_id)
                        if bg_doc:
                            # Delete existing records to allow re-processing and prevent IntegrityError
                            await bg_db.execute(delete(ProductRecord).where(ProductRecord.document_id == bg_doc.id))
                            await bg_db.execute(delete(Report).where(Report.document_id == bg_doc.id))
                            
                            product_record = ProductRecord(
                                document_id=bg_doc.id,
                                product_name=record_data.get("product_name", ""),
                                manufacturer=record_data.get("manufacturer", ""),
                                part_number=record_data.get("part_number", ""),
                                industry=record_data.get("industry", ""),
                                category=record_data.get("category", ""),
                                record_data=record_data,
                                record_confidence=record_data.get("record_confidence", 0.0),
                                validation_passed=record_data.get("validation_passed", False),
                                risk_level=data.get("risks", {}).get("overall_risk_level", "low"),
                                content_hash=content_hash,
                            )
                            bg_db.add(product_record)

                            # Save report
                            report_paths = data.get("report_paths", {})
                            report = Report(
                                document_id=bg_doc.id,
                                report_html_path=report_paths.get("html", ""),
                                report_pdf_path=report_paths.get("pdf", ""),
                            )
                            bg_db.add(report)

                            bg_doc.status = "completed"
                            bg_doc.processed_at = datetime.now(timezone.utc)

                            # Audit
                            bg_db.add(AuditLog(
                                user_id=user_id,
                                action="process_completed",
                                resource_type="document",
                                resource_id=bg_doc.id,
                                details=f"product={record_data.get('product_name', '')}",
                            ))
                            await bg_db.commit()

                    # Add content hash and complete status to SSE response
                    event_data["status"] = "completed"
                    event_data["data"] = {
                        "record": record_data,
                        "risks": data.get("risks", {}),
                        "content_hash": content_hash,
                        "report_paths": report_paths,
                        "processing_time_sec": data.get("processing_time_sec", 0),
                    }

                elif progress == -1:
                    # Error
                    async with async_session_factory() as bg_db:
                        bg_doc = await bg_db.get(Document, doc_id)
                        if bg_doc:
                            bg_doc.status = "failed"
                            bg_db.add(AuditLog(
                                user_id=user_id,
                                action="process_failed",
                                resource_type="document",
                                resource_id=bg_doc.id,
                                details=message,
                            ))
                            await bg_db.commit()

                yield f"data: {json.dumps(event_data)}\n\n"

        except Exception as e:
            error_event = {"progress": -1, "message": f"Pipeline error: {str(e)}"}
            async with async_session_factory() as bg_db:
                bg_doc = await bg_db.get(Document, doc_id)
                if bg_doc:
                    bg_doc.status = "failed"
                    await bg_db.commit()
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# Verify tamper-proof hash
# ---------------------------------------------------------------------------

@router.get("/verify/{doc_id}")
async def verify_record_integrity(
    doc_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Verify that a product record has not been tampered with.

    Re-computes the HMAC-SHA256 of the stored record data and
    compares it to the stored hash. If they match, the record
    is intact. If not, it has been tampered with.
    """
    result = await db.execute(
        select(ProductRecord)
        .join(Document)
        .where(Document.id == doc_id, Document.owner_id == user.id)
    )
    record = result.scalar_one_or_none()

    if record is None:
        raise HTTPException(status_code=404, detail="Product record not found")

    # Re-compute hash
    current_hash = compute_content_hash(record.record_data)
    is_intact = current_hash == record.content_hash

    return {
        "document_id": doc_id,
        "product_name": record.product_name,
        "stored_hash": record.content_hash,
        "computed_hash": current_hash,
        "is_intact": is_intact,
        "verdict": "INTACT — record has not been tampered with" if is_intact
                   else "TAMPERED — record data has been modified!",
    }
