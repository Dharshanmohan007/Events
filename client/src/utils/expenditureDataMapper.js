/**
 * expenditureDataMapper.js
 *
 * Reverse-maps API responses (GET /api/event-expenditures/event/:eventId
 * and GET /api/event-closing-documents/event/:eventId) into the form
 * data shapes consumed by IncomeSourceForm, ExpenditureDetailsForm,
 * and OtherDetailsForm.
 */

/**
 * Converts DD-MM-YYYY to YYYY-MM-DD for HTML date inputs.
 * Returns the original string if it's already in YYYY-MM-DD format or empty.
 */
const toISODate = (dateStr) => {
  if (!dateStr) return "";
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // DD-MM-YYYY or DD/MM/YYYY
  const match = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
};

// ─── Income Type → Form Key mapping ─────────────────────────────────────────
const INCOME_TYPE_TO_KEY = {
  "Registration Fees": "registrationFees",
  Scholarship: "scholarship",
  "Institutional Amount": "institutionalAmount",
  "Department Fund": "departmentFund",
  Others: "others",
};

/**
 * Maps API income array → incomeData form shape.
 *
 * API:  [{ type: "Registration Fees", details: "Dev Testing, 45, 800", amount: 878 }]
 * Form: { registrationFees: { amount: "878", details: "Dev Testing, 45, 800" } }
 */
export const apiIncomeToFormData = (incomeArray = []) => {
  const formData = {
    registrationFees: { amount: "", details: "" },
    scholarship: { amount: "", details: "" },
    institutionalAmount: { selectRequired: "", amount: "", details: "" },
    departmentFund: { details: "", amount: "" },
    others: { amount: "", details: "" },
  };

  incomeArray.forEach((item) => {
    const key = INCOME_TYPE_TO_KEY[item.type];
    if (!key) return;

    formData[key].amount = item.amount != null ? String(item.amount) : "";
    formData[key].details = item.details || "";
    // Map selectRequired for institutionalAmount if present
    if (key === 'institutionalAmount' && item.selectRequired) {
      formData[key].selectRequired = item.selectRequired;
    }
  });

  return formData;
};

// ─── Expenditure category keys ──────────────────────────────────────────────
const EXPENDITURE_CATEGORIES = [
  "food",
  "transport",
  "accommodation",
  "remuneration",
  "gifts",
  "kits",
  "miscellaneous",
];

/**
 * Maps API expenditure object → expenditureData form shape.
 *
 * API:  { food: [{ name: "Breakfast", billNo: "123", date: "29-08-2026", guestName: "Surya", billAmount: 1200 }], remarks: "..." }
 * Form: { food: [{ expenseName: "Breakfast", billNo: "123", billDate: "29-08-2026", vendorGuestName: "Surya", amount: "1200", file: null }], remarks: "..." }
 */
export const apiExpenditureToFormData = (expenditureObj = {}) => {
  const formData = {
    food: [],
    transport: [],
    accommodation: [],
    remuneration: [],
    gifts: [],
    kits: [],
    miscellaneous: [],
    remarks: expenditureObj.remarks || "",
  };

  EXPENDITURE_CATEGORIES.forEach((cat) => {
    const items = expenditureObj[cat];
    if (!Array.isArray(items)) return;

    formData[cat] = items.map((item) => ({
      expenseName: item.name || "",
      billNo: item.billNo || "",
      billDate: toISODate(item.date),
      vendorGuestName: item.guestName || "",
      amount: item.billAmount != null ? String(item.billAmount) : "",
      file: null, // File objects can't be round-tripped from URLs
      _existingDocuments: item.supportingDocuments || [], // preserve for reference
    }));
  });

  return formData;
};

/**
 * Returns which expenditure categories have data (for ExpenditureDetailsForm's initialSelectedCategories).
 */
export const getPopulatedExpenditureCategories = (expenditureObj = []) => {
  return EXPENDITURE_CATEGORIES.filter(
    (cat) => Array.isArray(expenditureObj[cat]) && expenditureObj[cat].length > 0,
  );
};

/**
 * Maps API participants + SDG data → otherData form shape.
 *
 * API:  { participants: { male: { withinState: 10, outsideState: 5 } }, primarySdg: "SDG 1", secondarySdg: ["SDG 3"], aboutProgram: "..." }
 * Form: { participants: { male: { total: "15", withinState: "10", outsideState: "5" } }, primarySdg: "SDG 1", secondarySdg: ["SDG 3"], aboutProgram: "..." }
 */
export const apiOtherDataToFormData = (expenditureResponse = {}) => {
  const participants = expenditureResponse.participants || {};
  const male = participants.male || {};
  const female = participants.female || {};

  const maleTotal = (Number(male.withinState) || 0) + (Number(male.outsideState) || 0);
  const femaleTotal = (Number(female.withinState) || 0) + (Number(female.outsideState) || 0);

  return {
    participants: {
      male: {
        total: maleTotal ? String(maleTotal) : "",
        withinState: male.withinState != null ? String(male.withinState) : "",
        outsideState: male.outsideState != null ? String(male.outsideState) : "",
      },
      female: {
        total: femaleTotal ? String(femaleTotal) : "",
        withinState: female.withinState != null ? String(female.withinState) : "",
        outsideState: female.outsideState != null ? String(female.outsideState) : "",
      },
    },
    primarySdg: expenditureResponse.primarySdg || "",
    secondarySdg: expenditureResponse.secondarySdg || [],
    aboutProgram: expenditureResponse.aboutProgram || "",
  };
};

/**
 * Master mapper — takes both API responses and returns all three form data objects.
 */
export const mapApiToFormData = (expenditureResponse, closingDocResponse) => {
  const incomeData = apiIncomeToFormData(expenditureResponse.income);
  const expenditureData = apiExpenditureToFormData(expenditureResponse.expenditure);
  const otherData = apiOtherDataToFormData(expenditureResponse);
  const initialCategories = getPopulatedExpenditureCategories(expenditureResponse.expenditure);
  const expenditureDocId = expenditureResponse._id;

  return {
    incomeData,
    expenditureData,
    otherData,
    initialCategories,
    expenditureDocId,
  };
};
