import React, { useMemo, useState, useEffect } from "react";

const AUDIO_KEY_META = [
  { key: "handMic",          label: "Hand Mic" },
  { key: "collarMic",        label: "Collar Mic" },
  { key: "handSpeaker",      label: "Hand Speaker" },
  { key: "podiumWithMic",    label: "Podium With Mic" },
  { key: "wiredMic",         label: "Wired Mic" },
  { key: "speakerWithMixer", label: "Speaker w/ Mixer" },
  { key: "paSystem",         label: "PA System" },
];

function getLabel(key) {
  return AUDIO_KEY_META.find((m) => m.key === key)?.label || key;
}

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

/**
 * AudioPreview
 *
 * Renders the read-only, submitted view of the Audio Details step.
 *
 * Expected shape of `audio` (matches what AudioForm's onAudioDataChange emits):
 * {
 *   [dayIndex]: {
 *     [venueName]: {
 *       audioRequired: string[],       // AUDIO_KEY_META keys
 *       quantities: { [key]: string|number },
 *       others: string,
 *       specialRequirements: string,
 *     }
 *   }
 * }
 */
export default function AudioPreview({ audio = {}, eventDays = [], venueData = [] }) {
  const dayCount = eventDays.length || Object.keys(audio || {}).length;

  const [selectedDay, setSelectedDay] = useState(0);

  const venuesForDay = useMemo(() => {
    if (venueData?.[selectedDay]?.selectedVenues?.length) {
      return venueData[selectedDay].selectedVenues;
    }
    return Object.keys(audio?.[selectedDay] || {});
  }, [audio, venueData, selectedDay]);

  const [selectedVenue, setSelectedVenue] = useState(venuesForDay[0] || null);

  useEffect(() => {
    setSelectedVenue(venuesForDay[0] || null);
  }, [selectedDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const venueEntry = selectedVenue
    ? audio?.[selectedDay]?.[selectedVenue]
    : null;

  const requirementRows = useMemo(() => {
    if (!venueEntry) return [];
    const rows = (venueEntry.audioRequired || []).map((key) => ({
      label: getLabel(key),
      value: venueEntry.quantities?.[key] ?? "-",
    }));
    if (venueEntry.others?.trim()) {
      rows.push({ label: "Others", value: venueEntry.others });
    }
    return rows;
  }, [venueEntry]);

  const isCompleted = requirementRows.length > 0;

  if (dayCount === 0) {
    return (
      <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
        <p className="text-gray-400 text-sm">No audio details were submitted for this event.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Day Tabs */}
      {dayCount > 1 && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: dayCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedDay(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                selectedDay === i
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-transparent border-[#3A3A5A] text-gray-400 hover:text-white hover:border-purple-500/50"
              }`}
            >
              Day {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Venue Sub-Tabs */}
      {venuesForDay.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {venuesForDay.map((venueName) => (
            <button
              key={venueName}
              type="button"
              onClick={() => setSelectedVenue(venueName)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                selectedVenue === venueName
                  ? "bg-purple-600/20 border-purple-500 text-purple-300"
                  : "bg-transparent border-[#3A3A5A] text-gray-500 hover:text-white hover:border-purple-500/50"
              }`}
            >
              {venueName}
            </button>
          ))}
        </div>
      )}

      {venuesForDay.length === 0 || !selectedVenue ? (
        <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
          <p className="text-gray-400 text-sm">No venues were selected for Day {selectedDay + 1}.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-purple-400 text-lg font-bold">
                Audio Details{venuesForDay.length > 1 ? ` — ${selectedVenue}` : ""}
              </h2>
              <p className="text-gray-500 text-sm mt-1 max-w-2xl">
                Audio equipment and special requirements submitted for{" "}
                {selectedVenue} on Day {selectedDay + 1}.
              </p>
            </div>
            {/* <span
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                isCompleted
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                  : "bg-[#2C2C3E] text-gray-400 border border-[#3A3A5A]"
              }`}
            >
              {isCompleted ? "Completed" : "Not Required"}
            </span> */}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Object Requirement */}
            <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-5">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardIcon />
                <h3 className="text-white text-sm font-semibold">Object Requirement</h3>
              </div>
              {requirementRows.length === 0 ? (
                <p className="text-gray-500 text-sm">No audio equipment requested.</p>
              ) : (
                <div className="flex flex-col">
                  {requirementRows.map((row, idx) => (
                    <div
                      key={row.label}
                      className={`flex items-center justify-between py-2.5 ${
                        idx !== requirementRows.length - 1 ? "border-b border-[#2C2C44]" : ""
                      }`}
                    >
                      <span className="text-gray-400 text-sm">{row.label}</span>
                      <span className="text-white text-sm font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Special Requirement */}
            <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-5">
              <div className="flex items-center gap-2 mb-4">
                <DocIcon />
                <h3 className="text-white text-sm font-semibold">Special Requirement</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                {venueEntry?.specialRequirements?.trim() || "No special requirements provided."}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}