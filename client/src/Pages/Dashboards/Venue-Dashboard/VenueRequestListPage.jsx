import React from "react";
import VenueHeader from "./VenueHeader";
import ModuleRequestListPage from "../../../Components/ModuleRequestListPage";

const VenueRequestListPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <VenueHeader />
    <ModuleRequestListPage
      module="venue"
      title="Venue Request List Overview"
      description="View and manage venue event requests."
      detailViewPath="/dashboard-venue/events/detailView"
      individualDetailViewPath="/dashboard/IndividualEvents"
    />
  </section>
);

export default VenueRequestListPage;
