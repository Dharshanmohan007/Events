import React,{useState} from "react";
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
    const [selectedDay, setSelectedDay] = useState(0);
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
            <h2 className="text-xl font-semibold text-purple-400 playfair">
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
            <div className="border-r border-[#8e93a6] pr-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
                <FileText size={14} />
                Event Name
                </div>

                <p className="mt-2 font-semibold">{eventData.eventName || "-"}</p>
            </div>

            <div className="border-r border-[#8e93a6] pr-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
                <Calendar size={14} />
                Event Date
                </div>

                <p className="mt-2 font-semibold">{formatDate(firstDay.date)}</p>
            </div>

            <div className="border-r border-[#8e93a6] pr-4">
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
                <div className="flex justify-between border-r border-[#8e93a6] pr-4">
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

                        <button
                            type="button"
                            onClick={() => window.open(URL.createObjectURL(file), "_blank")}
                            className="truncate text-blue-400 hover:underline"
                        >
                            {file?.name || "-"}
                        </button>
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
                <div key={index} className="border border-[#343C59] rounded-lg p-4 bg-[#FFFFFF0D]">
                <div className="grid md:grid-cols-4 gap-5">
                    <div className="border-r border-[#8e93a6] pr-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase ">
                        <User size={14} />
                        Organizer Name
                    </div>

                    <p className="mt-2">{org.name || "-"}</p>
                    </div>

                    <div className="border-r border-[#8e93a6] pr-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
                        <BadgeCheck size={14} />
                        Employee ID
                    </div>

                    <p className="mt-2">{org.empId || "-"}</p>
                    </div>

                    <div className="border-r border-[#8e93a6] pr-4">
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
            <h3 className="font-semibold text-lg mb-5">Event Details</h3>

            <div className="grid md:grid-cols-2 gap-x-10 gap-y-4">
                <PreviewRow title="Finance Required" value={finance} className="border-b border-[#363D57] pb-3"/>
                <PreviewRow
                    title="Type of Event"
                    value={
                    eventData.eventType === "Other"
                        ? eventData.eventTypeOther
                        : eventData.eventType
                    }
                    className="border-b border-[#363D57] pb-3"
                />
                <PreviewRow title="Budget Approved" value={budget} className="border-b border-[#363D57] pb-3"/>
                <PreviewRow
                    title="Professional Society"
                    value={
                    eventData.society === "Other"
                        ? eventData.societyOther
                        : eventData.society
                    }
                    className="border-b border-[#363D57] pb-3"
                />
                <PreviewRow title="Department" value={department} className="border-b border-[#363D57] pb-3"/>
                <PreviewRow title="IIC Required" value={eventData.iic} className="border-b border-[#363D57] pb-3"/>
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
                                EVENT SHEDULE & GUEST DETIAILS
            ========================================================== */}

            <div className="rounded-xl bg-[#20263B] border border-[#343C59] p-5 mt-6">
            <h3 className="font-semibold text-lg mb-5">Event Schedule</h3>

            {eventDays.length === 0 ? (
                <p className="text-gray-400">No Event Days Added</p>
            ) : (
                <>
                {/* Tabs */}
                {eventDays.length > 1 && (
                <div className="flex border-b border-[#343C59] mb-6">
                    {eventDays.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedDay(index)}
                        className={`px-5 py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer
                        ${
                            selectedDay === index
                            ? "text-[#8B5CF6] border-b-[3px] border-[#8B5CF6]"
                            : "text-[#E5E7EB] border-b-[3px] border-transparent hover:text-white"
                        }`}
                    >
                        Day {index + 1}
                    </button>
                    ))}
                </div>
                )}

                {(() => {
                    const day = eventDays[selectedDay];

                    return (
                    <div className="space-y-6">
                        {/* Date & Time */}
                        <div className="bg-[#FFFFFF0D] border border-[#343C59] rounded-xl p-5">
                            <div className="grid md:grid-cols-3 gap-5">
                                <PreviewInfo
                                    icon={Calendar}
                                    title="Event Date"
                                    value={formatDate(day.date)}
                                />

                                <PreviewInfo
                                    icon={Clock}
                                    title="Start Time"
                                    value={day.startTime}
                                />

                                <PreviewInfo
                                    icon={Clock}
                                    title="End Time"
                                    value={day.endTime}
                                    isLast
                                />
                            </div>
                        </div>

                        {/* Guest Count */}
                        {/* <PreviewRow
                        title="Number of Chief Guests"
                        value={day.numGuests}
                        /> */}

                        {/* Guests */}
                        {day.guests?.length > 0 && (
                        <div className="space-y-4 ">
                            {day.guests.map((guest, guestIndex) => (
                            <div
                                key={guestIndex}
                                className="bg-[#FFFFFF0D] border border-[#343C59] rounded-xl p-4"
                            >
                                <h5 className="text-sm font-semibold text-purple-300 mb-4">
                                Chief Guest {guestIndex + 1}
                                </h5>

                                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
                                    <PreviewInfo
                                        icon={User}
                                        title="Name"
                                        value={guest.name}
                                    />

                                    <PreviewInfo
                                        icon={BadgeCheck}
                                        title="Designation"
                                        value={guest.designation}
                                    />

                                    <PreviewInfo
                                        icon={Building2}
                                        title="Organization"
                                        value={guest.organization}
                                    />

                                    <PreviewInfo
                                        icon={Phone}
                                        title="Mobile Number"
                                        value={guest.mobile}
                                    />

                                    <PreviewInfo
                                        icon={User}
                                        title="Gender"
                                        value={guest.gender}
                                        isLast
                                    />
                                </div>
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                    );
                })()}
                </>
            )}
            </div>

        {/* ==========================================================
                                EVENT REQUIREMENTS
            ========================================================== */}

        <div className="rounded-xl bg-[#20263B] border border-[#343C59] p-5 mt-6">
            <h3 className="font-semibold text-lg mb-5">Event Requirements</h3>

            <div className="grid md:grid-cols-2 gap-x-10 gap-y-4">
            <PreviewRow title="Venue Required" value={requirements.venue} className="border-b border-[#363D57] pb-3"/>

            <PreviewRow title="ICTS Required" value={requirements.icts} className="border-b border-[#363D57] pb-3"/>

            <PreviewRow title="Audio Required" value={requirements.audio} className="border-b border-[#363D57] pb-3"/>

            <PreviewRow
                title="Transport Required"
                value={requirements.transport}
                className="border-b border-[#363D57] pb-3"
            />

            <PreviewRow
                title="Food & Refreshments"
                value={requirements.foodandrefreshments}
                className="border-b border-[#363D57] pb-3"
            />

            <PreviewRow
                title="Accommodation"
                value={requirements.accommodation}
                className="border-b border-[#363D57] pb-3"
            />

            <PreviewRow title="Purchase" value={requirements.purchase} />

            <PreviewRow title="Media" value={requirements.media} />
            </div>
        </div>
        </div>
    );
    }

    function PreviewRow({ title, value, className="" }) {
        return (
            <div className={`flex justify-between ${className}`}>
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

    function PreviewInfo({ icon: Icon, title, value, isLast = false }) {
        return (
            <div className={`${!isLast ? "border-r border-[#8e93a6] pr-4" : ""}`}>
                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
                    <Icon size={14} />
                    {title}
                </div>

                <p className="mt-2 font-medium text-white">
                    {value || "-"}
                </p>
            </div>
        );
    }
