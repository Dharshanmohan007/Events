import React from "react";
import FacultyDahsboardHeader from "./FacultyDahsboardHeader";
import EventsExpenditureDetailView from "../../../Components/EventsExpenditureDetailView";

const FacultyExpenditureDetailView = () => {
  return (
    <section className="bg-[#0b1326] poppins h-screen border overflow-auto table-custom-scrollbar">
      {/* Header */}
      <div className="header-container sticky top-0 z-50">
        <FacultyDahsboardHeader />
      </div>

      {/* Main Content */}
      <div className="main-body-container">
        <EventsExpenditureDetailView />
      </div>
    </section>
  );
};

export default FacultyExpenditureDetailView;
