import jsPDF from "jspdf";
import dayjs from "dayjs";
import logo from "../assets/logo.png.jpeg";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const HALF_HEIGHT = 148.5;
const BOX_HEIGHT = HALF_HEIGHT - 10; // 138.5mm usable box per half

//----------------------------------------------------
// Helpers
//----------------------------------------------------

const formatDate = (date) => (date ? dayjs(date).format("DD.MM.YYYY") : "");

const add15Days = (date, days = 15) =>
  date ? dayjs(date).add(days, "day").format("DD.MM.YYYY") : "";

const formatAmount = (amount) =>
  amount ? Number(amount).toLocaleString("en-IN") : "";

const drawLine = (doc, x1, y1, x2, y2) => doc.line(x1, y1, x2, y2);

const drawCenteredText = (doc, text, y, fontSize = 12, style = "normal") => {
  doc.setFont("times", style);
  doc.setFontSize(fontSize);
  const width = doc.getTextWidth(text);
  doc.text(text, (PAGE_WIDTH - width) / 2, y);
};

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });

/**
 * Draws "Label : ____________" and, if a value is supplied, sits the value
 * text just above the underline so it never collides with a neighbouring row.
 * Returns the x position where the blank line started (useful if you need
 * to know the remaining width, e.g. for the amount / purpose rows).
 */
const drawField = (
  doc,
  { label, labelX, y, lineEndX, value, fontSize = 9, gap = 2 }
) => {
  doc.setFont("times", "bold");
  doc.setFontSize(fontSize);
  doc.text(label, labelX, y);

  const labelWidth = doc.getTextWidth(label);
  const lineStartX = labelX + labelWidth + gap;

  drawLine(doc, lineStartX, y, lineEndX, y);

  if (value) {
    doc.setFont("times", "normal");
    doc.setFontSize(fontSize);
    doc.text(String(value), lineStartX + 1, y - 1);
  }

  return lineStartX;
};

//----------------------------------------------------
// Draws ONE full receipt inside a half-page box starting at boxTop
//----------------------------------------------------

const drawReceiptCopy = (doc, boxTop, logoImg, data) => {
  const {
    iqacNumber,
    requisitionDate,
    employeeName,
    empId,
    designation,
    department,
    advanceAmount,
    purpose,
    clearBeforeDate,
    clearanceDays,
  } = data;

  //-------------------- Outer border --------------------
  doc.setLineWidth(0.5);
  doc.setDrawColor(0);
  doc.rect(5, boxTop, 200, BOX_HEIGHT);

  //-------------------- Header / logo --------------------
  const logoWidth = 60;
  const logoHeight = 13;
  doc.addImage(
    logoImg,
    "PNG",
    (PAGE_WIDTH - logoWidth) / 2,
    boxTop + 4,
    logoWidth,
    logoHeight
  );

  drawLine(doc, 5, boxTop + 19, 205, boxTop + 19);

  //-------------------- Title + IQAC number (top right) --------------------
  const titleY = boxTop + 26;
  drawCenteredText(doc, "Request for Advance / Travel Advance", titleY, 11, "bold");

  doc.setFont("times", "bold");
  doc.setFontSize(8);
  doc.text(iqacNumber || "", 165, titleY);

  //-------------------- Row 1: Requisition Date --------------------
  const row1Y = boxTop + 35;
  drawField(doc, {
    label: "Requisition Date :",
    labelX: 10,
    y: row1Y,
    lineEndX: 100,
    value: requisitionDate,
  });

  //-------------------- Row 2: Name / Emp ID --------------------
  const row2Y = boxTop + 44;
  drawField(doc, {
    label: "Name :",
    labelX: 10,
    y: row2Y,
    lineEndX: 100,
    value: employeeName,
  });
  drawField(doc, {
    label: "Emp ID :",
    labelX: 110,
    y: row2Y,
    lineEndX: 201,
    value: empId,
  });

  //-------------------- Row 3: Designation / Department --------------------
  const row3Y = boxTop + 53;
  drawField(doc, {
    label: "Designation :",
    labelX: 10,
    y: row3Y,
    lineEndX: 100,
    value: designation,
  });
  drawField(doc, {
    label: "Department :",
    labelX: 110,
    y: row3Y,
    lineEndX: 201,
    value: department,
  });

  //-------------------- Row 4: Amount --------------------
  const row4Y = boxTop + 62;
  drawField(doc, {
    label:
      "I required a Cash / In Bank / Travel Advance / Online Payment of Rs.",
    labelX: 10,
    y: row4Y,
    lineEndX: 201,
    value: advanceAmount,
  });

  //-------------------- Row 5 & 6: Purpose (wrapped) --------------------
  const row5Y = boxTop + 71;
  const row6Y = boxTop + 79;

  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.text("Purpose of Advance :", 10, row5Y);
  const purposeLabelWidth = doc.getTextWidth("Purpose of Advance :");
  const purposeLine1StartX = 10 + purposeLabelWidth + 2;

  drawLine(doc, purposeLine1StartX, row5Y, 201, row5Y);
  drawLine(doc, 10, row6Y, 201, row6Y);

  doc.setFont("times", "normal");
  doc.setFontSize(9);

  const purposeText = purpose || "";
  const maxWidthRow5 = 201 - purposeLine1StartX - 2;
  const maxWidthRow6 = 201 - 10 - 2;

  const wrappedRow1 = doc.splitTextToSize(purposeText, maxWidthRow5);
  const line1 = wrappedRow1[0] || "";
  const remainingText = purposeText.slice(line1.length).trim();
  const wrappedRow2 = doc.splitTextToSize(remainingText, maxWidthRow6);
  const line2 = wrappedRow2[0] || "";

  if (line1) doc.text(line1, purposeLine1StartX + 1, row5Y - 1);
  if (line2) doc.text(line2, 11, row6Y - 1);

  //-------------------- Row 7: Clear the advance within --------------------
  const row7Y = boxTop + 90;
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.text("I will Clear the Advance within", 10, row7Y);
  const daysLabelWidth = doc.getTextWidth("I will Clear the Advance within");
  const daysLineStartX = 10 + daysLabelWidth + 2;
  const daysLineEndX = daysLineStartX + 16;
  drawLine(doc, daysLineStartX, row7Y, daysLineEndX, row7Y);

  doc.setFont("times", "normal");
  doc.text(String(clearanceDays ?? 15), daysLineStartX + 3, row7Y - 1);

  const daysWordX = daysLineEndX + 3;
  doc.setFont("times", "bold");
  doc.text("Days", daysWordX, row7Y);

  const orLabelX = daysWordX + doc.getTextWidth("Days") + 5;
  doc.text("Or On or before", orLabelX, row7Y);
  const orLabelWidth = doc.getTextWidth("Or On or before");
  const dateLineStartX = orLabelX + orLabelWidth + 2;
  drawLine(doc, dateLineStartX, row7Y, 201, row7Y);

  doc.setFont("times", "normal");
  doc.text(clearBeforeDate || "", dateLineStartX + 1, row7Y - 1);

  //-------------------- IQAC Number box --------------------
  const iqacLabelY = boxTop + 99;
  const iqacBoxY = boxTop + 102;
  const iqacBoxHeight = 12;

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("IQAC Number", 10, iqacLabelY);

  doc.rect(10, iqacBoxY, 195, iqacBoxHeight);
  doc.setFontSize(7);
  doc.setFont("times", "normal");
  const iqacTextWidth = doc.getTextWidth(iqacNumber || "");
  const iqacTextX = 10 + (195 - iqacTextWidth) / 2;
  doc.text(iqacNumber || "", iqacTextX, iqacBoxY + iqacBoxHeight / 2 + 2);

  //-------------------- Signature row --------------------
  const sigLine1Y = boxTop + 123;
  const sigLine2Y = boxTop + 127;
  const sigLine3Y = boxTop + 131;

  doc.setFont("times", "bold");
  doc.setFontSize(7);

  doc.text("Signature of Faculty", 9, sigLine1Y);
  doc.text("Member", 9, sigLine2Y);

  doc.text("Recommended", 51, sigLine1Y);
  doc.text("by Dean / HOD /", 46, sigLine2Y);
  doc.text("Section Head", 51, sigLine3Y);

  doc.text("Clearance", 94, sigLine1Y);
  doc.text("from Lead IQAC", 89, sigLine2Y);

  doc.text("Approved by", 131, sigLine1Y);
  doc.text("Principal", 137, sigLine2Y);

  doc.text("Alloted by IQAC Office", 156, sigLine1Y);
  doc.text("after", 178, sigLine2Y);
  doc.text("Principal's Approval", 161, sigLine3Y);
};

//----------------------------------------------------
// Main export
//----------------------------------------------------

export default async function ReportPdf({
  formData,
  employee,
  submitResponse,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const selectedDate =
    formData?.selectDate || formData?.date || formData?.eventDays?.[0]?.date || null;

  const data = {
    iqacNumber: submitResponse?.iqacNumber || "",
    requisitionDate: formatDate(selectedDate),
    employeeName:
      employee?.name || employee?.employeeName || formData?.employeeName || "",
    empId: submitResponse?.employeeId || employee?.empId || employee?.employeeId || "",
    designation: employee?.designation || "",
    department: employee?.department || "",
    advanceAmount: formatAmount(formData?.advanceAmount),
    purpose: formData?.advancePurpose || formData?.purposeOfAdvance || "",
    clearBeforeDate: add15Days(selectedDate, formData?.clearanceDays || 15),
    clearanceDays: formData?.clearanceDays || 15,
  };

  const logoImg = await loadImage(logo);

  // Dashed cutting line across the middle of the page
  doc.setDrawColor(180);
  doc.setLineDash([2, 2], 0);
  doc.line(5, HALF_HEIGHT, 205, HALF_HEIGHT);
  doc.setLineDash([], 0);
  doc.setDrawColor(0);

  // Top copy — the actual filled receipt
  drawReceiptCopy(doc, 5, logoImg, data);

  // Bottom half intentionally left blank — no border, no content

  doc.save(`Advance_Receipt_${data.iqacNumber || "Receipt"}.pdf`);
}