import React, { useEffect, useState, useRef } from "react";
import CustomDateTimePicker from "../../Components/CustomDateTimePicker";
import FormSubmitted from "./FormSubmitted";

import UploadIcon from "../../assets/upload.svg";

import {
  Plus,
  MapPin,
  GripVertical,
  X,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

import { jwtDecode } from "jwt-decode";
import { decodeToken, isTokenExpired } from "../../utils/tokenUtils";

import { API_BASE } from "../../utils/apiConfig";

const createTransportForm = () => ({
  pickupDateTime: null,
  dropDateTime: null,
  pickupLocation: "",
  dropLocation: "",
  checkpoints: [],
  draggedIndex: null,
  totalPassengers: "",

  // VEHICLES
  selectedVehicles: [],
  vehicleCounts: {},
  availableVehicleCounts: {},
  inventoryLoading: false,
  showVehicleDropdown: false,

  // STAFF
  staffOptionType: "",
  showStaffDropdown: false,
  staffDetails: [],

  specialRequirement: "",
  financeRequired: "No",
  advanceAmount: "",
  advancePurpose: "",
  estimatedEventBudget: "",
  showFinanceDropdown: false,
});

const floatingLabelClass =
  "absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none";

const formFloatingLabelClass = `${floatingLabelClass} bg-[#1b1b35]`;

const staffFloatingLabelClass = `${floatingLabelClass} bg-[#26264a]`;

const TransportDetailsPage = () => {
  const [transportForms, setTransportForms] = useState([createTransportForm()]);

  const [employeeId, setEmployeeId] = useState("");
  const [token, setToken] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const MAX_PRINCIPAL_FILE_SIZE_MB = 1;
  const MAX_PRINCIPAL_FILE_SIZE_BYTES =
    MAX_PRINCIPAL_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_PRINCIPAL_FILE_TYPE = "application/pdf";

  const principalInputRef = useRef(null);
  const [principalApprovalDocument, setPrincipalApprovalDocument] =
    useState(null);
  const [principalFileError, setPrincipalFileError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);

      try {
        const decoded = jwtDecode(storedToken);

        if (decoded?.id) {
          setEmployeeId(decoded.id);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  const handlePrincipalFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== ALLOWED_PRINCIPAL_FILE_TYPE) {
      setPrincipalFileError("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_PRINCIPAL_FILE_SIZE_BYTES) {
      setPrincipalFileError(
        `File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`,
      );
      e.target.value = "";
      return;
    }

    setPrincipalFileError("");
    setPrincipalApprovalDocument(selectedFile);
  };

  const handlePrincipalDrop = (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile) return;

    if (droppedFile.type !== ALLOWED_PRINCIPAL_FILE_TYPE) {
      setPrincipalFileError("Only PDF files are allowed.");
      return;
    }

    if (droppedFile.size > MAX_PRINCIPAL_FILE_SIZE_BYTES) {
      setPrincipalFileError(
        `File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`,
      );
      return;
    }

    setPrincipalFileError("");
    setPrincipalApprovalDocument(droppedFile);
  };

  const handlePrincipalRemove = (e) => {
    e.stopPropagation();
    setPrincipalApprovalDocument(null);
    setPrincipalFileError("");
    if (principalInputRef.current) {
      principalInputRef.current.value = "";
    }
  };

  const openPrincipalFilePicker = () => {
    if (principalInputRef.current) {
      principalInputRef.current.click();
    }
  };

  const handleUploadDragOver = (e) => e.preventDefault();

  const vehicleOptions = ["Bus", "Van", "Car"];

  // =========================
  // ADD FORM
  // =========================
  const addTransportForm = () => {
    setTransportForms((prev) => [...prev, createTransportForm()]);
  };

  // =========================
  // UPDATE FIELD
  // =========================
  const updateTransportForm = (formIndex, updates) => {
    setTransportForms((prevForms) => {
      const updatedForms = [...prevForms];
      updatedForms[formIndex] = {
        ...updatedForms[formIndex],
        ...updates,
      };
      return updatedForms;
    });
  };

  const updateFormField = async (formIndex, field, value) => {
    const isDateField = field === "pickupDateTime" || field === "dropDateTime";
    const nextForm = {
      ...transportForms[formIndex],
      [field]: value,
    };

    if (isDateField) {
      nextForm.availableVehicleCounts = {};
      nextForm.inventoryLoading = true;
    }

    updateTransportForm(formIndex, nextForm);

    if (isDateField) {
      if (nextForm.pickupDateTime && nextForm.dropDateTime) {
        await fetchVehicleInventory(formIndex, nextForm.pickupDateTime, nextForm.dropDateTime);
      } else {
        updateTransportForm(formIndex, { inventoryLoading: false });
      }
    }
  };

  // =========================
  // CHECKPOINTS
  // =========================
  const addCheckpoint = (formIndex) => {
    const updatedForms = [...transportForms];

    updatedForms[formIndex].checkpoints.push("");

    setTransportForms(updatedForms);
  };

  const updateCheckpoint = (formIndex, checkpointIndex, value) => {
    const updatedForms = [...transportForms];

    updatedForms[formIndex].checkpoints[checkpointIndex] = value;

    setTransportForms(updatedForms);
  };

  const removeCheckpoint = (formIndex, checkpointIndex) => {
    const updatedForms = [...transportForms];

    updatedForms[formIndex].checkpoints = updatedForms[
      formIndex
    ].checkpoints.filter((_, i) => i !== checkpointIndex);

    setTransportForms(updatedForms);
  };

  // =========================
  // DRAG
  // =========================
  const handleDragStart = (formIndex, index) => {
    const updatedForms = [...transportForms];

    updatedForms[formIndex].draggedIndex = index;

    setTransportForms(updatedForms);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (formIndex, dropIndex) => {
    const updatedForms = [...transportForms];

    const draggedIndex = updatedForms[formIndex].draggedIndex;

    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const checkpoints = [...updatedForms[formIndex].checkpoints];

    const draggedItem = checkpoints[draggedIndex];

    checkpoints.splice(draggedIndex, 1);

    checkpoints.splice(dropIndex, 0, draggedItem);

    updatedForms[formIndex].checkpoints = checkpoints;

    updatedForms[formIndex].draggedIndex = null;

    setTransportForms(updatedForms);
  };

  // =========================
  // STAFF
  // =========================
  const updateStaffDetail = (formIndex, staffIndex, field, value) => {
    const updatedForms = [...transportForms];

    updatedForms[formIndex].staffDetails[staffIndex][field] = value;

    setTransportForms(updatedForms);
  };

  // =========================
  // VEHICLE LABELS
  // =========================
  const getVehicleLabel = (vehicleType) => {
    switch (vehicleType) {
      case "Car":
        return "How many cars needed *";

      case "Bus":
        return "How many buses needed *";

      case "Van":
        return "How many vans needed *";

      default:
        return "How many vehicles needed *";
    }
  };

  const getVehiclePlaceholder = (vehicleType) => {
    switch (vehicleType) {
      case "Car":
        return "Enter number of cars";

      case "Bus":
        return "Enter number of buses";

      case "Van":
        return "Enter number of vans";

      default:
        return "Enter vehicle count";
    }
  };

  // =========================
  // HELPERS
  // =========================
  // Convert UTC ISO string back to local date for display
  const convertUTCToLocal = (utcString) => {
    if (!utcString) return null;
    const date = new Date(utcString);
    return date; // new Date() automatically interprets as local when used with getHours(), etc.
  };

  // Format date/time in Indian Standard Time (IST / Asia/Kolkata)
  const formatInIST = (date) => {
    if (!date) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(date);
    } catch (e) {
      return date.toLocaleString();
    }
  };

  const formatDateOnly = (date) => {
    if (!date) return null;
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
    if (!aStart || !aEnd || !bStart || !bEnd) return false;
    const aS = new Date(aStart).getTime();
    const aE = new Date(aEnd).getTime();
    const bS = new Date(bStart).getTime();
    const bE = new Date(bEnd).getTime();
    return aS <= bE && bS <= aE;
  };

  const getDisplayedAvailability = (formIndex, vehicle) => {
    const form = transportForms[formIndex];
    const available = form.availableVehicleCounts?.[vehicle];
    if (available === undefined || available === null) return undefined;

    // subtract counts reserved by other forms that overlap this form's date range
    const reserved = transportForms.reduce((sum, otherForm, idx) => {
      if (idx === formIndex) return sum;
      if (!rangesOverlap(form.pickupDateTime, form.dropDateTime, otherForm.pickupDateTime, otherForm.dropDateTime)) return sum;
      const v = Number(otherForm.vehicleCounts?.[vehicle]) || 0;
      return sum + v;
    }, 0);

    const remaining = Number(available) - reserved;
    return remaining >= 0 ? remaining : 0;
  };

  const formatDateWithOffset = (date) => {
    if (!date) return null;
    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const mo = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const offsetMin = -date.getTimezoneOffset();
    const sign = offsetMin >= 0 ? "+" : "-";
    const absOff = Math.abs(offsetMin);
    const offH = pad(Math.floor(absOff / 60));
    const offM = pad(absOff % 60);

    return `${y}-${mo}-${d}T${hh}:${mm}:${ss}${sign}${offH}:${offM}`;
  };

  const isFinanceYes = (value) => String(value || "").toLowerCase() === "yes";

  const fetchVehicleInventory = async (formIndex, pickupDate, dropDate) => {
    if (!pickupDate || !dropDate) return;

    const pickup = formatDateOnly(new Date(pickupDate));
    const drop = formatDateOnly(new Date(dropDate));
    const candidateUrls = [
      `${API_BASE}/api/transport-inventory/available?pickupDateTime=${encodeURIComponent(
        pickup,
      )}&dropDateTime=${encodeURIComponent(drop)}`,
      `http://10.57.1.245:5005/api/transport-inventory/available?pickupDateTime=${encodeURIComponent(
        pickup,
      )}&dropDateTime=${encodeURIComponent(drop)}`,
    ];

    let inventory = [];
    let lastError = null;

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          lastError = new Error(
            `Transport inventory API returned ${res.status} for ${url}`,
          );
          console.warn(lastError.message);
          continue;
        }

        const json = await res.json();
        // Backend may return either { data: [...] } or [...] directly — handle both
        const candidateData = json?.data ?? json;
        if (Array.isArray(candidateData)) {
          inventory = candidateData;
        } else if (Array.isArray(candidateData?.data)) {
          inventory = candidateData.data;
        } else {
          inventory = [];
        }
        // Debugging aid when availability isn't present
        console.debug("Transport inventory response:", { url, json, inventory });
        break;
      } catch (error) {
        lastError = error;
        console.warn("Transport inventory fetch error:", error, "url=", url);
      }
    }

    const availableVehicleCounts = inventory.reduce((acc, item) => {
      if (item?.vehicleType) {
        acc[item.vehicleType] = item.availableCount ?? 0;
      }
      return acc;
    }, {});

    if (!inventory.length && lastError) {
      console.warn("Failed to load transport inventory:", lastError);
    }

    setTransportForms((prev) => {
      const updated = [...prev];
      updated[formIndex] = {
        ...updated[formIndex],
        availableVehicleCounts,
        inventoryLoading: false,
      };
      return updated;
    });
  };

  const buildTransportPayload = (form) => {
    const formData = new FormData();

    formData.append("employee", employeeId || "6a0411af4579d3137b255e70");

    if (principalApprovalDocument) {
      formData.append("principalApprovalForm", principalApprovalDocument);
    }

    formData.append(
      "pickupDateTime",
      form.pickupDateTime
        ? new Date(
            form.pickupDateTime.getTime() -
              form.pickupDateTime.getTimezoneOffset() * 60000,
          ).toISOString()
        : "",
    );

    formData.append(
      "dropDateTime",
      form.dropDateTime
        ? new Date(
            form.dropDateTime.getTime() -
              form.dropDateTime.getTimezoneOffset() * 60000,
          ).toISOString()
        : "",
    );

    formData.append("pickupLocation", form.pickupLocation.trim());

    formData.append("dropLocation", form.dropLocation.trim());

    formData.append(
      "checkpoints",
      JSON.stringify(
        (form.checkpoints || []).map((location) => ({
          location,
        })),
      ),
    );

    formData.append("totalPassengers", Number(form.totalPassengers) || 0);

    formData.append(
      "vehicles",
      JSON.stringify(
        (form.selectedVehicles || []).map((vehicle) => ({
          type: vehicle,
          count: Number(form.vehicleCounts?.[vehicle]) || 0,
        })),
      ),
    );

    formData.append(
      "numberOfBusNeeded",
      Number(form.vehicleCounts?.["Bus"]) || 0,
    );

    formData.append(
      "numberOfAccompanyingStaff",
      Number(form.staffOptionType) || 0,
    );

    formData.append(
      "accompanyingStaff",
      JSON.stringify(
        (form.staffDetails || []).map((staff) => ({
          name: staff.name,
          mobile: Number(staff.mobile),
        })),
      ),
    );

    formData.append("specialRequirements", form.specialRequirement);

    formData.append("financeRequired", form.financeRequired);
    formData.append("advanceAmount", form.financeRequired === "Yes" ? Number(form.advanceAmount) || 0 : 0);
    formData.append("advancePurpose", form.financeRequired === "Yes" ? form.advancePurpose || "" : "");
    formData.append(
      "estimatedEventBudget",
      form.financeRequired === "Yes" ? Number(form.estimatedEventBudget) || 0 : 0,
    );

    // Also include backend-expected `estimatedAmount` for compatibility
    formData.append(
      "estimatedAmount",
      form.financeRequired === "Yes" ? Number(form.estimatedEventBudget) || 0 : 0,
    );

    formData.append("status", "Pending");

    return formData;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    console.log('[TransportDetails] handleSubmit start');
    const errors = [];

    // if (!principalApprovalDocument) {
    //   errors.push("Principal Approval Form is required.");
    // }

    transportForms.forEach((form, index) => {
      if (!form.pickupDateTime) {
        errors.push(`Form ${index + 1}: Pickup Date & Time is required`);
      }

      if (!form.dropDateTime) {
        errors.push(`Form ${index + 1}: Drop Date & Time is required`);
      }

      if (!form.pickupLocation.trim()) {
        errors.push(`Form ${index + 1}: Pickup Location is required`);
      }

      if (!form.dropLocation.trim()) {
        errors.push(`Form ${index + 1}: Drop Location is required`);
      }

      if (!form.totalPassengers) {
        errors.push(`Form ${index + 1}: Total passengers required`);
      }

      if (!form.selectedVehicles || form.selectedVehicles.length === 0) {
        errors.push(`Form ${index + 1}: Vehicle type required`);
      }

      (form.selectedVehicles || []).forEach((vehicle) => {
        if (!form.vehicleCounts?.[vehicle]) {
          errors.push(`Form ${index + 1}: ${vehicle} count required`);
        }
      });

      // Finance validation
      if (form.financeRequired === "Yes") {
        const advanceAmount = parseFloat(form.advanceAmount);
        const totalBudget = parseFloat(form.estimatedEventBudget);

        if (!form.advanceAmount || Number.isNaN(advanceAmount) || advanceAmount <= 0) {
          errors.push(`Form ${index + 1}: Advance amount is required.`);
        }

        if (!form.advancePurpose || !form.advancePurpose.trim()) {
          errors.push(`Form ${index + 1}: Advance purpose is required.`);
        }

        if (
          !form.estimatedEventBudget ||
          Number.isNaN(totalBudget) ||
          totalBudget <= 0
        ) {
          errors.push(`Form ${index + 1}: Total budget amount is required.`);
        }

        if (
          !Number.isNaN(advanceAmount) &&
          !Number.isNaN(totalBudget) &&
          advanceAmount > totalBudget
        ) {
          errors.push(
            `Form ${index + 1}: Advance amount cannot exceed the Estimated Budget amount.`,
          );
        }
      }
    });

    setValidationErrors(errors);
    setSubmitMessage("");

    if (errors.length) return;

    // Validate stored token before attempting submit. If token is missing/expired,
    // show an error instead of forcing a navigation to the login page.
    const authToken = localStorage.getItem("token") || token;
    const decodedAuthToken = decodeToken(authToken);

    if (!authToken || !decodedAuthToken || isTokenExpired(decodedAuthToken)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setValidationErrors(["Session expired or invalid token. Please login again."]);
      return;
    }

    setIsSubmitting(true);

    try {
      let lastResponseData = null;
      for (const form of transportForms) {
        const payload = buildTransportPayload(form);

        // Log payload to verify timezone handling
        for (let pair of payload.entries()) {
          console.log(pair[0], pair[1]);
        }
        console.log("✅ Pickup sent as:", payload.pickupDateTime);
        console.log("✅ Drop sent as:", payload.dropDateTime);

        const response = await fetch(`${API_BASE}/api/transports`, {
          method: "POST",
          headers: {
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
          body: payload,
        });

        
        const responseText = await response.text();
        let responseData;

        try {
          responseData = responseText ? JSON.parse(responseText) : null;
        } catch {
          responseData = null;
        }

        if (!response.ok) {
          const serverMessage =
            responseData?.message ||
            responseText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ||
            `Transport submission failed (HTTP ${response.status}).`;

          console.error("Transport API error:", {
            status: response.status,
            response: responseData || responseText,
          });
          throw new Error(serverMessage);
        }

        // Keep last parsed response so it can be used after the loop
        lastResponseData = responseData;

        // Log response with IST formatting
        console.log("📥 Response received:", responseData?.data);
        console.log(
          "⏰ Pickup stored as (UTC):",
          responseData?.data?.pickupDateTime,
        );
        const pickupIST = responseData?.data?.pickupDateTime
          ? formatInIST(new Date(responseData.data.pickupDateTime))
          : "N/A";
        console.log("🇮🇳 Pickup displayed as (IST):", pickupIST);
        const dropIST = responseData?.data?.dropDateTime
          ? formatInIST(new Date(responseData.data.dropDateTime))
          : "N/A";
        console.log("🇮🇳 Drop displayed as (IST):", dropIST);
      }

      setValidationErrors([]);
      setSubmitSuccess(true);

      const firstForm = transportForms[0] || {};
      const financeEnabled = firstForm?.financeRequired === "Yes";

      if (financeEnabled) {
        const respData = lastResponseData?.data || lastResponseData || {};
        const receiptRequestNo =
          respData?.requestNo ||
          respData?.data?.requestNo ||
          respData?.transport?.requestNo ||
          respData?.data?.transport?.requestNo ||
          "";
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        const employeePayload = {
          name: firstForm?.employeeName || storedUser?.name || respData?.employeeName || "",
          empId: firstForm?.empId || respData?.empId || storedUser?.empId || "",
          designation: firstForm?.designation || storedUser?.designation || respData?.designation || "",
          department: firstForm?.department || storedUser?.department || respData?.department || "",
        };

        const submitRespPayload = {
          requestNo: receiptRequestNo,
          response: lastResponseData,
          employeeId:
            respData?.employee ||
            respData?.employeeId ||
            employeeId ||
            employeePayload.empId ||
            "",
        };

        await import("../../utils/ReportPdf").then(({ default: ReportPdf }) => {
          return ReportPdf({
            formData: {
              selectDate: firstForm?.pickupDateTime || "",
              advanceAmount: firstForm?.advanceAmount || "",
              advancePurpose: firstForm?.advancePurpose || "",
              employeeName: employeePayload.name,
              empId: employeePayload.empId,
              designation: employeePayload.designation,
              department: employeePayload.department,
            },
            employee: employeePayload,
            submitResponse: submitRespPayload,
          });
        });
      }
    } catch (error) {
      console.error("Transport submission failed:", error);
      setValidationErrors([
        error.message || "Unable to submit transport forms.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return <FormSubmitted advanceData={transportForms[0] || {}} showDownloadButton={false} />;
  }

  return (
    <div className="transport-form min-h-screen bg-[#141428] text-white p-5">
      <style>{`
          .transport-form input:focus,
          .transport-form textarea:focus,
          .transport-form button:focus,
          .transport-form .transport-select-control:focus {
            border-color: #3b82f6 !important;
            box-shadow: none !important;
            outline: none !important;
          }
        `}</style>

      <h1 className="text-3xl font-bold mb-6">Transport Details Form</h1>

      <div className="mb-6">
        <label className="block mb-2 text-sm text-white">
          Principal Approval Form (without uploading this document you cannot
          proceed further)
        </label>

        <div
          onClick={
            !principalApprovalDocument ? openPrincipalFilePicker : undefined
          }
          onDrop={handlePrincipalDrop}
          onDragOver={handleUploadDragOver}
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
              stroke={principalFileError ? "#f87171" : "#3A3A5A"}
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
                  ({(principalApprovalDocument.size / 1024 / 1024).toFixed(2)}{" "}
                  MB)
                </span>
              </div>

              <button
                type="button"
                onClick={handlePrincipalRemove}
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
              <span className="text-purple-400 underline">choose file</span>
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
          <p className="text-red-400 text-xs mt-1">{principalFileError}</p>
        )}
      </div>

      {/* ADD BUTTON */}
      <div className="flex justify-end mb-5">
        <button
          type="button"
          onClick={addTransportForm}
          className="
              flex
              items-center
              gap-2
              bg-[#8b5cf6]
              hover:bg-[#7c3aed]
              px-5
              py-2.5
              rounded-md
              transition-all
            "
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {/* FORMS */}
      {transportForms.map((form, formIndex) => (
        <div
          key={formIndex}
          className="
                bg-[#1b1b35]
                border
                border-[#2a2a40]
                rounded-2xl
                p-6
                mb-8
              "
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#8b5cf6]">
              Transport Form {formIndex + 1}
            </h2>

            {formIndex !== 0 && (
              <button
                type="button"
                onClick={() => {
                  const updatedForms = transportForms.filter(
                    (_, index) => index !== formIndex,
                  );

                  setTransportForms(updatedForms);
                }}
                className="
      w-[42px]
      h-[42px]
      p-2
      rounded-full
      bg-[#f3d7d7]
      flex
      items-center
      justify-center
      transition-all
     
    "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff2b2b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            )}
          </div>

          {/* DATE PICKERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CustomDateTimePicker
              label="Pickup Date & Time *"
              value={form.pickupDateTime}
              onChange={(date) =>
                updateFormField(formIndex, "pickupDateTime", date)
              }
              placeholder="Select pickup date & time"
              labelBgClass="bg-[#1b1b35]"
            />

            <CustomDateTimePicker
              label="Drop Date & Time *"
              value={form.dropDateTime}
              onChange={(date) =>
                updateFormField(formIndex, "dropDateTime", date)
              }
              placeholder="Select drop date & time"
              labelBgClass="bg-[#1b1b35]"
            />
          </div>

          {/* PICKUP */}
          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>Pickup Location *</label>

            <div
              className="
                    flex
                    items-center
                    gap-3
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                 
                    focus-within:border-[#3b82f6]
                    focus-within:ring-0
                    focus-within:ring-[#3b82f6]
                    transition-all
                  "
            >
              <MapPin size={18} />

              <input
                type="text"
                value={form.pickupLocation}
                onChange={(e) =>
                  updateFormField(formIndex, "pickupLocation", e.target.value)
                }
                placeholder="Enter pickup location"
                className="
                      bg-transparent
                      outline-none
                      w-full
                      text-white
                    "
              />
            </div>
          </div>

          {/* CHECKPOINT */}
          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={() => addCheckpoint(formIndex)}
              className="flex items-center gap-2 text-[#9b5cff] font-medium"
            >
              <Plus
                size={16}
                className="bg-[#9b5cff] rounded-full p-0.5 text-white"
              />
              Add Checkpoint
            </button>
          </div>

          {/* CHECKPOINTS */}
          {(form.checkpoints || []).length > 0 && (
            <div className="mt-5 space-y-3">
              {(form.checkpoints || []).map((checkpoint, checkpointIndex) => (
                <div
                  key={checkpointIndex}
                  draggable
                  onDragStart={() =>
                    handleDragStart(formIndex, checkpointIndex)
                  }
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(formIndex, checkpointIndex)}
                  className="
                          bg-[#282846]
                          rounded-md
                          px-4
                          py-2
                          flex
                          items-center
                          justify-between
                        "
                >
                  <div className="flex  items-center gap-3 w-full">
                    <GripVertical size={18} className="text-[#8d8da8]" />

                    <MapPin size={18} />

                    <input
                      type="text"
                      value={checkpoint}
                      onChange={(e) =>
                        updateCheckpoint(
                          formIndex,
                          checkpointIndex,
                          e.target.value,
                        )
                      }
                      placeholder={`Checkpoint ${checkpointIndex + 1}`}
                      className="
                              bg-transparent
                              outline-none
                              text-white
                              w-full
                              border
                              border-[#2F2F47]
                              rounded-md
                              px-2
                              py-2
                              focus:border-[#3b82f6]
                              focus:ring-0
                              focus:ring-[#3b82f6]
                            "
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCheckpoint(formIndex, checkpointIndex)}
                  >
                    <X size={18} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* DROP */}
          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>Drop Location *</label>

            <div
              className="
                    flex
                    items-center
                    gap-3
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                   
                    focus-within:border-[#3b82f6]
                    focus-within:ring-0
                    focus-within:ring-[#3b82f6]
                    transition-all
                  "
            >
              <MapPin size={18} />

              <input
                type="text"
                value={form.dropLocation}
                onChange={(e) =>
                  updateFormField(formIndex, "dropLocation", e.target.value)
                }
                placeholder="Enter drop location"
                className="
                      bg-transparent
                      outline-none
                      w-full
                      text-white
                    "
              />
            </div>
          </div>

          {/* PASSENGERS + VEHICLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div className="relative">
              <label className={formFloatingLabelClass}>
                Total Number of Passengers *
              </label>

              <input
                type="number"
                value={form.totalPassengers}
                onChange={(e) =>
                  updateFormField(formIndex, "totalPassengers", e.target.value)
                }
                placeholder="Enter total passengers"
                className="
                      w-full
                     
                      border
                      border-[#2F2F47]
                      rounded-md
                      px-4
                      py-3
                      outline-none
                      focus-within:border-[#3b82f6]
                    focus-within:ring-0
                    focus-within:ring-[#3b82f6]
                    transition-all
                    
                    "
              />
            </div>

            {/* VEHICLE DROPDOWN */}
            <div className="relative">
              <label className={formFloatingLabelClass}>
                Type of Vehicle Needed *
              </label>

              <button
                type="button"
                onClick={() =>
                  updateFormField(
                    formIndex,
                    "showVehicleDropdown",
                    !form.showVehicleDropdown,
                  )
                }
                className="
                      transport-select-control
                      w-full
                     
                      border
                      border-[#2F2F47]
                      rounded-md
                      px-4
                      py-3
                      flex
                      justify-between
                      items-center
                      cursor-pointer
                      focus:border-[#3b82f6]
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#3b82f6]/20
                      hover:border-[#3b82f6]
                      transition-all
                    "
              >
                <span className="truncate">
                  {(form.selectedVehicles || []).length > 0
                    ? form.selectedVehicles.join(", ")
                    : "Select Vehicle"}
                </span>

                <ChevronDown size={18} />
              </button>

              {form.showVehicleDropdown && (
                <div className="absolute w-full mt-2 bg-[#26264a] border border-[#2F2F47] rounded-md overflow-hidden z-50">
                  {vehicleOptions.map((option, index) => {
                    const isSelected = (form.selectedVehicles || []).includes(
                      option,
                    );

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          const updatedForms = [...transportForms];

                          const currentVehicles =
                            updatedForms[formIndex].selectedVehicles || [];

                          let updatedVehicles = [];

                          if (isSelected) {
                            updatedVehicles = currentVehicles.filter(
                              (v) => v !== option,
                            );

                            const newVehicleCounts = {
                              ...updatedForms[formIndex].vehicleCounts,
                            };
                            delete newVehicleCounts[option];
                            updatedForms[formIndex].vehicleCounts = newVehicleCounts;
                          } else {
                            updatedVehicles = [...currentVehicles, option];
                          }

                          updatedForms[formIndex].selectedVehicles =
                            updatedVehicles;

                          setTransportForms(updatedForms);

                          const nextForm = {
                            ...updatedForms[formIndex],
                            selectedVehicles: updatedVehicles,
                          };
                          if (nextForm.pickupDateTime && nextForm.dropDateTime) {
                            fetchVehicleInventory(
                              formIndex,
                              nextForm.pickupDateTime,
                              nextForm.dropDateTime,
                            );
                          }
                        }}
                        className={`
                                 px-4
                                 py-3
                                 cursor-pointer
                                 flex
                                 items-center
                                 justify-between
                                 ${
                                   isSelected
                                     ? "bg-[#492A6F] text-white"
                                     : "hover:bg-[#492A6F]"
                                 }
                               `}
                      >
                        <span>{option}</span>

                        {isSelected && <span>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {form.pickupDateTime && form.dropDateTime && (
                <div className="mt-2 text-xs text-gray-400">
                  {form.inventoryLoading ? (
                    <span>Checking available vehicle counts...</span>
                  ) : Object.keys(form.availableVehicleCounts).length > 0 ? (
                    <span>
                      Available counts: {vehicleOptions
                        .map((vehicle) => {
                          const raw = form.availableVehicleCounts[vehicle];
                          const displayed = getDisplayedAvailability(formIndex, vehicle);
                          const toShow = displayed === undefined ? (raw !== undefined ? raw : null) : displayed;
                          return toShow !== null && toShow !== undefined
                            ? `${vehicle}: ${toShow}`
                            : null;
                        })
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  ) : (
                    <span>No availability data available for selected dates.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* VEHICLE COUNT */}
          {(form.selectedVehicles || []).length > 0 && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {(form.selectedVehicles || []).map((vehicle, index) => {
                const vehicleCount = (form.selectedVehicles || []).length;
                const isFullWidth =
                  vehicleCount === 1 || (vehicleCount === 3 && index === 2);

                return (
                  <div
                    key={index}
                    className={
                      isFullWidth ? "relative md:col-span-2" : "relative"
                    }
                  >
                    <label className={formFloatingLabelClass}>
                      {getVehicleLabel(vehicle)}
                    </label>

                    <input
                      type="number"
                      value={form.vehicleCounts?.[vehicle] || ""}
                      onChange={(e) => {
                        const updatedForms = [...transportForms];

                        updatedForms[formIndex].vehicleCounts = {
                          ...updatedForms[formIndex].vehicleCounts,
                          [vehicle]: e.target.value,
                        };

                        setTransportForms(updatedForms);
                      }}
                      placeholder={
                        (form.availableVehicleCounts?.[vehicle] !== undefined)
                          ? `${getVehiclePlaceholder(vehicle)} (Available: ${getDisplayedAvailability(formIndex, vehicle)})`
                          : getVehiclePlaceholder(vehicle)
                      }
                      className="
                            w-full
                         
                            border
                            border-[#2F2F47]
                            rounded-md
                            px-4
                            py-3
                            outline-none
                            focus:border-[#3b82f6]
                            focus:ring-0
                            focus:ring-[#3b82f6]
                            transition-all
                          "
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* STAFF COUNT */}
          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>
              Number of Accompanying Staff *
            </label>

            <input
              type="number"
              min="0"
              max="10"
              value={form.staffOptionType}
              onChange={(e) => {
                const value = e.target.value;

                const updatedForms = [...transportForms];

                updatedForms[formIndex].staffOptionType = value;

                const count = Number(value);

                updatedForms[formIndex].staffDetails = Array.from(
                  {
                    length: count || 0,
                  },
                  (_, index) => ({
                    name:
                      updatedForms[formIndex].staffDetails?.[index]?.name || "",
                    mobile:
                      updatedForms[formIndex].staffDetails?.[index]?.mobile ||
                      "",
                  }),
                );

                setTransportForms(updatedForms);
              }}
              placeholder="Enter staff count"
              className="
                    w-full
                   
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-[#3b82f6]
                    focus:ring-0
                    focus:ring-[#3b82f6]
                    transition-all
                  "
            />
          </div>

          {/* STAFF DETAILS */}
          {(form.staffDetails || []).length > 0 && (
            <div className="mt-5 space-y-5">
              {(form.staffDetails || []).map((staff, staffIndex) => (
                <div
                  key={staffIndex}
                  className="
                          bg-[#26264a]
                          border
                          border-[#34345c]
                          rounded-2xl
                          p-5
                        "
                >
                  <h3 className="text-[#b06cff] font-semibold mb-4">
                    Staff {staffIndex + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* NAME */}
                    <div className="relative">
                      <label className={staffFloatingLabelClass}>
                        Accompanying Staff Name *
                      </label>

                      <input
                        type="text"
                        value={staff.name}
                        onChange={(e) =>
                          updateStaffDetail(
                            formIndex,
                            staffIndex,
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder="Enter staff name"
                        className="
                                w-full
                                bg-[#26264a]
                                border
                                border-[#2F2F47]
                                rounded-xl
                                px-4
                                py-4
                                outline-none
                                text-white
                                focus:border-[#3b82f6]
                                focus:ring-0
                                focus:ring-[#3b82f6]
                                transition-all
                              "
                      />
                    </div>

                    {/* MOBILE */}
                    <div className="relative">
                      <label className={staffFloatingLabelClass}>
                        Accompanying Staff Mobile Number *
                      </label>

                      <input
                        type="number"
                        value={staff.mobile}
                        onChange={(e) =>
                          updateStaffDetail(
                            formIndex,
                            staffIndex,
                            "mobile",
                            e.target.value,
                          )
                        }
                        placeholder="Enter mobile number"
                        className="
                                w-full
                                bg-[#26264a]
                                border
                                border-[#2F2F47]
                                rounded-xl
                                px-4
                                py-4
                                outline-none
                                text-white
                                focus:border-[#3b82f6]
                                focus:ring-0
                                focus:ring-[#3b82f6]
                                transition-all
                              "
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>Finance Required *</label>

            <button
              type="button"
              onClick={() =>
                updateTransportForm(formIndex, {
                  showFinanceDropdown: !form.showFinanceDropdown,
                })
              }
              className="
                transport-select-control
                w-full
                border
                border-[#2F2F47]
                rounded-md
                px-4
                py-3
                flex
                justify-between
                items-center
                cursor-pointer
                focus:border-[#3b82f6]
                transition-all
              "
            >
              <span className={form.financeRequired === "Yes" ? "text-white" : "text-[#8d8da8]"}>
                {form.financeRequired}
              </span>

              <ChevronDown size={18} />
            </button>

            {form.showFinanceDropdown && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#2F2F47] rounded-md overflow-hidden z-50">
                {[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }].map((opt) => (
                  <div
                    key={opt.label}
                    onClick={() =>
                              updateTransportForm(formIndex, {
                        showFinanceDropdown: false,
                        financeRequired: opt.value,
                        advanceAmount: opt.value === "No" ? "" : undefined,
                        advancePurpose: opt.value === "No" ? "" : undefined,
                        estimatedEventBudget: opt.value === "No" ? "" : undefined,
                      })
                    }
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                      form.financeRequired === opt.value
                        ? "bg-[#492A6F] text-white"
                        : "text-white hover:bg-[#492A6F] hover:text-white"
                    }`}
                  >
                    <span>{opt.label}</span>

                    {form.financeRequired === opt.value && <span>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {form.financeRequired === "Yes" && (
            <div className="grid grid-cols-1 gap-5 mb-5">
              <div className="relative order-first md:col-span-2">
                <label className={formFloatingLabelClass}>Estimated Budget Amount (Rs.)</label>

                <input
                  type="number"
                  min="0"
                  value={form.estimatedEventBudget}
                  onChange={(e) => updateFormField(formIndex, "estimatedEventBudget", e.target.value)}
                  placeholder="0"
                  className="
                    w-full
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                    text-white
                    outline-none
                  "
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className={formFloatingLabelClass}>Advance Amount (Rs.)</label>

                  <input
                    type="number"
                    min="0"
                    value={form.advanceAmount}
                    onChange={(e) => updateFormField(formIndex, "advanceAmount", e.target.value)}
                    placeholder="0"
                    className={`
                      w-full
                      border
                      rounded-md
                      px-4
                      py-3
                      text-white
                      outline-none
                      ${
                        Number(form.advanceAmount) > Number(form.estimatedEventBudget) &&
                        form.estimatedEventBudget !== ""
                          ? "border-red-500"
                          : "border-[#2F2F47]"
                      }
                    `}
                  />

                  {Number(form.advanceAmount) > Number(form.estimatedEventBudget) &&
                    form.estimatedEventBudget !== "" && (
                      <p className="mt-1 text-sm text-red-400">
                        Advance amount cannot exceed the estimated event budget.
                      </p>
                    )}
                </div>

                <div className="relative">
                  <label className={formFloatingLabelClass}>Purpose of Advance</label>

                  <input
                    type="text"
                    value={form.advancePurpose}
                    onChange={(e) => updateFormField(formIndex, "advancePurpose", e.target.value)}
                    placeholder="Purpose"
                    className="
                      w-full
                      border
                      border-[#2F2F47]
                      rounded-md
                      px-4
                      py-3
                      text-white
                      outline-none
                    "
                  />
                </div>
              </div>
            </div>
          )}

          {/* SPECIAL REQUIREMENT */}
          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>
              Special Requirement
            </label>

            <textarea
              rows={4}
              value={form.specialRequirement}
              onChange={(e) =>
                updateFormField(formIndex, "specialRequirement", e.target.value)
              }
              placeholder="Enter any special requirements"
              className="
                    w-full
                   
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                    outline-none
                    resize-none
                    focus:border-[#3b82f6]
                    focus:ring-0
                    focus:ring-[#3b82f6]
                    transition-all
                  "
            />
          </div>
        </div>
      ))}

      {/* ERRORS */}
      {validationErrors.length > 0 && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200">
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SUCCESS */}
      {submitMessage && (
        <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-200">
          {submitMessage}
        </div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="
              bg-[#8b5cf6]
              hover:bg-[#7c3aed]
              disabled:opacity-60
              disabled:cursor-not-allowed
              text-white
              font-medium
              px-8
              py-3
              rounded-md
              transition-all
              duration-300
              flex
              items-center
              gap-2
            "
        >
          {isSubmitting ? "Submitting..." : "Submit"}

          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default TransportDetailsPage;
