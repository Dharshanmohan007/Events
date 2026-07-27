import React, { useState } from "react";
import {
  Calendar,
  Users,
  BedDouble,
  UtensilsCrossed,
  FileText,
  User,
  Phone,
} from "lucide-react";

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function flattenGuests(eventDays = []) {
  const seen = new Set();
  const result = [];

  eventDays.forEach((day, dayIdx) => {
    (day.guests || []).forEach((guest, guestIdx) => {
      const guestId = `day${dayIdx}_g${guestIdx}_${(guest.name || "")
        .replace(/\s+/g, "")
        .toLowerCase()}`;

      if (!seen.has(guestId)) {
        seen.add(guestId);
        result.push({ ...guest, guestId });
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

// -------------------------------------------------------
// Header
// -------------------------------------------------------

function PreviewHeader() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <h2 className="text-[20px] font-bold text-[#8B5CF6] playfair">
          Accommodation Preview
        </h2>

        <p className="mt-2 text-sm text-[#98A2B3] leading-6">
          Review the complete accommodation arrangement for the selected event
          day, including stay duration, guest allocation, room occupancy,
          dine-in preferences, and any special requirements before submission.
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Divider Card
// -------------------------------------------------------

function TwoColumnCard({
  leftLabel,
  leftValue,
  leftIcon: LeftIcon,
  rightLabel,
  rightValue,
  rightIcon: RightIcon,
}) {
  return (
    <div className="bg-[#252C3F] border border-[#343C59] rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-3">
            {LeftIcon && <LeftIcon size={18} className="text-[#C4B5FD]" />}
            <span className="text-[14px] text-[#C4C8D4]">{leftLabel}</span>
          </div>

          <span className="font-semibold text-white text-[14px]">
            {leftValue || "—"}
          </span>
        </div>

        <div className="border-l border-[#434A60] flex items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-3">
            {RightIcon && <RightIcon size={18} className="text-[#C4B5FD]" />}
            <span className="text-[14px] text-[#C4C8D4]">{rightLabel}</span>
          </div>

          <span className="font-semibold text-white text-[14px] text-right">
            {rightValue || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Section Card
// -------------------------------------------------------

function  SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="border border-[#343C59] rounded-2xl bg-[#1E2435] p-5">
      <h3 className="flex items-center gap-2 text-[20px] playfair font-bold text-[#8B5CF6] mb-5">
        <Icon size={18} className="text-[#C4B5FD]" />
        {title}
      </h3>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-[14px] text-[#98A2B3]">{text}</p>;
}

// -------------------------------------------------------
// Main Component
// -------------------------------------------------------

export default function AccommodationPreview({ accommodationData, eventDays = [] }) {
  const accommodations =
    accommodationData?.accommodations && Array.isArray(accommodationData.accommodations)
      ? accommodationData.accommodations
      : [];

  const allGuests = flattenGuests(eventDays);
  const [activeDay, setActiveDay] = useState(0);

  if (accommodations.length === 0) {
    return (
      <div className="rounded-2xl border border-[#343C59] bg-[#1E2435] p-12 text-center">
        <p className="text-[#98A2B3]">No Accommodation Details Added</p>
      </div>
    );
  }

  const safeIndex = Math.min(activeDay, accommodations.length - 1);
  const acc = accommodations[safeIndex] || {};
  const selectedGuests = allGuests.filter((g) =>
    (acc.selectedGuestIds || []).includes(g.guestId)
  );

  const roomOccupancy = [];
  if (parseInt(acc.singleRooms) > 0) {
    roomOccupancy.push({ type: "Single Room", count: acc.singleRooms });
  }

  if (parseInt(acc.doubleRooms) > 0) {
    roomOccupancy.push({ type: "Double Room", count: acc.doubleRooms });
  }

  return (
    <div className="space-y-6">
      {accommodations.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {accommodations.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`px-6 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap ${
                safeIndex === index
                  ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                  : "bg-[#252C3F] border-[#343C59] text-[#C4C8D4] hover:border-[#7C3AED]"
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-[#1C2233] border border-[#343C59] p-6 space-y-6">
        <PreviewHeader />

        <TwoColumnCard
          leftLabel="Check In"
          leftValue={formatDateTime(acc.checkIn)}
          leftIcon={Calendar}
          rightLabel="Check Out"
          rightValue={formatDateTime(acc.checkOut)}
          rightIcon={Calendar}
        />

        <TwoColumnCard
          leftLabel="Guest Name"
          leftValue={selectedGuests.length ? selectedGuests.map((g) => g.name).join(", ") : "—"}
          leftIcon={User}
          rightLabel="Guest Mobile Number"
          rightValue={selectedGuests.length ? selectedGuests.map((g) => g.mobile || "—").join(", ") : "—"}
          rightIcon={Phone}
        />

        <SectionCard title="Guests" icon={Users}>
          {selectedGuests.length === 0 ? (
            <EmptyState text="No guests selected for this accommodation." />
          ) : (
            <div className="space-y-2">
              {selectedGuests.map((guest) => (
                <div
                  key={guest.guestId}
                  className="bg-[#2A3042] border border-[#394156] rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-white truncate">
                      {guest.name || "—"}
                    </p>
                  </div>

                  <div className="flex flex-row gap-10">
                    <div className="flex items-center gap-2 text-[13px] text-[#C4C8D4]">
                      <User className="h-5" gender={guest.gender} />
                      <span>{guest.gender || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[#C4C8D4]">
                      <Phone className="h-5"  gender={guest.gender} />
                      <span>{guest.mobile || "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Room Details" icon={BedDouble}>
          <div className="space-y-3">
            <div className="bg-[#2A3042] border border-[#394156] rounded-xl p-4">
              <p className="text-[14px] text-[#C4C8D4] mb-2">Occupancy</p>
              <div className="flex flex-wrap gap-2">
                {roomOccupancy.length > 0 ? (
                  roomOccupancy.map((room) => (
                    <span
                      key={room.type}
                      className="inline-block rounded-full border border-[#7C3AED]/40 bg-[#7C3AED]/15 px-3 py-1 text-[13px] text-[#C4B5FD]"
                    >
                      {room.type} × {room.count}
                    </span>
                  ))
                ) : (
                  <span className="text-[14px] text-[#98A2B3]">No room occupancy provided.</span>
                )}
              </div>
            </div>

            <div className="bg-[#2A3042] border border-[#394156] rounded-xl p-4">
              <p className="text-[14px] text-[#C4C8D4] mb-2">Room Types</p>
              {(acc.roomTypes || []).length > 0 ? (
                <div className="space-y-2">
                  {(acc.roomTypes || []).map((roomType) => (
                    <div
                      key={roomType}
                      className="flex items-center justify-between gap-4 border-b border-[#434A60] pb-2 last:border-b-0 last:pb-0"
                    >
                      <span className="text-[14px] text-[#D6D8E1]">{roomType}</span>
                      <span className="text-[14px] text-white font-semibold">
                        {acc.roomCounts?.[roomType] || 0} room(s)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[14px] text-[#98A2B3]">No room type selected.</span>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Dine-in" icon={UtensilsCrossed}>
          <div className="bg-[#2A3042] border border-[#394156] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between gap-4 border-b border-[#434A60] pb-2">
              <span className="text-[14px] text-[#C4C8D4]">Dine-in Required</span>
              <span className="text-[14px] text-white font-semibold">{acc.dine || "—"}</span>
            </div>

            {(acc.dineTypes || []).length > 0 ? (
              <div className="space-y-2">
                {acc.dineTypes?.includes("Hostel") && (
                  <div className="flex items-center justify-between gap-4 border-b border-[#434A60] pb-2">
                    <span className="text-[14px] text-[#C4C8D4]">Hostel Dine-in Guests</span>
                    <span className="text-[14px] text-white font-semibold">
                      {acc.hostelGuests || 0}
                    </span>
                  </div>
                )}

                {acc.dineTypes?.includes("Amenity") && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[14px] text-[#C4C8D4]">Amenity Dine-in Guests</span>
                    <span className="text-[14px] text-white font-semibold">
                      {acc.amenityGuests || 0}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-[14px] text-[#98A2B3]">No dine-in option selected.</span>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Special Requirements" icon={FileText}>
          <div className=" ">
            <p className="text-[14px] leading-6 text-[#D6D8E1] whitespace-pre-wrap">
              {acc.special?.trim() ? acc.special : "No special requirements provided."}
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}