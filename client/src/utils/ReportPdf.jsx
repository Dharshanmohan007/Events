import jsPDF from "jspdf";
import dayjs from "dayjs";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;

const LEFT = 10;
const RIGHT = 200;

const formatDate = (date) => {
  if (!date) return "";

  return dayjs(date).format("DD.MM.YYYY");
};

const add15Days = (date) => {
  if (!date) return "";

  return dayjs(date).add(15, "day").format("DD.MM.YYYY");
};

const formatAmount = (amount) => {
  if (!amount) return "";

  return Number(amount).toLocaleString("en-IN");
};

const drawLine = (doc, x1, y1, x2, y2) => {
  doc.line(x1, y1, x2, y2);
};

const drawCenteredText = (doc, text, y, fontSize = 12, style = "normal") => {
  doc.setFont("times", style);
  doc.setFontSize(fontSize);

  const width = doc.getTextWidth(text);

  doc.text(text, (PAGE_WIDTH - width) / 2, y);
};

export default async function generateAdvanceReceiptPdf({
  formData,
  employee,
  submitResponse,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  //----------------------------------------------------
  // Dynamic Values
  //----------------------------------------------------

  //----------------------------------------------------
// Dynamic Values
//----------------------------------------------------

const iqacNumber = submitResponse?.iqacNumber || "";

const selectDate =
  formData?.selectDate ||
  formData?.eventDays?.[0]?.date ||
  formData?.date ||
  null;

const requisitionDate = formatDate(selectDate);

const clearBeforeDate = add15Days(selectDate);

const employeeName =
  employee?.name ||
  employee?.employeeName ||
  formData?.employeeName ||
  "";

const empId =
  employee?.empId ||
  employee?.employeeId ||
  "";

const designation = employee?.designation || "";

const department = employee?.department || "";

const advanceAmountRaw =
  formData?.advanceAmount ||
  formData?.cards?.[0]?.advanceAmount ||
  formData?.purposeOfAdvance ||
  "";

const advanceAmount = formatAmount(
  Number(advanceAmountRaw || 0)
);

const purpose =
  formData?.advancePurpose ||
  formData?.purposeOfAdvance ||
  formData?.cards?.[0]?.advancePurpose ||
  "";

  //----------------------------------------------------
  // Page Border
  //----------------------------------------------------

  doc.setLineWidth(0.5);

  doc.rect(5, 5, 200, 287);

  //----------------------------------------------------
  // Header
  //----------------------------------------------------

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("IQAC", 92, 18);

  drawLine(doc, 5, 40, 205, 40);

  //----------------------------------------------------
  // Title
  //----------------------------------------------------

  doc.setFont("times", "bold");
  doc.setFontSize(15);

  drawCenteredText(doc, "Request for Advance / Travel Advance", 50, 15, "bold");

  //----------------------------------------------------
  // IQAC Number (Top Right)
  //----------------------------------------------------

  doc.setFont("times", "bold");
  doc.setFontSize(10);

  doc.text(iqacNumber, 160, 49);

  //----------------------------------------------------
  // Requisition Date
  //----------------------------------------------------

  doc.setFontSize(11);

  doc.text("Requisition Date :", 10, 67);

  drawLine(doc, 48, 68, 83, 68);

  doc.setFont("times", "normal");
  doc.text(requisitionDate, 50, 66.5);

  //----------------------------------------------------
  // Name
  //----------------------------------------------------

  doc.setFont("times", "bold");

  doc.text("Name :", 10, 83);

  drawLine(doc, 23, 84, 80, 84);

  doc.setFont("times", "normal");

  doc.text(employeeName, 24, 82.5);

  //----------------------------------------------------
  // Employee ID
  //----------------------------------------------------

  doc.setFont("times", "bold");

  doc.text("Emp ID :", 116, 83);

  drawLine(doc, 132, 84, 182, 84);

  doc.setFont("times", "normal");

  doc.text(empId, 133, 82.5);

  //----------------------------------------------------
  // Designation
  //----------------------------------------------------

  doc.setFont("times", "bold");

  doc.text("Designation :", 10, 99);

  drawLine(doc, 33, 100, 80, 100);

  doc.setFont("times", "normal");

  doc.text(designation, 34, 98.5);

  //----------------------------------------------------
  // Department
  //----------------------------------------------------

  doc.setFont("times", "bold");

  doc.text("Department :", 116, 99);

  drawLine(doc, 137, 100, 182, 100);

  doc.setFont("times", "normal");
  doc.setFontSize(10)

  doc.text(department, 138, 98.5);

  //----------------------------------------------------
  // Amount
  //----------------------------------------------------

  doc.setFont("times", "bold");

  doc.text(
    "I required a Cash / In Bank / Travel Advance / Online Payment of Rs.",
    10,
    115,
  );

  drawLine(doc, 132, 116, 202, 116);

  doc.setFont("times", "normal");

doc.setFont("times", "normal");
doc.setFontSize(11);

doc.text(String(advanceAmount), 134, 114.5);

  //----------------------------------------------------
  // Purpose
  //----------------------------------------------------

  doc.setFont("times", "bold");

  doc.text("Purpose of Advance :", 10, 131);

  drawLine(doc, 48, 132, 202, 132);

  doc.setFont("times", "normal");

 doc.setFont("times", "normal");
doc.setFontSize(11);

doc.text(String(purpose), 49, 130.5);

  //----------------------------------------------------
  // Remaining code in Part 2
  //----------------------------------------------------
  //----------------------------------------------------
  // Purpose - Second Line
  //----------------------------------------------------

  drawLine(doc, 10, 145, 202, 145);

  const purposeLine2 = purpose.substring(100, 220);

  doc.text(purposeLine2, 11, 143.5);

  //----------------------------------------------------
  // Clear Advance
  //----------------------------------------------------

  doc.setFont("times", "bold");
  doc.setFontSize(11);

  doc.text("I will Clear the Advance within", 10, 162);

  drawLine(doc, 63, 163, 88, 163);

  doc.setFont("times", "normal");
  doc.text("15", 74, 161.5);

  doc.setFont("times", "bold");
  doc.text("Days", 90, 162);

  doc.text("Or On or before", 104, 162);

  drawLine(doc,132,163,168,163);

  doc.setFont("times", "normal");
  doc.text(clearBeforeDate, 130, 161.5);

  //----------------------------------------------------
  // Bottom IQAC Number
  //----------------------------------------------------

  doc.setFont("times", "bold");
  doc.setFontSize(12);

  doc.text("IQAC Number", 160, 172);

  doc.rect(150,176,42,15);

  doc.setFont("times", "bold");
  doc.setFontSize(11);

  doc.text(iqacNumber, 153, 187);

  //----------------------------------------------------
  // Signature Space
  //----------------------------------------------------

  const signatureTop = 118;
  const labelY = 272;

  //----------------------------------------------------
  // Faculty Signature
  //----------------------------------------------------

//   drawLine(doc, 8, signatureTop, 40, signatureTop);

  doc.setFont("times", "bold");
  doc.setFontSize(8);

  doc.text("Signature of Faculty", 9, labelY);

  doc.text("Member", 17, labelY + 8);

  //----------------------------------------------------
  // HOD Signature
  //----------------------------------------------------

//   drawLine(doc, 48, signatureTop, 80, signatureTop);

  doc.text("Recommended", 51, labelY);

  doc.text("by Dean / HOD /", 46, labelY + 8);

  doc.text("Section Head", 51, labelY + 16);

  //----------------------------------------------------
  // Lead IQAC
  //----------------------------------------------------

//   drawLine(doc, 88, signatureTop, 120, signatureTop);

  doc.text("Clearance", 94, labelY);

  doc.text("from Lead IQAC", 89, labelY + 8);

  //----------------------------------------------------
  // Principal
  //----------------------------------------------------

//   drawLine(doc, 128, signatureTop, 160, signatureTop);

  doc.text("Approved by", 131, labelY);

  doc.text("Principal", 137, labelY + 8);

  //----------------------------------------------------
  // IQAC Office
  //----------------------------------------------------

//   drawLine(doc, 168, signatureTop, 198, signatureTop);

  doc.text("Alloted by IQAC Office", 156, labelY);

  doc.text("after", 178, labelY + 8);

  doc.text("Principal's Approval", 161, labelY + 16);

  //----------------------------------------------------
  // Save PDF
  //----------------------------------------------------

  doc.save(`Advance_Receipt_${iqacNumber || "Receipt"}.pdf`);
}