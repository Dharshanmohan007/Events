import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronDown,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react";

import UploadIcon from "../../assets/upload.svg";
import { decodeToken, isTokenExpired } from "../../utils/tokenUtils";

import { API_BASE } from "../../utils/apiConfig";
import ReportPdf from "../../utils/ReportPdf";
import FormSubmitted from "../IndividualForm/FormSubmitted";

// ======================================================
// CUSTOM DATE TIME PICKER
// ======================================================

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

const staffFloatingLabelClass = `${floatingLabelClass} bg-[#232344]`;

const foodSectionFloatingLabelClass = `${floatingLabelClass} bg-[#282846]`;

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const createFoodFormCard = () => ({
  id: Date.now() + Math.random(),
  showResourceDropdown: false,
  showFoodDropdown: false,
  resourceType: [],
  selectedFoodTypes: {
    Breakfast: false,
    Lunch: false,
    Dinner: false,
    "Morning Refreshment": false,
    "Evening Refreshment": false,
  },
  foodDetails: {
    Breakfast: {
      vegParticipants: "",
      nonVegParticipants: "",
      vegGuest: "",
      nonVegGuest: "",
    },
    Lunch: {
      vegParticipants: "",
      nonVegParticipants: "",
      vegGuest: "",
      nonVegGuest: "",
    },
    Dinner: {
      vegParticipants: "",
      nonVegParticipants: "",
      vegGuest: "",
      nonVegGuest: "",
    },
  },
  selectDate: null,
  totalResourcePerson: "",
  internalAccompanyingCount: "1",
  accompanyingStaffs: [
    {
      name: "",
      mobile: "",
    },
  ],
  specialRequirement: "",
  financeRequired: "No",
  advanceAmount: "",
  advancePurpose: "",
  estimatedEventBudget: "",
  showFinanceDropdown: false,
});

function CustomDateTimePicker({ label, value, onChange, placeholder, showTime = true }) {
  const [open, setOpen] = useState(false);

  const [view, setView] = useState("calendar");

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

  const [selectedTime, setSelectedTime] = useState(() => {
    if (!value) return "";

    const hours = String(value.getHours()).padStart(2, "0");

    const minutes = String(value.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  });

  const [timeHour, setTimeHour] = useState(() => {
    if (!value) return "";

    const hour = value.getHours();

    const displayHour = hour % 12 || 12;

    return String(displayHour).padStart(2, "0");
  });

  const [timeMinute, setTimeMinute] = useState(() => {
    if (!value) return "";

    return String(value.getMinutes()).padStart(2, "0");
  });

  const [timePeriod, setTimePeriod] = useState(() =>
    value && value.getHours() >= 12 ? "PM" : "AM",
  );

  const ref = useRef(null);

  const wheelDeltaRef = useRef({
    hour: 0,
    minute: 0,
  });

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatDisplay = () => {
    if (!value) return placeholder || (showTime ? "__/__/____ --:--" : "__/__/____");

    const d = value;

    const dd = String(d.getDate()).padStart(2, "0");

    const mm = String(d.getMonth() + 1).padStart(2, "0");

    const yyyy = d.getFullYear();

    if (!showTime) return `${dd}/${mm}/${yyyy}`;

    const hours = String(d.getHours()).padStart(2, "0");

    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${dd}/${mm}/${yyyy} ${hours}:${minutes}`;
  };

  const handleDayClick = (day) => {
    const newDate = new Date(displayYear, displayMonth, day);

    if (showTime) {
      selectDate(newDate, selectedTime);
    } else {
      setSelectedDate(newDate);
      setDisplayMonth(newDate.getMonth());
      setDisplayYear(newDate.getFullYear());
      onChange(newDate);
      setOpen(false);
      setView("calendar");
    }
  };

  const selectDate = (date, time = selectedTime) => {
    const newDate = new Date(date);

    const [hours = "00", minutes = "00"] = time.split(":");

    newDate.setHours(Number(hours), Number(minutes), 0, 0);

    setSelectedDate(newDate);

    setDisplayMonth(newDate.getMonth());

    setDisplayYear(newDate.getFullYear());

    onChange(newDate);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);

    if (!selectedDate) return;

    selectDate(selectedDate, time);
  };

  const updateTimeFromParts = (hour, minute, period) => {
    if (!hour || !minute) return;

    let parsedHour = Number(hour);

    if (period === "PM" && parsedHour !== 12) {
      parsedHour += 12;
    }

    if (period === "AM" && parsedHour === 12) {
      parsedHour = 0;
    }

    const nextTime = `${String(parsedHour).padStart(2, "0")}:${minute}`;

    handleTimeChange(nextTime);
  };

  const handleTimePartChange = (field, value) => {
    const nextHour = field === "hour" ? value : timeHour;

    const nextMinute = field === "minute" ? value : timeMinute;

    const nextPeriod = field === "period" ? value : timePeriod;

    setTimeHour(nextHour);

    setTimeMinute(nextMinute);

    setTimePeriod(nextPeriod);

    updateTimeFromParts(nextHour, nextMinute, nextPeriod);
  };

  const openTimePicker = () => {
    if (!timeHour) setTimeHour("12");

    if (!timeMinute) setTimeMinute("00");

    setView("time");
  };

  const getVisibleHour = () => {
    const current = Number(timeHour || "12");

    return [-2, -1, 0, 1, 2].map((offset) => {
      const value = ((current - 1 + offset + 12) % 12) + 1;

      return String(value).padStart(2, "0");
    });
  };

  const getVisibleMinute = () => {
    const current = Number(timeMinute || "00");

    return [-2, -1, 0, 1, 2].map((offset) => {
      const value = (current + offset + 60) % 60;

      return String(value).padStart(2, "0");
    });
  };

  const shiftTimeValue = (field, direction) => {
    if (field === "hour") {
      const current = Number(timeHour || "12");

      const nextHour = String(
        ((current - 1 + direction + 12) % 12) + 1,
      ).padStart(2, "0");

      handleTimePartChange("hour", nextHour);

      return;
    }

    const current = Number(timeMinute || "00");

    const nextMinute = String((current + direction + 60) % 60).padStart(2, "0");

    handleTimePartChange("minute", nextMinute);
  };

  const handleTimeWheel = (field, event) => {
    event.preventDefault();

    wheelDeltaRef.current[field] += event.deltaY;

    if (Math.abs(wheelDeltaRef.current[field]) < 120) return;

    shiftTimeValue(field, wheelDeltaRef.current[field] > 0 ? 1 : -1);

    wheelDeltaRef.current[field] = 0;
  };

  const closePicker = () => {
    if (selectedDate) {
      selectDate(selectedDate, selectedTime);
    }

    setOpen(false);

    setView("calendar");
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

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);

  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);

  const yearStart = yearPage * 12;

  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  return (
    <div ref={ref} className="relative w-full">
      <span className={cardFloatingLabelClass}>{label}</span>

      <button
        type="button"
        onClick={() => {
          setOpen((p) => !p);

          setView("calendar");
        }}
        className="
          w-full
          
          border
          border-[#383847]
          food-field-border
          rounded-md
          px-4
          py-3
          flex
          justify-between
          items-center
          text-left
        "
      >
        <span className={value ? "text-white" : "text-[#8d8da8]"}>
          {formatDisplay()}
        </span>

        <div className="flex gap-2 text-[#b0b0c3]">
          <CalendarDays size={18} />
          {showTime && <Clock size={18} />}
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 bg-[#1a1a35] border border-[#383847] rounded-xl shadow-2xl w-72 overflow-hidden">
          {/* CALENDAR */}
          {view === "calendar" && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1 hover:bg-[#2a2a4a] rounded-lg text-gray-400"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setView("month")}
                    className="text-sm font-medium text-white"
                  >
                    {MONTHS[displayMonth]}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setYearPage(Math.floor(displayYear / 12));

                      setView("year");
                    }}
                    className="text-sm font-medium text-white"
                  >
                    {displayYear}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1 hover:bg-[#2a2a4a] rounded-lg text-gray-400"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs text-gray-500 py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({
                  length: firstDay,
                }).map((_, i) => (
                  <div key={i} />
                ))}

                {Array.from(
                  {
                    length: daysInMonth,
                  },
                  (_, i) => i + 1,
                ).map((day) => {
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
                      className={`text-xs py-1.5 rounded-lg ${
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "text-gray-300 hover:bg-[#2a2a4a]"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {showTime && (
                <button
                  type="button"
                  onClick={openTimePicker}
                  className="
                    mt-4
                    w-full
                    border
                    border-[#383847]
                    rounded-lg
                    px-4
                    py-3
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-[#c7c7d9]
                    hover:border-[#3b82f6]
                    hover:text-white
                    transition-all
                  "
                >
                  <Clock size={17} />
                  Set Time
                </button>
              )}

            </div>
          )}

          {/* TIME */}
          {view === "time" && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-5">
                <button
                  type="button"
                  onClick={() => setView("calendar")}
                  className="text-sm text-[#c084fc] hover:text-white"
                >
                  ← Date
                </button>

                <div className="flex items-center gap-2 text-base font-semibold text-white">
                  <Clock size={16} />
                  Select Time
                </div>

                <div className="w-12" />
              </div>

              <div className="flex items-center justify-center gap-3">
                <div
                  onWheel={(e) => handleTimeWheel("hour", e)}
                  className="flex w-20 flex-col items-center gap-2"
                >
                  {getVisibleHour().map((hour, index) => (
                    <button
                      key={`${hour}-${index}`}
                      type="button"
                      onClick={() => handleTimePartChange("hour", hour)}
                      className={`h-10 w-[70px] rounded-lg font-mono text-lg transition-all ${
                        index === 2
                          ? "border border-[#8b3dff] bg-[#3a225e] text-white"
                          : "text-[#595977]"
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>

                <span className="text-2xl font-bold text-white">:</span>

                <div
                  onWheel={(e) => handleTimeWheel("minute", e)}
                  className="flex w-20 flex-col items-center gap-2"
                >
                  {getVisibleMinute().map((minute, index) => (
                    <button
                      key={`${minute}-${index}`}
                      type="button"
                      onClick={() => handleTimePartChange("minute", minute)}
                      className={`h-10 w-[70px] rounded-lg font-mono text-lg transition-all ${
                        index === 2
                          ? "border border-[#8b3dff] bg-[#3a225e] text-white"
                          : "text-[#595977]"
                      }`}
                    >
                      {minute}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  {["AM", "PM"].map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => handleTimePartChange("period", period)}
                      className={`h-10 w-[60px] rounded-lg text-sm font-bold transition-all ${
                        timePeriod === period
                          ? "bg-[#9d16ff] text-white"
                          : "bg-[#2b2b49] text-[#9b9bb3]"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-[#8d8da8]">
                Scroll to pick hour &amp; minute
              </p>

              <button
                type="button"
                onClick={closePicker}
                className="mt-4 w-full rounded-md bg-[#a914ff] px-4 py-3 text-base font-semibold text-white hover:bg-[#b72cff]"
              >
                Confirm
              </button>
            </div>
          )}

          {/* MONTH */}
          {view === "month" && (
            <div className="p-3">
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setDisplayMonth(i);

                      setView("calendar");
                    }}
                    className={`py-2 rounded-lg text-xs ${
                      displayMonth === i
                        ? "bg-purple-600 text-white"
                        : "text-gray-300 hover:bg-[#2a2a4a]"
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* YEAR */}
          {view === "year" && (
            <div className="p-3">
              <div className="grid grid-cols-3 gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setDisplayYear(y);

                      setView("calendar");
                    }}
                    className={`py-2 rounded-lg text-xs ${
                      displayYear === y
                        ? "bg-purple-600 text-white"
                        : "text-gray-300 hover:bg-[#2a2a4a]"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

const IndividualFoodAndRefreshment = () => {
  // =========================
  // DROPDOWNS
  // =========================

  const [formCards, setFormCards] = useState(() => [createFoodFormCard()]);

  // =========================
  // SELECTED VALUES
  // =========================

  // CHANGE THIS
  // =========================
  // OPTIONS
  // =========================

  const resourceOptions = ["VIP", "Trainer", "Placement"];

  const foodOptions = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Morning Refreshment",
    "Evening Refreshment",
  ];

  const MAX_PRINCIPAL_FILE_SIZE_MB = 1;
  const MAX_PRINCIPAL_FILE_SIZE_BYTES = MAX_PRINCIPAL_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_PRINCIPAL_FILE_TYPE = "application/pdf";

  // =========================
  // INPUT STATES
  // =========================

  const principalInputRef = useRef(null);
  const [principalApprovalDocument, setPrincipalApprovalDocument] = useState(null);
  const [principalFileError, setPrincipalFileError] = useState("");

  const handlePrincipalFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== ALLOWED_PRINCIPAL_FILE_TYPE) {
      setPrincipalFileError("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_PRINCIPAL_FILE_SIZE_BYTES) {
      setPrincipalFileError(
        `File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`,
      );
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
      setPrincipalFileError(
        `File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`,
      );
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

  // =========================
  // AUTH
  // =========================

  const [employeeId, setEmployeeId] = useState("");

  const [token, setToken] = useState("");

  const [validationErrors, setValidationErrors] = useState([]);

  const [submitMessage, setSubmitMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  const updateFormCard = (cardId, updater) => {
    setFormCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? typeof updater === "function"
            ? updater(card)
            : { ...card, ...updater }
          : card,
      ),
    );
  };

  const handleAddForm = () => {
    setFormCards((prev) => [...prev, createFoodFormCard()]);
  };

  const handleDeleteForm = (cardId) => {
    setFormCards((prev) => prev.filter((card) => card.id !== cardId));
  };

useEffect(() => {
  const storedToken = localStorage.getItem("token");

  if (storedToken) {
    setToken(storedToken);

    const decoded = decodeToken(storedToken);

    if (!decoded || isTokenExpired(decoded)) {
      console.warn("Expired or invalid token found; clearing stored auth.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return;
    }

    if (decoded?.id) {
      setEmployeeId(decoded.id);
    }
  }
}, []);

  // =========================
  // HANDLE STAFF COUNT
  // =========================

  const handleStaffCount = (cardId, value) => {
    const count = Number(value);

    updateFormCard(cardId, (card) => {
      if (value === "" || !Number.isInteger(count) || count < 1) {
        return {
          ...card,
          internalAccompanyingCount: value,
          accompanyingStaffs:
            card.accompanyingStaffs.length === 0
              ? [
                  {
                    name: "",
                    mobile: "",
                  },
                ]
              : card.accompanyingStaffs,
        };
      }

      return {
        ...card,
        internalAccompanyingCount: value,
        accompanyingStaffs: Array.from(
          {
            length: count,
          },
          (_, index) => ({
            name: card.accompanyingStaffs[index]?.name || "",
            mobile: card.accompanyingStaffs[index]?.mobile || "",
          }),
        ),
      };
    });
  };

  // =========================
  // HANDLE STAFF INPUT
  // =========================

  const handleStaffChange = (cardId, index, field, value) => {
    updateFormCard(cardId, (card) => {
      const updated = [...card.accompanyingStaffs];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...card,
        accompanyingStaffs: updated,
      };
    });
  };

  // =========================
  // BUILD PAYLOAD
  // =========================

  // =========================
  // BUILD PAYLOAD
  // =========================

  const buildFoodPayload = (card) => {
    const selectedFoodList = Object.keys(card.selectedFoodTypes).filter(
      (type) => card.selectedFoodTypes[type]
    );

    const foodTypesPayload = selectedFoodList.map((type) => {
      // For Breakfast, Lunch, Dinner - include all details
      if (["Breakfast", "Lunch", "Dinner"].includes(type)) {
        return {
          foodTypes: [
            {
              type,
            },
          ],
          participants: {
            vegCount: Number(card.foodDetails[type].vegParticipants) || 0,
            nonVegCount: Number(card.foodDetails[type].nonVegParticipants) || 0,
          },
          vipGuests: {
            vegCount: Number(card.foodDetails[type].vegGuest) || 0,
            nonVegCount: Number(card.foodDetails[type].nonVegGuest) || 0,
          },
        };
      } else {
        // For Morning/Evening Refreshment - only type (no details needed)
        return {
          foodTypes: [
            {
              type,
            },
          ],
        };
      }
    });

    return {
      employee: employeeId || "6a0411af4579d3137b255e70",
      principalApprovalFormName: principalApprovalDocument?.name || null,
      date: card.selectDate
        ? new Date(
            card.selectDate.getTime() - card.selectDate.getTimezoneOffset() * 60000,
          ).toISOString()
        : null,

      resourcePersonType: card.resourceType,

      numberOfResourcePersons: Number(card.totalResourcePerson) || 0,

      numberOfInternalAccompanyingStaff: Number(card.internalAccompanyingCount) || 0,

      accompanyingStaff: card.accompanyingStaffs.map((staff) => ({
        name: staff.name.trim(),
        mobile: staff.mobile,
      })),

      foodTypes: foodTypesPayload,

      specialRequirements: card.specialRequirement.trim(),

      financeRequested: card.financeRequired,
      ...(card.financeRequired === "Yes" && {
        advanceAmount: Number(card.advanceAmount) || 0,
        advancePurpose: card.advancePurpose.trim(),
        estimatedEventBudget: Number(card.estimatedEventBudget) || 0,
        // Backend expects `estimatedAmount` — include it for compatibility
        estimatedAmount: Number(card.estimatedEventBudget) || 0,
      }),

      status: "Pending",
    };
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async () => { 
    // console.log("Submitting food forms:", formCards); 
    const errors = [];

    // if (!principalApprovalDocument) {
    //   errors.push("Principal Approval Form is required.");
    // }

    formCards.forEach((card, cardIndex) => {
      const formLabel = formCards.length > 1 ? `Form ${cardIndex + 1}: ` : "";

      if (!card.selectDate) errors.push(`${formLabel}Select Date is required.`);

      if (!card.resourceType.length)
        errors.push(`${formLabel}Resource Person Type is required.`);

      if (!card.totalResourcePerson)
        errors.push(`${formLabel}Total Resource Person is required.`);

      if (
        !card.internalAccompanyingCount ||
        Number(card.internalAccompanyingCount) < 1
      )
        errors.push(
          `${formLabel}Internal Accompanying Person count is required.`,
        );

      if (card.accompanyingStaffs.some((staff) => !staff.name.trim())) {
        errors.push(`${formLabel}Accompanying staff name is required.`);
      }

      if (card.accompanyingStaffs.some((staff) => !staff.mobile)) {
        errors.push(`${formLabel}Accompanying staff mobile number is required.`);
      }

      const selectedFoodList = Object.keys(card.selectedFoodTypes).filter(
        (type) => card.selectedFoodTypes[type]
      );

      if (selectedFoodList.length === 0)
        errors.push(`${formLabel}Select at least one Food Type.`);

      const mealTypes = ["Breakfast", "Lunch", "Dinner"];
      selectedFoodList.forEach((type) => {
        if (mealTypes.includes(type)) {
          if (!card.foodDetails[type].vegParticipants)
            errors.push(`${formLabel}${type}: Veg Participants count is required.`);
          if (!card.foodDetails[type].nonVegParticipants)
            errors.push(`${formLabel}${type}: Non-Veg Participants count is required.`);
          if (!card.foodDetails[type].vegGuest)
            errors.push(`${formLabel}${type}: Veg Guest count is required.`);
          if (!card.foodDetails[type].nonVegGuest)
            errors.push(`${formLabel}${type}: Non-Veg Guest count is required.`);
        }
      });

      // Finance validation
      if (card.financeRequired === "Yes") {
        if (!card.advanceAmount) {
          errors.push(`${formLabel}Advance amount is required.`);
        }

        if (!card.advancePurpose || !card.advancePurpose.trim()) {
          errors.push(`${formLabel}Advance purpose is required.`);
        }

        if (!card.estimatedEventBudget || Number(card.estimatedEventBudget) <= 0) {
          errors.push(`${formLabel}Estimated event budget must be greater than zero.`);
        }

        if (Number(card.advanceAmount) > Number(card.estimatedEventBudget)) {
          errors.push(
            `${formLabel}Advance amount cannot be greater than the estimated event budget.`,
          );
        }
      }
    });

    setValidationErrors(errors);

    setSubmitMessage("");

    if (errors.length) return;

    setIsSubmitting(true);

    try {
      const authToken = localStorage.getItem("token") || token;
      const decodedAuthToken = decodeToken(authToken);

      if (!authToken || !decodedAuthToken || isTokenExpired(decodedAuthToken)) {
        // Do not force a navigation to the login page from here; instead
        // surface a validation error so the user stays on the form and can
        // re-authenticate without losing context.
        setValidationErrors(["Session expired or invalid token. Please login again."]);
        setIsSubmitting(false);
        return;
      }

      let submittedCount = 0;
      let firstSubmissionData = null;

      for (const [index, card] of formCards.entries()) {
       const payload = buildFoodPayload(card);

const formData = new FormData();

formData.append("employee", payload.employee);

formData.append("date", payload.date);

formData.append(
  "resourcePersonType",
  JSON.stringify(payload.resourcePersonType)
);

formData.append(
  "numberOfResourcePersons",
  payload.numberOfResourcePersons
);

formData.append(
  "numberOfInternalAccompanyingStaff",
  payload.numberOfInternalAccompanyingStaff
);

formData.append(
  "accompanyingStaff",
  JSON.stringify(payload.accompanyingStaff)
);

formData.append(
  "foodTypes",
  JSON.stringify(payload.foodTypes)
);

formData.append(
  "specialRequirements",
  payload.specialRequirements
);

formData.append(
  "status",
  payload.status
);

formData.append("financeRequired", payload.financeRequested);

if (payload.advanceAmount !== undefined) {
  formData.append("advanceAmount", payload.advanceAmount);
}

if (payload.advancePurpose !== undefined) {
  formData.append("advancePurpose", payload.advancePurpose);
}

if (payload.estimatedEventBudget !== undefined) {
  formData.append("estimatedEventBudget", payload.estimatedEventBudget);
}

// Append backend-expected field name as well to ensure server records the value
if (payload.estimatedAmount !== undefined) {
  formData.append("estimatedAmount", payload.estimatedAmount);
}

if (principalApprovalDocument) {
  formData.append(
    "principalApprovalForm",
    principalApprovalDocument
  );
}

      // Debug: log outgoing FormData entries to verify values sent to server
      for (const pair of formData.entries()) {
        try {
          if (pair[1] instanceof File) {
            console.log("FormData ->", pair[0], "(file):", pair[1].name);
          } else {
            console.log("FormData ->", pair[0], ":", pair[1]);
          }
        } catch (e) {
          console.log("FormData ->", pair[0], ":", pair[1]);
        }
      }

      const response = await fetch(`${API_BASE}/api/foods`, {

  method: "POST",

  headers: {
    ...(authToken
      ? {
          Authorization: `Bearer ${authToken}`,
        }
      : {}),
  },

  body: formData,
});
      

        const data = await response.json();

        // console.log(`Food submit response ${index + 1}:`, response.status, data);

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          throw new Error(
            data?.message ||
              "Invalid or expired token. Please login again.",
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Food submission failed for form ${index + 1}: ${response.status}`,
          );
        }

        if (index === 0) {
          firstSubmissionData = data.data || data;
        }

        submittedCount += 1;
      }

      setValidationErrors([]);

      const firstCard = formCards[0];
      if (firstCard?.financeRequired === "Yes") {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const employee = {
          name: storedUser?.name || storedUser?.employeeName || "",
          empId: storedUser?.empId || storedUser?.employeeId || employeeId || "",
          designation: storedUser?.designation || "",
          department: storedUser?.department || "",
        };
        const requestNo =
          firstSubmissionData?.requestNo ||
          firstSubmissionData?.data?.requestNo ||
          firstSubmissionData?.food?.requestNo ||
          firstSubmissionData?.data?.food?.requestNo ||
          "";

        await ReportPdf({
          formData: {
            selectDate: firstCard.selectDate || "",
            advanceAmount: firstCard.advanceAmount || "",
            advancePurpose: firstCard.advancePurpose || "",
          },
          employee,
          submitResponse: {
            requestNo,
            response: firstSubmissionData,
            employeeId:
              firstSubmissionData?.employee ||
              firstSubmissionData?.employeeId ||
              employeeId ||
              employee.empId,
          },
        });
      }

      setSubmitMessage(
        `${submittedCount} food request${
          submittedCount > 1 ? "s" : ""
        } submitted successfully.`,
      );

      setSubmitSuccess(true);
    } catch (error) {
      setValidationErrors([error.message || "Unable to send food data."]);
    } finally {
      setIsSubmitting(false);
    }
  };


if (submitSuccess) {
  return (
    // Render success modal without advanceData so FormSubmitted does
    // not auto-generate the receipt (avoids the extra download).
    <FormSubmitted />
  );
}
  return (
    <div className="individual-food-form min-h-screen bg-[#141428] text-white p-6">
      <style>{`
        .individual-food-form .food-field-border {
          border-color: #383847 !important;
        }

        .individual-food-form input:focus,
        .individual-food-form textarea:focus,
        .individual-food-form button:focus,
        .individual-food-form .food-select-control:focus {
          border-color: #3b82f6 !important;
          box-shadow: none !important;
          outline: none !important;
        }
      `}</style>
      {/* TITLE */}
      <h1 className="text-white text-3xl font-bold mb-6">
        Food And Refreshment Form
      </h1>

      <div className="mb-6">
        <label className="block mb-2 text-sm text-white">
          Principal Approval Form (without uploading this document you cannot proceed further) 
        </label>

        <div
          onClick={!principalApprovalDocument ? openPrincipalFilePicker : undefined}
          onDrop={handlePrincipalDrop}
          onDragOver={handleDragOver}
          className={`relative text-center p-4 text-sm w-full text-white rounded-lg flex flex-row items-center justify-center gap-3 ${
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
              stroke={
                principalFileError ? "#f87171" : "#3A3A5A"
              }
              strokeWidth="2"
              strokeDasharray="10 4"
            />
          </svg>

          <img
            src={UploadIcon}
            alt="upload"
            className="w-7 h-8 opacity-80 z-10 flex-shrink-0"
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
          <p className="text-red-400 text-xs mt-1">
            {principalFileError}
          </p>
        )}
      </div>

      {/* HEADER */}
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={handleAddForm}
          className="
            bg-[#7c3aed]
            hover:bg-[#6d28d9]
            px-5
            py-2
            rounded-md
            font-medium
            flex
            items-center
            gap-2
            transition-all
            duration-300
          "
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {formCards.map((card, cardIndex) => (
      <div key={card.id} className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-white text-xl font-semibold">
          
        </h2>

        {cardIndex > 0 && (
          <button
            type="button"
            onClick={() => handleDeleteForm(card.id)}
            aria-label="Delete food and refreshment form"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd6d6] text-[#ff2b2b] hover:bg-[#ffc7c7] transition-colors duration-200 focus:border-[#3b82f6]"
          >
            <Trash2 size={20} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* MAIN CARD */}
      <div
        className="
          bg-[#1b1b35]
          border
          border-[#383847]
          rounded-2xl
          p-5
        "
      >
        {/* TOP INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* DATE */}
          <CustomDateTimePicker
            label="Select Date*"
            value={card.selectDate}
            onChange={(date) => updateFormCard(card.id, { selectDate: date })}
            placeholder="Select Date"
            showTime={false}
          />

          {/* RESOURCE PERSON TYPE */}
          {/* RESOURCE PERSON TYPE */}
          <div className="relative">
            <label className={cardFloatingLabelClass}>
              Type of resource Person*
            </label>

            <div
              tabIndex={0}
              onClick={() =>
                updateFormCard(card.id, {
                  showResourceDropdown: !card.showResourceDropdown,
                })
              }
              className="
    food-select-control
    w-full
  
    border
    border-[#383847]
    rounded-md
    px-4
    py-3
    flex
    justify-between
    items-center
    cursor-pointer
  "
            >
              <span
                className={
                  card.resourceType.length > 0 ? "text-white" : "text-[#8d8da8]"
                }
              >
                {card.resourceType.length > 0
                  ? card.resourceType.join(", ")
                  : "VIP / Trainer / Placement"}
              </span>

              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${
                  card.showResourceDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>

            {card.showResourceDropdown && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#383847] rounded-md overflow-hidden z-50">
                {resourceOptions.map((item, index) => {
                  const isSelected = card.resourceType.includes(item);

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        updateFormCard(card.id, {
                          resourceType: isSelected
                            ? card.resourceType.filter((type) => type !== item)
                            : [...card.resourceType, item],
                        });
                      }}
                      className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#492A6F] text-white"
                          : "text-white hover:bg-[#492A6F] hover:text-white"
                      }`}
                    >
                      <span>{item}</span>

                      {isSelected && <span>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TOTAL RESOURCE PERSON */}
          <div className="relative">
            <label className={cardFloatingLabelClass}>
              Total number of resource Person*
            </label>

            <input
              type="number"
              value={card.totalResourcePerson}
              onChange={(e) =>
                updateFormCard(card.id, {
                  totalResourcePerson: e.target.value,
                })
              }
              placeholder="5"
              className="
                  w-full
                
                  border
                  border-[#383847]
                  rounded-md
                  px-4
                  py-3
                  text-white
                  outline-none
                "
            />
          </div>

          {/* INTERNAL ACCOMPANYING COUNT */}
          <div className="relative">
            <label className={cardFloatingLabelClass}>
              Total number of Internal Accompanying Person*
            </label>

            <input
              type="number"
              min="1"
              value={card.internalAccompanyingCount}
              onChange={(e) => handleStaffCount(card.id, e.target.value)}
              className="
                  w-full
                  border
                  border-[#383847]
                  rounded-md
                  px-4
                  py-3
                  text-white
                  outline-none
                "
            />
          </div>
        </div>

        {/* FINANCE REQUIRED - 100% WIDTH */}
        <div className="relative w-full mb-4">
          <label className={cardFloatingLabelClass}>Finance Required *</label>

          <div
            tabIndex={0}
            onClick={() =>
              updateFormCard(card.id, {
                showFinanceDropdown: !card.showFinanceDropdown,
              })
            }
            className="
              food-select-control
              w-full
              border
              border-[#383847]
              rounded-md
              px-4
              py-3
              flex
              justify-between
              items-center
              cursor-pointer
            "
          >
            <span className={card.financeRequired === "Yes" ? "text-white" : "text-[#8d8da8]"}>
              {card.financeRequired}
            </span>

            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                card.showFinanceDropdown ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {card.showFinanceDropdown && (
            <div className="absolute w-full mt-2 bg-[#26264a] border border-[#383847] rounded-md overflow-hidden z-50">
              {[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ].map((opt) => (
                <div
                  key={opt.label}
                  onClick={() =>
                    updateFormCard(card.id, {
                      financeRequired: opt.value,
                      showFinanceDropdown: false,
                      ...(opt.value === "No"
                        ? {
                            advanceAmount: "",
                            advancePurpose: "",
                            estimatedEventBudget: "",
                          }
                        : {}),
                    })
                  }
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                    card.financeRequired === opt.value
                      ? "bg-[#492A6F] text-white"
                      : "text-white hover:bg-[#492A6F] hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>

                  {card.financeRequired === opt.value && <span>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADVANCE FIELDS - 50%-50% LAYOUT ONLY WHEN YES */}
        {card.financeRequired === "Yes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="relative">
              <label className={cardFloatingLabelClass}>
                I require Cash / In bank / Travel Advance /Online Payment of Rs.
              </label>

              <input
                type="number"
                min="0"
                value={card.advanceAmount}
                onChange={(e) =>
                  updateFormCard(card.id, { advanceAmount: e.target.value })
                }
                placeholder="0"
                className={`
                w-full
                border
                ${
                  Number(card.advanceAmount) > Number(card.estimatedEventBudget) &&
                  card.estimatedEventBudget !== ""
                    ? "border-red-500"
                    : "border-[#383847]"
                }
                rounded-md
                px-4
                py-3
                text-white
                outline-none
              `}
              />
              {Number(card.advanceAmount) > Number(card.estimatedEventBudget) &&
                card.estimatedEventBudget !== "" && (
                  <p className="mt-1 text-sm text-red-400">
                    Advance amount cannot exceed the estimated event budget.
                  </p>
                )}
            </div>

            <div className="relative">
              <label className={cardFloatingLabelClass}>
                Purpose of Advance
              </label>

              <input
                type="text"
                value={card.advancePurpose}
                onChange={(e) =>
                  updateFormCard(card.id, { advancePurpose: e.target.value })
                }
                placeholder="Purpose"
                className="
                w-full
                border
                border-[#383847]
                rounded-md
                px-4
                py-3
                text-white
                outline-none
              "
              />
            </div>

            <div className="relative order-first md:col-span-2">
              <label className={cardFloatingLabelClass}>
                Estimated Event Budget (Rs.)
              </label>

              <input
                type="number"
                min="0"
                value={card.estimatedEventBudget}
                onChange={(e) =>
                  updateFormCard(card.id, {
                    estimatedEventBudget: e.target.value,
                  })
                }
                placeholder="0"
                className="
                w-full
                border
                border-[#383847]
                rounded-md
                px-4
                py-3
                text-white
                outline-none
              "
              />
            </div>
          </div>
        )}

        {/* DYNAMIC STAFF INPUTS */}
        {/* DYNAMIC STAFF INPUTS */}
        {Number(card.internalAccompanyingCount) > 0 &&
          card.accompanyingStaffs.map((staff, index) => (
            <div
              key={index}
              className="
          bg-[#232344]
          border
          border-[#383847]
          rounded-2xl
          p-5
          mb-5
        "
            >
              {/* STAFF TITLE */}
              <h3 className="text-[#c084fc] text-lg font-semibold mb-5">
                Staff {index + 1}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* STAFF NAME */}
                <div className="relative">
                  <label
                    className={staffFloatingLabelClass}
                  >
                    Accompanying Staff Name *
                  </label>

                  <input
                    type="text"
                    value={staff.name}
                    onChange={(e) =>
                      handleStaffChange(card.id, index, "name", e.target.value)
                    }
                    required
                    className="
                w-full
              
                border
                border-[#383847]
                rounded-xl
                px-4
                py-4
                text-white
                outline-none
                focus:border-[#3b82f6]
                focus:ring-0
                transition-all
                duration-300
              "
                  />
                </div>

                {/* STAFF MOBILE */}
                <div className="relative">
                  <label
                    className={staffFloatingLabelClass}
                  >
                    Accompanying Staff Mobile Number *
                  </label>

                  <input
                    type="text"
                    value={staff.mobile}
                    onChange={(e) =>
                      handleStaffChange(card.id, index, "mobile", e.target.value)
                    }
                    required
                    className="
                w-full
              
                border
                border-[#383847]
                rounded-xl
                px-4
                py-4
                text-white
                outline-none
                focus:border-[#3b82f6]
                focus:ring-0
                transition-all
                duration-300
              "
                  />
                </div>
              </div>
            </div>
          ))}
        {/* FOOD TYPE SELECTION */}
        <div className="relative mb-6 mt-4">
          <label className={cardFloatingLabelClass}>Food Type *</label>

          <div
            tabIndex={0}
            onClick={() =>
              updateFormCard(card.id, {
                showFoodDropdown: !card.showFoodDropdown,
              })
            }
            className="
              food-select-control
              w-full
              border
              border-[#383847]
              rounded-md
              px-4
              py-3
              flex
              justify-between
              items-center
              cursor-pointer
             
              
              transition-all
            "
          >
            <span
              className={
                Object.values(card.selectedFoodTypes).some((v) => v)
                  ? "text-white"
                  : "text-[#8d8da8]"
              }
            >
              {Object.keys(card.selectedFoodTypes)
                .filter((type) => card.selectedFoodTypes[type])
                .join(" / ") || "Select Food Type"}
            </span>

            <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${
                card.showFoodDropdown ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {card.showFoodDropdown && (
            <div className="absolute w-full mt-2 bg-[#26264a] border border-[#383847] rounded-md overflow-hidden z-50">
              {foodOptions.map((item, index) => {
                const isSelected = card.selectedFoodTypes[item];

                return (
                  <div
                    key={index}
                    onClick={() => {
                      updateFormCard(card.id, {
                        selectedFoodTypes: {
                          ...card.selectedFoodTypes,
                          [item]: !card.selectedFoodTypes[item],
                        },
                      });
                    }}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-[#492A6F] text-white"
                        : "text-white hover:bg-[#492A6F] hover:text-white"
                    }`}
                  >
                    <span>{item}</span>

                    {isSelected && <span>✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SEPARATE FOOD SECTIONS - ONLY FOR BREAKFAST, LUNCH, DINNER */}
        {["Breakfast", "Lunch", "Dinner"].map(
          (type) =>
            card.selectedFoodTypes[type] && (
              <div
                key={type}
                className="
                  bg-[#282846]
                  border
                  border-[#383847]
                  rounded-2xl
                  p-5
                  mt-5
                "
              >
                <h2 className="text-[#c084fc] text-lg font-semibold mb-4">
                  {type}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Veg Participants */}
                  <div className="relative">
                    <label className={foodSectionFloatingLabelClass}>
                      No. of veg In Participants Menu*
                    </label>

                    <input
                      type="number"
                      value={card.foodDetails[type].vegParticipants}
                      onChange={(e) =>
                        updateFormCard(card.id, {
                          foodDetails: {
                            ...card.foodDetails,
                          [type]: {
                              ...card.foodDetails[type],
                            vegParticipants: e.target.value,
                          },
                          },
                        })
                      }
                      placeholder="10"
                      className="
                        w-full
                        bg-[#282846]
                        border
                        border-[#383847]
                        rounded-md
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-[#3b82f6]
                        transition-all
                      "
                    />
                  </div>

                  {/* Veg VIP */}
                  <div className="relative">
                    <label className={foodSectionFloatingLabelClass}>
                      No. of veg In Guest/VIP Menu*
                    </label>

                    <input
                      type="number"
                      value={card.foodDetails[type].vegGuest}
                      onChange={(e) =>
                        updateFormCard(card.id, {
                          foodDetails: {
                            ...card.foodDetails,
                          [type]: {
                              ...card.foodDetails[type],
                            vegGuest: e.target.value,
                          },
                          },
                        })
                      }
                      placeholder="10"
                      className="
                        w-full
                        bg-[#282846]
                        border
                        border-[#383847]
                        rounded-md
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-[#3b82f6]
                        transition-all
                      "
                    />
                  </div>

                  {/* Non Veg Participants */}
                  <div className="relative">
                    <label className={foodSectionFloatingLabelClass}>
                      No. of Non-veg In Participants Menu*
                    </label>

                    <input
                      type="number"
                      value={card.foodDetails[type].nonVegParticipants}
                      onChange={(e) =>
                        updateFormCard(card.id, {
                          foodDetails: {
                            ...card.foodDetails,
                          [type]: {
                              ...card.foodDetails[type],
                            nonVegParticipants: e.target.value,
                          },
                          },
                        })
                      }
                      placeholder="10"
                      className="
                        w-full
                        bg-[#282846]
                        border
                        border-[#383847]
                        rounded-md
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-[#3b82f6]
                        transition-all
                      "
                    />
                  </div>

                  {/* Non Veg VIP */}
                  <div className="relative">
                    <label className={foodSectionFloatingLabelClass}>
                      No. of Non-veg In Guest/VIP Menu*
                    </label>

                    <input
                      type="number"
                      value={card.foodDetails[type].nonVegGuest}
                      onChange={(e) =>
                        updateFormCard(card.id, {
                          foodDetails: {
                            ...card.foodDetails,
                          [type]: {
                              ...card.foodDetails[type],
                            nonVegGuest: e.target.value,
                          },
                          },
                        })
                      }
                      placeholder="10"
                      className="
                        w-full
                        bg-[#282846]
                        border
                        border-[#383847]
                        rounded-md
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-[#3b82f6]
                        transition-all
                      "
                    />
                  </div>
                </div>
              </div>
            )
        )}

        {/* SPECIAL REQUIREMENT */}
        <div className="relative mt-5">
          <label className={cardFloatingLabelClass}>
            Special Requirement
          </label>

          <textarea
            rows={4}
            value={card.specialRequirement}
            onChange={(e) =>
              updateFormCard(card.id, {
                specialRequirement: e.target.value,
              })
            }
            placeholder="Enter any special requirements"
            className="
              w-full
           
              border
              border-[#383847]
              rounded-md
              px-4
              py-3
              outline-none
              resize-none
              text-white
              focus:border-[#3b82f6]
              focus:ring-0
              focus:ring-[#3b82f6]
              transition-all
            "
          />
        </div>

        {/* ERRORS */}
        {validationErrors.length > 0 && (
          <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200">
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* SUCCESS */}
        {submitMessage && (
          <div className="mt-6 rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-200">
            {submitMessage}
          </div>
        )}
      </div>
      </div>
      ))}

        <div className="flex justify-center md:justify-end mt-8">
    <button
      type="button"
      onClick={handleSubmit}
     disabled={isSubmitting}
      className="
      bg-[#8b5cf6]
      hover:bg-[#7c3aed]
      disabled:opacity-60
      disabled:cursor-not-allowed
      text-white
      font-medium
      text-sm
      px-6
      py-2.5
      rounded-md
      flex
      items-center
      gap-2
      transition-all
      duration-300
    "
    >
      {isSubmitting ? "Submitting..." : "Submit"}

      <ArrowRight size={16} />
    </button>
  </div>
    </div>
  );
};

export default IndividualFoodAndRefreshment;
