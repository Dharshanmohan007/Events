import React, { useEffect, useState, useRef, useCallback } from "react";

import {
  ChevronDown,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
} from "lucide-react";

import { jwtDecode } from "jwt-decode";

import { API_BASE } from "../../utils/apiConfig";

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

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function ScrollDrum({ items, value, onChange }) {
  const containerRef = useRef(null);

  const ITEM_H = 40;

  const isScrollingRef = useRef(false);

  const scrollTimerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    el.scrollTop = value * ITEM_H;
  }, [value]);

  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;

    const el = containerRef.current;

    if (!el) return;

    clearTimeout(scrollTimerRef.current);

    scrollTimerRef.current = setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_H);

      const clamped = Math.max(0, Math.min(items.length - 1, idx));

      el.scrollTop = clamped * ITEM_H;

      if (clamped !== value) onChange(clamped);

      isScrollingRef.current = false;
    }, 80);
  }, [items.length, onChange, value]);

  return (
    <div className="relative flex flex-col items-center" style={{ width: 56 }}>
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none rounded-t-lg"
        style={{
          height: ITEM_H * 2,
          background:
            "linear-gradient(to bottom, #1a1a35 0%, transparent 100%)",
        }}
      />

      <div
        className="absolute left-0 right-0 z-10 pointer-events-none rounded-md border border-purple-500/40 bg-purple-600/10"
        style={{
          top: ITEM_H * 2,
          height: ITEM_H,
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none rounded-b-lg"
        style={{
          height: ITEM_H * 2,
          background: "linear-gradient(to top, #1a1a35 0%, transparent 100%)",
        }}
      />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: ITEM_H * 5,
          overflowY: "scroll",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="w-full drum-scroll"
      >
        <style>{`
          .drum-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div
          style={{
            height: ITEM_H * 2,
          }}
        />

        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => {
              onChange(i);

              containerRef.current.scrollTop = i * ITEM_H;
            }}
            style={{
              height: ITEM_H,
            }}
            className={`flex items-center justify-center text-base font-mono cursor-pointer select-none transition-colors ${
              i === value
                ? "text-white font-semibold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {item}
          </div>
        ))}

        <div
          style={{
            height: ITEM_H * 2,
          }}
        />
      </div>
    </div>
  );
}

function CustomDateTimePicker({ label, value, onChange, placeholder }) {
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

  const HOURS = Array.from({ length: 12 }, (_, i) =>
    String(i === 0 ? 12 : i).padStart(2, "0"),
  );

  const MINUTES = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  const getHourIdx = (d) => {
    if (!d) return 0;

    const h = d.getHours() % 12;

    return h === 0 ? 0 : h;
  };

  const [hourIdx, setHourIdx] = useState(() => getHourIdx(value));

  const [minuteIdx, setMinuteIdx] = useState(() =>
    value ? value.getMinutes() : 0,
  );

  const [ampm, setAmpm] = useState(() =>
    value ? (value.getHours() >= 12 ? "PM" : "AM") : "AM",
  );

  const ref = useRef(null);

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
    if (!value) return placeholder || "__/__/____ --:-- --";

    const d = value;

    const dd = String(d.getDate()).padStart(2, "0");

    const mm = String(d.getMonth() + 1).padStart(2, "0");

    const yyyy = d.getFullYear();

    const rawH = d.getHours();

    const h12 = rawH === 0 ? 12 : rawH > 12 ? rawH - 12 : rawH;

    const hh = String(h12).padStart(2, "0");

    const min = String(d.getMinutes()).padStart(2, "0");

    const ap = rawH >= 12 ? "PM" : "AM";

    return `${dd}/${mm}/${yyyy} ${hh}:${min} ${ap}`;
  };

  const commitDateTime = useCallback(
    (date, hIdx, mIdx, ap) => {
      if (!date) return;

      const d = new Date(date);

      let hours = hIdx % 12;

      if (ap === "PM") hours += 12;

      d.setHours(hours, mIdx, 0, 0);

      onChange(d);
    },
    [onChange],
  );

  const handleDayClick = (day) => {
    const newDate = new Date(displayYear, displayMonth, day);

    setSelectedDate(newDate);

    commitDateTime(newDate, hourIdx, minuteIdx, ampm);

    setView("time");
  };

  const handleTimeConfirm = () => {
    commitDateTime(selectedDate, hourIdx, minuteIdx, ampm);

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
      <span className="block text-sm mb-2">{label}</span>

      <button
        type="button"
        onClick={() => {
          setOpen((p) => !p);

          setView("calendar");
        }}
        className="
          w-full
          bg-[#1f1f38]
          border
          border-[#3a3a5a]
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

          <Clock size={18} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 bg-[#1a1a35] border border-[#3A3A5A] rounded-xl shadow-2xl w-72 overflow-hidden">
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

              <button
                type="button"
                onClick={() => setView("time")}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#3A3A5A] text-gray-400 text-xs"
              >
                <Clock size={14} />
                Set Time
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

          {/* TIME */}
          {view === "time" && (
            <div className="p-4">
              <div className="flex items-center justify-center gap-2">
                <ScrollDrum
                  items={HOURS}
                  value={hourIdx}
                  onChange={(i) => {
                    setHourIdx(i);
                  }}
                />

                <span className="text-white text-2xl font-mono">:</span>

                <ScrollDrum
                  items={MINUTES}
                  value={minuteIdx}
                  onChange={(i) => {
                    setMinuteIdx(i);
                  }}
                />

                <div className="flex flex-col gap-2 ml-2">
                  {["AM", "PM"].map((ap) => (
                    <button
                      key={ap}
                      type="button"
                      onClick={() => setAmpm(ap)}
                      className={`w-12 py-2 rounded-lg text-xs font-semibold ${
                        ampm === ap
                          ? "bg-purple-600 text-white"
                          : "bg-[#2a2a4a] text-gray-400"
                      }`}
                    >
                      {ap}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleTimeConfirm}
                className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium"
              >
                Confirm
              </button>
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

  const [showResourceDropdown, setShowResourceDropdown] = useState(false);

  const [showFoodDropdown, setShowFoodDropdown] = useState(false);

  // =========================
  // SELECTED VALUES
  // =========================

  // CHANGE THIS
  const [resourceType, setResourceType] = useState([]); // MULTISELECT ARRAY

  const [foodType, setFoodType] = useState("");
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

  // =========================
  // INPUT STATES
  // =========================

  const [selectDate, setSelectDate] = useState(null);

  const [totalResourcePerson, setTotalResourcePerson] = useState("");

  const [internalAccompanyingCount, setInternalAccompanyingCount] =
    useState("1");

  // =========================
  // DEFAULT ONE STAFF INPUT
  // =========================

  const [accompanyingStaffs, setAccompanyingStaffs] = useState([
    {
      name: "",
      mobile: "",
    },
  ]);

  // =========================
  // FOOD STATES
  // =========================

  const [vegParticipants, setVegParticipants] = useState("");

  const [vegGuest, setVegGuest] = useState("");

  const [nonVegParticipants, setNonVegParticipants] = useState("");

  const [nonVegGuest, setNonVegGuest] = useState("");

  // =========================
  // AUTH
  // =========================

  const [employeeId, setEmployeeId] = useState("");

  const [token, setToken] = useState("");

  const [specialRequirement, setSpecialRequirement] = useState("");

  const [validationErrors, setValidationErrors] = useState([]);

  const [submitMessage, setSubmitMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);

      try {
        const decoded = jwtDecode(storedToken);

        if (decoded?.id) {
          setEmployeeId(decoded.id);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  // =========================
  // HANDLE STAFF COUNT
  // =========================

  const handleStaffCount = (value) => {
    setInternalAccompanyingCount(value);

    const count = Number(value);

    if (value === "" || !Number.isInteger(count) || count < 1) {
      if (accompanyingStaffs.length === 0) {
        setAccompanyingStaffs([
          {
            name: "",
            mobile: "",
          },
        ]);
      }

      return;
    }

    const updatedStaffs = Array.from(
      {
        length: count,
      },
      (_, index) => ({
        name: accompanyingStaffs[index]?.name || "",
        mobile: accompanyingStaffs[index]?.mobile || "",
      }),
    );

    setAccompanyingStaffs(updatedStaffs);
  };

  // =========================
  // HANDLE STAFF INPUT
  // =========================

  const handleStaffChange = (index, field, value) => {
    const updated = [...accompanyingStaffs];

    updated[index][field] = value;

    setAccompanyingStaffs(updated);
  };

  // =========================
  // BUILD PAYLOAD
  // =========================

  // =========================
  // BUILD PAYLOAD
  // =========================

  const buildFoodPayload = () => {
    const participants = {
      vegCount: Number(vegParticipants) || 0,

      nonVegCount: Number(nonVegParticipants) || 0,
    };

    const vipGuests = {
      vegCount: Number(vegGuest) || 0,

      nonVegCount: Number(nonVegGuest) || 0,
    };

    return {
      employee: employeeId || "6a0411af4579d3137b255e70",

      date: selectDate
        ? new Date(
            selectDate.getTime() - selectDate.getTimezoneOffset() * 60000,
          ).toISOString()
        : null,

      // CHANGE THIS
      resourcePersonType: resourceType,

      numberOfResourcePersons: Number(totalResourcePerson) || 0,

      numberOfInternalAccompanyingStaff: Number(internalAccompanyingCount) || 0,

      accompanyingStaff: accompanyingStaffs.map((staff) => ({
        name: staff.name.trim(),
        mobile: staff.mobile,
      })),

      foodTypes: foodType
        ? [
            {
              type: foodType,
              participants,
              vipGuests,
            },
          ]
        : [],

      participants,

      vipGuests,

      specialRequirements: specialRequirement.trim(),

      status: "Pending",
    };
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async () => {
    const errors = [];

    if (!selectDate) errors.push("Select Date is required.");

    if (!resourceType) errors.push("Resource Person Type is required.");

    if (!totalResourcePerson) errors.push("Total Resource Person is required.");

    if (!internalAccompanyingCount || Number(internalAccompanyingCount) < 1)
      errors.push("Internal Accompanying Person count is required.");

    if (accompanyingStaffs.some((staff) => !staff.name.trim())) {
      errors.push("Accompanying staff name is required.");
    }

    if (accompanyingStaffs.some((staff) => !staff.mobile)) {
      errors.push("Accompanying staff mobile number is required.");
    }

    if (!foodType) errors.push("Food Type is required.");

    if (!vegParticipants) errors.push("Veg Participants count is required.");

    if (!nonVegParticipants)
      errors.push("Non-Veg Participants count is required.");

    if (!vegGuest) errors.push("Veg Guest count is required.");

    if (!nonVegGuest) errors.push("Non-Veg Guest count is required.");

    setValidationErrors(errors);

    setSubmitMessage("");

    if (errors.length) return;

    setIsSubmitting(true);

    try {
      const payload = buildFoodPayload();

      console.log("Food submit payload:", payload);

      const response = await fetch(`${API_BASE}/api/foods`, {
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

      const data = await response.json();

      console.log("Food submit response:", response.status, data);

      if (!response.ok) {
        throw new Error(
          data?.message || `Food submission failed: ${response.status}`,
        );
      }

      setValidationErrors([]);

      setSubmitMessage("Food request submitted successfully.");
    } catch (error) {
      setValidationErrors([error.message || "Unable to send food data."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141428] text-white p-6">
      {/* TITLE */}
      <h1 className="text-white text-3xl font-bold mb-6">
        Food and Refreshment
      </h1>

      {/* HEADER */}
      <div className="flex justify-end mb-6">
        <button
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

      {/* MAIN CARD */}
      <div
        className="
          bg-[#1b1b35]
          border
          border-[#2d2d4d]
          rounded-2xl
          p-5
        "
      >
        {/* TOP INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* DATE */}
          <CustomDateTimePicker
            label="Select Date*"
            value={selectDate}
            onChange={setSelectDate}
            placeholder="Select Date & Time"
          />

          {/* RESOURCE PERSON TYPE */}
          {/* RESOURCE PERSON TYPE */}
          <div className="relative">
            <label className="block text-sm mb-2">
              Type of resource Person*
            </label>

            <div
              onClick={() => setShowResourceDropdown(!showResourceDropdown)}
              className="
    w-full
    bg-[#1f1f38]
    border
    border-[#3a3a5a]
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
                  resourceType.length > 0 ? "text-white" : "text-[#8d8da8]"
                }
              >
                {resourceType.length > 0
                  ? resourceType.join(", ")
                  : "VIP / Trainer / Placement"}
              </span>

              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${
                  showResourceDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>

            {showResourceDropdown && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                {resourceOptions.map((item, index) => {
                  const isSelected = resourceType.includes(item);

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (isSelected) {
                          setResourceType(
                            resourceType.filter((type) => type !== item),
                          );
                        } else {
                          setResourceType([...resourceType, item]);
                        }
                      }}
                      className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#3b82f6] text-white"
                          : "hover:bg-[#3b82f6]"
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
          <div>
            <label className="block text-sm mb-2">
              Total number of resource Person*
            </label>

            <input
              type="number"
              value={totalResourcePerson}
              onChange={(e) => setTotalResourcePerson(e.target.value)}
              placeholder="5"
              className="
                  w-full
                  bg-[#1f1f38]
                  border
                  border-[#3a3a5a]
                  rounded-md
                  px-4
                  py-3
                  text-white
                  outline-none
                "
            />
          </div>

          {/* INTERNAL ACCOMPANYING COUNT */}
          <div>
            <label className="block text-sm mb-2">
              Total number of Internal Accompanying Person*
            </label>

            <input
              type="number"
              min="1"
              value={internalAccompanyingCount}
              onChange={(e) => handleStaffCount(e.target.value)}
              className="
                  w-full
                  bg-[#1f1f38]
                  border
                  border-[#3a3a5a]
                  rounded-md
                  px-4
                  py-3
                  text-white
                  outline-none
                "
            />
          </div>
        </div>

        {/* DYNAMIC STAFF INPUTS */}
        {/* DYNAMIC STAFF INPUTS */}
        {Number(internalAccompanyingCount) > 0 &&
          accompanyingStaffs.map((staff, index) => (
            <div
              key={index}
              className="
          bg-[#232344]
          border
          border-[#2f2f52]
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
                    className="
                absolute
                -top-3
                left-4
                px-2
                text-sm
                text-white
                bg-[#232344]
                z-10
              "
                  >
                    Accompanying Staff Name *
                  </label>

                  <input
                    type="text"
                    value={staff.name}
                    onChange={(e) =>
                      handleStaffChange(index, "name", e.target.value)
                    }
                    required
                    className="
                w-full
                bg-transparent
                border
                border-[#7c3aed]
                rounded-xl
                px-4
                py-4
                text-white
                outline-none
                focus:border-[#a855f7]
                transition-all
                duration-300
              "
                  />
                </div>

                {/* STAFF MOBILE */}
                <div className="relative">
                  <label
                    className="
                absolute
                -top-3
                left-4
                px-2
                text-sm
                text-white
                bg-[#232344]
                z-10
              "
                  >
                    Accompanying Staff Mobile Number *
                  </label>

                  <input
                    type="text"
                    value={staff.mobile}
                    onChange={(e) =>
                      handleStaffChange(index, "mobile", e.target.value)
                    }
                    required
                    className="
                w-full
                bg-transparent
                border
                border-[#7c3aed]
                rounded-xl
                px-4
                py-4
                text-white
                outline-none
                focus:border-[#a855f7]
                transition-all
                duration-300
              "
                  />
                </div>
              </div>
            </div>
          ))}
        {/* FOOD TYPE */}
        <div className="relative mb-6">
          <label className="block text-sm mb-2">Food Type *</label>

          <div
            onClick={() => setShowFoodDropdown(!showFoodDropdown)}
            className="
              w-full
              bg-[#1f1f38]
              border
              border-[#3a3a5a]
              rounded-md
              px-4
              py-3
              flex
              justify-between
              items-center
              cursor-pointer
            "
          >
            <span className={foodType ? "text-white" : "text-[#8d8da8]"}>
              {foodType ||
                "Breakfast / Lunch / Dinner / Morning Refreshment / Evening Refreshment"}
            </span>

            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                showFoodDropdown ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {showFoodDropdown && (
            <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
              {foodOptions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setFoodType(item);

                    setShowFoodDropdown(false);
                  }}
                  className="px-4 py-3 hover:bg-[#3b82f6] cursor-pointer"
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOD SECTION */}
        {foodType && (
          <div
            className="
              bg-[#252547]
              rounded-xl
              p-5
              mb-6
            "
          >
            <h2 className="text-[#a855f7] text-xl font-bold mb-5">
              {foodType}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* VEG PARTICIPANTS */}
              <div>
                <label className="block text-sm mb-2">
                  No. of veg In Participants Menu*
                </label>

                <input
                  type="number"
                  value={vegParticipants}
                  onChange={(e) => setVegParticipants(e.target.value)}
                  placeholder="10"
                  className="
                      w-full
                      bg-[#1f1f38]
                      border
                      border-[#3a3a5a]
                      rounded-md
                      px-4
                      py-3
                      text-white
                      outline-none
                    "
                />
              </div>

              {/* VEG GUEST */}
              <div>
                <label className="block text-sm mb-2">
                  No. of veg In Guest/VIP Menu*
                </label>

                <input
                  type="number"
                  value={vegGuest}
                  onChange={(e) => setVegGuest(e.target.value)}
                  placeholder="10"
                  className="
                      w-full
                      bg-[#1f1f38]
                      border
                      border-[#3a3a5a]
                      rounded-md
                      px-4
                      py-3
                      text-white
                      outline-none
                    "
                />
              </div>

              {/* NON VEG PARTICIPANTS */}
              <div>
                <label className="block text-sm mb-2">
                  No. of Non-veg In Participants Menu*
                </label>

                <input
                  type="number"
                  value={nonVegParticipants}
                  onChange={(e) => setNonVegParticipants(e.target.value)}
                  placeholder="10"
                  className="
                      w-full
                      bg-[#1f1f38]
                      border
                      border-[#3a3a5a]
                      rounded-md
                      px-4
                      py-3
                      text-white
                      outline-none
                    "
                />
              </div>

              {/* NON VEG GUEST */}
              <div>
                <label className="block text-sm mb-2">
                  No. of Non-veg In Guest/VIP Menu*
                </label>

                <input
                  type="number"
                  value={nonVegGuest}
                  onChange={(e) => setNonVegGuest(e.target.value)}
                  placeholder="10"
                  className="
                      w-full
                      bg-[#1f1f38]
                      border
                      border-[#3a3a5a]
                      rounded-md
                      px-4
                      py-3
                      text-white
                      outline-none
                    "
                />
              </div>
            </div>

            {/* SPECIAL REQUIREMENTS */}
            <div className="mt-5">
              <label className="block text-sm mb-2">Special Requirements</label>

              <textarea
                rows={4}
                value={specialRequirement}
                onChange={(e) => setSpecialRequirement(e.target.value)}
                placeholder="Enter special requirements"
                className="w-full bg-[#1f1f38] border border-[#3a3a5a] rounded-md px-4 py-3 text-white outline-none resize-none"
              />
            </div>
          </div>
        )}

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
              font-semibold
              text-lg
              px-12
              py-4
              rounded-xl
              flex
              items-center
              gap-3
              transition-all
              duration-300
              shadow-lg
              shadow-purple-900/40
            "
        >
          {isSubmitting ? "Submitting..." : "Next"}

          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default IndividualFoodAndRefreshment;
