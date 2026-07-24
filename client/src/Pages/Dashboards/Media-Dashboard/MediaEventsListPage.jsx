import React from "react";
import DashboardHeader from "../ICTC-Dashboard/DashboardHeader";
import ModuleRequestListPage from "../../../Components/ModuleRequestListPage";

const MediaEventsListPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <DashboardHeader basePath="/dashboard-media" />
    <ModuleRequestListPage
      module="media"
      title="Media Request List Overview"
      description="View and manage media event requests."
      detailViewPath="/dashboard-media/events/detailView"
      individualDetailViewPath="/dashboard/IndividualEvents"
      showIndividualTab={true}
    />
  </section>
);

export default MediaEventsListPage;
