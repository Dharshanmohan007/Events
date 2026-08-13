import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  GripVertical,
  X,
  Check,
  ChevronDown,
  AlertTriangle,
  Search,
} from "lucide-react";
import CustomDateTimePicker from "../CustomDateTimePicker";

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
      f.vehicleCounts && typeof f.vehicleCounts === "object"
        ? f.vehicleCounts
        : {},
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
    
    if (form.pickupDate && form.dropDate && form.pickupDate.getTime() === form.dropDate.getTime()) {
      err.dropDate = "Pickup and drop date and time are same";
    }

    if (!form.pickupLocation?.trim())
      err.pickupLocation = "Pickup location is required";
    if (!form.dropLocation?.trim())
      err.dropLocation = "Drop location is required";
    if (!form.vistaTransport || form.vistaTransport.length === 0)
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

    if (form.staffMembers && form.staffMembers.length > 0) {
      form.staffMembers.forEach((staff, index) => {
        if (!staff.name || !staff.name.trim()) {
          err[`staffName_${index}`] = "Name is required";
        } else if (!/^[a-zA-Z\s]+$/.test(staff.name)) {
          err[`staffName_${index}`] = "Name must contain only characters";
        }

        if (!staff.mobile) {
          err[`staffMobile_${index}`] = "Mobile number is required";
        } else if (!/^\d{10}$/.test(staff.mobile)) {
          err[`staffMobile_${index}`] = "Mobile number must be exactly 10 digits";
        }
      });
    }

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

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({ isOpen, message, onConfirm, onCancel }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: "#1f1f3a", border: "1px solid #3A3A5A" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
        </div>
        <h3 className="text-center text-white font-semibold text-base mb-2">
          Confirm Delete
        </h3>
        <p className="text-center text-gray-400 text-sm mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors"
            style={{ backgroundColor: "#2a2a4a", border: "1px solid #3A3A5A" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Floating-label text input ────────────────────────────────────────────────
function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  bgClass = "bg-[#1f1f3a]",
  onKeyDown,
}) {
  return (
    <div className="relative w-full">
      <span
        className={`absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none ${bgClass}`}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder=" "
        className="w-full bg-transparent px-4 py-[13px] rounded-lg border border-[#3A3A5A] text-white text-sm outline-none focus:border-purple-500 transition-colors"
      />
    </div>
  );
}

// ─── Custom Select ────────────────────────────────────────────────────────────
function CustomSelectDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  bgClass = "bg-[#1f1f3a]",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <span
        className={`absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none ${bgClass}`}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between bg-transparent px-4 py-[13px] rounded-lg border text-left transition-colors ${
          open ? "border-purple-500" : "border-[#3A3A5A]"
        }`}
      >
        <span className={`text-sm ${value ? "text-white" : "text-gray-500"}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-purple-600/20 transition-colors text-left"
              >
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

// ─── Vehicle Multi-Select (venue-style UI with search) ────────────────────────
function VehicleMultiSelect({
  label,
  vehicleInventory,
  selected = [],
  onToggle,
  loading = false,
  onOpen,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = vehicleInventory.filter((v) =>
    v.vehicleType.toLowerCase().includes(search.toLowerCase()),
  );

  const displayText = selected.length === 0 ? null : selected.join(", ");

  return (
    <div ref={ref} className="relative w-full">
      {/* Floating label */}
      <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none bg-[#1f1f3a]">
        {label}
      </span>

      {/* Trigger button — mirrors venue dropdown style */}
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);

          if (next && onOpen) {
            onOpen();
          }
        }}
        className={`w-full flex items-center justify-between bg-transparent px-4 py-[13px] rounded-lg border text-left transition-colors ${
          open ? "border-purple-500" : "border-[#3A3A5A]"
        }`}
      >
        <span
          className={`text-sm truncate ${
            !displayText ? "text-gray-500" : "text-white"
          }`}
        >
          {displayText || "Select vehicle types"}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg shadow-xl overflow-hidden"
          style={{ backgroundColor: "#1E1E2F", border: "1px solid #3A3A5A" }}
        >
          {/* Search bar — same as venue dropdown */}
          <div
            className="flex items-center gap-2 px-3 py-2 mx-2 my-2 rounded-md"
            style={{ backgroundColor: "#2a2a4a", border: "1px solid #3A3A5A" }}
          >
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vehicles..."
              className="bg-transparent outline-none text-sm text-white placeholder-gray-500 w-full"
            />
          </div>

          {/* List */}
          <div
            className="max-h-52 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#4a4a6a transparent",
            }}
          >
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                Loading vehicles...
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                No vehicles found
              </div>
            ) : (
              filtered.map((vehicle) => {
                const isSelected = selected.includes(vehicle.vehicleType);
                const avail = vehicle.availableCount;
                const availLabel =
                  avail === null ? "Outsource" : `Availability : ${avail}`;

                return (
                  <button
                    key={vehicle._id}
                    type="button"
                    onClick={() => onToggle(vehicle.vehicleType)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors text-left ${
                      isSelected
                        ? "bg-purple-600/40 text-white"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    {/* Vehicle name */}
                    <span className="font-medium">{vehicle.vehicleType}</span>

                    {/* Right side: availability label + checkmark */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm text-gray-400">
                        {availLabel}
                      </span>
                      {isSelected && (
                        <Check size={16} className="text-purple-400" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vehicle Count Inputs (with availability warning) ─────────────────────────
function VehicleCountInputs({
  selectedVehicles,
  vehicleCounts,
  onChange,
  cardBg,
  vehicleInventory,
}) {
  const rows = [];
  for (let i = 0; i < selectedVehicles.length; i += 2)
    rows.push(selectedVehicles.slice(i, i + 2));

  // Build a lookup: vehicleType → availableCount
  const availMap = {};
  vehicleInventory.forEach((v) => {
    availMap[v.vehicleType] = v.availableCount;
  });

  return (
    <div className="mb-4 space-y-4">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className={`grid gap-4 ${
            row.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {row.map((vehicleType) => {
            const enteredCount = parseInt(vehicleCounts?.[vehicleType]) || 0;
            const available = availMap[vehicleType]; // null = outsource, number = actual
            const showWarning =
              available !== null &&
              available !== undefined &&
              enteredCount > available &&
              enteredCount > 0;

            return (
              <div key={vehicleType}>
                <FloatingInput
                  label={`Number of ${vehicleType} Needed`}
                  type="number"
                  min={0}
                  value={vehicleCounts?.[vehicleType] ?? ""}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value));
                    onChange(vehicleType, value);
                  }}
                  bgClass={cardBg}
                />
                {showWarning && (
                  <p className="text-orange-400 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Only {available} {vehicleType}
                    {available === 1 ? "" : "s"} available
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Checkpoint List ──────────────────────────────────────────────────────────
function CheckpointList({
  checkpoints,
  formIndex,
  onReorder,
  onChange,
  onRemove,
  onAdd,
}) {
  const dragIndexRef = useRef(null);
  const overIndexRef = useRef(null);
  const rowRefs = useRef([]);
  const [dragOver, setDragOver] = useState(null);
  const [isDraggingIndex, setIsDraggingIndex] = useState(null);

  const handleDragStart = (e, cpIndex) => {
    dragIndexRef.current = cpIndex;
    overIndexRef.current = cpIndex;
    setIsDraggingIndex(cpIndex);
    setDragOver(cpIndex);
    const ghost = document.createElement("div");
    ghost.style.cssText =
      "position:fixed;top:-1000px;left:-1000px;width:1px;height:1px;";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    e.dataTransfer.effectAllowed = "move";
    requestAnimationFrame(() => document.body.removeChild(ghost));
  };

  const handleDragEnter = (e, cpIndex) => {
    e.preventDefault();
    if (dragIndexRef.current === null || dragIndexRef.current === cpIndex)
      return;
    overIndexRef.current = cpIndex;
    setDragOver(cpIndex);
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
    const row = rowRefs.current[cpIndex];
    if (row) row.setAttribute("draggable", "false");
    const from = dragIndexRef.current;
    const to = overIndexRef.current;
    dragIndexRef.current = null;
    overIndexRef.current = null;
    setIsDraggingIndex(null);
    setDragOver(null);
    if (from !== null && to !== null && from !== to) {
      onReorder(formIndex, from, to);
    }
  };

  return (
    <div className="mb-4">
      {checkpoints.length > 0 && (
        <div className="mb-3 space-y-2">
          {checkpoints.map((cp, cpIndex) => {
            const isBeingDragged = isDraggingIndex === cpIndex;
            const isDropTarget =
              dragOver === cpIndex &&
              isDraggingIndex !== null &&
              isDraggingIndex !== cpIndex;
            return (
              <div
                key={cpIndex}
                ref={(el) => (rowRefs.current[cpIndex] = el)}
                draggable="false"
                onDragStart={(e) => handleDragStart(e, cpIndex)}
                onDragEnter={(e) => handleDragEnter(e, cpIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, cpIndex)}
                onDragEnd={() => handleDragEnd(cpIndex)}
                style={{
                  opacity: isBeingDragged ? 0.35 : 1,
                  transition:
                    "opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                  willChange: "opacity",
                }}
              >
                <div
                  className="flex items-stretch rounded-lg border overflow-hidden"
                  style={{
                    minHeight: "46px",
                    backgroundColor: isDropTarget
                      ? "#32325a"
                      : isBeingDragged
                      ? "#2e2e50"
                      : "#2a2a4a",
                    borderColor: isDropTarget
                      ? "#a855f7"
                      : isBeingDragged
                      ? "#7c3aed"
                      : "#4b5563",
                    boxShadow: isDropTarget
                      ? "0 0 0 2px rgba(168,85,247,0.4)"
                      : isBeingDragged
                      ? "0 4px 20px rgba(124,58,237,0.3)"
                      : "none",
                    transition:
                      "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div
                    className="flex items-center justify-center border-r border-gray-600 bg-[#23234a] select-none flex-shrink-0"
                    style={{ minWidth: 36, cursor: "grab" }}
                    onMouseDown={() => {
                      const row = rowRefs.current[cpIndex];
                      if (row) row.setAttribute("draggable", "true");
                    }}
                    onMouseUp={() => {
                      setTimeout(() => {
                        const row = rowRefs.current[cpIndex];
                        if (row && dragIndexRef.current === null) {
                          row.setAttribute("draggable", "false");
                        }
                      }, 100);
                    }}
                  >
                    <GripVertical
                      size={16}
                      className={
                        isBeingDragged || isDropTarget
                          ? "text-purple-400"
                          : "text-gray-500"
                      }
                    />
                  </div>
                  <div className="flex items-center pl-3 pr-1 select-none flex-shrink-0">
                    <span className="text-xs font-semibold text-purple-400 w-4 text-center">
                      {cpIndex + 1}
                    </span>
                  </div>
                  <div className="flex items-center flex-1 px-2 py-2">
                    <MapPin
                      size={15}
                      className="text-gray-400 mr-2 flex-shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="Checkpoint"
                      value={cp.name ?? ""}
                      onChange={(e) =>
                        onChange(formIndex, cpIndex, e.target.value)
                      }
                      className="bg-transparent outline-none text-gray-300 w-full text-sm"
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <button
                    onClick={() => onRemove(formIndex, cpIndex)}
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
    if (initialTransportData && initialTransportData.length > 0)
      return initialTransportData.map(sanitiseForm);
    return [createEmptyForm()];
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [vehicleInventory, setVehicleInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);

  const formsRef = useRef(forms);
  const onChangeRef = useRef(onTransportDataChange);

  useEffect(() => {
    formsRef.current = forms;
  }, [forms]);
  useEffect(() => {
    onChangeRef.current = onTransportDataChange;
  }, [onTransportDataChange]);
  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current(forms);
  }, [forms]);
  function formatLocalDateTime(date) {
    const pad = (n) => String(n).padStart(2, "0");

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds()) +
      ".000Z"
    );
  }
  // ── Fetch vehicle inventory ───────────────────────────────────────────────
  const fetchVehicleInventory = useCallback(async (pickupDate, dropDate) => {
    if (!pickupDate || !dropDate) return;

    setInventoryLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/transport-inventory/available?pickupDateTime=${formatLocalDateTime(
          new Date(pickupDate),
        )}&dropDateTime=${formatLocalDateTime(new Date(dropDate))}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transport inventory");
      }

      const data = await response.json();

      setVehicleInventory(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Transport inventory fetch failed:", err);
      setVehicleInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  // useEffect(() => {
  //   fetchVehicleInventory();
  // }, [fetchVehicleInventory]);

  // ── Resolve vehicle options (Car → Outsource car when availableCount === 0) ─
  const getResolvedVehicleInventory = useCallback(() => {
    return vehicleInventory
      .filter((v) => v.isActive !== false)
      .map((v) => {
        if (v.vehicleType === "Car" && v.availableCount === 0) {
          return { ...v, vehicleType: "Outsource car", availableCount: null };
        }
        return v;
      });
  }, [vehicleInventory]);

  const handleChange = (index, field, value) => {
    setForms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value ?? "" };
      
      if (field === "totalPassengers") {
        const passengerCount = parseInt(value);
        if (!isNaN(passengerCount) && passengerCount <= 4) {
          const currentVehicles = updated[index].vistaTransport || [];
          const newVehicles = currentVehicles.filter(v => v.toLowerCase().includes("car"));
          updated[index].vistaTransport = newVehicles;
          
          const newCounts = { ...updated[index].vehicleCounts };
          Object.keys(newCounts).forEach(k => {
            if (!k.toLowerCase().includes("car")) {
              delete newCounts[k];
            }
          });
          updated[index].vehicleCounts = newCounts;
        }
      }

      return updated;
    });
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const updated = [...prev];
      updated[index] = { ...(updated[index] || {}), [field]: "" };
      return updated;
    });

    // Real-time check: if pickup and drop dates are the same, show error immediately
    if (field === "pickupDate" || field === "dropDate") {
      setForms((currentForms) => {
        const form = currentForms[index];
        const pickup = field === "pickupDate" ? value : form.pickupDate;
        const drop = field === "dropDate" ? value : form.dropDate;

        if (pickup && drop && pickup.getTime() === drop.getTime()) {
          setErrors((prev) => {
            const errArr = Array.isArray(prev) ? [...prev] : [];
            errArr[index] = { ...(errArr[index] || {}), dropDate: "Pickup and drop date and time are same" };
            return errArr;
          });
        } else {
          setErrors((prev) => {
            if (!Array.isArray(prev)) return prev;
            const errArr = [...prev];
            if (errArr[index]) {
              errArr[index] = { ...errArr[index], dropDate: "" };
            }
            return errArr;
          });
        }

        return currentForms; // don't modify forms
      });
    }
  };

  const handleVehicleToggle = (formIndex, vehicleType) => {
    setForms((prev) => {
      const updated = [...prev];
      const current = updated[formIndex].vistaTransport || [];
      const exists = current.includes(vehicleType);
      const newTransport = exists
        ? current.filter((v) => v !== vehicleType)
        : [...current, vehicleType];
      const newVehicleCounts = { ...updated[formIndex].vehicleCounts };
      if (exists) delete newVehicleCounts[vehicleType];
      updated[formIndex] = {
        ...updated[formIndex],
        vistaTransport: newTransport,
        vehicleCounts: newVehicleCounts,
      };
      return updated;
    });
    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const updated = [...prev];
      updated[formIndex] = {
        ...(updated[formIndex] || {}),
        vistaTransport: "",
      };
      return updated;
    });
  };

  const handleVehicleCountChange = (formIndex, vehicleType, value) => {
    setForms((prev) => {
      const updated = [...prev];
      updated[formIndex] = {
        ...updated[formIndex],
        vehicleCounts: {
          ...updated[formIndex].vehicleCounts,
          [vehicleType]: value,
        },
      };
      return updated;
    });
  };

  const handleStaffCountChange = (formIndex, value) => {
    const sanitised =
      value === "" ? "" : String(Math.max(0, parseInt(value) || 0));
    setForms((prev) => {
      const updated = [...prev];
      const existing = updated[formIndex].staffMembers || [];
      updated[formIndex] = {
        ...updated[formIndex],
        staffCount: sanitised,
        staffMembers: buildStaffMembers(existing, sanitised),
      };
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
    if (field === "name") {
      if (value && !/^[a-zA-Z\s]*$/.test(value)) return;
    } else if (field === "mobile") {
      if (value && !/^\d*$/.test(value)) return;
      if (value && value.length > 10) return;
    }

    setForms((prev) => {
      const updated = [...prev];
      const members = [...(updated[formIndex].staffMembers || [])];
      members[staffIndex] = { ...members[staffIndex], [field]: value ?? "" };
      updated[formIndex] = { ...updated[formIndex], staffMembers: members };
      return updated;
    });

    setErrors((prev) => {
      if (!Array.isArray(prev)) return prev;
      const updated = [...prev];
      const errKey = field === "name" ? `staffName_${staffIndex}` : `staffMobile_${staffIndex}`;
      updated[formIndex] = { ...(updated[formIndex] || {}), [errKey]: "" };
      return updated;
    });
  };

  const handleAddForm = () => setForms((prev) => [...prev, createEmptyForm()]);

  const requestRemoveTransport = (formIndex) => {
    setPendingDelete({ type: "transport", formIndex });
  };
  const requestRemoveStaffMember = (formIndex, staffIndex) => {
    setPendingDelete({ type: "staff", formIndex, staffIndex });
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "transport") {
      const { formIndex } = pendingDelete;
      setForms((prev) => prev.filter((_, i) => i !== formIndex));
    } else if (pendingDelete.type === "staff") {
      const { formIndex, staffIndex } = pendingDelete;
      setForms((prev) => {
        const updated = [...prev];
        const members = [...(updated[formIndex].staffMembers || [])];
        members.splice(staffIndex, 1);
        updated[formIndex] = {
          ...updated[formIndex],
          staffMembers: members,
          staffCount: String(members.length),
        };
        return updated;
      });
    }
    setPendingDelete(null);
  };

  const handleCancelDelete = () => setPendingDelete(null);

  const getModalMessage = () => {
    if (!pendingDelete) return "";
    if (pendingDelete.type === "transport")
      return "Are you sure you want to delete this transport entry? This action cannot be undone.";
    return "Are you sure you want to delete this staff member? This action cannot be undone.";
  };

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
            dropDateTime: form.dropDate ? form.dropDate.toISOString() : "",
            pickupLocation: form.pickupLocation || "",
            checkpoints: (form.checkpoints || [])
              .filter((cp) => cp.name?.trim())
              .map((cp) => ({ location: cp.name })),
            dropLocation: form.dropLocation || "",
            totalPassengers: Number(form.totalPassengers) || 0,
            vehicles: (form.vistaTransport || []).map((type) => ({
              type,
              count: Number(form.vehicleCounts?.[type]) || 0,
            })),
            accompanyingStaff: (form.staffMembers || []).map((s) => ({
              name: s.name || "",
              mobile: Number(s.mobile) || 0,
            })),
            specialRequirements: form.specialRequirements || "",
          })),
        },
      };
      // console.log("transport payload data :", payload);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || `Server error: ${response.status}`);
      nextStep();
    } catch (err) {
      setApiError(
        err.message || "Failed to save transport details. Please try again.",
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
    registerChildNavigation({
      next: stableNext,
      prev: stablePrev,
      isLoading: false,
    });
    return () =>
      registerChildNavigation({ next: null, prev: null, isLoading: false });
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

  return (
    <div className="w-full">
      <ConfirmDeleteModal
        isOpen={!!pendingDelete}
        message={getModalMessage()}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddForm}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {forms.map((form, formIndex) => {
        const CARD_BG = "bg-[#1f1f3a]";
        const STAFF_BG = "bg-[#282846]";
        let resolvedInventory = getResolvedVehicleInventory();

        const passengerCount = parseInt(form.totalPassengers);
        if (!isNaN(passengerCount) && passengerCount <= 4) {
          resolvedInventory = resolvedInventory.filter(
            (v) => v.vehicleType.toLowerCase().includes("car")
          );
        }

        return (
          <div
            key={formIndex}
            className="relative bg-[#1f1f3a] rounded-xl w-full mb-6 overflow-hidden"
          >
            {formIndex !== 0 && (
              <div className="flex items-center justify-end px-6 pt-5 pb-3 border-b border-[#2e2e50]">
                <button
                  onClick={() => requestRemoveTransport(formIndex)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  title="Remove transport"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            <div className="p-6">
              {/* Row 1: Pickup & Drop Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <CustomDateTimePicker
                    label="Pickup date & Time *"
                    value={form.pickupDate}
                    minDate={new Date()}
                    onChange={(date) =>
                      handleChange(formIndex, "pickupDate", date)
                    }
                    placeholder="__/__/____  --:-- --"
                  />
                  {getError(formIndex, "pickupDate") && (
                    <p className="text-red-400 text-xs mt-1">
                      {getError(formIndex, "pickupDate")}
                    </p>
                  )}
                </div>
                <div>
                  <CustomDateTimePicker
                    label="Drop date & Time *"
                    value={form.dropDate}
                    minDate={form.pickupDate}
                    onChange={(date) =>
                      handleChange(formIndex, "dropDate", date)
                    }
                    placeholder="__/__/____  --:-- --"
                  />
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
                  <MapPin
                    size={18}
                    className="text-gray-400 mr-2 flex-shrink-0"
                  />
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
                <label className="text-sm text-gray-300 block mb-1">
                  Drop Location *
                </label>
                <div className="flex items-center bg-[#2a2a4a] px-4 py-2 rounded-lg border border-gray-600">
                  <MapPin
                    size={18}
                    className="text-gray-400 mr-2 flex-shrink-0"
                  />
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
                  <FloatingInput
                    label="Total Number of Passengers *"
                    type="number"
                    value={form.totalPassengers}
                    onChange={(e) =>
                      handleChange(formIndex, "totalPassengers", e.target.value)
                    }
                    bgClass={CARD_BG}
                  />
                  {getError(formIndex, "totalPassengers") && (
                    <p className="text-red-400 text-xs mt-1">
                      {getError(formIndex, "totalPassengers")}
                    </p>
                  )}
                </div>
                <div>
                  <VehicleMultiSelect
                    label="Type of Vehicles Needed *"
                    vehicleInventory={resolvedInventory}
                    selected={form.vistaTransport}
                    onToggle={(vehicleType) =>
                      handleVehicleToggle(formIndex, vehicleType)
                    }
                    loading={inventoryLoading}
                    onOpen={() =>
                      fetchVehicleInventory(form.pickupDate, form.dropDate)
                    }
                  />
                  {getError(formIndex, "vistaTransport") && (
                    <p className="text-red-400 text-xs mt-1">
                      {getError(formIndex, "vistaTransport")}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 5b: Vehicle count inputs with availability warning */}
              {(form.vistaTransport || []).length > 0 && (
                <VehicleCountInputs
                  selectedVehicles={form.vistaTransport}
                  vehicleCounts={form.vehicleCounts}
                  onChange={(type, val) =>
                    handleVehicleCountChange(formIndex, type, val)
                  }
                  cardBg={CARD_BG}
                  vehicleInventory={resolvedInventory}
                />
              )}

              {/* Row 6: Accompanying Staff count */}
              <div className="mb-4">
                <FloatingInput
                  label="Number of Accompanying Staff *"
                  type="number"
                  value={form.staffCount}
                  onChange={(e) =>
                    handleStaffCountChange(formIndex, e.target.value)
                  }
                  bgClass={CARD_BG}
                />
                {getError(formIndex, "staffCount") && (
                  <p className="text-red-400 text-xs mt-1">
                    {getError(formIndex, "staffCount")}
                  </p>
                )}
              </div>

              {/* Row 7: Staff member cards */}
              {(form.staffMembers || []).length > 0 && (
                <div className="space-y-3 mb-4">
                  {form.staffMembers.map((staff, si) => (
                    <div
                      key={si}
                      className="relative rounded-xl p-4"
                      style={{ backgroundColor: "#282846" }}
                    >
                      <button
                        type="button"
                        onClick={() => requestRemoveStaffMember(formIndex, si)}
                        className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
                        title="Remove staff member"
                      >
                        <Trash2 size={14} />
                      </button>
                      <p className="text-xs text-purple-400 font-medium mb-3">
                        Staff {si + 1}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FloatingInput
                            label="Accompanying Staff Name"
                            value={staff.name}
                            onChange={(e) =>
                              handleStaffMemberChange(
                                formIndex,
                                si,
                                "name",
                                e.target.value,
                              )
                            }
                            bgClass={STAFF_BG}
                          />
                          {getError(formIndex, `staffName_${si}`) && (
                            <p className="text-red-400 text-xs mt-1">
                              {getError(formIndex, `staffName_${si}`)}
                            </p>
                          )}
                        </div>
                        <div>
                          <FloatingInput
                            label="Accompanying Staff Mobile Number"
                            type="text"
                            value={staff.mobile}
                            onChange={(e) =>
                              handleStaffMemberChange(
                                formIndex,
                                si,
                                "mobile",
                                e.target.value,
                              )
                            }
                            bgClass={STAFF_BG}
                          />
                          {getError(formIndex, `staffMobile_${si}`) && (
                            <p className="text-red-400 text-xs mt-1">
                              {getError(formIndex, `staffMobile_${si}`)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Row 8: Special Requirements */}
              <div className="relative mt-4 mb-2">
                <textarea
                  value={form.specialRequirements}
                  onChange={(e) =>
                    handleChange(
                      formIndex,
                      "specialRequirements",
                      e.target.value,
                    )
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
          </div>
        );
      })}
    </div>
  );
}
