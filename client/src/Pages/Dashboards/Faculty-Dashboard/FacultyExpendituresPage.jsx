import React from "react";
import FacultyDahsboardHeader from "./FacultyDahsboardHeader";
import FacultyExpenditureTable from "./FacultyExpenditureTable";

const FacultyExpendituresPage = () => {
  return (
    <section className="bg-[#0b1326] poppins h-screen border overflow-auto table-custom-scrollbar">
      {/* Header */}
      <div className="header-container sticky top-0 z-50">
        <FacultyDahsboardHeader />
      </div>

      {/* Main Content */}
      <div className="main-body-container px-6 ">
        {/* Heading */}
        <div className="heading mt-4">
          <h1 className="text-white text-lg font-medium">
            Faculty Expenditure Management
          </h1>
          <p className="text-[#FFFFFF80] text-sm">
            View and manage event and individual expenditures
          </p>
        </div>

        {/* Expenditure Table */}
        <div className="mt-4 ">
          <FacultyExpenditureTable />
        </div>
      </div>
    </section>
  );
};

export default FacultyExpendituresPage;
