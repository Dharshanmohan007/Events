import dayjs from "dayjs";
import logoSrc from "../assets/logo.png.jpeg";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date) => (date ? dayjs(date).format("DD.MM.YYYY") : "");

const add15Days = (date, days = 15) =>
  date ? dayjs(date).add(days, "day").format("DD.MM.YYYY") : "";

const formatAmount = (amount) =>
  amount ? Number(amount).toLocaleString("en-IN") : "";

// ── Convert the imported logo to a base64 data-URL so the new tab can render
//    it without needing access to the bundler's asset pipeline.
const toBase64 = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(src); // fallback to original URL
    img.src = src;
  });

// ── Build the full HTML string that replicates the design ────────────────────

function buildReceiptHTML(logoDataUrl, data) {
  console.log("Generating receipt HTML with data:", data);
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Advance Receipt – ${iqacNumber || "Receipt"}</title>
  <style>
    /* ── Reset & Base ───────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4 portrait;
      margin: 0;
    }

    body {
      font-family: "Times New Roman", Times, serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      padding: 0;
      margin: 0;
    }

    .page {
      width: 210mm;
      height: 297mm;
      background: #fff;
      padding: 0;
      position: relative;
    }

    /* ── Each receipt half ──────────────────────────────────── */
    .receipt-half {
      width: 100%;
      height: 148.5mm;
      padding: 8mm 12mm 6mm;
      position: relative;
    }

    /* ── Receipt box ────────────────────────────────────────── */
    .receipt-box {
      border: 1.5px solid #000;
      height: 100%;
      position: relative;
    }

    /* ── Header with logo ───────────────────────────────────── */
    .header {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 8px 10px 6px;
    }

    .header img {
      height: 50px;
      object-fit: contain;
    }

    /* ── Title row ──────────────────────────────────────────── */
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 14px 8px;
    }

    .title-row .title {
      font-size: 13pt;
      font-weight: bold;
      flex: 1;
      text-align: center;
    }

    .title-row .iqac-ref {
      font-size: 9pt;
      font-weight: bold;
      white-space: nowrap;
    }

    /* ── Field rows ─────────────────────────────────────────── */
    .fields {
      padding: 0 14px 10px;
      padding-bottom: 10px;
    }

    .field-row {
      display: flex;
      align-items: baseline;
      margin-bottom: 6px;
      gap: 0;
      padding-bottom:10px;
    }

    .field-group {
      display: flex;
      align-items: baseline;
      flex: 1;
    }

    .field-label {
      font-weight: bold;
      font-size: 10pt;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .field-line {
      flex: 1;
      border-bottom: 1px solid #000;
      min-width: 40px;
      margin-left: 4px;
      font-size: 10pt;
      font-weight: normal;
      padding-bottom: 1px;
      line-height: 1.4;
    }

    .field-line .value {
      display: inline-block;
      padding-left: 4px;
    }

    /* ── Purpose rows ───────────────────────────────────────── */
    .purpose-row {
      display: flex;
      align-items: baseline;
      margin-bottom: 0;
    }

    .purpose-line-2 {
      border-bottom: 1px solid #000;
      margin: 0 0 6px;
      min-height: 18px;
      font-size: 10pt;
      padding-left: 4px;
      line-height: 1.4;
    }

    /* ── Clearance row ──────────────────────────────────────── */
    .clearance-row {
      display: flex;
      align-items: baseline;
      padding: 8px 14px 2px;
      gap: 0;
      flex-wrap: nowrap;
    }

    .clearance-row .field-label {
      font-size: 10pt;
    }

    .clearance-row .days-line {
      border-bottom: 1px solid #000;
      width: 50px;
      text-align: center;
      font-size: 10pt;
      font-weight: normal;
      margin: 0 4px;
    }

    .clearance-row .date-line {
      border-bottom: 1px solid #000;
      flex: 1;
      font-size: 10pt;
      font-weight: normal;
      margin-left: 4px;
      padding-left: 4px;
    }

    /* ── IQAC Number box ────────────────────────────────────── */
    .iqac-box-section {
      display: flex;
      justify-content: flex-end;
      padding: 6px 14px 4px;
      margin-bottom: 0;
    }

    .iqac-box-wrapper {
      text-align: center;
    }

    .iqac-box-label {
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 3px;
    }

    .iqac-box {
      border: 1.5px solid #000;
      padding: 6px 12px;
      font-size: 10pt;
      min-width: 140px;
      text-align: center;
    }

    /* ── Signature row ──────────────────────────────────────── */
    .signature-row {
      display: flex;
      justify-content: space-between;
      padding: 30px 8px 10px; /* extra padding above text for signing space */
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .sig-block {
      text-align: center;
      font-size: 7.5pt;
      font-weight: bold;
      line-height: 1.5;
      flex: 1;
    }

    /* ── Print styles ───────────────────────────────────────── */
    @media print {
      body {
        background: #fff;
        padding: 0;
        margin: 0;
      }

      .page {
        width: 210mm;
        height: 297mm;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- ═══ TOP HALF — filled receipt ═══ -->
    <div class="receipt-half">
      <div class="receipt-box">

        <!-- Header -->
        <div class="header">
          <img src="${logoDataUrl}" alt="Sri Eshwar College of Engineering" />
        </div>

        <!-- Title -->
        <div class="title-row">
          <span class="title">Request for  Advance / Travel Advance</span>
          <span class="iqac-ref">${iqacNumber || ""}</span>
        </div>

        <!-- Fields -->
        <div class="fields">

          <!-- Requisition Date -->
          <div class="field-row">
            <div class="field-group" style="flex: 0.55;">
              <span class="field-label">Requisition Date :</span>
              <div class="field-line"><span class="value">${requisitionDate || ""}</span></div>
            </div>
          </div>

          <!-- Name / Emp ID -->
          <div class="field-row">
            <div class="field-group" style="flex: 0.55;">
              <span class="field-label">Name :</span>
              <div class="field-line"><span class="value">${employeeName || ""}</span></div>
            </div>
            <div class="field-group" style="flex: 0.45;">
              <span class="field-label">Emp ID :</span>
              <div class="field-line"><span class="value">${empId || ""}</span></div>
            </div>
          </div>

          <!-- Designation / Department -->
          <div class="field-row">
            <div class="field-group" style="flex: 0.55;">
              <span class="field-label">Designation :</span>
              <div class="field-line"><span class="value">${designation || ""}</span></div>
            </div>
            <div class="field-group" style="flex: 0.45;">
              <span class="field-label">Department :</span>
              <div class="field-line"><span class="value">${department || ""}</span></div>
            </div>
          </div>

          <!-- Amount -->
          <div class="field-row">
            <div class="field-group">
              <span class="field-label">I required a Cash / In Bank / Travel Advance / Online Payment of Rs.</span>
              <div class="field-line"><span class="value">${advanceAmount || ""}</span></div>
            </div>
          </div>

          <!-- Purpose of Advance (line 1) -->
          <div class="purpose-row field-row">
            <div class="field-group">
              <span class="field-label">Purpose of Advance :</span>
              <div class="field-line"><span class="value">${purpose || ""}</span></div>
            </div>
          </div>

          <!-- Purpose of Advance (line 2) -->
          <div class="purpose-line-2"></div>

        </div>

        <!-- Clearance row -->
        <div class="clearance-row">
          <span class="field-label">I will Clear the Advance within</span>
          <div class="days-line">${clearanceDays ?? 15}</div>
          <span class="field-label">Days</span>
          <span class="field-label" style="margin-left: 12px;">Or On or before</span>
          <div class="date-line">${clearBeforeDate || ""}</div>
        </div>

        <!-- IQAC Number box -->
        <div class="iqac-box-section">
          <div class="iqac-box-wrapper">
            <div class="iqac-box-label">IQAC  Number</div>
            <div class="iqac-box">${iqacNumber || ""}</div>
          </div>
        </div>

        <!-- Signature row (pinned to bottom of bordered box) -->
        <div class="signature-row">
          <div class="sig-block">
            Signature of Faculty<br/>Member
          </div>
          <div class="sig-block">
            Recommended<br/>by Dean / HOD /<br/>Section Head
          </div>
          <div class="sig-block">
            Clearance<br/>from Lead IQAC
          </div>
          <div class="sig-block">
            Approved by<br/>Principal
          </div>
          <div class="sig-block">
            Alloted by IQAC Office<br/>after<br/>Principal's Approval
          </div>
        </div>

      </div>
    </div>

    <!-- ═══ BOTTOM HALF — blank ═══ -->
    <div class="receipt-half"></div>

  </div>
</body>
</html>`;
}

// ── Main export ──────────────────────────────────────────────────────────────

export default async function ReportPdf({
  formData,
  employee,
  submitResponse,
}) {
  const requisitionDateValue =
    formData?.requisitionDate ||
    formData?.selectDate ||
    formData?.date ||
    formData?.eventDays?.[0]?.date ||
    formData?.event?.eventDays?.[0]?.date ||
    formData?.event?.date ||
    "";

  // Normalize IQAC number: prefer explicit `iqacNumber`, accept `IQAC-...` if present,
  // but do NOT display raw server `requestNo` values like "MEDIA/..." as the IQAC.
  const rawIqac = submitResponse?.iqacNumber || submitResponse?.requestNo || "";
  let normalizedIqac = "";
  if (rawIqac) {
    if (/^IQAC-/i.test(rawIqac)) {
      normalizedIqac = rawIqac;
    } else {
      const found = String(rawIqac).match(/IQAC-[A-Za-z0-9_-]+/i);
      if (found) normalizedIqac = found[0];
    }
  }
  if (!normalizedIqac) normalizedIqac = `IQAC-${Date.now()}`;

  const data = {
    iqacNumber: normalizedIqac,
    requisitionDate: formatDate(requisitionDateValue),
    employeeName:
      employee?.name ||
      employee?.employeeName ||
      submitResponse?.employeeName ||
      submitResponse?.name ||
      formData?.employeeName ||
      "",
    empId:
      employee?.empId ||
      employee?.employeeId ||
      submitResponse?.empId ||
      submitResponse?.employeeId ||
      formData?.empId ||
      "",
    designation:
      employee?.designation || submitResponse?.designation || formData?.designation || "",
    department: employee?.department || submitResponse?.department || formData?.department || "",
    advanceAmount: formatAmount(formData?.advanceAmount),
    purpose: formData?.purposeOfAdvance || formData?.advancePurpose || "",
    clearBeforeDate: add15Days(requisitionDateValue, formData?.clearanceDays || 15),
    clearanceDays: formData?.clearanceDays || 15,
  };

  // Convert the bundled logo to a base64 data-URL so the new tab can display it
  const logoDataUrl = await toBase64(logoSrc);

  // Build the full HTML document
  const html = buildReceiptHTML(logoDataUrl, data);

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `Advance_Receipt_${data.iqacNumber || "Receipt"}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}