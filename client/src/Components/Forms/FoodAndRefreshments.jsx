import React, { useState, forwardRef, memo, useRef, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays, Trash2 } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";

const BASE_URL = "https://sece-events.onrender.com";

const DateInput = forwardRef(({ value, onClick, label }, ref) => (
  <div className="relative w-full">
    <label className="absolute -top-2 left-3 z-10 bg-[#1f1f38] px-2 text-xs text-white">
      {label}
    </label>
    <input
      ref={ref}
      value={value || ""}
      readOnly
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onClick) onClick(e); }}
      className="w-full h-[52px] px-4 pr-12 rounded-xl border border-[#3d3d68] text-white outline-none cursor-pointer focus:border-purple-500 bg-transparent"
    />
    <div
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onClick) onClick(e); }}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
    >
      <CalendarDays size={18} />
    </div>
  </div>
));
DateInput.displayName = "DateInput";

function createForm() {
  return {
    id: crypto.randomUUID(),
    date: null,
    resourceType: "",
    resourcePersons: "",
    internalCount: "",
    staffName: "",
    mobileNumber: "",
    foodType: "",
    specialRequirements: "",
    breakfast: { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
    lunch: { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
    dinner: { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
  };
}

function validateFoodForms(forms) {
  if (!forms || forms.length === 0) return { _global: "Enter at least one food entry" };
  const errors = forms.map((form) => {
    const err = {};
    if (!form.date) err.date = "Date is required";
    if (!form.resourceType) err.resourceType = "Resource type is required";
    if (!form.resourcePersons?.trim()) err.resourcePersons = "Resource count is required";
    if (!form.internalCount?.trim()) err.internalCount = "Internal count is required";
    if (!form.staffName?.trim()) err.staffName = "Staff name is required";
    if (!form.mobileNumber?.trim()) err.mobileNumber = "Staff mobile is required";
    if (!form.foodType) err.foodType = "Food type is required";
    return err;
  });
  if (errors.some((e) => Object.keys(e).length > 0)) return errors;
  return {};
}

const Meal = memo(function Meal({ title, data, onChange, labelBg = "#1f1f38" }) {
  return (
    <div className="col-span-1 md:col-span-2 bg-[#2a2a4a] border border-[#3b3b66] rounded-2xl p-5">
      <h2 className="text-purple-400 font-semibold text-lg mb-5">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ["vegParticipants", "Veg Participants"],
          ["vegGuest", "Veg Guest"],
          ["nonVegParticipants", "Non-Veg Participants"],
          ["nonVegGuest", "Non-Veg Guest"],
        ].map(([field, label]) => (
          <CustomInput
            key={field}
            label={label}
            labelBg={labelBg}
            value={data[field]}
            onChange={(e) => onChange(field, e.target.value)}
          />
        ))}
      </div>
    </div>
  );
});

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

  // Always-fresh ref for handleNext
  const formsRef = useRef(forms);
  useEffect(() => { formsRef.current = forms; }, [forms]);

  // Sync to parent
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
        return { ...form, [field]: value };
      })
    );
    // Clear error for this field
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
      const payload = {
        foodDetails: {
          foodRequirements: latest.map((form) => ({
            date: form.date ? form.date.toISOString() : "",
            resourcePersonType: form.resourceType || "",
            totalResourcePersons: parseInt(form.resourcePersons) || 0,
            totalInternalPersons: parseInt(form.internalCount) || 0,
            internalStaffName: form.staffName || "",
            internalStaffMobile: form.mobileNumber || "",
            foodType: form.foodType || "",
            specialRequirements: form.specialRequirements || "",
            breakfast: form.breakfast,
            lunch: form.lunch,
            dinner: form.dinner,
          })),
        },
      };
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

  return (
    <div className="w-full">
      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      {forms.map((form, index) => (
        <div
          key={form.id}
          className="bg-[#1f1f38] border border-[#32325a] rounded-2xl mb-6 overflow-visible"
        >
          <div className="flex justify-end p-5 pb-0">
            {index === 0 ? (
              <button
                type="button"
                onClick={handleAdd}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all"
              >
                + Add
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleDelete(form.id)}
                className="w-10 h-10 rounded-full bg-[#ffd9d9] text-red-500 flex items-center justify-center"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Date */}
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
              <CustomSelect
                label="Type of Resource Person *"
                value={form.resourceType}
                onChange={(val) => handleChange(form.id, "resourceType", val)}
                options={["VIP", "Trainer", "Placement"]}
              />
              {getError(form.id, "resourceType") && (
                <p className="text-red-400 text-xs mt-1">{getError(form.id, "resourceType")}</p>
              )}
            </div>

            <div>
              <CustomInput
                label="Total number of Resource Persons *"
                value={form.resourcePersons}
                onChange={(e) => handleChange(form.id, "resourcePersons", e.target.value)}
                type="number"
              />
              {getError(form.id, "resourcePersons") && (
                <p className="text-red-400 text-xs mt-1">{getError(form.id, "resourcePersons")}</p>
              )}
            </div>

            <div>
              <CustomInput
                label="Total number of Internal Accompanying Persons *"
                value={form.internalCount}
                onChange={(e) => handleChange(form.id, "internalCount", e.target.value)}
                type="number"
              />
              {getError(form.id, "internalCount") && (
                <p className="text-red-400 text-xs mt-1">{getError(form.id, "internalCount")}</p>
              )}
            </div>

            <div>
              <CustomInput
                label="Internal Accompanying Staff Name *"
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
                value={form.mobileNumber}
                onChange={(e) => handleChange(form.id, "mobileNumber", e.target.value)}
                type="number"
              />
              {getError(form.id, "mobileNumber") && (
                <p className="text-red-400 text-xs mt-1">{getError(form.id, "mobileNumber")}</p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <CustomSelect
                label="Food Type *"
                value={form.foodType}
                onChange={(val) => handleChange(form.id, "foodType", val)}
                options={["Breakfast", "Lunch", "Dinner", "Morning Refreshment", "Evening Refreshment"]}
              />
              {getError(form.id, "foodType") && (
                <p className="text-red-400 text-xs mt-1">{getError(form.id, "foodType")}</p>
              )}
            </div>

            <Meal
              title="Breakfast"
              data={form.breakfast}
              onChange={(field, value) => handleChange(form.id, field, value, "breakfast")}
            />
            <Meal
              title="Lunch"
              data={form.lunch}
              onChange={(field, value) => handleChange(form.id, field, value, "lunch")}
            />
            <Meal
              title="Dinner"
              data={form.dinner}
              onChange={(field, value) => handleChange(form.id, field, value, "dinner")}
            />

            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <label className="absolute -top-2 left-3 z-10 bg-[#1f1f38] px-2 text-xs text-white">
                  Special Requirements, If any
                </label>
                <textarea
                  rows={4}
                  value={form.specialRequirements}
                  onChange={(e) => handleChange(form.id, "specialRequirements", e.target.value)}
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