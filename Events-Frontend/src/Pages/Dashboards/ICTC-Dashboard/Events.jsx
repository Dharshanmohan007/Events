import React from "react";
import DashboardHeader from "./DashboardHeader";
import ModuleRequestListPage from "../../../Components/ModuleRequestListPage";

const IctcEventsListPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <DashboardHeader />
    <ModuleRequestListPage
      module="icts"
      title="ICTCS Event Overview"
      description="View and manage ICTS event requests."
      detailViewPath="/dashboard-ictcs/events/detailView"
      individualDetailViewPath="/dashboard/IndividualEvents"
    />
  </section>
);

export default IctcEventsListPage;
