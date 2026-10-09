import React, { useState } from "react";
import DashboardHeader from "../Dashboards/ICTC-Dashboard/DashboardHeader";
import EventsAttendingHead from "../Dashboards/EventsAttending-Dashboard/EventsAttendingHead";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronRight, ExternalLink, File, Pencil, Trash } from "lucide-react";
import Modal from "../../Components/Modal";
import DeleteConfirmationPopup from "../Dashboards/Admin-Dashboard/DeleteConfirmationPopup";
import {
  CalendarDays,
  Clock3,
  UserRound,
  Phone,
  NotebookText,
  MapPin,
  Users,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const EventsAttendingDetailView = ({ data }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = token ? jwtDecode(token)?.role?.toLowerCase() : "";
  const isAdmin = ["admin", "super admin 1", "super admin 2"].includes(role);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const submitApproval = async (action, reason) => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/individual-submissions/${eventId}/super-admin-approval`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ action, ...(reason ? { reason } : {}) }),
        },
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to ${action} request`);
      }
      toast.success(
        action === "approve"
          ? "Approved successfully"
          : "Rejected successfully",
      );
      window.location.reload();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim())
      return toast.error("Please enter a rejection reason");
    submitApproval("reject", rejectReason.trim());
    setShowRejectModal(false);
    setRejectReason("");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/individual-submissions/${eventId}`,
        { method: "DELETE", headers: getAuthHeaders() },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.message || "Failed to delete submission");
      toast.success("Submission deleted successfully");
      navigate(-1);
    } catch (error) {
      toast.error(error.message || "Failed to delete submission");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-red-300/20 text-red-400";
      case "approved":
      case "acknowledged":
      case "completed":
        return "bg-green-300/20 text-green-400";
      case "rejected":
        return "bg-red-400/20 text-red-400";
      default:
        return "";
    }
  };

  const convertToIST = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "—";
    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRequirement = (value) => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return value || "—";
  };

  console.log("event attending data : ", data);

  return (
    <main className="bg-[#0b1326] min-h-screen  p-4">
      {isAdmin && (
        <div className="header flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-gray-500">Events Attending Request List</h1>
            <ChevronRight size={16} />
            <span className="rounded-full bg-yellow-200/10 px-3 py-2 text-xs text-yellow-500">
              {data?.department || "Department"}
            </span>
            <ChevronRight size={16} />
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-amber-400">
                Submitted at :{" "}
                {convertToIST(data?.approvalHistory?.[0]?.actionDate)}
              </h1>
              <ChevronRight size={16} />
              <span
                className={`rounded-full px-3 py-2 text-xs ${renderStatusColors(data?.superAdminApproval?.status)}`}
              >
                {data?.superAdminApproval?.status || "Pending"}
              </span>
              <Link
                to={`/events-attended/edit/${eventId}`}
                className="edit-icon flex h-8 w-8 items-center justify-center gap-2 rounded-lg bg-green-100/20"
                title="Edit submission"
              >
                <Pencil className="text-green-600" size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-green-100/20 hover:bg-red-500/20"
                title="Delete submission"
              >
                <Trash className="text-red-500" size={14} />
              </button>
            </div>
          </div>
          {data?.superAdminApproval?.status?.toLowerCase() === "pending" && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => submitApproval("approve")}
                disabled={actionLoading}
                className="cursor-pointer rounded-lg bg-emerald-900 px-4 py-2 text-white disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="cursor-pointer rounded-lg bg-red-800 px-4 py-2 text-white disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}
      {role === "faculty" && (
        <div className="header flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-gray-500">Events Attending Request List</h1>
            <ChevronRight size={16} />
            <span className="rounded-full bg-yellow-200/10 px-3 py-2 text-xs text-yellow-500">
              {data?.department ||
                data?.employeeDetail?.department ||
                "Department"}
            </span>
            <ChevronRight size={16} />
            <span
              className={`rounded-full px-3 py-2 text-xs ${renderStatusColors(data?.finalStatus)}`}
            >
              {data?.finalStatus || "Pending"}
            </span>
          </div>
          {data?.superAdminApproval?.status?.toLowerCase() === "approved" && (
            <Link
              to={`/dashboard-faculty/IndividualDocumentUpload/${eventId}`}
              className="cursor-pointer rounded-lg bg-emerald-800 px-4 py-2 text-white"
            >
              Close
            </Link>
          )}
        </div>
      )}{" "}
      {/* Program Name */}{" "}
      <div className="bg-[#1c2537] rounded-md mb-2 mt-4 ">
        {" "}
        <div className="flex items-center justify-between px-3 py-4">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Name of the program{" "}
          </span>{" "}
          <span className="text-[14px] font-medium text-white">
            {" "}
            {data?.data?.programName}{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* Program Dates */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-[#1c2537] rounded-md mb-2 ">
        {" "}
        {/* Date From */}{" "}
        <div className="flex items-center justify-between px-3 py-4 border-b md:border-b-0 md:border-r border-[#3a4354]">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <CalendarDays className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[16px] text-gray-400">
              {" "}
              Date of the program ( From ){" "}
            </span>{" "}
          </div>{" "}
          <span className="text-[14px] font-medium text-white">
            {" "}
            {formatDate(data?.data?.programFromDate)}{" "}
          </span>{" "}
        </div>{" "}
        {/* Date To */}{" "}
        <div className="flex items-center justify-between px-3 py-4">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <CalendarDays className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[16px] text-gray-400">
              {" "}
              Date of the program ( To ){" "}
            </span>{" "}
          </div>{" "}
          <span className="text-[14px] font-medium text-white">
            {" "}
            {formatDate(data?.data?.programToDate)}{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}



       <div className="grid grid-cols-1  bg-[#1c2537] rounded-md mb-2 ">
        <div className="flex items-center justify-between px-3 py-4 ">
         
          <div className="flex items-center gap-2">

            <File className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[16px] text-gray-400">
              {" "}
              Principal Approval Form{" "}
            </span>{" "}
          </div>{" "}
          <span className="text-[14px] font-medium text-white">
           <button  onClick={()=>{
            window.open(`${data?.data?.principalApprovalFormName}`)
           }} className="underline cursor-pointer flex items-center gap-2">View document <span><ExternalLink size={13}/></span> </button>
          </span>{" "}
        </div>
      </div>



      {/* Participants / Expected Outcome */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-[#1c2537] rounded-md mb-2">
        {" "}
        {/* Participants */}{" "}
        <div className="flex items-center justify-between px-3 py-4 border-b md:border-b-0 md:border-r border-[#3a4354]">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Total number of Participants{" "}
          </span>{" "}
          <span className="text-[14px] font-medium text-white">
            {" "}
            {data?.data?.numberOfParticipants}{" "}
            <p>
              {data?.data?.numberOfParticipants == 1 ? "Member" : "Members"}
            </p>
          </span>{" "}
        </div>{" "}
        {/* Expected Outcome */}{" "}
        <div className="flex items-center justify-between px-3 py-4">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Expected outcome of the program{" "}
          </span>{" "}
          <span className="text-[14px] font-medium text-white">
            {" "}
            {data?.data?.expectedOutcome}{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* Participant Information */}{" "}
      {data?.data?.participants?.map((item) => {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 bg-[#1c2537] rounded-md mb-2">
            {" "}
            {/* Participant Name */}{" "}
            <div className="px-3 py-4 border-b sm:border-b-0 sm:border-r border-[#3a4354]">
              {" "}
              <div className="flex items-center gap-2 mb-2">
                {" "}
                <UserRound className="w-4 h-4 text-[#a78bfa]" />{" "}
                <span className="text-[12px] text-gray-500 uppercase">
                  {" "}
                  Participant Name{" "}
                </span>{" "}
              </div>{" "}
              <p className="text-[14px] font-medium text-white">
                {" "}
                {item?.name}{" "}
              </p>{" "}
            </div>{" "}
            {/* Mobile Number */}{" "}
            <div className="px-3 py-4 border-b sm:border-b-0 sm:border-r border-[#3a4354]">
              {" "}
              <div className="flex items-center gap-2 mb-2">
                {" "}
                <Phone className="w-4 h-4 text-[#a78bfa]" />{" "}
                <span className="text-[12px] text-gray-500 uppercase">
                  {" "}
                  Accompanying Mobile Number{" "}
                </span>{" "}
              </div>{" "}
              <p className="text-[14px] font-medium text-white">
                {" "}
                {item?.phoneNumber}{" "}
              </p>{" "}
            </div>{" "}
            {/* Department */}{" "}
            <div className="px-3 py-4">
              {" "}
              <div className="flex items-center gap-2 mb-2">
                {" "}
                <UserRound className="w-4 h-4 text-[#a78bfa]" />{" "}
                <span className="text-[12px] text-gray-500 uppercase">
                  {" "}
                  Participant Department{" "}
                </span>{" "}
              </div>{" "}
              <p className="text-[14px] font-medium text-white">
                {item?.department}
              </p>{" "}
            </div>{" "}
          </div>
        );
      })}{" "}
      {/* Off Campus Details */}{" "}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 mb-2">
        {" "}
        {/* Off Campus Date From */}{" "}
        <div className="bg-[#1c2537] rounded-md px-3 py-3">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <CalendarDays className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[12px] text-gray-400 uppercase">
              {" "}
              Off Campus Date ( From ){" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white mt-2">
            {" "}
            {formatDate(
              data?.data?.onDutyFrom || data?.data?.offCampusFrom,
            )}{" "}
          </p>{" "}
        </div>{" "}
        {/* Off Campus Date To */}{" "}
        <div className="bg-[#1c2537] rounded-md px-3 py-3">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <CalendarDays className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[12px] text-gray-400 uppercase">
              {" "}
              Off Campus Date ( To ){" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white mt-2">
            {" "}
            {formatDate(data?.data?.onDutyTo || data?.data?.offCampusTo)}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Requirements */}{" "}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-[#1c2537] rounded-md mb-2">
        {" "}
        {/* Food */}{" "}
        <div className="px-3 py-4 border-b sm:border-b-0 sm:border-r border-[#3a4354]">
          {" "}
          <div className="flex justify-between w-full">
            <span className="text-[16px] text-gray-400"> Food Required </span>{" "}
            <span
              className={`text-[14px] font-medium ${formatRequirement(data?.data?.foodRequired ?? data?.data?.food).toLowerCase() === "yes" ? "text-green-400" : "text-red-400"} `}
            >
              {" "}
              {formatRequirement(
                data?.data?.foodRequired ?? data?.data?.food,
              )}{" "}
            </span>{" "}
          </div>
          <div className="food-amnt-container mt-2 w-full flex items-center justify-between">
            <p>Amount</p>
            <p> ₹ {data?.data?.foodAmount}</p>
          </div>
        </div>{" "}
        {/* Transport */}{" "}
        <div className="px-3 py-4 border-b sm:border-b-0 sm:border-r border-[#3a4354]">
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-gray-400">
              Transport Required{" "}
            </span>
            <span
              className={`text-[14px] font-medium ${formatRequirement(data?.data?.transportRequired ?? data?.data?.transport).toLowerCase() === "yes" ? "text-green-400" : "text-red-400"} `}
            >
              {formatRequirement(
                data?.data?.transportRequired ?? data?.data?.transport,
              )}
            </span>
          </div>
          <div className="food-amnt-container mt-2 w-full flex items-center justify-between">
            <p>Amount</p>
            <p> ₹ {data?.data?.transportAmount}</p>
          </div>
        </div>{" "}
        {/* Accommodation */}{" "}
        <div className=" px-3 py-4">
          <div className="flex items-center justify-between ">
            {" "}
            <span className="text-[16px] text-gray-400">
              {" "}
              Accommodation Required{" "}
            </span>{" "}
            <span
              className={`text-[14px] font-medium  ${formatRequirement(data?.data?.accommodationRequired ?? data?.data?.accommodation).toLowerCase() === "yes" ? "text-green-400" : "text-red-400"} `}
            >
              {" "}
              {formatRequirement(
                data?.data?.accommodationRequired ?? data?.data?.accommodation,
              )}{" "}
            </span>{" "}
          </div>
          <div className="food-amnt-container mt-2 w-full flex items-center justify-between">
            <p>Amount</p>
            <p> ₹ {data?.data?.accommodationAmount}</p>
          </div>
        </div>{" "}
      </div>{" "}
      {data?.data?.externalTransportRequired === true && (
        <section className="mb-2 rounded-md border border-[#30394d] bg-[#1d2638] p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-medium text-white">
            <MapPin className="h-4 w-4 text-[#a78bfa]" /> External Transport
          </h2>
          {Array.isArray(data?.data?.externalTransport) &&
          data.data.externalTransport.length > 0 ? (
            <div className="space-y-3">
              {data.data.externalTransport.map((transport, transportIndex) => {
                const passengers = Array.isArray(transport?.passengers)
                  ? transport.passengers
                  : [];
                const transportNumber =
                  transport?.transportNumber ||
                  transport?.trainNumber ||
                  transport?.flightNumber;

                return (
                  <article
                    key={transport?._id || transportIndex}
                    className="overflow-hidden rounded-lg border border-[#3b465c] bg-[#20293b]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3a4354] px-4 py-3">
                      <h3 className="font-medium text-purple-300">
                        {transport?.travelOption || "Transport"}{" "}
                        {transportIndex + 1}
                      </h3>
                      <span className="text-sm text-gray-400">
                        {formatDate(transport?.travelDate)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      <ExternalTransportField
                        icon={MapPin}
                        label="From"
                        value={transport?.from}
                      />
                      <ExternalTransportField
                        icon={MapPin}
                        label="To"
                        value={transport?.to}
                      />
                      <ExternalTransportField
                        icon={Users}
                        label="Passengers"
                        value={
                          transport?.totalPassengers ??
                          transport?.numberOfPassengers
                        }
                      />
                      <ExternalTransportField
                        label="Class / Berth"
                        value={
                          transport?.classOrBerth || transport?.travelClass
                        }
                      />
                      <ExternalTransportField
                        label="Transport number"
                        value={transportNumber}
                      />
                      <ExternalTransportField
                        label="Special requirements"
                        value={transport?.specialRequirements}
                      />
                    </div>
                    <div className="border-t border-[#3a4354] p-4">
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-200">
                        <Users className="h-4 w-4 text-[#a78bfa]" /> Passenger
                        details
                      </h4>
                      {passengers.length > 0 ? (
                        <div className="space-y-2">
                          {passengers.map((passenger, passengerIndex) => (
                            <div
                              key={passenger?._id || passengerIndex}
                              className="grid grid-cols-1 gap-3 rounded-lg border border-[#3b465c] bg-[#1c2537] p-3 sm:grid-cols-2 lg:grid-cols-4"
                            >
                              <ExternalTransportField
                                label="Name"
                                value={passenger?.name}
                              />
                              <ExternalTransportField
                                label="Phone"
                                value={
                                  passenger?.phoneNumber || passenger?.phone
                                }
                              />
                              <ExternalTransportField
                                label="Age / Gender"
                                value={[passenger?.age, passenger?.gender]
                                  .filter(
                                    (value) =>
                                      value !== undefined && value !== "",
                                  )
                                  .join(" / ")}
                              />
                              <ExternalTransportField
                                label="Designation / Organization"
                                value={[
                                  passenger?.designation,
                                  passenger?.organization,
                                ]
                                  .filter(Boolean)
                                  .join(" / ")}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          No passenger details provided.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              External transport was requested, but no transport details were
              provided.
            </p>
          )}
        </section>
      )}
      {/* Special Requirement */}{" "}
      <div className="bg-[#1c2537] rounded-md p-4">
        {" "}
        <div className="flex items-center gap-2 mb-3">
          {" "}
          <NotebookText className="w-4 h-4 text-[#a78bfa]" />{" "}
          <span className="text-[16px] font-medium text-white">
            {" "}
            Special Requirement{" "}
          </span>{" "}
        </div>{" "}
        <p className="text-[14px] text-gray-400 leading-relaxed">
          {" "}
          {data?.data?.specialRequirement}{" "}
        </p>{" "}
      </div>{" "}
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
          onChange={(event) => setRejectReason(event.target.value)}
          className="mt-4 min-h-[100px] w-full rounded-lg border border-gray-600 bg-[#1a1a2e] p-3 text-sm text-white"
          placeholder="Enter rejection reason..."
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason("");
            }}
            className="rounded-lg border border-gray-600 px-4 py-2 text-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={actionLoading}
            className="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50"
          >
            {actionLoading ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </Modal>
      {showDeleteConfirm && (
        <DeleteConfirmationPopup
          title="Delete Submission"
          message="Are you sure you want to delete this individual event attending submission? This action cannot be undone."
          deleting={deleting}
          onCancel={() => setShowDeleteConfirm(false)}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
};

const ExternalTransportField = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 border-b border-[#3a4354] px-3 py-3 last:border-b-0">
    <div className="flex items-center gap-2 text-xs uppercase text-gray-400">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-[#a78bfa]" />}
      <span>{label}</span>
    </div>
    <span className="text-right text-sm font-medium text-white">
      {value || "—"}
    </span>
  </div>
);

export default EventsAttendingDetailView;
