import React from "react";
import DashboardHeader from "../ICTC-Dashboard/DashboardHeader";
import ModuleRequestListPage from "../../../Components/ModuleRequestListPage";

const PurchaseEventsListPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <DashboardHeader basePath="/dashboard-purchase" />
    <ModuleRequestListPage
      module="purchase"
      title="Purchase Request List Overview"
      description="View and manage purchase event requests."
      detailViewPath="/dashboard-purchase/events/detailView"
      individualDetailViewPath="/dashboard-purchase/events/individualDetailView"
      showIndividualTab={true}
      individualEndpoint="/api/individual-submissions/getrequest?module=purchase"
    />
  </section>
);

export default PurchaseEventsListPage;
