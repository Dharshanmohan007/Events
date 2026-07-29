import React from "react";
import FacultyDahsboardHeader from "./FacultyDahsboardHeader";
import ModuleIndividualDetailViewPage from "../../../Components/ModuleIndividualDetailViewPage";

const FacultyIndividualRequestDetailViewPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <FacultyDahsboardHeader />
    <ModuleIndividualDetailViewPage
      basePath="/dashboard-faculty"
      breadcrumbLabel="Faculty Dashboard"
      title="Individual Request Details"
    />
  </section>
);

export default FacultyIndividualRequestDetailViewPage;
