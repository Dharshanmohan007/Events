// ── Settlement PDF Generator ────────────────────────────────────────────────
// Populates the Settlement Form.html with live data and exports
// it as a downloadable PDF using html2canvas + jsPDF.

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { API_BASE } from "./apiConfig.js";
import settlementTemplateRaw from "../templates/Settlement Form.html?raw";
import logoSvgRaw from "../assets/logo-black.svg?raw";

/**
 * Fetch both settlement endpoints in parallel.
 *
 * @param {string} eventId
 * @param {string} token  – Bearer token from localStorage
 * @returns {[Object, Object]} [expenditureRes, closingDocRes]
 */
export async function fetchSettlementData(eventId, token) {
  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const [expenditureRes, closingDocRes] = await Promise.all([
    fetch(`${API_BASE}/api/event-expenditures/event/${eventId}`, { headers }).then((r) => {
      if (!r.ok) throw new Error(`Expenditure fetch failed: ${r.status}`);
      return r.json();
    }),
    fetch(`${API_BASE}/api/event-closing-documents/event/${eventId}`, { headers }).then((r) => {
      if (!r.ok) throw new Error(`Closing document fetch failed: ${r.status}`);
      return r.json();
    }),
  ]);

  return [expenditureRes, closingDocRes];
}

/**
 * Read the settlement form HTML template as raw text.
 * Returns the full HTML string of src/templates/Settlement Form.html.
 */
async function fetchTemplateHtml() {
  // Use Vite's ?raw import to bundle the template directly into the JS.
  // This prevents 404 errors and proxy fallbacks in the production build.
  return settlementTemplateRaw;
}

/**
 * Sanitize a string for use as a PDF filename.
 * Keeps alphanumeric, spaces, hyphens, and underscores only.
 */
function sanitizeFilename(name) {
  return String(name)
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60)
    .trim();
}

/**
 * Inject mapped data into the template HTML by replacing the data objects
 * and adding a DOMContentLoaded listener to populate dynamic text elements.
 *
 * The template's own render functions (renderIncome, renderExpenditure, etc.)
 * are still invoked — we replace their backing data objects.
 *
 * @param {string} templateHtml  Raw HTML of the template
 * @param {Object} data          Output of mapSettlementData()
 * @returns {string} Modified full HTML document
 */
function injectDataIntoTemplate(templateHtml, data) {
  // ── Build expenditure category data ────────────────────────────────────
  const expCatEntries = [
    { key: "food", label: "Food" },
    { key: "transport", label: "Transport" },
    { key: "accommodation", label: "Accommodation" },
    { key: "remuneration", label: "Remuneration" },
    { key: "gifts", label: "Gifts" },
    { key: "kits", label: "Kits" },
    { key: "miscellaneous", label: "Miscellaneous (Others)" },
  ];

  const expenditureDataStr = JSON.stringify(
    expCatEntries.map(({ key, label }) => ({
      category: label,
      items: (data.expenditure[key] || []).map((item) => ({
        expense: item.expense,
        billNo: item.billNo,
        billDate: item.billDate,
        guest: item.guest,
        amount: item.amount,
      })),
    }))
  );

  // ── Build income rows data ─────────────────────────────────────────────
  const incomeDataStr = JSON.stringify(data.incomeRows);

  // ── Build gender data ──────────────────────────────────────────────────
  const genderDataStr = JSON.stringify(data.gender);

  // ── Build SDG data ─────────────────────────────────────────────────────
  const sdgPrimary =
    data.sdgGoals.find((g) => g.goal === "Primary SDG Goal")?.details || "";
  const sdgSecondary =
    data.sdgGoals.find((g) => g.goal === "Secondary SDG Goal")?.details || "";
  const sdgDataStr = JSON.stringify({ primary: sdgPrimary, secondary: sdgSecondary });

  // ── Replace the demo data objects with actual mapped data ───────────────
  let modified = templateHtml;

  // Inject crisp vector logo into header
  const styledLogoSvg = logoSvgRaw.replace(
    /<svg\b/,
    '<svg class="brand-logo" style="height: 34px; width: auto;"'
  );
  modified = modified.replace(
    /<div class="logo"[^>]*>[\s\S]*?<\/div>/,
    `<div class="logo" id="headerLogo">${styledLogoSvg}</div>`
  );

  // Replace EXPENDITURE_CATEGORIES
  modified = modified.replace(
    /const EXPENDITURE_CATEGORIES = \[[\s\S]*?\];/,
    `const EXPENDITURE_CATEGORIES = ${expenditureDataStr};`
  );

  // Replace INCOME_ROWS
  modified = modified.replace(
    /const INCOME_ROWS = \[[\s\S]*?\];/,
    `const INCOME_ROWS = ${incomeDataStr};`
  );

  // Replace GENDER_DATA
  modified = modified.replace(
    /const GENDER_DATA = \{[\s\S]*?\};/,
    `const GENDER_DATA = ${genderDataStr};`
  );

  // Replace SDG_DATA
  modified = modified.replace(
    /const SDG_DATA = \{[\s\S]*?\};/,
    `const SDG_DATA = ${sdgDataStr};`
  );

  // ── Add a DOMContentLoaded listener to populate dynamic fields ───
  const injectionScript = `
<script>
document.addEventListener("DOMContentLoaded", function() {
  // ── Populate top info section ────────────────────────────────────────
  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val || "\\u00A0";
  }
  setText("eventName", ${JSON.stringify(data.eventName)});
  setText("submissionDate", ${JSON.stringify(data.submissionDate)});
  setText("eventDate", ${JSON.stringify(data.eventDate)});
  setText("guestNames", ${JSON.stringify(data.guestNames)});
  setText("iqacNumber", ${JSON.stringify(data.iqacNumber)});
  setText("facultyName", ${JSON.stringify(data.facultyName)});
  setText("empId", ${JSON.stringify(data.empId)});
  setText("designation", ${JSON.stringify(data.designation)});
  setText("department", ${JSON.stringify(data.department)});
  setText("advanceAmount", ${JSON.stringify(data.advanceAmount)});
  setText("dateOfAdvance", ${JSON.stringify(data.dateOfAdvance)});
  setText("purposeOfAdvance", ${JSON.stringify(data.purposeOfAdvance)});
  setText("cornerCode", ${JSON.stringify(data.cornerCode || data.iqacNumber)});

  // ── Populate totals ──────────────────────────────────────────────────
  var totalAmtNum = ${JSON.stringify(Number(data.totalAmount) || 0)};
  var advanceTkNum = ${JSON.stringify(Number(data.advanceTaken) || 0)};
  var totalAmt = totalAmtNum ? totalAmtNum.toLocaleString("en-IN") : "0";
  var advanceTk = advanceTkNum ? advanceTkNum.toLocaleString("en-IN") : "0";

  // Total Fund (A) = Advance Amount + Registration Fees + Sponsorship + Department Fund + Other Sources if Any (Institutional Amount excluded)
  var incomeRowsSum = ${JSON.stringify(
    data.incomeRows.reduce((sum, r) => {
      const v = parseFloat(String(r.amount).replace(/,/g, ""));
      return sum + (isNaN(v) ? 0 : v);
    }, 0)
  )};
  var totFundNum = advanceTkNum + incomeRowsSum;
  var totFund = totFundNum.toLocaleString("en-IN");

  // Net Claim (B - A) = Total Amount (B) - Total Fund (A)
  var netClNum = totalAmtNum - totFundNum;
  var netCl = netClNum.toLocaleString("en-IN");

  setText("totalAmount", totalAmt);
  setText("advanceTaken", advanceTk);
  setText("netClaim", netCl);
  setText("totalFund", totFund);

  // ── Populate Refunded / To be Received ──────────────────────────────
  var refundedStatusEl = document.getElementById("refundedStatus");
  var refundedLabelEl = document.getElementById("refundedLabel");
  if (refundedStatusEl) {
    if (netClNum < 0) {
      if (refundedLabelEl) refundedLabelEl.textContent = "Repay (To Institute) :";
      refundedStatusEl.textContent = Math.abs(netClNum).toLocaleString("en-IN");
    } else if (netClNum > 0) {
      if (refundedLabelEl) refundedLabelEl.textContent = "To be Received :";
      refundedStatusEl.textContent = netClNum.toLocaleString("en-IN");
    } else {
      if (refundedLabelEl) refundedLabelEl.textContent = "Refunded / To be Received :";
      refundedStatusEl.textContent = "0";
    }
  }

  // If advance amount row exists in income table:
  var advEl = document.getElementById("incomeAdvAmount");
  if (advEl && (!advEl.textContent || advEl.textContent.trim() === "" || advEl.textContent.trim() === "-") && advanceTk) {
    advEl.textContent = advanceTk;
  }

  // ── Populate remarks row ─────────────────────────────────────────────
  var remarksText = document.getElementById("remarksText");
  var remarksData = ${JSON.stringify(data.remarks || "")};
  if (remarksText) {
    remarksText.textContent = (remarksData && remarksData.toUpperCase() !== "NA") ? ": " + remarksData : "";
  }
  var remarksCell = document.getElementById("remarksCell");
  if (remarksCell && !remarksText) {
    var remarksHtml = (remarksData && remarksData.toUpperCase() !== "NA") ? '<div style="font-size:10px; margin-top:4px;">' + remarksData + '</div>' : '';
    remarksCell.innerHTML = '<div style="font-weight:bold; font-size:11px;">Remarks</div>' + remarksHtml;
  }

  // ── Populate closed against advance ──────────────────────────────────
  var advanceTakenNum = ${JSON.stringify(Number(data.advanceTaken) || 0)};
  var closedAdvanceStatus = document.getElementById("closedAdvanceStatus");
  if (closedAdvanceStatus) {
    closedAdvanceStatus.innerHTML = advanceTakenNum > 0 ? "<b>Yes</b>" : "No";
  }

  // ── Populate outcomes cell (if present) ──────────────────────────────
  var outcomesCell = document.getElementById("outcomesCell");
  var aboutProgram = ${JSON.stringify(data.aboutProgram || "")};
  if (outcomesCell) {
    var outcomesHtml = (aboutProgram && aboutProgram.toUpperCase() !== "NA") ? '<div style="font-size:14px; margin-top:4px;">' + aboutProgram + '</div>' : '';
    outcomesCell.innerHTML = '<div style="font-weight:bold; font-size:15px;">Outcomes</div>' + outcomesHtml;
  }
});
</script>`;

  // Insert the script just before the closing </body> tag
  modified = modified.replace("</body>", injectionScript + "\n</body>");

  return modified;
}

/***
 * Fetch data, map it, and return the fully populated HTML document string
 * along with the mapped data object for live preview.
 *
 * @param {string} eventId
 * @param {string} token
 * @param {Function} mapper
 * @returns {Promise<{ populatedHtml: string, data: Object }>}
 */
export async function getSettlementFormPreviewHtml(eventId, token, mapper) {
  // Step 1: Fetch both endpoints in parallel
  const [expenditureRes, closingDocRes] = await fetchSettlementData(eventId, token);

  // Step 2: Map API data to template format
  const data = mapper(expenditureRes, closingDocRes);

  // Step 3: Read the HTML template
  const templateHtml = await fetchTemplateHtml();

  // Step 4: Inject data into the template
  const populatedHtml = injectDataIntoTemplate(templateHtml, data);

  return { populatedHtml, data };
}

/**
 * Open the populated Settlement Form in a new browser tab for preview/printing.
 *
 * @param {string} eventId
 * @param {string} token
 * @param {Function} mapper
 * @returns {Promise<void>}
 */
export async function openSettlementFormInNewTab(eventId, token, mapper) {
  // Synchronously open a new tab immediately on user click to prevent popup blockers
  const newTab = window.open("about:blank", "_blank");
  if (newTab) {
    newTab.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loading Settlement Form...</title>
          <style>
            body {
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background: #f8fafc;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #334155;
            }
            .loader {
              border: 3px solid #e2e8f0;
              border-top: 3px solid #8B3DFF;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 16px;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <div class="loader"></div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">Opening Settlement Form</div>
            <div style="font-size: 13px; color: #64748b;">Fetching details and preparing document...</div>
          </div>
        </body>
      </html>
    `);
  }

  try {
    const { populatedHtml } = await getSettlementFormPreviewHtml(eventId, token, mapper);

    const blob = new Blob([populatedHtml], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);

    if (newTab && !newTab.closed) {
      newTab.location.href = blobUrl;
    } else {
      window.open(blobUrl, "_blank");
    }
  } catch (err) {
    console.error("Failed to open settlement preview in new tab:", err);
    if (newTab && !newTab.closed) {
      newTab.document.open();
      newTab.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Error</title></head>
          <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#f8fafc;font-family:sans-serif;color:#ef4444;">
            <div style="text-align:center;">
              <div style="font-size:18px;font-weight:600;margin-bottom:8px;">Failed to load settlement form</div>
              <div style="font-size:13px;color:#64748b;">${err.message || "An unexpected error occurred."}</div>
            </div>
          </body>
        </html>
      `);
      newTab.document.close();
    }
    throw err;
  }
}

/**
 * Render populated HTML into a hidden iframe, capture with html2canvas,
 * build an A4 jsPDF document, and trigger download.
 *
 * @param {string} populatedHtml
 * @param {Object} data
 * @returns {Promise<void>}
 */
export async function exportPopulatedHtmlToPdf(populatedHtml, data) {
  // ── Render in a hidden iframe ──────────────────────────────────────────
  // Match iframe width to the PDF usable width so html2canvas captures
  // at the exact pixel density the PDF will use, avoiding vertical scaling.
  const PDF_USABLE_WIDTH_PX = 756; // 200mm at 96dpi
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    `position:fixed;left:-9999px;top:-9999px;width:${PDF_USABLE_WIDTH_PX}px;border:none;visibility:hidden;`;

  // Use a Blob URL instead of iframe.srcdoc.
  // srcdoc has a browser-enforced size limit (~2-4 KB on some hosts) that
  // silently truncates the template in production, making .page-wrap
  // disappear. Blob URLs have no size limit.
  const blob = new Blob([populatedHtml], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);

  const iframeLoaded = new Promise((resolve, reject) => {
    iframe.onload = resolve;
    iframe.onerror = reject;
  });

  iframe.src = blobUrl;
  document.body.appendChild(iframe);

  try {
    await iframeLoaded;

    // Allow a small extra delay for CSS/fonts to settle
    await new Promise((r) => setTimeout(r, 500));

    // ── Capture with html2canvas ─────────────────────────────────────────
    const sourceEl =
      iframe.contentDocument.querySelector(".page-wrap") ||
      iframe.contentDocument.querySelector(".page");
    if (!sourceEl) {
      throw new Error(
        `Could not find .page-wrap or .page element in rendered template. Diagnostics: HTML string length ${populatedHtml.length}, iframe body length ${iframe.contentDocument?.body?.innerHTML?.length || 0}`
      );
    }

    const canvas = await html2canvas(sourceEl, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      // Ensure the full content is captured (not just the viewport)
      width: sourceEl.scrollWidth,
      windowWidth: sourceEl.scrollWidth,
      windowHeight: sourceEl.scrollHeight,
    });

    // ── Convert canvas to multi-page PDF ─────────────────────────────────
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    // A4 dimensions in mm
    const pdfWidthMm = 210;
    const pdfMarginMm = 5;
    const usableWidthMm = pdfWidthMm - 2 * pdfMarginMm;

    // Calculate the rendered height in mm (maintain aspect ratio)
    const imgRatio = imgHeightPx / imgWidthPx;
    const imgHeightMm = usableWidthMm * imgRatio;

    // Page height available for content
    const pdfPageHeightMm = 297;
    const usablePageHeightMm = pdfPageHeightMm - 2 * pdfMarginMm;

    // Create the PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    if (imgHeightMm <= usablePageHeightMm) {
      // ── Single page ────────────────────────────────────────────────────
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        pdfMarginMm,
        pdfMarginMm,
        usableWidthMm,
        imgHeightMm
      );
    } else {
      // ── Multi-page: slice the canvas into page-sized chunks ─────────────
      const totalPages = Math.ceil(imgHeightMm / usablePageHeightMm);
      const sliceHeightPx = Math.floor(
        (usablePageHeightMm / imgHeightMm) * imgHeightPx
      );

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        const yOffsetPx = page * sliceHeightPx;
        const sliceHeight = Math.min(sliceHeightPx, imgHeightPx - yOffsetPx);
        const sliceHeightMm =
          (sliceHeight / imgHeightPx) * imgHeightMm;

        // Create a temporary canvas for this page slice
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = imgWidthPx;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          yOffsetPx,
          imgWidthPx,
          sliceHeight,
          0,
          0,
          imgWidthPx,
          sliceHeight
        );

        pdf.addImage(
          sliceCanvas.toDataURL("image/png"),
          "PNG",
          pdfMarginMm,
          pdfMarginMm,
          usableWidthMm,
          sliceHeightMm
        );
      }
    }

    // ── Download the PDF ─────────────────────────────────────────────────
    const filename = `Event-Settlement-${sanitizeFilename(data.eventNameRaw || data.eventName || "Form")}.pdf`;
    pdf.save(filename);
  } finally {
    // ── Cleanup ──────────────────────────────────────────────────────────
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
    // Release the Blob URL to free memory
    URL.revokeObjectURL(blobUrl);
  }
}

/**
 * Main entry point: fetch data, map it, generate and download the PDF.
 *
 * @param {string} eventId       – MongoDB ObjectId of the event
 * @param {string} token         – Bearer auth token
 * @param {Function} mapper     – mapSettlementData function (imported separately)
 * @returns {Promise<void>}
 */
export async function generateSettlementPdf(eventId, token, mapper) {
  const { populatedHtml, data } = await getSettlementFormPreviewHtml(eventId, token, mapper);
  await exportPopulatedHtmlToPdf(populatedHtml, data);
}
