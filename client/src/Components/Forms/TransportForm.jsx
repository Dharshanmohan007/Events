import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Trash2,
  GripVertical,
  X,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";

const BASE_URL = "https://sece-events.onrender.com";

// All string fields MUST be initialized to "" (never undefined)
// so inputs stay controlled for their entire lifetime.
function createEmptyForm() {
  return {
    pickupDate: null,
    dropDate: null,
    pickupLocation: "",
    dropLocation: "",
    vistaTransport: [],       // array – multi-select
    staffCount: "",
    totalPassengers: "",
    busCount: "",
    accompanyingStaffName: "",
    accompanyingStaffMobile: "",
    specialRequirements: "",
    checkpoints: [],
  };
}

// Sanitise a form that may have been restored from parent state
// (fields may be undefined if the parent stored a partial object).
function sanitiseForm(f) {
  return {
    pickupDate: f.pickupDate ?? null,
    dropDate: f.dropDate ?? null,
    pickupLocation: f.pickupLocation ?? "",
    dropLocation: f.dropLocation ?? "",
    vistaTransport: Array.isArray(f.vistaTransport) ? f.vistaTransport : [],
    staffCount: f.staffCount ?? "",
    totalPassengers: f.totalPassengers ?? "",
    busCount: f.busCount ?? "",
    accompanyingStaffName: f.accompanyingStaffName ?? "",
    accompanyingStaffMobile: f.accompanyingStaffMobile ?? "",
    specialRequirements: f.specialRequirements ?? "",
    checkpoints: Array.isArray(f.checkpoints) ? f.checkpoints : [],
  };
}

function validateTransport(forms) {
  if (!forms || forms.length === 0) {
    return { _global: "Enter at least one transport entry" };
  }

  const errors = forms.map((form) => {
    const err = {};
    if (!form.pickupDate) err.pickupDate = "Pickup date & time is required";
    if (!form.dropDate) err.dropDate = "Drop date & time is required";
    if (!form.pickupLocation?.trim()) err.pickupLocation = "Pickup location is required";
    if (!form.dropLocation?.trim()) err.dropLocation = "Drop location is required";
    if (!form.vistaTransport || form.vistaTransport.length === 0)
      err.vistaTransport = "Vehicle type is required";
    if (!String(form.totalPassengers).trim())
      err.totalPassengers = "Total passengers is required";
    if (form.staffCount === "" || form.staffCount === null || form.staffCount === undefined)
      err.staffCount = "Accompanying staff count is required";
    return err;
  });

  if (errors.some((e) => Object.keys(e).length > 0)) return errors;
  return {};
}

export default function TransportForm({
  nextStep,
  prevStep,
  registerChildNavigation,
  transportData: initialTransportData,
  onTransportDataChange,
  eventId,
  errors: propErrors = {},
}) {
  const [forms, setForms] = useState(() => {
    if (initialTransportData && initialTransportData.length > 0) {
      return initialTransportData.map(sanitiseForm);
    }
    return [createEmptyForm()];
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Drag state for checkpoints
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const formsRef = useRef(forms);
  useEffect(() => { formsRef.current = forms; }, [forms]);

  const onChangeRef = useRef(onTransportDataChange);
  useEffect(() => { onChangeRef.current = onTransportDataChange; }, [onTransportDataChange]);
  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current(forms);
  }, [forms]);

  // Always keep string fields controlled (never let value become undefined)
  const handleChange = (index, field, value) => {
    setForms((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value ?? "",   // guard against undefined
      };
      return updated;
    });
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const updated = [...prev];
      updated[index] = { ...(updated[index] || {}), [field]: "" };
      return updated;
    });
  };

  // Multi-select toggle for vehicle types
  const handleVehicleToggle = (formIndex, option) => {
    setForms((prev) => {
      const updated = [...prev];
      const current = updated[formIndex].vistaTransport || [];
      const exists = current.includes(option);
      updated[formIndex] = {
        ...updated[formIndex],
        vistaTransport: exists
          ? current.filter((v) => v !== option)
          : [...current, option],
      };
      return updated;
    });
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const updated = [...prev];
      updated[formIndex] = { ...(updated[formIndex] || {}), vistaTransport: "" };
      return updated;
    });
  };

  const handleAddForm = () => setForms((prev) => [...prev, createEmptyForm()]);
  const removeForm = (index) =>
    setForms((prev) => prev.filter((_, i) => i !== index));

  const addCheckpoint = (formIndex) => {
    setForms((prev) => {
      const updated = [...prev];
      updated[formIndex] = {
        ...updated[formIndex],
        checkpoints: [...(updated[formIndex].checkpoints || []), { name: "" }],
      };
      return updated;
    });
  };

  const handleCheckpointChange = (formIndex, cpIndex, value) => {
    setForms((prev) => {
      const updated = [...prev];
      const checkpoints = [...(updated[formIndex].checkpoints || [])];
      checkpoints[cpIndex] = { ...checkpoints[cpIndex], name: value ?? "" };
      updated[formIndex] = { ...updated[formIndex], checkpoints };
      return updated;
    });
  };

  const removeCheckpoint = (formIndex, cpIndex) => {
    setForms((prev) => {
      const updated = [...prev];
      const checkpoints = [...(updated[formIndex].checkpoints || [])];
      checkpoints.splice(cpIndex, 1);
      updated[formIndex] = { ...updated[formIndex], checkpoints };
      return updated;
    });
  };

  // ─── Drag-and-drop checkpoint reorder ──────────────────────────────────────
  const handleDragStart = (formIndex, cpIndex) => {
    dragItem.current = { formIndex, cpIndex };
  };
  const handleDragEnter = (formIndex, cpIndex) => {
    dragOverItem.current = { formIndex, cpIndex };
  };
  const handleDragEnd = (formIndex) => {
    if (
      !dragItem.current ||
      !dragOverItem.current ||
      dragItem.current.formIndex !== formIndex ||
      dragOverItem.current.formIndex !== formIndex
    ) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    const from = dragItem.current.cpIndex;
    const to = dragOverItem.current.cpIndex;
    if (from !== to) {
      setForms((prev) => {
        const updated = [...prev];
        const checkpoints = [...(updated[formIndex].checkpoints || [])];
        const [dragged] = checkpoints.splice(from, 1);
        checkpoints.splice(to, 0, dragged);
        updated[formIndex] = { ...updated[formIndex], checkpoints };
        return updated;
      });
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    const latest = formsRef.current;
    const errs = validateTransport(latest);
    const hasErrors = !Array.isArray(errs)
      ? Object.keys(errs).length > 0
      : errs.some((e) => Object.keys(e).length > 0);

    if (hasErrors) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);
    setApiError("");

    try {
      const payload = {
        transportDetails: {
          transports: latest.map((form) => ({
            pickupDateTime: form.pickupDate ? form.pickupDate.toISOString() : "",
            dropDateTime: form.dropDate ? form.dropDate.toISOString() : "",
            pickupLocation: form.pickupLocation || "",
            checkpoints: (form.checkpoints || [])
              .filter((cp) => cp.name?.trim())
              .map((cp) => ({ location: cp.name })),
            dropLocation: form.dropLocation || "",
            totalPassengers: Number(form.totalPassengers) || 0,
            vehicles: [
              {
                type: Array.isArray(form.vistaTransport)
                  ? form.vistaTransport.join(", ")
                  : form.vistaTransport || "",
                count: Number(form.busCount) || 0,
              },
            ],
            accompanyingStaff: [
              {
                name: form.accompanyingStaffName || "",
                // Always a number; 0 when empty – prevents NaN in payload
                mobile: Number(form.accompanyingStaffMobile) || 0,
              },
            ],
            specialRequirements: form.specialRequirements || "",
          })),
        },
      };
      console.log("transport payload data :", payload);

      const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || `Server error: ${response.status}`);
      nextStep();
    } catch (err) {
      setApiError(
        err.message || "Failed to save transport details. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [eventId, nextStep]);

  const handleBack = useCallback(() => {
    if (prevStep) prevStep();
  }, [prevStep]);

  const navRef = useRef({ next: handleNext, prev: handleBack, isLoading });
  useEffect(() => {
    navRef.current = { next: handleNext, prev: handleBack, isLoading };
  });

  useEffect(() => {
    if (!registerChildNavigation) return;
    const stableNext = (...args) => navRef.current.next(...args);
    const stablePrev = (...args) => navRef.current.prev(...args);
    registerChildNavigation({ next: stableNext, prev: stablePrev, isLoading: false });
    return () => registerChildNavigation({ next: null, prev: null, isLoading: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerChildNavigation]);

  useEffect(() => {
    if (!registerChildNavigation) return;
    registerChildNavigation({
      next: navRef.current.next,
      prev: navRef.current.prev,
      isLoading,
    });
  }, [isLoading, registerChildNavigation]);

  const getError = (index, field) => {
    if (Array.isArray(errors)) return errors[index]?.[field] || "";
    return "";
  };

  const vehicleOptions = ["Bus", "Van", "Car", "Outsource car"];

  return (
    <div className="w-full">
      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddForm}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {forms.map((form, formIndex) => (
        <div
          key={formIndex}
          className="relative bg-[#1f1f3a] p-6 rounded-xl w-full mb-6"
        >
          {/* Delete button – only on duplicated forms */}
          {formIndex !== 0 && (
            <button
              onClick={() => removeForm(formIndex)}
              className="absolute top-3 right-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-full transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Row 1: Pickup Date & Drop Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-300 block mb-1">
                Pickup date & Time *
              </label>
              <div className="flex items-center bg-[#2a2a4a] px-4 py-2 rounded-lg border border-gray-600">
                <DatePicker
                  selected={form.pickupDate}
                  onChange={(date) => handleChange(formIndex, "pickupDate", date)}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy h:mm aa"
                  placeholderText="__/__/____"
                  className="bg-transparent outline-none text-gray-300 w-full"
                  withPortal
                />
                <div className="flex gap-2 text-gray-400 flex-shrink-0">
                  <CalendarDays size={18} />
                  <Clock size={18} />
                </div>
              </div>
              {getError(formIndex, "pickupDate") && (
                <p className="text-red-400 text-xs mt-1">
                  {getError(formIndex, "pickupDate")}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-1">
                Drop date & Time *
              </label>
              <div className="flex items-center bg-[#2a2a4a] px-4 py-2 rounded-lg border border-gray-600">
                <DatePicker
                  selected={form.dropDate}
                  onChange={(date) => handleChange(formIndex, "dropDate", date)}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy h:mm aa"
                  placeholderText="__/__/____"
                  className="bg-transparent outline-none text-gray-300 w-full"
                  withPortal
                />
                <div className="flex gap-2 text-gray-400 flex-shrink-0">
                  <CalendarDays size={18} />
                  <Clock size={18} />
                </div>
              </div>
              {getError(formIndex, "dropDate") && (
                <p className="text-red-400 text-xs mt-1">
                  {getError(formIndex, "dropDate")}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Pickup Location */}
          <div className="mb-4">
            <label className="text-sm text-gray-300 block mb-1">
              Pickup Location *
            </label>
            <div className="flex items-center bg-[#2a2a4a] px-4 py-2 rounded-lg border border-gray-600">
              <MapPin size={18} className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Pickup location"
                value={form.pickupLocation}
                onChange={(e) =>
                  handleChange(formIndex, "pickupLocation", e.target.value)
                }
                className="bg-transparent outline-none text-gray-300 w-full"
              />
            </div>
            {getError(formIndex, "pickupLocation") && (
              <p className="text-red-400 text-xs mt-1">
                {getError(formIndex, "pickupLocation")}
              </p>
            )}
          </div>

          {/* Row 3: Checkpoints */}
          <div className="mb-4">
            {(form.checkpoints || []).length > 0 && (
              <div className="mb-3 space-y-2">
                {(form.checkpoints || []).map((cp, cpIndex) => (
                  <div
                    key={cpIndex}
                    draggable
                    onDragStart={() => handleDragStart(formIndex, cpIndex)}
                    onDragEnter={() => handleDragEnter(formIndex, cpIndex)}
                    onDragEnd={() => handleDragEnd(formIndex)}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center bg-[#2a2a4a] px-3 py-2 rounded-lg border border-gray-600 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical
                      size={16}
                      className="text-gray-500 mr-2 flex-shrink-0"
                    />
                    <MapPin
                      size={16}
                      className="text-gray-400 mr-2 flex-shrink-0"
                    />
                    <input
                      type="text"
                      placeholder={`${cpIndex + 1}. Checkpoint`}
                      value={cp.name ?? ""}
                      onChange={(e) =>
                        handleCheckpointChange(formIndex, cpIndex, e.target.value)
                      }
                      className="bg-transparent outline-none text-gray-300 w-full text-sm"
                    />
                    <button
                      onClick={() => removeCheckpoint(formIndex, cpIndex)}
                      className="ml-2 flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Checkpoint button */}
            <div className="flex justify-center">
              <button
                onClick={() => addCheckpoint(formIndex)}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
              >
                <span className="bg-purple-600 hover:bg-purple-500 text-white rounded-full p-1 transition-colors">
                  <Plus size={14} />
                </span>
                Add Checkpoint
              </button>
            </div>
          </div>

          {/* Row 4: Drop Location */}
          <div className="mb-6">
            <label className="text-sm text-gray-300 block mb-1">
              Drop Location *
            </label>
            <div className="flex items-center bg-[#2a2a4a] px-4 py-2 rounded-lg border border-gray-600">
              <MapPin size={18} className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Drop location"
                value={form.dropLocation}
                onChange={(e) =>
                  handleChange(formIndex, "dropLocation", e.target.value)
                }
                className="bg-transparent outline-none text-gray-300 w-full"
              />
            </div>
            {getError(formIndex, "dropLocation") && (
              <p className="text-red-400 text-xs mt-1">
                {getError(formIndex, "dropLocation")}
              </p>
            )}
          </div>

          {/* Row 5: Total Passengers + Vehicle Multi-Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <CustomInput
                label="Total Number of Passengers *"
                type="number"
                value={form.totalPassengers}
                onChange={(e) =>
                  handleChange(formIndex, "totalPassengers", e.target.value)
                }
              />
              {getError(formIndex, "totalPassengers") && (
                <p className="text-red-400 text-xs mt-1">
                  {getError(formIndex, "totalPassengers")}
                </p>
              )}
            </div>

            <div>
              <VehicleMultiSelect
                label="Types of Vehicles Needed *"
                options={vehicleOptions}
                selected={form.vistaTransport}
                onToggle={(opt) => handleVehicleToggle(formIndex, opt)}
              />
              {getError(formIndex, "vistaTransport") && (
                <p className="text-red-400 text-xs mt-1">
                  {getError(formIndex, "vistaTransport")}
                </p>
              )}
            </div>
          </div>

          {/* Row 6: Number of Buses + Accompanying Staff Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <CustomInput
              label="Number of Buses Needed"
              type="number"
              value={form.busCount}
              onChange={(e) =>
                handleChange(formIndex, "busCount", e.target.value)
              }
            />

            <div>
              <CustomSelect
                label="Number of Accompanying Staff *"
                value={form.staffCount}
                onChange={(val) =>
                  handleChange(formIndex, "staffCount", val ?? "")
                }
                options={["1", "2", "3", "4"]}
              />
              {getError(formIndex, "staffCount") && (
                <p className="text-red-400 text-xs mt-1">
                  {getError(formIndex, "staffCount")}
                </p>
              )}
            </div>
          </div>

          {/* Row 7: Staff Name + Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <CustomInput
              label="Accompanying Staff Name"
              value={form.accompanyingStaffName}
              onChange={(e) =>
                handleChange(formIndex, "accompanyingStaffName", e.target.value)
              }
            />
            <CustomInput
              label="Accompanying Staff Mobile Number"
              type="number"
              value={form.accompanyingStaffMobile}
              onChange={(e) =>
                handleChange(formIndex, "accompanyingStaffMobile", e.target.value)
              }
            />
          </div>

          {/* Row 8: Special Requirements */}
          <div className="relative mt-4 mb-2">
            <textarea
              value={form.specialRequirements}
              onChange={(e) =>
                handleChange(formIndex, "specialRequirements", e.target.value)
              }
              className="w-full p-4 rounded-lg border border-gray-700 text-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-200 bg-transparent"
              rows={4}
              placeholder=" "
            />
            <label className="absolute -top-2 left-3 text-xs text-white bg-[#1f1f3a] px-1">
              Special Requirements, If any
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Vehicle Multi-Select ────────────────────────────────────────────────────
function VehicleMultiSelect({ label, options, selected = [], onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayText =
    selected.length === 0
      ? "Bus / Van / Car / Outsource car"
      : selected.join(", ");

  return (
    <div ref={ref} className="relative w-full">
      {/* Floating label – matches CustomInput/CustomSelect style */}
      <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none bg-[#1f1f3a]">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between bg-transparent px-4 py-[13px] rounded-lg border text-left transition-colors ${
          open ? "border-purple-500" : "border-[#3A3A5A]"
        }`}
      >
        <span
          className={`text-sm truncate ${
            selected.length === 0 ? "text-gray-500" : "text-white"
          }`}
        >
          {displayText}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-purple-600/20 transition-colors text-left"
              >
                <span
                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-purple-600 border-purple-600"
                      : "border-gray-500"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}