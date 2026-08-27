import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ChevronRight,
  CalendarDays,
  UserRound,
  Phone,
  FileText,
  ClipboardList,
} from "lucide-react";
import Modal from "../../Components/Modal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const IndividualPurchaseDetailPage = ({ data }) => {
  console.log("purchase data : ", data);

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
    navigate(`/dashboard-faculty/PurchaseIndividualDocumentUpload/${eventId}`)
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

  // ─── Purchase data helpers ──────────────────────────────────────────
  const students = data?.data?.purchases?.[0]?.students;
  const guests = data?.data?.purchases?.[0]?.guests;

  const trophyGift = students?.giftItems?.find((item) => item.giftType === "Trophy");
  const cashPrice = students?.giftItems?.find((item) => item.giftType == "Cash Prize");
  const basicTrophy = trophyGift?.trophy?.find((item) => item.trophyType === "Basic");
  const eliteTrophy = trophyGift?.trophy?.find((item) => item.trophyType === "Elite");
  const voucher = students?.giftItems?.find((item) => item.giftType === "Voucher");

  const guestsTrophyGift = guests?.giftItems?.find((item) => item.giftType === "Trophy");
  const guestsVoucher = guests?.giftItems?.find((item) => item.giftType == "Voucher");
  const guestsCashPrice = guests?.giftItems?.find((item) => item.giftType == "Cash Prize");
  const guestsBasicTrophy = guestsTrophyGift?.trophy?.find((item) => item.trophyType === "Basic");
  const guestsEliteTrophy = guestsTrophyGift?.trophy?.find((item) => item.trophyType === "Elite");

  // ─── JSX ────────────────────────────────────────────────────────────
  return (
    <main>
      {/* ─── Header with breadcrumb, status badge, and action buttons ── */}
      <div className="header flex items-center justify-between">
        <breadcrumb className="flex items-center gap-2">
          <h1 className="text-gray-500">Purchase Request List</h1>
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
              <button
                // onClick={handleFacultyClose}
                to={`/dashboard-faculty/PurchaseIndividualDocumentUpload/${eventId}`}
                className="bg-emerald-800 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                Close
              </button>
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
        <h1 className="text-lg text-[#853FF9] font-medium">Purchase Details</h1>

        {/* ── Students ── */}
        <div className="bg-[#141c30] mt-3">
          {/* Top Row */}
          <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#222b3e]">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-[14px] text-slate-300">Id Card&nbsp; Hard copy Quantity</span>
              <span className="text-[13px] font-semibold text-white">{data?.data?.purchases?.[0]?.requirementNeeded?.[0]?.hardCount}</span>
            </div>
            <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
              <span className="text-[14px] text-slate-300">Certificate Hard Copy Quantity</span>
              <span className="text-[13px] font-semibold text-white">{data?.data?.purchases?.[0]?.requirementNeeded?.[1]?.hardCount}</span>
            </div>
          </div>

          {/* Students Container */}
          <div className="rounded-lg border border-slate-600/40 bg-[#1d2639] p-3">
            <h2 className="mb-3 text-[16px] font-medium text-[#853FF9]">Students</h2>

            {/* Row 1: Trophies */}
            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[14px] text-slate-300">Basic Trophy Quantity</span>
                <span className="text-[13px] font-semibold text-white">{basicTrophy?.quantity}</span>
              </div>
              <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                <span className="text-[14px] text-slate-300">Elite Trophy Quantity</span>
                <span className="text-[13px] font-semibold text-white">{eliteTrophy?.quantity}</span>
              </div>
            </div>

            {/* Row 2: Cash Prize & Kit */}
            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[14px] text-slate-300">Cash Prize Amount</span>
                <span className="text-[13px] font-semibold text-white">₹ {cashPrice?.cashPrizeAmount}</span>
              </div>
              <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                <span className="text-[14px] text-slate-300">Registration Kit Quantity</span>
                <span className="text-[13px] font-semibold text-white">{data?.data?.purchases?.[0]?.students?.registrationKitQty}</span>
              </div>
            </div>

            {/* Row 3: Vouchers */}
            <div className="voucher-container bg-[#2c3548] p-3 mb-2 border border-gray-600 rounded-lg">
              {voucher?.voucher?.map((item, index) => (
                <div key={index} className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">
                  <div className="flex items-center justify-between px-4 py-4">
                    <span className="text-[14px] text-slate-300">Voucher worth</span>
                    <span className="text-[13px] font-semibold text-white">₹ {item?.voucherWorth}</span>
                  </div>
                  <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                    <span className="text-[14px] text-slate-300">Voucher worth Quantity ( ₹ {item?.voucherWorth} )</span>
                    <span className="text-[13px] font-semibold text-white">{item?.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Requirement */}
            <div className="rounded-xl border border-slate-500/40 bg-[#2c3548] px-4 py-4">
              <div className="mb-3 flex items-center gap-1.5">
                <ClipboardList size={14} strokeWidth={1.8} className="text-slate-200" />
                <span className="text-[13px] font-medium text-slate-200">Special Requirement</span>
              </div>
              <p className="text-[14px] leading-6 text-slate-300">{data?.data?.purchases?.[0]?.students?.specialRequirements || "--"}</p>
            </div>
          </div>
        </div>

        {/* ── Guests ── */}
        <div className="bg-[#141c30] mt-3">
          <div className="rounded-lg border border-slate-600/40 bg-[#1d2639] p-3">
            <h2 className="mb-3 text-[16px] font-medium text-[#853FF9]">Guests</h2>

            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[14px] text-slate-300">Basic Trophy Quantity</span>
                <span className="text-[13px] font-semibold text-white">{guestsBasicTrophy?.quantity || "--"}</span>
              </div>
              <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                <span className="text-[14px] text-slate-300">Elite Trophy Quantity</span>
                <span className="text-[13px] font-semibold text-white">{guestsEliteTrophy?.quantity || "--"}</span>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[14px] text-slate-300">Cash Prize Amount</span>
                <span className="text-[13px] font-semibold text-white">₹ {guestsCashPrice?.cashPrizeAmount || "--"}</span>
              </div>
              <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                <span className="text-[14px] text-slate-300">Registration Kit Quantity</span>
                <span className="text-[13px] font-semibold text-white">{data?.data?.purchases?.[0]?.guests?.registrationKitQty || "--"}</span>
              </div>
            </div>

            <div className={`${guestsVoucher?.voucher?.length > 0 ? "" : "hidden"} voucher-container bg-[#2c3548] p-3 mb-2 border border-gray-600 rounded-lg`}>
              {guestsVoucher?.voucher?.map((item, index) => (
                <div key={index} className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">
                  <div className="flex items-center justify-between px-4 py-4">
                    <span className="text-[14px] text-slate-300">Voucher worth</span>
                    <span className="text-[13px] font-semibold text-white">₹ {item?.voucherWorth}</span>
                  </div>
                  <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                    <span className="text-[14px] text-slate-300">Voucher worth Quantity ( ₹ {item?.voucherWorth} )</span>
                    <span className="text-[13px] font-semibold text-white">{item?.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-500/40 bg-[#2c3548] px-4 py-4">
              <div className="mb-3 flex items-center gap-1.5">
                <ClipboardList size={14} strokeWidth={1.8} className="text-slate-200" />
                <span className="text-[13px] font-medium text-slate-200">Special Requirement</span>
              </div>
              <p className="text-[14px] leading-6 text-slate-300">{data?.data?.purchases?.[0]?.guests?.specialRequirements || "--"}</p>
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

export default IndividualPurchaseDetailPage;
