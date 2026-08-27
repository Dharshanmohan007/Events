import { jwtDecode } from "jwt-decode";
import { ChevronRight } from "lucide-react";
import React from "react";

const IndividualPosterDetailPage = ({ data }) => {
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
          <h1 className="text-gray-500">Poster Request List</h1>
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

      <div className="bg-[#232a3c]/30 mt-4 p-4 rounded-xl border border-gray-700 w-full">
        <h1 className="text-lg text-[#853FF9] font-medium">Poster Details</h1>
        <p className="text-sm text-gray-400 mt-2">Poster details will be rendered here.</p>
      </div>
    </main>
  );
};

export default IndividualPosterDetailPage;
