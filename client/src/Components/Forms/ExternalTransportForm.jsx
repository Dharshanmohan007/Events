import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, GripVertical, Check, ChevronDown, Search, AlertTriangle } from "lucide-react";
import CustomDatePicker from "../CustomDatePicker";
import CustomSelect from "../CustomSelect";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createEmptyForm() {
  return {
    id: crypto.randomUUID(),
    travelOption: "",
    travelDate: "",
    from: "",
    to: "",
    totalPassengers: "",
    classOrBerth: [], // array for train, string for flight
    trainNumber: "",
    flightNumber: "",
    specialRequirements: "None",
    passengers: [],
  };
}

function createEmptyPassenger() {
  return {
    id: crypto.randomUUID(),
    name: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    designation: "",
    organization: "",
  };
}

const TRAIN_CLASSES = [
  "AC First Class (1A)",
  "AC 2-Tier (2A)",
  "AC 3-Tier (3A)",
  "AC 3-Tier Economy (3E)",
  "Sleeper Class (SL)",
  "Second Sitting (2S)",
  "Unreserved General Class (UR / GS)",
  "AC Chair Car (CC)",
  "Executive Chair Car (EC)",
  "Ladies Compartment",
  "Vistadome",
];

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
  bgClass = "bg-[#1e1e2f]",
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
  bgClass = "bg-[#1e1e2f]",
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
        <div className="absolute z-50 mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
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


// ─── Main Component ──────────────────────────────────────────────────────────

export default function ExternalTransportForm({
  disabled = false,
  nextStep,
  registerChildNavigation,
  initialValues = [],
  errors: initialErrors = [],
  onDataChange,
  eventId,
}) {
  const [forms, setForms] = useState(() => {
    if (Array.isArray(initialValues) && initialValues.length > 0) {
      return initialValues.map(v => {
        let dateStr = "";
        if (v.travelDate) {
          const d = new Date(v.travelDate);
          if (!isNaN(d.getTime())) {
            dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          }
        }
        return {
          id: v.id || crypto.randomUUID(),
          travelOption: v.travelOption || "",
          travelDate: dateStr,
          from: v.from || "",
          to: v.to || "",
          totalPassengers: v.totalPassengers || "",
          classOrBerth: v.classOrBerth || (v.travelOption === "Train" ? [] : ""),
          trainNumber: v.trainNumber || "",
          flightNumber: v.flightNumber || "",
          specialRequirements: v.specialRequirements || "None",
          passengers: Array.isArray(v.passengers) ? v.passengers.map(p => ({ ...p, id: p.id || crypto.randomUUID() })) : [],
        };
      });
    }
    return [createEmptyForm()];
  });
  
  const [errors, setErrors] = useState(() => Array.isArray(initialErrors) ? initialErrors : []);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navRef = useRef({ next: null, prev: null });

  // Expose current data to Form.jsx
  useEffect(() => {
    if (onDataChange) {
      onDataChange(forms);
    }
  }, [forms, onDataChange]);

  const buildPayload = useCallback(() => ({
    externalTransports: forms.map((item) => ({
      travelOption: item.travelOption || "",
      travelDate: item.travelDate ? new Date(item.travelDate).toISOString() : "",
      from: item.from || "",
      to: item.to || "",
      totalPassengers: parseInt(item.totalPassengers) || 0,
      classOrBerth: Array.isArray(item.classOrBerth) ? item.classOrBerth : item.classOrBerth || "",
      trainNumber: item.trainNumber || "",
      flightNumber: item.flightNumber || "",
      specialRequirements: item.specialRequirements || "None",
      passengers: (item.passengers || []).map((p) => ({
        name: p.name || "",
        phone: p.phone || "",
        email: p.email || "",
        age: parseInt(p.age) || 0,
        gender: p.gender || "",
        designation: p.designation || "",
        organization: p.organization || "",
      })),
    })),
  }), [forms]);

  const validateAll = useCallback(() => {
    const newErrors = [];
    let isValid = true;

    forms.forEach((form, index) => {
      const err = {};
      if (!form.travelOption) err.travelOption = "Travel Option is required";
      if (!form.travelDate) err.travelDate = "Travel Date is required";
      if (!form.from?.trim()) err.from = "From location is required";
      if (!form.to?.trim()) err.to = "To location is required";
      
      const pax = parseInt(form.totalPassengers);
      if (!form.totalPassengers) {
        err.totalPassengers = "Total passengers is required";
      } else if (isNaN(pax) || pax < 1 || pax > 10) {
        err.totalPassengers = "Maximum passenger count is 10.";
      }

      if (form.travelOption === "Train") {
        if (!form.trainNumber?.trim()) err.trainNumber = "Train number is required";
        if (!Array.isArray(form.classOrBerth) || form.classOrBerth.length === 0) err.classOrBerth = "Select at least one train class";
      } else if (form.travelOption === "Flight") {
        if (!form.flightNumber?.trim()) err.flightNumber = "Flight number is required";
      }

      err.passengers = [];
      form.passengers.forEach((p, pIndex) => {
        const pErr = {};
        if (!p.name?.trim()) pErr.name = "Name is required";
        
        if (!p.phone?.trim()) pErr.phone = "Phone number is required";
        else if (!/^\d{10}$/.test(p.phone)) pErr.phone = "Phone number must contain exactly 10 digits.";
        
        if (!p.email?.trim()) pErr.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) pErr.email = "Please enter a valid email address.";
        
        if (!p.designation?.trim()) pErr.designation = "Designation is required";
        if (!p.gender) pErr.gender = "Gender is required";
        
        const age = parseInt(p.age);
        if (!p.age) pErr.age = "Age is required";
        else if (isNaN(age) || age < 1 || age > 100) pErr.age = "Age must be between 1 and 100.";
        
        if (!p.organization?.trim()) pErr.organization = "Organization is required";
        
        if (Object.keys(pErr).length > 0) {
          err.passengers[pIndex] = pErr;
        }
      });
      
      if (Object.keys(err).length > 0 && !(Object.keys(err).length === 1 && err.passengers && err.passengers.length === 0)) {
        newErrors[index] = err;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [forms]);

  const handleNext = useCallback(async () => {
    if (!validateAll()) return false;
    if (!eventId) {
      setApiError("Event must be created before saving external transport details.");
      return false;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const payload = buildPayload();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (nextStep) nextStep();
      return true;
    } catch (error) {
      setApiError(error.message || "Failed to save external transport details. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [buildPayload, eventId, nextStep, validateAll]);

  navRef.current.next = handleNext;
  navRef.current.prev = null;

  useEffect(() => {
    if (!registerChildNavigation) return;
    const stableNext = (...args) => navRef.current.next(...args);
    const stablePrev = (...args) => navRef.current.prev?.(...args);

    registerChildNavigation({ 
      next: async () => {
        if (navRef.current.next) return await navRef.current.next();
        return false;
      }, 
      prev: async () => {
        if (navRef.current.prev) return await navRef.current.prev();
        return false;
      },
      isLoading,
    });

    return () => registerChildNavigation({ next: null, prev: null, isLoading: false });
  }, [registerChildNavigation, isLoading]);

  const addForm = () => {
    setForms((prev) => [...prev, createEmptyForm()]);
  };

  const removeForm = (index) => {
    setForms((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []);
  };

  const handleChange = (index, field, value) => {
    let isValidPax = true;
    let paxErrorMsg = "";
    
    setForms((prev) => {
      const updated = [...prev];
      let val = value;
      
      if (field === "travelOption") {
        const oldVal = updated[index].travelOption;
        if (oldVal !== val) {
          updated[index].trainNumber = "";
          updated[index].flightNumber = "";
          updated[index].classOrBerth = val === "Flight" ? "Economy" : [];
        }
      } else if (field === "from" || field === "to") {
        val = val.replace(/[^a-zA-Z\s]/g, ""); // Only characters and spaces
      } else if (field === "totalPassengers") {
        val = val.replace(/[^0-9]/g, "");
        if (val.length > 2) val = val.slice(0, 2);
        
        const num = parseInt(val);
        if (!isNaN(num) && num > 0 && num <= 10) {
          const newPax = [...updated[index].passengers];
          while (newPax.length < num) newPax.push(createEmptyPassenger());
          if (newPax.length > num) newPax.splice(num);
          updated[index].passengers = newPax;
        } else if (val === "") {
           updated[index].passengers = [];
        } else {
           isValidPax = false;
           paxErrorMsg = "Maximum passenger count is 10.";
        }
      } else if (field === "trainNumber") {
        val = val.replace(/[^0-9]/g, "");
      }
      
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });

    setErrors((prev) => {
      const err = Array.isArray(prev) ? [...prev] : [];
      if (!err[index]) err[index] = {};
      else err[index] = { ...err[index] };
      
      if (field === "totalPassengers") {
        err[index].totalPassengers = isValidPax ? "" : paxErrorMsg;
      } else {
        err[index][field] = "";
      }
      return err;
    });
  };
  

  const handlePassengerChange = (formIndex, paxIndex, field, value) => {
    setForms((prev) => {
      const updated = [...prev];
      const pax = [...updated[formIndex].passengers];
      let val = value;

      if (field === "name" || field === "designation" || field === "organization") {
        // No numbers
        val = val.replace(/[0-9]/g, "");
      } else if (field === "phone") {
        val = val.replace(/[^0-9]/g, "").slice(0, 10);
      } else if (field === "age") {
        val = val.replace(/[^0-9]/g, "").slice(0, 3);
      }

      pax[paxIndex] = { ...pax[paxIndex], [field]: val };
      updated[formIndex] = { ...updated[formIndex], passengers: pax };
      return updated;
    });
    
    setErrors((prev) => {
      const err = Array.isArray(prev) ? [...prev] : [];
      if (err[formIndex] && err[formIndex].passengers && err[formIndex].passengers[paxIndex]) {
        const newPaxErr = [...err[formIndex].passengers];
        newPaxErr[paxIndex] = { ...newPaxErr[paxIndex], [field]: "" };
        err[formIndex] = { ...err[formIndex], passengers: newPaxErr };
      }
      return err;
    });
  };

  const getError = (idx, field) => (errors[idx] ? errors[idx][field] : "");
  const getPaxError = (idx, paxIdx, field) => {
    if (!errors[idx] || !errors[idx].passengers || !errors[idx].passengers[paxIdx]) return "";
    return errors[idx].passengers[paxIdx][field] || "";
  };
  
  const todayDateStr = (() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  })();

  return (
    <div className={`w-full ${disabled ? "opacity-50 pointer-events-none select-none" : ""}`}>
      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}
      
      {!disabled && (
        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={addForm}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#9810FA] cursor-pointer border border-[#3A3A5A] text-white rounded-xl transition-colors font-medium text-sm"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      )}

      {forms.map((form, index) => (
        <div 
          key={form.id} 
          className="rounded-2xl mb-8 relative"
          style={{ backgroundColor: "#1e1e2f", border: "1px solid #3A3A5A" }}
        >
          {index > 0 && (
            <button
              type="button"
              onClick={() => setDeleteIndex(index)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-400 transition-colors bg-[#1E1E2F] rounded-full p-1 border border-[#3A3A5A]"
              title="Remove Entry"
            >
              <Trash2 size={18} />
            </button>
          )}
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={!form.travelOption ? "md:col-span-2" : ""}>
                <CustomSelectDropdown
                  label="Travel Option *"
                  value={form.travelOption}
                  options={["Train", "Flight"]}
                  onChange={(val) => handleChange(index, "travelOption", val)}
                  bgClass="bg-[#1e1e2f]"
                />
                {getError(index, "travelOption") && <p className="text-red-400 text-xs mt-1">{getError(index, "travelOption")}</p>}
              </div>
              
              {(form.travelOption === "Train" || form.travelOption === "Flight") && (
                <div className="relative">
                   <div className="absolute -top-2 left-3 z-10 px-1 text-xs text-white" style={{ backgroundColor: "#1e1e2f" }}>Travel Date *</div>
                   <div className="pt-2">
                     <CustomDatePicker
                       value={form.travelDate}
                       onChange={(val) => handleChange(index, "travelDate", val)}
                       placeholder="Select Travel Date"
                       minDate={todayDateStr}
                       className="w-full bg-transparent border-[#3A3A5A] !h-[47px] !px-4 !py-[13px] !text-sm rounded-lg text-white"
                     />
                   </div>
                   {getError(index, "travelDate") && <p className="text-red-400 text-xs mt-1">{getError(index, "travelDate")}</p>}
                </div>
              )}
            </div>
            
            {(form.travelOption === "Train" || form.travelOption === "Flight") && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FloatingInput
                      label="From *"
                      value={form.from}
                      onChange={(e) => handleChange(index, "from", e.target.value)}
                      bgClass="bg-[#1e1e2f]"
                    />
                    {getError(index, "from") && <p className="text-red-400 text-xs mt-1">{getError(index, "from")}</p>}
                  </div>
                  <div>
                    <FloatingInput
                      label="To *"
                      value={form.to}
                      onChange={(e) => handleChange(index, "to", e.target.value)}
                      bgClass="bg-[#1e1e2f]"
                    />
                    {getError(index, "to") && <p className="text-red-400 text-xs mt-1">{getError(index, "to")}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {form.travelOption === "Train" && (
                    <>
                      <div>
                        <FloatingInput
                          label="Train Number *"
                          value={form.trainNumber}
                          onChange={(e) => handleChange(index, "trainNumber", e.target.value)}
                          bgClass="bg-[#1e1e2f]"
                        />
                        {getError(index, "trainNumber") && <p className="text-red-400 text-xs mt-1">{getError(index, "trainNumber")}</p>}
                      </div>
                      <div>
                        <CustomSelect
                          label="Select Train Class *"
                          multi
                          searchable
                          value={Array.isArray(form.classOrBerth) ? form.classOrBerth : []}
                          onChange={(val) => handleChange(index, "classOrBerth", val)}
                          options={TRAIN_CLASSES}
                          labelBg="#1e1e2f"
                          placeholder="Select classes"
                        />
                        {getError(index, "classOrBerth") && <p className="text-red-400 text-xs mt-1">{getError(index, "classOrBerth")}</p>}
                      </div>
                    </>
                  )}
                  {form.travelOption === "Flight" && (
                    <>
                      <div>
                        <FloatingInput
                          label="Flight Number *"
                          value={form.flightNumber}
                          onChange={(e) => handleChange(index, "flightNumber", e.target.value)}
                          bgClass="bg-[#1e1e2f]"
                        />
                        {getError(index, "flightNumber") && <p className="text-red-400 text-xs mt-1">{getError(index, "flightNumber")}</p>}
                      </div>
                      <div>
                         <CustomSelectDropdown
                          label="Select Flight Class *"
                          value={form.classOrBerth}
                          options={["Economy"]}
                          onChange={() => {}}
                          bgClass="bg-[#1e1e2f]"
                        />
                        {getError(index, "classOrBerth") && <p className="text-red-400 text-xs mt-1">{getError(index, "classOrBerth")}</p>}
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                    <FloatingInput
                      label="No. of Passengers *"
                      value={form.totalPassengers}
                      onChange={(e) => handleChange(index, "totalPassengers", e.target.value)}
                      bgClass="bg-[#1e1e2f]"
                    />
                    {getError(index, "totalPassengers") && <p className="text-red-400 text-xs mt-1">{getError(index, "totalPassengers")}</p>}
                  </div>
                </div>

                {form.passengers.length > 0 && (
                   <div 
                     className="mt-6 rounded-xl p-5"
                     style={{
                       backgroundColor: "#2a2a4a",
                       border: "1px solid #3A3A5A",
                     }}
                   >
                     <h4 className="text-white font-medium mb-4">Passenger Details</h4>
                     <div className="space-y-4">
                       {form.passengers.map((p, pIndex) => (
                         <div 
                           key={p.id} 
                           className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg"
                           style={{
                             backgroundColor: "#1e1e2f",
                             border: "1px solid #3A3A5A",
                           }}
                         >
                            <h5 className="text-sm font-medium text-white md:col-span-2">Passenger {pIndex + 1}</h5>
                            <div>
                              <FloatingInput label="Name *" value={p.name} onChange={(e) => handlePassengerChange(index, pIndex, "name", e.target.value)} bgClass="bg-[#1e1e2f]" />
                              {getPaxError(index, pIndex, "name") && <p className="text-red-400 text-xs mt-1">{getPaxError(index, pIndex, "name")}</p>}
                            </div>
                            <div>
                              <FloatingInput label="Phone Number *" value={p.phone} onChange={(e) => handlePassengerChange(index, pIndex, "phone", e.target.value)} bgClass="bg-[#1e1e2f]" />
                              {getPaxError(index, pIndex, "phone") && <p className="text-red-400 text-xs mt-1">{getPaxError(index, pIndex, "phone")}</p>}
                            </div>
                            <div>
                              <FloatingInput label="Email *" value={p.email} onChange={(e) => handlePassengerChange(index, pIndex, "email", e.target.value)} bgClass="bg-[#1e1e2f]" />
                              {getPaxError(index, pIndex, "email") && <p className="text-red-400 text-xs mt-1">{getPaxError(index, pIndex, "email")}</p>}
                            </div>
                            <div>
                              <FloatingInput label="Designation *" value={p.designation} onChange={(e) => handlePassengerChange(index, pIndex, "designation", e.target.value)} bgClass="bg-[#1e1e2f]" />
                              {getPaxError(index, pIndex, "designation") && <p className="text-red-400 text-xs mt-1">{getPaxError(index, pIndex, "designation")}</p>}
                            </div>
                            <div>
                              <CustomSelectDropdown label="Gender *" value={p.gender} options={["Male", "Female"]} onChange={(v) => handlePassengerChange(index, pIndex, "gender", v)} bgClass="bg-[#1e1e2f]" />
                              {getPaxError(index, pIndex, "gender") && <p className="text-red-400 text-xs mt-1">{getPaxError(index, pIndex, "gender")}</p>}
                            </div>
                            <div>
                              <FloatingInput label="Age *" value={p.age} onChange={(e) => handlePassengerChange(index, pIndex, "age", e.target.value)} bgClass="bg-[#1e1e2f]" />
                              {getPaxError(index, pIndex, "age") && <p className="text-red-400 text-xs mt-1">{getPaxError(index, pIndex, "age")}</p>}
                            </div>
                            <div className="md:col-span-2">
                              <FloatingInput label="Organization *" value={p.organization} onChange={(e) => handlePassengerChange(index, pIndex, "organization", e.target.value)} bgClass="bg-[#1e1e2f]" />
                              {getPaxError(index, pIndex, "organization") && <p className="text-red-400 text-xs mt-1">{getPaxError(index, pIndex, "organization")}</p>}
                            </div>
                         </div>
                       ))}
                     </div>
                   </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
      
      <ConfirmDeleteModal
        isOpen={deleteIndex !== null}
        message="Are you sure you want to delete this transport entry?"
        onConfirm={() => {
          removeForm(deleteIndex);
          setDeleteIndex(null);
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </div>
  );
}

