import React, { useState, useRef, useEffect, useCallback } from "react";
import { CalendarDays, Clock, MapPin, Plus, Trash2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";

const BASE_URL = "https://sece-events.onrender.com";

function createEmptyForm() {
  return {
    pickupDate: null,
    dropDate: null,
    pickupLocation: "",
    dropLocation: "",
    vistaTransport: "",
    staffCount: "",
    totalPassengers: "",
    busCount: "",
    accompanyingStaff: [
      { name, mobile }
    ],
    specialRequirements: "",
    checkpoints: [],
  };
}

function validateTransport(forms) {
  if (!forms || forms.length === 0) {
    return { _global: "Enter at least one transport entry" };
  }

  const errors = forms.map((form) => {
    const err = {};

    if (!form.pickupDate)
      err.pickupDate = "Pickup date & time is required";

    if (!form.dropDate)
      err.dropDate = "Drop date & time is required";

    if (!form.pickupLocation?.trim())
      err.pickupLocation = "Pickup location is required";

    if (!form.dropLocation?.trim())
      err.dropLocation = "Drop location is required";

    if (!form.vistaTransport)
      err.vistaTransport = "Vehicle type is required";

    if (!String(form.totalPassengers).trim())
      err.totalPassengers = "Total passengers is required";

    if (
      form.staffCount === "" ||
      form.staffCount === null ||
      form.staffCount === undefined
    ) {
      err.staffCount = "Accompanying staff count is required";
    }

    return err;
  });

  if (errors.some((e) => Object.keys(e).length > 0)) {
    return errors;
  }

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
  const [forms, setForms] = useState(() =>
    initialTransportData && initialTransportData.length > 0
      ? initialTransportData
      : [createEmptyForm()]
  );
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Always-fresh ref for validation/submission
  const formsRef = useRef(forms);
  useEffect(() => { formsRef.current = forms; }, [forms]);

  // Sync to parent
  const onChangeRef = useRef(onTransportDataChange);
  useEffect(() => { onChangeRef.current = onTransportDataChange; }, [onTransportDataChange]);
  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current(forms);
  }, [forms]);

  const handleChange = (index, field, value) => {
    setForms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const updated = [...prev];
      updated[index] = { ...(updated[index] || {}), [field]: "" };
      return updated;
    });
  };

  const handleAddForm = () => setForms((prev) => [...prev, createEmptyForm()]);

  const removeForm = (index) => setForms((prev) => prev.filter((_, i) => i !== index));

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
      checkpoints[cpIndex] = { ...checkpoints[cpIndex], name: value };
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
            pickupDateTime: form.pickupDate
              ? form.pickupDate.toISOString()
              : "",

            dropDateTime: form.dropDate
              ? form.dropDate.toISOString()
              : "",

            pickupLocation: form.pickupLocation || "",

            checkpoints: (form.checkpoints || [])
              .filter((cp) => cp.name?.trim())
              .map((cp) => ({
                location: cp.name,
              })),

            dropLocation: form.dropLocation || "",

            totalPassengers: Number(form.totalPassengers) || 0,

            vehicles: [
              {
                type: form.vistaTransport || "",
                count: Number(form.busCount) || 0,
              },
            ],

            accompanyingStaff: [
              {
                name: form.accompanyingStaffName || "",
                mobile: Number(form.accompanyingStaffMobile) || "",
              },
            ],

            specialRequirements: form.specialRequirements || "",
          })),
        },
      };
      console.log("transport payload data :",payload);
      
      const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Server error: ${response.status}`);
      nextStep();
    } catch (err) {
      setApiError(err.message || "Failed to save transport details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, nextStep]);

  const handleBack = useCallback(() => {
    if (prevStep) prevStep();
  }, [prevStep]);

  const navRef = useRef({ next: handleNext, prev: handleBack, isLoading });
  useEffect(() => { navRef.current = { next: handleNext, prev: handleBack, isLoading }; });

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
    registerChildNavigation({ next: navRef.current.next, prev: navRef.current.prev, isLoading });
  }, [isLoading, registerChildNavigation]);

  const getError = (index, field) => {
    if (Array.isArray(errors)) return errors[index]?.[field] || "";
    return "";
  };

  return (
    <div className="w-full">
      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddForm}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add
        </button>
      </div>

      {forms.map((form, formIndex) => (
        <div key={formIndex} className="relative bg-[#1f1f3a] p-6 rounded-xl w-full mb-6">
          {formIndex !== 0 && (
            <button
              onClick={() => removeForm(formIndex)}
              className="absolute top-3 right-3 bg-red-100 text-red-500 hover:bg-red-200 p-2 rounded-full"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Pickup / Drop date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-300 block mb-1">Pickup date & Time *</label>
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
                <p className="text-red-400 text-xs mt-1">{getError(formIndex, "pickupDate")}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-1">Drop date & Time *</label>
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
                <p className="text-red-400 text-xs mt-1">{getError(formIndex, "dropDate")}</p>
              )}
            </div>
          </div>

          {/* Pickup Location */}
          <div className="mb-4">
            <label className="text-sm text-gray-300 block mb-1">Pickup Location *</label>
            <div className="flex items-center bg-[#2a2a4a] mt-1 px-4 py-2 rounded-lg border border-gray-600">
              <MapPin size={18} className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Pickup location"
                value={form.pickupLocation}
                onChange={(e) => handleChange(formIndex, "pickupLocation", e.target.value)}
                className="bg-transparent outline-none text-gray-300 w-full"
              />
            </div>
            {getError(formIndex, "pickupLocation") && (
              <p className="text-red-400 text-xs mt-1">{getError(formIndex, "pickupLocation")}</p>
            )}
          </div>

          {/* Checkpoints */}
          {(form.checkpoints || []).map((cp, cpIndex) => (
            <div
              key={cpIndex}
              className="flex items-center justify-between bg-[#2a2a4a] px-4 py-2 rounded-lg border border-gray-600 mb-2"
            >
              <div className="flex items-center w-full">
                <MapPin size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder={`${cpIndex + 1}. Checkpoint`}
                  value={cp.name}
                  onChange={(e) => handleCheckpointChange(formIndex, cpIndex, e.target.value)}
                  className="bg-transparent outline-none text-gray-300 w-full"
                />
              </div>
              <button
                onClick={() => removeCheckpoint(formIndex, cpIndex)}
                className="ml-2 w-6 h-8 flex items-center justify-center text-red-400"
              >
                ✕
              </button>
            </div>
          ))}

          <div className="flex justify-center mt-4 mb-6">
            <button onClick={() => addCheckpoint(formIndex)} className="flex items-center gap-2 text-purple-400">
              <span className="bg-purple-600 text-white rounded-full p-1">
                <Plus size={14} />
              </span>
              Add Checkpoint
            </button>
          </div>

          {/* Drop Location */}
          <div className="mb-6">
            <label className="text-sm text-gray-300 block mb-1">Drop Location *</label>
            <div className="flex items-center bg-[#1f1f38] mt-1 px-4 py-2 rounded-lg border border-gray-600">
              <MapPin size={18} className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Drop location"
                value={form.dropLocation}
                onChange={(e) => handleChange(formIndex, "dropLocation", e.target.value)}
                className="bg-transparent outline-none text-gray-300 w-full"
              />
            </div>
            {getError(formIndex, "dropLocation") && (
              <p className="text-red-400 text-xs mt-1">{getError(formIndex, "dropLocation")}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomInput
                label="Total Number of Passengers *"
                type="number"
                value={form.totalPassengers}
                onChange={(e) => handleChange(formIndex, "totalPassengers", e.target.value)}
              />
              {getError(formIndex, "totalPassengers") && (
                <p className="text-red-400 text-xs mt-1">{getError(formIndex, "totalPassengers")}</p>
              )}
            </div>

            <div>
              <CustomSelect
                label="Types of Vehicles Needed *"
                value={form.vistaTransport}
                onChange={(val) => handleChange(formIndex, "vistaTransport", val)}
                options={["Bus", "Van", "Car", "Outsource car"]}
              />
              {getError(formIndex, "vistaTransport") && (
                <p className="text-red-400 text-xs mt-1">{getError(formIndex, "vistaTransport")}</p>
              )}
            </div>

            <CustomInput
              label="Number of Buses Needed"
              type="number"
              value={form.busCount}
              onChange={(e) => handleChange(formIndex, "busCount", e.target.value)}
            />

            <div>
              <CustomSelect
                label="Number of Accompanying Staff *"
                value={form.staffCount}
                onChange={(val) => handleChange(formIndex, "staffCount", val)}
                options={["1", "2", "3", "4"]}
              />
              {getError(formIndex, "staffCount") && (
                <p className="text-red-400 text-xs mt-1">{getError(formIndex, "staffCount")}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <CustomInput
              label="Accompanying Staff Name"
              value={form.accompanyingStaffName}
              onChange={(e) => handleChange(formIndex, "accompanyingStaffName", e.target.value)}
            />
            <CustomInput
              label="Accompanying Staff Mobile Number"
              type="number"
              value={form.accompanyingStaffMobile}
              onChange={(e) => handleChange(formIndex, "accompanyingStaffMobile", e.target.value)}
            />
          </div>

          <div className="relative mt-4 mb-2">
            <textarea
              value={form.specialRequirements}
              onChange={(e) => handleChange(formIndex, "specialRequirements", e.target.value)}
              className="w-full p-4 rounded-lg border border-gray-700 text-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-200 bg-transparent"
              rows={4}
            />
            <label className="absolute -top-2 left-3 text-xs text-white bg-[#1f1f3a] px-1">
              Special Requirements
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}