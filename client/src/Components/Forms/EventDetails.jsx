  import React, { useEffect, useState } from "react";
  import CustomDateTimePicker from "../../Components/CustomDateTimePicker";

  import {
    Plus,
    MapPin,
    GripVertical,
    X,
    ChevronDown,
    ArrowRight,
  } from "lucide-react";

  import { jwtDecode } from "jwt-decode";
  import { API_BASE } from "../../utils/apiConfig";

  const createTransportForm = () => ({
    pickupDateTime: null,
    dropDateTime: null,
    pickupLocation: "",
    dropLocation: "",
    checkpoints: [],
    draggedIndex: null,
    totalPassengers: "",

    // VEHICLES
    selectedVehicles: [],
    vehicleCounts: {},
    showVehicleDropdown: false,

    // STAFF
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

    const vehicleOptions = ["Bus", "Van", "Car"];

    // =========================
    // ADD FORM
    // =========================
    const addTransportForm = () => {
      setTransportForms((prev) => [
        ...prev,
        createTransportForm(),
      ]);
    };

    // =========================
    // UPDATE FIELD
    // =========================
    const updateFormField = (
      formIndex,
      field,
      value
    ) => {
      const updatedForms = [...transportForms];

      updatedForms[formIndex][field] = value;

      setTransportForms(updatedForms);
    };

    // =========================
    // CHECKPOINTS
    // =========================
    const addCheckpoint = (formIndex) => {
      const updatedForms = [...transportForms];

      updatedForms[formIndex].checkpoints.push("");

      setTransportForms(updatedForms);
    };

    const updateCheckpoint = (
      formIndex,
      checkpointIndex,
      value
    ) => {
      const updatedForms = [...transportForms];

      updatedForms[formIndex].checkpoints[
        checkpointIndex
      ] = value;

      setTransportForms(updatedForms);
    };

    const removeCheckpoint = (
      formIndex,
      checkpointIndex
    ) => {
      const updatedForms = [...transportForms];

      updatedForms[formIndex].checkpoints =
        updatedForms[formIndex].checkpoints.filter(
          (_, i) => i !== checkpointIndex
        );

      setTransportForms(updatedForms);
    };

    // =========================
    // DRAG
    // =========================
    const handleDragStart = (
      formIndex,
      index
    ) => {
      const updatedForms = [...transportForms];

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
      const updatedForms = [...transportForms];

      const draggedIndex =
        updatedForms[formIndex].draggedIndex;

      if (
        draggedIndex === null ||
        draggedIndex === dropIndex
      ) {
        return;
      }

      const checkpoints = [
        ...updatedForms[formIndex].checkpoints,
      ];

      const draggedItem =
        checkpoints[draggedIndex];

      checkpoints.splice(draggedIndex, 1);

      checkpoints.splice(dropIndex, 0, draggedItem);

      updatedForms[formIndex].checkpoints =
        checkpoints;

      updatedForms[formIndex].draggedIndex =
        null;

      setTransportForms(updatedForms);
    };

    // =========================
    // STAFF
    // =========================
    const updateStaffDetail = (
      formIndex,
      staffIndex,
      field,
      value
    ) => {
      const updatedForms = [...transportForms];

      updatedForms[formIndex].staffDetails[
        staffIndex
      ][field] = value;

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

        default:
          return "Enter vehicle count";
      }
    };

    // =========================
    // PAYLOAD
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

        checkpoints: (
          form.checkpoints || []
        ).map((location) => ({
          location,
        })),

        totalPassengers:
          Number(form.totalPassengers) || 0,

        vehicles: (
          form.selectedVehicles || []
        ).map((vehicle) => ({
          type: vehicle,
          count:
            Number(
              form.vehicleCounts?.[vehicle]
            ) || 0,
        })),

        numberOfBusNeeded:
          Number(
            form.vehicleCounts?.["Bus"]
          ) || 0,

        numberOfAccompanyingStaff:
          Number(form.staffOptionType) || 0,

        accompanyingStaff: (
          form.staffDetails || []
        ).map((staff) => ({
          name: staff.name,
          mobile: Number(staff.mobile),
        })),

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

          if (!form.totalPassengers) {
            errors.push(
              `Form ${
                index + 1
              }: Total passengers required`
            );
          }

          if (
            !form.selectedVehicles ||
            form.selectedVehicles.length === 0
          ) {
            errors.push(
              `Form ${
                index + 1
              }: Vehicle type required`
            );
          }

          (
            form.selectedVehicles || []
          ).forEach((vehicle) => {
            if (
              !form.vehicleCounts?.[vehicle]
            ) {
              errors.push(
                `Form ${
                  index + 1
                }: ${vehicle} count required`
              );
            }
          });
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
              body: JSON.stringify(payload),
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

        {/* FORMS */}
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
             <div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-bold text-[#8b5cf6]">
    Transport Form {formIndex + 1}
  </h2>

 {formIndex !== 0 && (
  <button
    type="button"
    onClick={() => {
      const updatedForms =
        transportForms.filter(
          (_, index) => index !== formIndex
        );

      setTransportForms(updatedForms);
    }}
    className="
      w-[42px]
      h-[42px]
      p-2
      rounded-full
      bg-[#f3d7d7]
      flex
      items-center
      justify-center
      transition-all
     
    "
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"  
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ff2b2b"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  </button>
)}
</div>

              {/* DATE PICKERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomDateTimePicker
                  label="Pickup Date & Time *"
                  value={form.pickupDateTime}
                  onChange={(date) =>
                    updateFormField(
                      formIndex,
                      "pickupDateTime",
                      date
                    )
                  }
                  placeholder="Select pickup date & time"
                />

                <CustomDateTimePicker
                  label="Drop Date & Time *"
                  value={form.dropDateTime}
                  onChange={(date) =>
                    updateFormField(
                      formIndex,
                      "dropDateTime",
                      date
                    )
                  }
                  placeholder="Select drop date & time"
                />
              </div>

              {/* PICKUP */}
              <div className="mt-5">
                <label className="block text-sm mb-2">
                  Pickup Location *
                </label>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    border
                    border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                 
                    focus-within:border-[#3b82f6]
                    focus-within:ring-1
                    focus-within:ring-[#3b82f6]
                    transition-all
                  "
                >
                  <MapPin size={18} />

                  <input
                    type="text"
                    value={form.pickupLocation}
                    onChange={(e) =>
                      updateFormField(
                        formIndex,
                        "pickupLocation",
                        e.target.value
                      )
                    }
                    placeholder="Enter pickup location"
                    className="
                      bg-transparent
                      outline-none
                      w-full
                      text-white
                    "
                  />
                </div>
              </div>

              {/* CHECKPOINT */}
              <div className="flex justify-center mt-5">
                <button
                  type="button"
                  onClick={() =>
                    addCheckpoint(formIndex)
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
              {(form.checkpoints || []).length >
                0 && (
                <div className="mt-5 space-y-3">
                  {(form.checkpoints || []).map(
                    (
                      checkpoint,
                      checkpointIndex
                    ) => (
                      <div
                        key={checkpointIndex}
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
                          bg-[#282846]
                          rounded-md
                          px-4
                          py-2
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
                                formIndex,
                                checkpointIndex,
                                e.target.value
                              )
                            }
                            placeholder={`Checkpoint ${
                              checkpointIndex + 1
                            }`}
                            className="
                              bg-transparent
                              outline-none
                              text-white
                              w-full
                              border
                              border-transparent
                              rounded-md
                              px-2
                              py-2
                              focus:border-[#3b82f6]
                              focus:ring-0
                              focus:ring-[#3b82f6]
                            "
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

              {/* DROP */}
              <div className="mt-5">
                <label className="block text-sm mb-2">
                  Drop Location *
                </label>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    border
                    border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                   
                    focus-within:border-[#3b82f6]
                    focus-within:ring-0
                    focus-within:ring-[#3b82f6]
                    transition-all
                  "
                >
                  <MapPin size={18} />

                  <input
                    type="text"
                    value={form.dropLocation}
                    onChange={(e) =>
                      updateFormField(
                        formIndex,
                        "dropLocation",
                        e.target.value
                      )
                    }
                    placeholder="Enter drop location"
                    className="
                      bg-transparent
                      outline-none
                      w-full
                      text-white
                    "
                  />
                </div>
              </div>

              {/* PASSENGERS + VEHICLES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-sm mb-2">
                    Total Number of
                    Passengers *
                  </label>

                  <input
                    type="number"
                    value={form.totalPassengers}
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
                     
                      border
                      border-[#3a3a5a]
                      rounded-md
                      px-4
                      py-3
                      outline-none
                      focus:border-[#3b82f6]
                      focus:ring-0
                      focus:ring-[#3b82f6]
                      transition-all
                    "
                  />
                </div>

                {/* VEHICLE DROPDOWN */}
                <div className="relative">
                  <label className="block text-sm mb-2">
                    Type of Vehicle Needed *
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
                     
                      border
                      border-[#3a3a5a]
                      rounded-md
                      px-4
                      py-3
                      flex
                      justify-between
                      items-center
                      cursor-pointer
                      focus-within:border-[#3b82f6]
                      hover:border-[#3b82f6]
                      transition-all
                    "
                  >
                    <span className="truncate">
                      {(form.selectedVehicles ||
                        []).length > 0
                        ? form.selectedVehicles.join(
                            ", "
                          )
                        : "Select Vehicle"}
                    </span>

                    <ChevronDown size={18} />
                  </div>

                  {form.showVehicleDropdown && (
                    <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                      {vehicleOptions.map(
                        (option, index) => {
                          const isSelected =
                            (
                              form.selectedVehicles ||
                              []
                            ).includes(option);

                          return (
                            <div
                              key={index}
                              onClick={() => {
                                const updatedForms =
                                  [
                                    ...transportForms,
                                  ];

                                const currentVehicles =
                                  updatedForms[
                                    formIndex
                                  ]
                                    .selectedVehicles ||
                                  [];

                                let updatedVehicles =
                                  [];

                                if (
                                  isSelected
                                ) {
                                  updatedVehicles =
                                    currentVehicles.filter(
                                      (
                                        v
                                      ) =>
                                        v !==
                                        option
                                    );

                                  delete updatedForms[
                                    formIndex
                                  ]
                                    .vehicleCounts?.[
                                    option
                                  ];
                                } else {
                                  updatedVehicles =
                                    [
                                      ...currentVehicles,
                                      option,
                                    ];
                                }

                                updatedForms[
                                  formIndex
                                ].selectedVehicles =
                                  updatedVehicles;

                                setTransportForms(
                                  updatedForms
                                );
                              }}
                              className={`
                                px-4
                                py-3
                                cursor-pointer
                                flex
                                items-center
                                justify-between
                                ${
                                  isSelected
                                    ? "bg-[#3b82f6]"
                                    : "hover:bg-[#3b82f6]"
                                }
                              `}
                            >
                              <span>
                                {option}
                              </span>

                              {isSelected && (
                                <span>✓</span>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* VEHICLE COUNT */}
              {(form.selectedVehicles || [])
                .length > 0 && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(
                    form.selectedVehicles || []
                  ).map(
                    (vehicle, index) => (
                      <div
                        key={index}
                        className={
                          vehicle === "Bus"
                            ? "md:col-span-2"
                            : ""
                        }
                      >
                        <label className="block text-sm mb-2">
                          {getVehicleLabel(
                            vehicle
                          )}
                        </label>

                        <input
                          type="number"
                          value={
                            form.vehicleCounts?.[
                              vehicle
                            ] || ""
                          }
                          onChange={(e) => {
                            const updatedForms =
                              [
                                ...transportForms,
                              ];

                            updatedForms[
                              formIndex
                            ].vehicleCounts =
                              {
                                ...updatedForms[
                                  formIndex
                                ].vehicleCounts,
                                [vehicle]:
                                  e.target.value,
                              };

                            setTransportForms(
                              updatedForms
                            );
                          }}
                          placeholder={getVehiclePlaceholder(
                            vehicle
                          )}
                          className="
                            w-full
                         
                            border
                            border-[#3a3a5a]
                            rounded-md
                            px-4
                            py-3
                            outline-none
                            focus:border-[#3b82f6]
                            focus:ring-0
                            focus:ring-[#3b82f6]
                            transition-all
                          "
                        />
                      </div>
                    )
                  )}
                </div>
              )}

              {/* STAFF COUNT */}
              <div className="mt-5">
                <label className="block text-sm mb-2">
                  Number of Accompanying Staff *
                </label>

                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.staffOptionType}
                  onChange={(e) => {
                    const value = e.target.value;

                    const updatedForms = [
                      ...transportForms,
                    ];

                    updatedForms[
                      formIndex
                    ].staffOptionType = value;

                    const count =
                      Number(value);

                    updatedForms[
                      formIndex
                    ].staffDetails =
                      Array.from(
                        {
                          length:
                            count || 0,
                        },
                        (_, index) => ({
                          name:
                            updatedForms[
                              formIndex
                            ]
                              .staffDetails?.[
                              index
                            ]?.name || "",
                          mobile:
                            updatedForms[
                              formIndex
                            ]
                              .staffDetails?.[
                              index
                            ]?.mobile || "",
                        })
                      );

                    setTransportForms(
                      updatedForms
                    );
                  }}
                  placeholder="Enter staff count"
                  className="
                    w-full
                   
                    border
                    border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-[#3b82f6]
                    focus:ring-0
                    focus:ring-[#3b82f6]
                    transition-all
                  "
                />
              </div>

              {/* STAFF DETAILS */}
              {(form.staffDetails || [])
                .length > 0 && (
                <div className="mt-5 space-y-5">
                  {(
                    form.staffDetails || []
                  ).map(
                    (staff, staffIndex) => (
                      <div
                        key={staffIndex}
                        className="
                          bg-[#26264a]
                          border
                          border-[#34345c]
                          rounded-2xl
                          p-5
                        "
                      >
                        <h3 className="text-[#b06cff] font-semibold mb-4">
                          Staff {staffIndex + 1}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* NAME */}
                          <div className="relative">
                            <label
                              className="
                                absolute
                                -top-2.5
                                left-4
                                bg-[#26264a]
                                px-2
                                text-sm
                                text-white
                                z-10
                              "
                            >
                              Accompanying Staff Name
                            </label>

                            <input
                              type="text"
                              value={staff.name}
                              onChange={(e) =>
                                updateStaffDetail(
                                  formIndex,
                                  staffIndex,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Enter staff name"
                              className="
                                w-full
                                bg-[#26264a]
                                border
                                border-[#3a3a5a]
                                rounded-xl
                                px-4
                                py-4
                                outline-none
                                text-white
                                focus:border-[#3b82f6]
                                focus:ring-0
                                focus:ring-[#3b82f6]
                                transition-all
                              "
                            />
                          </div>

                          {/* MOBILE */}
                          <div className="relative">
                            <label
                              className="
                                absolute
                                -top-2.5
                                left-4
                                bg-[#26264a]
                                px-2
                                text-sm
                                text-white
                                z-10
                              "
                            >
                              Accompanying Staff Mobile Number
                            </label>

                            <input
                              type="number"
                              value={staff.mobile}
                              onChange={(e) =>
                                updateStaffDetail(
                                  formIndex,
                                  staffIndex,
                                  "mobile",
                                  e.target.value
                                )
                              }
                              placeholder="Enter mobile number"
                              className="
                                w-full
                                bg-[#26264a]
                                border
                                border-[#3a3a5a]
                                rounded-xl
                                px-4
                                py-4
                                outline-none
                                text-white
                                focus:border-[#3b82f6]
                                focus:ring-0
                                focus:ring-[#3b82f6]
                                transition-all
                              "
                            />
                          </div>
                        </div>
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
                   
                    border
                    border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                    outline-none
                    resize-none
                    focus:border-[#3b82f6]
                    focus:ring-0
                    focus:ring-[#3b82f6]
                    transition-all
                  "
                />
              </div>
            </div>
          )
        )}

        {/* ERRORS */}
        {validationErrors.length > 0 && (
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