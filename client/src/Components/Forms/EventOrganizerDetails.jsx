import React, { useRef } from "react";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";
import UploadIcon from '../../assets/upload.svg';
import OrganizerDetails from "./OrganizerDetails";

export default function EventOrganizerDetails({
  doc, setDoc,
  finance, setFinance,
  budget, setBudget,
  department, setDepartment,
  file, setFile,
  reason, setReason,
  numOrganizers, setNumOrganizers,
  organizers, setOrganizers,
  errors = {},
}) {
  const inputRef = useRef();

  const handleOrganizersChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && parseInt(val) >= 1)) {
      setNumOrganizers(val);
      const count = parseInt(val) || 0;
      const newOrganizers = Array.from({ length: count }, (_, i) =>
        organizers[i] || { name: "", department: "", mobile: "", designation: "", empId: "" }
      );
      setOrganizers(newOrganizers);
    }
  };

  const organizerCount = parseInt(numOrganizers) > 0 ? parseInt(numOrganizers) : 0;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleDragOver = (e) => e.preventDefault();
  const openFilePicker = () => inputRef.current.click();

  return (
    <div className="w-full p-4 sm:p-6 rounded-xl">
      <h1 className="text-white text-base sm:text-lg font-bold mb-6">
        Event Organizer Details
      </h1>

      {/* Completion of previous Event documentation */}
      <div className="mb-6">
        <CustomSelect
          label="Completion of previous Event documentation"
          required
          value={doc}
          onChange={(val) => {
            setDoc(val);
            // Clear the opposite field when switching
            if (val === "Yes") setReason("");
            if (val === "No") setFile(null);
          }}
          options={["Yes", "No"]}
        />
        {errors.doc && <p className="text-red-400 text-xs mt-1">{errors.doc}</p>}
      </div>

      {/* Show File Upload ONLY when doc === "Yes" */}
      {doc === "Yes" && (
        <div className="mb-7">
          <label className="block mb-1 text-sm text-white">
            Upload the previous Event Documentation *
          </label>
          <div
            onClick={openFilePicker}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative text-center cursor-pointer p-4 text-sm w-full text-white rounded-lg flex flex-row items-center justify-center gap-3"
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <rect
                x="1" y="1"
                width="calc(100% - 2px)" height="calc(100% - 2px)"
                rx="10" ry="10" fill="none"
                stroke={errors.file ? "#f87171" : "#3A3A5A"}
                strokeWidth="2"
                strokeDasharray="10 4"
              />
            </svg>
            <img src={UploadIcon} alt="upload" className="w-7 h-8 opacity-80 z-10" />
            {file ? (
              <p className="z-10">{file.name}</p>
            ) : (
              <p className="z-10">
                Drag and drop files here or{" "}
                <span className="text-purple-400 underline">choose file</span>
              </p>
            )}
          </div>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {errors.file && <p className="text-red-400 text-xs mt-1">{errors.file}</p>}
        </div>
      )}

      {/* Show Reason ONLY when doc === "No" */}
      {doc === "No" && (
        <div className="mb-6">
          <div className="relative w-full">
            <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#16162A] z-10 pointer-events-none">
              If no enter the Reason *
            </span>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`p-5 text-sm w-full bg-transparent border ${
                errors.reason ? "border-red-400" : "border-[#3A3A5A]"
              } text-white rounded-lg focus:outline-none focus:border-purple-500`}
              placeholder="Enter Reason"
            />
          </div>
          {errors.reason && <p className="text-red-400 text-xs mt-1">{errors.reason}</p>}
        </div>
      )}

      {/* Budget & Finance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <CustomSelect
            label="Is It approved in budget?"
            required
            value={budget}
            onChange={setBudget}
            options={["Yes", "No"]}
          />
          {errors.budget && <p className="text-red-400 text-xs mt-1">{errors.budget}</p>}
        </div>
        <div>
          <CustomSelect
            label="Finance Required"
            required
            value={finance}
            onChange={setFinance}
            options={["Yes", "No"]}
          />
          {errors.finance && <p className="text-red-400 text-xs mt-1">{errors.finance}</p>}
        </div>
      </div>

      {/* Department & Organizers count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <CustomInput
            label="Name of the Organizing Department / Centre *"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
        </div>
        <div>
          <CustomInput
            label="Total Number of Organizer's"
            type="number"
            value={numOrganizers}
            onChange={handleOrganizersChange}
          />
          {errors.numOrganizers && <p className="text-red-400 text-xs mt-1">{errors.numOrganizers}</p>}
        </div>
      </div>

      {/* Organizer Cards */}
      {organizerCount > 0 && (
        <div className="flex flex-col gap-6 mt-2">
          {Array.from({ length: organizerCount }, (_, i) => (
            <OrganizerDetails
              key={i}
              dayIndex={i + 1}
              data={organizers[i] || {}}
              errors={(errors.organizers && errors.organizers[i]) || {}}
              onChange={(updated) => {
                const arr = [...organizers];
                arr[i] = updated;
                setOrganizers(arr);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}