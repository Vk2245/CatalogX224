"""
Records API: CRUD for saved product records and reports.

Provides history of all analyzed products for the authenticated user.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.database import Document, ProductRecord, Report, get_db
from app.api.auth import get_current_user, User


router = APIRouter(prefix="/api/records", tags=["records"])


# ---------------------------------------------------------------------------
# List all records for the current user
# ---------------------------------------------------------------------------

@router.get("/")
async def list_records(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all product records for the current user."""
    result = await db.execute(
        select(Document)
        .where(Document.owner_id == user.id)
        .order_by(Document.uploaded_at.desc())
    )
    documents = result.scalars().all()

    records = []
    for doc in documents:
        # Fetch associated product record
        pr_result = await db.execute(
            select(ProductRecord).where(ProductRecord.document_id == doc.id)
        )
        pr = pr_result.scalar_one_or_none()

        records.append({
            "document_id": doc.id,
            "original_filename": doc.original_filename,
            "status": doc.status,
            "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
            "processed_at": doc.processed_at.isoformat() if doc.processed_at else None,
            "product_name": pr.product_name if pr else None,
            "manufacturer": pr.manufacturer if pr else None,
            "industry": pr.industry if pr else None,
            "record_confidence": pr.record_confidence if pr else None,
            "risk_level": pr.risk_level if pr else None,
            "content_hash": pr.content_hash if pr else None,
        })

    return {"count": len(records), "records": records}


# ---------------------------------------------------------------------------
# Get a single record
# ---------------------------------------------------------------------------

@router.get("/{doc_id}")
async def get_record(
    doc_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the full product record for a specific document."""
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.owner_id == user.id)
    )
    doc = result.scalar_one_or_none()

    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    pr_result = await db.execute(
        select(ProductRecord).where(ProductRecord.document_id == doc_id)
    )
    pr = pr_result.scalar_one_or_none()

    report_result = await db.execute(
        select(Report).where(Report.document_id == doc_id)
    )
    report = report_result.scalar_one_or_none()

    return {
        "document": {
            "id": doc.id,
            "original_filename": doc.original_filename,
            "status": doc.status,
            "file_hash": doc.file_hash,
            "file_size_bytes": doc.file_size_bytes,
            "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
            "processed_at": doc.processed_at.isoformat() if doc.processed_at else None,
        },
        "product_record": {
            "product_name": pr.product_name,
            "manufacturer": pr.manufacturer,
            "part_number": pr.part_number,
            "industry": pr.industry,
            "category": pr.category,
            "record_confidence": pr.record_confidence,
            "validation_passed": pr.validation_passed,
            "risk_level": pr.risk_level,
            "content_hash": pr.content_hash,
            "record_data": pr.record_data,
        } if pr else None,
        "report": {
            "html_path": report.report_html_path,
            "pdf_path": report.report_pdf_path,
            "generated_at": report.generated_at.isoformat() if report.generated_at else None,
        } if report else None,
    }


# ---------------------------------------------------------------------------
# Delete a record
# ---------------------------------------------------------------------------

@router.delete("/{doc_id}")
async def delete_record(
    doc_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a document and all associated records."""
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.owner_id == user.id)
    )
    doc = result.scalar_one_or_none()

    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    await db.delete(doc)

    return {"message": f"Document {doc_id} and all associated records deleted."}
