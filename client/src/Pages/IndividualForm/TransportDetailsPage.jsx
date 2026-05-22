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

import { jwtDecode } from "jwt-decode";
import { API_BASE } from "../../utils/apiConfig";

import "react-datepicker/dist/react-datepicker.css";

const createTransportForm = () => ({
  pickupDateTime: null,
  dropDateTime: null,
  pickupLocation: "",
  dropLocation: "",
  checkpoints: [],
  draggedIndex: null,
  totalPassengers: "",
  vehicleType: "",
  showVehicleDropdown: false,
  vehicleCount: "",
  staffOptionType: "",
  showStaffDropdown: false,
  staffDetails: [],
  specialRequirement: "",
});

const TransportDetailsPage = () => {
  const [transportForms, setTransportForms] = useState([
    createTransportForm(),
  ]);

  const [employeeId, setEmployeeId] = useState("");
  const [token, setToken] = useState("");
  const [validationErrors, setValidationErrors] =
    useState([]);
  const [submitMessage, setSubmitMessage] =
    useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);

      try {
        const decoded =
          jwtDecode(storedToken);

        if (decoded?.id) {
          setEmployeeId(decoded.id);
        }
      } catch (error) {
        console.error(
          "Failed to decode token:",
          error
        );
      }
    }
  }, []);

  const vehicleOptions = [
    "Bus",
    "Van",
    "Car",
    "Outsource Car",
  ];

  const staffOptions = [
    "1",
    "2",
    "3",
    "4",
  ];

  // =========================
  // ADD NEW FORM
  // =========================
  const addTransportForm = () => {
    setTransportForms((prev) => [
      ...prev,
      createTransportForm(),
    ]);
  };

  // =========================
  // UPDATE FORM FIELD
  // =========================
  const updateFormField = (
    formIndex,
    field,
    value
  ) => {
    const updatedForms = [
      ...transportForms,
    ];

    updatedForms[formIndex][field] =
      value;

    setTransportForms(updatedForms);
  };

  // =========================
  // CHECKPOINT FUNCTIONS
  // =========================
  const addCheckpoint = (formIndex) => {
    const updatedForms = [
      ...transportForms,
    ];

    updatedForms[
      formIndex
    ].checkpoints.push("");

    setTransportForms(updatedForms);
  };

  const updateCheckpoint = (
    formIndex,
    checkpointIndex,
    value
  ) => {
    const updatedForms = [
      ...transportForms,
    ];

    updatedForms[
      formIndex
    ].checkpoints[checkpointIndex] = value;

    setTransportForms(updatedForms);
  };

  const removeCheckpoint = (
    formIndex,
    checkpointIndex
  ) => {
    const updatedForms = [
      ...transportForms,
    ];

    updatedForms[
      formIndex
    ].checkpoints =
      updatedForms[
        formIndex
      ].checkpoints.filter(
        (_, i) =>
          i !== checkpointIndex
      );

    setTransportForms(updatedForms);
  };

  // =========================
  // DRAG FUNCTIONS
  // =========================
  const handleDragStart = (
    formIndex,
    index
  ) => {
    const updatedForms = [
      ...transportForms,
    ];

    updatedForms[formIndex].draggedIndex =
      index;

    setTransportForms(updatedForms);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (
    formIndex,
    dropIndex
  ) => {
    const updatedForms = [
      ...transportForms,
    ];

    const draggedIndex =
      updatedForms[formIndex]
        .draggedIndex;

    if (
      draggedIndex === null ||
      draggedIndex === dropIndex
    ) {
      return;
    }

    const checkpoints = [
      ...updatedForms[formIndex]
        .checkpoints,
    ];

    const draggedItem =
      checkpoints[draggedIndex];

    checkpoints.splice(
      draggedIndex,
      1
    );

    checkpoints.splice(
      dropIndex,
      0,
      draggedItem
    );

    updatedForms[formIndex].checkpoints =
      checkpoints;

    updatedForms[formIndex].draggedIndex =
      null;

    setTransportForms(updatedForms);
  };

  // =========================
  // STAFF DETAILS
  // =========================
  const handleStaffCount = (
    formIndex,
    option
  ) => {
    const updatedForms = [
      ...transportForms,
    ];

    updatedForms[
      formIndex
    ].staffOptionType = option;

    updatedForms[
      formIndex
    ].showStaffDropdown = false;

    const count = Number(option);

    updatedForms[
      formIndex
    ].staffDetails = Array.from(
      { length: count },
      () => ({
        name: "",
        mobile: "",
      })
    );

    setTransportForms(updatedForms);
  };

  const updateStaffDetail = (
    formIndex,
    staffIndex,
    field,
    value
  ) => {
    const updatedForms = [
      ...transportForms,
    ];

    updatedForms[
      formIndex
    ].staffDetails[staffIndex][field] =
      value;

    setTransportForms(updatedForms);
  };

  // =========================
  // VEHICLE LABELS
  // =========================
  const getVehicleLabel = (
    vehicleType
  ) => {
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

  const getVehiclePlaceholder = (
    vehicleType
  ) => {
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

  // =========================
  // BUILD PAYLOAD
  // =========================
  const buildTransportPayload = (
    form
  ) => {
    return {
      employee:
        employeeId ||
        "6a0411af4579d3137b255e70",

      pickupDateTime:
        form.pickupDateTime
          ? form.pickupDateTime.toISOString()
          : null,

      dropDateTime:
        form.dropDateTime
          ? form.dropDateTime.toISOString()
          : null,

      pickupLocation:
        form.pickupLocation.trim(),

      dropLocation:
        form.dropLocation.trim(),

      checkpoints:
        form.checkpoints.map(
          (location) => ({
            location,
          })
        ),

      totalPassengers:
        Number(
          form.totalPassengers
        ) || 0,

      vehicles: form.vehicleType
        ? [
            {
              type: form.vehicleType,
              count:
                Number(
                  form.vehicleCount
                ) || 0,
            },
          ]
        : [],

      numberOfBusNeeded:
        form.vehicleType === "Bus"
          ? Number(
              form.vehicleCount
            ) || 0
          : 0,

      numberOfAccompanyingStaff:
        Number(
          form.staffOptionType
        ) || 0,

      accompanyingStaff:
        form.staffDetails.map(
          (staff) => ({
            name: staff.name,
            mobile: Number(
              staff.mobile
            ),
          })
        ),

      specialRequirements:
        form.specialRequirement,

      status: "Pending",
    };
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    const errors = [];

    transportForms.forEach(
      (form, index) => {
        if (!form.pickupDateTime) {
          errors.push(
            `Form ${
              index + 1
            }: Pickup Date & Time is required`
          );
        }

        if (!form.dropDateTime) {
          errors.push(
            `Form ${
              index + 1
            }: Drop Date & Time is required`
          );
        }

        if (
          !form.pickupLocation.trim()
        ) {
          errors.push(
            `Form ${
              index + 1
            }: Pickup Location is required`
          );
        }

        if (
          !form.dropLocation.trim()
        ) {
          errors.push(
            `Form ${
              index + 1
            }: Drop Location is required`
          );
        }

        if (
          !form.totalPassengers
        ) {
          errors.push(
            `Form ${
              index + 1
            }: Total passengers required`
          );
        }

        if (!form.vehicleType) {
          errors.push(
            `Form ${
              index + 1
            }: Vehicle type required`
          );
        }

        if (!form.vehicleCount) {
          errors.push(
            `Form ${
              index + 1
            }: Vehicle count required`
          );
        }
      }
    );

    setValidationErrors(errors);

    if (errors.length) return;

    setIsSubmitting(true);

    try {
      for (const form of transportForms) {
        const payload =
          buildTransportPayload(form);

        await fetch(
          `${API_BASE}/api/transports`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
            body: JSON.stringify(
              payload
            ),
          }
        );
      }

      setSubmitMessage(
        "All transport forms submitted successfully."
      );

      setValidationErrors([]);
    } catch (error) {
      setValidationErrors([
        "Unable to submit transport forms.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141428] text-white p-5">
      <h1 className="text-3xl font-bold mb-6">
        Transport Details Form
      </h1>

      {/* ADD BUTTON */}
      <div className="flex justify-end mb-5">
        <button
          type="button"
          onClick={addTransportForm}
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

      {/* MULTIPLE FORMS */}
      {transportForms.map(
        (form, formIndex) => (
          <div
            key={formIndex}
            className="
              bg-[#1b1b35]
              border
              border-[#2a2a40]
              rounded-2xl
              p-6
              mb-8
            "
          >
            <h2 className="text-2xl font-bold mb-6 text-[#8b5cf6]">
              Transport Form{" "}
              {formIndex + 1}
            </h2>

            {/* DATE PICKERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm mb-2">
                  Pickup Date &
                  Time *
                </label>

                <div className="relative">
                  <DatePicker
                    selected={
                      form.pickupDateTime
                    }
                    onChange={(date) =>
                      updateFormField(
                        formIndex,
                        "pickupDateTime",
                        date
                      )
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
                    <CalendarDays
                      size={18}
                    />
                    <Clock3 size={18} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Drop Date &
                  Time *
                </label>

                <div className="relative">
                  <DatePicker
                    selected={
                      form.dropDateTime
                    }
                    onChange={(date) =>
                      updateFormField(
                        formIndex,
                        "dropDateTime",
                        date
                      )
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
                    <CalendarDays
                      size={18}
                    />
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
                  value={
                    form.pickupLocation
                  }
                  onChange={(e) =>
                    updateFormField(
                      formIndex,
                      "pickupLocation",
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
                onClick={() =>
                  addCheckpoint(
                    formIndex
                  )
                }
                className="flex items-center gap-2 text-[#9b5cff] font-medium"
              >
                <Plus
                  size={16}
                  className="bg-[#9b5cff] rounded-full p-0.5 text-white"
                />
                Add Checkpoint
              </button>
            </div>

            {/* CHECKPOINTS */}
            {form.checkpoints.length >
              0 && (
              <div className="mt-5 space-y-3">
                {form.checkpoints.map(
                  (
                    checkpoint,
                    checkpointIndex
                  ) => (
                    <div
                      key={
                        checkpointIndex
                      }
                      draggable
                      onDragStart={() =>
                        handleDragStart(
                          formIndex,
                          checkpointIndex
                        )
                      }
                      onDragOver={
                        handleDragOver
                      }
                      onDrop={() =>
                        handleDrop(
                          formIndex,
                          checkpointIndex
                        )
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

                        <MapPin
                          size={18}
                        />

                        <input
                          type="text"
                          value={
                            checkpoint
                          }
                          onChange={(
                            e
                          ) =>
                            updateCheckpoint(
                              formIndex,
                              checkpointIndex,
                              e.target
                                .value
                            )
                          }
                          placeholder={`Checkpoint ${
                            checkpointIndex +
                            1
                          }`}
                          className="bg-transparent outline-none text-white w-full"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeCheckpoint(
                            formIndex,
                            checkpointIndex
                          )
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
                  value={
                    form.dropLocation
                  }
                  onChange={(e) =>
                    updateFormField(
                      formIndex,
                      "dropLocation",
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
              <div>
                <label className="block text-sm mb-2">
                  Total Number of
                  Passengers *
                </label>

                <input
                  type="number"
                  value={
                    form.totalPassengers
                  }
                  onChange={(e) =>
                    updateFormField(
                      formIndex,
                      "totalPassengers",
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

              <div className="relative">
                <label className="block text-sm mb-2">
                  Type of Vehicle
                  Needed *
                </label>

                <div
                  onClick={() =>
                    updateFormField(
                      formIndex,
                      "showVehicleDropdown",
                      !form.showVehicleDropdown
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
                    {form.vehicleType ||
                      "Select Vehicle"}
                  </span>

                  <ChevronDown
                    size={18}
                  />
                </div>

                {form.showVehicleDropdown && (
                  <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                    {vehicleOptions.map(
                      (
                        option,
                        index
                      ) => (
                        <div
                          key={index}
                          onClick={() => {
                            updateFormField(
                              formIndex,
                              "vehicleType",
                              option
                            );

                            updateFormField(
                              formIndex,
                              "showVehicleDropdown",
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
            {form.vehicleType && (
              <div className="mt-5">
                <label className="block text-sm mb-2">
                  {getVehicleLabel(
                    form.vehicleType
                  )}
                </label>

                <input
                  type="number"
                  value={
                    form.vehicleCount
                  }
                  onChange={(e) =>
                    updateFormField(
                      formIndex,
                      "vehicleCount",
                      e.target.value
                    )
                  }
                  placeholder={getVehiclePlaceholder(
                    form.vehicleType
                  )}
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
                Number of
                Accompanying Staff *
              </label>

              <div
                onClick={() =>
                  updateFormField(
                    formIndex,
                    "showStaffDropdown",
                    !form.showStaffDropdown
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
                  {form.staffOptionType ||
                    "Select Staff Count"}
                </span>

                <ChevronDown
                  size={18}
                />
              </div>

              {form.showStaffDropdown && (
                <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                  {staffOptions.map(
                    (
                      option,
                      index
                    ) => (
                      <div
                        key={index}
                        onClick={() =>
                          handleStaffCount(
                            formIndex,
                            option
                          )
                        }
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
            {form.staffDetails.length >
              0 && (
              <div className="mt-5 space-y-5">
                {form.staffDetails.map(
                  (
                    staff,
                    staffIndex
                  ) => (
                    <div
                      key={staffIndex}
                      className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                      <input
                        type="text"
                        value={
                          staff.name
                        }
                        onChange={(
                          e
                        ) =>
                          updateStaffDetail(
                            formIndex,
                            staffIndex,
                            "name",
                            e.target
                              .value
                          )
                        }
                        placeholder={`Staff ${
                          staffIndex +
                          1
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
                        value={
                          staff.mobile
                        }
                        onChange={(
                          e
                        ) =>
                          updateStaffDetail(
                            formIndex,
                            staffIndex,
                            "mobile",
                            e.target
                              .value
                          )
                        }
                        placeholder={`Staff ${
                          staffIndex +
                          1
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
                value={
                  form.specialRequirement
                }
                onChange={(e) =>
                  updateFormField(
                    formIndex,
                    "specialRequirement",
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
        )
      )}

      {/* ERRORS */}
      {validationErrors.length >
        0 && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200">
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map(
              (error, idx) => (
                <li key={idx}>
                  {error}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {/* SUCCESS */}
      {submitMessage && (
        <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-200">
          {submitMessage}
        </div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end mt-6">
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
          {isSubmitting
            ? "Submitting..."
            : "Submit"}

          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default TransportDetailsPage;