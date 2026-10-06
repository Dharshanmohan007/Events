import React, { useState } from "react";
import DashboardHeader from "../Dashboards/ICTC-Dashboard/DashboardHeader";
import EventsAttendingHead from "../Dashboards/EventsAttending-Dashboard/EventsAttendingHead";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronRight, Pencil, Trash } from "lucide-react";
import Modal from "../../Components/Modal";
import DeleteConfirmationPopup from "../Dashboards/Admin-Dashboard/DeleteConfirmationPopup";
import {
  CalendarDays,
  Clock3,
  UserRound,
  Phone,
  NotebookText,
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
      toast.success(action === "approve" ? "Approved successfully" : "Rejected successfully");
      window.location.reload();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return toast.error("Please enter a rejection reason");
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
      if (!response.ok) throw new Error(result.message || "Failed to delete submission");
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
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
                Submitted at : {convertToIST(data?.approvalHistory?.[0]?.actionDate)}
              </h1>
              <ChevronRight size={16} />
              <span className={`rounded-full px-3 py-2 text-xs ${renderStatusColors(data?.superAdminApproval?.status)}`}>
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
      {" "}
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
      <div className="grid grid-cols-1 md:grid-cols-2 bg-[#1c2537] rounded-md mb-2">
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
      
      {data?.data?.participants?.map((item)=>{
        return <div className="grid grid-cols-1 sm:grid-cols-3 bg-[#1c2537] rounded-md mb-2">
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
          <p className="text-[14px] font-medium text-white">{item?.department}</p>{" "}
        </div>{" "}
      </div>
      })}
      
      {" "}
      {/* Off Campus Details */}{" "}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
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
            {formatDate(data?.data?.offCampusFrom)}{" "}
          </p>{" "}
        </div>{" "}
        {/* Off Campus Time From */}{" "}
        <div className="bg-[#1c2537] rounded-md px-3 py-3">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <Clock3 className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[12px] text-gray-400 uppercase">
              {" "}
              Off Campus Time ( From ){" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white mt-2">
            {" "}
            {" "}
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
            {formatDate(data?.data?.offCampusTo)}{" "}
          </p>{" "}
        </div>{" "}
        {/* Off Campus Time To */}{" "}
        <div className="bg-[#1c2537] rounded-md px-3 py-3">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <Clock3 className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[12px] text-gray-400 uppercase">
              {" "}
              Off Campus Time ( To ){" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white mt-2">
            {" "}
            {" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Requirements */}{" "}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-[#1c2537] rounded-md mb-2">
        {" "}
        {/* Food */}{" "}
        <div className="flex items-center justify-between px-3 py-4 border-b sm:border-b-0 sm:border-r border-[#3a4354]">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Food Required{" "}
          </span>{" "}
          <span className={`text-[14px] font-medium ${data?.data?.food.toLowerCase() == "yes" ? "text-green-400" : "text-red-400"} `}>
            {" "}
            {data?.data?.food}{" "}
          </span>{" "}
        </div>{" "}
        {/* Transport */}{" "}
        <div className="flex items-center justify-between px-3 py-4 border-b sm:border-b-0 sm:border-r border-[#3a4354]">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Transport Required{" "}
          </span>{" "}
          <span className={`text-[14px] font-medium ${data?.data?.transport.toLowerCase() == "yes" ? "text-green-400" : "text-red-400"} `}>
            {" "}
            {data?.data?.transport}{" "}
          </span>{" "}
        </div>{" "}
        {/* Accommodation */}{" "}
        <div className="flex items-center justify-between px-3 py-4">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Accommodation Required{" "}
          </span>{" "}
          <span className={`text-[14px] font-medium  ${data?.data?.accommodation.toLowerCase() == "yes" ? "text-green-400" : "text-red-400"} `}>
            {" "}
            {data?.data?.accommodation}{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
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
        onClose={() => { setShowRejectModal(false); setRejectReason(""); }}
        title="Reason for Rejection"
      >
        <p className="text-sm text-gray-400">Please enter the reason for rejecting this request.</p>
        <textarea
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          className="mt-4 min-h-[100px] w-full rounded-lg border border-gray-600 bg-[#1a1a2e] p-3 text-sm text-white"
          placeholder="Enter rejection reason..."
        />
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => { setShowRejectModal(false); setRejectReason(""); }} className="rounded-lg border border-gray-600 px-4 py-2 text-gray-300">Cancel</button>
          <button type="button" onClick={handleReject} disabled={actionLoading} className="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50">{actionLoading ? "Rejecting..." : "Reject"}</button>
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

export default EventsAttendingDetailView;
