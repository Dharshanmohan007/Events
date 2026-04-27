import React, { useState, useRef } from "react";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";
import UploadIcon from '../../assets/upload.svg';
import OrganizerDetails from "./OrganizerDetails";

export default function EventOrganizerDetails() {
  const [doc, setDoc] = useState("");
  const [finance, setFinance] = useState("");
  const [budget, setBudget] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState(null);
  const inputRef = useRef();
  const [numDays, setNumDays] = useState("");

  const handleDaysChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && parseInt(val) >= 1)) {
      setNumDays(val);
    }
  };

  const dayCount = parseInt(numDays) > 0 ? parseInt(numDays) : 0;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const openFilePicker = () => {
    inputRef.current.click();
  };

  return (
    <div className="w-full p-4 sm:p-6 rounded-xl">
      <h1 className="text-white text-base sm:text-lg font-bold mb-6">
        Event Organizer Details
      </h1>

      <div className=" mb-6">
        <CustomSelect label="Completion of previous Event documentation" required value={doc} onChange={setDoc} options={["Yes", "No"]} />
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-white">
          Upload the previous Event Documentation *
        </label>

        <div
          onClick={openFilePicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="p-4 text-sm w-full bg-transparent border border-dashed border-[#3A3A5A] text-white rounded-lg cursor-pointer flex flex-row items-center justify-center gap-3"
        >
          <img src={UploadIcon} alt="upload" className="w-7 h-8 opacity-80" />
          {file ? (
            <p>{file.name}</p>
          ) : (
            <p>
              Drag and drop files here or{" "}
              <span className="text-purple-400 underline">
                choose file
              </span>
            </p>
          )}
        </div>

        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="mb-6">
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#16162A] z-10 pointer-events-none">If no enter the Reason*</span>
          <input className="p-5 text-sm w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg focus:outline-none focus:border-purple-500"  placeholder="Enter Reason"/>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <CustomSelect label="Is It approved in budget?" required value={budget} onChange={setBudget} options={["Yes", "No"]} />
        <CustomSelect label="Finance Required" required value={finance} onChange={setFinance} options={["Yes", "No"]} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <CustomInput label="Name of the Organizing Department / Centre *" />
        <CustomInput label="Total Number of Organizer’s" type="number" value={numDays} onChange={handleDaysChange}/>
        {/* <CustomInput type="date" label="Requisition Date *" /> */}
      </div>

      {dayCount > 0 && (
        <div className='flex flex-col gap-6 mt-2'>
          {Array.from({ length: dayCount }, (_, i) => (
            <OrganizerDetails key={i} dayIndex={i + 1} />
          ))}
        </div>
      )}

      
    </div>
  );
}