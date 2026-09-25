// ── Settlement Data Mapper ──────────────────────────────────────────────────
// Maps the two API responses (event-expenditures + event-closing-documents)
// into the data structure consumed by the settlement HTML template.

const EXPENDITURE_CATEGORIES = [
  "food",
  "transport",
  "accommodation",
  "remuneration",
  "gifts",
  "kits",
  "miscellaneous",
];

const CATEGORY_LABELS = {
  food: "Food",
  transport: "Transport",
  accommodation: "Accommodation",
  remuneration: "Remuneration",
  gifts: "Gifts",
  kits: "Kits",
  miscellaneous: "Miscellaneous (Others)",
};

// ── Income type → template label mapping ───────────────────────────────────
const INCOME_LABEL_MAP = {
  "Registration Fees": "Registration Fees",
  Scholarship: "Sponsorship",
  "Institutional Amount": "Institutional Fund",
  "Department Fund": "Department Fund",
  Others: "Other Sources if Any",
};

/**
 * Format an ISO date string to DD-MM-YYYY for the template.
 * Returns empty string for falsy/invalid input.
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return "";
  }
}

/**
 * Format a number as Indian currency (no ₹ symbol, just commas).
 * Returns empty string for falsy input.
 */
function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("en-IN");
}

/**
 * Escape a string for safe insertion into HTML via textContent-equivalent.
 * Uses &entity encodings to prevent XSS while preserving readability.
 */
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  const s = String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Map both API responses into the settlement form data structure.
 *
 * @param {Object} expenditureRes  - Response from GET /api/event-expenditures/event/:eventId
 * @param {Object} closingDocRes   - Response from GET /api/event-closing-documents/event/:eventId
 * @returns {Object} Data structure consumed by the settlement form template
 */
export function mapSettlementData(expenditureRes, closingDocRes) {
  const expData = expenditureRes?.data || {};
  const eventObj = expData.eventId || closingDocRes?.data?.eventId || {};
  const organizerDetails =
    eventObj.requestDetails?.organizerDetails || {};
  const eventDetails = eventObj.requestDetails?.eventDetails || {};
  const basicDetails = expData.basicDetails || {};

  // ── Extract organizer info (first organizer) ───────────────────────────
  const organizer = organizerDetails.organizers?.[0] || {};

  // ── Extract all guest names ────────────────────────────────────────────
  const guestNames = (basicDetails.guestDetails || [])
    .map((g) => escapeHtml(g))
    .join(", ");

  // ── Build expenditure categories ───────────────────────────────────────
  const expenditure = {};
  let totalAmount = 0;

  EXPENDITURE_CATEGORIES.forEach((cat) => {
    const items = (expData.expenditure?.[cat] || []).map((item) => {
      const amount = Number(item.billAmount) || 0;
      totalAmount += amount;
      return {
        expense: escapeHtml(item.name || ""),
        billNo: escapeHtml(item.billNo || ""),
        billDate: formatDate(item.date),
        guest: escapeHtml(item.guestName || ""),
        amount: amount,
      };
    });
    expenditure[cat] = items;
  });

  // ── Build income rows ──────────────────────────────────────────────────
  const institutionalTypes = ["Institutional Amount", "Institutional Fund"];
  const deptName = organizerDetails.organizingDepartment || organizer.department || "";

  const incomeRows = (expData.income || []).map((inc) => {
    const isInstitutional = institutionalTypes.includes(inc.type);
    return {
      label: inc.type || "Other",
      details: isInstitutional ? deptName : (inc.details || ""),
      detailsBold: false,
      amount: formatAmount(inc.amount),
    };
  });

  // ── Participant breakdown ──────────────────────────────────────────────
  const participants = expData.participants || {};
  const male = participants.male || {};
  const female = participants.female || {};

  // ── SDG goals ──────────────────────────────────────────────────────────
  const sdgGoals = [];
  if (expData.primarySdg) {
    sdgGoals.push({ goal: "Primary SDG Goal", details: escapeHtml(expData.primarySdg) });
  }
  if (expData.secondarySdg && expData.secondarySdg.length > 0) {
    sdgGoals.push({
      goal: "Secondary SDG Goal",
      details: expData.secondarySdg.map((s) => escapeHtml(s)).join(", "),
    });
  }

  // ── Advance taken from the expenditure response ────────────────────────
  const advanceTaken = Number(basicDetails.advanceAmount) || 0;

  // ── Net claim ──────────────────────────────────────────────────────────
  const netClaim = totalAmount - advanceTaken;

  // ── Submission date: use the closing document createdAt or expenditure createdAt
  const submissionDate =
    closingDocRes?.data?.createdAt || expData.createdAt || "";

  const eventDatesArr = (eventDetails.eventSchedule || [])
    .map((s) => formatDate(s.eventDate))
    .filter(Boolean);
  
  let eventDatesStr = "";
  if (eventDatesArr.length === 1) {
    eventDatesStr = eventDatesArr[0];
  } else if (eventDatesArr.length > 1) {
    eventDatesStr = `${eventDatesArr[0]} to ${eventDatesArr[eventDatesArr.length - 1]}`;
  }

  const rawIqac = eventObj.iqacNumber || "";
  let formattedIqac = rawIqac;
  const iqacParts = rawIqac.split("/");
  if (iqacParts.length >= 2) {
    formattedIqac = `${iqacParts[0]}/${iqacParts[1]}/`;
  }

  return {
    // ── Top section ──────────────────────────────────────────────────────
    cornerCode: rawIqac,
    eventName: basicDetails.eventName || eventDetails.eventName || "",
    submissionDate: formatDate(submissionDate),
    eventDate: eventDatesStr,
    guestNames: guestNames || "",
    iqacNumber: formattedIqac,
    facultyName: organizer.name || "",
    empId: organizer.empId || "",
    designation: organizer.designation || "",
    department: organizerDetails.organizingDepartment || organizer.department || "",
    advanceAmount: formatAmount(advanceTaken),
    dateOfAdvance: formatDate(basicDetails.dateOfAdvanceTaken),
    purposeOfAdvance: basicDetails.purposeOfAdvanceTaken || organizerDetails.purposeOfAdvance || "",

    // ── Sections ─────────────────────────────────────────────────────────
    incomeRows,
    expenditure,
    totalAmount,

    gender: {
      maleWithin: male.withinState ?? "",
      maleWithout: male.outsideState ?? "",
      femaleWithin: female.withinState ?? "",
      femaleWithout: female.outsideState ?? "",
    },

    sdgGoals,

    advanceTaken,
    netClaim,

    // ── Remarks ──────────────────────────────────────────────────────────
    remarks: escapeHtml(expData.expenditure?.remarks || ""),

    // ── Metadata ─────────────────────────────────────────────────────────
    eventNameRaw: basicDetails.eventName || eventDetails.eventName || "Event",
  };
}

export { escapeHtml, formatAmount, formatDate };
