import React, { useState } from "react";
import { Calendar, Users, BedDouble, UtensilsCrossed, FileText } from "lucide-react";

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

function formatDateTime(value) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Small UI atoms ─────────────────────────────────────────────────────────────

function GenderIcon({ gender }) {
  const g = (gender || "").toLowerCase();
  if (g === "female") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#ab45ff" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="6" r="3.5" />
        <path d="M7 21c0-3.5 1.5-7 5-8.5C16.5 14 17 17.5 17 21H7z" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ab45ff" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="6" r="3.5" />
      <path d="M8 13h8c.5 0 1 .4 1 1v7H7v-7c0-.6.4-1 1-1z" />
    </svg>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-md bg-purple-600/15 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-purple-400" />
      </div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#2a2a45] last:border-b-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-white text-right">{value ?? "—"}</span>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-block bg-purple-600/15 border border-purple-600/30 text-purple-300 text-xs px-2.5 py-1 rounded-full mr-2 mb-2">
      {children}
    </span>
  );
}

function EmptyState({ text }) {
  return <p className="text-xs text-gray-500 italic">{text}</p>;
}

// ─── Single accommodation block preview (one "day" tab's content) ─────────────

function AccommodationBlockPreview({ acc, allGuests }) {
  const selectedGuests = allGuests.filter((g) =>
    (acc.selectedGuestIds || []).includes(g.guestId)
  );

  const roomOccupancy = [];
  if (parseInt(acc.singleRooms) > 0) roomOccupancy.push({ type: "Single Room", count: acc.singleRooms });
  if (parseInt(acc.doubleRooms) > 0) roomOccupancy.push({ type: "Double Room", count: acc.doubleRooms });

  return (
    <div className="space-y-5">
      {/* Check In / Out */}
      <div className="bg-[#1f1f38] border border-[#3a3a5a] rounded-xl p-5">
        <SectionHeader icon={Calendar} title="Stay Duration" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-gray-500 mb-1">Check In</p>
            <p className="text-sm text-white font-medium">{formatDateTime(acc.checkIn)}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-1">Check Out</p>
            <p className="text-sm text-white font-medium">{formatDateTime(acc.checkOut)}</p>
          </div>
        </div>
      </div>

      {/* Guests */}
      <div className="bg-[#1f1f38] border border-[#3a3a5a] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader icon={Users} title="Guests" />
          <span className="text-xs text-gray-400">
            {selectedGuests.length} <span className="text-purple-400">/ {allGuests.length}</span>
          </span>
        </div>
        {selectedGuests.length === 0 ? (
          <EmptyState text="No guests selected for this accommodation." />
        ) : (
          <div className="space-y-2">
            {selectedGuests.map((g) => (
              <div
                key={g.guestId}
                className="flex justify-between items-center gap-4 bg-[#2a2a4a] border border-[#3a3a5a] px-3 py-2.5 rounded-lg"
              >
                <span className="text-sm text-white truncate">{g.name || "—"}</span>
                <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
                  <span className="flex items-center gap-1.5">
                    <GenderIcon gender={g.gender} />
                    {g.gender || "—"}
                  </span>
                  <span>{g.mobile || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rooms */}
      <div className="bg-[#1f1f38] border border-[#3a3a5a] rounded-xl p-5">
        <SectionHeader icon={BedDouble} title="Room Details" />

        {roomOccupancy.length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] text-gray-500 mb-1.5">Occupancy</p>
            <div className="flex flex-wrap">
              {roomOccupancy.map((r) => (
                <Pill key={r.type}>{r.type} × {r.count}</Pill>
              ))}
            </div>
          </div>
        )}

        <p className="text-[11px] text-gray-500 mb-1.5">Room Type(s)</p>
        {(!acc.roomTypes || acc.roomTypes.length === 0) ? (
          <EmptyState text="No room type selected." />
        ) : (
          <div className="space-y-1">
            {acc.roomTypes.map((rt) => (
              <InfoRow key={rt} label={rt} value={`${acc.roomCounts?.[rt] || 0} room(s)`} />
            ))}
          </div>
        )}
      </div>

      {/* Dine-in */}
      <div className="bg-[#1f1f38] border border-[#3a3a5a] rounded-xl p-5">
        <SectionHeader icon={UtensilsCrossed} title="Dine-in" />
        <InfoRow label="Dine-in Required" value={acc.dine || "—"} />
        {acc.dine === "Yes" && (
          <>
            {acc.dineTypes?.includes("Hostel") && (
              <InfoRow label="Hostel Dine-in Guests" value={acc.hostelGuests || "0"} />
            )}
            {acc.dineTypes?.includes("Amenity") && (
              <InfoRow label="Amenity Dine-in Guests" value={acc.amenityGuests || "0"} />
            )}
          </>
        )}
      </div>

      {/* Special Requirements */}
      <div className="bg-[#1f1f38] border border-[#3a3a5a] rounded-xl p-5">
        <SectionHeader icon={FileText} title="Special Requirements" />
        {acc.special?.trim() ? (
          <p className="text-sm text-gray-200 whitespace-pre-wrap">{acc.special}</p>
        ) : (
          <EmptyState text="None specified." />
        )}
      </div>
    </div>
  );
}

// ─── Main Preview Component ────────────────────────────────────────────────────

export default function AccommodationPreview({ accommodationData, eventDays = [] }) {
  const accommodations =
    accommodationData?.accommodations && Array.isArray(accommodationData.accommodations)
      ? accommodationData.accommodations
      : [];

  const allGuests = flattenGuests(eventDays);
  const [activeTab, setActiveTab] = useState(0);

  if (accommodations.length === 0) {
    return (
      <div className="text-white w-full">
        <h3 className="text-lg font-bold playfair mb-4">Accommodation Details</h3>
        <div className="bg-[#1f1f38] border border-[#3a3a5a] rounded-xl p-6 text-center">
          <EmptyState text="No accommodation details have been added." />
        </div>
      </div>
    );
  }

  return (
    <div className="text-white w-full">
      <h3 className="text-lg font-bold playfair mb-4">Accommodation Details</h3>

      {/* Day tabs — same pattern as Venue / ICTS preview */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {accommodations.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`flex-shrink-0 px-5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === idx
                ? "bg-purple-600 text-white"
                : "bg-[#1f1f38] border border-[#3a3a5a] text-gray-400 hover:text-white hover:border-purple-500"
            }`}
          >
            Day {idx + 1}
          </button>
        ))}
      </div>

      <AccommodationBlockPreview
        acc={accommodations[activeTab] || {}}
        allGuests={allGuests}
      />
    </div>
  );
}