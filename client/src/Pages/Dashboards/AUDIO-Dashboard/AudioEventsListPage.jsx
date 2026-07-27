import React from "react";
import DashboardHeader from "../ICTC-Dashboard/DashboardHeader";
import ModuleRequestListPage from "../../../Components/ModuleRequestListPage";

const AudioEventsListPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <DashboardHeader basePath="/dashboard-audio" />
    <ModuleRequestListPage
      module="audio"
      title="Audio Request List Overview"
      description="View and manage audio event requests."
      detailViewPath="/dashboard-audio/events/detailView"
      individualDetailViewPath="/dashboard/IndividualEvents"
    />
  </section>
);

export default AudioEventsListPage;
