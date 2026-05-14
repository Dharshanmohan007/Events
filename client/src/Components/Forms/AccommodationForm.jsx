import React, {
  useState,
  forwardRef,
  useRef,
  useEffect,
  useCallback,
} from "react";
import DatePicker from "react-datepicker";
import { CalendarDays, Clock, User, Phone, Plus, Trash2 } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";

const BASE_URL = "https://sece-events.onrender.com";

// ─── Room config ───────────────────────────────────────────────────────────────
const BASE_ROOM_OPTIONS = [
  "Suite Room 2",
  "Suite Room 3",
  "Main Block III Floor",
  "Main Block II Floor",
  "D - Block",
  "C - Block",
];
const PLACEMENT_EXTRA_ROOM = "Suite Room 4";
const SINGLE_CAPACITY_ROOMS = ["Main Block III Floor", "Main Block II Floor"];
const DINE_OPTIONS = ["Amenity", "Hostel"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function isPlacementLogin() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return (
      payload?.department?.toLowerCase() === "placement" ||
      payload?.dept?.toLowerCase() === "placement" ||
      payload?.role?.toLowerCase() === "placement"
    );
  } catch {
    return false;
  }
}

function buildRoomOptions() {
  const opts = [...BASE_ROOM_OPTIONS];
  if (isPlacementLogin()) {
    opts.splice(2, 0, PLACEMENT_EXTRA_ROOM);
  }
  return opts;
}

// ─── Flatten guests from eventDays ────────────────────────────────────────────
// eventDays shape: [{ date, startTime, endTime, numGuests,
//   guests: [{ name, designation, organization, mobile, gender }] }]
// We generate a local-only guestId for checkbox tracking — it is NEVER sent to backend.
function flattenGuests(eventDays = []) {
  const seen = new Set();
  const result = [];
  eventDays.forEach((day, dayIdx) => {
    (day.guests || []).forEach((g, gIdx) => {
      // Local key only — used for checkbox state, never in the API payload
      const guestId = `day${dayIdx}_g${gIdx}_${(g.name || "")
        .replace(/\s+/g, "")
        .toLowerCase()}`;
      if (!seen.has(guestId)) {
        seen.add(guestId);
        result.push({ ...g, guestId });
      }
    });
  });
  return result;
}

// ─── Empty accommodation block ─────────────────────────────────────────────────
function emptyAccommodation() {
  return {
    checkIn: null,
    checkOut: null,
    selectedGuestIds: [],   // local tracking only
    roomTypes: [],
    roomCounts: {},
    singleRooms: "",
    doubleRooms: "",
    dine: "",
    dineTypes: [],
    hostelGuests: "",
    amenityGuests: "",
    special: "",
  };
}

// ─── Validator ─────────────────────────────────────────────────────────────────
function validateAccommodation(acc) {
  const e = {};
  if (!acc.checkIn) e.checkIn = "Check-in date & time is required";
  if (!acc.checkOut) e.checkOut = "Check-out date & time is required";
  if (!acc.roomTypes || acc.roomTypes.length === 0)
    e.roomTypes = "Select at least one room type";
  return e;
}

// ─── Build backend payload ─────────────────────────────────────────────────────
// NOTE: guestId is intentionally excluded — backend only expects name/mobile/gender.
// The guestId we generate is a local UI key, not a MongoDB ObjectId.
function buildPayload(accommodations, allGuests) {
  return {
    accommodationDetails: {
      accommodations: accommodations.map((acc) => {
        // Resolve selected guests from the flat list
        const selectedGuests = allGuests.filter((g) =>
          acc.selectedGuestIds.includes(g.guestId)
        );

        // roomOccupancy — single / double counts
        const roomOccupancy = [];
        if (parseInt(acc.singleRooms) > 0)
          roomOccupancy.push({ type: "Single", count: parseInt(acc.singleRooms) });
        if (parseInt(acc.doubleRooms) > 0)
          roomOccupancy.push({ type: "Double", count: parseInt(acc.doubleRooms) });

        // roomCategory — from multi-selected room types
        const roomCategory = (acc.roomTypes || []).map((rt) => ({
          type: rt,
          count: parseInt(acc.roomCounts?.[rt]) || 0,
        }));

        // dineInCounts
        const dineInCounts = [];
        if (acc.dine === "Yes") {
          if (acc.dineTypes.includes("Hostel") && parseInt(acc.hostelGuests) > 0)
            dineInCounts.push({ type: "Hostel", count: parseInt(acc.hostelGuests) });
          if (acc.dineTypes.includes("Amenity") && parseInt(acc.amenityGuests) > 0)
            dineInCounts.push({ type: "Amenity", count: parseInt(acc.amenityGuests) });
        }

        return {
          checkInDateTime: acc.checkIn ? acc.checkIn.toISOString() : "",
          checkOutDateTime: acc.checkOut ? acc.checkOut.toISOString() : "",
          // ✅ Only send name/mobile/gender — NO guestId (not a real ObjectId)
          guests: selectedGuests.map((g) => ({
            name: g.name || "",
            mobile: parseInt(g.mobile) || 0,
            gender: g.gender || "",
          })),
          roomOccupancy,
          roomCategory,
          dineInRequired: acc.dine === "Yes",
          dineInCounts,
          specialRequirements: acc.special || "",
        };
      }),
    },
  };
}

// ─── DateInput ─────────────────────────────────────────────────────────────────
const DateInput = forwardRef(({ value, onClick, label }, ref) => (
  <div className="relative w-full">
    <input
      ref={ref}
      value={value || ""}
      onClick={onClick}
      readOnly
      className="w-full p-3 rounded-lg bg-transparent border border-[#3a3a5a] text-white cursor-pointer focus:border-[#ab45ff] outline-none transition"
    />
    <label className="absolute left-3 -top-2 text-xs text-gray-300 bg-[#1f1f38] px-1">
      {label}
    </label>
    <div className="absolute right-3 top-3 flex gap-2 text-gray-400">
      <CalendarDays size={14} />
      <Clock size={14} />
    </div>
  </div>
));
DateInput.displayName = "DateInput";

// ─── MultiSelect ───────────────────────────────────────────────────────────────
function MultiSelect({
  label,
  options,
  value = [],
  onChange,
  error,
  labelBg = "#1f1f38",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className={`relative w-full p-3 rounded-lg bg-transparent border ${
          error ? "border-red-400" : "border-[#3a3a5a]"
        } text-white cursor-pointer flex items-center justify-between transition`}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`text-sm truncate ${
            value.length === 0 ? "text-gray-500" : "text-white"
          }`}
        >
          {value.length === 0 ? "Select..." : value.join(", ")}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
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
      </div>
      <label
        className="absolute left-3 -top-2 text-xs text-gray-300 px-1 pointer-events-none z-10"
        style={{ backgroundColor: labelBg }}
      >
        {label}
      </label>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#3a3a5a] bg-[#1f1f38] shadow-xl overflow-hidden">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-[#2a2a4a] text-sm text-white"
            >
              <input
                type="checkbox"
                checked={value.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-[#ab45ff]"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Single Accommodation Block ────────────────────────────────────────────────
function AccommodationBlock({
  index,
  acc,
  onChange,
  onRemove,
  allGuests,
  errors = {},
  roomOptions,
  canRemove,
}) {
  const selectedCount = acc.selectedGuestIds.length;
  const totalGuests = allGuests.length;

  const toggleGuest = (guestId) => {
    const next = acc.selectedGuestIds.includes(guestId)
      ? acc.selectedGuestIds.filter((id) => id !== guestId)
      : [...acc.selectedGuestIds, guestId];
    onChange({ ...acc, selectedGuestIds: next });
  };

  const handleRoomTypeChange = (types) => {
    const nextCounts = { ...acc.roomCounts };
    Object.keys(nextCounts).forEach((k) => {
      if (!types.includes(k)) delete nextCounts[k];
    });
    onChange({ ...acc, roomTypes: types, roomCounts: nextCounts });
  };

  const handleRoomCount = (roomType, val) => {
    let parsed = parseInt(val) || 0;
    if (SINGLE_CAPACITY_ROOMS.includes(roomType) && parsed > 1) parsed = 1;
    onChange({
      ...acc,
      roomCounts: {
        ...acc.roomCounts,
        [roomType]: parsed > 0 ? String(parsed) : "",
      },
    });
  };

  const showAmenity = acc.dineTypes.includes("Amenity");
  const showHostel = acc.dineTypes.includes("Hostel");

  return (
    <div className="bg-[#1f1f38] border border-[#3a3a5a] p-5 rounded-xl mb-4 relative">
      {/* Block header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-purple-400 text-sm font-semibold tracking-wide">
          Accommodation {index + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 transition flex items-center gap-1 text-xs"
          >
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>

      {/* Check In / Out */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full">
          <DatePicker
            selected={acc.checkIn}
            onChange={(date) => onChange({ ...acc, checkIn: date })}
            showTimeSelect
            dateFormat="dd/MM/yyyy h:mm aa"
            customInput={<DateInput label="Check In Date & Time *" />}
            withPortal
          />
          {errors.checkIn && (
            <p className="text-red-400 text-xs mt-1">{errors.checkIn}</p>
          )}
        </div>
        <div className="w-full">
          <DatePicker
            selected={acc.checkOut}
            onChange={(date) => onChange({ ...acc, checkOut: date })}
            showTimeSelect
            dateFormat="dd/MM/yyyy h:mm aa"
            customInput={<DateInput label="Check Out Date & Time *" />}
            withPortal
          />
          {errors.checkOut && (
            <p className="text-red-400 text-xs mt-1">{errors.checkOut}</p>
          )}
        </div>
      </div>

      {/* Guest Selection */}
      <div className="flex justify-between mb-2">
        <p className="text-purple-400 text-sm">
          Select the Guest who needed Accommodation
        </p>
        <p className="text-xs text-gray-400">
          Selected Guest : {selectedCount} / {totalGuests}
        </p>
      </div>
      <div className="mb-6">
        {totalGuests === 0 ? (
          <p className="text-gray-500 text-xs py-2 px-1">
            No guests found. Please add guests in the Event Requisition step.
          </p>
        ) : (
          allGuests.map((g) => (
            <div
              key={g.guestId}
              className="flex justify-between items-center bg-[#2a2a4a] border border-[#3a3a5a] p-3 rounded-lg mb-2"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={acc.selectedGuestIds.includes(g.guestId)}
                  onChange={() => toggleGuest(g.guestId)}
                  className="accent-[#ab45ff]"
                />
                <span className="text-sm">{g.name}</span>
              </div>
              <div className="flex gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <User size={14} /> {g.gender || "—"}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {g.mobile || "—"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Single & Double counts */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <CustomInput
          label="No. of Single Rooms"
          value={acc.singleRooms}
          onChange={(e) => onChange({ ...acc, singleRooms: e.target.value })}
          type="number"
          labelBg="#1f1f38"
        />
        <CustomInput
          label="No. of Double Rooms"
          value={acc.doubleRooms}
          onChange={(e) => onChange({ ...acc, doubleRooms: e.target.value })}
          type="number"
          labelBg="#1f1f38"
        />
      </div>

      {/* Room type multi-select */}
      <div className="mb-4">
        <MultiSelect
          label="Type of Room Wanted *"
          options={roomOptions}
          value={acc.roomTypes}
          onChange={handleRoomTypeChange}
          error={errors.roomTypes}
          labelBg="#1f1f38"
        />
        {errors.roomTypes && (
          <p className="text-red-400 text-xs mt-1">{errors.roomTypes}</p>
        )}
      </div>

      {/* Dynamic room count inputs per selected room type */}
      {acc.roomTypes.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {acc.roomTypes.map((roomType) => (
            <div key={roomType}>
              <CustomInput
                label={`No. of ${roomType} Rooms *`}
                value={acc.roomCounts?.[roomType] || ""}
                onChange={(e) => handleRoomCount(roomType, e.target.value)}
                type="number"
                labelBg="#1f1f38"
              />
              {SINGLE_CAPACITY_ROOMS.includes(roomType) && (
                <p className="text-yellow-400 text-xs mt-1">
                  Only 1 room available for {roomType}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dine-in */}
      <div className="mb-4">
        <CustomSelect
          label="Do You want Dine-in Request for this Guest?"
          value={acc.dine}
          onChange={(val) =>
            onChange({
              ...acc,
              dine: val,
              dineTypes: [],
              hostelGuests: "",
              amenityGuests: "",
            })
          }
          options={["Yes", "No"]}
          labelBg="#1f1f38"
        />
      </div>

      {acc.dine === "Yes" && (
        <>
          <div className="mb-4">
            <MultiSelect
              label="Select the Dine-in Wanted *"
              options={DINE_OPTIONS}
              value={acc.dineTypes}
              onChange={(types) => onChange({ ...acc, dineTypes: types })}
              labelBg="#1f1f38"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {showHostel && (
              <CustomInput
                label="No. of Guests in Hostel Dine-in *"
                value={acc.hostelGuests}
                onChange={(e) =>
                  onChange({ ...acc, hostelGuests: e.target.value })
                }
                type="number"
                labelBg="#1f1f38"
              />
            )}
            {showAmenity && (
              <CustomInput
                label="No. of Guests in Amenity Dine-in *"
                value={acc.amenityGuests}
                onChange={(e) =>
                  onChange({ ...acc, amenityGuests: e.target.value })
                }
                type="number"
                labelBg="#1f1f38"
              />
            )}
          </div>

          <div className="relative mt-2">
            <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1f1f38] z-10 pointer-events-none">
              Special Requirements, If any
            </span>
            <textarea
              value={acc.special}
              onChange={(e) => onChange({ ...acc, special: e.target.value })}
              rows={4}
              className="w-full bg-transparent border border-[#3a3a5a] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AccommodationForm({
  nextStep,
  prevStep,
  registerChildNavigation,
  accommodationData: initialData,
  onAccommodationDataChange,
  eventId,
  eventDays: eventDaysProp,
  errors: propErrors = {},
}) {
  const roomOptions = buildRoomOptions();
  const allGuests = flattenGuests(eventDaysProp || []);

  const [accommodations, setAccommodations] = useState(() => {
    if (
      initialData?.accommodations &&
      Array.isArray(initialData.accommodations) &&
      initialData.accommodations.length > 0
    ) {
      return initialData.accommodations;
    }
    return [emptyAccommodation()];
  });

  const [blockErrors, setBlockErrors] = useState([{}]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const accommodationsRef = useRef(accommodations);
  useEffect(() => { accommodationsRef.current = accommodations; }, [accommodations]);

  const allGuestsRef = useRef(allGuests);
  useEffect(() => { allGuestsRef.current = allGuests; }, [allGuests]);

  const onChangeRef = useRef(onAccommodationDataChange);
  useEffect(() => { onChangeRef.current = onAccommodationDataChange; }, [onAccommodationDataChange]);

  // Sync to parent
  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current({ accommodations });
  }, [accommodations]);

  // ── Block CRUD ────────────────────────────────────────────────────────────────
  const updateBlock = (index, updated) => {
    setAccommodations((prev) => prev.map((a, i) => (i === index ? updated : a)));
    setBlockErrors((prev) => prev.map((e, i) => (i === index ? {} : e)));
  };

  const addBlock = () => {
    setAccommodations((prev) => [...prev, emptyAccommodation()]);
    setBlockErrors((prev) => [...prev, {}]);
  };

  const removeBlock = (index) => {
    setAccommodations((prev) => prev.filter((_, i) => i !== index));
    setBlockErrors((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Navigation ────────────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    const latest = accommodationsRef.current;
    const latestGuests = allGuestsRef.current;

    const allErrors = latest.map((acc) => validateAccommodation(acc));
    setBlockErrors(allErrors);
    if (allErrors.some((e) => Object.keys(e).length > 0)) return;

    setIsLoading(true);
    setApiError("");
    try {
      const payload = buildPayload(latest, latestGuests);

      // Debug: log payload to console so you can inspect what's being sent
      console.log("Accommodation payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the actual backend validation message so you know exactly which field fails
        const msg = data?.message || data?.error || JSON.stringify(data);
        throw new Error(msg || `Server error: ${response.status}`);
      }

      nextStep();
    } catch (err) {
      setApiError(
        err.message || "Failed to save accommodation details. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [eventId, nextStep]);

  const handleBack = useCallback(() => {
    if (prevStep) prevStep();
  }, [prevStep]);

  const navRef = useRef({ next: handleNext, prev: handleBack });
  useEffect(() => { navRef.current = { next: handleNext, prev: handleBack }; });

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

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="text-white w-full">
      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      {/* Add button — top right */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={addBlock}
          className="flex items-center gap-2 text-sm text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition rounded-lg px-4 py-2 font-medium"
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {accommodations.map((acc, index) => (
        <AccommodationBlock
          key={index}
          index={index}
          acc={acc}
          onChange={(updated) => updateBlock(index, updated)}
          onRemove={() => removeBlock(index)}
          allGuests={allGuests}
          errors={blockErrors[index] || {}}
          roomOptions={roomOptions}
          canRemove={accommodations.length > 1}
        />
      ))}
    </div>
  );
}