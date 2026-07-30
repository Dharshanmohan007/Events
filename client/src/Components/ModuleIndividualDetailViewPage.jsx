import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, FileText, Shield, CheckCircle2, XCircle, Clock, Check } from "lucide-react";
import { toast } from "react-toastify";

import FacultyPurchaseDetailsPanel from "../Pages/Dashboards/Faculty-Dashboard/FacultyPurchaseDetailsPanel";
import FacultyFoodRefreshmentDetailsPanel from "../Pages/Dashboards/Faculty-Dashboard/FacultyFoodRefreshmentDetailsPanel";
import FacultyTransportationDetailsPanel from "../Pages/Dashboards/Faculty-Dashboard/FacultyTransportationDetailsPanel";
import FacultyMediaDetailsPanel from "../Pages/Dashboards/Faculty-Dashboard/FacultyMediaDetailsPanel";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const getStatusClassName = (status) => {
  if (!status || status === "-") return "bg-[#0e5149]/55 text-[#20D18C]";
  const s = String(status).toLowerCase();
  if (s === "completed") return "bg-[#4A2BB7]/35 text-[#A78BFA]";
  if (s === "pending for acknowledge") return "bg-[#5D1438]/50 text-[#FF4F91]";
  if (s === "acknowledged")
    return "bg-gradient-to-r from-emerald-700 to-emerald-900 text-[#ffffff]/80";
  if (s === "admin canceled") return "bg-yellow-700 text-[#FF4F91]";
  if (s === "approved") return "bg-[#0e5149]/55 text-[#20D18C]";
  if (s === "pending") return "bg-[#5D1438]/50 text-[#FF4F91]";
  return "bg-[#0e5149]/55 text-[#20D18C]";
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const InfoGridItem = ({ label, value }) => (
  <div className="flex flex-col gap-1 rounded-lg border border-[#374155]/60 bg-[#1B2334] px-4 py-3">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
      {label}
    </span>
    <span className="text-sm font-medium text-white">{value || "-"}</span>
  </div>
);

const ApprovalStageCard = ({ label, approval }) => {
  const statusText = approval?.status || "Pending";
  const statusClass = statusText.toLowerCase() === "approved"
    ? "bg-[#0e5149]/55 text-[#20D18C]"
    : statusText.toLowerCase() === "rejected"
      ? "bg-red-900/40 text-[#FF4F91]"
      : "bg-[#5D1438]/50 text-[#FF4F91]";

  return (
    <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">{label}</h3>
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${statusClass}`}>{statusText}</span>
      </div>
      <div className="space-y-2 text-sm">
        {approval?.approvedBy && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#CBC3D7]/65">Approved By</span>
            <span className="font-medium text-white">{approval.approvedBy}</span>
          </div>
        )}
        {(approval?.approvedAt || approval?.updatedAt) && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#CBC3D7]/65">Updated At</span>
            <span className="font-medium text-white">{formatDate(approval?.approvedAt || approval?.updatedAt)}</span>
          </div>
        )}
        {approval?.reason && (
          <p className="rounded-md bg-[#232A3B] p-2.5 text-xs leading-5 text-[#CBC3D7]/80">{approval.reason}</p>
        )}
      </div>
    </div>
  );
};

const ApprovalFlowSection = ({ approvalSource, currentStatus, approvalHistory }) => {
  const overviewEntries = useMemo(() => [
    { label: "Overall Status", value: currentStatus },
    { label: "Workflow Stage", value: approvalSource?.workflowStage || approvalSource?.currentWorkflowStage || "-" },
    { label: "Final Status", value: approvalSource?.finalStatus || "-" },
    { label: "Media Head Approval", value: approvalSource?.headApproval?.status || "Pending" },
  ], [approvalSource, currentStatus]);

  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B3DFF]/15">
          <Shield size={18} className="text-[#8B3DFF]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Approval Flow</h3>
          <p className="mt-0.5 text-xs text-[#CBC3D7]/50">Read-only approval progress for this individual media request</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overviewEntries.map((item) => (
          <InfoGridItem key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-[#374155]/60 bg-[#151d31] p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ApprovalStageCard label="Admin Approval" approval={approvalSource?.adminApproval} />
          <ApprovalStageCard label="HOD Approval" approval={approvalSource?.hodApproval} />
          <ApprovalStageCard label="Department Approval" approval={approvalSource?.departmentApproval} />
          <ApprovalStageCard label="Super Admin Approval" approval={approvalSource?.superAdminApproval} />
          <ApprovalStageCard label="Media Head Approval" approval={approvalSource?.headApproval} />
        </div>
      </div>
      {Array.isArray(approvalHistory) && approvalHistory.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B3DFF]/15">
              <Clock size={18} className="text-[#8B3DFF]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Approval History</h3>
              <p className="mt-0.5 text-xs text-[#CBC3D7]/50">Timeline of actions taken for this request</p>
            </div>
          </div>
          <div className="relative ml-4 border-l-2 border-[#374155]/50 pl-6">
            {approvalHistory.map((entry, index) => {
              const action = entry?.action || entry?.status || "Action";
              const isApproved = String(action).toLowerCase() === "approved";
              const isRejected = String(action).toLowerCase() === "rejected";
              const isPending = String(action).toLowerCase() === "pending";
              return (
                <div key={entry?._id || index} className="relative pb-6 last:pb-0">
                  <div className={`absolute -left-7.75 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b1326] ${isApproved ? "bg-[#20D18C]/20" : isPending ? "bg-[#FF4F91]/20" : isRejected ? "bg-red-500/20" : "bg-[#8B3DFF]/20"}`}>
                    {isApproved ? <CheckCircle2 size={12} className="text-[#20D18C]" /> : isRejected ? <XCircle size={12} className="text-red-500" /> : <Clock size={12} className={isPending ? "text-[#FF4F91]" : "text-[#8B3DFF]"} />}
                  </div>
                  <div className="rounded-lg border border-[#374155]/50 bg-[#242B3D] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white">{action}</p>
                      {(entry?.actionDate || entry?.updatedAt) && <span className="text-[11px] text-[#CBC3D7]/50">{formatDate(entry?.actionDate || entry?.updatedAt)}</span>}
                    </div>
                    {entry?.role && <span className="mt-2 inline-block rounded-full bg-[#8B3DFF]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#8B3DFF]">{entry.role}</span>}
                    {entry?.remarks && <p className="mt-2.5 rounded-md bg-[#1B2334] p-2.5 text-xs leading-5 text-[#CBC3D7]/75">{entry.remarks}</p>}
                    {entry?.reason && entry.reason !== entry.remarks && (
                      <p className="mt-2 rounded-md bg-[#1B2334] p-2.5 text-xs leading-5 text-[#CBC3D7]/75"><span className="font-medium text-[#CBC3D7]/50">Reason: </span>{entry.reason}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const FORM_TYPE_CONFIG = {
  purchase: {
    component: FacultyPurchaseDetailsPanel,
    props: (data) => ({
      purchaseDetails: { purchases: data?.purchases || [data] },
      eventSchedule: [],
    }),
  },
  transport: {
    component: FacultyTransportationDetailsPanel,
    props: (data) => ({
      transportDetails: { transports: [data] },
      eventSchedule: [],
    }),
  },
  food: {
    component: FacultyFoodRefreshmentDetailsPanel,
    props: (data) => ({
      refreshmentDetails: { refreshments: [data] },
      eventSchedule: [],
    }),
  },
  media: {
    component: FacultyMediaDetailsPanel,
    props: (data) => ({
      mediaDetails: { mediaRequirements: data?.mediaRequirements || [data] },
    }),
  },
};

const resolveFormType = (formType) => {
  if (!formType) return null;
  const key = formType.toLowerCase().replace(/[^a-z]/g, "");
  if (key.includes("purchase")) return "purchase";
  if (key.includes("transport")) return "transport";
  if (key.includes("food") || key.includes("refreshment")) return "food";
  if (key.includes("media")) return "media";
  return null;
};

const ModuleIndividualDetailViewPage = ({
  basePath,
  breadcrumbLabel = "Dashboard",
  title = "Individual Request Details",
}) => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role || "");
      }
    } catch {
      setUserRole("");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchSubmission = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/individual-submissions/getrequest/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        if (!res.ok) throw new Error("Failed to fetch submission");
        const response = await res.json();
        if (!response.success)
          throw new Error(response.message || "Failed to fetch submission");
        if (isMounted) {
          const submissionData = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setSubmission(submissionData);
        }
      } catch (err) {
        console.error("Failed to fetch individual submission:", err);
        if (isMounted)
          setError(err.message || "Failed to load submission details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSubmission();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const formTypeKey = resolveFormType(submission?.formType);
  const config = FORM_TYPE_CONFIG[formTypeKey];
  const DetailComponent = config?.component;
  const detailProps = config?.props?.(submission?.data) || {};
  const status = submission?.status || submission?.data?.overallStatus || "-";
  const isMediaSubmission =
    /media/i.test(submission?.formType || "") ||
    Array.isArray(submission?.data?.typeOfMedia) ||
    /media/i.test(String(submission?.data?.typeOfMedia || ""));
  const approvalSource = submission?.data || submission || {};
  const approvalHistory = submission?.approvalHistory || approvalSource?.approvalHistory || [];
  const currentStatus =
    submission?.finalStatus ||
    approvalSource?.finalStatus ||
    submission?.status ||
    approvalSource?.status ||
    "Pending";

  async function handleCloseSubmission() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/individual-submissions/${id}/close`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ action: "closed" }),
        },
      );
      if (!res.ok) throw new Error("Failed to close submission");
      await res.json();
      if (submission?.data) {
        setSubmission((prev) => ({
          ...prev,
          data: {
            ...prev?.data,
            finalStatus: "Closed",
          },
        }));
      }
    } catch (err) {
      console.error("Failed to close individual submission:", err);
    }
  }

  const safeHeadStatus = String(
    submission?.data?.headApproval?.status ??
    submission?.headApproval?.status ??
    ""
  ).trim().toLowerCase();

  const finalStatus = submission?.data?.finalStatus?.toLowerCase();
  const showCloseButton =
    userRole.toLowerCase() === "faculty" &&
    safeHeadStatus !== "pending" &&
    finalStatus !== "closed";

  const isHead = userRole.toLowerCase() === "head";
  const showHeadControls = isHead && isMediaSubmission;

  const handleHeadAction = async (action) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/individual-submissions/${id}/head-approval`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ action }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || `Failed to ${action}`);
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)}ed successfully`);
      // Update local state with API response, or fall back to optimistic update
      if (data.data) {
        setSubmission(data.data);
      } else {
        setSubmission((prev) => {
          const newStatus = action === "acknowledge" ? "Acknowledged" : "Completed";
          return {
            ...prev,
            headApproval: {
              ...prev?.headApproval,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            },
            data: {
              ...prev?.data,
              headApproval: {
                ...prev?.data?.headApproval,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      }
    } catch (err) {
      toast.error(err.message || `Failed to ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <main className="px-6 pb-8">
        <div className="flex items-center justify-between gap-2 py-3 text-sm text-[#CBC3D7]/50">
          <div className="flex items-center gap-2">
            <Link to={basePath} className="hover:text-white transition-colors">
              {breadcrumbLabel}
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#D0BCFF]">{title}</span>
            {submission?.formType && (
              <span className="ml-1 rounded-full bg-[#8B3DFF]/15 px-3 py-0.5 text-[11px] font-semibold text-[#8B3DFF]">
                {submission.formType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showHeadControls && safeHeadStatus === "completed" && (
              <button
                disabled
                className="bg-emerald-800 flex items-center gap-2 text-white px-4 py-2 text-sm rounded-lg opacity-60 cursor-not-allowed"
              >
                <Check size={16} className="text-white" />
                Completed
              </button>
            )}
            {showHeadControls && safeHeadStatus === "pending" && (
              <button
                onClick={() => handleHeadAction("acknowledge")}
                disabled={actionLoading}
                className="bg-emerald-800 text-white px-4 py-2 text-sm rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Acknowledge{actionLoading ? "..." : ""}
              </button>
            )}
            {showHeadControls && safeHeadStatus === "acknowledged" && (
              <button
                onClick={() => handleHeadAction("complete")}
                disabled={actionLoading}
                className="bg-emerald-800 text-white px-4 py-2 text-sm rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete{actionLoading ? "..." : ""}
              </button>
            )}
            {showCloseButton && (
              <button
                onClick={handleCloseSubmission}
                className="bg-emerald-800 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Close Submission
              </button>
            )}
          </div>
        </div>

        <section className="mt-2 rounded-lg border border-[#27334c] bg-[#151d31] p-6">
          {loading ? (
            <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
              Loading submission details...
            </p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-[#FF4F91]">{error}</p>
          ) : !submission ? (
            <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
              Submission not found.
            </p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-[#8B3DFF]">
                    {submission.formType
                      ? `${submission.formType} Details`
                      : "Request Details"}
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-[#CBC3D7]/55">
                    View the full details of this individual submission request.
                  </p>
                </div>
                {status && (
                  <span
                    className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium ${getStatusClassName(status)}`}
                  >
                    {status}
                  </span>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <InfoGridItem label="Request ID" value={submission.id} />
                <InfoGridItem
                  label="Employee"
                  value={
                    submission.data?.employee?.name ||
                    submission.employee ||
                    "-"
                  }
                />
                <InfoGridItem
                  label="Email"
                  value={
                    submission.data?.employee?.email ||
                    submission.employeeEmail ||
                    "-"
                  }
                />
                <InfoGridItem
                  label="Department"
                  value={submission.data?.employee?.department || "-"}
                />
                <InfoGridItem label="Form Type" value={submission.formType} />
                <InfoGridItem
                  label="Workflow Stage"
                  value={submission.workflowStage || "-"}
                />
                <InfoGridItem
                  label="Submitted"
                  value={formatDate(submission.createdAt)}
                />
                <InfoGridItem
                  label="Last Updated"
                  value={formatDate(submission.updatedAt)}
                />
                {submission.data?.finalStatus && (
                  <InfoGridItem
                    label="Final Status"
                    value={submission.data.finalStatus}
                  />
                )}
                {submission.data?.overallStatus && (
                  <InfoGridItem
                    label="Overall Status"
                    value={submission.data.overallStatus}
                  />
                )}
                {submission.data?._id && (
                  <InfoGridItem label="Data ID" value={submission.data._id} />
                )}
              </div>

              {submission.data?.employee && (
                <div className="mt-5 rounded-lg border border-[#374155] bg-[#1B2334] p-4">
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                    Employee Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InfoGridItem
                      label="Employee ID"
                      value={submission.data.employee._id || "-"}
                    />
                    <InfoGridItem
                      label="Name"
                      value={submission.data.employee.name || "-"}
                    />
                    <InfoGridItem
                      label="Email"
                      value={submission.data.employee.email || "-"}
                    />
                    <InfoGridItem
                      label="Phone"
                      value={submission.data.employee.phone || "-"}
                    />
                    <InfoGridItem
                      label="Department"
                      value={submission.data.employee.department || "-"}
                    />
                    <InfoGridItem
                      label="Designation"
                      value={submission.data.employee.designation || "-"}
                    />
                    <InfoGridItem
                      label="Employee ID (Emp Code)"
                      value={submission.data.employee.empId || "-"}
                    />
                    <InfoGridItem
                      label="Category"
                      value={submission.data.employee.employeeCategory || "-"}
                    />
                    <InfoGridItem
                      label="Location"
                      value={submission.data.employee.location || "-"}
                    />
                  </div>
                </div>
              )}

              {isMediaSubmission && (
                <ApprovalFlowSection
                  approvalSource={approvalSource}
                  currentStatus={currentStatus}
                  approvalHistory={approvalHistory}
                />
              )}

              {submission.data?.financeRequired === "Yes" && (
                <div className="mt-5 rounded-lg border border-[#374155] bg-[#1B2334] p-4">
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                    Finance Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InfoGridItem
                      label="Finance Required"
                      value={submission.data.financeRequired}
                    />
                    <InfoGridItem
                      label="Advance Amount"
                      value={
                        submission.data.advanceAmount
                          ? `₹${submission.data.advanceAmount}`
                          : "-"
                      }
                    />
                    <InfoGridItem
                      label="Advance Purpose"
                      value={submission.data.advancePurpose || "-"}
                    />
                  </div>
                </div>
              )}

              {/* Principal Approval Form / Uploaded File */}
              {(submission.data?.principalApprovalForm?.url ||
                submission.data?.uploadedFile?.url) && (
                <div className="mt-4 flex flex-wrap items-start gap-3">
                  <div className="flex flex-col gap-2">
                    <a
                      href={
                        submission.data.principalApprovalForm?.url ||
                        submission.data.uploadedFile?.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#374155] bg-[#1B2334] px-4 py-3 text-sm text-[#CBC3D7]/80 hover:text-white hover:border-[#8B3DFF]/50 transition-colors"
                    >
                      <FileText size={16} className="text-[#8B3DFF]" />
                      <span>View Uploaded Document</span>
                    </a>
                    {submission.data.principalApprovalForm?.publicId && (
                      <span className="text-[10px] text-[#CBC3D7]/50">
                        Public ID: {submission.data.principalApprovalForm.publicId}
                      </span>
                    )}
                    {submission.data.uploadedFile?.publicId && (
                      <span className="text-[10px] text-[#CBC3D7]/50">
                        Public ID: {submission.data.uploadedFile.publicId}
                      </span>
                    )}
                    {submission.data.uploadedFile?.fileName && (
                      <span className="text-[10px] text-[#CBC3D7]/50">
                        File Name: {submission.data.uploadedFile.fileName}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Approval Stages */}
              {!isMediaSubmission && (() => {
                const APPROVAL_STAGES = [
                  { key: "adminApproval", label: "Admin Approval" },
                  { key: "hodApproval", label: "HOD Approval" },
                  { key: "departmentApproval", label: "Department Approval" },
                  { key: "superAdminApproval", label: "Super Admin Approval" },
                  { key: "headApproval", label: "Head Approval" },
                ];
                const data = submission.data;
                const availableStages = APPROVAL_STAGES.filter(
                  (s) => data?.[s.key],
                );
                const hasMultiStatus =
                  data?.status && typeof data.status === "object";

                if (availableStages.length === 0 && !hasMultiStatus)
                  return null;

                return (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {availableStages.map((stage) => {
                      const approval = data[stage.key];
                      const statusText = approval?.status || "-";
                      const isApproved =
                        String(statusText).toLowerCase() === "approved";
                      const isPending =
                        String(statusText).toLowerCase() === "pending";
                      const statusColor = isApproved
                        ? "text-[#20D18C]"
                        : isPending
                          ? "text-[#FF4F91]"
                          : "text-white";
                      return (
                        <div
                          key={stage.key}
                          className="rounded-lg border border-[#374155] bg-[#1B2334] p-4"
                        >
                          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                            {stage.label}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#CBC3D7]/65">Status</span>
                              <span className={`font-medium ${statusColor}`}>
                                {statusText}
                              </span>
                            </div>
                            {approval?.approvedBy && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[#CBC3D7]/65">
                                  Approved By
                                </span>
                                <span className="font-medium text-white">
                                  {approval.approvedBy}
                                </span>
                              </div>
                            )}
                            {approval?.approvedAt && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[#CBC3D7]/65">
                                  Approved At
                                </span>
                                <span className="font-medium text-white">
                                  {formatDate(approval.approvedAt)}
                                </span>
                              </div>
                            )}
                            {approval?.updatedAt && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[#CBC3D7]/65">
                                  Updated At
                                </span>
                                <span className="font-medium text-white">
                                  {formatDate(approval.updatedAt)}
                                </span>
                              </div>
                            )}
                            {approval?.reason && (
                              <p className="mt-2 rounded-md bg-[#232A3B] p-2.5 text-xs leading-5 text-[#CBC3D7]/80">
                                {approval.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {hasMultiStatus && (
                      <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
                        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                          Module Status
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(data.status).map(([dept, st]) => (
                            <div
                              key={dept}
                              className="flex items-center justify-between border-b border-[#30384d]/40 py-2 text-sm last:border-b-0"
                            >
                              <span className="text-[#CBC3D7]/65 capitalize">
                                {dept}
                              </span>
                              <span
                                className={`font-medium ${String(st).toLowerCase() === "approved" ? "text-[#34D399]" : String(st).toLowerCase() === "pending" ? "text-[#FF4F91]" : "text-white"}`}
                              >
                                {String(st)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="mt-8">
                {DetailComponent ? (
                  <DetailComponent {...detailProps} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-[#374155] bg-[#1B2334]">
                    <FileText size={40} className="mb-3 text-[#CBC3D7]/30" />
                    <p className="text-sm font-medium text-[#CBC3D7]/50">
                      No detail view available for "{submission.formType}"
                    </p>
                  </div>
                )}
              </div>

              {/* Only show bottom approval history for non-media, since media has it inside ApprovalFlowSection */}
              {!isMediaSubmission && submission.data?.approvalHistory?.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-4 text-sm font-semibold text-[#CBC3D7]/65 uppercase tracking-wider">
                    Approval History
                  </h3>
                  <div className="space-y-3">
                    {submission.data.approvalHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 rounded-lg border border-[#374155] bg-[#1B2334] p-4"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B3DFF]/20">
                          <span className="text-xs font-bold text-[#8B3DFF]">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">
                              {entry.action || entry.status || "Action"}
                            </p>
                            {entry.actionDate && (
                              <span className="text-xs text-[#CBC3D7]/50">
                                {formatDate(entry.actionDate)}
                              </span>
                            )}
                          </div>
                          {entry.role && (
                            <span className="mt-2 inline-block rounded-full bg-[#8B3DFF]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#8B3DFF]">
                              {entry.role}
                            </span>
                          )}
                          {entry.remarks && (
                            <p className="mt-2 rounded-md bg-[#232A3B] p-2.5 text-xs leading-5 text-[#CBC3D7]/80">
                              {entry.remarks}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </section>
  );
};

export default ModuleIndividualDetailViewPage;
