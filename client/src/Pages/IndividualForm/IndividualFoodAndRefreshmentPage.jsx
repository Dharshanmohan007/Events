import React, { useEffect, useState, useRef } from "react";

import {
  ChevronDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
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
    if (!value) return placeholder || "__/__/____";

    const d = value;

    const dd = String(d.getDate()).padStart(2, "0");

    const mm = String(d.getMonth() + 1).padStart(2, "0");

    const yyyy = d.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  };

  const handleDayClick = (day) => {
    const newDate = new Date(displayYear, displayMonth, day);

    selectDate(newDate);
  };

  const selectDate = (date) => {
    const newDate = new Date(date);

    newDate.setHours(0, 0, 0, 0);

    setSelectedDate(newDate);

    setDisplayMonth(newDate.getMonth());

    setDisplayYear(newDate.getFullYear());

    onChange(newDate);

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

  const [showResourceDropdown, setShowResourceDropdown] = useState(false);

  const [showFoodDropdown, setShowFoodDropdown] = useState(false);

  const [formCards, setFormCards] = useState([Date.now()]);

  // =========================
  // SELECTED VALUES
  // =========================

  // CHANGE THIS
  const [resourceType, setResourceType] = useState([]); // MULTISELECT ARRAY

const [selectedFoodTypes, setSelectedFoodTypes] = useState({
    Breakfast: false,
    Lunch: false,
    Dinner: false,
    "Morning Refreshment": false,
    "Evening Refreshment": false,
  });

  const [foodDetails, setFoodDetails] = useState({
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
  });
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
  // AUTH
  // =========================

  const [employeeId, setEmployeeId] = useState("");

  const [token, setToken] = useState("");

  const [specialRequirement, setSpecialRequirement] = useState("");

  const [validationErrors, setValidationErrors] = useState([]);

  const [submitMessage, setSubmitMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddForm = () => {
    setFormCards((prev) => [...prev, Date.now()]);
  };

  const handleDeleteForm = (cardId) => {
    setFormCards((prev) => prev.filter((id) => id !== cardId));
  };

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
    const selectedFoodList = Object.keys(selectedFoodTypes).filter(
      (type) => selectedFoodTypes[type]
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
            vegCount: Number(foodDetails[type].vegParticipants) || 0,
            nonVegCount: Number(foodDetails[type].nonVegParticipants) || 0,
          },
          vipGuests: {
            vegCount: Number(foodDetails[type].vegGuest) || 0,
            nonVegCount: Number(foodDetails[type].nonVegGuest) || 0,
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

      date: selectDate
        ? new Date(
            selectDate.getTime() - selectDate.getTimezoneOffset() * 60000,
          ).toISOString()
        : null,

      resourcePersonType: resourceType,

      numberOfResourcePersons: Number(totalResourcePerson) || 0,

      numberOfInternalAccompanyingStaff: Number(internalAccompanyingCount) || 0,

      accompanyingStaff: accompanyingStaffs.map((staff) => ({
        name: staff.name.trim(),
        mobile: staff.mobile,
      })),

      foodTypes: foodTypesPayload,

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

    const selectedFoodList = Object.keys(selectedFoodTypes).filter(
      (type) => selectedFoodTypes[type]
    );

    if (selectedFoodList.length === 0)
      errors.push("Select at least one Food Type.");

    // Only validate Breakfast, Lunch, Dinner for details
    const mealTypes = ["Breakfast", "Lunch", "Dinner"];
    selectedFoodList.forEach((type) => {
      if (mealTypes.includes(type)) {
        if (!foodDetails[type].vegParticipants)
          errors.push(`${type}: Veg Participants count is required.`);
        if (!foodDetails[type].nonVegParticipants)
          errors.push(`${type}: Non-Veg Participants count is required.`);
        if (!foodDetails[type].vegGuest)
          errors.push(`${type}: Veg Guest count is required.`);
        if (!foodDetails[type].nonVegGuest)
          errors.push(`${type}: Non-Veg Guest count is required.`);
      }
    });

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
        Food and Refreshment
      </h1>

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

      {formCards.map((cardId, cardIndex) => (
      <div key={cardId} className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-white text-xl font-semibold">
          Food and Refreshment
        </h2>

        {cardIndex > 0 && (
          <button
            type="button"
            onClick={() => handleDeleteForm(cardId)}
            aria-label="Delete food and refreshment form"
            className="flex h-10 w-1 items-center justify-center rounded-full bg-[#ffd6d6] text-[#ff2b2b] hover:bg-[#ffc7c7] focus:border-[#3b82f6]"
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
            value={selectDate}
            onChange={setSelectDate}
            placeholder="Select Date & Time"
          />

          {/* RESOURCE PERSON TYPE */}
          {/* RESOURCE PERSON TYPE */}
          <div className="relative">
            <label className={cardFloatingLabelClass}>
              Type of resource Person*
            </label>

            <div
              tabIndex={0}
              onClick={() => setShowResourceDropdown(!showResourceDropdown)}
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
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#383847] rounded-md overflow-hidden z-50">
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
                          ? "bg-[#492A6F] text-white"
                          : "hover:bg-[#492A6F]"
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
              value={totalResourcePerson}
              onChange={(e) => setTotalResourcePerson(e.target.value)}
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
              value={internalAccompanyingCount}
              onChange={(e) => handleStaffCount(e.target.value)}
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

        {/* DYNAMIC STAFF INPUTS */}
        {/* DYNAMIC STAFF INPUTS */}
        {Number(internalAccompanyingCount) > 0 &&
          accompanyingStaffs.map((staff, index) => (
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
                      handleStaffChange(index, "name", e.target.value)
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
                      handleStaffChange(index, "mobile", e.target.value)
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
        <div className="relative mb-6">
          <label className={cardFloatingLabelClass}>Food Type *</label>

          <div
            tabIndex={0}
            onClick={() => setShowFoodDropdown(!showFoodDropdown)}
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
                Object.values(selectedFoodTypes).some((v) => v)
                  ? "text-white"
                  : "text-[#8d8da8]"
              }
            >
              {Object.keys(selectedFoodTypes)
                .filter((type) => selectedFoodTypes[type])
                .join(" / ") || "Select Food Type"}
            </span>

            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                showFoodDropdown ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {showFoodDropdown && (
            <div className="absolute w-full mt-2 bg-[#26264a] border border-[#383847] rounded-md overflow-hidden z-50">
              {foodOptions.map((item, index) => {
                const isSelected = selectedFoodTypes[item];

                return (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedFoodTypes((prev) => ({
                        ...prev,
                        [item]: !prev[item],
                      }));
                    }}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-[#492A6F] text-white"
                        : "hover:bg-[#492A6F]"
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
            selectedFoodTypes[type] && (
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
                      value={foodDetails[type].vegParticipants}
                      onChange={(e) =>
                        setFoodDetails((prev) => ({
                          ...prev,
                          [type]: {
                            ...prev[type],
                            vegParticipants: e.target.value,
                          },
                        }))
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
                      value={foodDetails[type].vegGuest}
                      onChange={(e) =>
                        setFoodDetails((prev) => ({
                          ...prev,
                          [type]: {
                            ...prev[type],
                            vegGuest: e.target.value,
                          },
                        }))
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
                      value={foodDetails[type].nonVegParticipants}
                      onChange={(e) =>
                        setFoodDetails((prev) => ({
                          ...prev,
                          [type]: {
                            ...prev[type],
                            nonVegParticipants: e.target.value,
                          },
                        }))
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
                      value={foodDetails[type].nonVegGuest}
                      onChange={(e) =>
                        setFoodDetails((prev) => ({
                          ...prev,
                          [type]: {
                            ...prev[type],
                            nonVegGuest: e.target.value,
                          },
                        }))
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
            value={specialRequirement}
            onChange={(e) =>
              setSpecialRequirement(e.target.value)
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
    {isSubmitting ? "Submitting..." : "Next"}

    <ArrowRight size={16} />
  </button>
</div>
    </div>
  );
};

export default IndividualFoodAndRefreshment;
