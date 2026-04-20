import React, { useState } from "react";
import CustomSelect from "../CustomSelect";

const inputBase =
  "w-full h-12 sm:h-14 bg-transparent border border-[#3A3A5A] text-white rounded-lg focus:outline-none focus:border-purple-500";

const FloatingInput = ({ label, type = "text" }) => (
  <div className="relative w-full">
    <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#16162A] z-10 pointer-events-none">
      {label}
    </span>
    <input
      type={type}
      className={`${inputBase} px-4`}
      placeholder=""
    />
  </div>
);

const FloatingDateInput = ({ label }) => (
  <div className="relative w-full">
    <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#16162A] z-10 pointer-events-none">
      {label}
    </span>
    <input
      type="date"
      className={`${inputBase} px-4 text-gray-400 [color-scheme:dark]`}
    />
  </div>
);

export default function EventOrganizerDetails() {
  const [doc, setDoc] = useState("");
  const [finance, setFinance] = useState("");
  const [budget, setBudget] = useState("");
  const [department, setDepartment] = useState("");

  return (
    <div className="w-full p-4 sm:p-6 rounded-xl">
      <h1 className="text-white text-base sm:text-lg font-bold mb-6">
        Event Organizer Details
      </h1>

      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <CustomSelect
          label="Completion of previous Event documentation"
          required
          value={doc}
          onChange={setDoc}
          options={["Yes", "No"]}
        />
        <CustomSelect
          label="Finance Required"
          required
          value={finance}
          onChange={setFinance}
          options={["Yes", "No"]}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <CustomSelect
          label="Is It approved in budget?"
          required
          value={budget}
          onChange={setBudget}
          options={["Yes", "No"]}
        />
        <FloatingDateInput label="Requisition Date *" />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <FloatingInput label="Name of the Organizing Department / Centre *" />
        <FloatingInput label="Organizing Co-Ordinator Name *" />
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <FloatingInput label="Designation *" />
        <CustomSelect
          label="Department"
          required
          value={department}
          onChange={setDepartment}
          options={["AIML","AIDS","CSE","CYS","CSBS","ECE","CCE","EEE","MECH","S&H","Media","Transport"]}
        />
      </div>

      {/* Row 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingInput label="Mobile Number *" type="tel" />
        <FloatingInput label="Emp Id *" />
      </div>
    </div>
  );
}