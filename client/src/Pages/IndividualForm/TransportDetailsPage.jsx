import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

import {
  Plus,
  CalendarDays,
  Clock3,
  MapPin,
  GripVertical,
  X,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import {jwtDecode} from "jwt-decode";
import { API_BASE } from "../../utils/apiConfig";

import "react-datepicker/dist/react-datepicker.css";

const TransportDetailsPage = () => {
  // =========================
  // DATE STATES
  // =========================
  const [pickupDateTime, setPickupDateTime] =
    useState(null);

  const [dropDateTime, setDropDateTime] =
    useState(null);

  // =========================
  // LOCATION STATES
  // =========================
  const [pickupLocation, setPickupLocation] =
    useState("");

  const [dropLocation, setDropLocation] =
    useState("");

  // =========================
  // CHECKPOINTS
  // =========================
  const [checkpoints, setCheckpoints] =
    useState([]);

  const [draggedIndex, setDraggedIndex] =
    useState(null);

  // =========================
  // PASSENGERS
  // =========================
  const [totalPassengers, setTotalPassengers] =
    useState("");

  // =========================
  // VEHICLE DROPDOWN
  // =========================
  const [vehicleType, setVehicleType] =
    useState("");

  const [
    showVehicleDropdown,
    setShowVehicleDropdown,
  ] = useState(false);

  const [vehicleCount, setVehicleCount] =
    useState("");

  // =========================
  // STAFF DROPDOWN
  // =========================
  const [staffOptionType, setOptionType] =
    useState("");

  const [showStaffDropdown, setShowStaffDropdown] =
    useState(false);

  // =========================
  // STAFF DETAILS
  // =========================
  const [staffDetails, setStaffDetails] =
    useState([]);

  // =========================
  // SPECIAL REQUIREMENT
  // =========================
  const [
    specialRequirement,
    setSpecialRequirement,
  ] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [token, setToken] = useState("");
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

  useEffect(() => {
    console.log("TransportDetailsPage mounted/updated", {
      API_BASE,
      tokenAvailable: Boolean(token),
      employeeId,
    });
  }, [token, employeeId]);

  // =========================
  // OPTIONS
  // =========================
  const vehicleOptions = [
    "Bus",
    "Van",
    "Car",
    "Outsource Car",
  ];

  const staffOptions = ["1", "2", "3", "4"];

  // =========================
  // CHECKPOINT FUNCTIONS
  // =========================
  const addCheckpoint = () => {
    const updated = [...checkpoints, ""];
    console.log("addCheckpoint", updated);
    setCheckpoints(updated);
  };

  const updateCheckpoint = (
    index,
    value
  ) => {
    const updated = [...checkpoints];

    updated[index] = value;
    console.log("updateCheckpoint", index, value, updated);

    setCheckpoints(updated);
  };

  const removeCheckpoint = (index) => {
    const updated = checkpoints.filter(
      (_, i) => i !== index
    );

    setCheckpoints(updated);
  };

  const buildTransportPayload = () => {
    const checkpointList = checkpoints
      .map((location) => location.trim())
      .filter(Boolean);

    return {
      employee: employeeId || "6a0411af4579d3137b255e70",
      pickupDateTime: pickupDateTime
        ? pickupDateTime.toISOString()
        : null,
      dropDateTime: dropDateTime
        ? dropDateTime.toISOString()
        : null,
      pickupLocation: pickupLocation.trim(),
      dropLocation: dropLocation.trim(),
      checkpoints: checkpointList.map((location) => ({ location })),
      totalPassengers: Number(totalPassengers) || 0,
      vehicles: vehicleType
        ? [
            {
              type: vehicleType,
              count: Number(vehicleCount) || 0,
            },
          ]
        : [],
      numberOfBusNeeded:
        vehicleType === "Bus"
          ? Number(vehicleCount) || 0
          : 0,
      numberOfAccompanyingStaff:
        Number(staffOptionType) || staffDetails.length,
      accompanyingStaff: staffDetails.map((staff) => ({
        name: staff.name.trim(),
        mobile: staff.mobile ? Number(staff.mobile) : staff.mobile,
      })),
      specialRequirements: specialRequirement.trim(),
      status: "Pending",
    };
  };

  const handleSubmit = async () => {
    console.log("Transport handleSubmit invoked");
    console.log("API_BASE:", API_BASE, "token:", token);
    const errors = [];
    if (!pickupDateTime) {
      errors.push("Pickup Date & Time is required.");
    }
    if (!dropDateTime) {
      errors.push("Drop Date & Time is required.");
    }
    if (!pickupLocation.trim()) {
      errors.push("Pickup Location is required.");
    }
    if (!dropLocation.trim()) {
      errors.push("Drop Location is required.");
    }
    if (!checkpoints.some((location) => location.trim())) {
      errors.push("At least one checkpoint is required.");
    }
    if (!totalPassengers) {
      errors.push("Total Passengers is required.");
    }
    if (!vehicleType) {
      errors.push("Vehicle type is required.");
    }
    if (!vehicleCount) {
      errors.push("Vehicle count is required.");
    }
    if (!staffOptionType) {
      errors.push("Number of accompanying staff is required.");
    }
    if (
      staffDetails.some(
        (staff) => !staff.name.trim() || !staff.mobile
      )
    ) {
      errors.push("All accompanying staff must have a name and mobile number.");
    }

    setValidationErrors(errors);
    setSubmitMessage("");
    console.log("Transport submit validation errors:", errors);
    if (errors.length) return;

    setIsSubmitting(true);

    try {
      const payload = buildTransportPayload();
      console.log("Transport payload:", payload);
      const requestUrl = `${API_BASE}/api/transports`;
      console.log("Transport request URL:", requestUrl);
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        data = null;
      }

      console.log("Transport response:", response.status, data);
      if (!response.ok) {
        throw new Error(
          (data && data.message) ||
            `Transport submission failed with status ${response.status}`
        );
      }

      setValidationErrors([]);
      setSubmitMessage("Transport data submitted successfully.");
    } catch (error) {
      setValidationErrors([error.message || "Unable to send transport data."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // DRAG FUNCTIONS
  // =========================
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

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

  // =========================
  // VEHICLE LABELS
  // =========================
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
      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-6">
        Transport Details Form
      </h1>

      {/* HEADER */}
      <div className="flex justify-end mb-5">
        <button
          className="
            flex
            items-center
            gap-2
            bg-[#8b5cf6]
            hover:bg-[#7c3aed]
            px-5
            py-2.5
            rounded-md
            transition-all
          "
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {/* MAIN CARD */}
      <div
        className="
          bg-[#1b1b35]
          border
          border-[#2a2a40]
          rounded-2xl
          p-6
        "
      >
        {/* DATE PICKERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* PICKUP DATE */}
          <div>
            <label className="block text-sm mb-2">
              Pickup Date & Time *
            </label>

            <div className="relative">
              <DatePicker
                selected={pickupDateTime}
                onChange={(date) =>
                  setPickupDateTime(date)
                }
                showTimeSelect
                dateFormat="dd/MM/yyyy h:mm aa"
                placeholderText="Select pickup date & time"
                className="
                  w-full
                  bg-[#1f1f38]
                  border
                  border-[#3a3a5a]
                  rounded-md
                  px-4
                  py-3
                  pr-20
                  text-white
                  outline-none
                "
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 pointer-events-none">
                <CalendarDays size={18} />
                <Clock3 size={18} />
              </div>
            </div>
          </div>

          {/* DROP DATE */}
          <div>
            <label className="block text-sm mb-2">
              Drop Date & Time *
            </label>

            <div className="relative">
              <DatePicker
                selected={dropDateTime}
                onChange={(date) =>
                  setDropDateTime(date)
                }
                showTimeSelect
                dateFormat="dd/MM/yyyy h:mm aa"
                placeholderText="Select drop date & time"
                className="
                  w-full
                  bg-[#1f1f38]
                  border
                  border-[#3a3a5a]
                  rounded-md
                  px-4
                  py-3
                  pr-20
                  text-white
                  outline-none
                "
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 pointer-events-none">
                <CalendarDays size={18} />
                <Clock3 size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* PICKUP LOCATION */}
        <div className="mt-5">
          <label className="block text-sm mb-2">
            Pickup Location *
          </label>

          <div className="flex items-center gap-3 border border-[#3a3a5a] rounded-md px-4 py-3 bg-[#1f1f38]">
            <MapPin size={18} />

            <input
              type="text"
              value={pickupLocation}
              onChange={(e) =>
                setPickupLocation(
                  e.target.value
                )
              }
              placeholder="Enter pickup location"
              className="bg-transparent outline-none w-full text-white"
            />
          </div>
        </div>

        {/* ADD CHECKPOINT */}
        <div className="flex justify-center mt-5">
          <button
            type="button"
            onClick={addCheckpoint}
            className="flex items-center gap-2 text-[#9b5cff] font-medium"
          >
            <Plus
              size={16}
              className="bg-[#9b5cff] rounded-full p-0.5 text-white"
            />
            Add Checkpoint
          </button>
        </div>

        {/* CHECKPOINT LIST */}
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
                  className="
                    bg-[#26264a]
                    rounded-md
                    px-4
                    py-4
                    flex
                    items-center
                    justify-between
                  "
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
                      className="bg-transparent outline-none text-white w-full"
                    />
                  </div>

                  <button
                    onClick={() =>
                      removeCheckpoint(index)
                    }
                  >
                    <X
                      size={18}
                      className="text-red-500"
                    />
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* DROP LOCATION */}
        <div className="mt-5">
          <label className="block text-sm mb-2">
            Drop Location *
          </label>

          <div className="flex items-center gap-3 border border-[#3a3a5a] rounded-md px-4 py-3 bg-[#1f1f38]">
            <MapPin size={18} />

            <input
              type="text"
              value={dropLocation}
              onChange={(e) =>
                setDropLocation(
                  e.target.value
                )
              }
              placeholder="Enter drop location"
              className="bg-transparent outline-none w-full text-white"
            />
          </div>
        </div>

        {/* PASSENGER + VEHICLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

          {/* PASSENGERS */}
          <div>
            <label className="block text-sm mb-2">
              Total Number of Passengers *
            </label>

            <input
              type="number"
              value={totalPassengers}
              onChange={(e) =>
                setTotalPassengers(
                  e.target.value
                )
              }
              placeholder="Enter total passengers"
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                px-4
                py-3
                outline-none
              "
            />
          </div>

          {/* VEHICLE TYPE */}
          <div className="relative">
            <label className="block text-sm mb-2">
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
              <span>
                {vehicleType ||
                  "Select Vehicle"}
              </span>

              <ChevronDown size={18} />
            </div>

            {showVehicleDropdown && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                {vehicleOptions.map(
                  (option, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setVehicleType(option);
                        setShowVehicleDropdown(
                          false
                        );
                      }}
                      className="px-4 py-3 hover:bg-[#3b82f6] cursor-pointer"
                    >
                      {option}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* VEHICLE COUNT */}
        {vehicleType && (
          <div className="mt-5">
            <label className="block text-sm mb-2">
              {getVehicleLabel()}
            </label>

            <input
              type="number"
              value={vehicleCount}
              onChange={(e) =>
                setVehicleCount(
                  e.target.value
                )
              }
              placeholder={getVehiclePlaceholder()}
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                px-4
                py-3
                outline-none
              "
            />
          </div>
        )}

        {/* STAFF DROPDOWN */}
        <div className="relative mt-5">
          <label className="block text-sm mb-2">
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
            <span>
              {staffOptionType ||
                "Select Staff Count"}
            </span>

            <ChevronDown size={18} />
          </div>

          {showStaffDropdown && (
            <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
              {staffOptions.map(
                (option, index) => (
                  <div
                    key={index}
                    onClick={() => {
                                      setOptionType(option);

                      setShowStaffDropdown(
                        false
                      );

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

                      console.log("staff count selected", count, newStaff);
                      setStaffDetails(
                        newStaff
                      );
                    }}
                    className="px-4 py-3 hover:bg-[#3b82f6] cursor-pointer"
                  >
                    {option}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* STAFF DETAILS */}
        {staffDetails.length > 0 && (
          <div className="mt-5 space-y-5">
            {staffDetails.map(
              (staff, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <input
                    type="text"
                    value={staff.name}
                    onChange={(e) => {
                      const updated = [
                        ...staffDetails,
                      ];

                      updated[index].name =
                        e.target.value;
                      console.log("staff name changed", index, updated[index].name, updated);

                      setStaffDetails(
                        updated
                      );
                    }}
                    placeholder={`Staff ${
                      index + 1
                    } Name`}
                    className="
                      w-full
                      bg-[#1f1f38]
                      border
                      border-[#3a3a5a]
                      rounded-md
                      px-4
                      py-3
                      outline-none
                    "
                  />

                  <input
                    type="number"
                    value={staff.mobile}
                    onChange={(e) => {
                      const updated = [
                        ...staffDetails,
                      ];

                      updated[index].mobile =
                        e.target.value;
                      console.log("staff mobile changed", index, updated[index].mobile, updated);

                      setStaffDetails(
                        updated
                      );
                    }}
                    placeholder={`Staff ${
                      index + 1
                    } Mobile Number`}
                    className="
                      w-full
                      bg-[#1f1f38]
                      border
                      border-[#3a3a5a]
                      rounded-md
                      px-4
                      py-3
                      outline-none
                    "
                  />
                </div>
              )
            )}
          </div>
        )}

        {/* SPECIAL REQUIREMENT */}
        <div className="mt-5">
          <label className="block text-sm mb-2">
            Special Requirement
          </label>

          <textarea
            rows={4}
            value={specialRequirement}
            onChange={(e) =>
              setSpecialRequirement(
                e.target.value
              )
            }
            placeholder="Enter any special requirements"
            className="
              w-full
              bg-[#1f1f38]
              border
              border-[#3a3a5a]
              rounded-md
              px-4
              py-3
              outline-none
              resize-none
            "
          />
        </div>
      </div>

      {/* NEXT BUTTON */}
      {validationErrors.length > 0 && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200">
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {submitMessage && (
        <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-200">
          {submitMessage}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={() => {
            console.log("Transport submit button clicked");
            handleSubmit();
          }}
          disabled={isSubmitting}
          className="
            bg-[#8b5cf6]
            hover:bg-[#7c3aed]
            disabled:opacity-60
            disabled:cursor-not-allowed
            text-white
            font-medium
            px-8
            py-3
            rounded-md
            transition-all
            duration-300
            flex
            items-center
            gap-2
          "
        >
          {isSubmitting ? "Submitting..." : "Submit"}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default TransportDetailsPage;  