import React from "react";
import {
    Calendar,
    Clock,
    FileText,
    User,
    Phone,
    Building2,
    BadgeCheck,
    // IndianRupee,
    } from "lucide-react";

    export default function EventPreview({ eventRequisition }) {
    if (!eventRequisition) return null;

    const {
        doc,
        file,
        reason,
        finance,
        advanceAmount,
        purposeOfAdvance,
        // principalApprovalDocument,
        budget,
        department,
        organizers = [],
        eventData = {},
        eventDays = [],
        requirements = {},
    } = eventRequisition;

    const firstDay = eventDays[0] || {};

    const formatDate = (date) => {
        if (!date) return "-";

        try {
        return new Date(date).toLocaleDateString("en-GB");
        } catch {
        return date;
        }
    };

    return (
        <div className="bg-[#161B2D] rounded-xl border border-[#2E3652] p-6 text-white">
        {/* Header */}
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-purple-400">
            Event Requisition Details
            </h2>

            <p className="text-gray-400 text-sm mt-1">
            Review all information before submitting the requisition.
            </p>
        </div>

        {/* ==========================================================
                                EVENT BASIC DETAILS
            ========================================================== */}

        <div className="rounded-xl bg-[#20263B] border border-[#343C59] p-5 mb-6">
            <div className="grid md:grid-cols-4 gap-5">
            <div className="border-r border-[#363D57] pr-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
                <FileText size={14} />
                Event Name
                </div>

                <p className="mt-2 font-semibold">{eventData.eventName || "-"}</p>
            </div>

            <div className="border-r border-[#363D57] pr-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
                <Calendar size={14} />
                Event Date
                </div>

                <p className="mt-2 font-semibold">{formatDate(firstDay.date)}</p>
            </div>

            <div className="border-r border-[#363D57] pr-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
                <Clock size={14} />
                Event Start Time
                </div>

                <p className="mt-2 font-semibold">{firstDay.startTime || "-"}</p>
            </div>

            <div>
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
                <Clock size={14} />
                Event End Time
                </div>

                <p className="mt-2 font-semibold">{firstDay.endTime || "-"}</p>
            </div>
            </div>
        </div>

        {/* ==========================================================
                        PREVIOUS EVENT DOCUMENTATION
            ========================================================== */}

        <div className="space-y-4 mb-6">
            <div className="bg-[#20263B] border border-[#343C59] rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-5">
                <div className="flex justify-between">
                <span className="text-gray-400 text-sm">
                    Completion of Previous Event Documentation
                </span>

                <span
                    className={`font-semibold ${
                    doc === "Yes" ? "text-green-400" : "text-red-400"
                    }`}
                >
                    {doc || "-"}
                </span>
                </div>

                <div>
                {doc === "Yes" ? (
                    <div className="flex items-center gap-2 text-green-400">
                    <FileText size={18} />

                    <span className="truncate">{file?.name || "-"}</span>
                    </div>
                ) : (
                    <span className="text-gray-300">{reason || "-"}</span>
                )}
                </div>
            </div>
            </div>
        </div>

        {/* ==========================================================
                            ORGANIZER DETAILS
            ========================================================== */}

        <div className="rounded-xl bg-[#20263B] border border-[#343C59] p-5 mb-6">
            <h3 className="font-semibold mb-5 text-lg">Organizer Details</h3>

            <div className="space-y-4">
            {organizers.map((org, index) => (
                <div key={index} className="border border-[#343C59] rounded-lg p-4">
                <div className="grid md:grid-cols-4 gap-5">
                    <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
                        <User size={14} />
                        Organizer Name
                    </div>

                    <p className="mt-2">{org.name || "-"}</p>
                    </div>

                    <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
                        <BadgeCheck size={14} />
                        Employee ID
                    </div>

                    <p className="mt-2">{org.empId || "-"}</p>
                    </div>

                    <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
                        <Phone size={14} />
                        Mobile Number
                    </div>

                    <p className="mt-2">{org.mobile || "-"}</p>
                    </div>

                    <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
                        <Building2 size={14} />
                        Department
                    </div>

                    <p className="mt-2">{org.department || "-"}</p>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* ==========================================================
                                EVENT DETAILS
            ========================================================== */}

        <div className="rounded-xl bg-[#20263B] border border-[#343C59] p-5 mt-6">
            <h3 className="font-semibold text-lg mb-5">Event Schedule</h3>

            {eventDays.length === 0 ? (
            <p className="text-gray-400">No Event Days Added</p>
            ) : (
            <div className="space-y-6">
                {eventDays.map((day, index) => (
                <div
                    key={index}
                    className="border border-[#343C59] rounded-xl p-5"
                >
                    {/* Day Heading */}

                    <div className="flex items-center justify-between mb-5">
                    <h4 className="font-semibold text-purple-400">
                        Day {index + 1}
                    </h4>

                    <span className="text-sm text-gray-400">
                        {formatDate(day.date)}
                    </span>
                    </div>

                    {/* Date & Time */}

                    <div className="grid md:grid-cols-3 gap-5 mb-6">
                    <PreviewRow title="Event Date" value={formatDate(day.date)} />

                    <PreviewRow title="Start Time" value={day.startTime} />

                    <PreviewRow title="End Time" value={day.endTime} />
                    </div>

                    {/* Guest Count */}

                    <div className="mb-5">
                    <PreviewRow
                        title="Number of Chief Guests"
                        value={day.numGuests}
                    />
                    </div>

                    {/* Guests */}

                    {day.guests?.length > 0 && (
                    <div className="space-y-4">
                        {day.guests.map((guest, guestIndex) => (
                        <div
                            key={guestIndex}
                            className="bg-[#181D30] border border-[#343C59] rounded-lg p-4"
                        >
                            <h5 className="text-sm font-semibold text-purple-300 mb-4">
                            Chief Guest {guestIndex + 1}
                            </h5>

                            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase">
                                Name
                                </p>

                                <p className="mt-1">{guest.name || "-"}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase">
                                Designation
                                </p>

                                <p className="mt-1">{guest.designation || "-"}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase">
                                Organization
                                </p>

                                <p className="mt-1">{guest.organization || "-"}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase">
                                Mobile Number
                                </p>

                                <p className="mt-1">{guest.mobile || "-"}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase">
                                Gender
                                </p>

                                <p className="mt-1">{guest.gender || "-"}</p>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                ))}
            </div>
            )}
        </div>
        {/* ==========================================================
                                EVENT INFORMATION
            ========================================================== */}

        <div className="rounded-xl bg-[#20263B] border border-[#343C59] p-5 mt-6">
            <h3 className="font-semibold text-lg mb-5">Event Information</h3>

            <div className="grid md:grid-cols-2 gap-x-10 gap-y-4">
            <PreviewRow title="Finance Required" value={finance} />

            <PreviewRow title="Budget Approved" value={budget} />

            <PreviewRow title="Department" value={department} />

            <PreviewRow title="IIC Required" value={eventData.iic} />

            <PreviewRow
                title="Type of Event"
                value={
                eventData.eventType === "Other"
                    ? eventData.eventTypeOther
                    : eventData.eventType
                }
            />

            <PreviewRow
                title="Professional Society"
                value={
                eventData.society === "Other"
                    ? eventData.societyOther
                    : eventData.society
                }
            />

            <PreviewRow
                title="Target Audience"
                value={
                Array.isArray(eventData.audience)
                    ? eventData.audience.join(", ")
                    : eventData.audience
                }
            />

            <PreviewRow
                title="Poster Logos"
                value={
                Array.isArray(eventData.logos)
                    ? eventData.logos.join(", ")
                    : eventData.logos
                }
            />

            {finance === "Yes" && (
                <>
                <PreviewRow
                    title="Advance Amount"
                    value={advanceAmount ? `₹ ${advanceAmount}` : "-"}
                />

                <PreviewRow title="Purpose of Advance" value={purposeOfAdvance} />
                </>
            )}
            </div>
        </div>

        {/* ==========================================================
                                EVENT REQUIREMENTS
            ========================================================== */}

        <div className="rounded-xl bg-[#20263B] border border-[#343C59] p-5 mt-6">
            <h3 className="font-semibold text-lg mb-5">Event Requirements</h3>

            <div className="grid md:grid-cols-2 gap-x-10 gap-y-4">
            <PreviewRow title="Venue Required" value={requirements.venue} />

            <PreviewRow title="ICTS Required" value={requirements.icts} />

            <PreviewRow title="Audio Required" value={requirements.audio} />

            <PreviewRow
                title="Transport Required"
                value={requirements.transport}
            />

            <PreviewRow
                title="Food & Refreshments"
                value={requirements.foodandrefreshments}
            />

            <PreviewRow
                title="Accommodation"
                value={requirements.accommodation}
            />

            <PreviewRow title="Purchase" value={requirements.purchase} />

            <PreviewRow title="Media" value={requirements.media} />
            </div>
        </div>
        </div>
    );
    }

    function PreviewRow({ title, value }) {
        return (
            <div className="flex justify-between border-b border-[#343C59] pb-2">
                <span className="text-gray-400">
                    {title}
                </span>

                <span
                    className={`font-medium ${
                        value === "Yes"
                            ? "text-green-400"
                            : value === "No"
                            ? "text-red-400"
                            : "text-white"
                    }`}
                >
                    {value || "-"}
                </span>
            </div>
        );
    }
