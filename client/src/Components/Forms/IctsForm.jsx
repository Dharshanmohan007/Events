import React, { useState, useRef, useEffect, useCallback } from "react";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";
import { DayTimeline } from "./VenueForm";

const BASE_URL = "https://sece-events.onrender.com";

const REQUIREMENTS_OPTIONS = [
  "Chief Guest AV / Stage LED Back Drop",
  "Painter",
  "Wiring patt",
  "Webcam",
];

const INTERNET_FACILITY_OPTIONS = ["LAN", "Wi-Fi", "Both", "Not Required"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateIctsCard(card) {
  const e = {};
  if (!card.desktopLaptop) e.desktopLaptop = "This field is required";
  if (!card.internetFacility) e.internetFacility = "This field is required";
  if (!card.expectedInternetUsers?.trim()) e.expectedInternetUsers = "This field is required";
  if (!card.proctorUsers?.trim()) e.proctorUsers = "This field is required";
  if (!card.guestWifi) e.guestWifi = "This field is required";
  if (card.guestWifi === "Yes" && !card.guestWifiExceed5)
    e.guestWifiExceed5 = "This field is required";
  if (!card.totalGuestCount?.trim()) e.totalGuestCount = "This field is required";
  if (!card.requirements || card.requirements.length === 0)
    e.requirements = "Select at least one requirement";
  return e;
}

function validateDay(dayIndex, venues, latestIctsData) {
  if (!venues || venues.length === 0) return {};
  const dayErrors = {};
  venues.forEach((venueName) => {
    const card = latestIctsData[dayIndex]?.[venueName] || {};
    const cardErrors = validateIctsCard(card);
    if (Object.keys(cardErrors).length > 0) dayErrors[venueName] = cardErrors;
  });
  return dayErrors;
}

function buildIctsPayload(ictsData) {
  const ictses = [];
  Object.entries(ictsData).forEach(([dayIndexStr, venues]) => {
    const dayIndex = parseInt(dayIndexStr);
    Object.entries(venues || {}).forEach(([venueName, card]) => {
      ictses.push({
        dayIndex,
        venueName,
        desktopLaptop: card.desktopLaptop === "Yes",
        internetFacility: card.internetFacility || "",
        expectedInternetUsers: parseInt(card.expectedInternetUsers) || 0,
        proctoringUsers: parseInt(card.proctorUsers) || 0,
        guestWifiNeeded: card.guestWifi === "Yes",
        guestWifiExceed5: card.guestWifiExceed5 === "Yes",
        totalGuestCount: parseInt(card.totalGuestCount) || 0,
        requirements: card.requirements || [],
        otherRequirements: card.others || "",
        specialRequirements: card.specialRequirements || "",
      });
    });
  });
  return { ictses };
}

// ── RequirementsSelect ────────────────────────────────────────────────────────

function RequirementsSelect({ label, selected, onChange, error, labelBg = "#1E1E35" }) {
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
    onChange(selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]);

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
            {REQUIREMENTS_OPTIONS.map((item, i) => {
              const isSelected = selected.includes(item);
              return (
                <div
                  key={i}
                  onClick={() => toggle(item)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"
                  }`}
                >
                  <span>{item}</span>
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

// ── IctsVenueCard ─────────────────────────────────────────────────────────────

function IctsVenueCard({ venueName, index, data, onChange, errors = {} }) {
  const update = (field) => (val) => onChange({ ...data, [field]: val });
  const updateInput = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-purple-400 text-base font-semibold">{venueName}</h3>
        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold">
          {index}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomSelect labelBg="#1E1E35" label="Desktop / Laptop *" value={data.desktopLaptop || ""}
            onChange={update("desktopLaptop")} options={["Yes", "No"]} />
          {errors.desktopLaptop && <p className="text-red-400 text-xs mt-1">{errors.desktopLaptop}</p>}
        </div>
        <div>
          <CustomSelect labelBg="#1E1E35" label="Internet Facility *" value={data.internetFacility || ""}
            onChange={update("internetFacility")} options={INTERNET_FACILITY_OPTIONS} />
          {errors.internetFacility && <p className="text-red-400 text-xs mt-1">{errors.internetFacility}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomInput labelBg="#1E1E35" label="Expected Internet Users *" type="number"
            value={data.expectedInternetUsers || ""} onChange={updateInput("expectedInternetUsers")} />
          {errors.expectedInternetUsers && <p className="text-red-400 text-xs mt-1">{errors.expectedInternetUsers}</p>}
        </div>
        <div>
          <CustomInput labelBg="#1E1E35" label="Proctoring Users *" type="number"
            value={data.proctorUsers || ""} onChange={updateInput("proctorUsers")} />
          {errors.proctorUsers && <p className="text-red-400 text-xs mt-1">{errors.proctorUsers}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomSelect labelBg="#1E1E35" label="Guest WIFI Needed *" value={data.guestWifi || ""}
            onChange={update("guestWifi")} options={["Yes", "No"]} />
          {errors.guestWifi && <p className="text-red-400 text-xs mt-1">{errors.guestWifi}</p>}
        </div>
        {data.guestWifi === "Yes" && (
          <div>
            <CustomSelect labelBg="#1E1E35" label="If guest Wi-Fi Users Exceed 5 *"
              value={data.guestWifiExceed5 || ""} onChange={update("guestWifiExceed5")} options={["Yes", "No"]} />
            {errors.guestWifiExceed5 && <p className="text-red-400 text-xs mt-1">{errors.guestWifiExceed5}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomInput labelBg="#1E1E35" label="Total Number of Guest Count *" type="number"
            value={data.totalGuestCount || ""} onChange={updateInput("totalGuestCount")} />
          {errors.totalGuestCount && <p className="text-red-400 text-xs mt-1">{errors.totalGuestCount}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <RequirementsSelect label="Requirements *" selected={data.requirements || []}
            onChange={(val) => onChange({ ...data, requirements: val })} error={errors.requirements} />
        </div>
        <div>
          <CustomInput labelBg="#1E1E35" label="Others (if applicable)"
            value={data.others || ""} onChange={updateInput("others")} />
        </div>
      </div>

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
            Special Requirements, if any
          </span>
          <textarea
            value={data.specialRequirements || ""}
            onChange={updateInput("specialRequirements")}
            rows={3}
            placeholder="Enter any special requirements..."
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

  const getCardData = (dayIndex, venueName) =>
    ictsData[dayIndex]?.[venueName] || {};

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

  // ── handleNext ────────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    const latestIctsData = ictsDataRef.current;
    const venues = getVenuesForDay(currentDayIndex);

    const dayErrors = validateDay(currentDayIndex, venues, latestIctsData);
    const hasErrors = Object.keys(dayErrors).length > 0;
    setErrors((prev) => ({ ...prev, [currentDayIndex]: dayErrors }));
    if (hasErrors) return;

    setErrors((prev) => ({ ...prev, [currentDayIndex]: {} }));

    // Mark current day as completed immediately
    setCompletedDays((prev) =>
      prev.includes(currentDayIndex) ? prev : [...prev, currentDayIndex]
    );

    if (isLastDay) {
      setIsLoading(true);
      setApiError("");
      try {
        const payload = buildIctsPayload(latestIctsData);
        const response = await fetch(`${BASE_URL}/api/events/${eventId || ""}`, {
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
  }, [currentDayIndex, isLastDay, eventId, nextStep, getVenuesForDay]);

  // ── handleBack ────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex((prev) => prev - 1);
    } else {
      // On day 1, go back to previous form step
      if (prevStep) prevStep();
    }
  }, [currentDayIndex, prevStep]);

  // ── Nav registration — single effect, stable proxy pattern ───────────────
  // We store latest handlers in a ref and expose stable proxies to the parent.
  // This avoids the double-registration bug where the second useEffect
  // (isLoading watcher) would overwrite next/prev with stale closures.
  const navRef = useRef({ next: handleNext, prev: handleBack, isLoading });

  // Keep ref in sync every render
  navRef.current = { next: handleNext, prev: handleBack, isLoading };

  useEffect(() => {
    if (!registerChildNavigation) return;

    // Stable proxies — always delegate to navRef.current
    const stableNext = (...args) => navRef.current.next(...args);
    const stablePrev = (...args) => navRef.current.prev(...args);

    registerChildNavigation({ next: stableNext, prev: stablePrev, isLoading: false });

    return () => registerChildNavigation({ next: null, prev: null, isLoading: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerChildNavigation]); // run once on mount / when registerChildNavigation identity changes

  // Keep parent's isLoading badge in sync without re-registering next/prev
  useEffect(() => {
    if (!registerChildNavigation) return;
    // Re-use the same stable proxies approach — parent reads isLoading from childNav
    registerChildNavigation({
      next: (...args) => navRef.current.next(...args),
      prev: (...args) => navRef.current.prev(...args),
      isLoading,
    });
  }, [isLoading, registerChildNavigation]);

  const currentDayErrors = errors[currentDayIndex] || {};

  // Guard: no days configured
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
    <div className="flex flex-col gap-6 pb-6">
      {/* Timeline uses only the actual eventDays slice */}
      <DayTimeline
        days={eventDays.slice(0, dayCount)}
        currentDayIndex={currentDayIndex}
        completedDays={completedDays}
      />

      <h2 className="text-white text-lg font-bold">
        ICTS Details – Day {currentDayIndex + 1}
      </h2>

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
            />
          ))}
        </div>
      )}
    </div>
  );
}