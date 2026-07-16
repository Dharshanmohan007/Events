import React, { useState } from "react";
import { Info, Users, Armchair } from "lucide-react";

// ─── Static label / field maps (mirrors HALL_REQUIREMENTS in VenueForm.jsx) ───

const HALL_REQ_LABELS = {
    "Guest Chair": "Guest Chair",
    "Water Bottles": "Water Bottle",
    "Dias Table": "Dias Table",
    "Audience Chair": "Audience Chair",
    };

    const HALL_REQ_FIELD_MAP = {
    "Guest Chair": "guestChairs",
    "Water Bottles": "waterBottles",
    "Dias Table": "diasTable",
    "Audience Chair": "audienceChair",
    };

    // ─── Small display helpers ─────────────────────────────────────────────────

    const Field = ({ label, value }) => (
    <div>
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-white text-sm font-semibold">
        {value === "" || value === null || value === undefined ? "-" : value}
        </p>
    </div>
    );

    const SectionHeading = ({ children }) => (
    <div className="flex items-center gap-2 mb-3">
        <Info size={14} className="text-purple-400" />
        <p className="text-white text-sm font-semibold">{children}</p>
    </div>
    );

    // ─── Single venue card (read-only version of VenueDetailCard) ─────────────

    function VenueCardPreview({ card }) {
    const hallReqs = card.hallReqs || [];

    return (
        <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
        <h3 className="text-purple-400 text-base font-semibold">{card.venueName}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            <Field label="Number of Participants" value={card.participants} />
            <Field label="Number of Seating Capacity Required" value={card.seatingCapacity} />
        </div>

        {hallReqs.length > 0 && (
            <div className="pt-4 border-t border-[#3A3A5A]">
            <SectionHeading>Hall Requirements</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                {hallReqs.map((req) => (
                <div key={req} className="flex items-center justify-between pr-4">
                    <p className="text-gray-400 text-xs">{HALL_REQ_LABELS[req] || req}</p>
                    <p className="text-white text-sm font-semibold">
                    {card[HALL_REQ_FIELD_MAP[req]] || "-"}
                    </p>
                </div>
                ))}
            </div>
            </div>
        )}

        {card.specialReqs && (
            <div className="pt-4 border-t border-[#3A3A5A]">
            <SectionHeading>Special Requirement</SectionHeading>
            <p className="text-gray-400 text-sm leading-relaxed">{card.specialReqs}</p>
            </div>
        )}
        </div>
    );
    }

    // ─── Main VenuePreview ──────────────────────────────────────────────────────
    // Props mirror what VenueForm.jsx / Form.jsx already hold in state, so this
    // component can be dropped straight into EventPreviewPage without any new
    // data shape:
    //   venueData -> formData.venue      (array, one entry per event day)
    //   eventDays -> formData.event.eventDays (used only for optional date labels)

    export default function VenuePreview({ venueData = [], eventDays = [] }) {
    const [activeDay, setActiveDay] = useState(0);

    if (!venueData || venueData.length === 0) {
        return (
        <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-gray-400 text-sm">
            No venue details added.
        </div>
        );
    }

    const day = venueData[activeDay] || {};
    const venueCards = day.venueCards || [];
    const dayMeta = eventDays[activeDay];

    return (
        <div className="flex flex-col gap-6">
        {/* Heading */}
        <div>
            <h2 className="text-purple-400 text-lg font-bold playfair">Venue Details</h2>
        </div>

        {/* Day tabs */}
        {venueData.length > 1 && (
            <div className="flex items-center gap-6 border-b border-[#2A2A45]">
            {venueData.map((_, idx) => (
                <button
                key={idx}
                type="button"
                onClick={() => setActiveDay(idx)}
                className={`relative pb-2 text-sm font-medium transition-colors ${
                    activeDay === idx ? "text-purple-400" : "text-gray-400 hover:text-gray-200"
                }`}
                >
                Day {idx + 1}
                {activeDay === idx && (
                    <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-purple-500 rounded" />
                )}
                </button>
            ))}
            </div>
        )}

        {/* Day summary */}
        <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
            <p className="text-gray-400 text-xs mb-1 flex items-center gap-1.5">
                <Users size={12} /> Total Number of Participants
            </p>
            <p className="text-white text-sm font-semibold">
                {day.participants ? `${day.participants} Members` : "-"}
            </p>
            </div>
            <div>
            <p className="text-gray-400 text-xs mb-1 flex items-center gap-1.5">
                <Armchair size={12} /> Venue Required
            </p>
            <p className="text-white text-sm font-semibold">
                {(day.selectedVenues || []).join(" / ") || "-"}
            </p>
            </div>
            {day.othersText && (
            <div className="sm:col-span-2">
                <p className="text-gray-400 text-xs mb-1">Others</p>
                <p className="text-white text-sm font-semibold">{day.othersText}</p>
            </div>
            )}
            {dayMeta?.date && (
            <div className="sm:col-span-2 text-xs text-gray-500">
                {dayMeta.date}
                {dayMeta.startTime && dayMeta.endTime
                ? ` (${dayMeta.startTime} - ${dayMeta.endTime})`
                : ""}
            </div>
            )}
        </div>

        {/* Venue cards */}
        {venueCards.length > 0 ? (
            <div className="flex flex-col gap-4">
            {venueCards.map((card, i) => (
                <VenueCardPreview key={`${card.venueName}-${i}`} card={card} />
            ))}
            </div>
        ) : (
            <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-gray-400 text-sm">
            No venue cards for this day.
            </div>
        )}
        </div>
    );
    }