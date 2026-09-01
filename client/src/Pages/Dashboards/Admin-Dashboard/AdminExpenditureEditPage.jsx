import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Loader2,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import IncomeSourceForm from "../Faculty-Dashboard/IncomeSourceForm";
import ExpenditureDetailsForm from "../Faculty-Dashboard/ExpenditureDetailsForm";
import OtherDetailsForm from "../Faculty-Dashboard/OtherDetailsForm";
import { mapApiToFormData } from "../../../utils/expenditureDataMapper";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Validation helpers (same as FacultyDocumentUploadPage) ──────────────────
const validateIncome = (incomeData) => {
  const errors = [];
  const {
    registrationFees,
    scholarship,
    institutionalAmount,
    departmentFund,
    others,
  } = incomeData;

  if (
    registrationFees.amount ||
    registrationFees.requirements ||
    registrationFees.calculations ||
    registrationFees.details
  ) {
    if (!registrationFees.amount)
      errors.push("Registration Fees: Amount is required");
    if (!registrationFees.requirements)
      errors.push("Registration Fees: Requirements is required");
    if (!registrationFees.calculations)
      errors.push("Registration Fees: Calculations is required");
    if (!registrationFees.details)
      errors.push("Registration Fees: Details is required");
  }

  if (
    scholarship.amount ||
    scholarship.requirements ||
    scholarship.calculations ||
    scholarship.details
  ) {
    if (!scholarship.amount) errors.push("Scholarship: Amount is required");
    if (!scholarship.requirements)
      errors.push("Scholarship: Requirements is required");
    if (!scholarship.calculations)
      errors.push("Scholarship: Calculations is required");
    if (!scholarship.details) errors.push("Scholarship: Details is required");
  }

  if (
    institutionalAmount.amount ||
    institutionalAmount.selectRequired ||
    institutionalAmount.details
  ) {
    if (!institutionalAmount.amount)
      errors.push("Institutional Amount: Amount is required");
    if (!institutionalAmount.selectRequired)
      errors.push("Institutional Amount: Select Required is required");
    if (!institutionalAmount.details)
      errors.push("Institutional Amount: Details is required");
  }

  if (departmentFund.amount || departmentFund.details) {
    if (!departmentFund.amount)
      errors.push("Department Fund: Amount is required");
    if (!departmentFund.details)
      errors.push("Department Fund: Details is required");
  }

  if (
    others.amount ||
    others.requirements ||
    others.calculations ||
    others.details
  ) {
    if (!others.amount) errors.push("Others: Amount is required");
    if (!others.requirements) errors.push("Others: Requirements is required");
    if (!others.calculations) errors.push("Others: Calculations is required");
    if (!others.details) errors.push("Others: Details is required");
  }

  const hasAny =
    registrationFees.amount ||
    scholarship.amount ||
    institutionalAmount.amount ||
    departmentFund.amount ||
    others.amount;
  if (!hasAny) {
    errors.push("Please fill at least one income source");
  }

  return errors;
};

const validateExpenditure = (expenditureData) => {
  const errors = [];
  const categories = [
    "food",
    "transport",
    "accommodation",
    "remuneration",
    "gifts",
    "kits",
    "miscellaneous",
  ];

  let hasAny = false;
  categories.forEach((cat) => {
    const bills = expenditureData[cat] || [];
    if (bills.length > 0) {
      hasAny = true;
      bills.forEach((bill, idx) => {
        if (!bill.expenseName)
          errors.push(`${cat} bill ${idx + 1}: Expense Name is required`);
        if (!bill.billNo)
          errors.push(`${cat} bill ${idx + 1}: Bill No is required`);
        if (!bill.billDate)
          errors.push(`${cat} bill ${idx + 1}: Bill Date is required`);
        if (
          !bill.vendorGuestName &&
          cat !== "kits" &&
          cat !== "miscellaneous"
        ) {
          errors.push(`${cat} bill ${idx + 1}: Vendor/Guest name is required`);
        }
        if (!bill.amount)
          errors.push(`${cat} bill ${idx + 1}: Amount is required`);
      });
    }
  });

  if (!hasAny) {
    errors.push("Please add at least one expenditure entry");
  }

  return errors;
};

const AdminExpenditureEditPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [step, setStep] = useState("incomeSource");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState("");

  // Form data states
  const [incomeData, setIncomeData] = useState(null);
  const [expenditureData, setExpenditureData] = useState(null);
  const [otherData, setOtherData] = useState(null);
  const [initialCategories, setInitialCategories] = useState([]);
  const [expenditureDocId, setExpenditureDocId] = useState(null);

  // ─── Fetch & map data ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [expenditureRes, closingDocRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/event-expenditures/event/${eventId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          axios.get(
            `${API_BASE_URL}/api/event-closing-documents/event/${eventId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);

        const expenditureResponse = expenditureRes.data.data;
        const closingDocResponse = closingDocRes.data.data;

        const mapped = mapApiToFormData(expenditureResponse, closingDocResponse);

        setIncomeData(mapped.incomeData);
        setExpenditureData(mapped.expenditureData);
        setOtherData(mapped.otherData);
        setInitialCategories(mapped.initialCategories);
        setExpenditureDocId(mapped.expenditureDocId);

        // Get event name from closing doc response
        const name =
          closingDocResponse?.eventId?.requestDetails?.eventDetails?.eventName ||
          "";
        setEventName(name);
      } catch (err) {
        console.error("Failed to fetch expenditure data for editing:", err);
        setError(
          err.response?.data?.message || "Failed to load expenditure data",
        );
        toast.error("Failed to load expenditure data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, token]);

  // ─── Navigation ──────────────────────────────────────────────────────────
  const handleBack = () => {
    if (step === "expenditureDetails") setStep("incomeSource");
    else if (step === "otherDetails") setStep("expenditureDetails");
  };

  const handleContinue = () => {
    if (step === "incomeSource") {
      const errors = validateIncome(incomeData);
      if (errors.length > 0) {
        toast.error(errors[0]);
        return;
      }
      setStep("expenditureDetails");
    } else if (step === "expenditureDetails") {
      const errors = validateExpenditure(expenditureData);
      if (errors.length > 0) {
        toast.error(errors[0]);
        return;
      }
      setStep("otherDetails");
    } else if (step === "otherDetails") {
      handleSubmit();
    }
  };

  // ─── Submit (PUT) ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!expenditureDocId) {
      toast.error("Expenditure document ID not found");
      return;
    }

    setSubmitting(true);
    try {
      // Build income array from incomeData
      const income = [];
      const {
        registrationFees,
        scholarship,
        institutionalAmount,
        departmentFund,
        others,
      } = incomeData;

      const buildIncomeDetails = (data) => {
        const parts = [];
        if (data.details) parts.push(data.details);
        if (data.calculations) parts.push(data.calculations);
        if (data.requirements) parts.push(data.requirements);
        return parts.join(", ");
      };

      if (registrationFees.amount) {
        income.push({
          type: "Registration Fees",
          amount: Number(registrationFees.amount) || 0,
          details: buildIncomeDetails(registrationFees),
        });
      }
      if (scholarship.amount) {
        income.push({
          type: "Scholarship",
          amount: Number(scholarship.amount) || 0,
          details: buildIncomeDetails(scholarship),
        });
      }
      if (institutionalAmount.amount) {
        income.push({
          type: "Institutional Amount",
          amount: Number(institutionalAmount.amount) || 0,
          details: buildIncomeDetails(institutionalAmount),
        });
      }
      if (departmentFund.amount) {
        income.push({
          type: "Department Fund",
          amount: Number(departmentFund.amount) || 0,
          details: buildIncomeDetails(departmentFund),
        });
      }
      if (others.amount) {
        income.push({
          type: "Others",
          amount: Number(others.amount) || 0,
          details: buildIncomeDetails(others),
        });
      }

      // Build expenditure object
      const fileRefs = [];
      let fileCounter = 0;

      const buildExpenditureItems = (items) =>
        (items || []).map((b) => {
          const entry = {
            name: b.expenseName || "",
            billNo: b.billNo || "",
            date: b.billDate || "",
            guestName: b.vendorGuestName || "",
            billAmount: Number(b.amount) || 0,
          };
          // Preserve existing documents that weren't replaced
          if (b._existingDocuments?.length > 0 && !b.file) {
            entry.supportingDocuments = b._existingDocuments;
          }
          if (b.file) {
            const ref = `expenditure_file_${fileCounter++}`;
            entry.supportingDocuments = [{ fileRef: ref }];
            fileRefs.push({ ref, file: b.file });
          }
          return entry;
        });

      const expenditure = {
        food: buildExpenditureItems(expenditureData.food),
        accommodation: buildExpenditureItems(expenditureData.accommodation),
        transport: buildExpenditureItems(expenditureData.transport),
        remuneration: buildExpenditureItems(expenditureData.remuneration),
        gifts: buildExpenditureItems(expenditureData.gifts),
        kits: buildExpenditureItems(expenditureData.kits),
        miscellaneous: buildExpenditureItems(expenditureData.miscellaneous),
        remarks: expenditureData.remarks || "",
      };

      // Build participants
      const participants = {
        male: {
          withinState: Number(otherData.participants?.male?.withinState) || 0,
          outsideState:
            Number(otherData.participants?.male?.outsideState) || 0,
        },
        female: {
          withinState:
            Number(otherData.participants?.female?.withinState) || 0,
          outsideState:
            Number(otherData.participants?.female?.outsideState) || 0,
        },
      };

      const payload = {
        eventId,
        income,
        expenditure,
        primarySdg: otherData.primarySdg || "",
        secondarySdg: otherData.secondarySdg || [],
        aboutProgram: otherData.aboutProgram || "",
        participants,
      };

      // Use FormData to support file uploads
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      fileRefs.forEach(({ ref, file }) => {
        formData.append(ref, file);
      });

      const res = await axios.put(
        `${API_BASE_URL}/api/event-expenditures/${expenditureDocId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Expenditure details updated successfully!");
        // Navigate back to the detail view
        navigate(
          `/dashboard-admin/expenditures/EventExpenditureDetailView/${eventId}`,
        );
      }
    } catch (err) {
      console.error("Failed to update expenditure details:", err);
      toast.error(
        err.response?.data?.message || "Failed to update expenditure details",
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    eventId,
    expenditureDocId,
    incomeData,
    expenditureData,
    otherData,
    token,
    navigate,
  ]);

  // ─── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="bg-[#0b1326] mx-6 min-h-screen">
        <div className="flex items-center justify-center py-32">
          <Loader2
            size={28}
            className="animate-spin text-[#8B5CF6]"
          />
          <span className="ml-3 text-sm text-[#CBC3D7]/65">
            Loading expenditure data...
          </span>
        </div>
      </main>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="bg-[#0b1326] mx-6 min-h-screen">
        <div className="py-32 text-center">
          <p className="text-sm text-[#FF4F91]">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 text-sm text-[#8B5CF6] hover:underline"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <main className="bg-[#0b1326] mx-6 min-h-screen">
      {/* ─── Header ─── */}
      <div className="flex h-[54px] w-full items-center gap-2">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/dashboard-admin/expenditures/EventExpenditureDetailView/${eventId}`,
            )
          }
          className="flex items-center gap-1 text-[14px] text-[#737b8f] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <span className="text-[14px] text-[#4c556b]">
          <ChevronRight size={14} />
        </span>

        <span className="text-[14px] font-medium text-[#737b8f]">
          Edit Expenditure
        </span>

        <span className="text-[14px] text-[#4c556b]">
          <ChevronRight size={14} />
        </span>

        <span className="text-[14px] font-medium text-[#d9ddeb]">
          {eventName}
        </span>
      </div>

      {/* ─── Breadcrumbs per step ─── */}
      <section className="px-0 pt-2 text-white poppins">
        <div className="breadcrumbs-container flex items-center gap-2">
          {eventName && (
            <p className="text-[#CBC3D7]/55 text-[13px]">{eventName}</p>
          )}
          <span>
            <ChevronRight size={14} />
          </span>
          <p className="text-[#CBC3D7]/55 text-[13px]">Edit Expenditure</p>
          <span>
            <ChevronRight size={14} />
          </span>
          <p className="text-[#D0BCFF] text-[13px]">
            {step === "incomeSource" && "Income Source"}
            {step === "expenditureDetails" && "Expenditure Details"}
            {step === "otherDetails" && "Other Details"}
          </p>
        </div>
      </section>

      {/* ─── Income Source Step ─── */}
      {step === "incomeSource" && incomeData && (
        <div className="bg-[#0b1326]">
          <IncomeSourceForm
            incomeData={incomeData}
            setIncomeData={setIncomeData}
          />

          <div className="px-7 py-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/dashboard-admin/expenditures/EventExpenditureDetailView/${eventId}`,
                )
              }
              className="flex items-center gap-2 rounded-md px-5 py-3 border border-purple-600 text-sm font-medium text-white cursor-pointer hover:bg-[#7c3aed13] transition-colors"
            >
              <ArrowLeft size={14} />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex items-center gap-2 rounded-md px-8 py-3 bg-[#7C3AED] text-sm font-medium text-white hover:bg-[#7c3aedee] transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ─── Expenditure Details Step ─── */}
      {step === "expenditureDetails" && expenditureData && (
        <div className="bg-[#0b1326]">
          <ExpenditureDetailsForm
            expenditureData={expenditureData}
            setExpenditureData={setExpenditureData}
            initialSelectedCategories={initialCategories}
          />

          <div className="px-7 py-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-md px-5 py-3 border border-purple-600 text-sm font-medium text-white cursor-pointer hover:bg-[#7c3aed13] transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex items-center gap-2 rounded-md px-8 py-3 bg-[#7C3AED] text-sm font-medium text-white hover:bg-[#7c3aedee] transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ─── Other Details Step ─── */}
      {step === "otherDetails" && otherData && (
        <div className="bg-[#0b1326]">
          <OtherDetailsForm
            otherData={otherData}
            setOtherData={setOtherData}
          />

          <div className="px-7 py-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-md px-5 py-3 border border-purple-600 text-sm font-medium text-white cursor-pointer hover:bg-[#7c3aed13] transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={submitting}
              className="flex items-center gap-2 rounded-md px-8 py-3 bg-[#7C3AED] text-sm font-medium text-white hover:bg-[#7c3aedee] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>Update →</>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminExpenditureEditPage;
