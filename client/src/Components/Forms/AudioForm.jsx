import React, { useState, useRef, useEffect, useCallback } from "react";
import CustomInput from "../CustomInput";
import { DayTimeline } from "./VenueForm";
import VenueInfoPopup from "./VenueInfoPopup";


const AUDIO_KEY_META = [
  { key: "handMic",          label: "Hand Mic" },
  { key: "collarMic",        label: "Collar Mic" },
  { key: "handSpeaker",      label: "Hand Speaker" },
  { key: "podiumWithMic",    label: "Podium With Mic" },
  { key: "wiredMic",         label: "Wired Mic" },
  { key: "speakerWithMixer", label: "Speaker w/ Mixer" },
  { key: "paSystem",         label: "PA System" },
];

function defaultVenueSection() {
  return {
    audioRequired: [],
    quantities: {},
    others: "",
    specialRequirements: "",
  };
}

/** Returns the maximum available count for a given equipment key at a venue. */
function getMaxForKey(venueName, key, venueInfoMap) {
  const info = venueInfoMap?.[venueName?.toLowerCase()];
  if (!info || !info.audio) return Infinity;
  const val = info.audio[key];
  return val !== undefined && val !== null ? Number(val) : Infinity;
}

function venueInfoLoaded(venueName, venueInfoMap) {
  return Object.keys(venueInfoMap || {}).length > 0;
}

function validateDay(dayVenues, dayData, venueInfoMap) {
  if (!dayVenues || dayVenues.length === 0) return {};
  const errors = {};
  dayVenues.forEach((venueName) => {
    const s = dayData?.[venueName] || defaultVenueSection();
    const ve = {};

    if (!venueInfoLoaded(venueName, venueInfoMap)) return;

    const hasEquipment = getAvailableAudioForVenue(venueName, venueInfoMap).length > 0;

    if (!hasEquipment) return;

    if (!s.audioRequired || s.audioRequired.length === 0)
      ve.audioRequired = "Select at least one audio requirement";

    (s.audioRequired || []).forEach((key) => {
      const qty = s.quantities?.[key];
      const qtyNum = parseInt(qty);
      const max = getMaxForKey(venueName, key, venueInfoMap);
      const label = AUDIO_KEY_META.find(m => m.key === key)?.label || key;

      if (qty === "" || qty === undefined || isNaN(qtyNum) || qtyNum < 1) {
        ve[`qty_${key}`] = `Quantity required for ${label}`;
      } else if (isFinite(max) && qtyNum > max) {
        ve[`qty_${key}`] = `Only ${max} ${label}${max === 1 ? "" : "s"} available at this venue`;
      }
    });

    if (Object.keys(ve).length > 0) errors[venueName] = ve;
  });
  return errors;
}

function getAvailableAudioForVenue(venueName, venueInfoMap) {
  const info = venueInfoMap?.[venueName?.toLowerCase()];
  if (!info || !info.audio) return [];
  return AUDIO_KEY_META.filter(({ key }) => (info.audio[key] ?? 0) > 0);
}

function buildAudioPayload(audioData, eventDays, venueData, venueInfoMap) {
  const audios = [];
  eventDays.forEach((_day, dayIndex) => {
    const venueNames = venueData[dayIndex]?.selectedVenues || [];
    venueNames.forEach((venueName) => {
      const hasEquipment = getAvailableAudioForVenue(venueName, venueInfoMap).length > 0;
      if (!hasEquipment) return;

      const s = audioData[dayIndex]?.[venueName] || defaultVenueSection();

      if (!s.audioRequired || s.audioRequired.length === 0) return;

      const audioItems = (s.audioRequired || []).map((key) => ({
        type: AUDIO_KEY_META.find(m => m.key === key)?.label || key,
        quantity: parseInt(s.quantities?.[key] || 0),
      })).filter(item => item.quantity > 0);

      audios.push({
        dayIndex,
        venueName,
        audioItems,
        audioRequirements: s.audioRequired || [],
        quantities: s.quantities || {},
        otherRequirements: s.others || "",
        specialRequirements: s.specialRequirements || "",
      });
    });
  });
  return { audios };
}

function AudioRequirementsSelect({
  selected = [],
  onChange,
  error,
  labelBg = "#1E1E35",
  availableOptions = [],
  hasNoEquipment = false,
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

  const toggle = (key) => {
    onChange(
      selected.includes(key)
        ? selected.filter((v) => v !== key)
        : [...selected, key]
    );
  };

  const displayText =
    selected.length === 0
      ? ""
      : selected.length <= 2
      ? selected.map(k => AUDIO_KEY_META.find(m => m.key === k)?.label || k).join(" / ")
      : `${AUDIO_KEY_META.find(m => m.key === selected[0])?.label} / ${AUDIO_KEY_META.find(m => m.key === selected[1])?.label} +${selected.length - 2} more`;

  if (hasNoEquipment) {
    return (
      <div className="w-full">
        <div className="relative w-full">
          <span
            className="absolute left-3 -top-[9px] text-xs text-gray-500 px-1 z-10 pointer-events-none"
            style={{ backgroundColor: labelBg }}
          >
            Audio Requirements
          </span>
          <div className="w-full bg-transparent border border-[#3A3A5A] rounded-lg p-4 flex items-center justify-between cursor-not-allowed opacity-50">
            <span className="text-gray-500 text-sm">Select requirements...</span>
            <svg
              xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="text-gray-600 flex-shrink-0"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

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
            open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"
          }`}
        >
          <span className={`text-sm truncate max-w-[85%] ${selected.length ? "text-white" : "text-gray-500"}`}>
            {displayText || "Select requirements..."}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
            {availableOptions.map(({ key, label }) => {
              const isSelected = selected.includes(key);
              return (
                <div
                  key={key}
                  onClick={() => toggle(key)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"
                  }`}
                >
                  <span>{label}</span>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

// ── EquipmentQuantityInputs — smart odd/even layout ───────────────────────────

function EquipmentQuantityInputs({
  selectedKeys,
  quantities,
  onChange,
  errors = {},
  labelBg = "#1E1E35",
  venueName,
  venueInfoMap,
}) {
  if (!selectedKeys || selectedKeys.length === 0) return null;

  const isOdd = selectedKeys.length % 2 !== 0;

  const handleChange = (key, rawValue) => {
    onChange({ ...quantities, [key]: rawValue });
  };

  // Allowed keys: digits, backspace, delete, tab, arrows, home, end
  const handleKeyDown = (e, key) => {
    const allowedKeys = [
      "Backspace", "Delete", "Tab", "Home", "End",
      "ArrowLeft", "ArrowRight",
    ];
    // Block anything that isn't a digit or an allowed control key
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      // Allow ArrowUp / ArrowDown but override their behaviour
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const current = parseInt(quantities?.[key]) || 0;
        const max = getMaxForKey(venueName, key, venueInfoMap);
        const next = isFinite(max) ? Math.min(max, current + 1) : current + 1;
        handleChange(key, String(next));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const current = parseInt(quantities?.[key]) || 0;
        handleChange(key, String(Math.max(0, current - 1)));
      } else {
        e.preventDefault(); // block minus, e, +, etc.
      }
    }
  };

  const handleInputChange = (key, e) => {
    const raw = e.target.value;
    // Allow empty string so user can clear the field
    if (raw === "") {
      handleChange(key, "");
      return;
    }
    const parsed = parseInt(raw);
    if (isNaN(parsed)) return;
    // Never allow negative
    handleChange(key, String(Math.max(0, parsed)));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {selectedKeys.map((key, idx) => {
        const meta = AUDIO_KEY_META.find(m => m.key === key);
        const label = meta?.label || key;
        const isLastOdd = isOdd && idx === selectedKeys.length - 1;
        const max = getMaxForKey(venueName, key, venueInfoMap);
        const currentQty = parseInt(quantities?.[key]);
        const exceedsMax = isFinite(max) && !isNaN(currentQty) && currentQty > max;

        const hasError = !!(errors[`qty_${key}`] || exceedsMax);

        return (
          <div key={key} className={isLastOdd ? "sm:col-span-2" : ""}>
            {/* Red border overlay when error — sits on top of CustomInput's own border */}
            <div className={`relative rounded-lg ${hasError ? "ring-1 ring-red-400" : ""}`}>
              <CustomInput
                labelBg={labelBg}
                label={`${label} Quantity *`}
                type="number"
                min={0}
                max={isFinite(max) ? max : undefined}
                value={quantities?.[key] || ""}
                onChange={(e) => handleInputChange(key, e)}
                onKeyDown={(e) => handleKeyDown(e, key)}
                error={hasError}
              />
            </div>

            {/* Error / hint line */}
            {errors[`qty_${key}`] ? (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors[`qty_${key}`]}
              </p>
            ) : exceedsMax ? (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Only {max} {label}{max === 1 ? "" : "s"} available — add extra needs in Special Requirements
              </p>
            ) : isFinite(max) ? (
              <p className="text-gray-500 text-xs mt-1">
                Max available: {max}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function InfoButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="View venue info"
      className="w-7 h-7 rounded-full flex items-center justify-center bg-[#2C2C3E] text-purple-400 hover:text-white hover:bg-purple-600/40 transition-all border border-purple-500/30"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="8" strokeLinecap="round" />
        <line x1="12" y1="11" x2="12" y2="17" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function AudioVenueCard({
  venueName,
  index,
  data,
  onChange,
  errors = {},
  venueInfoMap,
  onShowInfo,
}) {
  const updateField = (field, val) => onChange({ ...data, [field]: val });

  const availableOptions = getAvailableAudioForVenue(venueName, venueInfoMap);
  const hasNoEquipment = availableOptions.length === 0;

  const handleAudioChange = (newSelected) => {
    const newQuantities = { ...(data.quantities || {}) };
    Object.keys(newQuantities).forEach((k) => {
      if (!newSelected.includes(k)) delete newQuantities[k];
    });
    onChange({ ...data, audioRequired: newSelected, quantities: newQuantities });
  };

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-purple-400 text-base font-semibold">{venueName}</h3>
          {hasNoEquipment && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#2C2C3E] text-gray-400 border border-[#3A3A5A]">
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              No equipment available
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <InfoButton onClick={() => onShowInfo(venueName)} />
        </div>
      </div>

      {/* Audio Requirements Dropdown + Others */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AudioRequirementsSelect
            selected={data.audioRequired || []}
            onChange={handleAudioChange}
            error={errors.audioRequired}
            availableOptions={availableOptions}
            hasNoEquipment={hasNoEquipment}
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

      {/* Dynamic quantity inputs — smart odd/even grid */}
      {!hasNoEquipment && (data.audioRequired || []).length > 0 && (
        <EquipmentQuantityInputs
          selectedKeys={data.audioRequired || []}
          quantities={data.quantities || {}}
          onChange={(newQty) => updateField("quantities", newQty)}
          errors={errors}
          venueName={venueName}
          venueInfoMap={venueInfoMap}
        />
      )}

      {/* Special Requirements */}
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

export default function AudioForm({
  nextStep,
  prevStep,
  registerChildNavigation,
  audioData: initialAudioData,
  onAudioDataChange,
  eventId,
  errors: propErrors = {},
  eventDays = [],
  venueData = [],
}) {
  const dayCount = eventDays.length;

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedDays, setCompletedDays]     = useState([]);
  const [errors, setErrors]                   = useState({});
  const [isLoading, setIsLoading]             = useState(false);
  const [apiError, setApiError]               = useState("");
  const [audioData, setAudioData]             = useState(() => initialAudioData || {});

  const [venueInfoMap, setVenueInfoMap]         = useState({});
  const [venueInfoLoading, setVenueInfoLoading] = useState(false);

  const [popupVenue, setPopupVenue] = useState(null);

  const audioDataRef = useRef(audioData);
  useEffect(() => { audioDataRef.current = audioData; }, [audioData]);

  const onAudioDataChangeRef = useRef(onAudioDataChange);
  useEffect(() => { onAudioDataChangeRef.current = onAudioDataChange; }, [onAudioDataChange]);

  useEffect(() => {
    if (initialAudioData && Object.keys(initialAudioData).length > 0) {
      setAudioData(initialAudioData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchVenues = async () => {
      setVenueInfoLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/venues`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          const map = {};
          data.forEach((v) => {
            if (v.venue) map[v.venue.toLowerCase()] = v;
          });
          setVenueInfoMap(map);
        }
      } catch (err) {
        console.error("Failed to load venue info:", err);
      } finally {
        if (!cancelled) setVenueInfoLoading(false);
      }
    };
    fetchVenues();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (onAudioDataChangeRef.current) onAudioDataChangeRef.current(audioData);
  }, [audioData]);

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

  const isLastDay = currentDayIndex === Math.max(dayCount - 1, 0);

  const handleNext = useCallback(async () => {
    const latestAudioData = audioDataRef.current;
    const venues = getVenuesForDay(currentDayIndex);

    if (venueInfoLoading) {
      setErrors({});
    } else {
      const dayErrors = validateDay(venues, latestAudioData[currentDayIndex], venueInfoMap);
      const hasErrors = Object.keys(dayErrors).length > 0;
      setErrors(hasErrors ? dayErrors : {});
      if (hasErrors) return;
    }

    setCompletedDays((prev) =>
      prev.includes(currentDayIndex) ? prev : [...prev, currentDayIndex]
    );

    if (isLastDay) {
      setIsLoading(true);
      setApiError("");
      try {
        const payload = buildAudioPayload(latestAudioData, eventDays, venueData, venueInfoMap);
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/events/${eventId || ""}`, {
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
        nextStep();
      } catch (err) {
        setApiError(err.message || "Failed to save audio details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors({});
      setCurrentDayIndex((prev) => prev + 1);
    }
  }, [currentDayIndex, isLastDay, eventDays, venueData, eventId, nextStep, getVenuesForDay, venueInfoMap, venueInfoLoading]);

  const handleBack = useCallback(() => {
    if (currentDayIndex > 0) {
      setErrors({});
      setCurrentDayIndex((prev) => prev - 1);
    } else {
      if (prevStep) prevStep();
    }
  }, [currentDayIndex, prevStep]);

  const navRef = useRef({ next: handleNext, prev: handleBack, isLoading });
  navRef.current = { next: handleNext, prev: handleBack, isLoading };

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
      next: (...args) => navRef.current.next(...args),
      prev: (...args) => navRef.current.prev(...args),
      isLoading,
    });
  }, [isLoading, registerChildNavigation]);

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
      <div className="flex flex-col gap-6 pb-6">
        <DayTimeline
          days={eventDays.slice(0, dayCount)}
          currentDayIndex={currentDayIndex}
          completedDays={completedDays}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-bold">Audio Details</h2>
          {venueInfoLoading && (
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <div className="w-3.5 h-3.5 rounded-full border border-gray-500 border-t-transparent animate-spin" />
              Loading venue data…
            </div>
          )}
        </div>

        {apiError && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-red-400 text-sm">{apiError}</p>
          </div>
        )}

        {currentVenues.length === 0 ? (
          <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
            <p className="text-gray-400 text-sm">
              No venues were selected for Day {currentDayIndex + 1} in the Venue Form.
              You can still proceed — Audio details are only required for days that have venues.
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
                venueInfoMap={venueInfoMap}
                onShowInfo={(name) => setPopupVenue(name)}
              />
            ))}
          </div>
        )}
      </div>

      {popupVenue && (
        <VenueInfoPopup
          venueName={popupVenue}
          onClose={() => setPopupVenue(null)}
        />
      )}
    </>
  );
}