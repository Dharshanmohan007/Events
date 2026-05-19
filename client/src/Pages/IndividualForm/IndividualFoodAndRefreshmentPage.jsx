import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  CalendarDays,
  Plus,
  ArrowRight,
} from "lucide-react";
import {jwtDecode} from "jwt-decode";
import { API_BASE } from "../../utils/apiConfig";

const IndividualFoodAndRefreshment = () => {
  // =========================
  // DROPDOWNS
  // =========================
  const [showResourceDropdown, setShowResourceDropdown] =
    useState(false);

  const [showFoodDropdown, setShowFoodDropdown] =
    useState(false);

  // =========================
  // SELECTED VALUES
  // =========================
  const [resourceType, setResourceType] =
    useState("");

  const [foodType, setFoodType] =
    useState("");

  // =========================
  // OPTIONS
  // =========================
  const resourceOptions = [
    "VIP",
    "Trainer",
    "Placement",
  ];

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
  const [selectDate, setSelectDate] =
    useState("");

  const [
    totalResourcePerson,
    setTotalResourcePerson,
  ] = useState("");

  const [
    internalAccompanyingCount,
    setInternalAccompanyingCount,
  ] = useState("1");

  // =========================
  // DEFAULT ONE STAFF INPUT
  // =========================
  const [
    accompanyingStaffs,
    setAccompanyingStaffs,
  ] = useState([
    {
      name: "",
      mobile: "",
    },
  ]);

  // =========================
  // FOOD STATES
  // =========================
  const [
    vegParticipants,
    setVegParticipants,
  ] = useState("");

  const [vegGuest, setVegGuest] =
    useState("");

  const [
    nonVegParticipants,
    setNonVegParticipants,
  ] = useState("");

  const [nonVegGuest, setNonVegGuest] =
    useState("");

  // =========================
  // HANDLE STAFF COUNT
  // =========================
  const handleStaffCount = (value) => {
    setInternalAccompanyingCount(value);

    const count = parseInt(value);

    if (!count || count < 1) {
      setAccompanyingStaffs([
        {
          name: "",
          mobile: "",
        },
      ]);

      return;
    }

    const updatedStaffs = Array.from(
      { length: count },
      (_, index) => ({
        name:
          accompanyingStaffs[index]
            ?.name || "",
        mobile:
          accompanyingStaffs[index]
            ?.mobile || "",
      })
    );

    setAccompanyingStaffs(
      updatedStaffs
    );
  };

  // =========================
  // HANDLE STAFF INPUT
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

  const handleStaffChange = (
    index,
    field,
    value
  ) => {
    const updated = [
      ...accompanyingStaffs,
    ];

    updated[index][field] = value;

    setAccompanyingStaffs(updated);
  };

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
      employee:
        employeeId || "6a0411af4579d3137b255e70",
      date: selectDate
        ? new Date(selectDate).toISOString()
        : null,
      resourcePersonType: resourceType
        ? [resourceType]
        : [],
      numberOfResourcePersons:
        Number(totalResourcePerson) || 0,
      numberOfInternalAccompanyingStaff:
        Number(internalAccompanyingCount) || 0,
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
      specialRequirements:
        specialRequirement.trim(),
      status: "Pending",
    };
  };

  const handleSubmit = async () => {
    const errors = [];
    if (!selectDate) errors.push("Select Date is required.");
    if (!resourceType) errors.push("Resource Person Type is required.");
    if (!totalResourcePerson) errors.push("Total Resource Person is required.");
    if (!internalAccompanyingCount) errors.push("Internal Accompanying Person count is required.");
    if (
      accompanyingStaffs.some(
        (staff) => !staff.name.trim() || !staff.mobile
      )
    ) {
      errors.push(
        "All accompanying staff must have a name and mobile number."
      );
    }
    if (!foodType) errors.push("Food Type is required.");
    if (!vegParticipants) errors.push("Veg Participants count is required.");
    if (!nonVegParticipants) errors.push("Non-Veg Participants count is required.");
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Food submit response:", response.status, data);

      if (!response.ok) {
        throw new Error(
          data?.message || `Food submission failed: ${response.status}`
        );
      }

      setValidationErrors([]);
      setSubmitMessage("Food request submitted successfully.");
    } catch (error) {
      setValidationErrors([
        error.message || "Unable to send food data.",
      ]);
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
          <div>
            <label className="block text-sm mb-2">
              Select Date*
            </label>

            <div className="relative">
              <input
                type="date"
                value={selectDate}
                onChange={(e) =>
                  setSelectDate(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-[#1f1f38]
                  border
                  border-[#3a3a5a]
                  rounded-md
                  px-4
                  py-3
                  pr-12
                  text-white
                  outline-none
                  appearance-none
                "
              />

              <CalendarDays
                size={18}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#b0b0c3]
                  pointer-events-none
                "
              />
            </div>
          </div>

          {/* RESOURCE PERSON TYPE */}
          <div className="relative">
            <label className="block text-sm mb-2">
              Type of resource Person*
            </label>

            <div
              onClick={() =>
                setShowResourceDropdown(
                  !showResourceDropdown
                )
              }
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
                  resourceType
                    ? "text-white"
                    : "text-[#8d8da8]"
                }
              >
                {resourceType ||
                  "VIP / Trainer / Placement"}
              </span>

              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${
                  showResourceDropdown
                    ? "rotate-180"
                    : "rotate-0"
                }`}
              />
            </div>

            {showResourceDropdown && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                {resourceOptions.map(
                  (item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setResourceType(
                          item
                        );

                        setShowResourceDropdown(
                          false
                        );
                      }}
                      className="px-4 py-3 hover:bg-[#3b82f6] cursor-pointer"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* TOTAL RESOURCE PERSON */}
          <div>
            <label className="block text-sm mb-2">
              Total number of resource
              Person*
            </label>

            <input
              type="number"
              value={totalResourcePerson}
              onChange={(e) =>
                setTotalResourcePerson(
                  e.target.value
                )
              }
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
              Total number of Internal
              Accompanying Person*
            </label>

            <input
              type="number"
              min="1"
              value={
                internalAccompanyingCount
              }
              onChange={(e) =>
                handleStaffCount(
                  e.target.value
                )
              }
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
        {accompanyingStaffs.map(
          (staff, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5"
            >
              {/* STAFF NAME */}
              <div>
                <label className="block text-sm mb-2">
                  Internal
                  Accompanying staff
                  name {index + 1} *
                </label>

                <input
                  type="text"
                  value={staff.name}
                  onChange={(e) =>
                    handleStaffChange(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                  placeholder={`Enter staff ${
                    index + 1
                  } name`}
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

              {/* STAFF MOBILE */}
              <div>
                <label className="block text-sm mb-2">
                  Internal
                  Accompanying staff
                  Mobile number{" "}
                  {index + 1} *
                </label>

                <input
                  type="text"
                  value={staff.mobile}
                  onChange={(e) =>
                    handleStaffChange(
                      index,
                      "mobile",
                      e.target.value
                    )
                  }
                  placeholder={`Enter mobile number ${
                    index + 1
                  }`}
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
          )
        )}

        {/* FOOD TYPE */}
        <div className="relative mb-6">
          <label className="block text-sm mb-2">
            Food Type *
          </label>

          <div
            onClick={() =>
              setShowFoodDropdown(
                !showFoodDropdown
              )
            }
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
                foodType
                  ? "text-white"
                  : "text-[#8d8da8]"
              }
            >
              {foodType ||
                "Breakfast / Lunch / Dinner / Morning Refreshment / Evening Refreshment"}
            </span>

            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                showFoodDropdown
                  ? "rotate-180"
                  : "rotate-0"
              }`}
            />
          </div>

          {showFoodDropdown && (
            <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
              {foodOptions.map(
                (item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setFoodType(item);

                      setShowFoodDropdown(
                        false
                      );
                    }}
                    className="px-4 py-3 hover:bg-[#3b82f6] cursor-pointer"
                  >
                    {item}
                  </div>
                )
              )}
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
                  No. of veg In
                  Participants Menu*
                </label>

                <input
                  type="number"
                  value={vegParticipants}
                  onChange={(e) =>
                    setVegParticipants(
                      e.target.value
                    )
                  }
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
                  No. of veg In
                  Guest/VIP Menu*
                </label>

                <input
                  type="number"
                  value={vegGuest}
                  onChange={(e) =>
                    setVegGuest(
                      e.target.value
                    )
                  }
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
                  No. of Non-veg In
                  Participants Menu*
                </label>

                <input
                  type="number"
                  value={
                    nonVegParticipants
                  }
                  onChange={(e) =>
                    setNonVegParticipants(
                      e.target.value
                    )
                  }
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
                  No. of Non-veg In
                  Guest/VIP Menu*
                </label>

                <input
                  type="number"
                  value={nonVegGuest}
                  onChange={(e) =>
                    setNonVegGuest(
                      e.target.value
                    )
                  }
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

            <div className="mt-5">
              <label className="block text-sm mb-2">
                Special Requirements
              </label>
              <textarea
                rows={4}
                value={specialRequirement}
                onChange={(e) =>
                  setSpecialRequirement(
                    e.target.value
                  )
                }
                placeholder="Enter special requirements"
                className="w-full bg-[#1f1f38] border border-[#3a3a5a] rounded-md px-4 py-3 text-white outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* NEXT BUTTON */}

        {validationErrors.length > 0 && (
          <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200">
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

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