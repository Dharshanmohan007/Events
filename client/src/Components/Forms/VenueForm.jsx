import React, { useState, useRef, useEffect } from "react";
import CustomInput from "../CustomInput";

// ─── Venue Data ────────────────────────────────────────────────────────────────
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

// ─── Multi-Select Venue Dropdown ───────────────────────────────────────────────
function MultiVenueSelect({ label, options, selected, onChange }) {
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
    if (selected.includes(venue)) {
      onChange(selected.filter((v) => v !== venue));
    } else {
      onChange([...selected, venue]);
    }
  };

  const displayText =
    selected.length === 0
      ? ""
      : selected.length <= 2
      ? selected.join(" / ")
      : `${selected[0]} / ${selected[1]} +${selected.length - 2} more`;

  return (
    <div className="relative w-full" ref={ref}>
      <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#16162A] z-10 pointer-events-none">
        {label}
      </span>
      <div
        onClick={() => setOpen(!open)}
        className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${
          open ? "border-purple-500" : "border-[#3A3A5A]"
        }`}
      >
        <span className={selected.length ? "text-white text-sm" : "text-gray-500 text-sm"}>
          {displayText || "Select venues..."}
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
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-60 overflow-y-auto custom-scrollbar">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">
              No venues available for this capacity
            </div>
          ) : (
            options.map((opt, i) => {
              const isSelected = selected.includes(opt.venue);
              return (
                <div
                  key={i}
                  onClick={() => toggle(opt.venue)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-purple-600/30 text-white"
                      : "text-white hover:bg-purple-500/20"
                  }`}
                >
                  <span>{opt.venue}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      Cap: {opt.capacity === 0 ? "Open" : opt.capacity}
                    </span>
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
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Hall Requirements Multi-Select ───────────────────────────────────────────
const HALL_REQUIREMENTS = [
  "Guest Chair",
  "Water Bottles",
  "Dias Table",
  "Audience Chair",
  "Projector",
  "Whiteboard",
  "Podium",
  "Sound System",
];

function HallRequirementsSelect({ label, selected, onChange }) {
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
    if (selected.includes(item)) {
      onChange(selected.filter((v) => v !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const displayText =
    selected.length === 0 ? "" : selected.join(" / ");

  return (
    <div className="relative w-full" ref={ref}>
      <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
        {label}
      </span>
      <div
        onClick={() => setOpen(!open)}
        className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${
          open ? "border-purple-500" : "border-[#3A3A5A]"
        }`}
      >
        <span className={selected.length ? "text-white text-sm truncate max-w-[85%]" : "text-gray-500 text-sm"}>
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
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
          {HALL_REQUIREMENTS.map((item, i) => {
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
  );
}

// ─── Individual Venue Detail Card ──────────────────────────────────────────────
function VenueDetailCard({ venueName, venueCapacity, index }) {
  const [hallReqs, setHallReqs] = useState([]);
  const [participants, setParticipants] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("");
  const [guestChairs, setGuestChairs] = useState("");
  const [waterBottles, setWaterBottles] = useState("");
  const [diasTable, setDiasTable] = useState("");
  const [specialReqs, setSpecialReqs] = useState("");

  const showGuestChair = hallReqs.includes("Guest Chair");
  const showWaterBottles = hallReqs.includes("Water Bottles");
  const showDiasTable = hallReqs.includes("Dias Table");

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-purple-400 text-base font-semibold">{venueName}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-[#2A2A45] px-2 py-1 rounded-full">
            Capacity: {venueCapacity === 0 ? "Open" : venueCapacity}
          </span>
          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold">
            {index}
          </div>
        </div>
      </div>

      {/* Participants & Seating */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput
          label="Number of Participants *"
          type="number"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
        />
        <CustomInput
          label="Number of Seating Capacity Required *"
          type="number"
          value={seatingCapacity}
          onChange={(e) => setSeatingCapacity(e.target.value)}
        />
      </div>

      {/* Hall Requirements Multi-Select */}
      <HallRequirementsSelect
        label="Hall Requirements *"
        selected={hallReqs}
        onChange={setHallReqs}
      />

      {/* Conditional Fields based on Hall Requirements */}
      {(showGuestChair || showWaterBottles || showDiasTable) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {showGuestChair && (
            <CustomInput
              label="No. of Guest Chair *"
              type="number"
              value={guestChairs}
              onChange={(e) => setGuestChairs(e.target.value)}
            />
          )}
          {showWaterBottles && (
            <CustomInput
              label="No. of Water Bottles *"
              type="number"
              value={waterBottles}
              onChange={(e) => setWaterBottles(e.target.value)}
            />
          )}
          {showDiasTable && (
            <CustomInput
              label="No. of Dias Table *"
              type="number"
              value={diasTable}
              onChange={(e) => setDiasTable(e.target.value)}
            />
          )}
        </div>
      )}

      {/* Special Requirements */}
      <div className="relative w-full">
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
          Special Requirements, if any *
        </span>
        <textarea
          value={specialReqs}
          onChange={(e) => setSpecialReqs(e.target.value)}
          rows={3}
          placeholder="Enter any special requirements..."
          className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600"
        />
      </div>
    </div>
  );
}

// ─── Day Timeline Header ───────────────────────────────────────────────────────
function DayTimeline({ days }) {
  if (!days || days.length === 0) return null;

  return (
    <div className="flex items-center gap-0 mb-6 overflow-x-auto pb-2">
      {days.map((day, index) => {
        const isCompleted = index < 2; // visual mock — first 2 completed
        const isCurrent = index === 2;

        return (
          <React.Fragment key={index}>
            {/* Node */}
            <div className="flex flex-col items-center flex-shrink-0 min-w-[120px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                  isCompleted
                    ? "bg-purple-600 border-purple-600 text-white"
                    : isCurrent
                    ? "bg-transparent border-gray-500 text-gray-400"
                    : "bg-transparent border-gray-600 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  `0${index + 1}`
                )}
              </div>
              {day.date && (
                <div className="mt-1 text-center">
                  <p className={`text-xs font-semibold ${isCompleted ? "text-purple-400" : "text-gray-400"}`}>
                    {day.date}
                  </p>
                  {day.startTime && day.endTime && (
                    <p className={`text-xs ${isCompleted ? "text-purple-400/70" : "text-gray-500"}`}>
                      ({day.startTime} - {day.endTime})
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Connector */}
            {index < days.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 ${
                  index < 1 ? "bg-purple-500" : "bg-gray-600"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main VenueForm Component ──────────────────────────────────────────────────
export default function VenueForm({ nextStep, prevStep, eventDays = [] }) {
  const [totalParticipants, setTotalParticipants] = useState("");
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [othersText, setOthersText] = useState("");

  // Filter venues based on participant count
  const participantCount = parseInt(totalParticipants) || 0;

  const eligibleVenues = VENUES.filter(
    (v) => v.capacity === 0 || v.capacity >= participantCount
  );

  // When participant count changes, remove venues that are no longer eligible
  const handleParticipantsChange = (e) => {
    const val = e.target.value;
    setTotalParticipants(val);
    const count = parseInt(val) || 0;
    const eligible = VENUES.filter((v) => v.capacity === 0 || v.capacity >= count).map((v) => v.venue);
    setSelectedVenues((prev) => prev.filter((v) => eligible.includes(v)));
  };

  const selectedVenueObjects = selectedVenues.map((name) =>
    VENUES.find((v) => v.venue === name)
  );

  // Demo days — in real usage, these come from props (eventDays)
  const days =
    eventDays.length > 0
      ? eventDays
      : [
          { date: "25-03-2026", startTime: "10:30 AM", endTime: "12:00PM" },
          { date: "25-03-2026", startTime: "10:30 AM", endTime: "12:00PM" },
          { date: "25-03-2026", startTime: "10:30 AM", endTime: "12:00PM" },
          { date: "25-03-2026", startTime: "10:30 AM", endTime: "12:00PM" },
        ];

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Day Timeline */}
      <DayTimeline days={days} />

      {/* Top Section: Header */}
      <div>
        <h2 className="text-white text-base font-bold mb-4">Venue Details</h2>

        {/* Total Participants */}
        <div className="mb-5">
          <CustomInput
            label="Total Number of Participants *"
            type="number"
            value={totalParticipants}
            onChange={handleParticipantsChange}
          />
        </div>

        {/* Venue Required + Others */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MultiVenueSelect
            label="Venue Required *"
            options={participantCount > 0 ? eligibleVenues : VENUES}
            selected={selectedVenues}
            onChange={setSelectedVenues}
          />
          <div className="relative w-full">
            <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#16162A] z-10 pointer-events-none">
              If venue required is others, please specify *
            </span>
            <input
              value={othersText}
              onChange={(e) => setOthersText(e.target.value)}
              placeholder=""
              className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Participant count hint */}
        {participantCount > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            Showing {eligibleVenues.length} venues with capacity ≥ {participantCount}
          </p>
        )}
      </div>

      {/* Per-Venue Detail Cards */}
      {selectedVenueObjects.length > 0 && (
        <div className="flex flex-col gap-4">
          {selectedVenueObjects.map((v, i) => (
            <VenueDetailCard
              key={v.venue + i}
              venueName={v.venue}
              venueCapacity={v.capacity}
              index={i + 1}
            />
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={prevStep}
          className="border border-purple-500 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-purple-500/10 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-purple-700 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}