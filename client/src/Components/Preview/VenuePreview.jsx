import React, { useState } from "react";
import { Info, Users, Armchair,NotebookText  } from "lucide-react";

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

    function VenueInfo({ label, value, isLast }) {
        return (
            <div className={`${!isLast ? "border-r border-[#8E93A6] pr-6" : "pl-6"}`}>
                <p className="text-gray-400 text-sm">
                    {label}
                </p>

                <p className="text-white font-semibold mt-2 ">
                    {value || "-"}
                </p>
            </div>
        );
    }

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
        <NotebookText  size={14} className="text-white" />
        <p className="text-white text-sm font-semibold">{children}</p>
    </div>
    );

    // ─── Single venue card (read-only version of VenueDetailCard) ─────────────

    function VenueCardPreview({ card }) {
    const hallReqs = card.hallReqs || [];

    return (
        <div className="rounded-xl border border-[#3A3A5A] bg-[#FFFFFF0D] p-4 sm:p-6 flex flex-col gap-5">
        <h3 className="text-purple-400 text-base font-semibold">{card.venueName}</h3>

        <div className="bg-[#FFFFFF0D] border border-[#343C59] rounded-xl p-5">
            <div className="grid md:grid-cols-2">
                <VenueInfo
                    label="Number of Participants"
                    value={card.participants}
                />

                <VenueInfo
                    label="Number of Seating Capacity Required"
                    value={card.seatingCapacity}
                    isLast
                />
            </div>
        </div>

        {hallReqs.length > 0 && (
            <div className="bg-[#FFFFFF0D] border border-[#343C59] rounded-xl p-5">
                <SectionHeading>Hall Requirements</SectionHeading>

                <div className="grid md:grid-cols-2">
                    <div className="border-r border-[#8E93A6] pr-6 space-y-6">
                        {hallReqs
                            .filter((_, index) => index % 2 === 0)
                            .map((req) => (
                                <div
                                    key={req}
                                    className="flex justify-between"
                                >
                                    <span className="text-gray-400">
                                        {HALL_REQ_LABELS[req]}
                                    </span>

                                    <span className="font-semibold">
                                        {card[HALL_REQ_FIELD_MAP[req]] || "-"}
                                    </span>
                                </div>
                            ))}
                    </div>

                    <div className="pl-6 space-y-6">
                        {hallReqs
                            .filter((_, index) => index % 2 === 1)
                            .map((req) => (
                                <div
                                    key={req}
                                    className="flex justify-between"
                                >
                                    <span className="text-gray-400">
                                        {HALL_REQ_LABELS[req]}
                                    </span>

                                    <span className="font-semibold">
                                        {card[HALL_REQ_FIELD_MAP[req]] || "-"}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        )}

        {card.specialReqs && (
            <div className="bg-[#FFFFFF0D] border border-[#343C59] rounded-xl p-5">
                <SectionHeading>Special Requirement</SectionHeading>
                <p className="text-gray-300 leading-8">
                    {card.specialReqs || "-"}
                </p>
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
        <div className="flex flex-col gap-6 bg-[#161B2D] rounded-xl border border-[#2E3652] p-6 text-white">
        {/* Heading */}
        <div>
            <h2 className="text-purple-400 text-xl font-semibold playfair">Venue Details</h2>
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
        <div className="rounded-xl border border-[#343C59] bg-[#FFFFFF0D] p-5">
            <div className="grid md:grid-cols-2">
                <div className="flex justify-between border-r border-[#8E93A6] pr-6">
                    <span className="text-gray-400">
                        Total Number of Participants
                    </span>

                    <span className="font-semibold text-white">
                        {day.participants ? `${day.participants} Members` : "-"}
                    </span>
                </div>

                <div className="flex justify-between pl-6">
                    <span className="text-gray-400">
                        Venue Required
                    </span>

                    <span className="font-semibold text-white text-right">
                        {(day.selectedVenues || []).join(" / ") || "-"}
                    </span>
                </div>
            </div>
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