import React, { useState } from "react";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";

export default function EventOrganizerDetails() {
  const [doc, setDoc] = useState("");
  const [finance, setFinance] = useState("");
  const [budget, setBudget] = useState("");
  const [department, setDepartment] = useState("");
  

  // logs 


  return (
    <div className="w-full p-4 sm:p-6 rounded-xl">
      <h1 className="text-white text-base sm:text-lg font-bold mb-6">
        Event Organizer Details
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <CustomSelect label="Completion of previous Event documentation" required value={doc} onChange={setDoc} options={["Yes", "No"]} />
        <CustomSelect label="Finance Required" required value={finance} onChange={setFinance} options={["Yes", "No"]} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <CustomSelect label="Is It approved in budget?" required value={budget} onChange={setBudget} options={["Yes", "No"]} />
        <CustomInput type="date" label="Requisition Date *" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <CustomInput label="Name of the Organizing Department / Centre *" />
        <CustomInput label="Organizing Co-Ordinator Name *" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <CustomInput label="Designation *" />
        <CustomSelect
          label="Department"
          required
          value={department}
          onChange={setDepartment}
          options={["AIML","AIDS","CSE","CYS","CSBS","ECE","CCE","EEE","MECH","S&H","Media","Transport"]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomInput label="Mobile Number *" type="tel" />
        <CustomInput label="Emp Id *" />
      </div>
    </div>
  );
}