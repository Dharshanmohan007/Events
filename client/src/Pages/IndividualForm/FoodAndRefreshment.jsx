import React, { useState } from "react";
import {
  ChevronDown,
  CalendarDays,
  Plus,
} from "lucide-react";

const FoodAndRefreshment = () => {
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

  // DEFAULT VALUE = 1
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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#141428] text-slate-900 dark:text-black p-6 transition-colors">
      <h1 className="text-slate-900 dark:text-white text-3xl"></h1>
      {/* HEADER */}
      <div className="flex justify-end mb-6">
        <button
          className="
            bg-[#7c3aed]
            hover:bg-[#6d28d9]
            text-white
            px-5
            py-2
            rounded-md
            font-medium
            flex
            items-center
            gap-2
          "
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* MAIN CARD */}
      <div
        className="
          bg-white
          dark:bg-[#1b1b35]
          border
          border-slate-200
          dark:border-[#2d2d4d]
          rounded-2xl
          p-5
          shadow-sm
        "
      >
        {/* TOP INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* DATE */}
          <div>
            <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
              Select Date*
            </label>

            <div className="relative">
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectDate}
                onChange={(e) =>
                  setSelectDate(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-slate-50
                  dark:bg-[#1f1f38]
                  border
                  border-slate-300
                  dark:border-[#3a3a5a]
                  rounded-md
                  px-4
                  py-3
                  pr-12
                  text-slate-900
                  dark:text-white
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
                  text-slate-500
                  dark:text-[#b0b0c3]
                  pointer-events-none
                "
              />
            </div>
          </div>

          {/* RESOURCE PERSON TYPE */}
          <div className="relative">
            <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
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
                bg-slate-50
                dark:bg-[#1f1f38]
                border
                border-slate-300
                dark:border-[#3a3a5a]
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
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-400 dark:text-[#8d8da8]"
                }
              >
                {resourceType ||
                  "VIP / Trainer / Placement"}
              </span>

              <ChevronDown
                size={18}
                className={`transition-transform duration-300 text-slate-500 dark:text-[#b0b0c3] ${
                  showResourceDropdown
                    ? "rotate-180"
                    : "rotate-0"
                }`}
              />
            </div>

            {showResourceDropdown && (
              <div className="absolute w-full mt-2 bg-white dark:bg-[#26264a] border border-slate-200 dark:border-[#3a3a5a] text-slate-900 dark:text-white rounded-md overflow-hidden z-50 shadow-lg">
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
                      className="px-4 py-3 hover:bg-violet-600 hover:text-white dark:hover:bg-[#3b82f6] cursor-pointer"
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
            <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
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
                bg-slate-50
                dark:bg-[#1f1f38]
                border
                border-slate-300
                dark:border-[#3a3a5a]
                rounded-md
                px-4
                py-3
                text-slate-900
                dark:text-white
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
                outline-none
              "
            />
          </div>

          {/* INTERNAL ACCOMPANYING COUNT */}
          <div>
            <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
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
                bg-slate-50
                dark:bg-[#1f1f38]
                border
                border-slate-300
                dark:border-[#3a3a5a]
                rounded-md
                px-4
                py-3
                text-slate-900
                dark:text-white
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
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
                <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
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
                    bg-slate-50
                    dark:bg-[#1f1f38]
                    border
                    border-slate-300
                    dark:border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    dark:placeholder:text-slate-500
                    outline-none
                  "
                />
              </div>

              {/* STAFF MOBILE */}
              <div>
                <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
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
                    bg-slate-50
                    dark:bg-[#1f1f38]
                    border
                    border-slate-300
                    dark:border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    dark:placeholder:text-slate-500
                    outline-none
                  "
                />
              </div>
            </div>
          )
        )}

        {/* FOOD TYPE */}
        <div className="relative mb-6">
          <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
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
              bg-slate-50
              dark:bg-[#1f1f38]
              border
              border-slate-300
              dark:border-[#3a3a5a]
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
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-[#8d8da8]"
              }
            >
              {foodType ||
                "Breakfast / Lunch / Dinner / Morning Refreshment / Evening Refreshment"}
            </span>

            <ChevronDown
              size={18}
              className={`transition-transform duration-300 text-slate-500 dark:text-[#b0b0c3] ${
                showFoodDropdown
                  ? "rotate-180"
                  : "rotate-0"
              }`}
            />
          </div>

          {showFoodDropdown && (
            <div className="absolute w-full mt-2 bg-white dark:bg-[#26264a] border border-slate-200 dark:border-[#3a3a5a] text-slate-900 dark:text-white rounded-md overflow-hidden z-50 shadow-lg">
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
                    className="px-4 py-3 hover:bg-violet-600 hover:text-white dark:hover:bg-[#3b82f6] cursor-pointer"
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
              bg-slate-50
              dark:bg-[#252547]
              border
              border-slate-200
              dark:border-transparent
              rounded-xl
              p-5
            "
          >
            <h2 className="text-[#a855f7] text-xl font-bold mb-5">
              {foodType}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* VEG PARTICIPANTS */}
              <div>
                <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
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
                    bg-white
                    dark:bg-[#1f1f38]
                    border
                    border-slate-300
                    dark:border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    dark:placeholder:text-slate-500
                    outline-none
                  "
                />
              </div>

              {/* VEG GUEST */}
              <div>
                <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
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
                    bg-white
                    dark:bg-[#1f1f38]
                    border
                    border-slate-300
                    dark:border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    dark:placeholder:text-slate-500
                    outline-none
                  "
                />
              </div>

              {/* NON VEG PARTICIPANTS */}
              <div>
                <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
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
                    bg-white
                    dark:bg-[#1f1f38]
                    border
                    border-slate-300
                    dark:border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    dark:placeholder:text-slate-500
                    outline-none
                  "
                />
              </div>

              {/* NON VEG GUEST */}
              <div>
                <label className="block text-sm mb-2 text-slate-700 dark:text-slate-200">
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
                    bg-white
                    dark:bg-[#1f1f38]
                    border
                    border-slate-300
                    dark:border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    dark:placeholder:text-slate-500
                    outline-none
                  "
                />
              </div>
            </div>
            
          </div>
          
        )}
      </div>
      
    </div>
    
  );
};

export default FoodAndRefreshment; 