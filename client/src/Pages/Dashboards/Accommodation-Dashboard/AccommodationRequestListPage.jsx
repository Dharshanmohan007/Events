import React from "react";
import AccommodationHeader from "./AccommodationHeader";
import ModuleRequestListPage from "../../../Components/ModuleRequestListPage";

const AccommodationRequestListPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <AccommodationHeader />
    <ModuleRequestListPage
      module="accommodation"
      title="Accommodation Request List Overview"
      description="View and manage accommodation event requests."
      detailViewPath="/dashboard-accommodation/events/detailView"
      individualDetailViewPath="/dashboard/IndividualEvents"
    />
  </section>
);

export default AccommodationRequestListPage;
