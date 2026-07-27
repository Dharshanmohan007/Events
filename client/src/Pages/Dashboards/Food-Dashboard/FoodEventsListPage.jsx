import React from "react";
import DashboardHeader from "../ICTC-Dashboard/DashboardHeader";
import ModuleRequestListPage from "../../../Components/ModuleRequestListPage";

const FoodEventsListPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <DashboardHeader basePath="/dashboard-food" />
    <ModuleRequestListPage
      module="food"
      title="Food Request List Overview"
      description="View and manage food & refreshment event requests."
      detailViewPath="/dashboard-food/events/detailView"
      individualDetailViewPath="/dashboard/IndividualEvents"
      showIndividualTab={true}
      individualEndpoint="/api/individual-submissions/getrequest?module=food"
    />
  </section>
);

export default FoodEventsListPage;
