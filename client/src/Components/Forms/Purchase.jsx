import React, { useState, useRef, useEffect } from "react";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";
import { DayTimeline } from "./VenueForm";

// ─── Constants ────────────────────────────────────────────────────────────────

const REQUIREMENT_OPTIONS = ["Certificate", "Id Card"];
const PERSON_OPTIONS = ["Students", "Guest", "Both"];
const GIFT_TYPE_OPTIONS = ["Trophy", "Cash Prize", "Voucher"];
const TROPHY_TYPE_OPTIONS = ["Basic", "Elite"];
const VOUCHER_WORTH_OPTIONS = ["₹ 500", "₹ 1000", "₹ 2000", "₹ 5000", "₹ 10000"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ErrorMsg = ({ msg }) =>
  msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

// ─── Multi-select Dropdown ────────────────────────────────────────────────────

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

  const toggle = (item) => {
    onChange(
      selected.includes(item)
        ? selected.filter((v) => v !== item)
        : [...selected, item]
    );
  };

  const displayText =
    selected.length === 0
      ? ""
      : selected.join(" / ");

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
            {displayText || "Select..."}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

// ─── Trophy Type Multi-select (Basic / Elite) ─────────────────────────────────

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

  const toggle = (item) => {
    onChange(
      selected.includes(item)
        ? selected.filter((v) => v !== item)
        : [...selected, item]
    );
  };

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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

// ─── Validate person card ──────────────────────────────────────────────────────

function validatePersonCard(data) {
  const e = {};
  if (!data.giftType || data.giftType.length === 0)
    e.giftType = "Gift type is required";
  if (!data.registrationKitNeeded)
    e.registrationKitNeeded = "This field is required";

  const hasTrophy = data.giftType?.includes("Trophy");
  const hasCash = data.giftType?.includes("Cash Prize");
  const hasVoucher = data.giftType?.includes("Voucher");

  if (hasTrophy) {
    if (!data.trophyType || data.trophyType.length === 0)
      e.trophyType = "Trophy type is required";
    if (data.trophyType?.includes("Basic") && !data.basicTrophyQty?.trim())
      e.basicTrophyQty = "Basic trophy quantity is required";
    if (data.trophyType?.includes("Elite") && !data.eliteTrophyQty?.trim())
      e.eliteTrophyQty = "Elite trophy quantity is required";
  }
  if (hasCash) {
    if (!data.cashPrizeAmount?.trim())
      e.cashPrizeAmount = "Cash prize amount is required";
  }
  if (hasVoucher) {
    if (!data.voucherWorth)
      e.voucherWorth = "Voucher worth is required";
  }
  if (data.registrationKitNeeded === "Yes" && !data.registrationKitQty?.trim())
    e.registrationKitQty = "Registration kit quantity is required";

  return e;
}

// ─── Person Card (Student / Guest) ────────────────────────────────────────────

function PersonCard({ title, data, onChange, errors = {} }) {
  const update = (field) => (val) => onChange({ ...data, [field]: val });
  const updateInput = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  const hasTrophy = data.giftType?.includes("Trophy");
  const hasCash = data.giftType?.includes("Cash Prize");
  const hasVoucher = data.giftType?.includes("Voucher");
  const showBasic = data.trophyType?.includes("Basic");
  const showElite = data.trophyType?.includes("Elite");

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <h3 className="text-purple-400 text-base font-semibold">{title}</h3>

      {/* Gift Type + Registration Kit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <MultiSelect
            labelBg="#1E1E35"
            label="Gift Type *"
            options={GIFT_TYPE_OPTIONS}
            selected={data.giftType || []}
            onChange={(val) => {
              // Reset trophy fields if Trophy deselected
              const updated = { ...data, giftType: val };
              if (!val.includes("Trophy")) {
                updated.trophyType = [];
                updated.basicTrophyQty = "";
                updated.eliteTrophyQty = "";
              }
              if (!val.includes("Cash Prize")) updated.cashPrizeAmount = "";
              if (!val.includes("Voucher")) updated.voucherWorth = "";
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
            onChange={(val) => {
              onChange({ ...data, registrationKitNeeded: val, registrationKitQty: "" });
            }}
            options={["Yes", "No"]}
          />
          {errors.registrationKitNeeded && <ErrorMsg msg={errors.registrationKitNeeded} />}
        </div>
      </div>

      {/* Trophy Type — only if Trophy selected */}
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

      {/* Basic / Elite Qty row */}
      {hasTrophy && (showBasic || showElite) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showBasic && (
            <div>
              <CustomInput
                labelBg="#1E1E35"
                label="Basic Trophy Quantity *"
                type="number"
                value={data.basicTrophyQty || ""}
                onChange={updateInput("basicTrophyQty")}
              />
              <ErrorMsg msg={errors.basicTrophyQty} />
            </div>
          )}
          {showElite && (
            <div>
              <CustomInput
                labelBg="#1E1E35"
                label="Elite Trophy Quantity *"
                type="number"
                value={data.eliteTrophyQty || ""}
                onChange={updateInput("eliteTrophyQty")}
              />
              <ErrorMsg msg={errors.eliteTrophyQty} />
            </div>
          )}
        </div>
      )}

      {/* Cash Prize Amount — only if Cash Prize selected */}
      {hasCash && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomInput
              labelBg="#1E1E35"
              label="Cash Prize Amount *"
              type="number"
              value={data.cashPrizeAmount || ""}
              onChange={updateInput("cashPrizeAmount")}
            />
            <ErrorMsg msg={errors.cashPrizeAmount} />
          </div>

          {/* Voucher Worth — show alongside cash if both selected */}
          {hasVoucher && (
            <div>
              <CustomSelect
                labelBg="#1E1E35"
                label="Voucher worth *"
                value={data.voucherWorth || ""}
                onChange={update("voucherWorth")}
                options={VOUCHER_WORTH_OPTIONS}
              />
              {errors.voucherWorth && <ErrorMsg msg={errors.voucherWorth} />}
            </div>
          )}
        </div>
      )}

      {/* Voucher Worth — only if Voucher selected without Cash Prize */}
      {hasVoucher && !hasCash && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomSelect
              labelBg="#1E1E35"
              label="Voucher worth *"
              value={data.voucherWorth || ""}
              onChange={update("voucherWorth")}
              options={VOUCHER_WORTH_OPTIONS}
            />
            {errors.voucherWorth && <ErrorMsg msg={errors.voucherWorth} />}
          </div>
        </div>
      )}

      {/* Registration Kit Quantity — only if Yes */}
      {data.registrationKitNeeded === "Yes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomInput
              labelBg="#1E1E35"
              label="Registration Kit Quantity *"
              type="number"
              value={data.registrationKitQty || ""}
              onChange={updateInput("registrationKitQty")}
            />
            <ErrorMsg msg={errors.registrationKitQty} />
          </div>
        </div>
      )}

      {/* Special Requirements */}
      <div className="relative w-full">
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
          Special Requirements, if any *
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

// ─── Validation for full day ───────────────────────────────────────────────────

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

// ─── Main Purchase Form ────────────────────────────────────────────────────────

export default function Purchase({ nextStep, prevStep, eventDays = [] }) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [errors, setErrors] = useState({});

  const [dayData, setDayData] = useState(
    eventDays.map(() => ({
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
    }))
  );

  const current = dayData[currentDayIndex] || {};
  const currentErrors = errors[currentDayIndex] || {};

  const updateCurrent = (patch) => {
    setDayData((prev) => {
      const updated = [...prev];
      updated[currentDayIndex] = { ...updated[currentDayIndex], ...patch };
      return updated;
    });
    // Clear related errors as user fills in
    setErrors((prev) => ({ ...prev, [currentDayIndex]: {} }));
  };

  const showStudent =
    current.selectedPersons === "Students" || current.selectedPersons === "Both";
  const showGuest =
    current.selectedPersons === "Guest" || current.selectedPersons === "Both";

  const showIdCard = current.requirementNeeded?.includes("Id Card");
  const showCertificate = current.requirementNeeded?.includes("Certificate");

  const handleNext = () => {
    const dayErrors = validateDay(current);
    const hasErrors = Object.keys(dayErrors).length > 0;
    setErrors((prev) => ({ ...prev, [currentDayIndex]: dayErrors }));

    if (hasErrors) return;

    setCompletedDays((prev) =>
      prev.includes(currentDayIndex) ? prev : [...prev, currentDayIndex]
    );

    if (currentDayIndex < eventDays.length - 1) {
      setCurrentDayIndex((prev) => prev + 1);
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex((prev) => prev - 1);
    } else {
      prevStep();
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Day Timeline */}
      <DayTimeline
        days={eventDays}
        currentDayIndex={currentDayIndex}
        completedDays={completedDays}
      />

      <h2 className="text-white text-lg font-bold">
        Purchase Details – Day {currentDayIndex + 1}
      </h2>

      {/* ── Requirement Needed ── */}
      <div>
        <MultiSelect
          label="Requirement Needed *"
          options={REQUIREMENT_OPTIONS}
          selected={current.requirementNeeded || []}
          onChange={(val) => {
            const patch = { requirementNeeded: val };
            if (!val.includes("Id Card")) patch.idCardQty = "";
            if (!val.includes("Certificate")) patch.certificateQty = "";
            updateCurrent(patch);
          }}
          error={currentErrors.requirementNeeded}
        />
      </div>

      {/* ── Conditional Qty inputs ── */}
      {(showIdCard || showCertificate) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showIdCard && (
            <div>
              <CustomInput
                label="Id Card Hard Copy Quantity *"
                type="number"
                value={current.idCardQty || ""}
                onChange={(e) => updateCurrent({ idCardQty: e.target.value })}
              />
              <ErrorMsg msg={currentErrors.idCardQty} />
            </div>
          )}
          {showCertificate && (
            <div>
              <CustomInput
                label="Certificate Hard Copy Quantity *"
                type="number"
                value={current.certificateQty || ""}
                onChange={(e) => updateCurrent({ certificateQty: e.target.value })}
              />
              <ErrorMsg msg={currentErrors.certificateQty} />
            </div>
          )}
        </div>
      )}

      {/* ── Select Required Persons ── */}
      <div>
        <CustomSelect
          label="Select Required Persons *"
          value={current.selectedPersons || ""}
          onChange={(val) =>
            updateCurrent({
              selectedPersons: val,
              studentData: {
                giftType: [], registrationKitNeeded: "", trophyType: [],
                basicTrophyQty: "", eliteTrophyQty: "", cashPrizeAmount: "",
                voucherWorth: "", registrationKitQty: "", specialRequirements: "",
              },
              guestData: {
                giftType: [], registrationKitNeeded: "", trophyType: [],
                basicTrophyQty: "", eliteTrophyQty: "", cashPrizeAmount: "",
                voucherWorth: "", registrationKitQty: "", specialRequirements: "",
              },
            })
          }
          options={PERSON_OPTIONS}
        />
        {currentErrors.selectedPersons && <ErrorMsg msg={currentErrors.selectedPersons} />}
      </div>

      {/* ── Student Card ── */}
      {showStudent && (
        <PersonCard
          title="Students"
          data={current.studentData || {}}
          onChange={(updated) => updateCurrent({ studentData: updated })}
          errors={currentErrors.studentData || {}}
        />
      )}

      {/* ── Guest Card ── */}
      {showGuest && (
        <PersonCard
          title="Guest"
          data={current.guestData || {}}
          onChange={(updated) => updateCurrent({ guestData: updated })}
          errors={currentErrors.guestData || {}}
        />
      )}

      {/* ── Navigation ── */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="border border-purple-600 px-6 py-2 rounded text-purple-600 hover:bg-purple-600/10 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="bg-purple-600 px-6 py-2 rounded text-white hover:bg-purple-700 transition-colors"
        >
          {currentDayIndex === eventDays.length - 1 ? "Next →" : "Next Day →"}
        </button>
      </div>
    </div>
  );
}