import React from "react";
import DashboardHeader from "../ICTC-Dashboard/DashboardHeader";
import ModuleRequestListPage from "../../../Components/ModuleRequestListPage";

const TransportEventsListPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <DashboardHeader basePath="/dashboard-transports" />
    <ModuleRequestListPage
      module="transport"
      title="Transport Request List Overview"
      description="View and manage transport event requests."
      detailViewPath="/dashboard-transports/events/detailView"
      individualDetailViewPath="/dashboard/IndividualEvents"
      showIndividualTab={true}
      individualEndpoint="/api/individual-submissions/getrequest?module=transport"
    />
  </section>
);

export default TransportEventsListPage;
