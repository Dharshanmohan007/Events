import { jwtDecode } from "jwt-decode";
import { ChevronRight, CalendarDays, FileText, FileCheck2 } from "lucide-react";
import React from "react";

const formatDate = (date) => {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const IndividualVideoDetailPage = ({ data }) => {
  let token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;

  // functions for approval and reject
  async function handleAdminApprove() { }
  async function handleAdminReject() { }
  async function handleFacultyClose() { }
  async function handleAcknowledge() { }
  async function handleComplete() { }

  return (
    <main>
      <div className="header flex items-center justify-between">
        <breadcrumb className="flex items-center gap-2">
          <h1 className="text-gray-500">Video Request List</h1>
          <ChevronRight size={16} className="" />
          <button className="bg-green-200/10 px-3 py-2 rounded-full text-xs text-[#34D399]">
            {data?.data?.employee?.department}
          </button>
        </breadcrumb>

        {/* -------------------------------------- admin button container ------------------------------------- */}
        <div className="button-container">
          {(
            role.toLowerCase() === "admin" ||
            role.toLowerCase() === "super admin 1" ||
            role.toLowerCase() === "super admin 2"
          ) &&
            data?.superAdminApproval?.status?.toLowerCase() === "pending" && (
              <div className="admin-btn-container flex items-center gap-2">
                <button onClick={handleAdminApprove} className="bg-emerald-900 text-white px-4 py-2 rounded-lg cursor-pointer">Approve</button>
                <button onClick={handleAdminReject} className="bg-red-800 text-white px-4 py-2 rounded-lg cursor-pointer">Reject</button>
              </div>
            )}
        </div>

        {/* ----------------------------------------- Faculty button container -------------------------------  */}
        {role.toLowerCase() === "faculty" &&
          <div className="button-container">
            {role.toLowerCase() === "faculty" && data?.superAdminApproval?.status?.toLowerCase() === "approved" && <button onClick={handleFacultyClose} className="bg-emerald-800 text-white px-4 py-2 rounded-lg cursor-pointer">Close</button>}
          </div>}

        {/* ----------------------------------------- Head button container -------------------------------  */}
        {role?.toLowerCase() === "head" && <div className="button-container">
          {role?.toLowerCase() === "head" && data?.headApproval?.status?.toLowerCase() === "pending" && <>
            <div className="head-btn-container flex items-center gap-2">
              <button onClick={handleAcknowledge} className="bg-emerald-900 text-white px-4 py-2 rounded-lg cursor-pointer">Acknowledge</button>
            </div>
            {role?.toLowerCase() === "head" && data?.headApproval?.status?.toLowerCase() === "acknowledged" && <button onClick={handleComplete} className="bg-emerald-900 text-white px-4 py-2 rounded-lg cursor-pointer">Complete</button>}
            {role?.toLowerCase() === "head" && data?.headApproval?.status?.toLowerCase() === "completed" && <button className="bg-emerald-900 text-white px-4 py-2 rounded-lg cursor-pointer">Completed</button>}
          </>}
        </div>}
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
              {data?.data?.video?.referenceFiles?.map((item, index) => (
                <button
                  key={index}
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
              {data?.data?.video?.preEventVideos?.map((item, index) => (
                <p key={index} className="mb-2 text-[13px] font-medium text-white">{item}</p>
              ))}
            </div>
            <div className="rounded-lg border border-slate-500/30 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />
                <span className="text-[14px] font-medium text-white">Post-Event Videos</span>
              </div>
              {data?.data?.video?.postEventVideos?.map((item, index) => (
                <div key={index} className="mb-2 flex items-center justify-between">
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
    </main>
  );
};

export default IndividualVideoDetailPage;
