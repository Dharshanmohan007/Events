import React from "react";
import TicketingNavbar from "./TicketingNavbar";
import RequestStats from "./RequestStats";
import TicketingUpcommingTable from "./TicketingUpcommingTable";

const Dashboard = () => {
  return (
    <>
      <main className="bg-[#0a0e18] h-screen">
        <TicketingNavbar />
        <div className="main-container space-y-4 mx-3">
          <RequestStats />
          <TicketingUpcommingTable />
        </div>
      </main>
    </>
  );
};

export default Dashboard;
