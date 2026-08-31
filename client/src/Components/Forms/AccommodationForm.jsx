import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Phone, Plus, Trash2, Check, Search, ChevronDown, AlertTriangle, LoaderCircle, Building2 } from "lucide-react";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";
import CustomDateTimePicker from "../CustomDateTimePicker"; // your custom date-time picker
import { fetchAvailableRooms } from "../../api/accommodationApi";


// ─── Room config ───────────────────────────────────────────────────────────────
const DINE_OPTIONS = ["Amenity", "Hostel"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
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

function formatAccommodationDateTime(date) {
  if (!date) return "";
  const value = new Date(date);
  const pad = (part) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:00.000Z`;
}

function emptyAccommodation() {
  return {
    checkIn: null,
    checkOut: null,
    selectedGuestIds: [],
    accommodationNeeded: "",
    roomSelections: [],
    dine: "",
    dineTypes: [],
    hostelGuests: "",
    amenityGuests: "",
    special: "",
  };
}

function getPastCheckInTimeError(checkIn) {
  if (!checkIn) return "";

  const now = new Date();
  const isToday =
    checkIn.getFullYear() === now.getFullYear() &&
    checkIn.getMonth() === now.getMonth() &&
    checkIn.getDate() === now.getDate();

  if (!isToday || checkIn.getTime() >= now.getTime()) return "";

  const currentTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Current time is ${currentTime}, so you cannot choose a past time for today.`;
}

function validateAccommodation(acc) {
  const e = {};

  // Check In / Out
  if (!acc.checkIn) e.checkIn = "Check-in date & time is required";
  if (!acc.checkOut) e.checkOut = "Check-out date & time is required";
  const pastCheckInTimeError = getPastCheckInTimeError(acc.checkIn);
  if (pastCheckInTimeError) e.checkIn = pastCheckInTimeError;

  // Guest Selection
  if (!acc.selectedGuestIds || acc.selectedGuestIds.length === 0) {
    e.selectedGuestIds = "Select at least one guest";
  }

  // Accommodation Needed
  if (!acc.accommodationNeeded) {
    e.accommodationNeeded = "Please select Yes or No";
  }

  if (acc.accommodationNeeded === "Yes") {
    if (!acc.roomSelections || acc.roomSelections.length === 0) e.roomSelections = "Select at least one room";
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

    const totalSelected = acc.selectedGuestIds ? acc.selectedGuestIds.length : 0;
    const hostelCount = parseInt(acc.hostelGuests) || 0;
    const amenityCount = parseInt(acc.amenityGuests) || 0;

    // Validate individual counts
    if (acc.dineTypes.includes("Hostel")) {
      if (!acc.hostelGuests || hostelCount <= 0) {
        e.hostelGuests = "Enter number of hostel dine-in guests";
      } else if (hostelCount > totalSelected) {
        e.hostelGuests = `Hostel dine-in guests (${hostelCount}) cannot exceed selected guests (${totalSelected})`;
      }
    }

    if (acc.dineTypes.includes("Amenity")) {
      if (!acc.amenityGuests || amenityCount <= 0) {
        e.amenityGuests = "Enter number of amenity dine-in guests";
      } else if (amenityCount > totalSelected) {
        e.amenityGuests = `Amenity dine-in guests (${amenityCount}) cannot exceed selected guests (${totalSelected})`;
      }
    }

    // Combined validation
    if (totalSelected === 1 && acc.dineTypes.length > 1) {
      e.dineTypes = "Guest was 1 cannot choose two places for dine-in";
    } else if (hostelCount + amenityCount > totalSelected) {
      e.dineTypes = `Total dine-in guests (${hostelCount + amenityCount}) cannot exceed selected guests (${totalSelected})`;
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

        const roomSelections = acc.accommodationNeeded === "Yes" ? (acc.roomSelections || []).map((room) => ({
          roomId: room.roomId,
          roomNumber: room.roomNumber,
          venue: room.venue,
          occupantCount: Number(room.occupantCount) || 0,
          requiresAdminConfirmation: room.requiresAdminConfirmation === true,
          adminContacted: room.adminContacted === true,
        })) : [];

        const dineInCounts = [];
        if (acc.dine === "Yes") {
          if (acc.dineTypes.includes("Hostel") && parseInt(acc.hostelGuests) > 0)
            dineInCounts.push({ type: "Hostel", count: parseInt(acc.hostelGuests) });
          if (acc.dineTypes.includes("Amenity") && parseInt(acc.amenityGuests) > 0)
            dineInCounts.push({ type: "Amenity", count: parseInt(acc.amenityGuests) });
        }

        return {
          checkInDateTime: formatAccommodationDateTime(acc.checkIn),
          checkOutDateTime: formatAccommodationDateTime(acc.checkOut),
          guests: selectedGuests.map((g) => ({
            name: g.name || "",
            mobile: parseInt(g.mobile) || 0,
            gender: g.gender || "",
          })),
          roomSelections,
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

function AdminConfirmationModal({ room, onContacted, onRevoke }) {
  const [contacted, setContacted] = useState(room.adminContacted === true);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 bg-[#1f1f38] border border-yellow-500/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex gap-3">
          <AlertTriangle className="text-yellow-400 shrink-0" />
          <div>
            <h3 className="text-white font-semibold">Admin confirmation required</h3>
            <p className="text-gray-300 text-sm mt-2">{room.adminMessage}</p>
          </div>
        </div>
        <label className="flex items-center gap-3 text-white text-sm mt-5 cursor-pointer">
          <input type="checkbox" checked={contacted} onChange={(event) => {
            setContacted(event.target.checked);
            if (event.target.checked) onContacted();
          }} className="accent-purple-500" />
          Contacted admin
        </label>
        <div className="flex justify-end mt-5">
          <button type="button" onClick={onRevoke} className="px-4 py-2 rounded-lg border border-red-400/50 text-red-300 hover:bg-red-500/10 text-sm">
            Revoke this message
          </button>
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
function RoomMultiSelect({ label, options, value = [], onChange, error, labelBg = "#1f1f38", onOpen, loading = false }) {
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

  const getLabel = (room) => `${room.venue || ""}${room.venue ? " - " : ""}${room.roomNumber}`;
  const filtered = options.filter((o) =>
    getLabel(o).toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (opt) => {
    if (value.some((room) => room.roomId === opt.roomId)) onChange(value.filter((room) => room.roomId !== opt.roomId));
    else onChange([...value, opt]);
  };

  // ── Display text: join selected options with " / " ──
  const displayText =
    value.length === 0
      ? "Select..."
      : value.map(getLabel).join(" / ");

  return (
    <div className="relative w-full" ref={ref}>
      {/* Trigger */}
      <div
        className={`relative w-full h-10 px-3 rounded-lg bg-transparent border ${
          error ? "border-red-400" : open ? "border-purple-500" : "border-[#3a3a5a]"
        } text-white cursor-pointer flex items-center justify-between transition`}
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          if (nextOpen) onOpen?.();
        }}
      >
        <span
          className={`text-sm truncate ${value.length === 0 ? "text-gray-500" : "text-white"}`}
          title={value.length > 0 ? value.map(getLabel).join(" / ") : undefined}
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
        <div className="absolute z-50 mt-1 w-full max-h-64 rounded-lg border border-[#3a3a5a] bg-[#1f1f38] shadow-xl overflow-y-auto table-custom-scrollbar">
          {/* Search */}
          <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-1.5 border-b border-[#3a3a5a] bg-[#1f1f38]">
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

          {loading ? (
            <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
              <LoaderCircle size={13} className="animate-spin" /> Loading available rooms...
            </div>
          ) : filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-500">No available rooms</div>
          ) : (
            filtered.map((opt) => {
              const selected = value.some((room) => room.roomId === opt.roomId);
              return (
                <div
                  key={opt.roomId}
                  onClick={() => toggle(opt)}
                  className={`flex items-center justify-between px-4 py-1.5 cursor-pointer text-sm transition-colors ${
                    selected
                      ? "bg-purple-700/30 text-white"
                      : "text-gray-300 hover:bg-[#2a2a4a] hover:text-white"
                  }`}
                >
                  <span className="flex min-w-0 flex-1 items-start gap-2">
                    {opt.requiresAdminConfirmation && <AlertTriangle size={14} className="text-yellow-400" />}
                    <span className="min-w-0 flex-1 truncate">
                      {opt.venue || "Unknown venue"}
                    </span>
                    <span className="w-20 flex-shrink-0 leading-5 text-left">
                      <span className="block">{opt.occupantCount || "-"}</span>
                      <span className="block text-gray-400">{opt.roomNumber || "Room unavailable"}</span>
                    </span>
                  </span>
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
  roomsLoading,
  roomsError,
  onRetryRooms,
  onRevokeRoom,
  canRemove,
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminRoom, setAdminRoom] = useState(null);
  const [roomSelectionError, setRoomSelectionError] = useState("");

  const selectedCount = acc.selectedGuestIds.length;
  const totalGuests = allGuests.length;

  const toggleGuest = (guestId) => {
    const next = acc.selectedGuestIds.includes(guestId)
      ? acc.selectedGuestIds.filter((id) => id !== guestId)
      : [...acc.selectedGuestIds, guestId];
    onChange({ ...acc, selectedGuestIds: next });
  };

  const handleRoomTypeChange = (types) => {
    const maxRooms = selectedCount;
    if (types.length > maxRooms) {
      setRoomSelectionError(`You can select a maximum of ${maxRooms} rooms for ${selectedCount} selected guest${selectedCount === 1 ? "" : "s"}.`);
      return;
    }
    setRoomSelectionError("");
    onChange({ ...acc, roomSelections: types });
    const warningRoom = types.find((room) => room.requiresAdminConfirmation && !room.adminContacted);
    if (warningRoom) setAdminRoom(warningRoom);
  };

  useEffect(() => {
    if (!adminRoom) {
      const pendingRoom = acc.roomSelections.find((room) => room.requiresAdminConfirmation && !room.adminContacted);
      if (pendingRoom) setAdminRoom(pendingRoom);
    }
  }, [acc.roomSelections, adminRoom]);

  // Removed single/double rooms logic

  const showAmenity = acc.dineTypes.includes("Amenity");
  const showHostel = acc.dineTypes.includes("Hostel");
  const filteredRoomOptions = roomOptions.filter((room) => {
    const capacity = Number(room.occupantCount) || 0;
    if (selectedCount === 1) return capacity === 2;
    return true;
  });

  return (
    <>
      {adminRoom && (
        <AdminConfirmationModal
          room={adminRoom}
          onContacted={() => {
            onChange({ ...acc, roomSelections: acc.roomSelections.map((room) => room.roomId === adminRoom.roomId ? { ...room, adminContacted: true } : room) });
            setAdminRoom(null);
          }}
          onRevoke={() => {
            onRevokeRoom(adminRoom.roomId);
            onChange({ ...acc, roomSelections: acc.roomSelections.filter((room) => room.roomId !== adminRoom.roomId) });
            setAdminRoom(null);
          }}
        />
      )}
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
                      <Building2 className="text-purple-500" gender={g.organization} />
                      <span className="text-gray-300">{g.organization || "—"}</span>
                    </span>
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
                roomSelections: val === "No" ? [] : acc.roomSelections,
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
            {roomsError && <p className="text-red-400 text-xs mb-2">{roomsError} <button type="button" onClick={onRetryRooms} className="underline">Retry</button></p>}
            {roomSelectionError && <p className="text-red-400 text-xs mb-2">{roomSelectionError}</p>}
            <RoomMultiSelect
              label="Type of Room Wanted *"
              options={filteredRoomOptions}
              value={acc.roomSelections}
              onChange={handleRoomTypeChange}
              error={errors.roomSelections}
              onOpen={onRetryRooms}
              loading={roomsLoading}
              labelBg="#1f1f38"
            />
          </div>
        )}

        {errors.roomSelections && <p className="text-red-400 text-xs mt-1">{errors.roomSelections}</p>}

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
                onChange={(types) => {
                  if (selectedCount === 1 && types.length > 1) {
                    return;
                  }
                  onChange({ ...acc, dineTypes: types });
                }}
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
                    min={1}
                    max={selectedCount}
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
                    min={1}
                    max={selectedCount}
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
  const [roomAvailability, setRoomAvailability] = useState({});
  const [roomLoading, setRoomLoading] = useState({});
  const [roomErrors, setRoomErrors] = useState({});
  const [revokedRoomIds, setRevokedRoomIds] = useState(() => new Set());

  const accommodationsRef = useRef(accommodations);
  useEffect(() => { accommodationsRef.current = accommodations; }, [accommodations]);

  const allGuestsRef = useRef(allGuests);
  useEffect(() => { allGuestsRef.current = allGuests; }, [allGuests]);

  const onChangeRef = useRef(onAccommodationDataChange);
  useEffect(() => { onChangeRef.current = onAccommodationDataChange; }, [onAccommodationDataChange]);

  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current({ accommodations });
  }, [accommodations]);

  const loadRooms = useCallback(async (index, acc) => {
    if (acc.accommodationNeeded !== "Yes" || !acc.checkIn || !acc.checkOut) return;
    setRoomLoading((prev) => ({ ...prev, [index]: true }));
    setRoomErrors((prev) => ({ ...prev, [index]: "" }));
    try {
      const rooms = await fetchAvailableRooms(formatAccommodationDateTime(acc.checkIn), formatAccommodationDateTime(acc.checkOut));
      setRoomAvailability((prev) => ({ ...prev, [index]: rooms.filter((room) => !revokedRoomIds.has(room.roomId)) }));
    } catch (error) {
      setRoomErrors((prev) => ({ ...prev, [index]: error.message || "Unable to load room availability." }));
    } finally {
      setRoomLoading((prev) => ({ ...prev, [index]: false }));
    }
  }, [revokedRoomIds]);

  const updateBlock = (index, updated) => {
    setAccommodations((prev) => prev.map((a, i) => (i === index ? updated : a)));
    setBlockErrors((prev) =>
      prev.map((e, i) => {
        if (i !== index) return e;
        const newErrors = {};
        const pastCheckInTimeError = getPastCheckInTimeError(updated.checkIn);
        if (pastCheckInTimeError) newErrors.checkIn = pastCheckInTimeError;

        // Real-time dine-in validation
        if (updated.dine === "Yes") {
          const totalSelected = updated.selectedGuestIds ? updated.selectedGuestIds.length : 0;
          const hostelCount = parseInt(updated.hostelGuests) || 0;
          const amenityCount = parseInt(updated.amenityGuests) || 0;

          if (updated.dineTypes.includes("Hostel") && hostelCount > totalSelected) {
            newErrors.hostelGuests = `Hostel dine-in guests (${hostelCount}) cannot exceed selected guests (${totalSelected})`;
          }
          if (updated.dineTypes.includes("Amenity") && amenityCount > totalSelected) {
            newErrors.amenityGuests = `Amenity dine-in guests (${amenityCount}) cannot exceed selected guests (${totalSelected})`;
          }
          if (totalSelected === 1 && updated.dineTypes.length > 1) {
            newErrors.dineTypes = "Guest was 1 cannot choose two places for dine-in";
          } else if (hostelCount + amenityCount > totalSelected && hostelCount > 0 && amenityCount > 0) {
            newErrors.dineTypes = "You can choose one guest for one place or choose one place for dine-in";
          }
        }

        return newErrors;
      })
    );
  };

  const addBlock = () => {
    if (allGuests.length <= 1) {
      setApiError("Only one guest is there, no access to create another day for the guest");
      return;
    }
    setApiError("");
    setAccommodations((prev) => [...prev, emptyAccommodation()]);
    setBlockErrors((prev) => [...prev, {}]);
  };

  const removeBlock = (index) => {
    setAccommodations((prev) => prev.filter((_, i) => i !== index));
    setBlockErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const revokeRoom = (roomId) => {
    setRevokedRoomIds((prev) => new Set([...prev, roomId]));
    setRoomAvailability((prev) => Object.fromEntries(Object.entries(prev).map(([key, rooms]) => [key, rooms.filter((room) => room.roomId !== roomId)])));
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
          roomOptions={(roomAvailability[index] || []).filter((room) => !revokedRoomIds.has(room.roomId))}
          roomsLoading={roomLoading[index]}
          roomsError={roomErrors[index]}
          onRetryRooms={() => loadRooms(index, acc)}
          onRevokeRoom={revokeRoom}
          canRemove={index > 0}
        />
      ))}
    </div>
  );
}