import React, { useState } from "react";
import { Plus } from 'lucide-react'
import AdminStatcard from "./AdminStatcard";
import AdminUpcomingEventsTable from "./AdminUpcomingEventsTable";
import AdminDepartmentPieChart from "./AdminDepartmentPieChart";

// Admin Dashboard specific data
import calendarFill from "../../../assets/calendarFill.svg";
import hourglassFill from "../../../assets/hourglassFill.svg";
import tick from "../../../assets/tick.svg";
import circleTick from "../../../assets/circle-tick.svg";
import AdminBarChart from "./AdminBarChart";
// import AddEventType from "./AddEventType";
const statCardData = [
  {
    title: "Event Request",
    stats: [
      {
        label: "Total Event Request",
        value: 50,
        icon: calendarFill,
        bgColor: "from-[#2e2754] via-[#3d216f] to-[#5f1b89]",
        borderColor: "border-l-[#7357ff]",
        iconBg: "bg-[#a98cff]",
      },
      {
        label: "Approved Events",
        value: 50,
        icon: tick,
        bgColor: "from-[#163e46] via-[#0f5e4a] to-[#07864d]",
        borderColor: "border-l-[#20d18c]",
        iconBg: "bg-[#36d99b]",
      },
      {
        label: "Completed Events",
        value: 50,
        icon: circleTick,
        bgColor: "from-[#252d5c] via-[#25258a] to-[#2116a5]",
        borderColor: "border-l-[#7181ff]",
        iconBg: "bg-[#8292ff]",
      },
      {
        label: "Pending Approval Events",
        value: 50,
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
        value: 50,
        icon: calendarFill,
        bgColor: "from-[#2e2754] via-[#3d216f] to-[#5f1b89]",
        borderColor: "border-l-[#7357ff]",
        iconBg: "bg-[#a98cff]",
      },
      {
        label: "Approved Request",
        value: 50,
        icon: tick,
        bgColor: "from-[#163e46] via-[#0f5e4a] to-[#07864d]",
        borderColor: "border-l-[#20d18c]",
        iconBg: "bg-[#36d99b]",
      },
      {
        label: "Completed",
        value: 50,
        icon: circleTick,
        bgColor: "from-[#252d5c] via-[#25258a] to-[#2116a5]",
        borderColor: "border-l-[#7181ff]",
        iconBg: "bg-[#8292ff]",
      },
      {
        label: "Pending Approval Request",
        value: 50,
        icon: hourglassFill,
        bgColor: "from-[#342238] via-[#652049] to-[#9b1b59]",
        borderColor: "border-l-[#eb3f99]",
        iconBg: "bg-[#ef68ad]",
      },
    ],
  },
];

const AdminDashboard = () => {
  // const [isAddEventTypeOpen, setIsAddEventTypeOpen] = useState(false);
  return (
    <>
      <div className="main-body-container px-6">
        {/* heading */}
        <div className="flex flex-row items-center justify-between">
          <div className="heading mt-2">
            <h1 className="text-white text-lg font-medium">
              Admin Dashboard Overview
            </h1>
            <h1 className="text-[#FFFFFF80] text-sm">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s
            </h1>
          </div>
          {/* <div>
            <button 
              onClick={() => setIsAddEventTypeOpen(true)}
              className="flex items-center gap-2 cursor-pointer hover:bg-gradient-to-r hover:from-[#7c3ae7d2] hover:to-[#3f1e79] px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-[#7C3AE7] to-[#4E2593]"
            >
              <Plus size={17} /> Add Event type
            </button>
          </div> */}
        </div>

        {/* stat cards  */}
        <AdminStatcard data={statCardData} />

        {/* table */}
        <div className="main-container mt-4 max-h-[calc(100vh-220px)] overflow-auto table-custom-scrollbar w-full flex gap-3 ">
          {/* table  */}
          <AdminUpcomingEventsTable
            viewAllLink="/dashboard-admin/AdminEventsRequests"
            title="Upcoming Events"
          />
        </div>

        {/* bar chart  and pie chart*/}

        <div className="chart-container mt-4 flex gap-2 ">
          <AdminBarChart />
          {/* charts  */}
          <AdminDepartmentPieChart title="Events By Department" />
        </div>
      </div>

      {/* <AddEventType 
        isOpen={isAddEventTypeOpen} 
        onClose={() => setIsAddEventTypeOpen(false)} 
      /> */}
    </>
  );
};

export default AdminDashboard;
