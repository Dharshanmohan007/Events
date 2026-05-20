import React, { useState, useRef, useEffect, useCallback } from "react";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";
import { DayTimeline } from "./VenueForm";

const BASE_URL = "https://sece-events.onrender.com";

const REQUIREMENT_OPTIONS   = ["Certificate", "Id Card"];
const PERSON_OPTIONS        = ["Students", "Guest", "Both"];
const GIFT_TYPE_OPTIONS     = ["Trophy", "Cash Prize", "Voucher"];
const TROPHY_TYPE_OPTIONS   = ["Basic", "Elite"];
const VOUCHER_WORTH_OPTIONS = ["₹ 500", "₹ 1000", "₹ 2000", "₹ 5000", "₹ 10000"];

const ErrorMsg = ({ msg }) =>
  msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

// ── Empty day factory ─────────────────────────────────────────────────────────

function emptyPurchaseDay() {
  return {
    requirementNeeded: [],
    idCardQty: "",
    certificateQty: "",
    selectedPersons: "",
    studentData: {
      giftType: [],
      registrationKitNeeded: "",
      trophyType: [],
      basicTrophyQty: "",
      eliteTrophyQty: "",
      cashPrizeAmount: "",
      voucherWorth: "",
      registrationKitQty: "",
      specialRequirements: "",
    },
    guestData: {
      giftType: [],
      registrationKitNeeded: "",
      trophyType: [],
      basicTrophyQty: "",
      eliteTrophyQty: "",
      cashPrizeAmount: "",
      voucherWorth: "",
      registrationKitQty: "",
      specialRequirements: "",
    },
  };
}

// ── Payload builder ───────────────────────────────────────────────────────────

function buildPurchasePayload(dayData) {
  const purchases = dayData.map((day, dayIndex) => {
    const requirementNeeded = [];
    if (day.requirementNeeded?.includes("Id Card"))
      requirementNeeded.push({ type: "Id Card", hardCount: parseInt(day.idCardQty) || 0, softCount: 0 });
    if (day.requirementNeeded?.includes("Certificate"))
      requirementNeeded.push({ type: "Certificate", hardCount: parseInt(day.certificateQty) || 0, softCount: 0 });

    const requiredFor = [];
    if (day.selectedPersons === "Students" || day.selectedPersons === "Both") requiredFor.push("Students");
    if (day.selectedPersons === "Guest"    || day.selectedPersons === "Both") requiredFor.push("Guest");

    const buildPersonData = (personData = {}) => {
      const giftItems = [];
      if (personData.giftType?.includes("Trophy")) {
        giftItems.push({
          type: "Trophy",
          trophyTypes: personData.trophyType || [],
          basicQty: parseInt(personData.basicTrophyQty) || 0,
          eliteQty: parseInt(personData.eliteTrophyQty) || 0,
        });
      }
      if (personData.giftType?.includes("Cash Prize"))
        giftItems.push({ type: "Cash Prize", amount: parseInt(personData.cashPrizeAmount) || 0 });
      if (personData.giftType?.includes("Voucher"))
        giftItems.push({ type: "Voucher", worth: personData.voucherWorth || "" });
      return {
        registrationKitNeeded: personData.registrationKitNeeded === "Yes",
        registrationKitQty: parseInt(personData.registrationKitQty) || 0,
        specialRequirements: personData.specialRequirements || "",
        giftItems,
      };
    };

    return {
      dayIndex,
      requirementNeeded,
      requiredFor,
      students: buildPersonData(day.studentData),
      guests:   buildPersonData(day.guestData),
    };
  });

  return { purchases };
}

// ── MultiSelect ───────────────────────────────────────────────────────────────

function MultiSelect({ label, options, selected, onChange, error, labelBg = "#16162A" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (item) =>
    onChange(selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]);

  return (
    <div className="w-full" ref={ref}>
      <div className="relative w-full">
        <span
          className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
          style={{ backgroundColor: labelBg }}
        >
          {label}
        </span>
        <div
          onClick={() => setOpen(!open)}
          className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${
            open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"
          }`}
        >
          <span className={`text-sm truncate max-w-[85%] ${selected.length ? "text-white" : "text-gray-500"}`}>
            {selected.length ? selected.join(" / ") : "Select..."}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
            {options.map((item, i) => {
              const isSelected = selected.includes(item);
              return (
                <div
                  key={i}
                  onClick={() => toggle(item)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"
                  }`}
                >
                  <span>{item}</span>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function TrophyTypeSelect({ label, selected, onChange, error, labelBg = "#1E1E35" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (item) =>
    onChange(selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]);

  return (
    <div className="w-full" ref={ref}>
      <div className="relative w-full">
        <span
          className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
          style={{ backgroundColor: labelBg }}
        >
          {label}
        </span>
        <div
          onClick={() => setOpen(!open)}
          className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${
            open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"
          }`}
        >
          <span className={`text-sm truncate max-w-[85%] ${selected.length ? "text-white" : "text-gray-500"}`}>
            {selected.length ? selected.join(" / ") : "Select..."}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
            {TROPHY_TYPE_OPTIONS.map((item, i) => {
              const isSelected = selected.includes(item);
              return (
                <div
                  key={i}
                  onClick={() => toggle(item)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"
                  }`}
                >
                  <span>{item}</span>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Validation ────────────────────────────────────────────────────────────────

function validatePersonCard(data) {
  const e = {};
  if (!data.giftType || data.giftType.length === 0) e.giftType = "Gift type is required";
  if (!data.registrationKitNeeded) e.registrationKitNeeded = "This field is required";
  if (data.giftType?.includes("Trophy")) {
    if (!data.trophyType || data.trophyType.length === 0) e.trophyType = "Trophy type is required";
    if (data.trophyType?.includes("Basic") && !data.basicTrophyQty?.trim()) e.basicTrophyQty = "Basic trophy quantity is required";
    if (data.trophyType?.includes("Elite") && !data.eliteTrophyQty?.trim()) e.eliteTrophyQty = "Elite trophy quantity is required";
  }
  if (data.giftType?.includes("Cash Prize") && !data.cashPrizeAmount?.trim()) e.cashPrizeAmount = "Cash prize amount is required";
  if (data.giftType?.includes("Voucher") && !data.voucherWorth) e.voucherWorth = "Voucher worth is required";
  if (data.registrationKitNeeded === "Yes" && !data.registrationKitQty?.trim()) e.registrationKitQty = "Registration kit quantity is required";
  return e;
}

function validateDay(data) {
  const e = {};
  if (!data.requirementNeeded || data.requirementNeeded.length === 0)
    e.requirementNeeded = "Select at least one requirement";
  if (data.requirementNeeded?.includes("Id Card") && !data.idCardQty?.trim())
    e.idCardQty = "ID Card quantity is required";
  if (data.requirementNeeded?.includes("Certificate") && !data.certificateQty?.trim())
    e.certificateQty = "Certificate quantity is required";
  if (!data.selectedPersons)
    e.selectedPersons = "Please select required persons";
  if (data.selectedPersons === "Students" || data.selectedPersons === "Both") {
    const se = validatePersonCard(data.studentData || {});
    if (Object.keys(se).length > 0) e.studentData = se;
  }
  if (data.selectedPersons === "Guest" || data.selectedPersons === "Both") {
    const ge = validatePersonCard(data.guestData || {});
    if (Object.keys(ge).length > 0) e.guestData = ge;
  }
  return e;
}

// ── PersonCard ────────────────────────────────────────────────────────────────

function PersonCard({ title, data, onChange, errors = {} }) {
  const update      = (field) => (val) => onChange({ ...data, [field]: val });
  const updateInput = (field) => (e)   => onChange({ ...data, [field]: e.target.value });

  const hasTrophy  = data.giftType?.includes("Trophy");
  const hasCash    = data.giftType?.includes("Cash Prize");
  const hasVoucher = data.giftType?.includes("Voucher");
  const showBasic  = data.trophyType?.includes("Basic");
  const showElite  = data.trophyType?.includes("Elite");

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      <h3 className="text-purple-400 text-base font-semibold">{title}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <MultiSelect
            labelBg="#1E1E35"
            label="Gift Type *"
            options={GIFT_TYPE_OPTIONS}
            selected={data.giftType || []}
            onChange={(val) => {
              const updated = { ...data, giftType: val };
              if (!val.includes("Trophy"))     { updated.trophyType = []; updated.basicTrophyQty = ""; updated.eliteTrophyQty = ""; }
              if (!val.includes("Cash Prize"))  updated.cashPrizeAmount = "";
              if (!val.includes("Voucher"))     updated.voucherWorth = "";
              onChange(updated);
            }}
            error={errors.giftType}
          />
        </div>
        <div>
          <CustomSelect
            labelBg="#1E1E35"
            label="Registration Kit Needed *"
            value={data.registrationKitNeeded || ""}
            onChange={(val) => onChange({ ...data, registrationKitNeeded: val, registrationKitQty: "" })}
            options={["Yes", "No"]}
          />
          {errors.registrationKitNeeded && <ErrorMsg msg={errors.registrationKitNeeded} />}
        </div>
      </div>

      {hasTrophy && (
        <div>
          <TrophyTypeSelect
            label="Type of Trophy Wanted *"
            selected={data.trophyType || []}
            onChange={(val) => {
              const updated = { ...data, trophyType: val };
              if (!val.includes("Basic")) updated.basicTrophyQty = "";
              if (!val.includes("Elite")) updated.eliteTrophyQty = "";
              onChange(updated);
            }}
            error={errors.trophyType}
          />
        </div>
      )}

      {hasTrophy && (showBasic || showElite) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showBasic && (
            <div>
              <CustomInput labelBg="#1E1E35" label="Basic Trophy Quantity *" type="number"
                value={data.basicTrophyQty || ""} onChange={updateInput("basicTrophyQty")} />
              <ErrorMsg msg={errors.basicTrophyQty} />
            </div>
          )}
          {showElite && (
            <div>
              <CustomInput labelBg="#1E1E35" label="Elite Trophy Quantity *" type="number"
                value={data.eliteTrophyQty || ""} onChange={updateInput("eliteTrophyQty")} />
              <ErrorMsg msg={errors.eliteTrophyQty} />
            </div>
          )}
        </div>
      )}

      {hasCash && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomInput labelBg="#1E1E35" label="Cash Prize Amount *" type="number"
              value={data.cashPrizeAmount || ""} onChange={updateInput("cashPrizeAmount")} />
            <ErrorMsg msg={errors.cashPrizeAmount} />
          </div>
          {hasVoucher && (
            <div>
              <CustomSelect labelBg="#1E1E35" label="Voucher worth *" value={data.voucherWorth || ""}
                onChange={update("voucherWorth")} options={VOUCHER_WORTH_OPTIONS} />
              {errors.voucherWorth && <ErrorMsg msg={errors.voucherWorth} />}
            </div>
          )}
        </div>
      )}

      {hasVoucher && !hasCash && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomSelect labelBg="#1E1E35" label="Voucher worth *" value={data.voucherWorth || ""}
              onChange={update("voucherWorth")} options={VOUCHER_WORTH_OPTIONS} />
            {errors.voucherWorth && <ErrorMsg msg={errors.voucherWorth} />}
          </div>
        </div>
      )}

      {data.registrationKitNeeded === "Yes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomInput labelBg="#1E1E35" label="Registration Kit Quantity *" type="number"
              value={data.registrationKitQty || ""} onChange={updateInput("registrationKitQty")} />
            <ErrorMsg msg={errors.registrationKitQty} />
          </div>
        </div>
      )}

      <div className="relative w-full">
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
          Special Requirements, if any
        </span>
        <textarea
          value={data.specialRequirements || ""}
          onChange={updateInput("specialRequirements")}
          rows={3}
          placeholder="Enter any special requirements..."
          className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600"
        />
      </div>
    </div>
  );
}

// ── Main Purchase ─────────────────────────────────────────────────────────────

export default function Purchase({
  nextStep,
  prevStep,
  registerChildNavigation,
  eventDays = [],
  eventId,
  purchaseData: initialPurchaseData,
  onPurchaseDataChange,
  errors: propErrors = {},
}) {
  const dayCount = eventDays.length;

  const [dayData, setDayData] = useState(() => {
    const count = Math.max(dayCount, 0);
    return Array.from({ length: count }, (_, i) =>
      initialPurchaseData?.[i] ?? emptyPurchaseDay()
    );
  });

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedDays, setCompletedDays]     = useState([]);
  const [errors, setErrors]                   = useState({});
  const [isLoading, setIsLoading]             = useState(false);
  const [apiError, setApiError]               = useState("");

  // Always-fresh refs
  const dayDataRef = useRef(dayData);
  useEffect(() => { dayDataRef.current = dayData; }, [dayData]);

  const onChangeRef = useRef(onPurchaseDataChange);
  useEffect(() => { onChangeRef.current = onPurchaseDataChange; }, [onPurchaseDataChange]);

  // Notify parent on every change
  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current(dayData);
  }, [dayData]);

  // Resize dayData when eventDays count changes
  useEffect(() => {
    if (dayCount === 0) return;
    setDayData((prev) => {
      if (prev.length === dayCount) return prev;
      return Array.from({ length: dayCount }, (_, i) => prev[i] ?? emptyPurchaseDay());
    });
  }, [dayCount]);

  // Clamp currentDayIndex
  useEffect(() => {
    if (dayCount > 0 && currentDayIndex >= dayCount) {
      setCurrentDayIndex(dayCount - 1);
    }
  }, [dayCount, currentDayIndex]);

  const isLastDay = currentDayIndex === Math.max(dayCount - 1, 0);

  const current       = dayData[currentDayIndex] ?? emptyPurchaseDay();
  const currentErrors = errors[currentDayIndex] || {};

  const showIdCard      = current.requirementNeeded?.includes("Id Card");
  const showCertificate = current.requirementNeeded?.includes("Certificate");
  const showStudent     = current.selectedPersons === "Students" || current.selectedPersons === "Both";
  const showGuest       = current.selectedPersons === "Guest"    || current.selectedPersons === "Both";

  const updateCurrent = (patch) => {
    setDayData((prev) => {
      const updated = [...prev];
      updated[currentDayIndex] = { ...(updated[currentDayIndex] ?? emptyPurchaseDay()), ...patch };
      return updated;
    });
    // Clear errors for current day when user edits
    setErrors((prev) => ({ ...prev, [currentDayIndex]: {} }));
  };

  // ── handleNext ────────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    const latestDayData  = dayDataRef.current;
    const currentDayData = latestDayData[currentDayIndex] ?? emptyPurchaseDay();
    const dayErrors      = validateDay(currentDayData);
    const hasErrors      = Object.keys(dayErrors).length > 0;
    setErrors((prev) => ({ ...prev, [currentDayIndex]: dayErrors }));
    if (hasErrors) return;

    // Mark current day completed immediately — before any async work
    setCompletedDays((prev) =>
      prev.includes(currentDayIndex) ? prev : [...prev, currentDayIndex]
    );

    if (isLastDay) {
      setIsLoading(true);
      setApiError("");
      try {
        const payload = buildPurchasePayload(latestDayData);
        const response = await fetch(`${BASE_URL}/api/events/${eventId || ""}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ purchaseDetails: payload }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || `Server error: ${response.status}`);
        nextStep();
      } catch (err) {
        setApiError(err.message || "Failed to save purchase details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors((prev) => ({ ...prev, [currentDayIndex + 1]: {} }));
      setCurrentDayIndex((prev) => prev + 1);
    }
  }, [currentDayIndex, isLastDay, eventId, nextStep]);

  // ── handleBack ────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (currentDayIndex > 0) {
      setErrors((prev) => ({ ...prev, [currentDayIndex]: {} }));
      setCurrentDayIndex((prev) => prev - 1);
    } else {
      if (prevStep) prevStep();
    }
  }, [currentDayIndex, prevStep]);

  // ── Stable nav registration ───────────────────────────────────────────────
  // navRef is updated every render so proxies registered once on mount
  // always call the latest handleNext / handleBack without re-registering.
  const navRef = useRef({ next: handleNext, prev: handleBack, isLoading });

  // Update every render — no deps needed
  navRef.current = { next: handleNext, prev: handleBack, isLoading };

  useEffect(() => {
    if (!registerChildNavigation) return;

    const stableNext = (...args) => navRef.current.next(...args);
    const stablePrev = (...args) => navRef.current.prev(...args);

    registerChildNavigation({ next: stableNext, prev: stablePrev, isLoading: false });
    return () => registerChildNavigation({ next: null, prev: null, isLoading: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerChildNavigation]); // run once on mount

  // Keep parent's loading spinner in sync without re-registering handlers
  useEffect(() => {
    if (!registerChildNavigation) return;
    registerChildNavigation({
      next: (...args) => navRef.current.next(...args),
      prev: (...args) => navRef.current.prev(...args),
      isLoading,
    });
  }, [isLoading, registerChildNavigation]);

  // Guard: no days
  if (dayCount === 0) {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
          <p className="text-gray-400 text-sm">
            No event days found. Please go back and add event days first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <DayTimeline
        days={eventDays.slice(0, dayCount)}
        currentDayIndex={currentDayIndex}
        completedDays={completedDays}
      />

      <h2 className="text-white text-lg font-bold">
        Purchase Details{dayCount > 1 ? ` – Day ${currentDayIndex + 1}` : ""}
      </h2>

      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <div>
        <MultiSelect
          label="Requirement Needed *"
          options={REQUIREMENT_OPTIONS}
          selected={current.requirementNeeded || []}
          onChange={(val) => {
            const patch = { requirementNeeded: val };
            if (!val.includes("Id Card"))     patch.idCardQty     = "";
            if (!val.includes("Certificate")) patch.certificateQty = "";
            updateCurrent(patch);
          }}
          error={currentErrors.requirementNeeded}
        />
      </div>

      {(showIdCard || showCertificate) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showIdCard && (
            <div>
              <CustomInput label="Id Card Hard Copy Quantity *" type="number"
                value={current.idCardQty || ""} onChange={(e) => updateCurrent({ idCardQty: e.target.value })} />
              <ErrorMsg msg={currentErrors.idCardQty} />
            </div>
          )}
          {showCertificate && (
            <div>
              <CustomInput label="Certificate Hard Copy Quantity *" type="number"
                value={current.certificateQty || ""} onChange={(e) => updateCurrent({ certificateQty: e.target.value })} />
              <ErrorMsg msg={currentErrors.certificateQty} />
            </div>
          )}
        </div>
      )}

      <div>
        <CustomSelect
          label="Select Required Persons *"
          value={current.selectedPersons || ""}
          onChange={(val) =>
            updateCurrent({
              selectedPersons: val,
              studentData: emptyPurchaseDay().studentData,
              guestData:   emptyPurchaseDay().guestData,
            })
          }
          options={PERSON_OPTIONS}
        />
        {currentErrors.selectedPersons && <ErrorMsg msg={currentErrors.selectedPersons} />}
      </div>

      {showStudent && (
        <PersonCard
          title="Students"
          data={current.studentData || {}}
          onChange={(updated) => updateCurrent({ studentData: updated })}
          errors={currentErrors.studentData || {}}
        />
      )}

      {showGuest && (
        <PersonCard
          title="Guest"
          data={current.guestData || {}}
          onChange={(updated) => updateCurrent({ guestData: updated })}
          errors={currentErrors.guestData || {}}
        />
      )}
    </div>
  );
}