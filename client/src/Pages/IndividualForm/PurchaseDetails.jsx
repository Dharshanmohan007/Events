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

import UploadIcon from "../../assets/upload.svg";
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

const floatingLabelClass =
  "absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none";

const cardFloatingLabelClass = `${floatingLabelClass} bg-[#1b1b35]`;

/* ================= DATE PICKER ================= */

function DateTimePicker({
  label,
  value,
  onChange,
  placeholder,
  error,
  labelBgClass = "bg-[#141428]",
}) {
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
        <label className={`${floatingLabelClass} ${labelBgClass}`}>
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
          error
            ? "border-red-500"
            : open
              ? "border-purple-500"
              : "border-[#3A3A40]"
        }`}
      >
        <span
          className={`text-sm ${value ? "text-gray-300" : "text-gray-500"}`}
        >
          {formatDisplay()}
        </span>
        <CalendarDays size={18} className="text-gray-400" />
      </button>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}

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
  const principalInputRef = useRef(null);
  const [principalApprovalDocument, setPrincipalApprovalDocument] = useState(null);
  const [principalFileError, setPrincipalFileError] = useState("");

  const MAX_PRINCIPAL_FILE_SIZE_MB = 1;
  const MAX_PRINCIPAL_FILE_SIZE_BYTES = MAX_PRINCIPAL_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_PRINCIPAL_FILE_TYPE = "application/pdf";

  const handlePrincipalFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== ALLOWED_PRINCIPAL_FILE_TYPE) {
      setPrincipalFileError("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_PRINCIPAL_FILE_SIZE_BYTES) {
      setPrincipalFileError(`File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setPrincipalFileError("");
    setPrincipalApprovalDocument(selectedFile);
  };

  const handlePrincipalDrop = (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile) return;

    if (droppedFile.type !== ALLOWED_PRINCIPAL_FILE_TYPE) {
      setPrincipalFileError("Only PDF files are allowed.");
      return;
    }

    if (droppedFile.size > MAX_PRINCIPAL_FILE_SIZE_BYTES) {
      setPrincipalFileError(`File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`);
      return;
    }

    setPrincipalFileError("");
    setPrincipalApprovalDocument(droppedFile);
  };

  const handlePrincipalRemove = (e) => {
    e.stopPropagation();
    setPrincipalApprovalDocument(null);
    setPrincipalFileError("");
    if (principalInputRef.current) {
      principalInputRef.current.value = "";
    }
  };

  const openPrincipalFilePicker = () => {
    if (principalInputRef.current) {
      principalInputRef.current.click();
    }
  };

  const handleDragOver = (e) => e.preventDefault();

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
    financeRequired: false,
    advanceAmount: "",
    advancePurpose: "",
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

    // if (!principalApprovalDocument) {
    //   nextErrors.principalApprovalDocument = "Principal Approval Form is required.";
    // }

    if (!form.requirement.length) {
      nextErrors.requirement = "This field is required.";
    }

    if (form.requirement.includes("ID card") && !form.idCardQty?.trim()) {
      nextErrors.idCardQty = "This field is required.";
    }

    if (
      form.requirement.includes("Certificate") &&
      !form.certificateQty?.trim()
    ) {
      nextErrors.certificateQty = "This field is required.";
    }

    const personValues = Array.isArray(form.persons)
      ? form.persons
      : form.persons
        ? [form.persons]
        : [];

    if (personValues.length === 0) {
      nextErrors.persons = "This field is required.";
    }

    if (!form.deliveryDate) {
      nextErrors.deliveryDate = "This field is required.";
    }

    const neededSections = [];
    if (
      personValues.includes("Students") ||
      personValues.includes("Both")
    ) {
      neededSections.push("students");
    }
    if (
      personValues.includes("Guest") ||
      personValues.includes("Both")
    ) {
      neededSections.push("guests");
    }

    neededSections.forEach((section) => {
      const data = form[section];
      const prefix = `${section}.`;

      const giftTypes = Array.isArray(data.giftType)
        ? data.giftType
        : data.giftType
          ? [data.giftType]
          : [];

      if (giftTypes.length === 0) {
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

      if (giftTypes.includes("Trophy")) {
        const trophyTypes = Array.isArray(data.trophyType)
          ? data.trophyType
          : data.trophyType
            ? [data.trophyType]
            : [];

        if (trophyTypes.length === 0) {
          nextErrors[`${prefix}trophyType`] = "This field is required.";
        }

        if (trophyTypes.includes("Basic") && !data.basicTrophyQty?.toString().trim()) {
          nextErrors[`${prefix}basicTrophyQty`] = "This field is required.";
        }

        if (trophyTypes.includes("Elite") && !data.eliteTrophyQty?.toString().trim()) {
          nextErrors[`${prefix}eliteTrophyQty`] = "This field is required.";
        }
      }

      if (giftTypes.includes("Cash Prize") && !data.cashPrizeAmount?.toString().trim()) {
        nextErrors[`${prefix}cashPrizeAmount`] = "This field is required.";
      }

      if (giftTypes.includes("Voucher")) {
        const voucherWorthList = Array.isArray(data.voucherWorth)
          ? data.voucherWorth
          : data.voucherWorth
            ? [data.voucherWorth]
            : [];

        if (voucherWorthList.length === 0) {
          nextErrors[`${prefix}voucherWorth`] = "This field is required.";
        }

        voucherWorthList.forEach((worth) => {
          if (!data.voucherQty?.[worth]?.toString().trim()) {
            nextErrors[`${prefix}voucherQty`] =
              "Voucher quantity is required for selected worths.";
          }
        });
      }
    });

    // Finance validation
    if (form.financeRequired) {
      if (!form.advanceAmount || !form.advanceAmount.toString().trim()) {
        nextErrors.advanceAmount = "This field is required.";
      }

      if (!form.advancePurpose || !form.advancePurpose.trim()) {
        nextErrors.advancePurpose = "This field is required.";
      }
    }

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
    if (section.giftType?.includes("cashPrize")) {
      giftItems.push({
        giftType: "Cash Prize",
        cashPrizeAmount: parseInt(section.cashPrizeAmount) || 0,
      });
    }

    /* VOUCHER */
    if (section.giftType?.includes("voucherWorth")) {
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
          giftType: "voucherWorth",
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

    const personValues = Array.isArray(form.persons)
      ? form.persons
      : form.persons
        ? [form.persons]
        : [];

    const requiredFor = [];

    if (personValues.includes("Students") || personValues.includes("Both")) {
      requiredFor.push("Students");
    }

    if (personValues.includes("Guest") || personValues.includes("Both")) {
      requiredFor.push("Guest");
    }

    return {
      employee:
        user?.id || user?._id || employeeId || "6a0411af4579d3137b255e71",

      principalApprovalFormName: principalApprovalDocument?.name || null,

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
          financeRequested: !!form.financeRequired,
          advanceAmount: form.financeRequired ? Number(form.advanceAmount) || 0 : 0,
          advancePurpose: form.financeRequired ? form.advancePurpose || "" : "",
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

    // ===========================
    // Create FormData
    // ===========================
    const formData = new FormData();

    // Employee
    formData.append("employee", payload.employee);

    // Principal approval PDF
    if (principalApprovalDocument) {
      formData.append(
        "principalApprovalForm",
        principalApprovalDocument,
        principalApprovalDocument.name
      );
    }

    // Purchases
    formData.append(
      "purchases",
      JSON.stringify(payload.purchases)
    );

    // ===========================
    // Debug FormData
    // ===========================
    console.log("===== FORM DATA =====");

    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    console.log("=====================");

    const requestUrl = `${API_BASE}/api/purchase/create`;

    const response = await fetch(requestUrl, {
      method: "POST",

      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      // DO NOT JSON.stringify
      // DO NOT add Content-Type
      body: formData,
    });

    let data;

    try {
      data = await response.json();
    } catch (err) {
      console.warn(err);
      data = null;
    }

    console.log("Response :", data);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Purchase submission failed (${response.status})`
      );
    }

    setSuccess(true);
  } catch (error) {
    console.error(error);
    setApiError(error.message || "Unable to send purchase data.");
  } finally {
    setIsLoading(false);
  }
};

  // const handleSubmit = async () => {
  //   setApiError("");
  //   setSuccess(false);
  //   setIsLoading(true);

  //   if (!validateForm()) {
  //     setIsLoading(false);
  //     return;
  //   }

  //   try {
  //     const payload = buildPayload();

  //     console.log("[PurchaseDetails] Payload:", payload);

  //     if (!payload.employee) {
  //       throw new Error("Unable to determine employee id. Please login again.");
  //     }

  //     const token = localStorage.getItem("token");

  //     const requestUrl = `${API_BASE}/api/purchase/create`;

  //     console.log("[PurchaseDetails] Sending POST to:", requestUrl);

  //     const response = await fetch(requestUrl, {
  //       method: "POST",

  //       headers: {
  //         "Content-Type": "application/json",

  //         ...(token
  //           ? {
  //               Authorization: `Bearer ${token}`,
  //             }
  //           : {}),
  //       },

  //       body: JSON.stringify(payload),
  //     });

  //     let data;

  //     try {
  //       data = await response.json();
  //     } catch (err) {
  //       console.warn("[PurchaseDetails] Response parse failed:", err);
  //       data = null;
  //     }

  //     console.log("[PurchaseDetails] Response status:", response.status, "data:", data);

  //     if (!response.ok) {
  //       throw new Error(
  //         (data && data.message) ||
  //           `Purchase submission failed with status ${response.status}`,
  //       );
  //     }

  //     setSuccess(true);
  //   } catch (error) {
  //     console.error("[PurchaseDetails] submit error:", error);
  //     setApiError(error.message || "Unable to send purchase data.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div
      className="w-full min-h-screen
      bg-[#141428]
      p-6 text-white"
    >
      <style>{`
        .purchase-upload-dropzone {
          border: 1px dashed #3A3A5A;
          background: transparent;
          border-radius: 10px;
          min-height: 90px;git push -u origin 
        }
      `}</style>

      <h1 className="text-white text-3xl font-bold mb-6">Purchase Form</h1>

      <div className="w-full space-y-5 mt-4">
        <div className="mb-2">
          <label className="block mb-2 text-sm text-white">
            Principal Approval Form (without uploading this document you cannot proceed further)
          </label>

          <div
            onClick={!principalApprovalDocument ? openPrincipalFilePicker : undefined}
            onDrop={handlePrincipalDrop}
            onDragOver={handleDragOver}
            className={`purchase-upload-dropzone relative text-center p-4 text-sm w-full text-white rounded-lg flex flex-row items-center justify-center gap-3 ${
              !principalApprovalDocument ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="10"
                ry="10"
                fill="none"
                stroke={principalFileError ? "#f87171" : "#3A3A5A"}
                strokeWidth="2"
                strokeDasharray="10 4"
              />
            </svg>

            <img
              src={UploadIcon}
              alt="upload"
              className="w-7 h-8 opacity-80 z-10 shrink-0"
            />

            {principalApprovalDocument ? (
              <div className="z-10 flex items-center gap-3 flex-wrap justify-center">
                <div className="flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>

                  <span className="text-purple-300 text-sm font-medium">
                    {principalApprovalDocument.name}
                  </span>

                  <span className="text-gray-400 text-xs">
                    ({(principalApprovalDocument.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePrincipalRemove}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-400/40 hover:border-red-300/60 rounded-md px-2 py-1 transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Remove
                </button>
              </div>
            ) : (
              <p className="z-10">
                Drag and drop files here or <span className="text-purple-400 underline">choose file</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Only PDF files supported • Max file size: 1MB
                </span>
              </p>
            )}
          </div>

          <input
            type="file"
            accept=".pdf,application/pdf"
            ref={principalInputRef}
            onChange={handlePrincipalFileChange}
            className="hidden"
          />

          {principalFileError && (
            <p className="text-red-400 text-xs mt-1">{principalFileError}</p>
          )}

          {errors.principalApprovalDocument && (
            <p className="text-red-400 text-xs mt-1">{errors.principalApprovalDocument}</p>
          )}
        </div>
        {/* REQUIREMENT */}
        <CustomDropdown
      
          label="Requirement Needed"
          value={form.requirement}
          multiSelect
          setValue={(value) => setField("requirement", value)}
          options={["Certificate", "ID card"]}
          placeholder="Select Requirement"
          error={errors.requirement}
          optionHoverClass="hover:bg-[#22223B]"
          borderClass="border-[1px]"
         
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
            options={["Students", "Guest", "Both"]}
            placeholder="Select Required Persons"
            error={errors.persons}
          />

          {/* DELIVERY DATE */}
          <DateTimePicker
            label="Delivery Date *"
            value={form.deliveryDate}
            onChange={(val) => setField("deliveryDate", val)}
            placeholder="Select Date"
            error={errors.deliveryDate}
          />

          {/* FINANCE REQUIRED */}
          <CustomDropdown
            label="Finance Required *"
            value={form.financeRequired ? "Yes" : "No"}
            setValue={(val) => setField("financeRequired", val === "Yes")}
            options={["Yes", "No"]}
            placeholder="Select an option"
            error={errors.financeRequired}
          />
        </div>

        {form.financeRequired && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <InputField
              label="I require Cash / In Bank / Travel Advance / Online Payment of Rs."
              placeholder="0"
              value={form.advanceAmount}
              onChange={(e) => setField("advanceAmount", e.target.value)}
              type="number"
              error={errors.advanceAmount}
            />

            <InputField
              label="Purpose of Advance"
              placeholder="Purpose"
              value={form.advancePurpose}
              onChange={(e) => setField("advancePurpose", e.target.value)}
              error={errors.advancePurpose}
            />
          </div>
        )}

        {/* STUDENTS */}
        {(form.persons.includes("Students") || form.persons.includes("Both")) && (
          <PersonSection
            title="Students"
            data={form.students}
            errors={errors}
            onChange={(updated) =>
              setForm((prev) => ({
                ...prev,
                students: updated,
              }))
            }
          />
        )}

        {/* GUEST */}
        {(form.persons.includes("Guest") || form.persons.includes("Both")) && (
          <PersonSection
            title="Guest"
            data={form.guests}
            errors={errors}
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
             type="button"
              onClick={handleSubmit}
              disabled={isLoading}
            className="bg-[#8b3dff]
            hover:bg-[#9a52ff]
            disabled:opacity-60
            disabled:cursor-not-allowed
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

function PersonSection({ title, data, errors = {}, onChange }) {
  const sectionKey = title === "Students" ? "students" : "guests";
  const getError = (field) => errors[`${sectionKey}.${field}`];

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
          labelBgClass="bg-[#1b1b35]"
          error={getError("giftType")}
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
          labelBgClass="bg-[#1b1b35]"
          error={getError("registrationKitNeeded")}
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
              labelBgClass="bg-[#1b1b35]"
              error={getError("trophyType")}
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
                  labelBgClass="bg-[#1b1b35]"
                  bgClass="bg-[#1b1b35]"
                  error={getError("basicTrophyQty")}
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
                  labelBgClass="bg-[#1b1b35]"
                  error={getError("eliteTrophyQty")}
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
            labelBgClass="bg-[#1b1b35]"
            error={getError("cashPrizeAmount")}
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
            labelBgClass="bg-[#1b1b35]"
            error={getError("voucherWorth")}
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
                  labelBgClass="bg-[#1b1b35]"
                  error={getError("voucherQty")}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {data.registrationKitNeeded === "Yes" && (
        <div className="mb-5 w-full">
          <InputField
            label="Registration Kit Quantity *"
            placeholder="2"
            value={data.registrationKitQty}
            onChange={handleFieldChange("registrationKitQty")}
            labelBgClass="bg-[#1b1b35]"
            bgClass="bg-[#1b1b35]"
            error={getError("registrationKitQty")}
          />
        </div>
      )}

      <div className="relative w-full">
        <label
          className={cardFloatingLabelClass}
        >
          Special Requirement
        </label>

        <textarea
          rows={5}
          value={data.specialRequirements}
          onChange={handleFieldChange("specialRequirements")}
          placeholder="Enter special requirements..."
          className="w-full 
          border border-[#3A3A40]
          rounded-md px-4 py-3
          text-sm text-gray-300
          placeholder:text-gray-500
          outline-none resize-none
          focus:border-[#8b3dff]
          focus:ring-1
          focus:ring-[#8b3dff]/30"
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
  labelBgClass = "bg-[1414281b1b35]",
  bgClass = "bg-[]",
}) {
  return (
    <div className="relative w-full">
      <label className={`${floatingLabelClass} ${labelBgClass}`}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full
        ${bgClass}
        border
        rounded-md px-4 py-3
        text-sm text-gray-300
        placeholder:text-gray-500
        outline-none
        transition-all duration-300
        focus:border-[#8b3dff]
        focus:ring-1
        focus:ring-[#8b3dff]/30
        ${
          error
            ? "border-red-500"
            : "border-[#3A3A40]"
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

/* ================= CUSTOM DROPDOWN ================= */

/* ================= CUSTOM DROPDOWN ================= */

function CustomDropdown({
  label,
  value,
  setValue,
  options,
  placeholder,
  error,
  multiSelect = false,
  labelBgClass = "bg-[#141428]",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedValues = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  const displayText =
    selectedValues.length > 0
      ? selectedValues.join(", ")
      : placeholder;

  const handleSelect = (item) => {
    if (multiSelect) {
      if (selectedValues.includes(item)) {
        setValue(
          selectedValues.filter(
            (value) => value !== item,
          ),
        );
      } else {
        setValue([
          ...selectedValues,
          item,
        ]);
      }
      return;
    }

    setValue(item);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <label
        className={`${floatingLabelClass} ${labelBgClass}`}
      >
        {label}
      </label>

      {/* DROPDOWN HEADER */}
      <div
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
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
          outline-none
          focus:border-[#8b3dff]
          focus:ring-1
          focus:ring-[#8b3dff]/30
          ${
            isOpen
              ? "border-[#492A6F]"
              : error
                ? "border-red-500"
                : "border-[#3A3A40]"
          }
        `}
      >
        <span
          className={`text-sm ${
            selectedValues.length > 0
              ? "text-white"
              : "text-[#8d8da8]"
          }`}
        >
          {displayText}
        </span>

        <ChevronDown
          size={18}
          className={`
            transition-transform
            duration-300
            text-[#b0b0c3]
            ${
              isOpen
                ? "rotate-180"
                : "rotate-0"
            }
          `}
        />
      </div>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}

      {/* DROPDOWN OPTIONS */}
      {isOpen && (
        <div
          className="
            absolute
            z-50
            mt-2
            w-full
            bg-[#22223B]
            border
            border-[#3a3a5a]
            rounded-md
            overflow-hidden
            shadow-2xl
          "
        >
          {options.map((item, index) => {
            const isSelected =
              selectedValues.includes(item);

            return (
              <div
                key={index}
                onClick={() =>
                  handleSelect(item)
                }
                className={`
                  px-4
                  py-3
                  cursor-pointer
                  text-base
                  transition-all
                  duration-200
                  flex
                  items-center
                  justify-between
                  outline-none
                  ${
                    isSelected
                      ? "bg-[#492A6F] text-white"
                      : "text-white hover:bg-[#492A6F]"
                  }
                  focus:bg-[#492A6F]
                  focus:text-white
                `}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    e.preventDefault();
                    handleSelect(item);
                  }
                }}
              >
                <span>{item}</span>

                {isSelected && (
                  <Check
                    size={18}
                    className="text-white"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
