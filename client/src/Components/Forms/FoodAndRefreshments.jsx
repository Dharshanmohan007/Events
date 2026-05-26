import React, {
  useState,
  memo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import DatePicker from "react-datepicker";
import { Trash2, Plus, Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import CustomInput from "../CustomInput";

const BASE_URL = "https://sece-events.onrender.com";

// ─── DatePicker dark theme override (injected once) ──────────────────────────
const DATE_PICKER_STYLES = `
  .food-datepicker-popper {
    z-index: 9999 !important;
  }
  .food-datepicker-popper .react-datepicker {
    background-color: #1E1E2F !important;
    border: 1px solid #3A3A5A !important;
    border-radius: 12px !important;
    font-family: inherit !important;
    color: #fff !important;
  }
  .food-datepicker-popper .react-datepicker__header {
    background-color: #1E1E2F !important;
    border-bottom: 1px solid #3A3A5A !important;
    border-radius: 12px 12px 0 0 !important;
  }
  .food-datepicker-popper .react-datepicker__current-month,
  .food-datepicker-popper .react-datepicker__day-name,
  .food-datepicker-popper .react-datepicker-time__header {
    color: #fff !important;
  }
  .food-datepicker-popper .react-datepicker__day {
    color: #fff !important;
    border-radius: 6px !important;
  }
  .food-datepicker-popper .react-datepicker__day:hover {
    background-color: #7c3aed !important;
    color: #fff !important;
  }
  .food-datepicker-popper .react-datepicker__day--selected,
  .food-datepicker-popper .react-datepicker__day--keyboard-selected {
    background-color: #7c3aed !important;
    color: #fff !important;
  }
  .food-datepicker-popper .react-datepicker__day--outside-month {
    color: #555580 !important;
  }
  .food-datepicker-popper .react-datepicker__navigation-icon::before {
    border-color: #aaa !important;
  }
  .food-datepicker-popper .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
    border-color: #fff !important;
  }
  .food-datepicker-popper .react-datepicker__triangle {
    display: none !important;
  }
`;

// ─── Multi-select — tick mark style, no checkbox ─────────────────────────────
function MultiSelect({ label, options, selected = [], onToggle, labelBg = "#1f1f38" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayText =
    selected.length === 0 ? options.join(" / ") : selected.join(", ");

  return (
    <div className="relative w-full" ref={ref}>
      <span
        className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
        style={{ backgroundColor: labelBg }}
      >
        {label}
      </span>
      <div
        onClick={() => setOpen((p) => !p)}
        className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${
          open ? "border-purple-500" : "border-[#3A3A5A]"
        }`}
      >
        <span
          className={`text-sm truncate ${
            selected.length === 0 ? "text-gray-500" : "text-white"
          }`}
        >
          {displayText}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ml-2 ${
            open ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-50 max-h-52 overflow-y-auto">
          {options.map((opt, i) => {
            const isSelected = selected.includes(opt);
            return (
              <div
                key={i}
                onClick={() => onToggle(opt)}
                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-purple-600/30 text-white"
                    : "text-gray-300 hover:bg-purple-500/20 hover:text-white"
                }`}
              >
                <span>{opt}</span>
                <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center ml-3">
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Meal section ─────────────────────────────────────────────────────────────
const MealSection = memo(function MealSection({ title, data, onChange, labelBg = "#1f1f38" }) {
  return (
    <div className="col-span-1 md:col-span-2 bg-[#2a2a4a] border border-[#3b3b66] rounded-2xl p-5">
      <h2 className="text-purple-400 font-semibold text-lg mb-5">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput
          label="No. of veg In Participants Menu *"
          labelBg={labelBg}
          type="number"
          value={data.vegParticipants}
          onChange={(e) => onChange("vegParticipants", e.target.value)}
        />
        <CustomInput
          label="No. of veg In Guest/VIP Menu *"
          labelBg={labelBg}
          type="number"
          value={data.vegGuest}
          onChange={(e) => onChange("vegGuest", e.target.value)}
        />
        <CustomInput
          label="No. of Non-veg In Participants Menu *"
          labelBg={labelBg}
          type="number"
          value={data.nonVegParticipants}
          onChange={(e) => onChange("nonVegParticipants", e.target.value)}
        />
        <CustomInput
          label="No. of Non-veg In Guest/VIP Menu *"
          labelBg={labelBg}
          type="number"
          value={data.nonVegGuest}
          onChange={(e) => onChange("nonVegGuest", e.target.value)}
        />
      </div>
    </div>
  );
});

// ─── Delete Confirmation Popup ────────────────────────────────────────────────
function DeleteConfirmPopup({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-[#1e1e38] border border-[#3a3a5a] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 mx-auto mb-4">
          <Trash2 size={22} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-center text-lg mb-2">
          Delete Entry
        </h3>
        <p className="text-gray-400 text-sm text-center mb-6">
          Are you sure you want to delete this entry? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#3a3a5a] text-gray-300 hover:text-white hover:border-[#5a5a8a] text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty form factory ───────────────────────────────────────────────────────
function createForm() {
  return {
    id: crypto.randomUUID(),
    date: null,
    resourcePersonType: [],
    resourcePersons: "",
    internalCount: "",
    staffList: [],
    foodTypes: [],
    breakfast: { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
    lunch:     { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
    dinner:    { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
    specialRequirements: "",
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateFoodForms(forms) {
  if (!forms || forms.length === 0) return { _global: "Enter at least one food entry" };
  const errors = forms.map((form) => {
    const err = {};
    if (!form.date) err.date = "Date is required";
    if (!form.resourcePersonType || form.resourcePersonType.length === 0)
      err.resourcePersonType = "Resource person type is required";
    if (!form.resourcePersons?.trim()) err.resourcePersons = "Resource count is required";
    if (!form.internalCount?.trim()) err.internalCount = "Internal count is required";
    if (!form.foodTypes || form.foodTypes.length === 0)
      err.foodTypes = "Food type is required";
    const count = parseInt(form.internalCount) || 0;
    if (count > 0) {
      const staffErrors = (form.staffList || []).slice(0, count).map((staff) => {
        const se = {};
        if (!staff.name?.trim()) se.name = "Staff name is required";
        if (!staff.mobile?.trim()) se.mobile = "Staff mobile is required";
        return se;
      });
      if (staffErrors.some((se) => Object.keys(se).length > 0)) {
        err.staffList = staffErrors;
      }
    }
    return err;
  });
  if (errors.some((e) => Object.keys(e).length > 0)) return errors;
  return {};
}

// ─── Sync staffList length when internalCount changes ─────────────────────────
function syncStaffList(staffList, count) {
  const n = Math.max(0, parseInt(count) || 0);
  if (staffList.length === n) return staffList;
  if (staffList.length < n) {
    return [
      ...staffList,
      ...Array.from({ length: n - staffList.length }, () => ({ name: "", mobile: "" })),
    ];
  }
  return staffList.slice(0, n);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FoodAndRefreshments({
  nextStep,
  prevStep,
  registerChildNavigation,
  foodData: initialFoodData,
  onFoodDataChange,
  eventId,
  errors: propErrors = {},
}) {
  // Inject dark datepicker styles once
  useEffect(() => {
    const id = "food-datepicker-dark";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = DATE_PICKER_STYLES;
      document.head.appendChild(style);
    }
  }, []);

  const [forms, setForms] = useState(() => {
    if (initialFoodData && initialFoodData.length > 0) {
      return initialFoodData.map((f) => ({
        ...f,
        staffList: f.staffList || syncStaffList([], f.internalCount || ""),
      }));
    }
    return [createForm()];
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Confirm popup state ──────────────────────────────────────────────────────
  // { type: "form", formId } | { type: "staff", formId, staffIndex } | null
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── DatePicker refs (one per form, keyed by form.id) ────────────────────────
  const datePickerRefs = useRef({});

  const formsRef = useRef(forms);
  useEffect(() => { formsRef.current = forms; }, [forms]);

  const onChangeRef = useRef(onFoodDataChange);
  useEffect(() => { onChangeRef.current = onFoodDataChange; }, [onFoodDataChange]);
  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current(forms);
  }, [forms]);

  const handleChange = (id, field, value, section = null) => {
    setForms((prev) =>
      prev.map((form) => {
        if (form.id !== id) return form;
        if (section) return { ...form, [section]: { ...form[section], [field]: value } };
        if (field === "internalCount") {
          return {
            ...form,
            internalCount: value,
            staffList: syncStaffList(form.staffList || [], value),
          };
        }
        return { ...form, [field]: value };
      })
    );
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const idx = forms.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...(updated[idx] || {}), [field]: "" };
      return updated;
    });
  };

  const handleStaffChange = (id, staffIndex, field, value) => {
    setForms((prev) =>
      prev.map((form) => {
        if (form.id !== id) return form;
        const updatedStaff = form.staffList.map((s, i) =>
          i === staffIndex ? { ...s, [field]: value } : s
        );
        return { ...form, staffList: updatedStaff };
      })
    );
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const idx = forms.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const updated = [...prev];
      const formErr = { ...(updated[idx] || {}) };
      if (formErr.staffList) {
        const staffErrs = [...formErr.staffList];
        staffErrs[staffIndex] = { ...(staffErrs[staffIndex] || {}), [field]: "" };
        formErr.staffList = staffErrs;
      }
      updated[idx] = formErr;
      return updated;
    });
  };

  const handleMultiToggle = (id, field, option) => {
    setForms((prev) =>
      prev.map((form) => {
        if (form.id !== id) return form;
        const current = form[field] || [];
        const exists = current.includes(option);
        return {
          ...form,
          [field]: exists ? current.filter((v) => v !== option) : [...current, option],
        };
      })
    );
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const idx = forms.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...(updated[idx] || {}), [field]: "" };
      return updated;
    });
  };

  const handleAdd = () => setForms((prev) => [...prev, createForm()]);

  // ── Delete form card (with popup) ───────────────────────────────────────────
  const requestDeleteForm = (id) => {
    setDeleteTarget({ type: "form", formId: id });
  };

  // ── Delete individual staff container ────────────────────────────────────────
  const requestDeleteStaff = (formId, staffIndex) => {
    setDeleteTarget({ type: "staff", formId, staffIndex });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "form") {
      setForms((prev) => prev.filter((form) => form.id !== deleteTarget.formId));
    } else if (deleteTarget.type === "staff") {
      const { formId, staffIndex } = deleteTarget;
      setForms((prev) =>
        prev.map((form) => {
          if (form.id !== formId) return form;
          const updatedStaff = form.staffList.filter((_, i) => i !== staffIndex);
          const newCount = updatedStaff.length;
          return {
            ...form,
            staffList: updatedStaff,
            internalCount: String(newCount),
          };
        })
      );
    }

    setDeleteTarget(null);
  };

  const handleCancelDelete = () => setDeleteTarget(null);

  const getError = (id, field) => {
    if (!Array.isArray(errors)) return "";
    const idx = forms.findIndex((f) => f.id === id);
    return errors[idx]?.[field] || "";
  };

  const getStaffError = (id, staffIndex, field) => {
    if (!Array.isArray(errors)) return "";
    const idx = forms.findIndex((f) => f.id === id);
    return errors[idx]?.staffList?.[staffIndex]?.[field] || "";
  };

  const buildPayload = (latest) => {
    return {
      refreshmentDetails: {
        refreshments: latest.map((form) => {
          const MEAL_KEYS = ["Breakfast", "Lunch", "Dinner"];
          const foodTypesPayload = (form.foodTypes || []).map((type) => {
            if (MEAL_KEYS.includes(type)) {
              const mealData = form[type.toLowerCase()] || {};
              return {
                type,
                participants: {
                  vegCount: parseInt(mealData.vegParticipants) || 0,
                  nonVegCount: parseInt(mealData.nonVegParticipants) || 0,
                },
                vipGuests: {
                  vegCount: parseInt(mealData.vegGuest) || 0,
                  nonVegCount: parseInt(mealData.nonVegGuest) || 0,
                },
              };
            }
            return {
              type,
              participants: { vegCount: 0, nonVegCount: 0 },
              vipGuests: { vegCount: 0, nonVegCount: 0 },
            };
          });

          return {
            date: form.date ? form.date.toISOString() : "",
            resourcePersonType: form.resourcePersonType || [],
            numberOfResourcePersons: parseInt(form.resourcePersons) || 0,
            numberOfInternalAccompanyingStaff: parseInt(form.internalCount) || 0,
            accompanyingStaff: (form.staffList || []).map((s) => ({
              name: s.name || "",
              mobile: parseInt(s.mobile) || 0,
            })),
            foodTypes: foodTypesPayload,
            specialRequirements: form.specialRequirements || "",
          };
        }),
      },
    };
  };

  const handleNext = useCallback(async () => {
    const latest = formsRef.current;
    const errs = validateFoodForms(latest);
    const hasErrors = !Array.isArray(errs)
      ? Object.keys(errs).length > 0
      : errs.some((e) => Object.keys(e).length > 0);
    if (hasErrors) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    setApiError("");
    try {
      const payload = buildPayload(latest);
      console.log("food payload:", payload);
      const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Server error: ${response.status}`);
      nextStep();
    } catch (err) {
      setApiError(err.message || "Failed to save food details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, nextStep]);

  const handleBack = useCallback(() => { if (prevStep) prevStep(); }, [prevStep]);

  const navRef = useRef({ next: handleNext, prev: handleBack, isLoading });
  useEffect(() => { navRef.current = { next: handleNext, prev: handleBack, isLoading }; });

  useEffect(() => {
    if (!registerChildNavigation) return;
    const stableNext = (...args) => navRef.current.next(...args);
    const stablePrev = (...args) => navRef.current.prev(...args);
    registerChildNavigation({ next: stableNext, prev: stablePrev, isLoading: false });
    return () => registerChildNavigation({ next: null, prev: null, isLoading: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerChildNavigation]);

  useEffect(() => {
    if (!registerChildNavigation) return;
    registerChildNavigation({ next: navRef.current.next, prev: navRef.current.prev, isLoading });
  }, [isLoading, registerChildNavigation]);

  const RESOURCE_OPTIONS = ["VIP", "Trainer", "Placement"];
  const FOOD_TYPE_OPTIONS = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Morning Refreshment",
    "Evening Refreshment",
  ];
  const MEAL_SECTIONS = ["Breakfast", "Lunch", "Dinner"];

  return (
    <div className="w-full">
      {/* Delete confirmation popup */}
      {deleteTarget && (
        <DeleteConfirmPopup
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      {/* Top-level Add button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {forms.map((form, index) => (
        <div
          key={form.id}
          className="relative bg-[#1f1f38] border border-[#32325a] rounded-2xl mb-6 overflow-visible"
        >
          {/* ── Delete button: inside top-right corner of the card ── */}
          {index !== 0 && (
            <div className="flex justify-end pt-4 pr-4">
              <button
                type="button"
                onClick={() => requestDeleteForm(form.id)}
                className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-full transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}

          <div className={`p-5 grid grid-cols-1 md:grid-cols-2 gap-5 ${index !== 0 ? "pt-2" : ""}`}>

            {/* Row 1: Date + Resource Person Type */}
            <div className="w-full">
              <div className="relative">
                <label className="absolute -top-2 left-3 z-10 bg-[#1f1f38] px-2 text-xs text-white pointer-events-none">
                  Select Date *
                </label>
                {/* Calendar icon — clicking it opens the picker */}
                <button
                  type="button"
                  onClick={() => datePickerRefs.current[form.id]?.setOpen(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-purple-400 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  <Calendar size={18} />
                </button>
                <DatePicker
                  ref={(el) => { datePickerRefs.current[form.id] = el; }}
                  selected={form.date}
                  onChange={(date) => handleChange(form.id, "date", date)}
                  dateFormat="dd/MM/yyyy"
                  shouldCloseOnSelect
                  popperPlacement="bottom-start"
                  popperClassName="food-datepicker-popper"
                  popperProps={{ strategy: "fixed" }}
                  className="w-full h-[52px] px-4 pr-10 rounded-xl border border-[#3d3d68] text-white outline-none cursor-pointer focus:border-purple-500 bg-transparent"
                  wrapperClassName="w-full"
                  calendarClassName="food-dark-cal"
                />
              </div>
              {getError(form.id, "date") && (
                <p className="text-red-400 text-xs mt-1">{getError(form.id, "date")}</p>
              )}
            </div>

            <div>
              <MultiSelect
                label="Type of Resource Person *"
                options={RESOURCE_OPTIONS}
                selected={form.resourcePersonType}
                onToggle={(opt) => handleMultiToggle(form.id, "resourcePersonType", opt)}
                labelBg="#1f1f38"
              />
              {getError(form.id, "resourcePersonType") && (
                <p className="text-red-400 text-xs mt-1">
                  {getError(form.id, "resourcePersonType")}
                </p>
              )}
            </div>

            {/* Row 2: Resource Persons + Internal Count */}
            <div>
              <CustomInput
                label="Total number of Resource Persons *"
                labelBg="#1f1f38"
                value={form.resourcePersons}
                onChange={(e) => handleChange(form.id, "resourcePersons", e.target.value)}
                type="number"
              />
              {getError(form.id, "resourcePersons") && (
                <p className="text-red-400 text-xs mt-1">
                  {getError(form.id, "resourcePersons")}
                </p>
              )}
            </div>

            <div>
              <CustomInput
                label="Total number of Internal Accompanying Persons *"
                labelBg="#1f1f38"
                value={form.internalCount}
                onChange={(e) => handleChange(form.id, "internalCount", e.target.value)}
                type="number"
              />
              {getError(form.id, "internalCount") && (
                <p className="text-red-400 text-xs mt-1">
                  {getError(form.id, "internalCount")}
                </p>
              )}
            </div>

            {/* Dynamic Staff Containers */}
            {(form.staffList || []).length > 0 && (
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 gap-4">
                {(form.staffList || []).map((staff, staffIndex) => (
                  <div
                    key={staffIndex}
                    className="bg-[#2a2a4a] border border-[#3b3b66] rounded-2xl p-5"
                  >
                    {/* Staff header row with title + delete button */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-purple-400 font-semibold text-sm">
                        Staff {staffIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => requestDeleteStaff(form.id, staffIndex)}
                        className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-full transition-all"
                        title="Delete staff"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <CustomInput
                          label={`Staff ${staffIndex + 1} Name *`}
                          labelBg="#2a2a4a"
                          value={staff.name}
                          onChange={(e) =>
                            handleStaffChange(form.id, staffIndex, "name", e.target.value)
                          }
                        />
                        {getStaffError(form.id, staffIndex, "name") && (
                          <p className="text-red-400 text-xs mt-1">
                            {getStaffError(form.id, staffIndex, "name")}
                          </p>
                        )}
                      </div>
                      <div>
                        <CustomInput
                          label={`Staff ${staffIndex + 1} Mobile Number *`}
                          labelBg="#2a2a4a"
                          value={staff.mobile}
                          onChange={(e) =>
                            handleStaffChange(form.id, staffIndex, "mobile", e.target.value)
                          }
                          type="number"
                        />
                        {getStaffError(form.id, staffIndex, "mobile") && (
                          <p className="text-red-400 text-xs mt-1">
                            {getStaffError(form.id, staffIndex, "mobile")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Food Type multi-select */}
            <div className="col-span-1 md:col-span-2">
              <MultiSelect
                label="Food Type *"
                options={FOOD_TYPE_OPTIONS}
                selected={form.foodTypes}
                onToggle={(opt) => handleMultiToggle(form.id, "foodTypes", opt)}
                labelBg="#1f1f38"
              />
              {getError(form.id, "foodTypes") && (
                <p className="text-red-400 text-xs mt-1">{getError(form.id, "foodTypes")}</p>
              )}
            </div>

            {/* Conditional Meal Sections */}
            {MEAL_SECTIONS.map((meal) =>
              form.foodTypes.includes(meal) ? (
                <MealSection
                  key={meal}
                  title={meal}
                  data={form[meal.toLowerCase()]}
                  onChange={(field, value) =>
                    handleChange(form.id, field, value, meal.toLowerCase())
                  }
                  labelBg="#2a2a4a"
                />
              ) : null
            )}

            {/* Special Requirements — transparent background */}
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <label className="absolute -top-2 left-3 z-10 bg-[#1f1f38] px-2 text-xs text-white">
                  Special Requirements, If any
                </label>
                <textarea
                  rows={4}
                  value={form.specialRequirements}
                  onChange={(e) =>
                    handleChange(form.id, "specialRequirements", e.target.value)
                  }
                  className="w-full rounded-xl bg-transparent border border-[#3d3d68] px-4 py-4 text-white placeholder:text-gray-400 outline-none resize-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


// import React, {
//   useState,
//   memo,
//   useRef,
//   useEffect,
//   useCallback,
// } from "react";
// import DatePicker from "react-datepicker";
// import { Trash2, Plus, Calendar } from "lucide-react";
// import "react-datepicker/dist/react-datepicker.css";
// import CustomInput from "../CustomInput";

// const BASE_URL = "https://sece-events.onrender.com";

// // ─── DatePicker dark theme override (injected once) ──────────────────────────
// const DATE_PICKER_STYLES = `
//   .food-datepicker-popper {
//     z-index: 9999 !important;
//   }
//   .food-datepicker-popper .react-datepicker {
//     background-color: #1E1E2F !important;
//     border: 1px solid #3A3A5A !important;
//     border-radius: 12px !important;
//     font-family: inherit !important;
//     color: #fff !important;
//   }
//   .food-datepicker-popper .react-datepicker__header {
//     background-color: #1E1E2F !important;
//     border-bottom: 1px solid #3A3A5A !important;
//     border-radius: 12px 12px 0 0 !important;
//   }
//   .food-datepicker-popper .react-datepicker__current-month,
//   .food-datepicker-popper .react-datepicker__day-name,
//   .food-datepicker-popper .react-datepicker-time__header {
//     color: #fff !important;
//   }
//   .food-datepicker-popper .react-datepicker__day {
//     color: #fff !important;
//     border-radius: 6px !important;
//   }
//   .food-datepicker-popper .react-datepicker__day:hover {
//     background-color: #7c3aed !important;
//     color: #fff !important;
//   }
//   .food-datepicker-popper .react-datepicker__day--selected,
//   .food-datepicker-popper .react-datepicker__day--keyboard-selected {
//     background-color: #7c3aed !important;
//     color: #fff !important;
//   }
//   .food-datepicker-popper .react-datepicker__day--outside-month {
//     color: #555580 !important;
//   }
//   .food-datepicker-popper .react-datepicker__navigation-icon::before {
//     border-color: #aaa !important;
//   }
//   .food-datepicker-popper .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
//     border-color: #fff !important;
//   }
//   .food-datepicker-popper .react-datepicker__triangle {
//     display: none !important;
//   }
// `;

// // ─── Multi-select — tick mark style, no checkbox ─────────────────────────────
// function MultiSelect({ label, options, selected = [], onToggle, labelBg = "#1f1f38" }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const displayText =
//     selected.length === 0 ? options.join(" / ") : selected.join(", ");

//   return (
//     <div className="relative w-full" ref={ref}>
//       <span
//         className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
//         style={{ backgroundColor: labelBg }}
//       >
//         {label}
//       </span>
//       <div
//         onClick={() => setOpen((p) => !p)}
//         className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${
//           open ? "border-purple-500" : "border-[#3A3A5A]"
//         }`}
//       >
//         <span
//           className={`text-sm truncate ${
//             selected.length === 0 ? "text-gray-500" : "text-white"
//           }`}
//         >
//           {displayText}
//         </span>
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="16"
//           height="16"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ml-2 ${
//             open ? "rotate-180" : ""
//           }`}
//         >
//           <polyline points="6 9 12 15 18 9" />
//         </svg>
//       </div>

//       {open && (
//         <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-50 max-h-52 overflow-y-auto">
//           {options.map((opt, i) => {
//             const isSelected = selected.includes(opt);
//             return (
//               <div
//                 key={i}
//                 onClick={() => onToggle(opt)}
//                 className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
//                   isSelected
//                     ? "bg-purple-600/30 text-white"
//                     : "text-gray-300 hover:bg-purple-500/20 hover:text-white"
//                 }`}
//               >
//                 <span>{opt}</span>
//                 <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center ml-3">
//                   {isSelected && (
//                     <svg
//                       className="w-4 h-4 text-purple-400"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={3}
//                         d="M5 13l4 4L19 7"
//                       />
//                     </svg>
//                   )}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Meal section ─────────────────────────────────────────────────────────────
// const MealSection = memo(function MealSection({ title, data, onChange, labelBg = "#1f1f38" }) {
//   return (
//     <div className="col-span-1 md:col-span-2 bg-[#2a2a4a] border border-[#3b3b66] rounded-2xl p-5">
//       <h2 className="text-purple-400 font-semibold text-lg mb-5">{title}</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <CustomInput
//           label="No. of veg In Participants Menu *"
//           labelBg={labelBg}
//           type="number"
//           value={data.vegParticipants}
//           onChange={(e) => onChange("vegParticipants", e.target.value)}
//         />
//         <CustomInput
//           label="No. of veg In Guest/VIP Menu *"
//           labelBg={labelBg}
//           type="number"
//           value={data.vegGuest}
//           onChange={(e) => onChange("vegGuest", e.target.value)}
//         />
//         <CustomInput
//           label="No. of Non-veg In Participants Menu *"
//           labelBg={labelBg}
//           type="number"
//           value={data.nonVegParticipants}
//           onChange={(e) => onChange("nonVegParticipants", e.target.value)}
//         />
//         <CustomInput
//           label="No. of Non-veg In Guest/VIP Menu *"
//           labelBg={labelBg}
//           type="number"
//           value={data.nonVegGuest}
//           onChange={(e) => onChange("nonVegGuest", e.target.value)}
//         />
//       </div>
//     </div>
//   );
// });

// // ─── Delete Confirmation Popup ────────────────────────────────────────────────
// function DeleteConfirmPopup({ onConfirm, onCancel }) {
//   return (
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center">
//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//         onClick={onCancel}
//       />
//       {/* Modal */}
//       <div className="relative bg-[#1e1e38] border border-[#3a3a5a] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
//         {/* Icon */}
//         <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 mx-auto mb-4">
//           <Trash2 size={22} className="text-red-400" />
//         </div>
//         <h3 className="text-white font-semibold text-center text-lg mb-2">
//           Delete Entry
//         </h3>
//         <p className="text-gray-400 text-sm text-center mb-6">
//           Are you sure you want to delete this entry? This action cannot be undone.
//         </p>
//         <div className="flex gap-3">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="flex-1 px-4 py-2.5 rounded-xl border border-[#3a3a5a] text-gray-300 hover:text-white hover:border-[#5a5a8a] text-sm font-medium transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={onConfirm}
//             className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Empty form factory ───────────────────────────────────────────────────────
// function createForm() {
//   return {
//     id: crypto.randomUUID(),
//     date: null,
//     resourcePersonType: [],
//     resourcePersons: "",
//     internalCount: "",
//     staffList: [],
//     foodTypes: [],
//     breakfast: { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
//     lunch:     { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
//     dinner:    { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
//     specialRequirements: "",
//   };
// }

// // ─── Validation ───────────────────────────────────────────────────────────────
// function validateFoodForms(forms) {
//   if (!forms || forms.length === 0) return { _global: "Enter at least one food entry" };
//   const errors = forms.map((form) => {
//     const err = {};
//     if (!form.date) err.date = "Date is required";
//     if (!form.resourcePersonType || form.resourcePersonType.length === 0)
//       err.resourcePersonType = "Resource person type is required";
//     if (!form.resourcePersons?.trim()) err.resourcePersons = "Resource count is required";
//     if (!form.internalCount?.trim()) err.internalCount = "Internal count is required";
//     if (!form.foodTypes || form.foodTypes.length === 0)
//       err.foodTypes = "Food type is required";
//     const count = parseInt(form.internalCount) || 0;
//     if (count > 0) {
//       const staffErrors = (form.staffList || []).slice(0, count).map((staff) => {
//         const se = {};
//         if (!staff.name?.trim()) se.name = "Staff name is required";
//         if (!staff.mobile?.trim()) se.mobile = "Staff mobile is required";
//         return se;
//       });
//       if (staffErrors.some((se) => Object.keys(se).length > 0)) {
//         err.staffList = staffErrors;
//       }
//     }
//     return err;
//   });
//   if (errors.some((e) => Object.keys(e).length > 0)) return errors;
//   return {};
// }

// // ─── Sync staffList length when internalCount changes ─────────────────────────
// function syncStaffList(staffList, count) {
//   const n = Math.max(0, parseInt(count) || 0);
//   if (staffList.length === n) return staffList;
//   if (staffList.length < n) {
//     return [
//       ...staffList,
//       ...Array.from({ length: n - staffList.length }, () => ({ name: "", mobile: "" })),
//     ];
//   }
//   return staffList.slice(0, n);
// }

// // ─── Food type options (must match backend accepted values exactly) ───────────
// // MEAL_SECTIONS are the ones that expand into veg/non-veg sub-fields.
// // Non-meal types (Tea, Morning Refreshment, Evening Refreshment) are sent
// // with zero counts — no sub-form needed.
// const RESOURCE_OPTIONS = ["Guest Speaker", "Faculty", "VIP", "Trainer", "Placement"];

// const FOOD_TYPE_OPTIONS = [
//   "Breakfast",
//   "Lunch",
//   "Dinner",
//   "Tea",
//   "Morning Refreshment",
//   "Evening Refreshment",
// ];

// // Only these three get the detailed veg/non-veg sub-section
// const MEAL_SECTIONS = ["Breakfast", "Lunch", "Dinner"];

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function FoodAndRefreshments({
//   nextStep,
//   prevStep,
//   registerChildNavigation,
//   foodData: initialFoodData,
//   onFoodDataChange,
//   eventId,
//   errors: propErrors = {},
// }) {
//   // Inject dark datepicker styles once
//   useEffect(() => {
//     const id = "food-datepicker-dark";
//     if (!document.getElementById(id)) {
//       const style = document.createElement("style");
//       style.id = id;
//       style.textContent = DATE_PICKER_STYLES;
//       document.head.appendChild(style);
//     }
//   }, []);

//   const [forms, setForms] = useState(() => {
//     if (initialFoodData && initialFoodData.length > 0) {
//       return initialFoodData.map((f) => ({
//         ...f,
//         staffList: f.staffList || syncStaffList([], f.internalCount || ""),
//       }));
//     }
//     return [createForm()];
//   });
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiError, setApiError] = useState("");

//   // ── Confirm popup state ──────────────────────────────────────────────────────
//   const [deleteTarget, setDeleteTarget] = useState(null);

//   // ── DatePicker refs (one per form, keyed by form.id) ────────────────────────
//   const datePickerRefs = useRef({});

//   const formsRef = useRef(forms);
//   useEffect(() => { formsRef.current = forms; }, [forms]);

//   const onChangeRef = useRef(onFoodDataChange);
//   useEffect(() => { onChangeRef.current = onFoodDataChange; }, [onFoodDataChange]);
//   useEffect(() => {
//     if (onChangeRef.current) onChangeRef.current(forms);
//   }, [forms]);

//   const handleChange = (id, field, value, section = null) => {
//     setForms((prev) =>
//       prev.map((form) => {
//         if (form.id !== id) return form;
//         if (section) return { ...form, [section]: { ...form[section], [field]: value } };
//         if (field === "internalCount") {
//           return {
//             ...form,
//             internalCount: value,
//             staffList: syncStaffList(form.staffList || [], value),
//           };
//         }
//         return { ...form, [field]: value };
//       })
//     );
//     setErrors((prev) => {
//       if (!Array.isArray(prev)) return prev;
//       const idx = forms.findIndex((f) => f.id === id);
//       if (idx === -1) return prev;
//       const updated = [...prev];
//       updated[idx] = { ...(updated[idx] || {}), [field]: "" };
//       return updated;
//     });
//   };

//   const handleStaffChange = (id, staffIndex, field, value) => {
//     setForms((prev) =>
//       prev.map((form) => {
//         if (form.id !== id) return form;
//         const updatedStaff = form.staffList.map((s, i) =>
//           i === staffIndex ? { ...s, [field]: value } : s
//         );
//         return { ...form, staffList: updatedStaff };
//       })
//     );
//     setErrors((prev) => {
//       if (!Array.isArray(prev)) return prev;
//       const idx = forms.findIndex((f) => f.id === id);
//       if (idx === -1) return prev;
//       const updated = [...prev];
//       const formErr = { ...(updated[idx] || {}) };
//       if (formErr.staffList) {
//         const staffErrs = [...formErr.staffList];
//         staffErrs[staffIndex] = { ...(staffErrs[staffIndex] || {}), [field]: "" };
//         formErr.staffList = staffErrs;
//       }
//       updated[idx] = formErr;
//       return updated;
//     });
//   };

//   const handleMultiToggle = (id, field, option) => {
//     setForms((prev) =>
//       prev.map((form) => {
//         if (form.id !== id) return form;
//         const current = form[field] || [];
//         const exists = current.includes(option);
//         return {
//           ...form,
//           [field]: exists ? current.filter((v) => v !== option) : [...current, option],
//         };
//       })
//     );
//     setErrors((prev) => {
//       if (!Array.isArray(prev)) return prev;
//       const idx = forms.findIndex((f) => f.id === id);
//       if (idx === -1) return prev;
//       const updated = [...prev];
//       updated[idx] = { ...(updated[idx] || {}), [field]: "" };
//       return updated;
//     });
//   };

//   const handleAdd = () => setForms((prev) => [...prev, createForm()]);

//   // ── Delete handlers ─────────────────────────────────────────────────────────
//   const requestDeleteForm = (id) => setDeleteTarget({ type: "form", formId: id });
//   const requestDeleteStaff = (formId, staffIndex) =>
//     setDeleteTarget({ type: "staff", formId, staffIndex });

//   const handleConfirmDelete = () => {
//     if (!deleteTarget) return;
//     if (deleteTarget.type === "form") {
//       setForms((prev) => prev.filter((form) => form.id !== deleteTarget.formId));
//     } else if (deleteTarget.type === "staff") {
//       const { formId, staffIndex } = deleteTarget;
//       setForms((prev) =>
//         prev.map((form) => {
//           if (form.id !== formId) return form;
//           const updatedStaff = form.staffList.filter((_, i) => i !== staffIndex);
//           return {
//             ...form,
//             staffList: updatedStaff,
//             internalCount: String(updatedStaff.length),
//           };
//         })
//       );
//     }
//     setDeleteTarget(null);
//   };

//   const handleCancelDelete = () => setDeleteTarget(null);

//   const getError = (id, field) => {
//     if (!Array.isArray(errors)) return "";
//     const idx = forms.findIndex((f) => f.id === id);
//     return errors[idx]?.[field] || "";
//   };

//   const getStaffError = (id, staffIndex, field) => {
//     if (!Array.isArray(errors)) return "";
//     const idx = forms.findIndex((f) => f.id === id);
//     return errors[idx]?.staffList?.[staffIndex]?.[field] || "";
//   };

//   // ─── Build payload matching backend schema exactly ────────────────────────
//   const buildPayload = (latest) => {
//     return {
//       refreshmentDetails: {
//         refreshments: latest.map((form) => {
//           const foodTypesPayload = (form.foodTypes || []).map((type) => {
//             // Only Breakfast, Lunch, Dinner get detailed counts
//             if (MEAL_SECTIONS.includes(type)) {
//               const mealData = form[type.toLowerCase()] || {};
//               return {
//                 type,
//                 participants: {
//                   vegCount: parseInt(mealData.vegParticipants) || 0,
//                   nonVegCount: parseInt(mealData.nonVegParticipants) || 0,
//                 },
//                 vipGuests: {
//                   vegCount: parseInt(mealData.vegGuest) || 0,
//                   nonVegCount: parseInt(mealData.nonVegGuest) || 0,
//                 },
//               };
//             }
//             // Tea / Morning Refreshment / Evening Refreshment — zero counts
//             return {
//               type,
//               participants: { vegCount: 0, nonVegCount: 0 },
//               vipGuests: { vegCount: 0, nonVegCount: 0 },
//             };
//           });

//           const pad = (n) => String(n).padStart(2, "0");
//           const d = form.date;
//           return {
//             date: d ? `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T00:00:00.000Z` : "",
//             // FIX: send the exact strings the user selected — must match backend enum
//             resourcePersonType: form.resourcePersonType || [],
//             numberOfResourcePersons: parseInt(form.resourcePersons) || 0,
//             numberOfInternalAccompanyingStaff: parseInt(form.internalCount) || 0,
//             accompanyingStaff: (form.staffList || []).map((s) => ({
//               name: s.name || "",
//               // FIX: backend expects number, not string
//               mobile: s.mobile?.trim() || "",
//             })),
//             foodTypes: foodTypesPayload,
//             specialRequirements: form.specialRequirements || "",
//           };
//         }),
//       },
//     };
//   };

//   const handleNext = useCallback(async () => {
//     const latest = formsRef.current;
//     const errs = validateFoodForms(latest);
//     const hasErrors = !Array.isArray(errs)
//       ? Object.keys(errs).length > 0
//       : errs.some((e) => Object.keys(e).length > 0);
//     if (hasErrors) { setErrors(errs); return; }
//     setErrors({});
//     setIsLoading(true);
//     setApiError("");
//     try {
//       const payload = buildPayload(latest);
//       console.log("food payload:", JSON.stringify(payload, null, 2));

//       // ── Send as multipart/form-data (same as Postman test) ──────────────
//       // The backend uses deepParse(req.body[key]) which expects each field
//       // to be a JSON-stringified string, NOT a pre-parsed JSON body.
//       // Sending application/json causes the controller to receive an already-
//       // parsed object and behave differently, causing the 500 error.
//       const fd = new FormData();
//       Object.entries(payload).forEach(([key, value]) => {
//         fd.append(key, typeof value === "string" ? value : JSON.stringify(value));
//       });

//       // const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
//       //   method: "PUT",
//       //   headers: {
//       //     // Do NOT set Content-Type here — browser sets it automatically
//       //     // with the correct multipart boundary when using FormData.
//       //     Authorization: `Bearer ${localStorage.getItem("token")}`,
//       //   },
//       //   body: fd,
//       // });
//       const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify(payload),  // payload = { refreshmentDetails: { refreshments: [...] } }
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         const msg = data.message || data.error || `Server error: ${response.status}`;
//         console.error("Server error details:", data);
//         throw new Error(msg);
//       }
//       nextStep();
//     } catch (err) {
//       setApiError(err.message || "Failed to save food details. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [eventId, nextStep]);

//   const handleBack = useCallback(() => { if (prevStep) prevStep(); }, [prevStep]);

//   const navRef = useRef({ next: handleNext, prev: handleBack, isLoading });
//   useEffect(() => { navRef.current = { next: handleNext, prev: handleBack, isLoading }; });

//   useEffect(() => {
//     if (!registerChildNavigation) return;
//     const stableNext = (...args) => navRef.current.next(...args);
//     const stablePrev = (...args) => navRef.current.prev(...args);
//     registerChildNavigation({ next: stableNext, prev: stablePrev, isLoading: false });
//     return () => registerChildNavigation({ next: null, prev: null, isLoading: false });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [registerChildNavigation]);

//   useEffect(() => {
//     if (!registerChildNavigation) return;
//     registerChildNavigation({ next: navRef.current.next, prev: navRef.current.prev, isLoading });
//   }, [isLoading, registerChildNavigation]);

//   return (
//     <div className="w-full">
//       {/* Delete confirmation popup */}
//       {deleteTarget && (
//         <DeleteConfirmPopup
//           onConfirm={handleConfirmDelete}
//           onCancel={handleCancelDelete}
//         />
//       )}

//       {apiError && (
//         <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 mb-4">
//           <p className="text-red-400 text-sm">{apiError}</p>
//         </div>
//       )}

//       {/* Top-level Add button */}
//       <div className="flex justify-end mb-4">
//         <button
//           type="button"
//           onClick={handleAdd}
//           className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
//         >
//           <Plus size={16} />
//           Add
//         </button>
//       </div>

//       {forms.map((form, index) => (
//         <div
//           key={form.id}
//           className="relative bg-[#1f1f38] border border-[#32325a] rounded-2xl mb-6 overflow-visible"
//         >
//           {/* Delete button for all cards except the first */}
//           {index !== 0 && (
//             <div className="flex justify-end pt-4 pr-4">
//               <button
//                 type="button"
//                 onClick={() => requestDeleteForm(form.id)}
//                 className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-full transition-all"
//               >
//                 <Trash2 size={18} />
//               </button>
//             </div>
//           )}

//           <div className={`p-5 grid grid-cols-1 md:grid-cols-2 gap-5 ${index !== 0 ? "pt-2" : ""}`}>

//             {/* Row 1: Date + Resource Person Type */}
//             <div className="w-full">
//               <div className="relative">
//                 <label className="absolute -top-2 left-3 z-10 bg-[#1f1f38] px-2 text-xs text-white pointer-events-none">
//                   Select Date *
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => datePickerRefs.current[form.id]?.setOpen(true)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-purple-400 transition-colors focus:outline-none"
//                   tabIndex={-1}
//                 >
//                   <Calendar size={18} />
//                 </button>
//                 <DatePicker
//                   ref={(el) => { datePickerRefs.current[form.id] = el; }}
//                   selected={form.date}
//                   onChange={(date) => handleChange(form.id, "date", date)}
//                   dateFormat="dd/MM/yyyy"
//                   shouldCloseOnSelect
//                   popperPlacement="bottom-start"
//                   popperClassName="food-datepicker-popper"
//                   popperProps={{ strategy: "fixed" }}
//                   className="w-full h-[52px] px-4 pr-10 rounded-xl border border-[#3d3d68] text-white outline-none cursor-pointer focus:border-purple-500 bg-transparent"
//                   wrapperClassName="w-full"
//                   calendarClassName="food-dark-cal"
//                 />
//               </div>
//               {getError(form.id, "date") && (
//                 <p className="text-red-400 text-xs mt-1">{getError(form.id, "date")}</p>
//               )}
//             </div>

//             <div>
//               {/* FIX: options now include "Guest Speaker" and "Faculty" to match backend */}
//               <MultiSelect
//                 label="Type of Resource Person *"
//                 options={RESOURCE_OPTIONS}
//                 selected={form.resourcePersonType}
//                 onToggle={(opt) => handleMultiToggle(form.id, "resourcePersonType", opt)}
//                 labelBg="#1f1f38"
//               />
//               {getError(form.id, "resourcePersonType") && (
//                 <p className="text-red-400 text-xs mt-1">
//                   {getError(form.id, "resourcePersonType")}
//                 </p>
//               )}
//             </div>

//             {/* Row 2: Resource Persons + Internal Count */}
//             <div>
//               <CustomInput
//                 label="Total number of Resource Persons *"
//                 labelBg="#1f1f38"
//                 value={form.resourcePersons}
//                 onChange={(e) => handleChange(form.id, "resourcePersons", e.target.value)}
//                 type="number"
//               />
//               {getError(form.id, "resourcePersons") && (
//                 <p className="text-red-400 text-xs mt-1">
//                   {getError(form.id, "resourcePersons")}
//                 </p>
//               )}
//             </div>

//             <div>
//               <CustomInput
//                 label="Total number of Internal Accompanying Persons *"
//                 labelBg="#1f1f38"
//                 value={form.internalCount}
//                 onChange={(e) => handleChange(form.id, "internalCount", e.target.value)}
//                 type="number"
//               />
//               {getError(form.id, "internalCount") && (
//                 <p className="text-red-400 text-xs mt-1">
//                   {getError(form.id, "internalCount")}
//                 </p>
//               )}
//             </div>

//             {/* Dynamic Staff Containers */}
//             {(form.staffList || []).length > 0 && (
//               <div className="col-span-1 md:col-span-2 grid grid-cols-1 gap-4">
//                 {(form.staffList || []).map((staff, staffIndex) => (
//                   <div
//                     key={staffIndex}
//                     className="bg-[#2a2a4a] border border-[#3b3b66] rounded-2xl p-5"
//                   >
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-purple-400 font-semibold text-sm">
//                         Staff {staffIndex + 1}
//                       </h3>
//                       <button
//                         type="button"
//                         onClick={() => requestDeleteStaff(form.id, staffIndex)}
//                         className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-full transition-all"
//                         title="Delete staff"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <CustomInput
//                           label={`Staff ${staffIndex + 1} Name *`}
//                           labelBg="#2a2a4a"
//                           value={staff.name}
//                           onChange={(e) =>
//                             handleStaffChange(form.id, staffIndex, "name", e.target.value)
//                           }
//                         />
//                         {getStaffError(form.id, staffIndex, "name") && (
//                           <p className="text-red-400 text-xs mt-1">
//                             {getStaffError(form.id, staffIndex, "name")}
//                           </p>
//                         )}
//                       </div>
//                       <div>
//                         <CustomInput
//                           label={`Staff ${staffIndex + 1} Mobile Number *`}
//                           labelBg="#2a2a4a"
//                           value={staff.mobile}
//                           onChange={(e) =>
//                             handleStaffChange(form.id, staffIndex, "mobile", e.target.value)
//                           }
//                           type="number"
//                         />
//                         {getStaffError(form.id, staffIndex, "mobile") && (
//                           <p className="text-red-400 text-xs mt-1">
//                             {getStaffError(form.id, staffIndex, "mobile")}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Food Type multi-select */}
//             {/* FIX: options now include "Tea" to match backend accepted values */}
//             <div className="col-span-1 md:col-span-2">
//               <MultiSelect
//                 label="Food Type *"
//                 options={FOOD_TYPE_OPTIONS}
//                 selected={form.foodTypes}
//                 onToggle={(opt) => handleMultiToggle(form.id, "foodTypes", opt)}
//                 labelBg="#1f1f38"
//               />
//               {getError(form.id, "foodTypes") && (
//                 <p className="text-red-400 text-xs mt-1">{getError(form.id, "foodTypes")}</p>
//               )}
//             </div>

//             {/* Conditional Meal Sections — only for Breakfast, Lunch, Dinner */}
//             {MEAL_SECTIONS.map((meal) =>
//               form.foodTypes.includes(meal) ? (
//                 <MealSection
//                   key={meal}
//                   title={meal}
//                   data={form[meal.toLowerCase()]}
//                   onChange={(field, value) =>
//                     handleChange(form.id, field, value, meal.toLowerCase())
//                   }
//                   labelBg="#2a2a4a"
//                 />
//               ) : null
//             )}

//             {/* Special Requirements */}
//             <div className="col-span-1 md:col-span-2">
//               <div className="relative">
//                 <label className="absolute -top-2 left-3 z-10 bg-[#1f1f38] px-2 text-xs text-white">
//                   Special Requirements, If any
//                 </label>
//                 <textarea
//                   rows={4}
//                   value={form.specialRequirements}
//                   onChange={(e) =>
//                     handleChange(form.id, "specialRequirements", e.target.value)
//                   }
//                   className="w-full rounded-xl bg-transparent border border-[#3d3d68] px-4 py-4 text-white placeholder:text-gray-400 outline-none resize-none focus:border-purple-500"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }