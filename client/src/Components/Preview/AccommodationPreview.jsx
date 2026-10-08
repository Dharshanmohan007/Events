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
        <h2 className="text-xl font-semibold text-purple-400 playfair">
          Accommodation Preview
        </h2>

        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 leading-6">
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
    <div className="rounded-xl bg-slate-50 dark:bg-[#20263B] border border-slate-200 dark:border-[#343C59] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-3">
            {LeftIcon && <LeftIcon size={18} className="text-[#C4B5FD]" />}
            <span className="text-slate-500 dark:text-gray-400 text-xs uppercase">{leftLabel}</span>
          </div>

          <span className="font-semibold text-slate-900 dark:text-white text-[14px]">
            {leftValue || "—"}
          </span>
        </div>

        <div className="border-l border-slate-200 dark:border-slate-200 dark:border-[#434A60] flex items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-3">
            {RightIcon && <RightIcon size={18} className="text-[#C4B5FD]" />}
            <span className="text-slate-500 dark:text-gray-400 text-xs uppercase">{rightLabel}</span>
          </div>

          <span className="font-semibold text-slate-900 dark:text-white text-[14px] text-right">
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
    <div className="rounded-xl bg-slate-50 dark:bg-[#20263B] border border-slate-200 dark:border-[#343C59] p-5">
      <h3 className="flex items-center gap-2 font-semibold mb-5 text-lg">
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
      <div className="bg-white dark:bg-[#161B2D] rounded-xl border border-slate-200 dark:border-[#2E3652] p-12 text-center text-slate-900 dark:text-white">
        <p className="text-slate-500 dark:text-gray-400">No Accommodation Details Added</p>
      </div>
    );
  }

  const safeIndex = Math.min(activeDay, accommodations.length - 1);
  const acc = accommodations[safeIndex] || {};
  const selectedGuests = allGuests.filter((g) =>
    (acc.selectedGuestIds || []).includes(g.guestId)
  );

  const roomSelections = acc.roomSelections || [];

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
                  ? "bg-[#7C3AED] border-slate-200 dark:border-[#7C3AED] text-slate-900 dark:text-white"
                  : "bg-slate-50 dark:bg-white dark:bg-[#252C3F] border-slate-200 dark:border-slate-200 dark:border-[#343C59] text-[#C4C8D4] hover:border-slate-200 dark:border-[#7C3AED]"
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-[#161B2D] rounded-xl border border-slate-200 dark:border-[#2E3652] p-6 text-slate-900 dark:text-white space-y-6">
        <PreviewHeader />

        <TwoColumnCard
          leftLabel="Check In"
          leftValue={formatDateTime(acc.checkIn)}
          leftIcon={Calendar}
          rightLabel="Check Out"
          rightValue={formatDateTime(acc.checkOut)}
          rightIcon={Calendar}
        />

        {/* <TwoColumnCard
          leftLabel="Guest Name"
          leftValue={selectedGuests.length ? selectedGuests.map((g) => g.name).join(", ") : "—"}
          leftIcon={User}
          rightLabel="Guest Mobile Number"
          rightValue={selectedGuests.length ? selectedGuests.map((g) => g.mobile || "—").join(", ") : "—"}
          rightIcon={Phone}
        /> */}

        <SectionCard title="Guests" icon={Users}>
          {selectedGuests.length === 0 ? (
            <EmptyState text="No guests selected for this accommodation." />
          ) : (
            <div className="space-y-2">
              {selectedGuests.map((guest) => (
                <div
                  key={guest.guestId}
                  className="bg-white dark:bg-[#161B2D] border border-slate-200 dark:border-[#2E3652] rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-slate-900 dark:text-white truncate">
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
            <div className="bg-white dark:bg-[#161B2D] border border-slate-200 dark:border-[#2E3652] rounded-xl p-4">
              <p className="text-[14px] text-[#C4C8D4] mb-2">Room Selections</p>
              {roomSelections.length > 0 ? (
                <div className="space-y-2">
                  {roomSelections.map((room, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-200 dark:border-[#434A60] pb-2 last:border-b-0 last:pb-0"
                    >
                      <span className="text-[14px] text-[#D6D8E1]">
                        {room.venue} - Room {room.roomNumber}
                      </span>
                      <span className="text-[14px] text-slate-900 dark:text-white font-semibold">
                        Capacity: {room.occupantCount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[14px] text-[#98A2B3]">No rooms selected.</span>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Dine-in" icon={UtensilsCrossed}>
          <div className="bg-white dark:bg-[#161B2D] border border-slate-200 dark:border-[#2E3652] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-200 dark:border-[#434A60] pb-2">
              <span className="text-[14px] text-[#C4C8D4]">Dine-in Required</span>
              <span className="text-[14px] text-slate-900 dark:text-white font-semibold">{acc.dine || "—"}</span>
            </div>

            {(acc.dineTypes || []).length > 0 ? (
              <div className="space-y-2">
                {acc.dineTypes?.includes("Hostel") && (
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-200 dark:border-[#434A60] pb-2">
                    <span className="text-[14px] text-[#C4C8D4]">Hostel Dine-in Guests</span>
                    <span className="text-[14px] text-slate-900 dark:text-white font-semibold">
                      {acc.hostelGuests || 0}
                    </span>
                  </div>
                )}

                {acc.dineTypes?.includes("Amenity") && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[14px] text-[#C4C8D4]">Amenity Dine-in Guests</span>
                    <span className="text-[14px] text-slate-900 dark:text-white font-semibold">
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