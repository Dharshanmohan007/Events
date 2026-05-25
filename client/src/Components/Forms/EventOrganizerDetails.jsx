import React, { useRef } from "react";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";
import UploadIcon from '../../assets/upload.svg';
import OrganizerDetails from "./OrganizerDetails";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
  const [fileSizeError, setFileSizeError] = React.useState("");

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
    if (!selectedFile) return;
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFileSizeError(`File size must be less than ${MAX_FILE_SIZE_MB}MB. Selected file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB.`);
      // Reset input so same file can be re-selected after clearing
      e.target.value = "";
      return;
    }
    setFileSizeError("");
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    if (droppedFile.size > MAX_FILE_SIZE_BYTES) {
      setFileSizeError(`File size must be less than ${MAX_FILE_SIZE_MB}MB. Selected file is ${(droppedFile.size / 1024 / 1024).toFixed(2)}MB.`);
      return;
    }
    setFileSizeError("");
    setFile(droppedFile);
  };

  const handleDragOver = (e) => e.preventDefault();
  const openFilePicker = () => inputRef.current.click();

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setFileSizeError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full px-2 py-6 sm:px-1 rounded-xl">
      <h1 className="text-white text-base sm:text-lg font-bold mb-6 playfair">
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
            if (val === "Yes") setReason("");
            if (val === "No") { setFile(null); setFileSizeError(""); }
          }}
          options={["Yes", "No"]}
          placeholder="Select an option"
        />
        {errors.doc && <p className="text-red-400 text-xs mt-1">{errors.doc}</p>}
      </div>

      {/* File upload — shown only when doc === "Yes" */}
      {doc === "Yes" && (
        <div className="mb-7">
          <label className="block mb-1 text-sm text-white">
            Upload the previous Event Documentation *
          </label>
          <div
            onClick={!file ? openFilePicker : undefined}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`relative text-center p-4 text-sm w-full text-white rounded-lg flex flex-row items-center justify-center gap-3 ${!file ? "cursor-pointer" : "cursor-default"}`}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <rect
                x="1" y="1"
                width="calc(100% - 2px)" height="calc(100% - 2px)"
                rx="10" ry="10" fill="none"
                stroke={(errors.file || fileSizeError) ? "#f87171" : "#3A3A5A"}
                strokeWidth="2"
                strokeDasharray="10 4"
              />
            </svg>
            <img src={UploadIcon} alt="upload" className="w-7 h-8 opacity-80 z-10 flex-shrink-0" />
            {file ? (
              <div className="z-10 flex items-center gap-3 flex-wrap justify-center">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-purple-300 text-sm font-medium">{file.name}</span>
                  <span className="text-gray-400 text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-400/40 hover:border-red-300/60 rounded-md px-2 py-1 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Remove
                </button>
              </div>
            ) : (
              <p className="z-10">
                Drag and drop files here or{" "}
                <span className="text-purple-400 underline">choose file</span>
                <span className="block text-xs text-gray-500 mt-0.5">Max file size: {MAX_FILE_SIZE_MB}MB</span>
              </p>
            )}
          </div>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {fileSizeError && <p className="text-red-400 text-xs mt-1">{fileSizeError}</p>}
          {errors.file && !fileSizeError && <p className="text-red-400 text-xs mt-1">{errors.file}</p>}
        </div>
      )}

      {/* Reason — shown only when doc === "No" */}
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
              } text-white rounded-lg focus:outline-none focus:border-purple-500 placeholder-gray-500`}
              placeholder="Enter reason for no documentation"
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
            placeholder="Select an option"
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
            placeholder="Select an option"
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
            placeholder="Enter department name"
          />
          {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
        </div>
        <div>
          <CustomInput
            label="Total Number of Organizer's"
            type="number"
            value={numOrganizers}
            onChange={handleOrganizersChange}
            placeholder="Enter number of organizers"
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