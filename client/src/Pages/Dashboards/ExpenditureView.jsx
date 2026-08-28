import React from 'react'
import {
    UserRound,
    Mail,
    Phone,
    Network,
    PartyPopper,
    CalendarDays,
    Clock3,
} from "lucide-react";

const ExpenditureView = ({ data }) => {
    console.log("data : ", data)

    function formatUTCToIST(date) {
        if (!date) return "";

        return new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(new Date(date));
    }

    return (
        <>
            <section className="event-request">
                <div className="w-full rounded-lg border border-gray-700/50 bg-[#202738] p-2">

                    <div className="w-full rounded-lg border border-gray-700/50 bg-[#202738] ">

                        <div className="flex items-center rounded-lg bg-[#293144] px-4 py-2">

                            {/* Event Name */}
                            <div className="flex w-1/3 items-center gap-3 border-r border-gray-500/40">
                                <PartyPopper
                                    size={14}
                                    strokeWidth={1.5}
                                    className="text-[#b9a9e8]"
                                />

                                <div>
                                    <p className="text-[12px] uppercase text-gray-400">
                                        Event Name
                                    </p>

                                    <p className="text-[14px] font-medium text-white">
                                        {data?.requestDetails?.eventDetails?.eventName}
                                    </p>
                                </div>
                            </div>

                            {/* Event Date */}
                            <div className="flex w-1/4 items-center gap-3 border-r border-gray-500/40 pl-4">
                                <CalendarDays
                                    size={14}
                                    strokeWidth={1.5}
                                    className="text-[#b9a9e8]"
                                />

                                <div>
                                    <p className="text-[12px] uppercase text-gray-400">
                                        Event Date
                                    </p>

                                    <p className="text-[14px] font-medium text-white">
                                        {data?.requestDetails?.eventDetails?.eventSchedule?.map((item) => {
                                            return <p>{formatUTCToIST(item.eventDate)}</p>
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Event Start Time */}
                            <div className="flex w-1/4 items-center gap-3 border-r border-gray-500/40 pl-4">
                                <Clock3
                                    size={14}
                                    strokeWidth={1.5}
                                    className="text-[#b9a9e8]"
                                />

                                <div>
                                    <p className="text-[12px] uppercase text-gray-400">
                                        Event Start Time
                                    </p>

                                    <p className="text-[14px] font-medium text-white">
                                        {data?.requestDetails?.eventDetails?.eventSchedule?.map((item) => {
                                            return <p>{item.startTime}</p>
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Event End Time */}
                            <div className="flex w-1/4 items-center gap-3 pl-4">
                                <Clock3
                                    size={14}
                                    strokeWidth={1.5}
                                    className="text-[#b9a9e8]"
                                />

                                <div>
                                    <p className="text-[12px] uppercase text-gray-400">
                                        Event End Time
                                    </p>

                                    <p className="text-[14px] font-medium text-white">
                                        {data?.requestDetails?.eventDetails?.eventSchedule?.map((item) => {
                                            return <p>{item.endTime}</p>
                                        })}
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>

                    {data?.requestDetails?.organizerDetails?.organizers.map((item) => {
                        return <div className="mb-1.5 mt-2 flex items-center rounded-lg bg-[#293144] px-4 py-3">
                            {/* Organizer Name */}
                            <div className="flex w-1/4 items-center gap-3 border-r border-gray-500/40">
                                <UserRound
                                    size={13}
                                    strokeWidth={1.5}
                                    className="text-[#b9a9e8]"
                                />

                                <div>
                                    <p className="text-[12px] uppercase text-gray-400">
                                        Organizer Name
                                    </p>

                                    <p className="text-[14px] font-medium text-white">
                                        {item.name}
                                    </p>
                                </div>
                            </div>

                            {/* Organizer Email */}
                            <div className="flex w-1/4 items-center gap-3 border-r border-gray-500/40 pl-4">
                                <Mail
                                    size={13}
                                    strokeWidth={1.5}
                                    className="text-[#b9a9e8]"
                                />

                                <div>
                                    <p className="text-[12px] uppercase text-gray-400">
                                        Organizer Email
                                    </p>

                                    <p className="text-[14px] font-medium text-white">
                                        {item.email}
                                    </p>
                                </div>
                            </div>

                            {/* Organizer Phone */}
                            <div className="flex w-1/4 items-center gap-3 border-r border-gray-500/40 pl-4">
                                <Phone
                                    size={13}
                                    strokeWidth={1.5}
                                    className="text-[#b9a9e8]"
                                />

                                <div>
                                    <p className="text-[12px] uppercase text-gray-400">
                                        Organizer Phone Number
                                    </p>

                                    <p className="text-[14px] font-medium text-white">
                                        {item.mobile}
                                    </p>
                                </div>
                            </div>

                            {/* Organizer Department */}
                            <div className="flex w-1/4 items-center gap-3 pl-4">
                                <Network
                                    size={13}
                                    strokeWidth={1.5}
                                    className="text-[#b9a9e8]"
                                />

                                <div>
                                    <p className="text-[12px] uppercase text-gray-400">
                                        Organizer Department
                                    </p>

                                    <p className="text-[14px] font-medium text-white">
                                        {item.department}
                                    </p>
                                </div>
                            </div>

                        </div>
                    })}


                    {/* -------------------------- event details --------------------   */}

                </div>
            </section>
        </>
    )
}

export default ExpenditureView