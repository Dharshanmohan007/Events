import React, { useState, useRef, useEffect, useCallback } from "react";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";
import { DayTimeline } from "./VenueForm";


const REQUIREMENT_OPTIONS        = ["Certificate", "Id Card"];
const PERSON_OPTIONS             = ["Students", "Guest", "Both"];
const STUDENT_GIFT_TYPE_OPTIONS  = ["Trophy", "Cash Prize", "Voucher"];
const GUEST_GIFT_TYPE_OPTIONS    = ["Trophy", "Glass Cup", "Voucher"];
const TROPHY_TYPE_OPTIONS        = ["Basic", "Elite"];
const VOUCHER_WORTH_OPTIONS      = ["₹ 500", "₹ 1000", "₹ 2000", "₹ 5000", "₹ 10000"];

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
      voucherWorth: [],
      voucherWorthQty: {},
      registrationKitQty: "",
      specialRequirements: "",
    },
    guestData: {
      giftType: [],
      registrationKitNeeded: "",
      trophyType: [],
      basicTrophyQty: "",
      eliteTrophyQty: "",
      glassCupQty: "",
      voucherWorth: [],
      voucherWorthQty: {},
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

    const buildStudentData = (personData = {}) => {
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
      if (personData.giftType?.includes("Voucher")) {
        const selectedWorths = Array.isArray(personData.voucherWorth) ? personData.voucherWorth : (personData.voucherWorth ? [personData.voucherWorth] : []);
        const worthQty = personData.voucherWorthQty || {};
        giftItems.push({
          type: "Voucher",
          worth: selectedWorths,
          worthQuantities: selectedWorths.map((w) => ({
            worth: w,
            qty: parseInt(worthQty[w]) || 0,
          })),
        });
      }
      return {
        registrationKitNeeded: personData.registrationKitNeeded === "Yes",
        registrationKitQty: parseInt(personData.registrationKitQty) || 0,
        specialRequirements: personData.specialRequirements || "",
        giftItems,
      };
    };

    const buildGuestData = (personData = {}) => {
      const giftItems = [];
      if (personData.giftType?.includes("Trophy")) {
        giftItems.push({
          type: "Trophy",
          trophyTypes: personData.trophyType || [],
          basicQty: parseInt(personData.basicTrophyQty) || 0,
          eliteQty: parseInt(personData.eliteTrophyQty) || 0,
        });
      }
      if (personData.giftType?.includes("Glass Cup"))
        giftItems.push({ type: "Glass Cup", qty: parseInt(personData.glassCupQty) || 0 });
      if (personData.giftType?.includes("Voucher")) {
        const selectedWorths = Array.isArray(personData.voucherWorth) ? personData.voucherWorth : (personData.voucherWorth ? [personData.voucherWorth] : []);
        const worthQty = personData.voucherWorthQty || {};
        giftItems.push({
          type: "Voucher",
          worth: selectedWorths,
          worthQuantities: selectedWorths.map((w) => ({
            worth: w,
            qty: parseInt(worthQty[w]) || 0,
          })),
        });
      }
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
      students: buildStudentData(day.studentData),
      guests:   buildGuestData(day.guestData),
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

// ── Min-0 Number Input ────────────────────────────────────────────────────────

function MinZeroInput({ label, value, onChange, error, labelBg = "#1E1E35" }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === "") { onChange(""); return; }
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    onChange(String(Math.max(0, num)));
  };

  const handleBlur = () => {
    if (value === "" || value === undefined) return;
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) onChange("0");
  };

  return (
    <div className="w-full">
      <div className="relative w-full">
        <span
          className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
          style={{ backgroundColor: labelBg }}
        >
          {label}
        </span>
        <input
          type="number"
          min="0"
          value={value || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full bg-transparent border rounded-lg p-4 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors duration-200 ${
            error ? "border-red-400" : "border-[#3A3A5A]"
          }`}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Cash Prize Input with ₹ prefix ────────────────────────────────────────────

function CashPrizeInput({ value, onChange, error, labelBg = "#1E1E35" }) {
  const [focused, setFocused] = useState(false);
  const showPrefix = focused || (value && value !== "");

  return (
    <div className="w-full">
      <div className="relative w-full">
        <span
          className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
          style={{ backgroundColor: labelBg }}
        >
          Cash Prize Amount *
        </span>
        <div
          className={`w-full bg-transparent border rounded-lg flex items-center transition-colors duration-200 ${
            focused ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"
          }`}
        >
          {showPrefix && (
            <span className="pl-4 text-white text-sm select-none">₹</span>
          )}
          <input
            type="number"
            min="0"
            value={value || ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") { onChange(""); return; }
              const num = parseInt(raw, 10);
              if (!isNaN(num)) onChange(String(Math.max(0, num)));
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={showPrefix ? "" : "Enter amount"}
            className="flex-1 bg-transparent p-4 text-white text-sm focus:outline-none placeholder-gray-600"
            style={{ paddingLeft: showPrefix ? "4px" : undefined }}
          />
        </div>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Voucher Worth Quantity Grid ───────────────────────────────────────────────

function VoucherWorthQtyGrid({ selectedWorths, worthQty, onQtyChange, errors = {}, labelBg = "#1E1E35" }) {
  if (!selectedWorths || selectedWorths.length === 0) return null;

  // Layout: 1 item = full width, 2 items = 2 cols, 3+ = 2 per row
  const renderItems = () => {
    if (selectedWorths.length === 1) {
      const w = selectedWorths[0];
      return (
        <div className="col-span-2">
          <MinZeroInput
            labelBg={labelBg}
            label={`Voucher Quantity (${w}) *`}
            value={worthQty[w] || ""}
            onChange={(val) => onQtyChange(w, val)}
            error={errors[w]}
          />
        </div>
      );
    }
    return selectedWorths.map((w, idx) => {
      // If odd total and this is last item, make it full width
      const isLast = idx === selectedWorths.length - 1;
      const isOdd  = selectedWorths.length % 2 !== 0;
      const fullWidth = isLast && isOdd;
      return (
        <div key={w} className={fullWidth ? "col-span-2" : "col-span-1"}>
          <MinZeroInput
            labelBg={labelBg}
            label={`Voucher Quantity (${w}) *`}
            value={worthQty[w] || ""}
            onChange={(val) => onQtyChange(w, val)}
            error={errors[w]}
          />
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {renderItems()}
    </div>
  );
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateStudentCard(data) {
  const e = {};
  if (!data.giftType || data.giftType.length === 0) e.giftType = "Gift type is required";
  if (!data.registrationKitNeeded) e.registrationKitNeeded = "This field is required";
  if (data.giftType?.includes("Trophy")) {
    if (!data.trophyType || data.trophyType.length === 0) e.trophyType = "Trophy type is required";
    if (data.trophyType?.includes("Basic") && !data.basicTrophyQty?.trim()) e.basicTrophyQty = "Basic trophy quantity is required";
    if (data.trophyType?.includes("Elite") && !data.eliteTrophyQty?.trim()) e.eliteTrophyQty = "Elite trophy quantity is required";
  }
  if (data.giftType?.includes("Cash Prize") && !data.cashPrizeAmount?.trim()) e.cashPrizeAmount = "Cash prize amount is required";
  if (data.giftType?.includes("Voucher")) {
    const selectedWorths = Array.isArray(data.voucherWorth) ? data.voucherWorth : (data.voucherWorth ? [data.voucherWorth] : []);
    if (selectedWorths.length === 0) {
      e.voucherWorth = "Voucher worth is required";
    } else {
      const qtyErrors = {};
      selectedWorths.forEach((w) => {
        if (!data.voucherWorthQty?.[w]?.trim()) qtyErrors[w] = `Quantity for ${w} is required`;
      });
      if (Object.keys(qtyErrors).length > 0) e.voucherWorthQty = qtyErrors;
    }
  }
  if (data.registrationKitNeeded === "Yes" && !data.registrationKitQty?.trim()) e.registrationKitQty = "Registration kit quantity is required";
  return e;
}

function validateGuestCard(data) {
  const e = {};
  if (!data.giftType || data.giftType.length === 0) e.giftType = "Gift type is required";
  if (!data.registrationKitNeeded) e.registrationKitNeeded = "This field is required";
  if (data.giftType?.includes("Trophy")) {
    if (!data.trophyType || data.trophyType.length === 0) e.trophyType = "Trophy type is required";
    if (data.trophyType?.includes("Basic") && !data.basicTrophyQty?.trim()) e.basicTrophyQty = "Basic trophy quantity is required";
    if (data.trophyType?.includes("Elite") && !data.eliteTrophyQty?.trim()) e.eliteTrophyQty = "Elite trophy quantity is required";
  }
  if (data.giftType?.includes("Glass Cup") && !data.glassCupQty?.trim()) e.glassCupQty = "Glass cup quantity is required";
  if (data.giftType?.includes("Voucher")) {
    const selectedWorths = Array.isArray(data.voucherWorth) ? data.voucherWorth : (data.voucherWorth ? [data.voucherWorth] : []);
    if (selectedWorths.length === 0) {
      e.voucherWorth = "Voucher worth is required";
    } else {
      const qtyErrors = {};
      selectedWorths.forEach((w) => {
        if (!data.voucherWorthQty?.[w]?.trim()) qtyErrors[w] = `Quantity for ${w} is required`;
      });
      if (Object.keys(qtyErrors).length > 0) e.voucherWorthQty = qtyErrors;
    }
  }
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
    const se = validateStudentCard(data.studentData || {});
    if (Object.keys(se).length > 0) e.studentData = se;
  }
  if (data.selectedPersons === "Guest" || data.selectedPersons === "Both") {
    const ge = validateGuestCard(data.guestData || {});
    if (Object.keys(ge).length > 0) e.guestData = ge;
  }
  return e;
}

// ── StudentCard ───────────────────────────────────────────────────────────────

function StudentCard({ data, onChange, errors = {} }) {
  const hasTrophy  = data.giftType?.includes("Trophy");
  const hasCash    = data.giftType?.includes("Cash Prize");
  const hasVoucher = data.giftType?.includes("Voucher");
  const showBasic  = data.trophyType?.includes("Basic");
  const showElite  = data.trophyType?.includes("Elite");

  const trophyBothSelected = showBasic && showElite;
  const cashVoucherBoth    = hasCash && hasVoucher;

  const selectedWorths = Array.isArray(data.voucherWorth) ? data.voucherWorth : (data.voucherWorth ? [data.voucherWorth] : []);
  const worthQty       = data.voucherWorthQty || {};

  const handleVoucherWorthChange = (val) => {
    const updated = { ...data, voucherWorth: val };
    // Clean up qty for deselected worths
    const newWorthQty = { ...(data.voucherWorthQty || {}) };
    Object.keys(newWorthQty).forEach((k) => { if (!val.includes(k)) delete newWorthQty[k]; });
    updated.voucherWorthQty = newWorthQty;
    onChange(updated);
  };

  const handleWorthQtyChange = (worth, qty) => {
    onChange({ ...data, voucherWorthQty: { ...(data.voucherWorthQty || {}), [worth]: qty } });
  };

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      <h3 className="text-purple-400 text-base font-semibold">Students</h3>

      {/* Gift Type + Registration Kit Needed — always side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <MultiSelect
            labelBg="#1E1E35"
            label="Gift Type *"
            options={STUDENT_GIFT_TYPE_OPTIONS}
            selected={data.giftType || []}
            onChange={(val) => {
              const updated = { ...data, giftType: val };
              if (!val.includes("Trophy"))    { updated.trophyType = []; updated.basicTrophyQty = ""; updated.eliteTrophyQty = ""; }
              if (!val.includes("Cash Prize")) updated.cashPrizeAmount = "";
              if (!val.includes("Voucher"))    { updated.voucherWorth = []; updated.voucherWorthQty = {}; }
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

      {/* Trophy type select — full width */}
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

      {/* Trophy qty: 1 selected = full width, both = 2 cols */}
      {hasTrophy && (showBasic || showElite) && (
        <div className={`grid gap-4 ${trophyBothSelected ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          {showBasic && (
            <MinZeroInput
              labelBg="#1E1E35"
              label="Basic Trophy Quantity *"
              value={data.basicTrophyQty || ""}
              onChange={(val) => onChange({ ...data, basicTrophyQty: val })}
              error={errors.basicTrophyQty}
            />
          )}
          {showElite && (
            <MinZeroInput
              labelBg="#1E1E35"
              label="Elite Trophy Quantity *"
              value={data.eliteTrophyQty || ""}
              onChange={(val) => onChange({ ...data, eliteTrophyQty: val })}
              error={errors.eliteTrophyQty}
            />
          )}
        </div>
      )}

      {/* Cash Prize + Voucher Worth: both = 2 cols, single = full width */}
      {(hasCash || hasVoucher) && (
        <div className={`grid gap-4 ${cashVoucherBoth ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          {hasCash && (
            <CashPrizeInput
              labelBg="#1E1E35"
              value={data.cashPrizeAmount || ""}
              onChange={(val) => onChange({ ...data, cashPrizeAmount: val })}
              error={errors.cashPrizeAmount}
            />
          )}
          {hasVoucher && (
            <div>
              <MultiSelect
                labelBg="#1E1E35"
                label="Voucher Worth *"
                options={VOUCHER_WORTH_OPTIONS}
                selected={selectedWorths}
                onChange={handleVoucherWorthChange}
                error={errors.voucherWorth}
              />
            </div>
          )}
        </div>
      )}

      {/* Voucher Worth Quantity inputs */}
      {hasVoucher && selectedWorths.length > 0 && (
        <VoucherWorthQtyGrid
          labelBg="#1E1E35"
          selectedWorths={selectedWorths}
          worthQty={worthQty}
          onQtyChange={handleWorthQtyChange}
          errors={errors.voucherWorthQty || {}}
        />
      )}

      {/* Registration Kit Qty — always full width single row */}
      {data.registrationKitNeeded === "Yes" && (
        <MinZeroInput
          labelBg="#1E1E35"
          label="Registration Kit Quantity *"
          value={data.registrationKitQty || ""}
          onChange={(val) => onChange({ ...data, registrationKitQty: val })}
          error={errors.registrationKitQty}
        />
      )}

      {/* Special Requirements */}
      <div className="relative w-full">
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
          Special Requirements, if any
        </span>
        <textarea
          value={data.specialRequirements || ""}
          onChange={(e) => onChange({ ...data, specialRequirements: e.target.value })}
          rows={3}
          placeholder="Enter any special requirements..."
          className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600"
        />
      </div>
    </div>
  );
}

// ── GuestCard ─────────────────────────────────────────────────────────────────

function GuestCard({ data, onChange, errors = {} }) {
  const hasTrophy   = data.giftType?.includes("Trophy");
  const hasGlassCup = data.giftType?.includes("Glass Cup");
  const hasVoucher  = data.giftType?.includes("Voucher");
  const showBasic   = data.trophyType?.includes("Basic");
  const showElite   = data.trophyType?.includes("Elite");

  const trophyBothSelected  = showBasic && showElite;
  const glassCupVoucherBoth = hasGlassCup && hasVoucher;

  const selectedWorths = Array.isArray(data.voucherWorth) ? data.voucherWorth : (data.voucherWorth ? [data.voucherWorth] : []);
  const worthQty       = data.voucherWorthQty || {};

  const handleVoucherWorthChange = (val) => {
    const updated = { ...data, voucherWorth: val };
    const newWorthQty = { ...(data.voucherWorthQty || {}) };
    Object.keys(newWorthQty).forEach((k) => { if (!val.includes(k)) delete newWorthQty[k]; });
    updated.voucherWorthQty = newWorthQty;
    onChange(updated);
  };

  const handleWorthQtyChange = (worth, qty) => {
    onChange({ ...data, voucherWorthQty: { ...(data.voucherWorthQty || {}), [worth]: qty } });
  };

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      <h3 className="text-purple-400 text-base font-semibold">Guest</h3>

      {/* Gift Type + Registration Kit Needed — always side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <MultiSelect
            labelBg="#1E1E35"
            label="Gift Type *"
            options={GUEST_GIFT_TYPE_OPTIONS}
            selected={data.giftType || []}
            onChange={(val) => {
              const updated = { ...data, giftType: val };
              if (!val.includes("Trophy"))    { updated.trophyType = []; updated.basicTrophyQty = ""; updated.eliteTrophyQty = ""; }
              if (!val.includes("Glass Cup"))  updated.glassCupQty = "";
              if (!val.includes("Voucher"))    { updated.voucherWorth = []; updated.voucherWorthQty = {}; }
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

      {/* Trophy type select — full width */}
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

      {/* Trophy qty: 1 selected = full width, both = 2 cols */}
      {hasTrophy && (showBasic || showElite) && (
        <div className={`grid gap-4 ${trophyBothSelected ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          {showBasic && (
            <MinZeroInput
              labelBg="#1E1E35"
              label="Basic Trophy Quantity *"
              value={data.basicTrophyQty || ""}
              onChange={(val) => onChange({ ...data, basicTrophyQty: val })}
              error={errors.basicTrophyQty}
            />
          )}
          {showElite && (
            <MinZeroInput
              labelBg="#1E1E35"
              label="Elite Trophy Quantity *"
              value={data.eliteTrophyQty || ""}
              onChange={(val) => onChange({ ...data, eliteTrophyQty: val })}
              error={errors.eliteTrophyQty}
            />
          )}
        </div>
      )}

      {/* Glass Cup + Voucher Worth: both = 2 cols, single = full width */}
      {(hasGlassCup || hasVoucher) && (
        <div className={`grid gap-4 ${glassCupVoucherBoth ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          {hasGlassCup && (
            <MinZeroInput
              labelBg="#1E1E35"
              label="Glass Cup Quantity *"
              value={data.glassCupQty || ""}
              onChange={(val) => onChange({ ...data, glassCupQty: val })}
              error={errors.glassCupQty}
            />
          )}
          {hasVoucher && (
            <div>
              <MultiSelect
                labelBg="#1E1E35"
                label="Voucher Worth *"
                options={VOUCHER_WORTH_OPTIONS}
                selected={selectedWorths}
                onChange={handleVoucherWorthChange}
                error={errors.voucherWorth}
              />
            </div>
          )}
        </div>
      )}

      {/* Voucher Worth Quantity inputs */}
      {hasVoucher && selectedWorths.length > 0 && (
        <VoucherWorthQtyGrid
          labelBg="#1E1E35"
          selectedWorths={selectedWorths}
          worthQty={worthQty}
          onQtyChange={handleWorthQtyChange}
          errors={errors.voucherWorthQty || {}}
        />
      )}

      {/* Registration Kit Qty — always full width single row */}
      {data.registrationKitNeeded === "Yes" && (
        <MinZeroInput
          labelBg="#1E1E35"
          label="Registration Kit Quantity *"
          value={data.registrationKitQty || ""}
          onChange={(val) => onChange({ ...data, registrationKitQty: val })}
          error={errors.registrationKitQty}
        />
      )}

      {/* Special Requirements */}
      <div className="relative w-full">
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
          Special Requirements, if any
        </span>
        <textarea
          value={data.specialRequirements || ""}
          onChange={(e) => onChange({ ...data, specialRequirements: e.target.value })}
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

  // Sanitize loaded guestData: strip "Cash Prize" (replaced by "Glass Cup")
  // so old saved data never shows a stale gift type in the Guest card.
  // Also normalize voucherWorth to always be an array.
  const sanitizeDay = (day) => {
    if (!day) return emptyPurchaseDay();
    const guestGiftType = (day.guestData?.giftType || []).filter(
      (g) => g !== "Cash Prize"
    );
    const normalizeVoucherWorth = (vw) => {
      if (!vw) return [];
      if (Array.isArray(vw)) return vw;
      return [vw];
    };
    return {
      ...day,
      studentData: {
        ...emptyPurchaseDay().studentData,
        ...(day.studentData || {}),
        voucherWorth: normalizeVoucherWorth(day.studentData?.voucherWorth),
        voucherWorthQty: day.studentData?.voucherWorthQty || {},
      },
      guestData: {
        ...emptyPurchaseDay().guestData,
        ...(day.guestData || {}),
        giftType: guestGiftType,
        cashPrizeAmount: "",
        voucherWorth: normalizeVoucherWorth(day.guestData?.voucherWorth),
        voucherWorthQty: day.guestData?.voucherWorthQty || {},
      },
    };
  };

  const [dayData, setDayData] = useState(() => {
    const count = Math.max(dayCount, 0);
    return Array.from({ length: count }, (_, i) =>
      sanitizeDay(initialPurchaseData?.[i])
    );
  });

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedDays, setCompletedDays]     = useState([]);
  const [errors, setErrors]                   = useState({});
  const [isLoading, setIsLoading]             = useState(false);
  const [apiError, setApiError]               = useState("");

  const dayDataRef = useRef(dayData);
  useEffect(() => { dayDataRef.current = dayData; }, [dayData]);

  const onChangeRef = useRef(onPurchaseDataChange);
  useEffect(() => { onChangeRef.current = onPurchaseDataChange; }, [onPurchaseDataChange]);

  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current(dayData);
  }, [dayData]);

  useEffect(() => {
    if (dayCount === 0) return;
    setDayData((prev) => {
      if (prev.length === dayCount) return prev;
      return Array.from({ length: dayCount }, (_, i) => sanitizeDay(prev[i]));
    });
  }, [dayCount]);

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

  const requirementBoth = showIdCard && showCertificate;

  const updateCurrent = (patch) => {
    setDayData((prev) => {
      const updated = [...prev];
      updated[currentDayIndex] = { ...(updated[currentDayIndex] ?? emptyPurchaseDay()), ...patch };
      return updated;
    });
    setErrors((prev) => ({ ...prev, [currentDayIndex]: {} }));
  };

  const handleNext = useCallback(async () => {
    const latestDayData  = dayDataRef.current;
    const currentDayData = latestDayData[currentDayIndex] ?? emptyPurchaseDay();
    const dayErrors      = validateDay(currentDayData);
    const hasErrors      = Object.keys(dayErrors).length > 0;
    setErrors((prev) => ({ ...prev, [currentDayIndex]: dayErrors }));
    if (hasErrors) return;

    setCompletedDays((prev) =>
      prev.includes(currentDayIndex) ? prev : [...prev, currentDayIndex]
    );

    if (isLastDay) {
      setIsLoading(true);
      setApiError("");
      try {
        const payload = buildPurchasePayload(latestDayData);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId || ""}`, {
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

  const handleBack = useCallback(() => {
    if (currentDayIndex > 0) {
      setErrors((prev) => ({ ...prev, [currentDayIndex]: {} }));
      setCurrentDayIndex((prev) => prev - 1);
    } else {
      if (prevStep) prevStep();
    }
  }, [currentDayIndex, prevStep]);

  const navRef = useRef({ next: handleNext, prev: handleBack, isLoading });
  navRef.current = { next: handleNext, prev: handleBack, isLoading };

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
    registerChildNavigation({
      next: (...args) => navRef.current.next(...args),
      prev: (...args) => navRef.current.prev(...args),
      isLoading,
    });
  }, [isLoading, registerChildNavigation]);

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
        Purchase Details
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

      {/* Requirement Needed — full width */}
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

      {/* Requirement qty: 1 selected = full width, both = 2 cols */}
      {(showIdCard || showCertificate) && (
        <div className={`grid gap-4 ${requirementBoth ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          {showIdCard && (
            <MinZeroInput
              label="Id Card Hard Copy Quantity *"
              labelBg="#16162A"
              value={current.idCardQty || ""}
              onChange={(val) => updateCurrent({ idCardQty: val })}
              error={currentErrors.idCardQty}
            />
          )}
          {showCertificate && (
            <MinZeroInput
              label="Certificate Hard Copy Quantity *"
              labelBg="#16162A"
              value={current.certificateQty || ""}
              onChange={(val) => updateCurrent({ certificateQty: val })}
              error={currentErrors.certificateQty}
            />
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
        <StudentCard
          data={current.studentData || {}}
          onChange={(updated) => updateCurrent({ studentData: updated })}
          errors={currentErrors.studentData || {}}
        />
      )}

      {showGuest && (
        <GuestCard
          data={current.guestData || {}}
          onChange={(updated) => updateCurrent({ guestData: updated })}
          errors={currentErrors.guestData || {}}
        />
      )}
    </div>
  );
}