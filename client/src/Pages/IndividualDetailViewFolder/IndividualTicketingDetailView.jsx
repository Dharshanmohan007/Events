import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import TicketingNavbar from "../Dashboards/Ticketing-Dashboard/TicketingNavbar";
import EventHeaderData from "../Dashboards/EventHeaderData";
import {
  ChevronRight,
  UserRound,
  Phone,
  BriefcaseBusiness,
  Building2,
  MapPin,
  VenusAndMars,
  ClipboardList,
} from "lucide-react";
import Modal from "../../Components/Modal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const IndividualTicketingDetailView = ({ data }) => {
  const { eventId } = useParams();

  // Decode user role
  let token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;

  // State for reject modal, loading, and reject reason
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Helper: get authorization headers
  const getAuthHeaders = () => {
    const t = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };
  };

  // Admin Approve
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

  // Admin Reject
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

  // Head Acknowledge
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

  // Head Complete
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

  // Status color helper
  function renderStatusColors(status) {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s === "pending") return "bg-red-300/20 text-red-400";
    if (s === "approved") return "bg-green-300/20 text-green-400";
    if (s === "rejected") return "bg-red-400/20 text-red-400";
    if (s === "closed") return "bg-green-300/20 text-green-400";
    if (s === "acknowledged") return "bg-green-300/20 text-green-400";
    if (s === "completed") return "bg-green-300/20 text-green-400";
    return "";
  }

  // Extract data fields (safe access)
  const guestDetails = data?.guestDetails || {};
  const travelDetails = data?.travelDetails || data?.data || {};
  const checkpoints = travelDetails.checkpoints || [];

  return (
    <>
      <main className="bg-[#0b1326]">
        <TicketingNavbar />

        {/* Header with breadcrumb, status badge, and action buttons */}
        <div className="header px-4 mt-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1>Ticketing Details</h1>
            <ChevronRight />
            <h1 className="text-[#d0bcff]">
              {data?.employeeDetail?.department || "--"}
            </h1>
            <h1>--</h1>
            <button className="text-amber-300 bg-amber-200/20 text-xs py-2 px-2 rounded-full">
              {data?.employeeDetail?.department || "Department"}
            </button>
            <h1>--</h1>

            {/* Status badge (role-based) */}
            {(role.toLowerCase() === "admin" ||
              role.toLowerCase() === "super admin 1" ||
              role.toLowerCase() === "super admin 2") && (
              <button
                className={`text-xs py-2 px-2 rounded-full ${renderStatusColors(
                  data?.superAdminApproval?.status
                )}`}
              >
                {data?.superAdminApproval?.status}
              </button>
            )}
            {role.toLowerCase() === "faculty" && (
              <button
                className={`text-xs py-2 px-2 rounded-full ${renderStatusColors(
                  data?.finalStatus
                )}`}
              >
                {data?.finalStatus}
              </button>
            )}
            {role.toLowerCase() === "head" && (
              <button
                className={`text-xs py-2 px-2 rounded-full ${renderStatusColors(
                  data?.headApproval?.status
                )}`}
              >
                {data?.headApproval?.status}
              </button>
            )}
          </div>

          {/* Admin action buttons */}
          {(role.toLowerCase() === "admin" ||
            role.toLowerCase() === "super admin 1" ||
            role.toLowerCase() === "super admin 2") &&
            data?.superAdminApproval?.status?.toLowerCase() === "pending" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdminApprove}
                  disabled={actionLoading}
                  className="bg-linear-to-r from-emerald-800 to-emerald-900 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="bg-red-800 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}

          {/* Head action buttons */}
          {role.toLowerCase() === "head" && (
            <div className="flex items-center gap-2">
              {data?.headApproval?.status?.toLowerCase() === "pending" && (
                <button
                  onClick={handleAcknowledge}
                  disabled={actionLoading}
                  className="bg-linear-to-r from-emerald-800 to-emerald-900 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Acknowledge"}
                </button>
              )}
              {data?.headApproval?.status?.toLowerCase() ===
                "acknowledged" && (
                <button
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="bg-linear-to-r from-emerald-800 to-emerald-900 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Complete"}
                </button>
              )}
              {data?.headApproval?.status?.toLowerCase() === "completed" && (
                <button className="bg-linear-to-r from-emerald-800 to-emerald-900 text-white px-3 py-1 rounded-lg">
                  Completed
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="main-content border border-[#202739] rounded-lg bg-[#182032] mx-5 p-4 mt-4">
          <h1 className="mb-4 font-medium text-violet-700">
            Ticketing Details
          </h1>

          {/* Event Header Data */}
          <EventHeaderData data={data?.requestDetails || data} />

          {/* Organizer details */}
          <div className="flex w-full mt-2 items-center rounded-lg border border-[#374151] bg-[#2d37489d] px-5 py-3">
            <div className="flex flex-1 items-center gap-4 border-r border-[#4b5563] pr-6">
              <UserRound size={20} strokeWidth={1.8} className="text-[#c4b5fd]" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                  Organizer Name
                </p>
                <p className="mt-1 text-[15px] font-semibold text-white">
                  {data?.organizerDetails?.organizers?.[0]?.name || "--"}
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-4 border-r border-[#4b5563] px-6">
              <Phone size={20} strokeWidth={1.8} className="text-[#c4b5fd]" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                  Organizer Phone Number
                </p>
                <p className="mt-1 text-[15px] font-semibold text-white">
                  {data?.organizerDetails?.organizers?.[0]?.mobile || "--"}
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-4 pl-6">
              <Building2 size={20} strokeWidth={1.8} className="text-[#c4b5fd]" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                  Organizer Department
                </p>
                <p className="mt-1 text-[15px] font-semibold text-white">
                  {data?.organizerDetails?.organizers?.[0]?.department || "--"}
                </p>
              </div>
            </div>
          </div>

          {/* Guest details */}
          <div className="guest-detail-container mt-4 border border-gray-700 rounded-lg p-2">
            <h1 className="text-[#6508e7] mb-2 font-medium">Guest Details</h1>
            <div className="w-full">
              <div className="flex min-h-[100px] items-center rounded-xl bg-[#2d37489d] px-5">
                {/* Guest Name */}
                <div className="flex flex-1 items-center gap-4 px-4 border-r border-[#536078]">
                  <UserRound
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />
                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                      GUEST NAME
                    </p>
                    <p className="text-[15px] font-bold text-[#f4ede8]">
                      {guestDetails.name || travelDetails.guestName || "--"}
                    </p>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex flex-1 items-center gap-4 px-4 border-r border-[#536078]">
                  <Phone
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />
                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                      MOBILE NUMBER
                    </p>
                    <p className="text-[15px] font-bold text-[#f4ede8]">
                      {guestDetails.mobile ||
                        travelDetails.guestPhone ||
                        "--"}
                    </p>
                  </div>
                </div>

                {/* Designation */}
                <div className="flex flex-1 items-center gap-4 px-4 border-r border-[#536078]">
                  <BriefcaseBusiness
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />
                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                      DESIGNATION
                    </p>
                    <p className="text-[15px] font-bold text-[#f4ede8]">
                      {guestDetails.designation ||
                        travelDetails.designation ||
                        "--"}
                    </p>
                  </div>
                </div>

                {/* Organization */}
                <div className="flex flex-1 items-center gap-4 px-4 border-r border-[#536078]">
                  <Building2
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />
                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                      ORGANIZATION
                    </p>
                    <p className="text-[15px] font-bold leading-5 text-[#f4ede8]">
                      {guestDetails.organization ||
                        travelDetails.organization ||
                        "--"}
                    </p>
                  </div>
                </div>

                {/* Gender */}
                <div className="flex flex-1 items-center gap-4 px-4">
                  <VenusAndMars
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />
                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                      GENDER
                    </p>
                    <p className="text-[15px] font-bold text-[#f4ede8]">
                      {guestDetails.gender || travelDetails.gender || "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup --- Drop route */}
          <div className="w-full border border-gray-700 rounded-lg mt-3 px-3 py-3">
            <div className="flex items-center">
              {/* Pickup Location */}
              <div className="flex w-[290px] items-center gap-3 rounded-lg bg-[#344057] px-4 py-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <MapPin size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase text-[#aab3c5]">
                    Pickup Location
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {travelDetails.pickupLocation || "--"}
                  </p>
                </div>
              </div>

              <div className="h-0 flex-1 border-t border-dashed border-[#536078]" />

              {/* Checkpoints / Intermediate Stops */}
              {checkpoints.length > 0
                ? checkpoints.map((cp, index) => (
                    <React.Fragment key={index}>
                      <div className="flex w-[220px] items-center gap-3 rounded-lg bg-[#344057] px-4 py-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600">
                          <MapPin size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium uppercase text-[#aab3c5]">
                            Stop {index + 1}
                          </p>
                          <p className="text-sm font-semibold text-white">
                            {cp.location || cp}
                          </p>
                        </div>
                      </div>
                      <div className="h-0 flex-1 border-t border-dashed border-[#536078]" />
                    </React.Fragment>
                  ))
                : null}

              {/* Drop Location */}
              <div className="flex w-[290px] items-center gap-3 rounded-lg bg-[#344057] px-4 py-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <MapPin size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase text-[#aab3c5]">
                    Drop Location
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {travelDetails.dropLocation || "--"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Count section */}
          <div className="w-full rounded-lg border border-gray-700 mt-3 p-2">
            {/* First Row */}
            <div className="grid grid-cols-2 rounded-md border border-[#3d4a61] bg-[#2d37489d]">
              {/* Total Number of Members */}
              <div className="flex items-center justify-between border-r border-[#46536a] px-3 py-3">
                <span className="text-[15px] font-medium text-[#c3c9d5]">
                  Total Number of Members
                </span>
                <span className="text-[15px] font-bold text-[#f1eee9]">
                  {travelDetails.totalPassengers ||
                    travelDetails.totalMembers ||
                    "--"}
                </span>
              </div>

              {/* Type of Vehicle */}
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[15px] font-medium text-[#c3c9d5]">
                  Type of Vehicle
                </span>
                <span className="text-[15px] font-bold text-[#f1eee9]">
                  {travelDetails.vehicleType ||
                    travelDetails.vehicles?.map((v) => v.type).join(", ") ||
                    "--"}
                </span>
              </div>
            </div>

            {/* Second Row */}
            <div className="mt-1 grid grid-cols-1 rounded-md border border-[#3d4a61] bg-[#2d37489d]">
              {/* Train Coach Class */}
              <div className="flex items-center justify-between border-b border-[#46536a] px-3 py-3">
                <span className="text-[15px] font-medium text-[#c3c9d5]">
                  Train Coach Class
                </span>
                <span className="text-[15px] font-bold text-[#f1eee9]">
                  {travelDetails.trainCoachClass ||
                    travelDetails.coachClass ||
                    "--"}
                </span>
              </div>

              {/* Travel Class */}
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[15px] font-medium text-[#c3c9d5]">
                  Travel Class
                </span>
                <span className="text-[15px] font-bold text-[#f1eee9]">
                  {travelDetails.travelClass || "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Special requirements */}
          <div className="w-full rounded-lg border border-[#46536a] mt-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <ClipboardList
                size={15}
                strokeWidth={1.8}
                className="text-[#c3c9d5]"
              />
              <h3 className="text-[15px] font-semibold text-[#f1eee9]">
                Special Requirement
              </h3>
            </div>
            <p className="mt-3 text-[15px] font-medium leading-relaxed text-[#c3c9d5]">
              {travelDetails.specialRequirements ||
                data?.data?.specialRequirements ||
                "--"}
            </p>
          </div>
        </div>
      </main>

      {/* Reject Reason Modal */}
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
    </>
  );
};

export default IndividualTicketingDetailView;
