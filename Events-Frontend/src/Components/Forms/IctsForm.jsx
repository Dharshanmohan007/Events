import React, { useState, useEffect, useRef, useCallback } from "react";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";
import { DayTimeline } from "./VenueForm";
import VenueInfoPopup from "./VenueInfoPopup";
import { Info } from "lucide-react";


const REQUIREMENTS_OPTIONS = [
  "Chief Guest AV",
  "Stage LED Back Drop",
  "Pointer",
  "Writing Pad",
  "Webcam",
];

const EQUIPMENT_OPTIONS = ["Desktop", "Laptop"];

const INTERNET_FACILITY_OPTIONS = ["LAN", "Wi-Fi", "Both", "Not Required"];

// ── Department detection ──────────────────────────────────────────────────────
// Reads department from localStorage. The stored value can be:
//   • a plain string:  localStorage.getItem("department") === "placement"
//   • inside a JSON user object: { department: "placement", ... }
// Adjust the key names below to match your actual storage shape.

function getDepartmentFromStorage() {
  try {
    const dept = localStorage.getItem("department");
    if (dept) return dept.toLowerCase().trim();
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      return (user?.department || "").toLowerCase().trim();
    }
  } catch {
    // ignore parse errors
  }
  return "";
}

const isPlacementDept = () => getDepartmentFromStorage() === "placement";

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateIctsCard(card, showProctoring) {
  const e = {};
  if (!card.equipmentRequired || card.equipmentRequired.length === 0)
    e.equipmentRequired = "Select at least one equipment";
  if (!card.internetFacility) e.internetFacility = "This field is required";
  if (
    card.expectedInternetUsers === "" ||
    card.expectedInternetUsers === undefined ||
    card.expectedInternetUsers === null
  ) {
    e.expectedInternetUsers = "This field is required";
  }
  if (
    showProctoring &&
    (card.proctorUsers === "" || card.proctorUsers === undefined || card.proctorUsers === null)
  ) {
    e.proctorUsers = "This field is required";
  }
  if (
    card.guestWifi === "Yes" &&
    card.guestWifiExceed5 === "Yes" &&
    (card.totalGuestCount === "" || card.totalGuestCount === undefined || card.totalGuestCount === null)
  ) {
    e.totalGuestCount = "This field is required";
  }
  if (!card.requirements || card.requirements.length === 0)
    e.requirements = "Select at least one requirement";
  // desktopCount / laptopCount are optional — not validated here.
  return e;
}

function validateDay(dayIndex, venues, latestIctsData, showProctoring) {
  if (!venues || venues.length === 0) return {};
  const dayErrors = {};
  venues.forEach((venueName) => {
    const card = latestIctsData[dayIndex]?.[venueName] || {};
    const cardErrors = validateIctsCard(card, showProctoring);
    if (Object.keys(cardErrors).length > 0) dayErrors[venueName] = cardErrors;
  });
  return dayErrors;
}

const buildIctsPayload = (ictsData) => {
  const ictses = [];
  Object.entries(ictsData).forEach(([dayIndexStr, venues]) => {
    const dayIndex = parseInt(dayIndexStr);
    Object.entries(venues || {}).forEach(([venueName, card]) => {
      const desktopLaptop = (card.equipmentRequired || []).map((type) => ({
        type,
        count:
          type === "Desktop"
            ? parseInt(card.desktopCount) || 0
            : type === "Laptop"
            ? parseInt(card.laptopCount) || 0
            : 0,
      }));

      ictses.push({
        dayIndex,
        venueName,
        desktopLaptop,
        internetFacility:      card.internetFacility || "",
        expectedInternetUsers: parseInt(card.expectedInternetUsers) || 0,
        proctoringUsers:       parseInt(card.proctorUsers) || 0,
        guestWifiNeeded:       card.guestWifi === "Yes",
        guestWifiExceed5:      card.guestWifiExceed5 === "Yes",
        totalGuestCount:       parseInt(card.totalGuestCount) || 0,
        requirements:          card.requirements || [],
        otherRequirements:     card.others || "",
        specialRequirements:   card.specialRequirements || "",
      });
    });
  });
  return { ictses };
};

// ── MultiSelect (generic) ─────────────────────────────────────────────────────
// Used both for "Requirements" and "Equipment Required" — same interaction
// pattern, just different option lists / labels.

function RequirementsSelect({
  label,
  selected,
  onChange,
  error,
  labelBg = "#1E1E35",
  options = REQUIREMENTS_OPTIONS,
  placeholder = "Select requirements...",
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

  const toggle = (item) =>
    onChange(
      selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]
    );

  const displayText =
    selected.length === 0
      ? ""
      : selected.length <= 2
      ? selected.join(" / ")
      : `${selected[0]} / ${selected[1]} +${selected.length - 2} more`;

  return (
    <div className="w-full" ref={ref}>
      <div className="relative w-full">
        <span
          className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
          style={{ backgroundColor: labelBg }}
        >
          {label}
        </span>
        <div
          onClick={() => setOpen(!open)}
          className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${
            open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"
          }`}
        >
          <span
            className={`text-sm truncate max-w-[85%] ${
              selected.length ? "text-white" : "text-gray-500"
            }`}
          >
            {displayText || placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {open && (
          <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
            {options.map((item, i) => {
              const isSelected = selected.includes(item);
              return (
                <div
                  key={i}
                  onClick={() => toggle(item)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-purple-600/30 text-white"
                      : "text-white hover:bg-purple-500/20"
                  }`}
                >
                  <span>{item}</span>
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-purple-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── IctsVenueCard ─────────────────────────────────────────────────────────────

function IctsVenueCard({ venueName, index, data, onChange, errors = {}, showProctoring, onInfoClick }) {
  const update      = (field) => (val) => onChange({ ...data, [field]: val });
  const updateInput = (field) => (e)   => onChange({ ...data, [field]: e.target.value });

  const showGuestWifiExceed  = data.guestWifi === "Yes";
  const showTotalGuestCount  = data.guestWifi === "Yes" && data.guestWifiExceed5 === "Yes";

  const equipmentRequired = data.equipmentRequired || [];
  const showDesktopCount  = equipmentRequired.includes("Desktop");
  const showLaptopCount   = equipmentRequired.includes("Laptop");

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      {/* ── Card header ── */}
      <div className="flex items-center justify-between">
        <h3 className="text-purple-400 text-base font-semibold">{venueName}</h3>
        <div className="flex items-center gap-2">
          {/* Info button → opens VenueInfoPopup */}
          <button
            onClick={() => onInfoClick(venueName)}
            title="View venue details"
            className="w-6 h-6 rounded-full flex items-center justify-center bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/40 hover:text-white transition-all"
          >
            <Info size={14} />
          </button>
          {/* Index badge */}
          {/* <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold">
            {index}
          </div> */}
        </div>
      </div>

      {/* ── Row 1: Equipment Required · Internet Facility ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <RequirementsSelect
            label="Equipment Required *"
            options={EQUIPMENT_OPTIONS}
            placeholder="Select equipment..."
            selected={equipmentRequired}
            onChange={(val) => {
              // Clear the count for any equipment that just got de-selected
              const patch = { equipmentRequired: val };
              if (!val.includes("Desktop")) patch.desktopCount = "";
              if (!val.includes("Laptop"))  patch.laptopCount  = "";
              onChange({ ...data, ...patch });
            }}
            error={errors.equipmentRequired}
          />
        </div>
        <div>
          <CustomSelect
            labelBg="#1E1E35"
            label="Internet Facility *"
            value={data.internetFacility || ""}
            onChange={update("internetFacility")}
            options={INTERNET_FACILITY_OPTIONS}
            placeholder="Select internet type"
          />
          {errors.internetFacility && (
            <p className="text-red-400 text-xs mt-1">{errors.internetFacility}</p>
          )}
        </div>
      </div>

      {/* ── Row 1b: Desktop Count · Laptop Count (conditional on Equipment Required) ──
           Not required fields — no validation, just clamped to >= 0. ── */}
      {(showDesktopCount || showLaptopCount) && (
        <div
          className={`grid gap-4 ${
            showDesktopCount && showLaptopCount ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {showDesktopCount && (
            <div>
              <CustomInput
                labelBg="#1E1E35"
                label="Desktop Count"
                type="number"
                value={data.desktopCount || ""}
                onChange={(e) =>
                  updateInput("desktopCount")({
                    target: { value: Math.max(0, Number(e.target.value)) },
                  })
                }
                placeholder="e.g. 10"
              />
            </div>
          )}
          {showLaptopCount && (
            <div>
              <CustomInput
                labelBg="#1E1E35"
                label="Laptop Count"
                type="number"
                value={data.laptopCount || ""}
                onChange={(e) =>
                  updateInput("laptopCount")({
                    target: { value: Math.max(0, Number(e.target.value)) },
                  })
                }
                placeholder="e.g. 5"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Row 2: Expected Internet Users (full-width if no proctoring, half if proctoring) ── */}
      <div className={`grid gap-4 ${showProctoring ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="Expected Internet Users *"
            type="number"
            value={data.expectedInternetUsers || ""}
            onChange={(e) =>
              updateInput("expectedInternetUsers")({
                target: {
                  value: Math.max(0, Number(e.target.value)),
                },
              })
            }
            placeholder="e.g. 50"
          />
          {errors.expectedInternetUsers && (
            <p className="text-red-400 text-xs mt-1">{errors.expectedInternetUsers}</p>
          )}
        </div>

        {/* Proctoring Users — only for Placement department */}
        {showProctoring && (
          <div>
            <CustomInput
              labelBg="#1E1E35"
              label="Proctoring Users *"
              type="number"
              value={data.proctorUsers || ""}
              onChange={(e) =>
                updateInput("proctorUsers")({
                  target: {
                    value: Math.max(0, Number(e.target.value)),
                  },
                })
              }
              placeholder="e.g. 30"
            />
            {errors.proctorUsers && (
              <p className="text-red-400 text-xs mt-1">{errors.proctorUsers}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Row 3: Guest WiFi Needed — full width ── */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <CustomSelect
            labelBg="#1E1E35"
            label="Guest Wi-Fi Needed *"
            value={data.guestWifi || ""}
            onChange={(val) => {
              // Reset downstream fields when toggled off
              const reset = val === "No" ? { guestWifiExceed5: "", totalGuestCount: "" } : {};
              onChange({ ...data, guestWifi: val, ...reset });
            }}
            options={["Yes", "No"]}
            placeholder="Select an option"
          />
          {errors.guestWifi && (
            <p className="text-red-400 text-xs mt-1">{errors.guestWifi}</p>
          )}
        </div>
      </div>

      {/* ── Row 4 & 5: If guest Wi-Fi Exceed 5 + Total Guest Count ──
           • guestWifi = Yes, guestWifiExceed5 != Yes  → Exceed 5 full-width alone
           • guestWifi = Yes, guestWifiExceed5 = Yes   → Exceed 5 + Total Count side by side
      ── */}
      {showGuestWifiExceed && (
        <div className={`grid gap-4 ${showTotalGuestCount ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          <div>
            <CustomSelect
              labelBg="#1E1E35"
              label="If Guest Wi-Fi Users Exceed 5 *"
              value={data.guestWifiExceed5 || ""}
              onChange={(val) => {
                const reset = val === "No" ? { totalGuestCount: "" } : {};
                onChange({ ...data, guestWifiExceed5: val, ...reset });
              }}
              options={["Yes", "No"]}
              placeholder="Select an option"
            />
            {errors.guestWifiExceed5 && (
              <p className="text-red-400 text-xs mt-1">{errors.guestWifiExceed5}</p>
            )}
          </div>

          {showTotalGuestCount && (
            <div>
              <CustomInput
                labelBg="#1E1E35"
                label="Total Number of Guest Count *"
                type="number"
                value={data.totalGuestCount || ""}
                onChange={updateInput("totalGuestCount")}
                placeholder="e.g. 8"
              />
              {errors.totalGuestCount && (
                <p className="text-red-400 text-xs mt-1">{errors.totalGuestCount}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Row 6: Requirements · Others ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <RequirementsSelect
            label="Requirements *"
            selected={data.requirements || []}
            onChange={(val) => onChange({ ...data, requirements: val })}
            error={errors.requirements}
          />
        </div>
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="Others (if applicable)"
            value={data.others || ""}
            onChange={updateInput("others")}
            placeholder="Any other requirement"
          />
        </div>
      </div>

      {/* ── Row 7: Special Requirements ── */}
      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
            Special Requirements, if any
          </span>
          <textarea
            value={data.specialRequirements || ""}
            onChange={updateInput("specialRequirements")}
            rows={3}
            placeholder="Enter any special setup, equipment, or access needs..."
            className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600"
          />
        </div>
      </div>
    </div>
  );
}

// ── Main IctsForm ─────────────────────────────────────────────────────────────

export default function IctsForm({
  nextStep,
  prevStep,
  registerChildNavigation,
  eventDays = [],
  venueData = [],
  ictsData: initialIctsData = {},
  onIctsDataChange,
  eventId,
}) {
  const dayCount = eventDays.length;

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedDays, setCompletedDays]     = useState([]);
  const [errors, setErrors]                   = useState({});
  const [isLoading, setIsLoading]             = useState(false);
  const [apiError, setApiError]               = useState("");
  const [ictsData, setIctsData]               = useState(() => initialIctsData || {});

  // Venue info popup state
  const [popupVenue, setPopupVenue] = useState(null);

  // Placement department detection (evaluated once; stable for the session)
  const [showProctoring] = useState(() => isPlacementDept());

  // Always-fresh refs
  const ictsDataRef = useRef(ictsData);
  useEffect(() => { ictsDataRef.current = ictsData; }, [ictsData]);

  const onIctsDataChangeRef = useRef(onIctsDataChange);
  useEffect(() => { onIctsDataChangeRef.current = onIctsDataChange; }, [onIctsDataChange]);

  // Mount-only sync from parent
  useEffect(() => {
    if (initialIctsData && Object.keys(initialIctsData).length > 0) {
      setIctsData(initialIctsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent on every change
  useEffect(() => {
    if (onIctsDataChangeRef.current) onIctsDataChangeRef.current(ictsData);
  }, [ictsData]);

  // Clamp currentDayIndex whenever dayCount changes
  useEffect(() => {
    if (dayCount > 0 && currentDayIndex >= dayCount) {
      setCurrentDayIndex(dayCount - 1);
    }
  }, [dayCount, currentDayIndex]);

  const getVenuesForDay = useCallback(
    (dayIndex) => {
      if (dayIndex < 0 || dayIndex >= dayCount) return [];
      return venueData[dayIndex]?.selectedVenues || [];
    },
    [venueData, dayCount]
  );

  const currentVenues = getVenuesForDay(currentDayIndex);

  const getCardData = (dayIndex, venueName) => ictsData[dayIndex]?.[venueName] || {};

  const updateCardData = (dayIndex, venueName, updated) => {
    setIctsData((prev) => ({
      ...prev,
      [dayIndex]: { ...(prev[dayIndex] || {}), [venueName]: updated },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      if (next[dayIndex]?.[venueName]) {
        const dayErrs = { ...next[dayIndex] };
        delete dayErrs[venueName];
        next[dayIndex] = dayErrs;
      }
      return next;
    });
  };

  const isLastDay = currentDayIndex === Math.max(dayCount - 1, 0);

  // ── handleNext ──────────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    const latestIctsData = ictsDataRef.current;
    const venues = getVenuesForDay(currentDayIndex);

    const dayErrors = validateDay(currentDayIndex, venues, latestIctsData, showProctoring);
    const hasErrors = Object.keys(dayErrors).length > 0;
    setErrors((prev) => ({ ...prev, [currentDayIndex]: dayErrors }));
    if (hasErrors) return;

    setErrors((prev) => ({ ...prev, [currentDayIndex]: {} }));

    setCompletedDays((prev) =>
      prev.includes(currentDayIndex) ? prev : [...prev, currentDayIndex]
    );

    if (isLastDay) {
      setIsLoading(true);
      setApiError("");
      try {
        const payload = buildIctsPayload(latestIctsData);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId || ""}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ictsDetails: payload }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || `Server error: ${response.status}`);
        nextStep();
      } catch (err) {
        setApiError(err.message || "Failed to save ICTS details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentDayIndex((prev) => prev + 1);
    }
  }, [currentDayIndex, isLastDay, eventId, nextStep, getVenuesForDay, showProctoring]);

  // ── handleBack ──────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex((prev) => prev - 1);
    } else {
      if (prevStep) prevStep();
    }
  }, [currentDayIndex, prevStep]);

  // ── Nav registration — stable proxy pattern ─────────────────────────────────
  const navRef = useRef({ next: handleNext, prev: handleBack, isLoading });
  navRef.current = { next: handleNext, prev: handleBack, isLoading };

  const nextDayLabel = isLastDay ? "Save & Next" : `Day ${currentDayIndex + 2} →`;

  useEffect(() => {
    if (!registerChildNavigation) return;
    const stableNext = (...args) => navRef.current.next(...args);
    const stablePrev = (...args) => navRef.current.prev(...args);
    registerChildNavigation({
      next: stableNext,
      prev: stablePrev,
      isLoading: false,
      isOnLastDay: isLastDay,
      nextDayLabel,
    });
    return () => registerChildNavigation({ next: null, prev: null, isLoading: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerChildNavigation]);

  useEffect(() => {
    if (!registerChildNavigation) return;
    registerChildNavigation({
      next: (...args) => navRef.current.next(...args),
      prev: (...args) => navRef.current.prev(...args),
      isLoading,
      isOnLastDay: isLastDay,
      nextDayLabel,
    });
  }, [isLoading, registerChildNavigation, isLastDay, nextDayLabel]);

  const currentDayErrors = errors[currentDayIndex] || {};

  // Popup handlers
  const handleInfoClick  = useCallback((venueName) => setPopupVenue(venueName), []);
  const handlePopupClose = useCallback(() => setPopupVenue(null), []);

  // Guard: no days
  if (dayCount === 0) {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
          <p className="text-gray-400 text-sm">
            No event days found. Please go back and add event days first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* VenueInfoPopup — rendered at root level so it overlays everything */}
      {popupVenue && (
        <VenueInfoPopup venueName={popupVenue} onClose={handlePopupClose} />
      )}

      <div className="flex flex-col gap-6 pb-6">
        <DayTimeline
          days={eventDays.slice(0, dayCount)}
          currentDayIndex={currentDayIndex}
          completedDays={completedDays}
        />

        <h2 className="text-white text-lg font-bold">
          ICTS Details
        </h2>

        {/* API error banner */}
        {apiError && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-red-400 text-sm">{apiError}</p>
          </div>
        )}

        {/* Validation error summary */}
        {Object.keys(currentDayErrors).length > 0 && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-red-400 text-sm">
              Please fill in all required fields for each venue before proceeding.
            </p>
          </div>
        )}

        {currentVenues.length === 0 ? (
          <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
            <p className="text-gray-400 text-sm">
              No venues were selected for Day {currentDayIndex + 1} in the Venue Form.
              You can still proceed — ICTS details are only required for days that have venues.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {currentVenues.map((venueName, i) => (
              <IctsVenueCard
                key={venueName}
                venueName={venueName}
                index={i + 1}
                data={getCardData(currentDayIndex, venueName)}
                onChange={(updated) => updateCardData(currentDayIndex, venueName, updated)}
                errors={currentDayErrors[venueName] || {}}
                showProctoring={showProctoring}
                onInfoClick={handleInfoClick}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}