import React, { useState, useEffect, useRef, useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomDateTimePicker from "../../Components/CustomDateTimePicker";
import IndividualExternalTransportDetails from "./IndividualExternalTransportDetails";
import FormSubmitted from "./FormSubmitted";
import { buildIndividualReportHtml } from "./IndividualReport";
import { API_BASE } from "../../utils/apiConfig";
import UploadIcon from "../../assets/upload.svg";

const INDIVIDUAL_EVENT_API_BASE = import.meta.env.DEV ? "" : API_BASE;

const formatTimeForPayload = (time) => {
  const match = String(time || "")
    .trim()
    .match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i);
  if (!match) return "";

  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return `${String(hours).padStart(2, "0")}:${match[2]}:00`;
};

const formatTimeForDisplay = (date) => {
  const hours = date.getHours();
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

const getFormDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  const time = formatTimeForPayload(timeValue) || "11:00:00";
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

const Eventsattended = () => {
  const [form, setForm] = useState({
    type: "",
    name: "",
    participants: "",
    expectedOutcome: "",
    transport: "",
    expense: "",
    programFrom: "",
    programTo: "",
    onDutyFrom: "",
    onDutyTo: "",
    onDutyFromTime: "",
    onDutyToTime: "",
    foodRequired: "No",
    foodAmount: "",
  
    transportRequired: "No",
    transportAmount: "",
    accommodationRequired: "No",
    accommodationAmount: "",
    financeRequired: "",
    estimatedAmount: "",
    advanceAmount: "",
    advancePurpose: "",
    advanceToBeReceivedWithin: "",
    otherRequirements: "",
  });
  const [participantDetails, setParticipantDetails] = useState([]);
  const [externalTransportDetails, setExternalTransportDetails] = useState([]);
  const [principalApprovalFile, setPrincipalApprovalFile] = useState(null);
  const [principalFileError, setPrincipalFileError] = useState("");
  const principalInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateOffCampusDateTime = (dateField, timeField, dateTime) => {
    if (!dateTime) {
      updateField(dateField, "");
      updateField(timeField, "");
      return;
    }

    const date = `${dateTime.getFullYear()}-${String(dateTime.getMonth() + 1).padStart(2, "0")}-${String(dateTime.getDate()).padStart(2, "0")}`;
    updateField(dateField, date);
    updateField(timeField, formatTimeForDisplay(dateTime));
  };

  const handlePrincipalFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setPrincipalApprovalFile(null);
      setPrincipalFileError("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 1024 * 1024) {
      setPrincipalApprovalFile(null);
      setPrincipalFileError("File size must be less than 1MB.");
      event.target.value = "";
      return;
    }

    setPrincipalFileError("");
    setPrincipalApprovalFile(selectedFile);
  };

  const handlePrincipalDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (droppedFile.type !== "application/pdf") {
      setPrincipalFileError("Only PDF files are allowed.");
      return;
    }

    if (droppedFile.size > 1024 * 1024) {
      setPrincipalFileError("File size must be less than 1MB.");
      return;
    }

    setPrincipalFileError("");
    setPrincipalApprovalFile(droppedFile);
  };

  const handlePrincipalRemove = (event) => {
    event.stopPropagation();
    setPrincipalApprovalFile(null);
    setPrincipalFileError("");
    if (principalInputRef.current) principalInputRef.current.value = "";
  };

  const openPrincipalFilePicker = () => principalInputRef.current?.click();

  useEffect(() => {
    const count = Number(form.participants) || 0;

    setParticipantDetails((prev) => {
      const next = Array.from({ length: count }, (_, index) => ({
        name: prev[index]?.name || "",
        department: prev[index]?.department || "",
        phone: prev[index]?.phone || "",
      }));
      return next;
    });
  }, [form.participants]);

  const updateParticipantField = (index, field, value) => {
    setParticipantDetails((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const getDayDiff = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

    const differenceInMs = end.getTime() - start.getTime();
    const totalDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    return totalDays >= 0 ? totalDays + 1 : 0;
  };

  const totalOnDutyDays = getDayDiff(form.onDutyFrom, form.onDutyTo);
  const onDutyFromDateTime = useMemo(
    () => getFormDateTime(form.onDutyFrom, form.onDutyFromTime),
    [form.onDutyFrom, form.onDutyFromTime],
  );
  const onDutyToDateTime = useMemo(
    () => getFormDateTime(form.onDutyTo, form.onDutyToTime),
    [form.onDutyTo, form.onDutyToTime],
  );

  const participantCount = Number(form.participants) || 0;
  const participantRows = Array.from(
    { length: participantCount },
    (_, index) => ({
      id: index + 1,
      label: `${index + 1}. Participants Name`,
      department: `${index + 1}. Participants Department`,
      phone: `${index + 1}. Participants Phone Number`,
    }),
  );

  const formatDateTime = (dateValue, timeValue) => {
    if (!dateValue) return "";
    return `${dateValue}T${timeValue || "00:00:00"}`;
  };

  const openSubmittedReport = (payload, responseData) => {
    const responseReportData = responseData?.data || responseData || {};
    const storedIqacNumber =
      Number(localStorage.getItem("individualEventIqacNumber")) || 0;
    const apiIqacNumber = Number(responseReportData.iqacNumber) || 0;
    const nextIqacNumber = apiIqacNumber || storedIqacNumber + 1;

    localStorage.setItem(
      "individualEventIqacNumber",
      String(Math.max(storedIqacNumber, nextIqacNumber)),
    );

    const reportData = {
      ...responseReportData,
      iqacNumber: String(nextIqacNumber).padStart(3, "0"),
    };

    const html = buildIndividualReportHtml({
      payload,
      reportData,
    });

    sessionStorage.setItem("individualEventReportHtml", html);
    navigate("/individual-report", { state: { reportHtml: html } });
  };

  const normalizeExternalTransport = (items = []) =>
    items.map((item) => {
      const classOrBerth = Array.isArray(item.classOrBerth)
        ? item.classOrBerth
            .map((entry) => {
              const match = String(entry).match(/\(([^)]+)\)/);
              return match ? match[1] : String(entry).trim();
            })
            .filter(Boolean)
            .join(", ")
        : item.classOrBerth ||
          (item.travelOption === "Flight" ? "Economy" : "");

      const trainNumber =
        item.travelOption === "Train" ? item.trainNumber || "" : "";
      const flightNumber =
        item.travelOption === "Flight" ? item.flightNumber || "" : "";
      const transportNumber = trainNumber || flightNumber;

      return {
        travelOption: item.travelOption || "",
        travelDate: item.travelDate
          ? new Date(item.travelDate).toISOString()
          : "",
        from: item.from || "",
        to: item.to || "",
        totalPassengers: Number(item.totalPassengers) || 0,
        numberOfPassengers: Number(item.totalPassengers) || 0,
        classOrBerth,
        travelClass: classOrBerth,
        transportNumber,
        trainNumber,
        flightNumber,
        externalTransportSpecialRequirement:
          item.specialRequirements?.trim() || "None",
        passengers: (item.passengers || []).map((passenger) => ({
          name: passenger.name || "",
          phone: String(passenger.phone || "").trim(),
          phoneNumber: String(passenger.phone || "").trim(),
          email: passenger.email || "",
          age: Number(passenger.age) || 0,
          gender: passenger.gender || "",
          designation: passenger.designation || "",
          organization: passenger.organization || "",
        })),
      };
    });

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    setSubmitMessage("");
    sessionStorage.removeItem("individualEventReportHtml");

    const missingFields = [];
    if (!form.type) missingFields.push("program type");
    if (!String(form.name || "").trim()) missingFields.push("program name");
    if (
      String(form.participants).trim() === "" ||
      !Number.isFinite(Number(form.participants)) ||
      Number(form.participants) < 0
    )
      missingFields.push("number of participants");
    if (!form.programFrom || !form.programTo)
      missingFields.push("program date range");
    if (!form.onDutyFrom || !form.onDutyTo)
      missingFields.push("on-duty date range");
    if (!form.onDutyFromTime || !form.onDutyToTime)
      missingFields.push("on-duty time range");
    if (!form.financeRequired) missingFields.push("Finance Required");
    if (!principalApprovalFile) {
      missingFields.push("Principal Approval Form");
    }

    if (
      (form.onDutyFromTime && !formatTimeForPayload(form.onDutyFromTime)) ||
      (form.onDutyToTime && !formatTimeForPayload(form.onDutyToTime))
    ) {
      setSubmitMessage("Enter the Off Campus time in hh:mm AM/PM format.");
      return;
    }

    if (missingFields.length > 0) {
      setSubmitMessage(`Please complete the ${missingFields.join(", ")}.`);
      return;
    }

    if (
      form.transport === "yes" &&
      (!Array.isArray(externalTransportDetails) ||
        externalTransportDetails.length === 0)
    ) {
      setSubmitMessage(
        "Please fill in external transport details before submitting.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let department = "";
      let storedUser = {};
      try {
        storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        department = storedUser.department || storedUser.departmentName || "";
      } catch {
        // The request can still be submitted if a stale user value cannot be parsed.
      }

      const payload = {
        department,
        programType: form.type || "",
        programName: form.name || "",
        numberOfParticipants: Number(form.participants) || 0,
        participants: participantDetails
          .filter(
            (participant) =>
              participant.name || participant.department || participant.phone,
          )
          .map((participant) => ({
            name: participant.name || "",
            department: participant.department || "",
            phoneNumber: participant.phone || "",
          })),
        expectedOutcome: form.expectedOutcome || "",
        programFromDate: form.programFrom || "",
        programToDate: form.programTo || "",
        // onDutyFrom: formatDateTime(
        //   form.onDutyFrom,
        //   formatTimeForPayload(form.onDutyFromTime),
        // ),
        // onDutyTo: formatDateTime(
        //   form.onDutyTo,
        //   formatTimeForPayload(form.onDutyToTime),
        // ),
        offCampusFrom: formatDateTime(
          form.onDutyFrom,
          formatTimeForPayload(form.onDutyFromTime),
        ),
        offCampusTo: formatDateTime(
          form.onDutyTo,
          formatTimeForPayload(form.onDutyToTime),
        ),
        foodRequired: form.foodRequired === "Yes",
        foodAmount: form.foodRequired === "Yes" ? Number(form.foodAmount) || 0 : 0,
      
        transportRequired: form.transportRequired === "Yes",
        transportAmount:
          form.transportRequired === "Yes"
            ? Number(form.transportAmount) || 0
            : 0,
        accommodationRequired: form.accommodationRequired === "Yes",
        accommodationAmount:
          form.accommodationRequired === "Yes"
            ? Number(form.accommodationAmount) || 0
            : 0,
        food: form.foodRequired,
        transport: form.transportRequired,
        accommodation: form.accommodationRequired,
        financeRequired: form.financeRequired,
        estimatedAmount:
          form.financeRequired === "Yes"
            ? Number(form.estimatedAmount) || 0
            : 0,
        advanceAmount:
          form.financeRequired === "Yes" ? Number(form.advanceAmount) || 0 : 0,
        advancePurpose:
          form.financeRequired === "Yes" ? form.advancePurpose : "",
        advanceToBeReceivedWithin:
          form.financeRequired === "Yes"
            ? Number(form.advanceToBeReceivedWithin) || 0
            : 0,
        specialRequirement: form.otherRequirements || "",
        otherRequirements: form.otherRequirements || "",
        externalTransportRequired: form.transport === "yes",
        principalApprovalFormName: principalApprovalFile?.name || "",
        externalTransport:
          form.transport === "yes"
            ? normalizeExternalTransport(externalTransportDetails)
            : [],
      };
      const requestFormData = new FormData();
      const employeeId =
        storedUser._id ||
        storedUser.id ||
        storedUser.facultyId ||
        storedUser.employeeId;

      if (employeeId) requestFormData.append("employee", String(employeeId));
      if (principalApprovalFile) {
        requestFormData.append("principalApprovalForm", principalApprovalFile);
      }
      Object.entries(payload).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        requestFormData.append(
          key,
          typeof value === "object" ? JSON.stringify(value) : String(value),
        );
      });
      requestFormData.set("programType", String(form.type).trim());

      if (!requestFormData.get("programType")) {
        if (receiptWindow && !receiptWindow.closed) receiptWindow.close();
        setSubmitMessage("Select the program/event type before submitting.");
        setIsSubmitting(false);
        return;
      }

      const token = localStorage.getItem("token");

      console.info(
        "Submitting individual event request to /api/individual-event-attending",
      );
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/individual-event-attending`,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: requestFormData,
        },
      );

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }
      }

      const responseRecord = data?.data;
      if (responseRecord && typeof responseRecord === "object") {
        responseRecord.specialRequirement =
          responseRecord.specialRequirement ??
          responseRecord.specialRequirements ??
          payload.specialRequirement ??
          "";
        delete responseRecord.specialRequirements;
      }

      if (!response.ok) {
        const serverMessage =
          data?.message ||
          data?.error ||
          responseText ||
          `Request failed with status ${response.status}`;
        throw new Error(serverMessage || "Failed to submit request");
      }

      setSubmitMessage("Request submitted successfully.");

      if (form.financeRequired === "Yes") {
        const receiptWindow = window.open("", "_blank");
        let storedUser = {};
        try {
          storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
          storedUser = {};
        }

        const employee = {
          firstName:
            storedUser.firstName ||
            storedUser.name ||
            storedUser.employeeName ||
            data?.employeeName ||
            "",
          name:
            storedUser.name ||
            storedUser.employeeName ||
            storedUser.firstName ||
            data?.employeeName ||
            "",
          employeeName:
            storedUser.employeeName ||
            storedUser.name ||
            storedUser.firstName ||
            data?.employeeName ||
            "",
          empId: storedUser.empId || storedUser.employeeId || "",
          designation: storedUser.designation || data?.designation || "",
          department:
            storedUser.department ||
            storedUser.departmentName ||
            data?.department ||
            department,
        };

        const receiptResponse = data?.data || data || {};
        const requestNo =
          receiptResponse?.requestNo ||
          receiptResponse?.data?.requestNo ||
          receiptResponse?.individualEvent?.requestNo ||
          receiptResponse?.data?.individualEvent?.requestNo ||
          "";

        await import("../../utils/ReportPdf").then(({ default: ReportPdf }) =>
          ReportPdf({
            formData: {
              advanceAmount: form.advanceAmount,
              advancePurpose: form.advancePurpose,
              clearanceDays: form.advanceToBeReceivedWithin || 15,
              employeeName: employee.employeeName || employee.name,
              empId: employee.empId,
              designation: employee.designation,
              department: employee.department,
            },
            employee,
            submitResponse: {
              ...receiptResponse,
              requestNo,
              response: data,
            },
            receiptWindow,
          }),
        );
      }

      setSubmitSuccess(true);
      console.log(
        "Event attended submission payload:",
        JSON.stringify(payload, null, 2),
      );
      console.log("API response:", data      );
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitMessage(
        error?.message || "Something went wrong while submitting.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return <FormSubmitted />;
  }

  return (
    <div className="min-h-screen w-full bg-[#081b2d] px-6 py-8 text-white">
      <div className="w-full rounded-[18px] border border-[#1f2d42] bg-[#071b2f] px-6 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="mb-8">
          <h1 className="text-[30px] font-semibold tracking-tight text-white">
            Request for attending Program / Event / Visit
          </h1>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Principal Approval Form <span className="text-red-400">*</span>
          </label>
          <div
            onClick={
              !principalApprovalFile ? openPrincipalFilePicker : undefined
            }
            onDrop={handlePrincipalDrop}
            onDragOver={(event) => event.preventDefault()}
            className={`relative flex w-full flex-row items-center justify-center gap-3 rounded-lg p-4 text-center text-sm text-white ${
              !principalApprovalFile ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="10"
                fill="none"
                stroke={principalFileError ? "#f87171" : "#3A3A5A"}
                strokeWidth="2"
                strokeDasharray="10 4"
              />
            </svg>

            <img
              src={UploadIcon}
              alt="upload"
              className="z-10 h-8 w-7 opacity-80"
            />

            {principalApprovalFile ? (
              <div className="z-10 flex flex-wrap items-center justify-center gap-3">
                <span className="text-sm font-medium text-purple-300">
                  {principalApprovalFile.name}
                </span>
                <span className="text-xs text-gray-400">
                  ({(principalApprovalFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  onClick={handlePrincipalRemove}
                  className="rounded-md border border-red-400/40 px-2 py-1 text-xs text-red-400 transition-colors hover:border-red-300/60 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="z-10">
                Drag and drop files here or{" "}
                <span className="text-purple-400 underline">choose file</span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  Only PDF files supported - Max file size: 1MB
                </span>
              </p>
            )}
          </div>

          <input
            ref={principalInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePrincipalFileChange}
            className="hidden"
          />

          {principalFileError && (
            <p className="mt-1 text-xs text-red-400">{principalFileError}</p>
          )}
          <div className="mt-3 flex justify-end">
            <a
              href="/templates/Principal_Approval_Form_Template.docx"
              download
              className="rounded-lg border border-purple-500/60 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
            >
              Download Principal Approval Form Template
            </a>
          </div>
        </div>

        <div className="">
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Date of the program/event/visit
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                From
              </label>
              <div className="flex w-full items-center rounded-[14px] border border-violet-500 bg-[#0d2240] px-3 py-3 shadow-[0_0_0_1px_rgba(168,85,247,0.4)]">
                <input
                  type="date"
                  value={form.programFrom}
                  onChange={(e) => updateField("programFrom", e.target.value)}
                  className="w-full bg-transparent text-base text-slate-200 outline-none placeholder:text-slate-500"
                  placeholder="dd-mm-yyyy"
                />
                <CalendarDays className="ml-3 h-4 w-4 shrink-0 text-slate-300" />
              </div>
            </div>

            <div className="relative">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                To
              </label>
              <div className="flex w-full items-center rounded-[14px] border border-[#2d3a4d] bg-[#0d2240] px-3 py-3">
                <input
                  type="date"
                  value={form.programTo}
                  onChange={(e) => updateField("programTo", e.target.value)}
                  className="w-full bg-transparent text-base text-slate-200 outline-none placeholder:text-slate-500"
                  placeholder="dd-mm-yyyy"
                />
                <CalendarDays className="ml-3 h-4 w-4 shrink-0 text-slate-300" />
              </div>
            </div>
          </div>

          {form.programFrom && form.programTo && (
            <div className="mt-4 rounded-[14px] border border-violet-500/40 bg-[#0d2240] px-4 py-3 text-sm text-slate-200">
              <span className="text-slate-300">Total days: </span>
              <span className="font-semibold text-white">
                {getDayDiff(form.programFrom, form.programTo)} day(s)
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 mt-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Type of the program/event/visit
              </label>
              <div className="relative">
                <select
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition focus:border-violet-500"
                >
                  <option value="">Select</option>
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="visit">Visit</option>
                  <option value="audit">Audit</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 text-slate-300"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Name of the program/event/visit
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-violet-500"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Number of participants
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.participants}
              onChange={(e) => updateField("participants", e.target.value)}
              className="w-full rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-violet-500"
            />
          </div>

          {participantCount > 0 && (
            <div className="rounded-xl border border-[#2d3a4d] bg-[#0c1f3b] p-4">
              <div className="space-y-3">
                {participantRows.map((row, index) => (
                  <div key={row.id} className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-lg border border-[#2b3c5a] bg-[#0d213b] px-3 py-2">
                      <span className="min-w-fit text-sm text-slate-300">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={participantDetails[index]?.name || ""}
                        onChange={(e) =>
                          updateParticipantField(index, "name", e.target.value)
                        }
                        placeholder={row.label}
                        className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-400 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border border-[#2b3c5a] bg-[#0d213b] px-3 py-2">
                      <span className="min-w-fit text-sm text-slate-300">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={participantDetails[index]?.department || ""}
                        onChange={(e) =>
                          updateParticipantField(
                            index,
                            "department",
                            e.target.value,
                          )
                        }
                        placeholder={row.department}
                        className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-400 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border border-[#2b3c5a] bg-[#0d213b] px-3 py-2">
                      <span className="min-w-fit text-sm text-slate-300">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={participantDetails[index]?.phone || ""}
                        onChange={(e) =>
                          updateParticipantField(index, "phone", e.target.value)
                        }
                        placeholder={row.phone}
                        className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-400 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Expected outcome of the program/event/visit
            </label>
            <input
              type="text"
              value={form.expectedOutcome}
              onChange={(e) => updateField("expectedOutcome", e.target.value)}
              className="w-full rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-violet-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Request for Off Campus time
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <CustomDateTimePicker
                label="From"
                value={onDutyFromDateTime}
                onChange={(dateTime) =>
                  updateOffCampusDateTime(
                    "onDutyFrom",
                    "onDutyFromTime",
                    dateTime,
                  )
                }
                placeholder="Select date & time"
                valueTextClassName="text-slate-200"
              />

              <CustomDateTimePicker
                label="To"
                value={onDutyToDateTime}
                onChange={(dateTime) =>
                  updateOffCampusDateTime("onDutyTo", "onDutyToTime", dateTime)
                }
                placeholder="Select date & time"
                valueTextClassName="text-slate-200"
              />
            </div>

            {form.onDutyFrom && form.onDutyTo && (
              <div className="mt-4 rounded-[14px] border border-violet-500/40 bg-[#0d2240] px-4 py-3 text-sm text-slate-200">
                <span className="text-slate-300">Total days: </span>
                <span className="font-semibold text-white">
                  {totalOnDutyDays} day(s)
                </span>
              </div>
            )}
          </div>

          <div className="space-y-5 pt-2">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Finance Required <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.financeRequired}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateField("financeRequired", value);
                      if (value !== "Yes") {
                        updateField("estimatedAmount", "");
                        updateField("advanceAmount", "");
                        updateField("advancePurpose", "");
                        updateField("advanceToBeReceivedWithin", "");
                        setPrincipalApprovalFile(null);
                        setPrincipalFileError("");
                        if (principalInputRef.current)
                          principalInputRef.current.value = "";
                      }
                    }}
                    className="w-full appearance-none rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition focus:border-violet-500"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-slate-300"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {form.financeRequired === "Yes" && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Estimated Budget Amount (Rs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.estimatedAmount}
                      onChange={(e) =>
                        updateField("estimatedAmount", e.target.value)
                      }
                      className="w-full rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition focus:border-violet-500"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        I require Cash / In bank / Travel Advance / Online
                        Payment of Rs.
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.advanceAmount}
                        onChange={(e) =>
                          updateField("advanceAmount", e.target.value)
                        }
                        className="w-full rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        Purpose of Advance
                      </label>
                      <input
                        type="text"
                        value={form.advancePurpose}
                        onChange={(e) =>
                          updateField("advancePurpose", e.target.value)
                        }
                        placeholder="Purpose"
                        className="w-full rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Advance To Be Received Within
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.advanceToBeReceivedWithin}
                      onChange={(e) =>
                        updateField("advanceToBeReceivedWithin", e.target.value)
                      }
                      className="w-full rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition focus:border-violet-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                External Transport Required
              </label>
              <div className="relative">
                <select
                  value={form.transport}
                  onChange={(e) => updateField("transport", e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition focus:border-violet-500"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 text-slate-300"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 1.04l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {form.transport === "yes" && (
              <div className="overflow-hidden rounded-xl border border-[#2d3a4d] bg-[#071b2f]">
                <IndividualExternalTransportDetails
                  onDataChange={setExternalTransportDetails}
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Food Required", field: "foodRequired", amountField: "foodAmount", amountLabel: "Food Sanction Amount" },
                { label: "Transport Required", field: "transportRequired", amountField: "transportAmount", amountLabel: "Transport Amount" },
                {
                  label: "Accomodation Required",
                  field: "accommodationRequired",
                  amountField: "accommodationAmount",
                  amountLabel: "Accommodation Amount",
                },
              ].map(({ label, field, amountField, amountLabel }) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    {label}
                  </label>
                  <div className="relative">
                    <select
                      value={form[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                      className="w-full appearance-none rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition focus:border-violet-500"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5 text-slate-300"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {form[field] === "Yes" && (
                    <div className="mt-3">
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        {amountLabel}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form[amountField]}
                        onChange={(e) =>
                          updateField(amountField, e.target.value)
                        }
                        className="w-full rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition focus:border-violet-500"
                        placeholder="Enter amount"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Others, If any requirements
              </label>
              <textarea
                value={form.otherRequirements}
                onChange={(e) =>
                  updateField("otherRequirements", e.target.value)
                }
                rows={3}
                className="w-full rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-violet-500"
                placeholder="Mention any other requirements"
              />
            </div>
          </div>

          {/* <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              If you want any external transport request
            </label>
            <div className="relative">
              <select
                value={form.transport}
                onChange={(e) => updateField("transport", e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition focus:border-violet-500"
              >
                <option value="">yes / no</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-300">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {form.transport === "yes" && (
              <div className="mt-6 overflow-hidden rounded-xl border border-[#2d3a4d] bg-[#071b2f]">
                <IndividualExternalTransportDetails onDataChange={setExternalTransportDetails} />
              </div>
            )}
          </div> */}

          {/* <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              In case of expense
            </label>
            <div className="relative">
              <select
                value={form.expense}
                onChange={(e) => updateField("expense", e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#2d3a4d] bg-[#0d2240] px-4 py-3 text-base text-slate-200 outline-none transition focus:border-violet-500"
              >
                <option value="">Select</option>
                <option value="self">Self</option>
                <option value="department">Department</option>
                <option value="approved">Approved Budget</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-300">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div> */}

          <div className="flex flex-col items-end gap-3 pt-2">
            {submitMessage && (
              <p
                className={`text-sm ${submitMessage.includes("successfully") ? "text-emerald-400" : "text-red-400"}`}
              >
                {submitMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-linear-to-r from-violet-600 to-violet-500 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Eventsattended;
