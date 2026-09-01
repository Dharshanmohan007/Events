/**
 * expenditureDataMapper.js
 *
 * Reverse-maps API responses (GET /api/event-expenditures/event/:eventId
 * and GET /api/event-closing-documents/event/:eventId) into the form
 * data shapes consumed by IncomeSourceForm, ExpenditureDetailsForm,
 * and OtherDetailsForm.
 */

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
 * Form: { registrationFees: { requirements: "", calculations: "", amount: "878", details: "Dev Testing, 45, 800" } }
 *
 * NOTE: requirements & calculations are lossy on round-trip (the POST
 * concatenates them into `details`). On edit we put the full string in
 * `details` and leave the other two blank.
 */
export const apiIncomeToFormData = (incomeArray = []) => {
  const formData = {
    registrationFees: { requirements: "", calculations: "", amount: "", details: "" },
    scholarship: { requirements: "", calculations: "", amount: "", details: "" },
    institutionalAmount: { selectRequired: "", amount: "", details: "" },
    departmentFund: { details: "", amount: "" },
    others: { requirements: "", calculations: "", amount: "", details: "" },
  };

  incomeArray.forEach((item) => {
    const key = INCOME_TYPE_TO_KEY[item.type];
    if (!key) return;

    formData[key].amount = item.amount != null ? String(item.amount) : "";
    formData[key].details = item.details || "";
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
      billDate: item.date || "",
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
