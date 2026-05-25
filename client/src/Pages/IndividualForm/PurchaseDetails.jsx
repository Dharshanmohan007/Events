import React, { useEffect, useState, useRef } from "react";
import {
  ChevronDown,
  ArrowRight,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

import { useAuth } from "../../Components/AuthContext";
import { API_BASE } from "../../utils/apiConfig";

/* ================= HELPER FUNCTIONS ================= */

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ================= DATE PICKER ================= */

function DateTimePicker({ label, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState("calendar");
  const [displayMonth, setDisplayMonth] = useState(() =>
    value ? value.getMonth() : new Date().getMonth(),
  );
  const [displayYear, setDisplayYear] = useState(() =>
    value ? value.getFullYear() : new Date().getFullYear(),
  );
  const [yearPage, setYearPage] = useState(() =>
    Math.floor((value ? value.getFullYear() : new Date().getFullYear()) / 12),
  );
  const [selectedDate, setSelectedDate] = useState(value || null);

  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (value) {
      setDisplayMonth(value.getMonth());
      setDisplayYear(value.getFullYear());
      setSelectedDate(value);
    }
  }, [value]);

  const formatDisplay = () => {
    if (!value) return placeholder || "Select Date";
    const d = value;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleDayClick = (day) => {
    const newDate = new Date(displayYear, displayMonth, day);
    setSelectedDate(newDate);
    onChange(newDate);
    setOpen(false);
  };

  const prevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  };

  const handleSelectYear = (year) => {
    setDisplayYear(year);
    setYearPage(Math.floor(year / 12));
    setViewMode("calendar");
  };

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
  const yearStart = yearPage * 12;
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  return (
    <div ref={ref} className="relative w-full">
      {label && (
        <label className="text-sm text-white mb-2 block">{label}</label>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
          open ? "border-purple-500" : "border-[#3a3a5a]"
        }`}
      >
        <span
          className={`text-sm ${value ? "text-gray-300" : "text-gray-500"}`}
        >
          {formatDisplay()}
        </span>
        <CalendarDays size={18} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 bg-[#1a1a35] border border-[#3a3a5a] rounded-xl shadow-2xl w-72 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 hover:bg-[#2a2a4a] rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className="text-sm font-medium text-white"
                >
                  {MONTHS[displayMonth]}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("year")}
                  className="text-sm font-medium text-white"
                >
                  {displayYear}
                </button>
              </div>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 hover:bg-[#2a2a4a] rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {viewMode === "year" ? (
              <>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setYearPage((page) => page - 1)}
                    className="px-3 py-2 text-xs rounded-lg bg-[#2a2a4a] text-gray-300 hover:bg-[#3b3b65] transition-colors"
                  >
                    Prev
                  </button>
                  <div className="text-sm text-gray-300">
                    {yearStart} - {yearStart + 11}
                  </div>
                  <button
                    type="button"
                    onClick={() => setYearPage((page) => page + 1)}
                    className="px-3 py-2 text-xs rounded-lg bg-[#2a2a4a] text-gray-300 hover:bg-[#3b3b65] transition-colors"
                  >
                    Next
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleSelectYear(year)}
                      className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                        displayYear === year
                          ? "bg-purple-600 text-white"
                          : "bg-[#1f1f38] text-gray-300 hover:bg-[#2a2a4a]"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-7 gap-1 mb-3">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs text-gray-500 font-medium py-2"
                  >
                    {d}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                (day) => {
                  const isSelected =
                    selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === displayMonth &&
                    selectedDate.getFullYear() === displayYear;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`text-sm py-2 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-purple-600 text-white font-semibold"
                          : "text-gray-300 hover:bg-[#2a2a4a] hover:text-white"
                      }`}
                    >
                      {day}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PurchaseDetails() {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user && token) {
      try {
        const decoded = jwtDecode(token);
        setEmployeeId(decoded.id || decoded._id || "");
      } catch {
        setEmployeeId("");
      }
    }
  }, [user]);

  const emptyPerson = {
    giftType: [],
    registrationKitNeeded: "",
    trophyType: [],
    basicTrophyQty: "",
    eliteTrophyQty: "",
    cashPrizeAmount: "",
    voucherQty: {},
    voucherWorth: [],
    registrationKitQty: "",
    specialRequirements: "",
  };

  const [form, setForm] = useState({
    requirement: [],
    idCardQty: "",
    certificateQty: "",

    persons: [],
    deliveryDate: null,

    students: emptyPerson,
    guests: emptyPerson,
  });

  const [isLoading, setIsLoading] = useState(false);

  const [apiError, setApiError] = useState("");

  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState({});

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => {
      const next = { ...prev };
      if (field === "requirement") {
        if (!value.includes("ID card")) {
          delete next.idCardQty;
        }
        if (!value.includes("Certificate")) {
          delete next.certificateQty;
        }
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors = {};

    if (form.requirement.includes("ID card") && !form.idCardQty?.trim()) {
      nextErrors.idCardQty = "This field is required.";
    }

    if (
      form.requirement.includes("Certificate") &&
      !form.certificateQty?.trim()
    ) {
      nextErrors.certificateQty = "This field is required.";
    }

    const neededSections = [];
    if (form.persons === "Students" || form.persons === "Both") {
      neededSections.push("students");
    }
    if (form.persons === "Guest" || form.persons === "Both") {
      neededSections.push("guests");
    }

    neededSections.forEach((section) => {
      const data = form[section];
      const prefix = `${section}.`;

      if (!data.giftType) {
        nextErrors[`${prefix}giftType`] = "This field is required.";
      }

      if (!data.registrationKitNeeded) {
        nextErrors[`${prefix}registrationKitNeeded`] =
          "This field is required.";
      }

      if (
        data.registrationKitNeeded === "Yes" &&
        !data.registrationKitQty?.trim()
      ) {
        nextErrors[`${prefix}registrationKitQty`] = "This field is required.";
      }

      if (data.giftType?.includes("Trophy")) {
        if (!data.trophyType) {
          nextErrors[`${prefix}trophyType`] = "This field is required.";
        }

        if (
          (data.trophyType === "Basic" || data.trophyType === "Both") &&
          !data.basicTrophyQty?.trim()
        ) {
          nextErrors[`${prefix}basicTrophyQty`] = "This field is required.";
        }

        if (
          (data.trophyType === "Elite" || data.trophyType === "Both") &&
          !data.eliteTrophyQty?.trim()
        ) {
          nextErrors[`${prefix}eliteTrophyQty`] = "This field is required.";
        }
      }

      if (
        data.giftType?.includes("Cash Prize") &&
        !data.cashPrizeAmount?.trim()
      ) {
        nextErrors[`${prefix}cashPrizeAmount`] = "This field is required.";
      }

      if (data.giftType?.includes("Voucher")) {
        if (!data.voucherWorth) {
          nextErrors[`${prefix}voucherWorth`] = "This field is required.";
        }
        if (!data.voucherQty?.trim()) {
          nextErrors[`${prefix}voucherQty`] = "This field is required.";
        }
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /* ================= BUILD GIFT ITEMS ================= */

  const buildGiftItems = (section) => {
    const giftItems = [];

    /* TROPHY */
    if (section.giftType?.includes("Trophy")) {
      const trophyTypes = Array.isArray(section.trophyType)
        ? section.trophyType
        : section.trophyType
          ? [section.trophyType]
          : [];

      const trophy = [];

      if (trophyTypes.includes("Basic")) {
        trophy.push({
          trophyType: "Basic",
          quantity: parseInt(section.basicTrophyQty) || 0,
        });
      }

      if (trophyTypes.includes("Elite")) {
        trophy.push({
          trophyType: "Elite",
          quantity: parseInt(section.eliteTrophyQty) || 0,
        });
      }

      if (trophy.length) {
        giftItems.push({
          giftType: "Trophy",
          trophy,
        });
      }
    }

    /* CASH PRIZE */
    if (section.giftType?.includes("Cash Prize")) {
      giftItems.push({
        giftType: "Cash Prize",
        cashPrizeAmount: parseInt(section.cashPrizeAmount) || 0,
      });
    }

    /* VOUCHER */
    if (section.giftType?.includes("Voucher")) {
      const worths = Array.isArray(section.voucherWorth)
        ? section.voucherWorth
        : section.voucherWorth
          ? [section.voucherWorth]
          : [];

      const vouchers = worths.map((worth) => ({
        voucherWorth: worth.toString().replace(/[₹,\s]/g, ""),
        quantity: parseInt(section.voucherQty?.[worth]) || 0,
      }));

      if (vouchers.length) {
        giftItems.push({
          giftType: "Voucher",
          voucher: vouchers,
        });
      }
    }

    return giftItems;
  };

  /* ================= BUILD PAYLOAD ================= */

  const buildPayload = () => {
    const requirementNeeded = [];

    if (form.requirement.includes("ID card")) {
      requirementNeeded.push({
        type: "ID Card",

        hardCount: parseInt(form.idCardQty) || 0,

        softCount: 0,
      });
    }

    if (form.requirement.includes("Certificate")) {
      requirementNeeded.push({
        type: "Certificate",

        hardCount: parseInt(form.certificateQty) || 0,

        softCount: 0,
      });
    }

    const requiredFor = [];

    if (form.persons.includes("Students")) {
      requiredFor.push("Students");
    }

    if (form.persons.includes("Guest")) {
      requiredFor.push("Guests");
    }

    return {
      employee:
        user?.id || user?._id || employeeId || "6a0411af4579d3137b255e71",

      purchases: [
        {
          dayIndex: 1,

          deliveryDate: form.deliveryDate
            ? form.deliveryDate.toISOString()
            : "",

          requirementNeeded,

          requiredFor,

          students: {
            registrationKitNeeded:
              form.students.registrationKitNeeded === "Yes",

            registrationKitQty: parseInt(form.students.registrationKitQty) || 0,

            giftItems: buildGiftItems(form.students),

            specialRequirements: form.students.specialRequirements || "",
          },

          guests: {
            registrationKitNeeded: form.guests.registrationKitNeeded === "Yes",

            registrationKitQty: parseInt(form.guests.registrationKitQty) || 0,

            giftItems: buildGiftItems(form.guests),

            specialRequirements: form.guests.specialRequirements || "",
          },
        },
      ],
    };
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    setApiError("");
    setSuccess(false);
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const payload = buildPayload();

      if (!payload.employee) {
        throw new Error("Unable to determine employee id. Please login again.");
      }

      const token = localStorage.getItem("token");

      const requestUrl = `${API_BASE}/api/purchase/create`;

      const response = await fetch(requestUrl, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        body: JSON.stringify(payload),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          (data && data.message) ||
            `Purchase submission failed with status ${response.status}`,
        );
      }

      setSuccess(true);
    } catch (error) {
      setApiError(error.message || "Unable to send purchase data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen
      bg-[#141428]
      p-6 text-white"
    >
      <h1 className="text-white text-3xl font-bold mb-6">Purchase Details</h1>

      <div className="w-full space-y-5 mt-4">
        {/* REQUIREMENT */}
        <CustomDropdown
          label="Requirement Needed"
          value={form.requirement}
          multiSelect
          setValue={(value) => setField("requirement", value)}
          options={["Certificate", "ID card"]}
          placeholder="Select Requirement"
        />

       {form.requirement.length > 0 && (
  <div
    className={`grid gap-4 ${
      form.requirement.length === 1
        ? "grid-cols-1"
        : "grid-cols-1 md:grid-cols-2"
    }`}
  >
    {form.requirement.includes("ID card") && (
      <div className="w-full">
        <InputField
          label="Id Card Hard copy Quantity"
          placeholder="52"
          value={form.idCardQty}
          onChange={(e) => setField("idCardQty", e.target.value)}
          error={errors.idCardQty}
        />
      </div>
    )}

    {form.requirement.includes("Certificate") && (
      <div className="w-full">
        <InputField
          label="Certificate Hard Copy Quantity"
          placeholder="52"
          value={form.certificateQty}
          onChange={(e) => setField("certificateQty", e.target.value)}
          error={errors.certificateQty}
        />
      </div>
    )}
  </div>
)}

        <div
          className="grid grid-cols-1
          md:grid-cols-2 gap-4"
        >
          {/* PERSONS */}
          <CustomDropdown
            label="Select Required Persons*"
            value={form.persons}
            multiSelect
            setValue={(value) => setField("persons", value)}
            options={["Students", "Guest"]}
            placeholder="Select Required Persons"
          />

          {/* DELIVERY DATE */}
          <DateTimePicker
            label="Delivery Date *"
            value={form.deliveryDate}
            onChange={(val) => setField("deliveryDate", val)}
            placeholder="Select Date"
          />
        </div>

        {/* STUDENTS */}
        {form.persons.includes("Students") && (
          <PersonSection
            title="Students"
            data={form.students}
            onChange={(updated) =>
              setForm((prev) => ({
                ...prev,
                students: updated,
              }))
            }
          />
        )}

        {/* GUEST */}
        {form.persons.includes("Guest") && (
          <PersonSection
            title="Guest"
            data={form.guests}
            onChange={(updated) =>
              setForm((prev) => ({
                ...prev,
                guests: updated,
              }))
            }
          />
        )}

        {/* ERROR */}
        {apiError && (
          <div
            className="bg-red-500/10
            border border-red-500/30
            text-red-300
            rounded-lg px-4 py-3"
          >
            {apiError}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div
            className="bg-green-500/10
            border border-green-500/30
            text-green-300
            rounded-lg px-4 py-3"
          >
            Purchase Details Submitted Successfully
          </div>
        )}

        {/* BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#8b3dff]
            hover:bg-[#9a52ff]
            transition-all duration-300
            text-white font-semibold
            px-10 py-3 rounded-lg
            flex items-center gap-2"
          >
            {isLoading ? "Sending..." : "Submit"}

            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= PERSON SECTION ================= */

function PersonSection({ title, data, onChange }) {
  const handleFieldChange = (field) => (e) => {
    onChange({
      ...data,
      [field]: e.target.value,
    });
  };

  const hasTrophy = data.giftType?.includes("Trophy");

  const hasCash = data.giftType?.includes("Cash Prize");

  const hasVoucher = data.giftType?.includes("Voucher");

  const voucherWorthList = Array.isArray(data.voucherWorth)
    ? data.voucherWorth
    : data.voucherWorth
      ? [data.voucherWorth]
      : [];

  return (
    <div
      className="w-full
      bg-[#1b1b35]
      rounded-xl p-5
      border border-[#2f2f5c]"
    >
      <h2
        className="text-[#8b3dff]
        text-2xl font-semibold
        mb-5"
      >
        {title}
      </h2>

      <div
        className="grid grid-cols-1
        md:grid-cols-2 gap-4 mb-4"
      >
        <CustomDropdown
          label="Gift Type *"
          value={data.giftType}
          multiSelect
          setValue={(value) =>
            onChange({
              ...data,
              giftType: value,
            })
          }
          options={["Trophy", "Cash Prize", "Voucher"]}
          placeholder="Select Gift Type"
        />

        <CustomDropdown
          label="Registration Kit Needed *"
          value={data.registrationKitNeeded}
          setValue={(value) =>
            onChange({
              ...data,
              registrationKitNeeded: value,
            })
          }
          options={["Yes", "No"]}
          placeholder="Select Option"
        />
      </div>

      {hasTrophy && (
        <>
          <div className="mb-4">
            <CustomDropdown
              label="Type of Trophy Wanted *"
              value={data.trophyType}
              multiSelect
              setValue={(value) =>
                onChange({
                  ...data,
                  trophyType: value,
                  basicTrophyQty: value.includes("Basic")
                    ? data.basicTrophyQty
                    : "",
                  eliteTrophyQty: value.includes("Elite")
                    ? data.eliteTrophyQty
                    : "",
                })
              }
              options={["Basic", "Elite"]}
              placeholder="Select Trophy Type"
            />
          </div>

          {Array.isArray(data.trophyType) &&
            data.trophyType.includes("Basic") && (
              <div className="mb-4">
                <InputField
                  label="Basic Trophy Quantity *"
                  placeholder="2"
                  value={data.basicTrophyQty}
                  onChange={handleFieldChange("basicTrophyQty")}
                />
              </div>
            )}

          {Array.isArray(data.trophyType) &&
            data.trophyType.includes("Elite") && (
              <div className="mb-4">
                <InputField
                  label="Elite Trophy Quantity *"
                  placeholder="2"
                  value={data.eliteTrophyQty}
                  onChange={handleFieldChange("eliteTrophyQty")}
                />
              </div>
            )}
        </>
      )}

      {hasCash && (
        <div className="mb-4">
          <InputField
            label="Cash Prize Amount *"
            placeholder="₹ 5000"
            value={data.cashPrizeAmount}
            onChange={handleFieldChange("cashPrizeAmount")}
          />
        </div>
      )}

      {hasVoucher && (
        <div className="mb-4">
          <CustomDropdown
            label="Voucher Worth *"
            value={voucherWorthList}
            multiSelect
            setValue={(value) =>
              onChange({
                ...data,
                voucherWorth: value,
                voucherQty: Object.fromEntries(
                  Object.entries(data.voucherQty || {}).filter(([key]) =>
                    value.includes(key),
                  ),
                ),
              })
            }
            options={["₹ 1000", "₹ 2000", "₹ 5000", "₹ 10000"]}
            placeholder="Select Voucher Worth"
          />

          {voucherWorthList.length > 0 && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              {voucherWorthList.map((worth) => (
                <InputField
                  key={worth}
                  label={`Voucher Quantity (${worth}) *`}
                  placeholder="2"
                  value={data.voucherQty?.[worth] || ""}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      voucherQty: {
                        ...data.voucherQty,
                        [worth]: e.target.value,
                      },
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {data.registrationKitNeeded === "Yes" && (
        <div className="mb-4">
          <InputField
            label="Registration Kit Quantity *"
            placeholder="2"
            value={data.registrationKitQty}
            onChange={handleFieldChange("registrationKitQty")}
          />
        </div>
      )}

      <div className="w-full">
        <label
          className="text-sm text-white
          mb-2 block"
        >
          Special Requirement
        </label>

        <textarea
          rows={5}
          value={data.specialRequirements}
          onChange={handleFieldChange("specialRequirements")}
          placeholder="Enter special requirements..."
          className="w-full bg-[#1d1d39]
          border border-[#3b1f72]
          rounded-md px-4 py-3
          text-sm text-gray-300
          placeholder:text-gray-500
          outline-none resize-none
          focus:border-[#8b3dff]"
        />
      </div>
    </div>
  );
}

/* ================= INPUT FIELD ================= */

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
}) {
  return (
    <div className="w-full">
      <label
        className="text-sm text-white
        mb-2 block"
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full 
        bg-[#16162a]
        border rounded-md px-4 py-3
        text-sm text-gray-300
        placeholder:text-gray-500
        outline-none
        transition-all duration-300
        focus:border-[#8b3dff]
        ${
          error
            ? "border-red-500"
            : "border-[#3a3a5a]"
        }`}
      />

      {error && (
        <p className="text-red-400 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

/* ================= CUSTOM DROPDOWN ================= */

/* ================= CUSTOM DROPDOWN ================= */

function CustomDropdown({
  label,
  value,
  setValue,
  options,
  placeholder,
  multiSelect = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const displayText =
    selectedValues.length > 0 ? selectedValues.join(", ") : placeholder;

  const handleSelect = (item) => {
    if (multiSelect) {
      if (selectedValues.includes(item)) {
        setValue(selectedValues.filter((value) => value !== item));
      } else {
        setValue([...selectedValues, item]);
      }
      return;
    }

    setValue(item);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <label
        className="text-sm text-white
        mb-2 block"
      >
        {label}
      </label>

      {/* DROPDOWN HEADER */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full
        
          border
          rounded-md
          px-4
          py-3
          flex
          items-center
          justify-between
          cursor-pointer
          transition-all
          duration-300
          ${isOpen ? "border-[#3b82f6]" : "border-[#3a3a5a]"}
        `}
      >
        <span
          className={`text-sm ${
            selectedValues.length > 0 ? "text-white" : "text-[#8d8da8]"
          }`}
        >
          {displayText}
        </span>

        <ChevronDown
          size={18}
          className={`transition-transform duration-300 text-[#b0b0c3] ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {/* DROPDOWN OPTIONS */}
      {isOpen && (
        <div
          className="
            absolute
            z-50
            mt-2
            w-full
            bg-[#26264a]
            border
            border-[#3a3a5a]
            rounded-md
            overflow-hidden
            shadow-2xl
          "
        >
          {options.map((item, index) => {
            const isSelected = selectedValues.includes(item);
            return (
              <div
                key={index}
                onClick={() => handleSelect(item)}
                className={`
                    px-4
                    py-4
                    cursor-pointer
                    text-base
                    transition-all
                    duration-200
                    flex
                    items-center
                    justify-between
                    ${
                      isSelected
                        ? "bg-[#3b82f6] text-white"
                        : "text-white hover:bg-[#3b82f6]"
                    }
                  `}
              >
                <span>{item}</span>
                {isSelected && <Check size={18} className="text-white" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
