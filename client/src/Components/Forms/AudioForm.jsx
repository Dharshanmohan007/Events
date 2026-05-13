import React, { useState, useRef, useEffect, useCallback } from "react";
import CustomInput from "../CustomInput";
import { DayTimeline } from "./VenueForm";

const BASE_URL = "https://sece-events.onrender.com";

// ─── Audio requirement options ────────────────────────────────────────────────
const AUDIO_REQUIREMENT_OPTIONS = [
  "Hand Mic",
  "Collar Mic",
  "AC",
  "Speaker",
  "Amplifier",
  "Mixer",
  "None",
];

// ─── Default section shape (per venue per day) ────────────────────────────────
const defaultVenueSection = () => ({
  audioRequired: [],   // multi-select → string[]
  others: "",
  handMic: "",
  collar: "",
  specialRequirements: "",
});

// ─── Validation ───────────────────────────────────────────────────────────────
function validateDay(dayVenues, dayData) {
  if (!dayVenues || dayVenues.length === 0) return {};
  const errors = {};
  dayVenues.forEach((venueName) => {
    const s = dayData?.[venueName] || defaultVenueSection();
    const ve = {};
    if (!s.audioRequired || s.audioRequired.length === 0)
      ve.audioRequired = "Select at least one audio requirement";
    if (!s.handMic || s.handMic === "" || parseInt(s.handMic) < 0)
      ve.handMic = "Hand mic quantity is required";
    if (!s.collar || s.collar === "" || parseInt(s.collar) < 0)
      ve.collar = "Collar mic quantity is required";
    if (Object.keys(ve).length > 0) errors[venueName] = ve;
  });
  return errors;
}

// ─── Build backend payload ────────────────────────────────────────────────────
function buildAudioPayload(audioData, eventDays, venueData) {
  const audios = [];
  eventDays.forEach((_day, dayIndex) => {
    const venueNames = venueData[dayIndex]?.selectedVenues || [];
    venueNames.forEach((venueName) => {
      const s = audioData[dayIndex]?.[venueName] || defaultVenueSection();
      const audioItems = [];
      if (parseInt(s.handMic) > 0)
        audioItems.push({ type: "Hand Mic", quantity: parseInt(s.handMic) });
      if (parseInt(s.collar) > 0)
        audioItems.push({ type: "Collar Mic", quantity: parseInt(s.collar) });
      audios.push({
        dayIndex,
        venueName,
        audioItems,
        audioRequirements: s.audioRequired || [],
        otherRequirements: s.others || "",
        specialRequirements: s.specialRequirements || "",
      });
    });
  });
  return { audios };
}

// ─── Multi-select for Audio Requirements (mirrors RequirementsSelect / HallRequirementsSelect) ──
function AudioRequirementsSelect({ selected = [], onChange, error, labelBg = "#1E1E35" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (item) => {
    if (item === "None") {
      // selecting None clears everything else
      onChange(selected.includes("None") ? [] : ["None"]);
      return;
    }
    const without = selected.filter((v) => v !== "None");
    onChange(
      without.includes(item)
        ? without.filter((v) => v !== item)
        : [...without, item]
    );
  };

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
          Audio Requirements *
        </span>
        <div
          onClick={() => setOpen(!open)}
          className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${
            open
              ? "border-purple-500"
              : error
              ? "border-red-400"
              : "border-[#3A3A5A]"
          }`}
        >
          <span
            className={`text-sm truncate max-w-[85%] ${
              selected.length ? "text-white" : "text-gray-500"
            }`}
          >
            {displayText || "Select requirements..."}
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
            {AUDIO_REQUIREMENT_OPTIONS.map((item, i) => {
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

// ─── Single venue card ────────────────────────────────────────────────────────
function AudioVenueCard({ venueName, index, data, onChange, errors = {} }) {
  const updateField = (field, val) => onChange({ ...data, [field]: val });

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-purple-400 text-base font-semibold">{venueName}</h3>
        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold">
          {index}
        </div>
      </div>

      {/* Row 1 – Audio Requirements (multi-select) + Others */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AudioRequirementsSelect
            selected={data.audioRequired || []}
            onChange={(val) => updateField("audioRequired", val)}
            error={errors.audioRequired}
          />
        </div>
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="Others (If applicable)"
            value={data.others || ""}
            onChange={(e) => updateField("others", e.target.value)}
          />
        </div>
      </div>

      {/* Row 2 – Hand Mic Quantity (number) + Collar Mic Quantity (number) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="Hand Mic Quantity *"
            type="number"
            value={data.handMic || ""}
            onChange={(e) => updateField("handMic", e.target.value)}
          />
          {errors.handMic && (
            <p className="text-red-400 text-xs mt-1">{errors.handMic}</p>
          )}
        </div>
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="Collar Mic Quantity *"
            type="number"
            value={data.collar || ""}
            onChange={(e) => updateField("collar", e.target.value)}
          />
          {errors.collar && (
            <p className="text-red-400 text-xs mt-1">{errors.collar}</p>
          )}
        </div>
      </div>

      {/* Row 3 – Special Requirements */}
      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
            Special Requirements, If any
          </span>
          <textarea
            value={data.specialRequirements || ""}
            onChange={(e) => updateField("specialRequirements", e.target.value)}
            rows={2}
            placeholder="Enter any special requirements..."
            className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main AudioForm ───────────────────────────────────────────────────────────
export default function AudioForm({
  nextStep,
  prevStep,
  registerChildNavigation,
  audioData: initialAudioData,
  onAudioDataChange,
  eventId,
  errors: propErrors = {},
  eventDays = [],   // [{ date, startTime, endTime, ... }]  — same as IctsForm
  venueData = [],   // [{ selectedVenues: string[], ... }]  — from VenueForm
}) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // audioData: { [dayIndex]: { [venueName]: sectionObj } }
  const [audioData, setAudioData] = useState(() => initialAudioData || {});

  // ── Always-fresh refs (same pattern as IctsForm / VenueForm) ─────────────
  const audioDataRef = useRef(audioData);
  useEffect(() => { audioDataRef.current = audioData; }, [audioData]);

  const onAudioDataChangeRef = useRef(onAudioDataChange);
  useEffect(() => { onAudioDataChangeRef.current = onAudioDataChange; }, [onAudioDataChange]);

  // Mount-only sync from parent
  useEffect(() => {
    if (initialAudioData && Object.keys(initialAudioData).length > 0) {
      setAudioData(initialAudioData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent on every change
  useEffect(() => {
    if (onAudioDataChangeRef.current) onAudioDataChangeRef.current(audioData);
  }, [audioData]);

  // ── Venues for a given day (mirrors IctsForm's getVenuesForDay) ───────────
  const getVenuesForDay = (dayIndex) =>
    venueData[dayIndex]?.selectedVenues || [];

  const currentVenues = getVenuesForDay(currentDayIndex);

  // ── Update a venue card ───────────────────────────────────────────────────
  const updateCardData = (venueName, updated) => {
    setAudioData((prev) => ({
      ...prev,
      [currentDayIndex]: {
        ...(prev[currentDayIndex] || {}),
        [venueName]: updated,
      },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      if (next[venueName]) delete next[venueName];
      return next;
    });
  };

  const getCardData = (venueName) =>
    audioData[currentDayIndex]?.[venueName] || defaultVenueSection();

  // ── isLastDay ─────────────────────────────────────────────────────────────
  const isLastDay = currentDayIndex === eventDays.length - 1;

  // ── handleNext (identical structure to IctsForm / VenueForm) ─────────────
  const handleNext = useCallback(async () => {
    const latestAudioData = audioDataRef.current;
    const venues = getVenuesForDay(currentDayIndex);
    const dayErrors = validateDay(venues, latestAudioData[currentDayIndex]);
    const hasErrors = Object.keys(dayErrors).length > 0;
    setErrors(hasErrors ? dayErrors : {});
    if (hasErrors) return;

    const newCompleted = completedDays.includes(currentDayIndex)
      ? completedDays
      : [...completedDays, currentDayIndex];

    if (isLastDay) {
      setIsLoading(true);
      setApiError("");
      try {
        const payload = buildAudioPayload(latestAudioData, eventDays, venueData);
        const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ audioDetails: payload }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || `Server error: ${response.status}`);
        setCompletedDays(newCompleted);
        nextStep();
      } catch (err) {
        setApiError(err.message || "Failed to save audio details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCompletedDays(newCompleted);
      setCurrentDayIndex((prev) => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDayIndex, completedDays, isLastDay, venueData, eventDays, eventId, nextStep]);

  // ── handleBack ────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (currentDayIndex > 0) {
      setErrors({});
      setCurrentDayIndex((prev) => prev - 1);
    } else {
      if (prevStep) prevStep();
    }
  }, [currentDayIndex, prevStep]);

  // ── Register navigation with parent (same as VenueForm / IctsForm) ────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 pb-6">

      {/* Same DayTimeline as VenueForm & IctsForm */}
      <DayTimeline
        days={eventDays}
        currentDayIndex={currentDayIndex}
        completedDays={completedDays}
      />

      <h2 className="text-white text-lg font-bold">
        Audio Details – Day {currentDayIndex + 1}
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

      {/* No venues selected guard — same as IctsForm */}
      {currentVenues.length === 0 ? (
        <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
          <p className="text-gray-400 text-sm">
            No venues were selected for Day {currentDayIndex + 1} in the Venue
            Form. Please go back and select venues first.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {currentVenues.map((venueName, i) => (
            <AudioVenueCard
              key={venueName}
              venueName={venueName}
              index={i + 1}
              data={getCardData(venueName)}
              onChange={(updated) => updateCardData(venueName, updated)}
              errors={errors[venueName] || {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}