import React, { useEffect, useState, useMemo, memo } from "react";
import { useParams, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  ChevronRight,
  FileText,
  Download,
  User,
  Briefcase,
  Building2,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Check,
  Upload,
  Eye,
} from "lucide-react";
import DashboardHeader from "../ICTC-Dashboard/DashboardHeader";
import FacultyPurchaseDetailsPanel from "../Faculty-Dashboard/FacultyPurchaseDetailsPanel";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "")
    return "Not Available";
  return Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Not Available";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "Not Available";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const safeText = (value, fallback = "Not Available") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const getStatusBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "completed")
    return "bg-[#0e5149]/55 text-[#20D18C]";
  if (s === "pending") return "bg-[#5D1438]/50 text-[#FF4F91]";
  if (s === "rejected") return "bg-red-900/40 text-[#FF4F91]";
  if (s === "acknowledged")
    return "bg-gradient-to-r from-emerald-700 to-emerald-900 text-white/80";
  if (s === "admin canceled") return "bg-yellow-700 text-[#FF4F91]";
  return "bg-[#0e5149]/55 text-[#20D18C]";
};

const getStatusDotColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "completed") return "bg-[#20D18C]";
  if (s === "pending") return "bg-[#FF4F91]";
  if (s === "rejected") return "bg-red-500";
  return "bg-gray-500";
};

const SkeletonPulse = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-[#242B3D] ${className}`} />
);

const SectionHeader = memo(({ icon: Icon, title, subtitle, count }) => (
  <div className="mb-5 flex items-center gap-3">
    {Icon && (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B3DFF]/15">
        <Icon size={18} className="text-[#8B3DFF]" />
      </div>
    )}
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {count !== undefined && count !== null && (
          <span className="rounded-full bg-[#8B3DFF]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#8B3DFF]">
            {count}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-0.5 text-xs text-[#CBC3D7]/50">{subtitle}</p>
      )}
    </div>
  </div>
));

const InfoItem = memo(({ label, value, span = 1 }) => (
  <div
    className="flex flex-col gap-1 rounded-lg border border-[#374155]/60 bg-[#1B2334] px-4 py-3"
    style={span > 1 ? { gridColumn: `span ${span}` } : undefined}
  >
    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
      {label}
    </span>
    <span className="text-sm font-medium text-white break-words">
      {safeText(value)}
    </span>
  </div>
));

const SkeletonLoader = () => (
  <div className="space-y-6">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <SkeletonPulse className="h-6 w-64" />
        <SkeletonPulse className="h-4 w-96" />
      </div>
      <SkeletonPulse className="h-9 w-24 rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonPulse key={i} className="h-16 rounded-lg" />
      ))}
    </div>
    <SkeletonPulse className="h-48 rounded-lg" />
    <SkeletonPulse className="h-48 rounded-lg" />
    <SkeletonPulse className="h-64 rounded-lg" />
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF4F91]/10">
      <AlertCircle size={28} className="text-[#FF4F91]" />
    </div>
    <p className="mt-4 text-sm font-medium text-[#FF4F91]">{message}</p>
    <Link
      to="/dashboard-purchase"
      className="mt-4 rounded-lg bg-[#8B3DFF]/20 px-4 py-2 text-sm font-medium text-[#8B3DFF] transition hover:bg-[#8B3DFF]/30"
    >
      Back to Dashboard
    </Link>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#374155]/30">
      <Package size={28} className="text-[#CBC3D7]/30" />
    </div>
    <p className="mt-4 text-sm font-medium text-[#CBC3D7]/70">
      No Purchase Request Found
    </p>
    <p className="mt-1 text-xs text-[#CBC3D7]/40">
      The requested purchase submission does not exist or has been removed.
    </p>
    <Link
      to="/dashboard-purchase"
      className="mt-4 rounded-lg bg-[#8B3DFF]/20 px-4 py-2 text-sm font-medium text-[#8B3DFF] transition hover:bg-[#8B3DFF]/30"
    >
      Back to Dashboard
    </Link>
  </div>
);

const RequestInfoGrid = memo(({ submission, data }) => (
  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
    {/* <InfoItem label="Request ID" value={submission.id} /> */}
    <InfoItem label="Form Type" value={submission.formType} />
    <InfoItem label="Current Status" value={submission.status} />
    {/* <InfoItem
      label="Workflow Stage"
      value={submission.workflowStage || data.workflowStage}
    /> */}
    <InfoItem label="Created Date" value={formatDate(submission.createdAt)} />
    <InfoItem label="Updated Date" value={formatDate(submission.updatedAt)} />
    <InfoItem label="Final Status" value={data.finalStatus} />
    <InfoItem label="Overall Status" value={data.overallStatus} />
    {/* <InfoItem label="Mongo ID" value={data._id} /> */}
    {/* <InfoItem
      label="Version"
      value={data.__v !== undefined ? `v${data.__v}` : undefined}
    /> */}
  </div>
));

const EmployeeDetailsSection = memo(({ employee }) => {
  if (!employee?.name) return null;
  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader
        icon={User}
        title="Employee Details"
        subtitle="Information about the requesting employee"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoItem label="Employee Name" value={employee.name} />
        <InfoItem label="Employee ID" value={employee._id} />
        <InfoItem label="Employee Number" value={employee.empId} />
        <InfoItem label="Email" value={employee.email} />
        <InfoItem label="Phone" value={employee.phone} />
        <InfoItem label="Department" value={employee.department} />
        <InfoItem label="Designation" value={employee.designation} />
        <InfoItem label="Employee Category" value={employee.employeeCategory} />
        <InfoItem label="Gender" value={employee.gender} />
        <InfoItem label="Date of Birth" value={formatDate(employee.dob)} />
        <InfoItem label="Date of Joining" value={formatDate(employee.doj)} />
        <InfoItem
          label="Employment Status"
          value={employee.employmentStatus ? "Active" : "Inactive"}
        />
        <InfoItem label="Location" value={employee.location} />
        <InfoItem label="Created Date" value={formatDate(employee.createdAt)} />
        <InfoItem label="Updated Date" value={formatDate(employee.updatedAt)} />
      </div>
    </div>
  );
});

const FinanceDetailsSection = memo(({ data }) => {
  if (!data.financeRequired && !data.advanceAmount && !data.advancePurpose)
    return null;
  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader
        icon={Briefcase}
        title="Finance Details"
        subtitle="Advance and financial information"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoItem label="Finance Required" value={data.financeRequired} />
        <InfoItem
          label="Advance Amount"
          value={formatCurrency(data.advanceAmount)}
        />
        <InfoItem label="Advance Purpose" value={data.advancePurpose} />
      </div>
    </div>
  );
});

const ApprovalStageCard = memo(({ label, approval }) => {
  const statusText = approval?.status || "Not Available";
  const statusClass = getStatusBadgeClass(statusText);

  return (
    <div className="rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
          {label}
        </h4>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-semibold ${statusClass}`}
        >
          {statusText}
        </span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#CBC3D7]/55">Status</span>
          <span
            className={`font-medium ${getStatusDotColor(statusText) === "bg-[#20D18C]" ? "text-[#20D18C]" : getStatusDotColor(statusText) === "bg-[#FF4F91]" ? "text-[#FF4F91]" : "text-white"}`}
          >
            {statusText}
          </span>
        </div>
        {approval?.approvedBy && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#CBC3D7]/55">Approved By</span>
            <span className="font-medium text-white">
              {approval.approvedBy}
            </span>
          </div>
        )}
        {approval?.approvedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#CBC3D7]/55">Approved At</span>
            <span className="font-medium text-white">
              {formatDateTime(approval.approvedAt)}
            </span>
          </div>
        )}
        {approval?.updatedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#CBC3D7]/55">Updated At</span>
            <span className="font-medium text-white">
              {formatDateTime(approval.updatedAt)}
            </span>
          </div>
        )}
        {approval?.reason && (
          <div className="mt-1 rounded-lg bg-[#232A3B] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/40">
              Reason
            </p>
            <p className="mt-1 text-xs leading-5 text-[#CBC3D7]/80">
              {approval.reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

const ApprovalStagesSection = memo(({ data }) => {
  const approvalKeys = useMemo(() => {
    if (!data || typeof data !== "object") return [];
    return Object.keys(data).filter(
      (key) => key.endsWith("Approval") || key.endsWith("approval"),
    );
  }, [data]);

  if (approvalKeys.length === 0) return null;

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/approval$/i, "Approval")
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  };

  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader
        icon={Shield}
        title="Approval Stages"
        subtitle="Status of each approval level"
        count={approvalKeys.length}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {approvalKeys.map((key) => (
          <ApprovalStageCard
            key={key}
            label={formatLabel(key)}
            approval={data[key]}
          />
        ))}
      </div>
    </div>
  );
});

const DepartmentStatusSection = memo(({ statuses }) => {
  if (!statuses || typeof statuses !== "object") return null;
  const entries = Object.entries(statuses);
  if (entries.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader
        icon={Building2}
        title="Department Status"
        subtitle="Status across each department"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([dept, st]) => {
          const s = String(st || "");
          const isApproved = s.toLowerCase() === "approved";
          const isPending = s.toLowerCase() === "pending";
          const isRejected = s.toLowerCase() === "rejected";
          return (
            <div
              key={dept}
              className="flex items-center justify-between rounded-lg border border-[#374155]/50 bg-[#242B3D] px-4 py-3"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${getStatusDotColor(st)}`}
                />
                <span className="text-sm font-medium text-[#CBC3D7]/80 capitalize">
                  {dept}
                </span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                  isApproved
                    ? "bg-[#0e5149]/55 text-[#20D18C]"
                    : isPending
                      ? "bg-[#5D1438]/50 text-[#FF4F91]"
                      : isRejected
                        ? "bg-red-900/40 text-[#FF4F91]"
                        : "bg-[#374155]/50 text-white/70"
                }`}
              >
                {s || "N/A"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const UploadedFilesSection = memo(({ data }) => {
  const files = useMemo(() => {
    const result = [];
    if (data?.principalApprovalForm?.url) {
      result.push({
        label: "Principal Approval Form",
        url: data.principalApprovalForm.url,
        publicId: data.principalApprovalForm.publicId,
        fileName: data.principalApprovalForm.fileName,
      });
    }
    if (data?.uploadedFile?.url) {
      result.push({
        label: data.uploadedFile.fileName || "Uploaded Document",
        url: data.uploadedFile.url,
        publicId: data.uploadedFile.publicId,
        fileName: data.uploadedFile.fileName,
      });
    }
    if (Array.isArray(data?.referenceFiles)) {
      data.referenceFiles.forEach((file, index) => {
        const url = typeof file === "string" ? file : file?.url;
        if (url) {
          result.push({
            label: file?.fileName || `Reference File ${index + 1}`,
            url,
            publicId: file?.publicId,
            fileName: file?.fileName,
          });
        }
      });
    }
    return result;
  }, [data]);

  if (files.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader
        icon={Upload}
        title="Uploaded Files"
        subtitle="Documents and reference files"
        count={files.length}
      />
      <div className="space-y-3">
        {files.map((file, index) => (
          <div
            key={file.publicId || index}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#374155]/50 bg-[#242B3D] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B3DFF]/15">
                <FileText size={16} className="text-[#8B3DFF]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{file.label}</p>
                {file.publicId && (
                  <p className="mt-0.5 text-[10px] text-[#CBC3D7]/40">
                    Public ID: {file.publicId}
                  </p>
                )}
                {file.fileName && file.fileName !== file.label && (
                  <p className="mt-0.5 text-[10px] text-[#CBC3D7]/40">
                    File: {file.fileName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#374155] bg-[#1B2334] px-3 py-2 text-xs font-medium text-[#CBC3D7]/80 transition hover:border-[#8B3DFF]/50 hover:text-white"
              >
                <Eye size={13} />
                View
              </a>
              <a
                href={file.url}
                download
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B3DFF]/20 px-3 py-2 text-xs font-medium text-[#8B3DFF] transition hover:bg-[#8B3DFF]/30"
              >
                <Download size={13} />
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const ApprovalHistoryTimeline = memo(({ history }) => {
  if (!Array.isArray(history) || history.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader
        icon={Clock}
        title="Approval History"
        subtitle="Timeline of all approval actions"
        count={history.length}
      />
      <div className="relative ml-4 border-l-2 border-[#374155]/50 pl-6">
        {history.map((entry, index) => {
          const action = entry.action || entry.status || "Action";
          const isApproved = String(action).toLowerCase() === "approved";
          const isPending = String(action).toLowerCase() === "pending";
          const isRejected = String(action).toLowerCase() === "rejected";

          return (
            <div key={entry._id || index} className="relative pb-6 last:pb-0">
              <div
                className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b1326] ${
                  isApproved
                    ? "bg-[#20D18C]/20"
                    : isPending
                      ? "bg-[#FF4F91]/20"
                      : isRejected
                        ? "bg-red-500/20"
                        : "bg-[#8B3DFF]/20"
                }`}
              >
                {isApproved ? (
                  <CheckCircle2 size={12} className="text-[#20D18C]" />
                ) : isRejected ? (
                  <XCircle size={12} className="text-red-500" />
                ) : (
                  <Clock
                    size={12}
                    className={isPending ? "text-[#FF4F91]" : "text-[#8B3DFF]"}
                  />
                )}
              </div>
              <div className="rounded-lg border border-[#374155]/50 bg-[#242B3D] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{action}</p>
                    {entry.status && entry.status !== entry.action && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(entry.status)}`}
                      >
                        {entry.status}
                      </span>
                    )}
                  </div>
                  {(entry.actionDate || entry.updatedAt) && (
                    <span className="text-[11px] text-[#CBC3D7]/50">
                      {formatDateTime(entry.actionDate || entry.updatedAt)}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {entry.role && (
                    <span className="inline-block rounded-full bg-[#8B3DFF]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#8B3DFF]">
                      {entry.role}
                    </span>
                  )}
                  {(entry.approvedBy || entry.performedBy) && (
                    <span className="inline-block rounded-full bg-[#242B3D] border border-[#374155]/50 px-2.5 py-0.5 text-[10px] font-medium text-[#CBC3D7]/60">
                      By: {entry.approvedBy || entry.performedBy}
                    </span>
                  )}
                </div>
                {entry.remarks && (
                  <p className="mt-2.5 rounded-md bg-[#1B2334] p-2.5 text-xs leading-5 text-[#CBC3D7]/75">
                    {entry.remarks}
                  </p>
                )}
                {entry.reason && entry.reason !== entry.remarks && (
                  <p className="mt-2 rounded-md bg-[#1B2334] p-2.5 text-xs leading-5 text-[#CBC3D7]/75">
                    <span className="font-medium text-[#CBC3D7]/50">
                      Reason:{" "}
                    </span>
                    {entry.reason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const PurchaseIndividualDetailViewPage = () => {
    const [actionLoading, setActionLoading] = useState(false);
  
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

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
        if (!res.ok) throw new Error("Failed to fetch purchase submission");
        const response = await res.json();
        if (!response.success)
          throw new Error(
            response.message || "Failed to fetch purchase submission",
          );
        if (isMounted) {
          const purchase = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setSubmission(purchase || null);
        }
      } catch (err) {
        if (isMounted)
          setError(err.message || "Failed to load purchase details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSubmission();
    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  const innerData = submission?.data || {};
  const employee = innerData.employee || {};
  const purchases = innerData.purchases || [];
  const topStatus = submission?.status || innerData.overallStatus;

  const [isHead, setIsHead] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const decode = jwtDecode(token);
    if (decode.role == "head") {
      setIsHead(true);
    }
    // console.log("decoded token : ", decode)
  }, []);


   const handleApprove = async () => {
      setActionLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/individual-submissions/${id}/super-admin-approval`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ action: "approve" }),
          },
        );
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Failed to approve");
        toast.success("Approved successfully");
        setSubmission((prev) => ({
          ...prev,
          data: {
            ...prev?.data,
            superAdminApproval: {
              ...prev?.data?.superAdminApproval,
              status: "Approved",
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      } catch (err) {
        toast.error(err.message || "Failed to approve");
      } finally {
        setActionLoading(false);
      }
    };
  
    // head acknowlwdge
    const handleAcknowledge = async () => {
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
            body: JSON.stringify({ action: "acknowledge" }),
          },
        );
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Failed to acknowledge");
        toast.success("Acknowledge successfully");
        setReloadKey((k) => k + 1);
      } catch (err) {
        toast.error(err.message || "Failed to acknowledge");
      } finally {
        setActionLoading(false);
      }
    };
  
    // head complete
    const handleHeadComplete = async () => {
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
            body: JSON.stringify({ action: "complete" }),
          },
        );
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Failed to complete");
        toast.success("Completed successfully");
        setReloadKey((k) => k + 1);
      } catch (err) {
        toast.error(err.message || "Failed to complete");
      } finally {
        setActionLoading(false);
      }
    };
  
    const handleReject = async () => {
      if (!rejectReason.trim()) return toast.error("Please enter a reason");
      setActionLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/individual-submissions/${id}/super-admin-approval`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              action: "reject",
              reason: rejectReason.trim(),
            }),
          },
        );
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Failed to reject");
        toast.success("Rejected successfully");
        setSubmission((prev) => ({
          ...prev,
          data: {
            ...prev?.data,
            superAdminApproval: {
              ...prev?.data?.superAdminApproval,
              status: "Rejected",
              reason: rejectReason.trim(),
              updatedAt: new Date().toISOString(),
            },
          },
        }));
        setShowRejectModal(false);
        setRejectReason("");
      } catch (err) {
        toast.error(err.message || "Failed to reject");
      } finally {
        setActionLoading(false);
      }
    };
  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <DashboardHeader basePath="/dashboard-purchase" />
      <main className="px-4 pb-8 sm:px-6">
        <div className="flex items-center justify-between gap-2 py-3 text-sm text-[#CBC3D7]/50">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard-purchase"
              className="hover:text-white transition-colors"
            >
              Purchase Dashboard
            </Link>
            <ChevronRight size={14} />
            <Link
              to="/dashboard-purchase/events"
              className="hover:text-white transition-colors"
            >
              Requests
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#D0BCFF]">Purchase Request Details</span>
            {employee.name && (
              <>
                <ChevronRight size={14} />
                <span className="text-[#D0BCFF]">{employee.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isHead &&
              submission?.data?.headApproval?.status.toLowerCase() ==
                "completed" && (
                <button className="bg-emerald-800 flex items-center gap-2 text-white px-4 py-2 text-sm rounded-lg">
                  <span>
                    <Check size={16} className="text-white" />
                  </span>{" "}
                  Completed
                </button>
              )}
            {isHead &&
              submission?.data?.headApproval?.status.toLowerCase() ==
                "pending" && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAcknowledge}
                    className="bg-emerald-800 text-white px-4 py-2 text-sm rounded-lg"
                  >
                    Acknowledge <span>{actionLoading && "...."}</span>
                  </button>
                </div>
              )}
            {/* Complete button for Head  */}
            {isHead &&
              submission?.data?.headApproval?.status.toLowerCase() ==
                "acknowledged" && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleHeadComplete}
                    className="bg-emerald-800 text-white px-4 py-2 text-sm rounded-lg"
                  >
                    Complete <span>{actionLoading && "...."}</span>
                  </button>
                </div>
              )}
          </div>
        </div>

        <section className="mt-2 rounded-xl border border-[#27334c] bg-[#151d31] p-5 sm:p-6">
          {loading ? (
            <SkeletonLoader />
          ) : error ? (
            <ErrorState message={error} />
          ) : !submission ? (
            <EmptyState />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-semibold text-[#8B3DFF]">
                    Purchase Request Details
                  </h1>
                  <p className="mt-1.5 text-xs leading-6 text-[#CBC3D7]/50">
                    Complete details of the individual purchase submission.
                  </p>
                </div>
                {topStatus && (
                  <span
                    className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-semibold ${getStatusBadgeClass(topStatus)}`}
                  >
                    {topStatus}
                  </span>
                )}
              </div>

              <RequestInfoGrid submission={submission} data={innerData} />
              <EmployeeDetailsSection employee={employee} />

              <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
                <SectionHeader
                  icon={Package}
                  title="Purchase Details"
                  subtitle="Item requirements and recipients"
                  count={purchases.length}
                />
                <FacultyPurchaseDetailsPanel
                  purchaseDetails={{ purchases }}
                  eventSchedule={[]}
                />
              </div>

              <FinanceDetailsSection data={innerData} />
              <ApprovalStagesSection data={innerData} />
              <DepartmentStatusSection statuses={innerData.status} />
              <UploadedFilesSection data={innerData} />
              <ApprovalHistoryTimeline history={innerData.approvalHistory} />
            </>
          )}
        </section>
      </main>
    </section>
  );
};

export default memo(PurchaseIndividualDetailViewPage);
