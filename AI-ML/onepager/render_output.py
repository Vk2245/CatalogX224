"""
Renders generated content (one-pager, reports) to Markdown and HTML.

Converts Markdown strings to styled HTML documents suitable for
viewing in a browser or converting to PDF.
"""

import sys
from pathlib import Path
from typing import Optional


# Minimal CSS for clean rendered output
REPORT_CSS = """
body {
    font-family: 'Segoe UI', Arial, sans-serif;
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
    color: #333;
    line-height: 1.6;
}
h1 { color: #1a1a2e; border-bottom: 2px solid #16213e; padding-bottom: 8px; }
h2 { color: #16213e; margin-top: 24px; }
h3 { color: #0f3460; }
table { border-collapse: collapse; width: 100%; margin: 16px 0; }
th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
th { background-color: #16213e; color: white; }
tr:nth-child(even) { background-color: #f8f9fa; }
.confidence-high { color: #28a745; font-weight: bold; }
.confidence-medium { color: #ffc107; font-weight: bold; }
.confidence-low { color: #dc3545; font-weight: bold; }
.risk-critical { background-color: #f8d7da; padding: 8px; border-left: 4px solid #dc3545; margin: 8px 0; }
.risk-high { background-color: #fff3cd; padding: 8px; border-left: 4px solid #ffc107; margin: 8px 0; }
.risk-medium { background-color: #d1ecf1; padding: 8px; border-left: 4px solid #17a2b8; margin: 8px 0; }
code { background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
"""


def render_to_html(
    markdown_content: str,
    title: str = "Product Intelligence Report",
    extra_css: str = "",
) -> str:
    """
    Convert Markdown content to a styled HTML document.
    """
    import markdown as md

    html_body = md.markdown(
        markdown_content,
        extensions=["tables", "fenced_code", "toc"],
    )

    css = REPORT_CSS + extra_css

    html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>{css}</style>
</head>
<body>
{html_body}
</body>
</html>"""

    return html_doc


def save_html(
    html_content: str,
    output_path: str,
) -> str:
    """Save HTML content to a file. Returns the output path."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    return output_path


def render_to_pdf(
    html_content: str,
    output_path: str,
) -> str:
    """
    Convert HTML to PDF using weasyprint.

    Returns the output PDF path. Falls back to saving HTML only
    if weasyprint is not available.
    """
    try:
        from weasyprint import HTML
        HTML(string=html_content).write_pdf(output_path)
        return output_path
    except ImportError:
        # Fallback: save as HTML if weasyprint not installed
        html_path = output_path.replace(".pdf", ".html")
        save_html(html_content, html_path)
        print(f"weasyprint not installed, saved as HTML instead: {html_path}")
        return html_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m onepager.render_output <markdown_file> [output.html|output.pdf]")
        sys.exit(1)

    md_path = sys.argv[1]
    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    output = sys.argv[2] if len(sys.argv) > 2 else md_path.replace(".md", ".html")

    html = render_to_html(md_content)

    if output.endswith(".pdf"):
        result = render_to_pdf(html, output)
    else:
        result = save_html(html, output)

    print(f"Rendered to: {result}")
