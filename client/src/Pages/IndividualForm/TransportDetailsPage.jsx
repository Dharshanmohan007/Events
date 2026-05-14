import React, { useState } from "react";
import {
  Plus,
  CalendarDays,
  Clock3,
  MapPin,
  GripVertical,
  X,
  ChevronDown,
} from "lucide-react";

const TransportDetailsPage = () => {
  // Checkpoints state
  const [checkpoints, setCheckpoints] =
    useState([]);

  // Drag state
  const [draggedIndex, setDraggedIndex] =
    useState(null);

  // Vehicle dropdown state
  const [vehicleType, setVehicleType] =
    useState("");

  const [showVehicleDropdown, setShowVehicleDropdown] =
    useState(false);

  // Vehicle count
  const [vehicleCount, setVehicleCount] =
    useState("");

  // Staff dropdown state
  const [staffOptionType, setOptionType] =
    useState("");

  const [showStaffDropdown, setShowStaffDropdown] =
    useState(false);

  // Dynamic staff fields
  const [staffDetails, setStaffDetails] =
    useState([]);

  const vehicleOptions = [
    "Bus",
    "Van",
    "Car",
    "Outsource Car",
  ];

  const staffOptions = ["1", "2", "3", "4"];

  // Add checkpoint
  const addCheckpoint = () => {
    setCheckpoints([...checkpoints, ""]);
  };

  // Update checkpoint
  const updateCheckpoint = (
    index,
    value
  ) => {
    const updated = [...checkpoints];

    updated[index] = value;

    setCheckpoints(updated);
  };

  // Remove checkpoint
  const removeCheckpoint = (index) => {
    const updated = checkpoints.filter(
      (_, i) => i !== index
    );

    setCheckpoints(updated);
  };

  // Drag Start
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  // Drag Over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Drop
  const handleDrop = (dropIndex) => {
    if (
      draggedIndex === null ||
      draggedIndex === dropIndex
    ) {
      return;
    }

    const updatedCheckpoints = [
      ...checkpoints,
    ];

    const draggedItem =
      updatedCheckpoints[draggedIndex];

    updatedCheckpoints.splice(
      draggedIndex,
      1
    );

    updatedCheckpoints.splice(
      dropIndex,
      0,
      draggedItem
    );

    setCheckpoints(updatedCheckpoints);

    setDraggedIndex(null);
  };

  // Dynamic vehicle label
  const getVehicleLabel = () => {
    switch (vehicleType) {
      case "Car":
        return "How many cars needed *";

      case "Bus":
        return "How many buses needed *";

      case "Van":
        return "How many vans needed *";

      case "Outsource Car":
        return "How many outsource cars needed *";

      default:
        return "How many vehicles needed *";
    }
  };

  // Dynamic placeholder
  const getVehiclePlaceholder = () => {
    switch (vehicleType) {
      case "Car":
        return "Enter number of cars";

      case "Bus":
        return "Enter number of buses";

      case "Van":
        return "Enter number of vans";

      case "Outsource Car":
        return "Enter number of outsource cars";

      default:
        return "Enter vehicle count";
    }
  };

  return (
    <div className="min-h-screen bg-[#141428] text-white p-5">
      <h1 className="text-2xl font-semibold mb-5">
        Transport Details Form
      </h1>

      {/* Header */}
      <div className="w-full pb-4 flex justify-end">
        <button className="flex items-center gap-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-medium px-4 py-2 rounded-md transition">
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Form Card */}
      <div className="mt-6 bg-[#1b1b35] rounded-xl p-5 border border-[#2a2a40] overflow-visible">

        {/* Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Pickup */}
          <div>
            <label className="text-sm text-white mb-2 block">
              Pickup date & Time *
            </label>

            <div className="flex items-center justify-between border border-[#3a3a5a] rounded-md px-4 py-3">
              <span className="text-[#8d8da8] text-sm">
                __/__/____
              </span>

              <div className="flex items-center gap-3">
                <CalendarDays size={18} />
                <Clock3 size={18} />
              </div>
            </div>
          </div>

          {/* Drop */}
          <div>
            <label className="text-sm text-white mb-2 block">
              Drop date & Time *
            </label>

            <div className="flex items-center justify-between border border-[#3f3f45] rounded-md px-4 py-3">
              <span className="text-[#8d8da8] text-sm">
                __/__/____
              </span>

              <div className="flex items-center gap-3">
                <CalendarDays size={18} />
                <Clock3 size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="mt-5">
          <label className="text-sm text-white mb-2 block">
            Pickup Location *
          </label>

          <div className="flex items-center gap-3 border border-[#3a3a5a] rounded-md px-4 py-3">
            <MapPin size={18} />

            <input
              type="text"
              placeholder="Enter pickup location"
              className="bg-transparent outline-none text-sm w-full text-white placeholder:text-[#8d8da8]"
            />
          </div>
        </div>

        {/* Add Checkpoint */}
        <div className="flex justify-center mt-5">
          <button
            type="button"
            onClick={addCheckpoint}
            className="flex items-center gap-2 text-[#9b5cff] text-sm font-medium"
          >
            <Plus
              size={16}
              className="bg-[#9b5cff] rounded-full p-[2px] text-white"
            />
            Add Checkpoint
          </button>
        </div>

        {/* Checkpoint List */}
        {checkpoints.length > 0 && (
          <div className="mt-5 space-y-3">
            {checkpoints.map(
              (checkpoint, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() =>
                    handleDragStart(index)
                  }
                  onDragOver={handleDragOver}
                  onDrop={() =>
                    handleDrop(index)
                  }
                  onDragEnd={() =>
                    setDraggedIndex(null)
                  }
                  className={`
                    bg-[#26264a]
                    rounded-md
                    px-4
                    py-4
                    flex
                    items-center
                    justify-between
                    cursor-grab
                    transition-all
                    ${
                      draggedIndex === index
                        ? "opacity-50 scale-[0.98]"
                        : "opacity-100"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 w-full">
                    <GripVertical
                      size={18}
                      className="text-[#8d8da8]"
                    />

                    <MapPin size={18} />

                    <input
                      type="text"
                      value={checkpoint}
                      onChange={(e) =>
                        updateCheckpoint(
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`Checkpoint ${
                        index + 1
                      }`}
                      className="bg-transparent outline-none text-sm w-full text-white placeholder:text-[#8d8da8]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeCheckpoint(index)
                    }
                  >
                    <X
                      size={18}
                      className="text-red-500 cursor-pointer"
                    />
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* Drop Location */}
        <div className="mt-5">
          <label className="text-sm text-white mb-2 block">
            Drop Location *
          </label>

          <div className="flex items-center gap-3 border border-[#3f3f45] rounded-md px-4 py-3">
            <MapPin size={18} />

            <input
              type="text"
              placeholder="Enter drop location"
              className="bg-transparent outline-none text-sm w-full text-white placeholder:text-[#8d8da8]"
            />
          </div>
        </div>

        {/* Passenger & Vehicle Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

          {/* Total Passengers */}
          <div>
            <label className="text-sm text-white mb-2 block">
              Total Number of Passengers *
            </label>

            <div className="border border-[#3a3a5a] rounded-md px-4 py-3 bg-[#1b1b35]">
              <input
                type="number"
                placeholder="Enter total passengers"
                className="bg-transparent outline-none text-sm w-full text-white placeholder:text-[#8d8da8]"
              />
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="relative">
            <label className="text-sm text-white mb-2 block">
              Type of Vehicle Needed *
            </label>

            <div
              onClick={() =>
                setShowVehicleDropdown(
                  !showVehicleDropdown
                )
              }
              className="
                w-full
                border
                border-[#3a3a5a]
                rounded-md
                bg-[#1b1b35]
                px-4
                py-3
                text-sm
                text-white
                cursor-pointer
                flex
                items-center
                justify-between
              "
            >
              <span
                className={
                  vehicleType
                    ? "text-white"
                    : "text-[#8d8da8]"
                }
              >
                {vehicleType ||
                  "Select Vehicle Type"}
              </span>

              <ChevronDown
                size={18}
                className={`transition-transform ${
                  showVehicleDropdown
                    ? "rotate-180"
                    : ""
                }`}
              />
            </div>

            {/* Dropdown */}
            {showVehicleDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                {vehicleOptions.map(
                  (option, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setVehicleType(option);
                        setShowVehicleDropdown(
                          false
                        );
                        setVehicleCount("");
                      }}
                      className="px-4 py-3 text-sm cursor-pointer hover:bg-[#3b82f6]"
                    >
                      {option}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Dynamic Vehicle Count Input */}
          {vehicleType && (
            <div>
              <label className="text-sm text-white mb-2 block">
                {getVehicleLabel()}
              </label>

              <div className="border border-[#3a3a5a] rounded-md px-4 py-3 bg-[#1b1b35]">
                <input
                  type="number"
                  value={vehicleCount}
                  onChange={(e) =>
                    setVehicleCount(
                      e.target.value
                    )
                  }
                  placeholder={getVehiclePlaceholder()}
                  className="bg-transparent outline-none text-sm w-full text-white placeholder:text-[#8d8da8]"
                />
              </div>
            </div>
          )}

          {/* Staff Dropdown */}
          <div className="relative">
            <label className="text-sm text-white mb-2 block">
              Number of Accompanying Staff *
            </label>

            <div
              onClick={() =>
                setShowStaffDropdown(
                  !showStaffDropdown
                )
              }
              className="
                w-full
                border
                border-[#3a3a5a]
                rounded-md
                bg-[#1b1b35]
                px-4
                py-3
                text-sm
                text-white
                cursor-pointer
                flex
                items-center
                justify-between
              "
            >
              <span
                className={
                  staffOptionType
                    ? "text-white"
                    : "text-[#8d8da8]"
                }
              >
                {staffOptionType ||
                  "Select Staff Option"}
              </span>

              <ChevronDown
                size={18}
                className={`transition-transform ${
                  showStaffDropdown
                    ? "rotate-180"
                    : ""
                }`}
              />
            </div>

            {/* Staff Options */}
            {showStaffDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                {staffOptions.map(
                  (option, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setOptionType(option);

                        setShowStaffDropdown(
                          false
                        );

                        // Create dynamic staff fields
                        const count =
                          Number(option);

                        const newStaff =
                          Array.from(
                            {
                              length: count,
                            },
                            () => ({
                              name: "",
                              mobile: "",
                            })
                          );

                        setStaffDetails(
                          newStaff
                        );
                      }}
                      className="px-4 py-3 text-sm cursor-pointer hover:bg-[#3b82f6]"
                    >
                      {option}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

        </div>

        {/* Dynamic Staff Fields */}
        {staffDetails.length > 0 && (
          <div className="mt-5 space-y-5">
            {staffDetails.map(
              (staff, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  {/* Staff Name */}
                  <div>
                    <label className="text-sm text-white mb-2 block">
                      Accompanying Staff Name{" "}
                      {index + 1} *
                    </label>

                    <div className="border border-[#3a3a5a] rounded-md px-4 py-3 bg-[#1b1b35]">
                      <input
                        type="text"
                        value={staff.name}
                        onChange={(e) => {
                          const updated =
                            [...staffDetails];

                          updated[index].name =
                            e.target.value;

                          setStaffDetails(
                            updated
                          );
                        }}
                        placeholder={`Enter staff ${
                          index + 1
                        } name`}
                        className="bg-transparent outline-none text-sm w-full text-white placeholder:text-[#8d8da8]"
                      />
                    </div>
                  </div>

                  {/* Staff Mobile */}
                  <div>
                    <label className="text-sm text-white mb-2 block">
                      Accompanying Staff Mobile Number{" "}
                      {index + 1} *
                    </label>

                    <div className="border border-[#3a3a5a] rounded-md px-4 py-3 bg-[#1b1b35]">
                      <input
                        type="number"
                        value={staff.mobile}
                        onChange={(e) => {
                          const updated =
                            [...staffDetails];

                          updated[index].mobile =
                            e.target.value;

                          setStaffDetails(
                            updated
                          );
                        }}
                        placeholder={`Enter staff ${
                          index + 1
                        } mobile number`}
                        className="bg-transparent outline-none text-sm w-full text-white placeholder:text-[#8d8da8]"
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Special Requirement */}
        <div className="mt-5">
          <label className="text-sm text-white mb-2 block">
            Special Requirement
          </label>

          <textarea
            rows={4}
            placeholder="Enter any special requirements"
            className="
              w-full
              bg-[#1b1b35]
              border
              border-[#3a3a5a]
              rounded-md
              px-4
              py-3
              text-sm
              text-white
              placeholder:text-[#8d8da8]
              outline-none
              resize-none
            "
          />
        </div>

      </div>
    </div>
  );
};

export default TransportDetailsPage;