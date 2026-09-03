// ── Settlement PDF Generator ────────────────────────────────────────────────
// Populates the settlement_form_template.html with live data and exports
// it as a downloadable PDF using html2canvas + jsPDF.

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { API_BASE } from "./apiConfig.js";

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
 * Returns the full HTML string of src/templates/settlement_form_template.html.
 */
async function fetchTemplateHtml() {
  // Vite serves files under /src when using ?raw or via the dev server.
  // During build, the file is available at its source path relative to the project root.
  // We use a relative URL that works in both dev and production builds.
  const templateUrl = new URL(
    "../templates/settlement_form_template.html",
    import.meta.url
  ).href;

  const res = await fetch(templateUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch settlement template: ${res.status}`);
  }
  return res.text();
}


console.log("")
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

  // ── Add a DOMContentLoaded listener to populate the info-table spans ───
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
  setText("guestNames", ${JSON.stringify(data.guestNames)});
  setText("iqacNumber", ${JSON.stringify(data.iqacNumber)});
  setText("facultyName", ${JSON.stringify(data.facultyName)});
  setText("empId", ${JSON.stringify(data.empId)});
  setText("designation", ${JSON.stringify(data.designation)});
  setText("department", ${JSON.stringify(data.department)});
  setText("advanceAmount", ${JSON.stringify(data.advanceAmount)});
  setText("dateOfAdvance", ${JSON.stringify(data.dateOfAdvance)});
  setText("purposeOfAdvance", ${JSON.stringify(data.purposeOfAdvance)});
  setText("cornerCode", ${JSON.stringify(data.cornerCode)});

  // ── Populate totals ──────────────────────────────────────────────────
  setText("totalAmount", ${JSON.stringify(String(data.totalAmount))});
  setText("advanceTaken", ${JSON.stringify(String(data.advanceTaken))});
  setText("netClaim", ${JSON.stringify(String(data.netClaim))});
  setText("totalFund", ${JSON.stringify(
    String(data.incomeRows.reduce((sum, r) => {
      const v = parseFloat(String(r.amount).replace(/,/g, ""));
      return sum + (isNaN(v) ? 0 : v);
    }, 0))
  )});

  // ── Populate remarks cell ────────────────────────────────────────────
  var remarksCell = document.querySelector(".remarks-cell");
  if (remarksCell && ${JSON.stringify(data.remarks)}) {
    remarksCell.innerHTML = '<div style="font-weight:bold; font-size:11px;">Remarks If Any</div><div style="font-size:10px; margin-top:4px;">${data.remarks.replace(/'/g, "\\'")}</div>';
  }
});
</script>`;

  // Insert the script just before the closing </body> tag
  modified = modified.replace("</body>", injectionScript + "\n</body>");

  return modified;
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
  // ── Step 1: Fetch both endpoints in parallel ───────────────────────────
  const [expenditureRes, closingDocRes] = await fetchSettlementData(eventId, token);

  // ── Step 2: Map API data to template format ────────────────────────────
  const data = mapper(expenditureRes, closingDocRes);

  // ── Step 3: Read the HTML template ─────────────────────────────────────
  const templateHtml = await fetchTemplateHtml();

  // ── Step 4: Inject data into the template ──────────────────────────────
  const populatedHtml = injectDataIntoTemplate(templateHtml, data);

  // ── Step 5: Render in a hidden iframe ──────────────────────────────────
  // Match iframe width to the PDF usable width so html2canvas captures
  // at the exact pixel density the PDF will use, avoiding vertical scaling.
  const PDF_USABLE_WIDTH_PX = 756; // 200mm at 96dpi
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    `position:fixed;left:-9999px;top:-9999px;width:${PDF_USABLE_WIDTH_PX}px;border:none;visibility:hidden;`;
  document.body.appendChild(iframe);

  // Write the full HTML document into the iframe
  iframe.contentDocument.open();
  iframe.contentDocument.write(populatedHtml);
  iframe.contentDocument.close();

  // Wait for the iframe's inline scripts to execute (DOM rendering)
  await new Promise((resolve) => {
    if (iframe.contentDocument.readyState === "complete") {
      resolve();
    } else {
      iframe.contentWindow.addEventListener("load", resolve);
    }
  });

  // Allow a small extra delay for CSS/fonts to settle
  await new Promise((r) => setTimeout(r, 300));

  // ── Step 6: Capture with html2canvas ───────────────────────────────────
  const sourceEl = iframe.contentDocument.querySelector(".page-wrap");
  if (!sourceEl) {
    document.body.removeChild(iframe);
    throw new Error("Could not find .page-wrap element in rendered template");
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

  // ── Step 7: Convert canvas to multi-page PDF ───────────────────────────
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

  // ── Step 8: Download the PDF ───────────────────────────────────────────
  const filename = `Event-Settlement-${sanitizeFilename(data.eventNameRaw)}.pdf`;
  pdf.save(filename);

  // ── Cleanup ────────────────────────────────────────────────────────────
  document.body.removeChild(iframe);
}
