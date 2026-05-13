import React, { useState, useRef, useEffect, useCallback } from "react";
import CustomInput from "../CustomInput";

const BASE_URL = 'https://sece-events.onrender.com';

const VENUES = [
  { venue: "Main Board Room", capacity: 20 },
  { venue: "Ignite", capacity: 60 },
  { venue: "OAT", capacity: 220 },
  { venue: "Inner Court Yard", capacity: 750 },
  { venue: "GF07", capacity: 60 },
  { venue: "GF10 EPL Lab", capacity: 60 },
  { venue: "Auditorium", capacity: 800 },
  { venue: "Maker Space", capacity: 50 },
  { venue: "ECE Simulation Lab", capacity: 70 },
  { venue: "Full Stack Lab", capacity: 75 },
  { venue: "Intel AI Lab", capacity: 72 },
  { venue: "PG Lab", capacity: 50 },
  { venue: "Code Studio Lab", capacity: 180 },
  { venue: "SF15", capacity: 140 },
  { venue: "Blockchain", capacity: 40 },
  { venue: "IT Project Lab", capacity: 69 },
  { venue: "CSBS Lab", capacity: 72 },
  { venue: "EDA Lab", capacity: 45 },
  { venue: "EEE Simulation Lab", capacity: 70 },
  { venue: "Bytes Lab", capacity: 80 },
  { venue: "Cloud & DevOps Lab", capacity: 0 },
  { venue: "Algo Studio", capacity: 200 },
  { venue: "TF10 ECE Lab", capacity: 60 },
  { venue: "TF11 CCE Lab", capacity: 70 },
  { venue: "BCT", capacity: 40 },
  { venue: "Gyanmatrix", capacity: 35 },
  { venue: "AI Robo Space", capacity: 35 },
  { venue: "AI Lab", capacity: 75 },
  { venue: "NTT Data Lab", capacity: 50 },
  { venue: "MECH CAD Lab", capacity: 75 },
  { venue: "ML Lab", capacity: 70 },
  { venue: "MB101", capacity: 120 },
  { venue: "MB Research Center", capacity: 60 },
  { venue: "Gen AI Lab", capacity: 70 },
  { venue: "Special Lab", capacity: 60 },
  { venue: "Vista Hall", capacity: 264 },
  { venue: "Synapse Studio", capacity: 200 },
  { venue: "Collab Space", capacity: 200 },
  { venue: "Cyber Security Lab", capacity: 70 },
  { venue: "DVA Lab", capacity: 70 },
  { venue: "AI-309", capacity: 120 },
  { venue: "Boys Hostel", capacity: 0 },
  { venue: "Girls Hostel", capacity: 0 },
  { venue: "Sports Ground", capacity: 0 },
  { venue: "ClassRooms", capacity: 70 },
];

const HALL_REQUIREMENTS = [
  "Guest Chair",
  "Water Bottles",
  "Dias Table",
  "Audience Chair",
];

const ErrorMsg = ({ msg }) =>
  msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

function validateVenueCard(card) {
  const e = {};
  if (!card.participants || parseInt(card.participants) < 1)
    e.participants = "Number of participants is required";
  if (!card.seatingCapacity || parseInt(card.seatingCapacity) < 1)
    e.seatingCapacity = "Seating capacity is required";
  if (!card.hallReqs || card.hallReqs.length === 0)
    e.hallReqs = "Select at least one hall requirement";
  if (card.hallReqs?.includes("Guest Chair") && (!card.guestChairs || parseInt(card.guestChairs) < 1))
    e.guestChairs = "Number of guest chairs is required";
  if (card.hallReqs?.includes("Water Bottles") && (!card.waterBottles || parseInt(card.waterBottles) < 1))
    e.waterBottles = "Number of water bottles is required";
  if (card.hallReqs?.includes("Dias Table") && (!card.diasTable || parseInt(card.diasTable) < 1))
    e.diasTable = "Number of dias tables is required";
  if (card.hallReqs?.includes("Audience Chair") && (!card.audienceChair || parseInt(card.audienceChair) < 1))
    e.audienceChair = "Number of audience chairs is required";
  if (!card.specialReqs?.trim())
    e.specialReqs = "Special requirements field is required";
  return e;
}

function validateDay(dayData) {
  const e = {};
  if (!dayData.participants || parseInt(dayData.participants) < 1)
    e.participants = "Total number of participants is required";
  if (!dayData.selectedVenues || dayData.selectedVenues.length === 0)
    e.selectedVenues = "Please select at least one venue";
  if (dayData.selectedVenues?.length > 0) {
    const cards = dayData.venueCards || [];
    const cardErrors = cards.map((card) => validateVenueCard(card));
    if (cardErrors.some((ce) => Object.keys(ce).length > 0))
      e.venueCards = cardErrors;
  }
  return e;
}

function buildVenuePayload(venueData) {
  const totalParticipants = venueData.reduce((sum, day) => {
    return sum + (parseInt(day.participants) || 0);
  }, 0);

  const venues = [];
  venueData.forEach((day, dayIndex) => {
    (day.venueCards || []).forEach((card) => {
      const hallRequirements = [];
      if (card.hallReqs?.includes("Guest Chair") && card.guestChairs)
        hallRequirements.push({ type: "Guest Chair", quantity: parseInt(card.guestChairs) });
      if (card.hallReqs?.includes("Water Bottles") && card.waterBottles)
        hallRequirements.push({ type: "Water Bottles", quantity: parseInt(card.waterBottles) });
      if (card.hallReqs?.includes("Dias Table") && card.diasTable)
        hallRequirements.push({ type: "Dias Table", quantity: parseInt(card.diasTable) });
      if (card.hallReqs?.includes("Audience Chair") && card.audienceChair)
        hallRequirements.push({ type: "Audience Chair", quantity: parseInt(card.audienceChair) });

      venues.push({
        dayIndex,
        venueName: card.venueName || "",
        numberOfParticipants: parseInt(card.participants) || 0,
        seatingCapacity: parseInt(card.seatingCapacity) || 0,
        hallRequirements,
        specialRequirements: card.specialReqs || "",
      });
    });
  });

  return { totalParticipants, venues };
}

function MultiVenueSelect({ label, options, selected, onChange, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (venue) => {
    onChange(
      selected.includes(venue)
        ? selected.filter((v) => v !== venue)
        : [...selected, venue]
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
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#16162A] z-10 pointer-events-none">
          {label}
        </span>
        <div
          onClick={() => setOpen(!open)}
          className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"
            }`}
        >
          <span className={selected.length ? "text-white text-sm" : "text-gray-500 text-sm"}>
            {displayText || "Select venues..."}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-60 overflow-y-auto custom-scrollbar">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">No venues available for this capacity</div>
            ) : (
              options.map((opt, i) => {
                const isSelected = selected.includes(opt.venue);
                return (
                  <div key={i} onClick={() => toggle(opt.venue)} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between gap-2 ${isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"}`}>
                    <span>{opt.venue}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">Cap: {opt.capacity === 0 ? "Open" : opt.capacity}</span>
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <ErrorMsg msg={error} />
    </div>
  );
}

function HallRequirementsSelect({ label, selected, onChange, error }) {
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
    onChange(selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]);
  };

  return (
    <div className="w-full" ref={ref}>
      <div className="relative w-full">
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">{label}</span>
        <div onClick={() => setOpen(!open)} className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"}`}>
          <span className={selected.length ? "text-white text-sm truncate max-w-[85%]" : "text-gray-500 text-sm"}>
            {selected.length ? selected.join(" / ") : "Select requirements..."}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
            {HALL_REQUIREMENTS.map((item, i) => {
              const isSelected = selected.includes(item);
              return (
                <div key={i} onClick={() => toggle(item)} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"}`}>
                  <span>{item}</span>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ErrorMsg msg={error} />
    </div>
  );
}

function VenueDetailCard({ venueName, venueCapacity, index, data, onChange, errors = {} }) {
  const showGuestChair = data.hallReqs?.includes("Guest Chair");
  const showWaterBottles = data.hallReqs?.includes("Water Bottles");
  const showDiasTable = data.hallReqs?.includes("Dias Table");
  const showAudienceChair = data.hallReqs?.includes("Audience Chair");

  const update = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-purple-400 text-base font-semibold">{venueName}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-[#2A2A45] px-2 py-1 rounded-full">
            Capacity: {venueCapacity === 0 ? "Open" : venueCapacity}
          </span>
          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold">{index}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomInput labelBg="#1E1E35" label="Number of Participants *" type="number" value={data.participants || ""} onChange={update("participants")} />
          <ErrorMsg msg={errors.participants} />
        </div>
        <div>
          <CustomInput labelBg="#1E1E35" label="Number of Seating Capacity Required *" type="number" value={data.seatingCapacity || ""} onChange={update("seatingCapacity")} />
          <ErrorMsg msg={errors.seatingCapacity} />
        </div>
      </div>

      <div>
        <HallRequirementsSelect label="Hall Requirements *" selected={data.hallReqs || []} onChange={(val) => onChange({ ...data, hallReqs: val })} error={errors.hallReqs} />
      </div>

      {(showGuestChair || showWaterBottles || showDiasTable || showAudienceChair) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {showGuestChair && (
            <div>
              <CustomInput labelBg="#1E1E35" label="No. of Guest Chair *" type="number" value={data.guestChairs || ""} onChange={update("guestChairs")} />
              <ErrorMsg msg={errors.guestChairs} />
            </div>
          )}
          {showWaterBottles && (
            <div>
              <CustomInput labelBg="#1E1E35" label="No. of Water Bottles *" type="number" value={data.waterBottles || ""} onChange={update("waterBottles")} />
              <ErrorMsg msg={errors.waterBottles} />
            </div>
          )}
          {showDiasTable && (
            <div>
              <CustomInput labelBg="#1E1E35" label="No. of Dias Table *" type="number" value={data.diasTable || ""} onChange={update("diasTable")} />
              <ErrorMsg msg={errors.diasTable} />
            </div>
          )}
          {showAudienceChair && (
            <div>
              <CustomInput labelBg="#1E1E35" label="No. of Audience Chair *" type="number" value={data.audienceChair || ""} onChange={update("audienceChair")} />
              <ErrorMsg msg={errors.audienceChair} />
            </div>
          )}
        </div>
      )}

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
            Special Requirements, if any *
          </span>
          <textarea
            value={data.specialReqs || ""}
            onChange={update("specialReqs")}
            rows={3}
            placeholder="Enter any special requirements..."
            className={`w-full bg-transparent border ${errors.specialReqs ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`}
          />
        </div>
        <ErrorMsg msg={errors.specialReqs} />
      </div>
    </div>
  );
}

export function DayTimeline({ days, currentDayIndex, completedDays }) {
  if (!days || days.length === 0) return null;

  return (
    <div className="w-full flex justify-center mb-8">
      <div className="flex items-center justify-center">
        {days.map((day, index) => {
          const isCompleted = completedDays.includes(index);
          const isCurrent = index === currentDayIndex;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center min-w-[140px]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${isCompleted ? "bg-purple-600 border-purple-600 text-white" : isCurrent ? "border-purple-500 text-purple-400" : "border-gray-600 text-gray-500"}`}>
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    `0${index + 1}`
                  )}
                </div>
                {day.date && (
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-semibold ${isCompleted ? "text-purple-400" : isCurrent ? "text-purple-300" : "text-gray-400"}`}>
                      {day.date}
                    </p>
                    {day.startTime && day.endTime && (
                      <p className={`text-xs ${isCompleted ? "text-purple-400" : isCurrent ? "text-purple-300" : "text-gray-500"}`}>
                        ({day.startTime} - {day.endTime})
                      </p>
                    )}
                  </div>
                )}
              </div>
              {index < days.length - 1 && (
                <div className={`h-[2px] flex-1 mx-2 transition-all duration-300 ${isCompleted ? "bg-purple-500" : "bg-gray-600"}`} style={{ minWidth: "60px" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function VenueForm({ nextStep, prevStep, registerChildNavigation, eventDays = [], venueData: initialVenueData = [], onVenueDataChange, eventId }) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [venueData, setVenueData] = useState(() =>
    initialVenueData.length > 0
      ? initialVenueData
      : eventDays.map(() => ({
          participants: "",
          selectedVenues: [],
          othersText: "",
          venueCards: [],
        }))
  );

  // ── FIX: ref that always holds the latest venueData ──────────────────────
  const venueDataRef = useRef(venueData);
  useEffect(() => {
    venueDataRef.current = venueData;
  }, [venueData]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (initialVenueData.length > 0) {
      setVenueData(initialVenueData);
      return;
    }

    setVenueData((prev) => {
      const nextDays = eventDays.length;
      const updated = [...prev].slice(0, nextDays);
      while (updated.length < nextDays) {
        updated.push({
          participants: "",
          selectedVenues: [],
          othersText: "",
          venueCards: [],
        });
      }
      return updated;
    });
  }, [eventDays.length]);

  useEffect(() => {
    if (onVenueDataChange) {
      onVenueDataChange(venueData);
    }
  }, [venueData, onVenueDataChange]);

  const currentDay = venueData[currentDayIndex];
  const currentErrors = errors[currentDayIndex] || {};
  const participantCount = parseInt(currentDay?.participants) || 0;

  const isLastDay = currentDayIndex === eventDays.length - 1;

  const eligibleVenues = VENUES.filter(
    (v) => v.capacity === 0 || v.capacity >= participantCount
  );

  const updateCurrentDay = (newData) => {
    setVenueData((prev) => {
      const updated = [...prev];
      updated[currentDayIndex] = {
        ...updated[currentDayIndex],
        ...newData,
      };
      return updated;
    });

    setErrors((prev) => {
      const updatedErrors = { ...prev };
      const currentDayErrors = { ...(updatedErrors[currentDayIndex] || {}) };
      Object.keys(newData).forEach((field) => {
        delete currentDayErrors[field];
      });
      updatedErrors[currentDayIndex] = currentDayErrors;
      return updatedErrors;
    });
  };

  const handleVenueSelection = (selectedVenues) => {
    const existingCards = currentDay.venueCards || [];

    const updatedCards = selectedVenues.map((name) => {
      const existing = existingCards.find((c) => c.venueName === name);
      return (
        existing || {
          venueName: name,
          participants: "",
          seatingCapacity: "",
          hallReqs: [],
          guestChairs: "",
          waterBottles: "",
          diasTable: "",
          audienceChair: "",
          specialReqs: "",
        }
      );
    });

    setVenueData((prev) => {
      const updated = [...prev];
      updated[currentDayIndex] = {
        ...updated[currentDayIndex],
        selectedVenues,
        venueCards: updatedCards,
      };
      return updated;
    });

    setErrors((prev) => {
      const updatedErrors = { ...prev };
      const currentDayErrors = updatedErrors[currentDayIndex] || {};
      delete currentDayErrors.selectedVenues;
      updatedErrors[currentDayIndex] = currentDayErrors;
      return updatedErrors;
    });
  };

  const updateVenueCard = (cardIndex, updated) => {
    setVenueData((prev) => {
      const data = [...prev];
      const cards = [...(data[currentDayIndex].venueCards || [])];
      cards[cardIndex] = updated;
      data[currentDayIndex] = { ...data[currentDayIndex], venueCards: cards };
      return data;
    });
  };

  // ── FIX: handleNext now reads venueDataRef.current instead of venueData ──
  const handleNext = useCallback(async () => {
    const latestVenueData = venueDataRef.current;
    const dayData = latestVenueData[currentDayIndex];
    const dayErrors = validateDay(dayData);
    const hasErrors = Object.keys(dayErrors).length > 0;
    setErrors((prev) => ({ ...prev, [currentDayIndex]: dayErrors }));

    if (hasErrors) return;

    const newCompleted = completedDays.includes(currentDayIndex)
      ? completedDays
      : [...completedDays, currentDayIndex];

    if (isLastDay) {
      setIsLoading(true);
      setApiError("");
      try {
        const payload = buildVenuePayload(latestVenueData);
        const id = eventId || '';
        const response = await fetch(`${BASE_URL}/api/events/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ venueDetails: payload }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Server error: ${response.status}`);
        setCompletedDays(newCompleted);
        nextStep();
      } catch (err) {
        setApiError(err.message || "Failed to save venue details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCompletedDays(newCompleted);
      setCurrentDayIndex((prev) => prev + 1);
    }
  }, [currentDayIndex, completedDays, isLastDay, eventId, nextStep]);
  // ─────────────────────────────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex((prev) => prev - 1);
    } else {
      prevStep();
    }
  }, [currentDayIndex, prevStep]);

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

  const selectedVenueObjects = (currentDay.selectedVenues || [])
    .map((name) => VENUES.find((v) => v.venue === name))
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6 pb-6">
      <DayTimeline days={eventDays} currentDayIndex={currentDayIndex} completedDays={completedDays} />

      <h2 className="text-white text-lg font-bold">
        Venue Details – Day {currentDayIndex + 1}
      </h2>

      {(apiError || Object.keys(currentErrors).length > 0) && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="text-red-400 text-sm">
            {apiError && <p>{apiError}</p>}
            {Object.keys(currentErrors).length > 0 && (
              <div>
                {currentErrors.participants && <p>• {currentErrors.participants}</p>}
                {currentErrors.selectedVenues && <p>• {currentErrors.selectedVenues}</p>}
                {currentErrors.venueCards && <p>• Please fill in all required fields for each venue</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <CustomInput
        label="Total Number of Participants *"
        type="number"
        value={currentDay.participants}
        onChange={(e) =>
          updateCurrentDay({ participants: e.target.value })
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MultiVenueSelect
          label="Venue Required *"
          options={participantCount > 0 ? eligibleVenues : VENUES}
          selected={currentDay.selectedVenues}
          onChange={handleVenueSelection}
          error={
            currentErrors.selectedVenues &&
            currentDay.selectedVenues.length === 0
              ? currentErrors.selectedVenues
              : ""
          }
        />
        <div>
          <div className="relative">
            <span className="absolute left-3 -top-[9px] text-xs text-white bg-[#16162A] px-1 z-10">Others</span>
            <input value={currentDay.othersText} onChange={(e) => updateCurrentDay({ othersText: e.target.value })} className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500" />
          </div>
        </div>
      </div>

      {selectedVenueObjects.length > 0 && (
        <div className="flex flex-col gap-4">
          {selectedVenueObjects.map((v, i) => (
            <VenueDetailCard
              key={v.venue}
              venueName={v.venue}
              venueCapacity={v.capacity}
              index={i + 1}
              data={currentDay.venueCards?.[i] || {}}
              onChange={(updated) => updateVenueCard(i, updated)}
              errors={(currentErrors.venueCards && currentErrors.venueCards[i]) || {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}