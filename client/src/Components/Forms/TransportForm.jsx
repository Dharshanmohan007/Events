import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  GripVertical,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import CustomDateTimePicker from "../CustomDateTimePicker";

const BASE_URL = "https://sece-events.onrender.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createEmptyForm() {
  return {
    pickupDate: null,
    dropDate: null,
    pickupLocation: "",
    dropLocation: "",
    vistaTransport: [],
    vehicleCounts: {},
    staffCount: "",
    staffMembers: [],
    totalPassengers: "",
    specialRequirements: "",
    checkpoints: [],
  };
}

function sanitiseForm(f) {
  return {
    pickupDate: f.pickupDate ?? null,
    dropDate: f.dropDate ?? null,
    pickupLocation: f.pickupLocation ?? "",
    dropLocation: f.dropLocation ?? "",
    vistaTransport: Array.isArray(f.vistaTransport) ? f.vistaTransport : [],
    vehicleCounts:
      f.vehicleCounts && typeof f.vehicleCounts === "object" ? f.vehicleCounts : {},
    staffCount: f.staffCount ?? "",
    staffMembers: Array.isArray(f.staffMembers) ? f.staffMembers : [],
    totalPassengers: f.totalPassengers ?? "",
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
    if (
      form.staffCount === "" ||
      form.staffCount === null ||
      form.staffCount === undefined
    )
      err.staffCount = "Accompanying staff count is required";
    return err;
  });
  if (errors.some((e) => Object.keys(e).length > 0)) return errors;
  return {};
}

function buildStaffMembers(existing, newCount) {
  const count = parseInt(newCount) || 0;
  return Array.from({ length: count }, (_, i) => ({
    name: existing[i]?.name ?? "",
    mobile: existing[i]?.mobile ?? "",
  }));
}

// ─── Floating-label text input ────────────────────────────────────────────────
function FloatingInput({ label, type = "text", value, onChange, bgClass = "bg-[#1f1f3a]" }) {
  return (
    <div className="relative w-full">
      <span className={`absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none ${bgClass}`}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="w-full bg-transparent px-4 py-[13px] rounded-lg border border-[#3A3A5A] text-white text-sm outline-none focus:border-purple-500 transition-colors"
      />
    </div>
  );
}

// ─── Custom Select ────────────────────────────────────────────────────────────
function CustomSelectDropdown({ label, value, onChange, options, placeholder = "Select", bgClass = "bg-[#1f1f3a]" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <span className={`absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none ${bgClass}`}>{label}</span>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between bg-transparent px-4 py-[13px] rounded-lg border text-left transition-colors ${open ? "border-purple-500" : "border-[#3A3A5A]"}`}
      >
        <span className={`text-sm ${value ? "text-white" : "text-gray-500"}`}>{value || placeholder}</span>
        <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-purple-600/20 transition-colors text-left">
                <span>{opt}</span>
                {isSelected && <Check size={14} className="text-purple-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Vehicle Multi-Select ─────────────────────────────────────────────────────
function VehicleMultiSelect({ label, options, selected = [], onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayText = selected.length === 0 ? "Bus / Van / Car / Outsource car" : selected.join(", ");

  return (
    <div ref={ref} className="relative w-full">
      <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none bg-[#1f1f3a]">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between bg-transparent px-4 py-[13px] rounded-lg border text-left transition-colors ${open ? "border-purple-500" : "border-[#3A3A5A]"}`}
      >
        <span className={`text-sm truncate ${selected.length === 0 ? "text-gray-500" : "text-white"}`}>{displayText}</span>
        <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <button key={opt} type="button" onClick={() => onToggle(opt)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-purple-600/20 transition-colors text-left">
                <span>{opt}</span>
                {isSelected && <Check size={14} className="text-purple-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Vehicle Count Inputs ─────────────────────────────────────────────────────
function VehicleCountInputs({ selectedVehicles, vehicleCounts, onChange, cardBg }) {
  const rows = [];
  for (let i = 0; i < selectedVehicles.length; i += 2) rows.push(selectedVehicles.slice(i, i + 2));
  return (
    <div className="mb-4 space-y-4">
      {rows.map((row, ri) => (
        <div key={ri} className={`grid gap-4 ${row.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
          {row.map((vehicleType) => (
            <FloatingInput key={vehicleType} label={`Number of ${vehicleType}s Needed`} type="number"
              value={vehicleCounts?.[vehicleType] ?? ""} onChange={(e) => onChange(vehicleType, e.target.value)} bgClass={cardBg} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Checkpoint List ─────────────────────────────────────────────────────────
// Drag triggered ONLY from grip handle (draggable=false on row, handle sets draggable on parent via ref).
// Live visual reorder: list renders with dragged item moved to current overIndex position while dragging.
function CheckpointList({ checkpoints, formIndex, onReorder, onChange, onRemove, onAdd }) {
  const dragIndexRef = useRef(null);
  const overIndexRef = useRef(null);
  const rowRefs = useRef([]);

  // liveOrder = the visually re-arranged indices during drag, null when not dragging
  const [liveOrder, setLiveOrder] = useState(null);

  // Build display order: take original indices and move dragIndex to overIndex position
  const getDisplayOrder = (drag, over, total) => {
    const order = Array.from({ length: total }, (_, i) => i);
    if (drag === null || over === null || drag === over) return order;
    const [item] = order.splice(drag, 1);
    order.splice(over, 0, item);
    return order;
  };

  const startDragFromHandle = (e, cpIndex) => {
    // Make the parent row draggable and kick off the drag
    const row = rowRefs.current[cpIndex];
    if (row) {
      row.setAttribute("draggable", "true");
    }
    dragIndexRef.current = cpIndex;
    overIndexRef.current = cpIndex;
    // Use a minimal transparent drag image so browser ghost doesn't interfere
    const ghost = document.createElement("div");
    ghost.style.position = "fixed";
    ghost.style.top = "-1000px";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragStart = (e, cpIndex) => {
    dragIndexRef.current = cpIndex;
    overIndexRef.current = cpIndex;
    setLiveOrder(getDisplayOrder(cpIndex, cpIndex, checkpoints.length));
  };

  const handleDragEnter = (e, cpIndex) => {
    e.preventDefault();
    if (dragIndexRef.current === null) return;
    overIndexRef.current = cpIndex;
    setLiveOrder(getDisplayOrder(dragIndexRef.current, cpIndex, checkpoints.length));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, cpIndex) => {
    e.preventDefault();
    overIndexRef.current = cpIndex;
  };

  const handleDragEnd = (cpIndex) => {
    // Remove draggable so only handle can re-trigger
    const row = rowRefs.current[cpIndex];
    if (row) row.setAttribute("draggable", "false");

    const from = dragIndexRef.current;
    const to = overIndexRef.current;
    setLiveOrder(null);
    dragIndexRef.current = null;
    overIndexRef.current = null;

    if (from !== null && to !== null && from !== to) {
      onReorder(formIndex, from, to);
    }
  };

  const isDragging = dragIndexRef.current !== null || liveOrder !== null;
  const displayOrder = liveOrder ?? checkpoints.map((_, i) => i);

  return (
    <div className="mb-4">
      {checkpoints.length > 0 && (
        <div className="mb-3 space-y-2">
          {displayOrder.map((originalIndex, displayPos) => {
            const cp = checkpoints[originalIndex];
            const isBeingDragged = liveOrder !== null && dragIndexRef.current === originalIndex;

            return (
              <div
                key={originalIndex}
                ref={(el) => (rowRefs.current[originalIndex] = el)}
                draggable="false"
                onDragStart={(e) => handleDragStart(e, originalIndex)}
                onDragEnter={(e) => handleDragEnter(e, originalIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, originalIndex)}
                onDragEnd={() => handleDragEnd(originalIndex)}
                style={{
                  opacity: isBeingDragged ? 0.4 : 1,
                  transition: "opacity 0.12s ease, transform 0.15s ease",
                  transform: isBeingDragged ? "scale(1.02)" : "scale(1)",
                }}
              >
                <div
                  className="flex items-stretch rounded-lg border overflow-hidden"
                  style={{
                    minHeight: "46px",
                    backgroundColor: isBeingDragged ? "#32325a" : "#2a2a4a",
                    borderColor: isBeingDragged ? "#a855f7" : "#4b5563",
                    boxShadow: isBeingDragged ? "0 6px 24px rgba(168,85,247,0.35)" : "none",
                  }}
                >
                  {/* ── Grip handle — this is the ONLY drag trigger ── */}
                  <div
                    className="flex items-center justify-center border-r border-gray-600 bg-[#23234a] select-none flex-shrink-0"
                    style={{ minWidth: 36, cursor: "grab" }}
                    onMouseDown={(e) => {
                      // Enable draggable on the parent row only when grip is pressed
                      const row = rowRefs.current[originalIndex];
                      if (row) row.setAttribute("draggable", "true");
                    }}
                    onMouseUp={() => {
                      // If drag never started, revert
                      setTimeout(() => {
                        const row = rowRefs.current[originalIndex];
                        if (row && dragIndexRef.current === null) {
                          row.setAttribute("draggable", "false");
                        }
                      }, 100);
                    }}
                  >
                    <GripVertical size={16} className={isBeingDragged ? "text-purple-400" : "text-gray-500"} />
                  </div>

                  {/* Number badge */}
                  <div className="flex items-center pl-3 pr-1 select-none flex-shrink-0">
                    <span className="text-xs font-semibold text-purple-400 w-4 text-center">
                      {displayPos + 1}
                    </span>
                  </div>

                  {/* MapPin + input */}
                  <div className="flex items-center flex-1 px-2 py-2">
                    <MapPin size={15} className="text-gray-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Checkpoint"
                      value={cp.name ?? ""}
                      onChange={(e) => onChange(formIndex, originalIndex, e.target.value)}
                      className="bg-transparent outline-none text-gray-300 w-full text-sm"
                      // Prevent drag from firing when typing
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemove(formIndex, originalIndex)}
                    className="px-3 flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex-shrink-0"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={() => onAdd(formIndex)}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
        >
          <span className="bg-purple-600 hover:bg-purple-500 text-white rounded-full p-1 transition-colors">
            <Plus size={14} />
          </span>
          Add Checkpoint
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
    if (initialTransportData && initialTransportData.length > 0) return initialTransportData.map(sanitiseForm);
    return [createEmptyForm()];
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [carAvailability, setCarAvailability] = useState({});

  const formsRef = useRef(forms);
  const onChangeRef = useRef(onTransportDataChange);

  useEffect(() => { formsRef.current = forms; }, [forms]);
  useEffect(() => { onChangeRef.current = onTransportDataChange; }, [onTransportDataChange]);
  useEffect(() => { if (onChangeRef.current) onChangeRef.current(forms); }, [forms]);

  const checkCarAvailability = useCallback(async (formIndex, pickupDate, dropDate) => {
    if (!pickupDate || !dropDate) return;
    setCarAvailability((prev) => ({ ...prev, [formIndex]: { checking: true, available: true } }));
    try {
      const response = await fetch(
        `${BASE_URL}/api/vehicles/availability?type=Car&pickupDateTime=${pickupDate.toISOString()}&dropDateTime=${dropDate.toISOString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setCarAvailability((prev) => ({ ...prev, [formIndex]: { checking: false, available: data.available !== false } }));
    } catch {
      setCarAvailability((prev) => ({ ...prev, [formIndex]: { checking: false, available: true } }));
    }
  }, []);

  const handleChange = (index, field, value) => {
    setForms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value ?? "" };
      if (field === "pickupDate" || field === "dropDate") {
        const pickup = field === "pickupDate" ? value : updated[index].pickupDate;
        const drop = field === "dropDate" ? value : updated[index].dropDate;
        if (pickup && drop) checkCarAvailability(index, pickup, drop);
      }
      return updated;
    });
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const updated = [...prev];
      updated[index] = { ...(updated[index] || {}), [field]: "" };
      return updated;
    });
  };

  const handleVehicleToggle = (formIndex, option) => {
    setForms((prev) => {
      const updated = [...prev];
      const current = updated[formIndex].vistaTransport || [];
      const exists = current.includes(option);
      const newTransport = exists ? current.filter((v) => v !== option) : [...current, option];
      const newVehicleCounts = { ...updated[formIndex].vehicleCounts };
      if (exists) delete newVehicleCounts[option];
      updated[formIndex] = { ...updated[formIndex], vistaTransport: newTransport, vehicleCounts: newVehicleCounts };
      return updated;
    });
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const updated = [...prev];
      updated[formIndex] = { ...(updated[formIndex] || {}), vistaTransport: "" };
      return updated;
    });
  };

  const handleVehicleCountChange = (formIndex, vehicleType, value) => {
    setForms((prev) => {
      const updated = [...prev];
      updated[formIndex] = { ...updated[formIndex], vehicleCounts: { ...updated[formIndex].vehicleCounts, [vehicleType]: value } };
      return updated;
    });
  };

  const handleStaffCountChange = (formIndex, value) => {
    const sanitised = value === "" ? "" : String(Math.max(0, parseInt(value) || 0));
    setForms((prev) => {
      const updated = [...prev];
      const existing = updated[formIndex].staffMembers || [];
      updated[formIndex] = { ...updated[formIndex], staffCount: sanitised, staffMembers: buildStaffMembers(existing, sanitised) };
      return updated;
    });
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const updated = [...prev];
      updated[formIndex] = { ...(updated[formIndex] || {}), staffCount: "" };
      return updated;
    });
  };

  const handleStaffMemberChange = (formIndex, staffIndex, field, value) => {
    setForms((prev) => {
      const updated = [...prev];
      const members = [...(updated[formIndex].staffMembers || [])];
      members[staffIndex] = { ...members[staffIndex], [field]: value ?? "" };
      updated[formIndex] = { ...updated[formIndex], staffMembers: members };
      return updated;
    });
  };

  const handleAddForm = () => setForms((prev) => [...prev, createEmptyForm()]);
  const removeForm = (index) => setForms((prev) => prev.filter((_, i) => i !== index));

  const addCheckpoint = (formIndex) => {
    setForms((prev) => {
      const updated = [...prev];
      updated[formIndex] = { ...updated[formIndex], checkpoints: [...(updated[formIndex].checkpoints || []), { name: "" }] };
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

  const handleCheckpointReorder = useCallback((formIndex, from, to) => {
    setForms((prev) => {
      const updated = [...prev];
      const checkpoints = [...(updated[formIndex].checkpoints || [])];
      const [dragged] = checkpoints.splice(from, 1);
      checkpoints.splice(to, 0, dragged);
      updated[formIndex] = { ...updated[formIndex], checkpoints };
      return updated;
    });
  }, []);

  const handleNext = useCallback(async () => {
    const latest = formsRef.current;
    const errs = validateTransport(latest);
    const hasErrors = !Array.isArray(errs) ? Object.keys(errs).length > 0 : errs.some((e) => Object.keys(e).length > 0);
    if (hasErrors) { setErrors(errs); return; }
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
            checkpoints: (form.checkpoints || []).filter((cp) => cp.name?.trim()).map((cp) => ({ location: cp.name })),
            dropLocation: form.dropLocation || "",
            totalPassengers: Number(form.totalPassengers) || 0,
            vehicles: (form.vistaTransport || []).map((type) => ({ type, count: Number(form.vehicleCounts?.[type]) || 0 })),
            accompanyingStaff: (form.staffMembers || []).map((s) => ({ name: s.name || "", mobile: Number(s.mobile) || 0 })),
            specialRequirements: form.specialRequirements || "",
          })),
        },
      };
      console.log("transport payload data :", payload);
      const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  const handleBack = useCallback(() => { if (prevStep) prevStep(); }, [prevStep]);

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

  const getVehicleOptions = (formIndex) => {
    const avail = carAvailability[formIndex];
    const carsAvailable = !avail || avail.checking || avail.available;
    return ["Bus", "Van", carsAvailable ? "Car" : "Outsource car"];
  };

  return (
    <div className="w-full">
      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button onClick={handleAddForm}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add
        </button>
      </div>

      {forms.map((form, formIndex) => {
        const vehicleOptions = getVehicleOptions(formIndex);
        const avail = carAvailability[formIndex];
        const CARD_BG = "bg-[#1f1f3a]";
        const STAFF_BG = "bg-[#282846]";

        return (
          <div key={formIndex} className="relative bg-[#1f1f3a] p-6 rounded-xl w-full mb-6">
            {formIndex !== 0 && (
              <button onClick={() => removeForm(formIndex)}
                className="absolute top-3 right-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-full transition-colors z-10">
                <Trash2 size={16} />
              </button>
            )}

            {/* Row 1: Pickup & Drop Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <CustomDateTimePicker label="Pickup date & Time *" value={form.pickupDate}
                  onChange={(date) => handleChange(formIndex, "pickupDate", date)} placeholder="__/__/____  --:-- --" />
                {getError(formIndex, "pickupDate") && <p className="text-red-400 text-xs mt-1">{getError(formIndex, "pickupDate")}</p>}
              </div>
              <div>
                <CustomDateTimePicker label="Drop date & Time *" value={form.dropDate}
                  onChange={(date) => handleChange(formIndex, "dropDate", date)} placeholder="__/__/____  --:-- --" />
                {getError(formIndex, "dropDate") && <p className="text-red-400 text-xs mt-1">{getError(formIndex, "dropDate")}</p>}
              </div>
            </div>

            {/* Row 2: Pickup Location */}
            <div className="mb-4">
              <label className="text-sm text-gray-300 block mb-1">Pickup Location *</label>
              <div className="flex items-center bg-[#2a2a4a] px-4 py-2 rounded-lg border border-gray-600">
                <MapPin size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <input type="text" placeholder="Pickup location" value={form.pickupLocation}
                  onChange={(e) => handleChange(formIndex, "pickupLocation", e.target.value)}
                  className="bg-transparent outline-none text-gray-300 w-full" />
              </div>
              {getError(formIndex, "pickupLocation") && <p className="text-red-400 text-xs mt-1">{getError(formIndex, "pickupLocation")}</p>}
            </div>

            {/* Row 3: Checkpoints with live-reorder drag-and-drop */}
            <CheckpointList
              checkpoints={form.checkpoints || []}
              formIndex={formIndex}
              onReorder={handleCheckpointReorder}
              onChange={handleCheckpointChange}
              onRemove={removeCheckpoint}
              onAdd={addCheckpoint}
            />

            {/* Row 4: Drop Location */}
            <div className="mb-6">
              <label className="text-sm text-gray-300 block mb-1">Drop Location *</label>
              <div className="flex items-center bg-[#2a2a4a] px-4 py-2 rounded-lg border border-gray-600">
                <MapPin size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <input type="text" placeholder="Drop location" value={form.dropLocation}
                  onChange={(e) => handleChange(formIndex, "dropLocation", e.target.value)}
                  className="bg-transparent outline-none text-gray-300 w-full" />
              </div>
              {getError(formIndex, "dropLocation") && <p className="text-red-400 text-xs mt-1">{getError(formIndex, "dropLocation")}</p>}
            </div>

            {/* Row 5: Total Passengers + Vehicle Multi-Select */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <FloatingInput label="Total Number of Passengers *" type="number" value={form.totalPassengers}
                  onChange={(e) => handleChange(formIndex, "totalPassengers", e.target.value)} bgClass={CARD_BG} />
                {getError(formIndex, "totalPassengers") && <p className="text-red-400 text-xs mt-1">{getError(formIndex, "totalPassengers")}</p>}
              </div>
              <div>
                {avail?.checking && <p className="text-xs text-purple-400 mb-1">Checking car availability...</p>}
                {!avail?.checking && avail?.available === false && <p className="text-xs text-yellow-400 mb-1">No cars available — showing Outsource car</p>}
                <VehicleMultiSelect label="Types of Vehicles Needed *" options={vehicleOptions}
                  selected={form.vistaTransport} onToggle={(opt) => handleVehicleToggle(formIndex, opt)} />
                {getError(formIndex, "vistaTransport") && <p className="text-red-400 text-xs mt-1">{getError(formIndex, "vistaTransport")}</p>}
              </div>
            </div>

            {/* Row 5b: Vehicle count inputs */}
            {(form.vistaTransport || []).length > 0 && (
              <VehicleCountInputs selectedVehicles={form.vistaTransport} vehicleCounts={form.vehicleCounts}
                onChange={(type, val) => handleVehicleCountChange(formIndex, type, val)} cardBg={CARD_BG} />
            )}

            {/* Row 6: Accompanying Staff count — number input */}
            <div className="mb-4">
              <FloatingInput label="Number of Accompanying Staff *" type="number" value={form.staffCount}
                onChange={(e) => handleStaffCountChange(formIndex, e.target.value)} bgClass={CARD_BG} />
              {getError(formIndex, "staffCount") && <p className="text-red-400 text-xs mt-1">{getError(formIndex, "staffCount")}</p>}
            </div>

            {/* Row 7: Staff member cards */}
            {(form.staffMembers || []).length > 0 && (
              <div className="space-y-3 mb-4">
                {form.staffMembers.map((staff, si) => (
                  <div key={si} className="rounded-xl p-4" style={{ backgroundColor: "#282846" }}>
                    <p className="text-xs text-purple-400 font-medium mb-3">Staff {si + 1}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingInput label="Accompanying Staff Name" value={staff.name}
                        onChange={(e) => handleStaffMemberChange(formIndex, si, "name", e.target.value)} bgClass={STAFF_BG} />
                      <FloatingInput label="Accompanying Staff Mobile Number" type="number" value={staff.mobile}
                        onChange={(e) => handleStaffMemberChange(formIndex, si, "mobile", e.target.value)} bgClass={STAFF_BG} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Row 8: Special Requirements */}
            <div className="relative mt-4 mb-2">
              <textarea value={form.specialRequirements}
                onChange={(e) => handleChange(formIndex, "specialRequirements", e.target.value)}
                className="w-full p-4 rounded-lg border border-gray-700 text-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-200 bg-transparent"
                rows={4} placeholder=" " />
              <label className="absolute -top-2 left-3 text-xs text-white bg-[#1f1f3a] px-1">
                Special Requirements, If any
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}