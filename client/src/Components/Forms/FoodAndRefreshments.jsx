import React, {
  useState,
  forwardRef,
  memo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import DatePicker from "react-datepicker";
import { CalendarDays, Trash2, Plus } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";

const BASE_URL = "https://sece-events.onrender.com";

// ─── DateInput ───────────────────────────────────────────────────────────────
const DateInput = forwardRef(({ value, onClick, label }, ref) => (
  <div className="relative w-full">
    <label className="absolute -top-2 left-3 z-10 bg-[#1f1f38] px-2 text-xs text-white">
      {label}
    </label>
    <input
      ref={ref}
      value={value || ""}
      readOnly
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      className="w-full h-[52px] px-4 pr-12 rounded-xl border border-[#3d3d68] text-white outline-none cursor-pointer focus:border-purple-500 bg-transparent"
    />
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
    >
      <CalendarDays size={18} />
    </div>
  </div>
));
DateInput.displayName = "DateInput";

// ─── Multi-select for resource person type ───────────────────────────────────
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
    selected.length === 0
      ? options.join(" / ")
      : selected.join(", ");

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
        <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto">
          {options.map((opt, i) => {
            const isSelected = selected.includes(opt);
            return (
              <div
                key={i}
                onClick={() => onToggle(opt)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-purple-600/20 text-white"
                    : "text-white hover:bg-purple-500/20"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-purple-600 border-purple-600"
                      : "border-gray-500"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
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
                {opt}
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

// ─── Empty form factory ───────────────────────────────────────────────────────
function createForm() {
  return {
    id: crypto.randomUUID(),
    date: null,
    resourcePersonType: [],   // multi-select
    resourcePersons: "",
    internalCount: "",
    staffName: "",
    mobileNumber: "",
    foodTypes: [],            // multi-select: ["Breakfast","Lunch","Dinner","Morning Refreshment","Evening Refreshment"]
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
    if (!form.staffName?.trim()) err.staffName = "Staff name is required";
    if (!form.mobileNumber?.trim()) err.mobileNumber = "Staff mobile is required";
    if (!form.foodTypes || form.foodTypes.length === 0)
      err.foodTypes = "Food type is required";
    return err;
  });
  if (errors.some((e) => Object.keys(e).length > 0)) return errors;
  return {};
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
  const [forms, setForms] = useState(() =>
    initialFoodData && initialFoodData.length > 0 ? initialFoodData : [createForm()]
  );
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const formsRef = useRef(forms);
  useEffect(() => { formsRef.current = forms; }, [forms]);

  const onChangeRef = useRef(onFoodDataChange);
  useEffect(() => { onChangeRef.current = onFoodDataChange; }, [onFoodDataChange]);
  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current(forms);
  }, [forms]);

  // Generic field change
  const handleChange = (id, field, value, section = null) => {
    setForms((prev) =>
      prev.map((form) => {
        if (form.id !== id) return form;
        if (section) return { ...form, [section]: { ...form[section], [field]: value } };
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

  // Multi-select toggle helper
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
  const handleDelete = (id) => setForms((prev) => prev.filter((form) => form.id !== id));

  const getError = (id, field) => {
    if (!Array.isArray(errors)) return "";
    const idx = forms.findIndex((f) => f.id === id);
    return errors[idx]?.[field] || "";
  };

  // ─── Build payload per backend shape ───────────────────────────────────────
  const buildPayload = (latest) => {
    return {
      refreshmentDetails: {
        refreshments: latest.map((form) => {
          // Build foodTypes array dynamically from selections
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
            // Refreshment types (no veg/nonveg breakdown)
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
            accompanyingStaff: [
              {
                name: form.staffName || "",
                mobile: parseInt(form.mobileNumber) || 0,
              },
            ],
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
          {/* Delete button for duplicated forms */}
          {index !== 0 && (
            <button
              type="button"
              onClick={() => handleDelete(form.id)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors z-10"
            >
              <Trash2 size={16} />
            </button>
          )}

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Row 1: Date + Resource Person Type (multi-select) */}
            <div className="w-full">
              <DatePicker
                selected={form.date}
                onChange={(date) => handleChange(form.id, "date", date)}
                dateFormat="dd/MM/yyyy"
                shouldCloseOnSelect
                popperPlacement="bottom-start"
                withPortal={false}
                customInput={<DateInput label="Select Date *" />}
              />
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

            {/* Row 3: Staff Name + Mobile */}
            <div>
              <CustomInput
                label="Internal Accompanying Staff Name *"
                labelBg="#1f1f38"
                value={form.staffName}
                onChange={(e) => handleChange(form.id, "staffName", e.target.value)}
              />
              {getError(form.id, "staffName") && (
                <p className="text-red-400 text-xs mt-1">{getError(form.id, "staffName")}</p>
              )}
            </div>

            <div>
              <CustomInput
                label="Internal Accompanying Staff Mobile Number *"
                labelBg="#1f1f38"
                value={form.mobileNumber}
                onChange={(e) => handleChange(form.id, "mobileNumber", e.target.value)}
                type="number"
              />
              {getError(form.id, "mobileNumber") && (
                <p className="text-red-400 text-xs mt-1">
                  {getError(form.id, "mobileNumber")}
                </p>
              )}
            </div>

            {/* Row 4: Food Type multi-select (full width) */}
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

            {/* Conditional Meal Sections: show only if selected */}
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

            {/* Special Requirements */}
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
                  className="w-full rounded-xl bg-[#232347] border border-[#3d3d68] px-4 py-4 text-white placeholder:text-gray-400 outline-none resize-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}