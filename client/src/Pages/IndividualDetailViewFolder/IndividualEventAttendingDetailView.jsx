import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  NotebookText,
  Phone,
  UserRound,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const IndividualEventAttendingDetailView = ({ data }) => {
  const { eventId } = useParams();
  const token = localStorage.getItem("token");
  const [actionLoading, setActionLoading] = useState(false);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const handleHeadAction = async (action) => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/individual-submissions/${eventId}/head-approval`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ action }),
        },
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to ${action} request`);
      }
      toast.success(action === "acknowledge" ? "Acknowledged successfully" : "Completed successfully");
      window.location.reload();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium",
    });
  };

  const status = data?.headApproval?.status || "Pending";
  const statusStyle =
    status.toLowerCase() === "pending"
      ? "bg-red-300/20 text-red-400"
      : status.toLowerCase() === "rejected"
        ? "bg-red-400/20 text-red-400"
        : "bg-green-300/20 text-green-400";
  const programData = data?.data || {};
  const participants = Array.isArray(programData.participants)
    ? programData.participants
    : [];

  return (
    <main className="text-white">
      <div className="header flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-gray-500">Events Attending Request List</h1>
          <ChevronRight size={16} />
          <span className="rounded-full bg-yellow-200/10 px-3 py-2 text-xs text-yellow-500">
            {data?.employeeDetail?.department || "Department"}
          </span>
          <ChevronRight size={16} />
          <span className={`rounded-full px-3 py-2 text-xs ${statusStyle}`}>
            {status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status.toLowerCase() === "pending" && (
            <button
              type="button"
              onClick={() => handleHeadAction("acknowledge")}
              disabled={actionLoading}
              className="cursor-pointer rounded-lg bg-emerald-900 px-4 py-2 text-white disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Acknowledge"}
            </button>
          )}
          {status.toLowerCase() === "acknowledged" && (
            <button
              type="button"
              onClick={() => handleHeadAction("complete")}
              disabled={actionLoading}
              className="cursor-pointer rounded-lg bg-emerald-900 px-4 py-2 text-white disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Complete"}
            </button>
          )}
          {status.toLowerCase() === "completed" && (
            <span className="rounded-lg bg-emerald-900 px-4 py-2 text-white">
              Completed
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-700 bg-[#232a3c]/30 p-4">
        <h2 className="text-lg font-medium text-[#853FF9]">Events Attending Details</h2>

        <DetailRow label="Name of the program" value={programData.programName || programData.programType} />

        <div className="mt-2 grid grid-cols-1 gap-2 rounded-md bg-[#1c2537] md:grid-cols-2">
          <DetailRow icon={CalendarDays} label="Program date (From)" value={formatDate(programData.programFromDate)} />
          <DetailRow icon={CalendarDays} label="Program date (To)" value={formatDate(programData.programToDate)} />
          <DetailRow icon={CalendarDays} label="On duty date (From)" value={formatDate(programData.onDutyFrom || programData.offCampusFrom)} />
          <DetailRow icon={CalendarDays} label="On duty date (To)" value={formatDate(programData.onDutyTo || programData.offCampusTo)} />
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 rounded-md bg-[#1c2537] md:grid-cols-2">
          <DetailRow label="Total number of participants" value={programData.numberOfParticipants ?? participants.length} />
          <DetailRow label="Expected outcome" value={programData.expectedOutcome} />
          <DetailRow label="Food required" value={formatRequirement(programData.foodRequired ?? programData.food)} />
          <DetailRow label="Transport required" value={formatRequirement(programData.transportRequired ?? programData.transport)} />
          <DetailRow label="Accommodation required" value={formatRequirement(programData.accommodationRequired ?? programData.accommodation)} />
        </div>

        <section className="mt-2 rounded-md bg-[#1c2537] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-base font-medium text-white">
            <UserRound className="h-4 w-4 text-[#a78bfa]" /> Participants
          </h3>
          {participants.length ? (
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <div key={participant._id || index} className="grid grid-cols-1 gap-3 rounded-lg border border-[#3a4354] p-3 sm:grid-cols-3">
                  <ParticipantField icon={UserRound} label="Name" value={participant.name} />
                  <ParticipantField icon={Phone} label="Mobile number" value={participant.phoneNumber || participant.phone} />
                  <ParticipantField icon={UserRound} label="Department" value={participant.department} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No participant details provided.</p>
          )}
        </section>

        <section className="mt-2 rounded-md bg-[#1c2537] p-4">
          <h3 className="mb-2 flex items-center gap-2 font-medium text-white">
            <Clock3 className="h-4 w-4 text-[#a78bfa]" /> Request timeline
          </h3>
          <p className="text-sm text-gray-300">
            Submitted at: {formatDateTime(data?.approvalHistory?.[0]?.actionDate || data?.createdAt)}
          </p>
          <p className="mt-1 text-sm text-gray-300">
            Head status: <span className="text-white">{status}</span>
          </p>
        </section>

        <section className="mt-2 rounded-md bg-[#1c2537] p-4">
          <h3 className="mb-2 flex items-center gap-2 font-medium text-white">
            <NotebookText className="h-4 w-4 text-[#a78bfa]" /> Special requirements
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {programData.otherRequirements || programData.specialRequirement || "None"}
          </p>
        </section>
      </div>
    </main>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-[#3a4354] px-3 py-4 last:border-b-0">
    <div className="flex items-center gap-2 text-gray-400">
      {Icon && <Icon className="h-4 w-4 text-[#8B5CF6]" />}
      <span>{label}</span>
    </div>
    <span className="text-right text-sm font-medium text-white">{value || "—"}</span>
  </div>
);

const ParticipantField = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon className="mt-0.5 h-4 w-4 text-[#a78bfa]" />
    <div>
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="text-sm font-medium text-white">{value || "—"}</p>
    </div>
  </div>
);

const formatRequirement = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value || "—";
};

export default IndividualEventAttendingDetailView;
