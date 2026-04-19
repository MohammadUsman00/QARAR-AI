import { jsPDF } from "jspdf";

export function downloadAutopsyPdf(
  title: string,
  bodyMarkdown: string,
  filename = "qarar-autopsy.pdf",
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;
  const lineHeight = 14;
  const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Qarar — Decision Autopsy", margin, y);
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(title, margin, y);
  y += 20;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated ${new Date().toLocaleString()}`, margin, y);
  y += 24;
  doc.setTextColor(0, 0, 0);

  const lines = doc.splitTextToSize(bodyMarkdown, maxWidth);
  for (const line of lines) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save(filename);
}
