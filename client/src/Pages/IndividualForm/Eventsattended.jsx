import React, { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import IndividualExternalTransportDetails from "./IndividualExternalTransportDetails";
import { buildIndividualReportHtml } from "./IndividualReport";
import { API_BASE } from "../../utils/apiConfig";

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
  });
  const [participantDetails, setParticipantDetails] = useState([]);
  const [externalTransportDetails, setExternalTransportDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
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

  const participantCount = Number(form.participants) || 0;
  const participantRows = Array.from({ length: participantCount }, (_, index) => ({
    id: index + 1,
    label: `${index + 1}. Participants Name`,
    department: `${index + 1}. Participants Department`,
    phone: `${index + 1}. Participants Phone Number`,
  }));

  const formatDateTime = (dateValue, timeValue) => {
    if (!dateValue) return "";
    return `${dateValue}T${timeValue || "00:00:00"}`;
  };

  const openSubmittedReport = (payload, responseData) => {
    const responseReportData = responseData?.data || responseData || {};
    const storedIqacNumber = Number(localStorage.getItem("individualEventIqacNumber")) || 0;
    const apiIqacNumber = Number(responseReportData.iqacNumber) || 0;
    const nextIqacNumber = apiIqacNumber || storedIqacNumber + 1;

    // Some deployed API versions do not yet return iqacNumber. Keep the receipt
    // numbered in that case, while using the server value whenever it is available.
    localStorage.setItem(
      "individualEventIqacNumber",
      String(Math.max(storedIqacNumber, nextIqacNumber))
    );

    const reportData = {
      ...responseReportData,
      iqacNumber: String(nextIqacNumber).padStart(3, "0"),
    };
    const html = buildIndividualReportHtml({
      payload,
      reportData,
    });

    const reportUrl = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const newTab = window.open(reportUrl, "_blank", "noopener,noreferrer");

    if (!newTab) {
      window.location.href = reportUrl;
    }
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
        : item.classOrBerth || (item.travelOption === "Flight" ? "Economy" : "");

      const trainNumber = item.travelOption === "Train" ? item.trainNumber || "" : "";
      const flightNumber = item.travelOption === "Flight" ? item.flightNumber || "" : "";
      const transportNumber = trainNumber || flightNumber;

      return {
        travelOption: item.travelOption || "",
        travelDate: item.travelDate ? new Date(item.travelDate).toISOString() : "",
        from: item.from || "",
        to: item.to || "",
        totalPassengers: Number(item.totalPassengers) || 0,
        numberOfPassengers: Number(item.totalPassengers) || 0,
        classOrBerth,
        travelClass: classOrBerth,
        transportNumber,
        trainNumber,
        flightNumber,
        specialRequirements: item.specialRequirements?.trim() || "None",
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

  const handleSubmit = async () => {
    setSubmitMessage("");

    if (form.transport === "yes" && (!Array.isArray(externalTransportDetails) || externalTransportDetails.length === 0)) {
      setSubmitMessage("Please fill in external transport details before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      let department = "";
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
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
          .filter((participant) => participant.name || participant.department || participant.phone)
          .map((participant) => ({
            name: participant.name || "",
            department: participant.department || "",
            phoneNumber: participant.phone || "",
          })),
        expectedOutcome: form.expectedOutcome || "",
        programFromDate: form.programFrom || "",
        programToDate: form.programTo || "",
        onDutyFrom: formatDateTime(form.onDutyFrom, "09:00:00"),
        onDutyTo: formatDateTime(form.onDutyTo, "17:00:00"),
        externalTransportRequired: form.transport === "yes",
        externalTransport: form.transport === "yes" ? normalizeExternalTransport(externalTransportDetails) : [],
      };

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/api/individual-event-attending`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit request");
      }

      setSubmitMessage("Request submitted successfully.");
      openSubmittedReport(payload, data);
      console.log("Event attended submission payload:", payload);
      console.log("API response:", data);
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitMessage(error.message || "Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#081b2d] px-6 py-8 text-white">
      <div className="w-full rounded-[18px] border border-[#1f2d42] bg-[#071b2f] px-6 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="mb-8">
          <h1 className="text-[30px] font-semibold tracking-tight text-white">
            Request for attending Program / Event / Visit
          </h1>
          <p className="mt-2 text-sm text-slate-300/80">
            Lorem ipsum is simply dummy text of the printing and typesetting industry.
            Lorem ipsum has been the industry&apos;s standard dummy text ever since the 1500s
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
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
              type="text"
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
                      <span className="min-w-fit text-sm text-slate-300">{index + 1}.</span>
                      <input
                        type="text"
                        value={participantDetails[index]?.name || ""}
                        onChange={(e) => updateParticipantField(index, "name", e.target.value)}
                        placeholder={row.label}
                        className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-400 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border border-[#2b3c5a] bg-[#0d213b] px-3 py-2">
                      <span className="min-w-fit text-sm text-slate-300">{index + 1}.</span>
                      <input
                        type="text"
                        value={participantDetails[index]?.department || ""}
                        onChange={(e) => updateParticipantField(index, "department", e.target.value)}
                        placeholder={row.department}
                        className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-400 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border border-[#2b3c5a] bg-[#0d213b] px-3 py-2">
                      <span className="min-w-fit text-sm text-slate-300">{index + 1}.</span>
                      <input
                        type="text"
                        value={participantDetails[index]?.phone || ""}
                        onChange={(e) => updateParticipantField(index, "phone", e.target.value)}
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
                <span className="font-semibold text-white">{getDayDiff(form.programFrom, form.programTo)} day(s)</span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Request for On-Duty / Off Campus time
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  From
                </label>
                <div className="flex w-full items-center rounded-[14px] border border-[#2d3a4d] bg-[#0d2240] px-3 py-3">
                  <input
                    type="date"
                    value={form.onDutyFrom}
                    onChange={(e) => updateField("onDutyFrom", e.target.value)}
                    className="w-full bg-transparent text-base text-slate-200 outline-none"
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
                    value={form.onDutyTo}
                    onChange={(e) => updateField("onDutyTo", e.target.value)}
                    className="w-full bg-transparent text-base text-slate-200 outline-none"
                  />
                  <CalendarDays className="ml-3 h-4 w-4 shrink-0 text-slate-300" />
                </div>
              </div>
            </div>

            {form.onDutyFrom && form.onDutyTo && (
              <div className="mt-4 rounded-[14px] border border-violet-500/40 bg-[#0d2240] px-4 py-3 text-sm text-slate-200">
                <span className="text-slate-300">Total days: </span>
                <span className="font-semibold text-white">{totalOnDutyDays} day(s)</span>
              </div>
            )}
          </div>

          <div>
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
          </div>

          <div>
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
          </div>

          <div className="flex flex-col items-end gap-3 pt-2">
            {submitMessage && (
              <p className={`text-sm ${submitMessage.includes("successfully") ? "text-emerald-400" : "text-red-400"}`}>
                {submitMessage}
              </p>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eventsattended;

