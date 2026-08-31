import React from "react";

import {
  UserRound,
  Mail,
  Phone,
  Network,
  PartyPopper,
  CalendarDays,
  Clock3,
} from "lucide-react";

const EventHeaderData = ({ data }) => {
  const formatDateIST = (utcDate) => {
    if (!utcDate) return "";

    return new Date(utcDate).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime12Hour = (time) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");

    const hour = Number(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${String(formattedHour).padStart(2, "0")}:${minutes} ${period}`;
  };

  console.log("event header data : ", data);
  return (
    <>
      <div className="w-full rounded-xl border border-[#3a4358] bg-[#20283a] p-3">
        {/* ------------------------- event details -----------------  */}

        <div className="w-full rounded-xl border border-[#202a3e] bg-[#293246] p-3">
          <div className="flex items-center">
            {/* Event Name */}
            <div className="flex w-[28%] items-center gap-3 px-2">
              <PartyPopper
                size={18}
                strokeWidth={1.8}
                className="text-[#c5a9ff]"
              />

              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#858c9d]">
                  Event Name
                </p>
                <p className="text-[16px] font-semibold text-white">
                  {data?.eventDetails?.eventName}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-16 w-px bg-[#596174]" />

            {/* Event Date */}
            <div className="flex w-[23%] items-center gap-3 px-5">
              <CalendarDays
                size={18}
                strokeWidth={1.8}
                className="text-[#c5a9ff]"
              />

              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#858c9d]">
                  Event Date
                </p>
                <p className="text-[16px] font-semibold text-white">
                  {data?.eventDetails?.eventSchedule?.map((item) => {
                    return <p>{formatDateIST(item.eventDate)}</p>;
                  })}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-16 w-px bg-[#596174]" />

            {/* Event Start Time */}
            <div className="flex w-[25%] items-center gap-3 px-5">
              <Clock3 size={18} strokeWidth={1.8} className="text-[#c5a9ff]" />

              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#858c9d]">
                  Event Start Time
                </p>
                <p className="text-[16px] font-semibold text-white">
                  {data?.eventDetails?.eventSchedule?.map((item) => {
                    return <p>{formatTime12Hour(item.startTime)}</p>;
                  })}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-16 w-px bg-[#596174]" />

            {/* Event End Time */}
            <div className="flex flex-1 items-center gap-3 px-5">
              <Clock3 size={18} strokeWidth={1.8} className="text-[#c5a9ff]" />

              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#858c9d]">
                  Event End Time
                </p>
                <p className="text-[16px] font-semibold text-white">
                  {data?.eventDetails?.eventSchedule?.map((item) => {
                    return <p>{formatTime12Hour(item.endTime)}</p>;
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --------------- Organizer details -------------------- */}
        {data?.organizerDetails?.organizers?.map((item) => {
          return (
            <div className="flex items-center rounded-lg border border-[#30394d] mt-2 bg-[#293246] px-2 py-3">
              {/* Organizer Name */}
              <div className="flex w-[23%] items-center gap-3 px-2">
                <UserRound
                  size={17}
                  strokeWidth={1.8}
                  className="text-[#c5a9ff]"
                />

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#8c93a3]">
                    Organizer Name
                  </p>
                  <p className="text-[14px] font-semibold text-white">
                    {item.name}
                  </p>
                </div>
              </div>

              <div className="h-14 w-px bg-[#596174]" />

              {/* Organizer Email */}
              <div className="flex w-[27%] items-center gap-3 px-5">
                <Mail size={17} strokeWidth={1.8} className="text-[#c5a9ff]" />

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#8c93a3]">
                    Organizer Email
                  </p>
                  <p className="text-[14px] font-semibold text-white">
                    {item.email}
                  </p>
                </div>
              </div>

              <div className="h-14 w-px bg-[#596174]" />

              {/* Phone Number */}
              <div className="flex w-[29%] items-center gap-3 px-5">
                <Phone size={17} strokeWidth={1.8} className="text-[#c5a9ff]" />

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#8c93a3]">
                    Organizer Phone Number
                  </p>
                  <p className="text-[14px] font-semibold text-white">
                    {item.mobile}
                  </p>
                </div>
              </div>

              <div className="h-14 w-px bg-[#596174]" />

              {/* Department */}
              <div className="flex flex-1 items-center gap-3 px-5">
                <Network
                  size={17}
                  strokeWidth={1.8}
                  className="text-[#c5a9ff]"
                />

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#8c93a3]">
                    Organizer Department
                  </p>
                  <p className="text-[14px] font-semibold text-white">
                    {item.department}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default EventHeaderData;
