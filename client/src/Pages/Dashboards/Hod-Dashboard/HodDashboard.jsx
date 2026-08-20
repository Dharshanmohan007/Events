import React from "react";
import HodStatcard from "./HodStatcard";
import HodUpcomingEventsTable from "./HodUpcomingEventsTable";

// HOD Dashboard specific data
import calendarFill from "../../../assets/calendarFill.svg";
import hourglassFill from "../../../assets/hourglassFill.svg";
import tick from "../../../assets/tick.svg";
import circleTick from "../../../assets/circle-tick.svg";

const statCardData = [
  {
    title: "Event Request",
    stats: [
      {
        label: "Total Event Request",
        value: 0,
        icon: calendarFill,
        bgColor: "from-[#2e2754] via-[#3d216f] to-[#5f1b89]",
        borderColor: "border-l-[#7357ff]",
        iconBg: "bg-[#a98cff]",
      },
      {
        label: "Approved Events",
        value: 0,
        icon: tick,
        bgColor: "from-[#163e46] via-[#0f5e4a] to-[#07864d]",
        borderColor: "border-l-[#20d18c]",
        iconBg: "bg-[#36d99b]",
      },
      {
        label: "Completed Events",
        value: 0,
        icon: circleTick,
        bgColor: "from-[#252d5c] via-[#25258a] to-[#2116a5]",
        borderColor: "border-l-[#7181ff]",
        iconBg: "bg-[#8292ff]",
      },
      {
        label: "Pending Approval Events",
        value: 0,
        icon: hourglassFill,
        bgColor: "from-[#342238] via-[#652049] to-[#9b1b59]",
        borderColor: "border-l-[#eb3f99]",
        iconBg: "bg-[#ef68ad]",
      },
    ],
  },
  {
    title: "Individual Request",
    stats: [
      {
        label: "Total Request",
        value: 0,
        icon: calendarFill,
        bgColor: "from-[#2e2754] via-[#3d216f] to-[#5f1b89]",
        borderColor: "border-l-[#7357ff]",
        iconBg: "bg-[#a98cff]",
      },
      {
        label: "Approved Request",
        value: 0,
        icon: tick,
        bgColor: "from-[#163e46] via-[#0f5e4a] to-[#07864d]",
        borderColor: "border-l-[#20d18c]",
        iconBg: "bg-[#36d99b]",
      },
      {
        label: "Completed",
        value: 0,
        icon: circleTick,
        bgColor: "from-[#252d5c] via-[#25258a] to-[#2116a5]",
        borderColor: "border-l-[#7181ff]",
        iconBg: "bg-[#8292ff]",
      },
      {
        label: "Pending Approval Request",
        value: 0,
        icon: hourglassFill,
        bgColor: "from-[#342238] via-[#652049] to-[#9b1b59]",
        borderColor: "border-l-[#eb3f99]",
        iconBg: "bg-[#ef68ad]",
      },
    ],
  },
];

const HodDashboard = () => {
  return (
    <>
      <div className="main-body-container px-6">
        {/* heading */}
        <div className="flex flex-row items-center justify-between">
          <div className="heading mt-2">
            <h1 className="text-white text-lg font-medium">
              HOD Dashboard Overview
            </h1>
            <h1 className="text-[#FFFFFF80] text-sm">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s
            </h1>
          </div>
        </div>

        {/* stat cards  */}
        <HodStatcard data={statCardData} />

        {/* table */}
        <div className="main-container mt-4 max-h-[calc(100vh-220px)] overflow-auto table-custom-scrollbar w-full flex gap-3 ">
          {/* table  */}
          <HodUpcomingEventsTable
            viewAllLink="/dashboard-hod/AdminEventsRequests"
            title="Upcoming Events"
          />
        </div>
      </div>
    </>
  );
};

export default HodDashboard;
