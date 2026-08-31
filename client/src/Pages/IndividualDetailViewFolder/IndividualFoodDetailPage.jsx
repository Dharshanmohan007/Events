import { jwtDecode } from "jwt-decode";
import {
  ChevronRight,
  CalendarDays,
  UserRound,
  Phone,
  FileText,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../Components/Modal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const IndividualFoodDetailPage = ({ data }) => {
  console.log("food data : ", data);

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
    navigate(`/dashboard-faculty/IndividualDocumentUpload/${eventId}`)

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

  // ─── Food types helper ──────────────────────────────────────────────
  const breakfast = data?.data?.foodTypes?.find((item) => {
    console.log("food item : ", item.foodTypes);
  });

  // ─── JSX ────────────────────────────────────────────────────────────
  return (
    <main>
      {/* ─── Header with breadcrumb, status badge, and action buttons ── */}
      <div className="header flex items-center justify-between">
        <breadcrumb className="flex items-center gap-2">
          <h1 className="text-gray-500">Food Request List</h1>
          <ChevronRight size={16} />
          <button className="bg-green-200/10 px-3 py-2 rounded-full text-xs text-[#34D399]">
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
                to={`/dashboard-faculty/IndividualDocumentUpload/${eventId}`}
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
        <h1 className="text-lg text-[#853FF9] font-medium">Food & Refreshment Details</h1>

        {/* ── First section: Date, Resource Type, Counts ── */}
        <div className="w-full mt-2">
          <div className="space-y-4">
            {/* Date / Resource Type */}
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#30394d] bg-[#20293b]">
              <div className="flex items-center justify-between border-r border-[#4a5365] px-4 py-5">
                <div className="flex items-center gap-2 text-[#c3c4d2]">
                  <CalendarDays size={18} strokeWidth={1.7} className="text-[#c5b0ff]" />
                  <span className="text-sm">Date</span>
                </div>
                <span className="text-sm font-semibold text-white">{formatDate(data?.data?.date)}</span>
              </div>
              <div className="flex items-center justify-between px-7 py-5">
                <span className="text-sm text-[#c3c4d2]">Type of resource Person</span>
                <span className="text-sm font-semibold flex flex-wrap items-center gap-1 text-white">
                  {data?.data?.resourcePersonType.map((item, index) => (
                    <div key={index}>
                      <p>&nbsp; {item} /</p>
                    </div>
                  ))}
                </span>
              </div>
            </div>

            {/* Resource Counts */}
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#30394d] bg-[#20293b]">
              <div className="flex items-center justify-between border-r border-[#4a5365] px-4 py-5">
                <span className="text-sm text-[#c3c4d2]">Total number of resource Person</span>
                <span className="text-sm font-semibold text-white">{data?.data?.numberOfResourcePersons} Members</span>
              </div>
              <div className="flex items-center justify-between px-7 py-5">
                <span className="text-sm text-[#c3c4d2]">Total number of Internal Accompanying Person</span>
                <span className="text-sm font-semibold text-white">{data?.data?.numberOfInternalAccompanyingStaff} Members</span>
              </div>
            </div>

            {/* Accompanying Staff */}
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#30394d] bg-[#20293b]">
              <div className="flex items-center gap-4 border-r border-[#4a5365] px-5 py-4">
                <UserRound size={22} strokeWidth={1.8} className="self-start text-[#c5b0ff]" />
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#858b9a]">Accompanying Staff Name</p>
                  <p className="text-sm font-semibold text-white">
                    {data?.data?.accompanyingStaff.map((item, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <p>{item.name}</p>
                      </div>
                    ))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-7 py-4">
                <Phone size={22} strokeWidth={1.8} className="self-start text-[#c5b0ff]" />
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#858b9a]">Accompanying Mobile Number</p>
                  <p className="text-sm font-semibold text-white">
                    {data?.data?.accompanyingStaff.map((item, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <p>{item.mobile}</p>
                      </div>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Food Types ── */}
        {data?.data?.foodTypes?.map((foodItem, index) => {
          const foodName =
            foodItem?.foodTypes?.[0]?.foodType ||
            foodItem?.foodTypes?.[0]?.type ||
            foodItem?.foodTypes?.[0]?.name ||
            ["Breakfast", "Lunch", "Dinner"][index] ||
            `Food ${index + 1}`;

          return (
            <div key={index} className="food-container mt-5">
              <div className="w-full rounded-lg border border-[#30394d] bg-[#232a3c]/30 p-4">
                <h3 className="mb-3 text-lg font-medium text-[#853FF9]">{foodName}</h3>

                {/* Veg */}
                <div className="mb-2 grid h-11 grid-cols-2 overflow-hidden rounded-md border border-[#384155] bg-[#2b3447]">
                  <div className="flex items-center justify-between border-r border-[#4a5365] px-3">
                    <span className="text-[14px] font-normal text-[#c1c4cf]">No. of veg In Participants Menu</span>
                    <span className="text-[14px] font-semibold text-white">{foodItem?.participants?.vegCount ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between px-6">
                    <span className="text-[14px] font-normal text-[#c1c4cf]">No. of veg In Guest/VIP Menu</span>
                    <span className="text-[14px] font-medium text-white">{foodItem?.vipGuests?.vegCount ?? 0}</span>
                  </div>
                </div>

                {/* Non Veg */}
                <div className="grid h-11 grid-cols-2 overflow-hidden rounded-md border border-[#384155] bg-[#2b3447]">
                  <div className="flex items-center justify-between border-r border-[#4a5365] px-3">
                    <span className="text-[14px] font-normal text-[#c1c4cf]">No. of Non-veg In Participants Menu</span>
                    <span className="text-[14px] font-medium text-white">{foodItem?.participants?.nonVegCount ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between px-6">
                    <span className="text-[14px] font-normal text-[#c1c4cf]">No. of Non-veg In Guest/VIP Menu</span>
                    <span className="text-[14px] font-medium text-white">{foodItem?.vipGuests?.nonVegCount ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Special Requirement ── */}
        <div className="w-full rounded-lg border mt-3 border-[#30394d] bg-[#1d2638] px-4 py-3">
          <div className="mb-3 flex items-center gap-1.5">
            <FileText size={18} strokeWidth={1.8} className="text-[#d7d9e2]" />
            <h3 className="text-[14px] font-medium text-[#ffffff]">Special Requirement</h3>
          </div>
          <p className="text-[14px] font-normal leading-[18px] text-[#c1c4cf]/80">{data?.data?.specialRequirements}</p>
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

export default IndividualFoodDetailPage;
