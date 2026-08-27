import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ChevronRight,
  CalendarDays,
  UserRound,
  Phone,
  FileText,
  Clock3,
  MapPin,
  ClipboardList,
} from "lucide-react";
import Modal from "../../Components/Modal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const IndividualTrasnportDetailPage = ({ data }) => {
  console.log("transport data : ", data);

  // ─── Get the submission ID from the URL ──────────────────────────────
  const { eventId } = useParams();
  const navigate = useNavigate()


  // ─── Decode the user's role from the JWT token ──────────────────────
  let token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;

  // ─── State for reject modal, loading, and reject reason ─────────────
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ─── Helper: get authorization headers ──────────────────────────────
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // ─── Admin Approve ─────────────────────────────────────────────────
  async function handleAdminApprove() {
    setActionLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/individual-submissions/${eventId}/super-admin-approval`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ action: "approve" }),
        }
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to approve");
      }
      toast.success("Approved successfully");
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Admin Reject ──────────────────────────────────────────────────
  async function handleAdminReject() {
    if (!rejectReason.trim()) {
      return toast.error("Please enter a rejection reason");
    }
    setActionLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/individual-submissions/${eventId}/super-admin-approval`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            action: "reject",
            reason: rejectReason.trim(),
          }),
        }
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to reject");
      }
      toast.success("Rejected successfully");
      setShowRejectModal(false);
      setRejectReason("");
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Head Acknowledge ──────────────────────────────────────────────
  async function handleAcknowledge() {
    setActionLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/individual-submissions/${eventId}/head-approval`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ action: "acknowledge" }),
        }
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to acknowledge");
      }
      toast.success("Acknowledged successfully");
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Failed to acknowledge");
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Head Complete ─────────────────────────────────────────────────
  async function handleComplete() {
    setActionLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/individual-submissions/${eventId}/head-approval`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ action: "complete" }),
        }
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to complete");
      }
      toast.success("Completed successfully");
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Failed to complete");
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Empty handler for faculty (to be implemented later) ────────────
  async function handleFacultyClose() {
    navigate(`/dashboard-faculty/TransportIndividualDocumentUpload/${eventId}`)

  }

  // ─── Status color helper ────────────────────────────────────────────
  function renderStatusColors(status) {
    if (!status) return "";
    if (status.toLowerCase() == "pending") return "bg-red-300/20 text-red-400";
    if (status.toLowerCase() == "approved") return "bg-green-300/20 text-green-400";
    if (status.toLowerCase() == "rejected") return "bg-red-400/20 text-red-400";
    if (status.toLowerCase() == "closed") return "bg-green-300/20 text-green-400";
    if (status.toLowerCase() == "acknowledged") return "bg-green-300/20 text-green-400";
    if (status.toLowerCase() == "completed") return "bg-green-300/20 text-green-400";
    return "";
  }

  // ─── Date & time formatters ─────────────────────────────────────────
  const date = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const time = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const car = data?.data?.vehicles?.find((item) => item.type == "Car");

  // ─── JSX ────────────────────────────────────────────────────────────
  return (
    <main>
      {/* ─── Header with breadcrumb, status badge, and action buttons ── */}
      <div className="header flex items-center justify-between">
        <breadcrumb className="flex items-center gap-2">
          <h1 className="text-gray-500">Transport Request List</h1>
          <ChevronRight size={16} />
          <button className="bg-yellow-200/10 px-3 py-2 rounded-full text-xs text-yellow-500">
            {data?.employeeDetail?.department}
          </button>
          <ChevronRight size={16} />

          {/* ── Status badge (role-based) ── */}
          {(role.toLowerCase() == "admin" || role.toLowerCase() == "super admin 1" || role.toLowerCase() == "super admin 2") && (
            <button className={`px-3 py-2 rounded-full text-xs ${renderStatusColors(data?.superAdminApproval?.status)}`}>
              {data?.superAdminApproval?.status}
            </button>
          )}
          {(role.toLowerCase() == "faculty") && (
            <button className={`px-3 py-2 rounded-full text-xs ${renderStatusColors(data?.finalStatus)}`}>
              {data?.finalStatus}
            </button>
          )}
          {(role.toLowerCase() == "head") && (
            <button className={`px-3 py-2 rounded-full text-xs ${renderStatusColors(data?.headApproval?.status)}`}>
              {data?.headApproval?.status}
            </button>
          )}
        </breadcrumb>

        {/* ── Admin action buttons (Approve / Reject) ── */}
        {(role.toLowerCase() === "admin" ||
          role.toLowerCase() === "super admin 1" ||
          role.toLowerCase() === "super admin 2") &&
          data?.superAdminApproval?.status?.toLowerCase() === "pending" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdminApprove}
                disabled={actionLoading}
                className="bg-emerald-900 text-white px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="bg-red-800 text-white px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}

        {/* ── Faculty action button ── */}
        {role.toLowerCase() === "faculty" && (
          <div>
            {data?.superAdminApproval?.status?.toLowerCase() === "approved" && (
              <Link
                // onClick={handleFacultyClose}
                to={`/dashboard-faculty/TransportIndividualDocumentUpload/${eventId}`}
                className="bg-emerald-800 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                Close
              </Link>
            )}
          </div>
        )}

        {/* ── Head action buttons ── */}
        {role?.toLowerCase() === "head" && (
          <div>
            {data?.headApproval?.status?.toLowerCase() === "pending" && (
              <button
                onClick={handleAcknowledge}
                disabled={actionLoading}
                className="bg-emerald-900 text-white px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Acknowledge"}
              </button>
            )}
            {data?.headApproval?.status?.toLowerCase() === "acknowledged" && (
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="bg-emerald-900 text-white px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Complete"}
              </button>
            )}
            {data?.headApproval?.status?.toLowerCase() === "completed" && (
              <button className="bg-emerald-900 text-white px-4 py-2 rounded-lg cursor-pointer">
                Completed
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Detail view content ─────────────────────────────────────── */}
      <div className="bg-[#232a3c]/30 mt-4 p-4 rounded-xl border border-gray-700 w-full">
        <h1 className="text-lg text-[#853FF9] font-medium">Transport Details</h1>

        <div className="mt-3">
          <div className="rounded-lg border border-slate-600/40 bg-[#1d2639] p-3">
            {/* ── Top Date Section ── */}
            <div className="grid grid-cols-2 gap-2">
              {/* Pickup */}
              <div className="rounded-lg bg-[#2a3347] p-2.5">
                <div className="grid grid-cols-2">
                  <div className="flex items-start gap-2 border-r border-slate-500/40 pr-3">
                    <CalendarDays size={12} strokeWidth={1.8} className="mt-0.5 text-purple-300" />
                    <div>
                      <p className="text-[14px] uppercase text-slate-400">Pickup Date</p>
                      <p className="text-[14px] font-semibold text-white">{date(data?.data?.pickupDateTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pl-3">
                    <Clock3 size={12} strokeWidth={1.8} className="mt-0.5 text-purple-300" />
                    <div>
                      <p className="text-[14px] uppercase text-slate-400">Pickup Time</p>
                      <p className="text-[14px] font-semibold text-white">{time(data?.data?.pickupDateTime)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drop */}
              <div className="rounded-lg bg-[#2a3347] p-2.5">
                <div className="grid grid-cols-2">
                  <div className="flex items-start gap-2 border-r border-slate-500/40 pr-3">
                    <CalendarDays size={12} strokeWidth={1.8} className="mt-0.5 text-purple-300" />
                    <div>
                      <p className="text-[14px] uppercase text-slate-400">Drop Date</p>
                      <p className="text-[14px] font-semibold text-white">{date(data?.data?.dropDateTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pl-3">
                    <Clock3 size={12} strokeWidth={1.8} className="mt-0.5 text-purple-300" />
                    <div>
                      <p className="text-[14px] uppercase text-slate-400">Drop Time</p>
                      <p className="text-[14px] font-semibold text-white">{time(data?.data?.dropDateTime)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Location Section ── */}
            <div className="relative my-3 mt-4 flex items-center justify-between">
              <div className="absolute left-[11%] right-[11%] top-1/2 border-t border-dashed border-slate-500/50" />

              {/* Pickup Location */}
              <div className="relative z-10 mr-2 flex w-[23%] items-center gap-2 rounded-lg bg-[#2a3347] px-2 py-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <MapPin size={10} className="text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] uppercase text-slate-400">Pickup Location</p>
                  <p className="truncate text-[12px] font-semibold text-white">{data?.data?.pickupLocation || "--"}</p>
                </div>
              </div>

              {/* Checkpoints */}
              <div className="checkpoint-container flex items-center flex-wrap gap-2">
                {data?.data?.checkpoints?.map((item, index) => (
                  <div key={index} className="relative z-10 flex w-fit items-center gap-2 rounded-lg bg-[#2a3347] px-4 py-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600">
                      <MapPin size={10} className="text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[14px] uppercase text-slate-400">Checkpoint</p>
                      <p className="text-[12px] font-semibold text-white">{item?.location}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drop Location */}
              <div className="relative z-10 flex w-[23%] items-center gap-2 rounded-lg bg-[#2a3347] px-2 py-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <MapPin size={10} className="text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] uppercase text-slate-400">Drop Location</p>
                  <p className="truncate text-[12px] font-semibold text-white">{data?.data?.dropLocation}</p>
                </div>
              </div>
            </div>

            {/* ── Members / Vehicle ── */}
            <div className="mb-2 grid grid-cols-2 mt-4 rounded-lg border border-slate-600/30 bg-[#2a3347]">
              <div className="flex items-center justify-between border-r border-slate-500/40 px-3 py-3">
                <span className="text-[14px] text-slate-300">Total Number of Members</span>
                <span className="text-[14px] font-semibold text-white">{data?.data?.totalPassengers || "--"}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[14px] text-slate-300">Types of Vehicle needed</span>
                <span className="text-[14px] font-semibold flex items-center gap-2 text-white">
                  {data?.data?.vehicles?.map((item, index) => (
                    <p key={index}>{item.type}</p>
                  ))}
                </span>
              </div>
            </div>

            {/* ── Vehicle Count ── */}
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-600/30 bg-[#2a3347]">
              <div className="flex items-center justify-between border-r border-slate-500/40 px-3 py-3">
                <span className="text-[14px] text-slate-300">Total bus needed</span>
                <span className="text-[14px] font-semibold text-white">{data?.data?.numberOfBusNeeded}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[14px] text-slate-300">Total car needed</span>
                <span className="text-[14px] font-semibold text-white">{car?.count || "--"}</span>
              </div>
            </div>

            {/* ── Staff Details ── */}
            <div className={`staff-container p-2 ${data?.data?.accompanyingStaff?.length > 0 ? "" : "hidden"} bg-[#2a3347] p-2 mb-2 rounded-lg`}>
              {data?.data?.accompanyingStaff?.map((item, index) => (
                <div key={index} className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-600/30 bg-[#2a3347]">
                  <div className="flex items-center gap-2 border-r border-slate-500/40 px-3 py-2.5">
                    <UserRound size={13} strokeWidth={1.7} className="text-purple-300" />
                    <div>
                      <p className="text-[14px] uppercase text-slate-400">Accompanying Staff Name</p>
                      <p className="text-[14px] font-semibold text-white">{item.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Phone size={13} strokeWidth={1.7} className="text-purple-300" />
                    <div>
                      <p className="text-[14px] uppercase text-slate-400">Accompanying Mobile Number</p>
                      <p className="text-[14px] font-semibold text-white">{item.mobile}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Special Requirement ── */}
            <div className="rounded-lg border border-slate-500/40 bg-[#2a3347] px-3 py-3">
              <div className="mb-2 flex items-center gap-1.5">
                <ClipboardList size={12} strokeWidth={1.8} className="text-slate-200" />
                <span className="text-[14px] font-medium text-white">Special Requirement</span>
              </div>
              <p className="text-[14px] leading-5 text-slate-300">{data?.data?.specialRequirements || "--"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ═══ REJECT REASON MODAL ═════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
        }}
        title="Reason for Rejection"
      >
        <p className="text-sm text-gray-400">
          Please enter the reason for rejecting this request.
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="mt-4 min-h-[100px] w-full rounded-lg border border-gray-600 bg-[#1a1a2e] p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          placeholder="Enter rejection reason..."
        />
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason("");
            }}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-400 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleAdminReject}
            disabled={actionLoading}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {actionLoading ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </Modal>
    </main>
  );
};

export default IndividualTrasnportDetailPage;
