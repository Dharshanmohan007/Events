import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Phone, Plus, Trash2, Check, Search, ChevronDown } from "lucide-react";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";
import CustomDateTimePicker from "../CustomDateTimePicker"; // your custom date-time picker


// ─── Room config ───────────────────────────────────────────────────────────────
const BASE_ROOM_OPTIONS = [
  "Suite Room",
  "Boys Hostel",
  "Girls Hostel",
];
const PLACEMENT_EXTRA_ROOM = "Suite Room 4";
const SINGLE_CAPACITY_ROOMS = [];
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

function flattenGuests(eventDays = []) {
  const seen = new Set();
  const result = [];
  eventDays.forEach((day, dayIdx) => {
    (day.guests || []).forEach((g, gIdx) => {
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

function emptyAccommodation() {
  return {
    checkIn: null,
    checkOut: null,
    selectedGuestIds: [],
    accommodationNeeded: "",
    roomTypes: [],
    roomCounts: {},
    dine: "",
    dineTypes: [],
    hostelGuests: "",
    amenityGuests: "",
    special: "",
  };
}

function validateAccommodation(acc) {
  const e = {};

  // Check In / Out
  if (!acc.checkIn) e.checkIn = "Check-in date & time is required";
  if (!acc.checkOut) e.checkOut = "Check-out date & time is required";

  // Guest Selection
  if (!acc.selectedGuestIds || acc.selectedGuestIds.length === 0) {
    e.selectedGuestIds = "Select at least one guest";
  }

  // Accommodation Needed
  if (!acc.accommodationNeeded) {
    e.accommodationNeeded = "Please select Yes or No";
  }

  if (acc.accommodationNeeded === "Yes") {
    // Room Types
    if (!acc.roomTypes || acc.roomTypes.length === 0) {
      e.roomTypes = "Select at least one room type";
    }

    // Room Counts
    (acc.roomTypes || []).forEach((roomType) => {
      const count = parseInt(acc.roomCounts?.[roomType]);
      if (!count || count <= 0) {
        if (!e.roomCounts) e.roomCounts = {};
        e.roomCounts[roomType] = `Enter number of ${roomType} rooms`;
      }
    });
  }

  // Dine In Required
  if (!acc.dine) {
    e.dine = "Please select Yes or No";
  }

  // Dine In Validations
  if (acc.dine === "Yes") {
    if (!acc.dineTypes || acc.dineTypes.length === 0) {
      e.dineTypes = "Select at least one dine-in option";
    }

    if (
      acc.dineTypes.includes("Hostel") &&
      (!acc.hostelGuests || parseInt(acc.hostelGuests) <= 0)
    ) {
      e.hostelGuests = "Enter number of hostel dine-in guests";
    }

    if (
      acc.dineTypes.includes("Amenity") &&
      (!acc.amenityGuests || parseInt(acc.amenityGuests) <= 0)
    ) {
      e.amenityGuests = "Enter number of amenity dine-in guests";
    }
  }

  return e;
}

function buildPayload(accommodations, allGuests) {
  return {
    accommodationDetails: {
      accommodations: accommodations.map((acc) => {
        const selectedGuests = allGuests.filter((g) =>
          acc.selectedGuestIds.includes(g.guestId)
        );

        const roomOccupancy = [];

        const roomCategory = acc.accommodationNeeded === "Yes" ? (acc.roomTypes || []).map((rt) => ({
          type: rt,
          count: parseInt(acc.roomCounts?.[rt]) || 0,
        })) : [];

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

// ─── Delete Confirmation Popup ─────────────────────────────────────────────────
function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-[#1f1f38] border border-[#3a3a5a] rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <Trash2 size={22} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base mb-1">
              Delete Accommodation
            </h3>
            <p className="text-gray-400 text-sm">
              Are you sure you want to delete this accommodation block? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#3a3a5a] text-gray-300 text-sm font-medium hover:bg-[#2a2a4a] hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-medium transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Checkbox ──────────────────────────────────────────────────────────
function PurpleCheckbox({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      className="cursor-pointer flex-shrink-0"
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        border: checked ? "none" : "2px solid #ab45ff",
        backgroundColor: checked ? "#ab45ff" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s ease",
      }}
    >
      {checked && <Check size={13} color="#fff" strokeWidth={3} />}
    </div>
  );
}

// ─── Gender Icon — human profile silhouette (filled violet) ──────────────────
function GenderIcon({ gender }) {
  const g = (gender || "").toLowerCase();

  if (g === "female") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ab45ff" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="6" r="3.5" />
        <path d="M7 21c0-3.5 1.5-7 5-8.5C16.5 14 17 17.5 17 21H7z" />
        <path d="M9.5 12.5 Q12 10.5 14.5 12.5" fill="none" stroke="#ab45ff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ab45ff" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="6" r="3.5" />
      <path d="M8 13h8c.5 0 1 .4 1 1v7H7v-7c0-.6.4-1 1-1z" />
    </svg>
  );
}

// ─── Phone Icon filled violet ─────────────────────────────────────────────────
function PhoneIconFilled() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ab45ff" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
    </svg>
  );
}

// ─── Room Type MultiSelect — search, tick on right, violet bg selected, slash-joined display ─
function RoomMultiSelect({ label, options, value = [], onChange, error, labelBg = "#1f1f38" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };

  // ── Display text: join selected options with " / " ──
  const displayText =
    value.length === 0
      ? "Select..."
      : value.join(" / ");

  return (
    <div className="relative w-full" ref={ref}>
      {/* Trigger */}
      <div
        className={`relative w-full p-3 rounded-lg bg-transparent border ${
          error ? "border-red-400" : open ? "border-purple-500" : "border-[#3a3a5a]"
        } text-white cursor-pointer flex items-center justify-between transition`}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`text-sm truncate ${value.length === 0 ? "text-gray-500" : "text-white"}`}
          title={value.length > 0 ? value.join(" / ") : undefined}
        >
          {displayText}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      <label
        className="absolute left-3 -top-2 text-xs text-gray-300 px-1 pointer-events-none z-10"
        style={{ backgroundColor: labelBg }}
      >
        {label}
      </label>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#3a3a5a] bg-[#1f1f38] shadow-xl overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#3a3a5a]">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search..."
              className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-500"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-500">No results</div>
          ) : (
            filtered.map((opt) => {
              const selected = value.includes(opt);
              return (
                <div
                  key={opt}
                  onClick={() => toggle(opt)}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                    selected
                      ? "bg-purple-700/30 text-white"
                      : "text-gray-300 hover:bg-[#2a2a4a] hover:text-white"
                  }`}
                >
                  <span>{opt}</span>
                  {selected && (
                    <Check size={14} className="text-purple-400 flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Dine MultiSelect — tick on RIGHT, violet bg for selected, NO checkbox ─────
function MultiSelect({ label, options, value = [], onChange, error, labelBg = "#1f1f38" }) {
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
          error ? "border-red-400" : open ? "border-purple-500" : "border-[#3a3a5a]"
        } text-white cursor-pointer flex items-center justify-between transition`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`text-sm truncate ${value.length === 0 ? "text-gray-500" : "text-white"}`}>
          {value.length === 0 ? "Select..." : value.join(", ")}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      <label
        className="absolute left-3 -top-2 text-xs text-gray-300 px-1 pointer-events-none z-10"
        style={{ backgroundColor: labelBg }}
      >
        {label}
      </label>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#3a3a5a] bg-[#1f1f38] shadow-xl overflow-hidden">
          {options.map((opt) => {
            const selected = value.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                  selected
                    ? "bg-purple-700/30 text-white"
                    : "text-gray-300 hover:bg-[#2a2a4a] hover:text-white"
                }`}
              >
                <span>{opt}</span>
                {/* Tick on the RIGHT — spacing reserved always to prevent layout shift */}
                <span className="flex-shrink-0 w-4 flex items-center justify-center">
                  {selected && (
                    <Check size={14} className="text-purple-400" />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Removed single/double rooms logic

  const showAmenity = acc.dineTypes.includes("Amenity");
  const showHostel = acc.dineTypes.includes("Hostel");

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirm={() => {
            setShowDeleteModal(false);
            onRemove();
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <div className="bg-[#1f1f38] border border-[#3a3a5a] p-5 rounded-xl mb-4 relative">
        {/* Block header */}
        <div className="flex items-center justify-end mb-5">
          {canRemove && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 p-3 rounded-full transition"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        {/* Check In / Out — using CustomDateTimePicker */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full">
            <CustomDateTimePicker
              label="Check In Date & Time *"
              value={acc.checkIn}
              minDate={new Date()}
              onChange={(date) => onChange({ ...acc, checkIn: date })}
              placeholder="__/__/____  --:-- --"
            />
            {errors.checkIn && (
              <p className="text-red-400 text-xs mt-1">{errors.checkIn}</p>
            )}
          </div>
          <div className="w-full">
            <CustomDateTimePicker
              label="Check Out Date & Time *"
              value={acc.checkOut}
              minDate={acc.checkIn}
              onChange={(date) => onChange({ ...acc, checkOut: date })}
              placeholder="__/__/____  --:-- --"
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
            Selected Guest : {selectedCount}{" "}
            <span className="text-purple-400">/ {totalGuests}</span>
          </p>
        </div>
        <div className="mb-6">
          {totalGuests === 0 ? (
            <p className="text-gray-500 text-xs py-2 px-1">
              No guests found. Please add guests in the Event Requisition step.
            </p>
          ) : (
            allGuests.map((g) => {
              const checked = acc.selectedGuestIds.includes(g.guestId);
              return (
                <div
                  key={g.guestId}
                  className="flex justify-between items-center gap-4 bg-[#2a2a4a] border border-[#3a3a5a] p-3 rounded-lg mb-2 cursor-pointer"
                  onClick={() => toggleGuest(g.guestId)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PurpleCheckbox
                      checked={checked}
                      onChange={() => toggleGuest(g.guestId)}
                    />
                    <span className="text-sm text-white truncate">{g.name}</span>
                  </div>
                  <div className="flex gap-6 text-xs text-gray-400 items-center flex-shrink-0">
                    <span className="flex items-center gap-1.5">
                      <GenderIcon gender={g.gender} />
                      <span className="text-gray-300">{g.gender || "—"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <PhoneIconFilled />
                      <span className="text-gray-300">{g.mobile || "—"}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {errors.selectedGuestIds && (
          <p className="text-red-400 text-xs mt-1">
            {errors.selectedGuestIds}
          </p>
        )}

        {/* Accommodation Needed */}
        <div className="mb-4">
          <CustomSelect
            label="Accommodation room needed? *"
            value={acc.accommodationNeeded}
            onChange={(val) =>
              onChange({
                ...acc,
                accommodationNeeded: val,
                roomTypes: val === "No" ? [] : acc.roomTypes,
                roomCounts: val === "No" ? {} : acc.roomCounts,
              })
            }
            options={["Yes", "No"]}
            labelBg="#1f1f38"
          />
          {errors.accommodationNeeded && (
            <p className="text-red-400 text-xs mt-1">{errors.accommodationNeeded}</p>
          )}
        </div>

        {/* Room type multi-select — slash-joined display, search, tick on right */}
        {acc.accommodationNeeded === "Yes" && (
          <div className="mb-4">
            <RoomMultiSelect
              label="Type of Room Wanted *"
              options={roomOptions}
              value={acc.roomTypes}
              onChange={handleRoomTypeChange}
              error={errors.roomTypes}
              labelBg="#1f1f38"
            />
          </div>
        )}

        {/* Dynamic room count inputs per selected room type */}
        {acc.accommodationNeeded === "Yes" && acc.roomTypes.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {acc.roomTypes.map((roomType, i) => {
              const isLastOdd = acc.roomTypes.length % 2 !== 0 && i === acc.roomTypes.length - 1;
              return (
                <div key={roomType} className={isLastOdd ? "md:col-span-2" : ""}>
                  <CustomInput
                    label={`No. of ${roomType} Rooms *`}
                    value={acc.roomCounts?.[roomType] || ""}
                    onChange={(e) => handleRoomCount(roomType, e.target.value)}
                    type="number"
                    labelBg="#1f1f38"
                  />
                  {errors.roomCounts?.[roomType] && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.roomCounts[roomType]}
                    </p>
                  )}
                  {SINGLE_CAPACITY_ROOMS.includes(roomType) && (
                    <p className="text-yellow-400 text-xs mt-1">
                      Only 1 room available for {roomType}
                    </p>
                  )}
                </div>
              );
            })}
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
          {errors.dine && (
            <p className="text-red-400 text-xs mt-1">{errors.dine}</p>
          )}
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
              {errors.dineTypes && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.dineTypes}
                </p>
              )}
            </div>

            <div
              className={`grid gap-4 mb-4 ${
                showHostel && showAmenity ? "md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {showHostel && (
                <div>
                  <CustomInput
                    label="No. of Guests in Hostel Dine-in *"
                    value={acc.hostelGuests}
                    onChange={(e) => onChange({ ...acc, hostelGuests: e.target.value })}
                    type="number"
                    labelBg="#1f1f38"
                  />
                  {errors.hostelGuests && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.hostelGuests}
                    </p>
                  )}
                </div>
              )}
              {showAmenity && (
                <div>
                  <CustomInput
                    label="No. of Guests in Amenity Dine-in *"
                    value={acc.amenityGuests}
                    onChange={(e) => onChange({ ...acc, amenityGuests: e.target.value })}
                    type="number"
                    labelBg="#1f1f38"
                  />
                  {errors.amenityGuests && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.amenityGuests}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Special Requirements — always shown */}
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
      </div>
    </>
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

  const accommodationsRef = useRef(accommodations);
  useEffect(() => { accommodationsRef.current = accommodations; }, [accommodations]);

  const allGuestsRef = useRef(allGuests);
  useEffect(() => { allGuestsRef.current = allGuests; }, [allGuests]);

  const onChangeRef = useRef(onAccommodationDataChange);
  useEffect(() => { onChangeRef.current = onAccommodationDataChange; }, [onAccommodationDataChange]);

  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current({ accommodations });
  }, [accommodations]);

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
      // console.log("Accommodation payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
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
          canRemove={index > 0}
        />
      ))}
    </div>
  );
}