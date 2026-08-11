import React, { useRef,useEffect } from "react";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";
import UploadIcon from '../../assets/upload.svg';
import OrganizerDetails from "./OrganizerDetails";
import { jwtDecode } from "jwt-decode";
import { getFacultyById } from "../../services/events/facultyService";

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPE = "application/pdf";
const MAX_PRINCIPAL_FILE_SIZE_MB = 1;
const MAX_PRINCIPAL_FILE_SIZE_BYTES = MAX_PRINCIPAL_FILE_SIZE_MB * 1024 * 1024;

export default function EventOrganizerDetails({
  principalApprovalDocument,
  setprincipalApprovalDocument,
  doc,
  setDoc,
  finance,
  setFinance,
  advanceAmount,
  setAdvanceAmount,
  purposeOfAdvance,
  setPurposeOfAdvance,
  estimatedBudget,
  setEstimatedBudget,
  budget,
  setBudget,
  department,
  setDepartment,
  file,
  setFile,
  reason,
  setReason,
  numOrganizers,
  setNumOrganizers,
  organizers,
  setOrganizers,
  errors = {},
}) {
  const inputRef = useRef();
  const principalInputRef = useRef();
  const [fileSizeError, setFileSizeError] = React.useState("");
  const [principalFileError, setPrincipalFileError] = React.useState("");
  const [advanceAmountError, setAdvanceAmountError] = React.useState("");
  // const [advanceAmount, setAdvanceAmount] = useState(initialEventRequisition.advanceAmount || "");
  // const [advancePurpose, setAdvancePurpose] = useState(initialEventRequisition.advancePurpose || "");

  const handleOrganizersChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && parseInt(val) >= 0)) {
      setNumOrganizers(val);
      const count = parseInt(val) || 0;
      const newOrganizers = Array.from({ length: count + 1 }, (_, i) =>
        organizers[i] || { name: "", department: "", mobile: "", designation: "", empId: "", empEmail: "" }
      );
      setOrganizers(newOrganizers);
    }
  };

  const organizerCount = parseInt(numOrganizers) >= 0 ? parseInt(numOrganizers) : 0;

  useEffect(() => {
    const fetchMainOrganizer = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          if (decoded && decoded.facultyId) {
            const facultyData = await getFacultyById(decoded.facultyId);
            if (facultyData) {
              setOrganizers((prev) => {
                const arr = [...prev];
                if (!arr[0]?.name) {
                  arr[0] = {
                    ...arr[0],
                    name: facultyData.name || "",
                    department: facultyData.department || "",
                    mobile: facultyData.mobile || facultyData.phone || "",
                    designation: facultyData.designation || "",
                    empId: facultyData.empId || "",
                    empEmail: facultyData.email || "",
                  };
                }
                return arr;
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch main organizer details:", error);
      }
    };
    
    if (organizers && organizers.length > 0 && !organizers[0]?.name) {
      fetchMainOrganizer();
    } else if (!organizers || organizers.length === 0) {
      setOrganizers([{ name: "", department: "", mobile: "", designation: "", empId: "", empEmail: "" }]);
      fetchMainOrganizer();
    }
  }, []);

  const handlePrincipalFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== ALLOWED_FILE_TYPE) {
      setPrincipalFileError("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_PRINCIPAL_FILE_SIZE_BYTES) {
      setPrincipalFileError(
        `File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`
      );
      e.target.value = "";
      return;
    }

    setPrincipalFileError("");
    setprincipalApprovalDocument(selectedFile);
  };

  const handlePrincipalDrop = (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile) return;

    if (droppedFile.type !== ALLOWED_FILE_TYPE) {
      setPrincipalFileError("Only PDF files are allowed.");
      return;
    }

    if (droppedFile.size > MAX_PRINCIPAL_FILE_SIZE_BYTES) {
      setPrincipalFileError(
        `File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`
      );
      return;
    }

    setPrincipalFileError("");
    setprincipalApprovalDocument(droppedFile);
  };

  const openPrincipalFilePicker = () => {
    principalInputRef.current.click();
  };

  const handleRemovePrincipalFile = (e) => {
    e.stopPropagation();

    setprincipalApprovalDocument(null);
    setPrincipalFileError("");

    if (principalInputRef.current) {
      principalInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // console.log("Selected File:", selectedFile);

    if (!selectedFile) return;

    // PDF validation
    if (selectedFile.type !== ALLOWED_FILE_TYPE) {
      // console.log("Invalid File Type:", selectedFile.type);

      setFileSizeError("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    // File size validation
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      // console.log("File Too Large:", selectedFile.size);

      setFileSizeError(
        `File size must be less than ${MAX_FILE_SIZE_MB}MB. Selected file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB.`
      );

      e.target.value = "";
      return;
    }

    // console.log("PDF Uploaded Successfully:", selectedFile.name);

    setFileSizeError("");
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];

    // console.log("Dropped File:", droppedFile);

    if (!droppedFile) return;

    // PDF validation
    if (droppedFile.type !== ALLOWED_FILE_TYPE) {
      // console.log("Invalid File Type:", droppedFile.type);

      setFileSizeError("Only PDF files are allowed.");
      return;
    }

    // File size validation
    if (droppedFile.size > MAX_FILE_SIZE_BYTES) {
      // console.log("File Too Large:", droppedFile.size);

      setFileSizeError(
        `File size must be less than ${MAX_FILE_SIZE_MB}MB. Selected file is ${(droppedFile.size / 1024 / 1024).toFixed(2)}MB.`
      );

      return;
    }

    // console.log("PDF Dropped Successfully:", droppedFile.name);

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
      {/* Principal Approval Form Upload */}
      <div className="mb-7">
        <label className="block mb-1 text-sm text-white">
          Principal Approval Form
        </label>

        <div
          onClick={!principalApprovalDocument ? openPrincipalFilePicker : undefined}
          onDrop={handlePrincipalDrop}
          onDragOver={handleDragOver}
          className={`relative text-center p-4 text-sm w-full text-white rounded-lg flex flex-row items-center justify-center gap-3 ${
            !principalApprovalDocument ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="10"
              ry="10"
              fill="none"
              stroke={
                errors.principalApprovalDocument || principalFileError
                  ? "#f87171"
                  : "#3A3A5A"
              }
              strokeWidth="2"
              strokeDasharray="10 4"
            />
          </svg>

          <img
            src={UploadIcon}
            alt="upload"
            className="w-7 h-8 opacity-80 z-10 flex-shrink-0"
          />

          {principalApprovalDocument ? (
            <div className="z-10 flex items-center gap-3 flex-wrap justify-center">
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>

                <span className="text-purple-300 text-sm font-medium">
                  {principalApprovalDocument.name}
                </span>

                <span className="text-gray-400 text-xs">
                  ({(principalApprovalDocument.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>

              <button
                type="button"
                onClick={handleRemovePrincipalFile}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-400/40 hover:border-red-300/60 rounded-md px-2 py-1 transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>

                Remove
              </button>
            </div>
          ) : (
            <p className="z-10">
              Drag and drop files here or{" "}
              <span className="text-purple-400 underline">
                choose file
              </span>

              <span className="block text-xs text-gray-500 mt-0.5">
                Only PDF files supported • Max file size: 1MB
              </span>
            </p>
          )}
        </div>

        <input
          type="file"
          accept=".pdf,application/pdf"
          ref={principalInputRef}
          onChange={handlePrincipalFileChange}
          className="hidden"
        />

        {principalFileError && (
          <p className="text-red-400 text-xs mt-1">
            {principalFileError}
          </p>
        )}

        {errors.principalApprovalDocument && !principalFileError && (
          <p className="text-red-400 text-xs mt-1">
            {errors.principalApprovalDocument}
          </p>
        )}
      </div>
      {/* <div
        className={`${
          !principalApprovalDocument
            ? "opacity-50 pointer-events-none select-none"
            : ""
        }`}
      > */}
      {/* Completion of previous Event documentation */}
      <div className="mb-6">
        <CustomSelect
          label="Completion of previous Event documentation"
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
            Upload the previous Event Documentation
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
                <span className="block text-xs text-gray-500 mt-0.5">Only PDF files supported • Max file size: {MAX_FILE_SIZE_MB}MB</span>
              </p>
            )}
          </div>
          <input
            type="file"
            accept=".pdf,application/pdf"
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
              If no enter the Reason
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
            onChange={(value) => {
              setFinance(value);

              if (value === "No") {
                setEstimatedBudget("");
                setAdvanceAmount("");
                setPurposeOfAdvance("");
              }
            }}
            options={["Yes", "No"]}
            placeholder="Select an option"
          />
          {errors.finance && <p className="text-red-400 text-xs mt-1">{errors.finance}</p>}
        </div>
        {finance === "Yes" && (
          <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Estimated Event Budget */}
            <div>
              <div className="relative">
                {estimatedBudget && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                    ₹
                  </span>
                )}

                <CustomInput
                  label="Estimated Event Budget"
                  value={estimatedBudget}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setEstimatedBudget(value);

                    if (
                      advanceAmount &&
                      value &&
                      Number(advanceAmount) > Number(value)
                    ) {
                      setAdvanceAmountError(
                        "Advance amount should be less than or equal to the estimated budget."
                      );
                    } else {
                      setAdvanceAmountError("");
                    }
                  }}
                  placeholder="Enter estimated budget"
                  className={estimatedBudget ? "pl-8" : ""}
                />
              </div>

              {errors.estimatedBudget && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.estimatedBudget}
                </p>
              )}
            </div>

            {/* Advance Amount */}
            <div>
              <div className="relative">
                {advanceAmount && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                    ₹
                  </span>
                )}

                <CustomInput
                  label="I require Cash / In Bank / Travel Advance / Online Payment of Rs."
                  value={advanceAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    setAdvanceAmount(value);

                    if (
                      value &&
                      estimatedBudget &&
                      Number(value) > Number(estimatedBudget)
                    ) {
                      setAdvanceAmountError(
                        "Advance amount should be less than or equal to the estimated budget."
                      );
                    } else {
                      setAdvanceAmountError("");
                    }
                  }}
                  placeholder="Enter amount"
                  className={advanceAmount ? "pl-8" : ""}
                />
              </div>

              {advanceAmountError ? (
                <p className="text-red-400 text-xs mt-1">
                  {advanceAmountError}
                </p>
              ) : (
                errors.advanceAmount && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.advanceAmount}
                  </p>
                )
              )}
            </div>

            {/* Purpose of Advance */}
            <div className="sm:col-span-2">
              <CustomInput
                label="Purpose of Advance"
                value={purposeOfAdvance}
                onChange={(e) => setPurposeOfAdvance(e.target.value)}
                placeholder="Enter purpose"
              />

              {errors.purposeOfAdvance && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.purposeOfAdvance}
                </p>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Department & Organizers count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <CustomSelect
            label="Name of the Organizing Department / Centre "
            required
            searchable
            value={department}
            onChange={(val) => {
              // Departments that should be Title Case
              const titleCaseDepartments = ["Placement", "Library"];
              // Convert based on department type
              const formattedValue = titleCaseDepartments.includes(val)
                ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
                : val.toUpperCase();
              setDepartment(formattedValue);
            }}
            options={
              [
                "CCE",
                "MECH",
                "AIML",
                "CSE",
                "ECE",
                "EEE",
                "AI&DS",
                "CFRD",
                "IQAC",
                "MATHS",
                "S&H",
                "IR",
                "CSBS",
                "IT",
                "CYS",
                "PLACEMENT",
                "PD",
                "INNOVATION",
                "COE",
                "HR",
              ]}
            placeholder="Select an option"
          />
          {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
        </div>
        <div>
          <CustomInput
            label="Total Number of CO - Organizer's"
            type="number"
            value={numOrganizers}
            onChange={handleOrganizersChange}
            placeholder="Enter number of organizers"
          />
          {errors.numOrganizers && <p className="text-red-400 text-xs mt-1">{errors.numOrganizers}</p>}
        </div>
      </div>

      {/* Organizer Cards */}
      <div className="flex flex-col gap-6 mt-2">
        <OrganizerDetails
          title="Main Organizer"
          data={organizers[0] || {}}
          errors={(errors.organizers && errors.organizers[0]) || {}}
          onChange={(updated) => {
            const arr = [...organizers];
            arr[0] = updated;
            setOrganizers(arr);
          }}
        />
        {organizerCount > 0 && Array.from({ length: organizerCount }, (_, i) => (
          <OrganizerDetails
            key={i + 1}
            title={`Co - Organizer ${i + 1}`}
            data={organizers[i + 1] || {}}
            errors={(errors.organizers && errors.organizers[i + 1]) || {}}
            onChange={(updated) => {
              const arr = [...organizers];
              arr[i + 1] = updated;
              setOrganizers(arr);
            }}
          />
        ))}
      </div>
    </div>
    // </div>
  );
}