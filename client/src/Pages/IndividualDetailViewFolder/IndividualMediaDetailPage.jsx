import { jwtDecode } from "jwt-decode";
import {
  ChevronRight,
  CalendarDays,
  UserRound,
  Phone,
  FileText,
  FileCheck2,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../Components/Modal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const IndividualMediaDetailPage = ({ data }) => {
  console.log("media data : ", data);

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
        navigate(`/dashboard-faculty/MediaIndividualDocumentUpload/${eventId}`)
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

  // ─── Date formatter ─────────────────────────────────────────────────
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main>
      {/* ─── Header with breadcrumb, status badge, and action buttons ── */}
      <div className="header flex items-center justify-between">
        <breadcrumb className="flex items-center gap-2">
          <h1 className="text-gray-500">Media Request List</h1>
          <ChevronRight size={16} />
          <button className="bg-green-200/10 px-3 py-2 rounded-full text-xs text-[#34D399]">
            {data?.data?.employee?.department}
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
                to={`/dashboard-faculty/MediaIndividualDocumentUpload/${eventId}`}
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
        <h1 className="text-lg text-[#853FF9] font-medium">Media Details</h1>

        {/* ── Poster section ── */}
        <div className="mt-4">
          <div className="rounded-lg border border-slate-600/40 bg-[#1d2639] p-4">
            <h2 className="mb-2 px-1 text-lg font-medium text-[#853FF9]">Poster</h2>

            {/* Content for Poster */}
            <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />
                <span className="text-[14px] font-medium text-white">Content for Poster</span>
              </div>
              <p className="text-[14px] leading-4 text-white/60">
                {data?.data?.poster?.posterContent}
              </p>
            </div>

            {/* Reference Poster */}
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">
              <div className="flex items-center px-3 py-2.5">
                <span className="text-[13px] text-white">Reference poster</span>
              </div>
              <div className="flex items-center gap-2 border-l border-slate-500/40 px-3 py-2.5">
                <FileCheck2 size={12} strokeWidth={1.8} className="text-emerald-400" />
                {data?.data?.poster?.referencePosterFiles.map((item) => (
                  <button
                    onClick={() => window.open(item.url, "_blank", "noopener, norefferrer")}
                    className="text-[13px] font-medium underline cursor-pointer text-white"
                  >
                    Reference-file
                  </button>
                ))}
              </div>
            </div>

            {/* Content for Certificate */}
            <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />
                <span className="text-[14px] font-medium text-white">Content for Certificate</span>
              </div>
              <p className="text-[13px] leading-4 text-white">{data?.data?.poster?.certificateContent}</p>
            </div>

            {/* Content for Trophy */}
            <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />
                <span className="text-[14px] font-medium text-white">Content for Trophy</span>
              </div>
              <p className="text-[13px] leading-4 text-white">{data?.data?.poster?.trophyContent}</p>
            </div>

            {/* Display & Size Requirements */}
            <div className="mb-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-500/30 bg-[#2a3347] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <FileText size={11} strokeWidth={1.8} className="text-white" />
                  <span className="text-[14px] font-medium text-white">Display Requirement</span>
                </div>
                {data?.data?.poster?.displayNeeded?.map((item) => (
                  <p className="mb-2 text-[13px] font-medium text-white">{item}</p>
                ))}
              </div>
              <div className="rounded-lg border border-slate-500/30 bg-[#2a3347] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <FileText size={11} strokeWidth={1.8} className="text-white" />
                  <span className="text-[14px] font-medium text-white">Size Requirement</span>
                </div>
                {data?.data?.poster?.sizes.map((item) => (
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13px] text-white">Size for {item.type}</span>
                    <span className="text-[13px] font-semibold text-white">{item.value} cm</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Date & Priority */}
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">
              <div className="flex items-center justify-between border-r border-slate-500/40 px-3 py-3">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={11} strokeWidth={1.8} className="text-white" />
                  <span className="text-[13px] text-white">Delivery Date</span>
                </div>
                <span className="text-[13px] font-semibold text-white">{formatDate(data?.data?.poster?.deliveryDate)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[13px] text-white">Priority</span>
                <span className={`text-[13px] font-semibold ${data?.data?.poster?.priority == "High" ? "text-red-500" : "text-green-500"}`}>
                  {data?.data?.poster?.priority}
                </span>
              </div>
            </div>

            {/* Special Requirement */}
            <div className="rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />
                <span className="text-[14px] font-medium text-white">Special Requirement</span>
              </div>
              <p className="text-[13px] leading-4 text-white">{data?.data?.poster?.specialRequirements || "--"}</p>
            </div>
          </div>
        </div>

        {/* ── Video section ── */}
        <div className="mt-4">
          <div className="rounded-lg border border-slate-600/40 bg-[#1d2639] p-4">
            <h2 className="mb-2 px-1 text-lg font-medium text-[#853FF9]">Video</h2>

            <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />
                <span className="text-[14px] font-medium text-white">Content for Video</span>
              </div>
              <p className="text-[14px] leading-4 text-white/60">{data?.data?.video?.videoContent}</p>
            </div>

            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">
              <div className="flex items-center px-3 py-2.5">
                <span className="text-[13px] text-white">Reference Video</span>
              </div>
              <div className="flex items-center flex-wrap gap-2 border-l border-slate-500/40 px-3 py-2.5">
                <FileCheck2 size={12} strokeWidth={1.8} className="text-emerald-400" />
                {data?.data?.video?.referenceFiles.map((item) => (
                  <button
                    onClick={() => window.open(item.url, "_blank", "noopener, norefferrer")}
                    className="text-[13px] font-medium underline cursor-pointer text-white"
                  >
                    Reference-file
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-500/30 bg-[#2a3347] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <FileText size={11} strokeWidth={1.8} className="text-white" />
                  <span className="text-[14px] font-medium text-white">Pre-Event Videos</span>
                </div>
                {data?.data?.video?.preEventVideos?.map((item) => (
                  <p className="mb-2 text-[13px] font-medium text-white">{item}</p>
                ))}
              </div>
              <div className="rounded-lg border border-slate-500/30 bg-[#2a3347] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <FileText size={11} strokeWidth={1.8} className="text-white" />
                  <span className="text-[14px] font-medium text-white">Post-Event Videos</span>
                </div>
                {data?.data?.video?.postEventVideos?.map((item) => (
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13px] text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">
              <div className="flex items-center justify-between border-r border-slate-500/40 px-3 py-3">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={11} strokeWidth={1.8} className="text-white" />
                  <span className="text-[13px] text-white">Delivery Date</span>
                </div>
                <span className="text-[13px] font-semibold text-white">{formatDate(data?.data?.video?.deliveryDate)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[13px] text-white">Priority</span>
                <span className={`text-[13px] font-semibold ${data?.data?.video?.priority == "High" ? "text-red-500" : "text-green-500"}`}>
                  {data?.data?.video?.priority}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />
                <span className="text-[14px] font-medium text-white">Special Requirement</span>
              </div>
              <p className="text-[13px] leading-4 text-white">{data?.data?.video?.specialRequirements || "--"}</p>
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

export default IndividualMediaDetailPage;
