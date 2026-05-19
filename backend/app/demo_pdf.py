from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def create_demo_pdf(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(path), pagesize=letter, rightMargin=42, leftMargin=42, topMargin=42, bottomMargin=42)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("Fictional Quarterly Operating Snapshot", styles["Title"]),
        Paragraph(
            "This sample mimics a messy business PDF: narrow columns, mixed units, and a value that sits close to a rule.",
            styles["BodyText"],
        ),
        Spacer(1, 18),
    ]
    data = [
        ["Metric", "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
        ["Revenue", "$1.24M", "$1.41M", "$1.55M", "$1.72M"],
        ["Cost of goods", "$0.51M", "$0.57M", "$0.63M", "$0.69M"],
        ["Gross margin", "58.9%", "59.6%", "59.4%", "59.9%"],
        ["Support tickets", "1,920", "2,104", "2,318", "2,771"],
    ]
    table = Table(data, colWidths=[142, 82, 82, 82, 82])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#133c55")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#6d7f8b")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f7faf9")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#edf5f1")]),
                ("LINEBELOW", (3, 2), (3, 2), 1.5, colors.HexColor("#cc3f3f")),
            ]
        )
    )
    story.extend([table, Spacer(1, 16)])
    story.append(Paragraph("Units: USD millions unless noted. Prepared for TableProof demo only.", styles["Italic"]))
    doc.build(story)


if __name__ == "__main__":
    create_demo_pdf(Path(__file__).resolve().parents[2] / "samples" / "messy-quarterly-report.pdf")
