import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight, FileText, Download, User, CalendarDays, Clock,
  CheckCircle2, XCircle, AlertCircle, Eye, Shield, Upload, Package, Shuffle,
} from "lucide-react";
import DashboardHeader from "../ICTC-Dashboard/DashboardHeader";
import MediaStaffInterchangeModal from "../../../Components/MediaStaffInterchangeModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5005";

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
};

const safeText = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const getStatusBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "completed") return "bg-[#0e5149]/55 text-[#20D18C]";
  if (s === "pending") return "bg-[#5D1438]/50 text-[#FF4F91]";
  if (s === "rejected") return "bg-red-900/40 text-[#FF4F91]";
  if (s === "acknowledged") return "bg-gradient-to-r from-emerald-700 to-emerald-900 text-white/80";
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

const SectionHeader = memo(({ icon: Icon, title, subtitle, count, action }) => (
  <div className="mb-5 flex items-center gap-3">
    {Icon && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B3DFF]/15"><Icon size={18} className="text-[#8B3DFF]" /></div>}
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {count !== undefined && count !== null && <span className="rounded-full bg-[#8B3DFF]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#8B3DFF]">{count}</span>}
      </div>
      {subtitle && <p className="mt-0.5 text-xs text-[#CBC3D7]/50">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
));

const InfoItem = memo(({ label, value, span = 1 }) => (
  <div className="flex flex-col gap-1 rounded-lg border border-[#374155]/60 bg-[#1B2334] px-4 py-3" style={span > 1 ? { gridColumn: `span ${span}` } : undefined}>
    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">{label}</span>
    <span className="text-sm font-medium text-white break-words">{safeText(value)}</span>
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
      {Array.from({ length: 10 }).map((_, i) => <SkeletonPulse key={i} className="h-16 rounded-lg" />)}
    </div>
    <SkeletonPulse className="h-48 rounded-lg" />
    <SkeletonPulse className="h-48 rounded-lg" />
    <SkeletonPulse className="h-64 rounded-lg" />
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF4F91]/10"><AlertCircle size={28} className="text-[#FF4F91]" /></div>
    <p className="mt-4 text-sm font-medium text-[#FF4F91]">{message}</p>
    <Link to="/dashboard-video" className="mt-4 rounded-lg bg-[#8B3DFF]/20 px-4 py-2 text-sm font-medium text-[#8B3DFF] transition hover:bg-[#8B3DFF]/30">Back to Dashboard</Link>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#374155]/30"><Package size={28} className="text-[#CBC3D7]/30" /></div>
    <p className="mt-4 text-sm font-medium text-[#CBC3D7]/70">No Video Request Found</p>
    <p className="mt-1 text-xs text-[#CBC3D7]/40">The requested video submission does not exist or has been removed.</p>
    <Link to="/dashboard-video" className="mt-4 rounded-lg bg-[#8B3DFF]/20 px-4 py-2 text-sm font-medium text-[#8B3DFF] transition hover:bg-[#8B3DFF]/30">Back to Dashboard</Link>
  </div>
);

const RequestInfoGrid = memo(({ submission, data }) => (
  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
    <InfoItem label="Request No" value={data.requestNo} />
    <InfoItem label="Form Type" value={submission.formType} />
    <InfoItem label="Status" value={submission.status} />
    <InfoItem label="Workflow Stage" value={submission.workflowStage} />
    <InfoItem label="Created Date" value={formatDate(submission.createdAt)} />
    <InfoItem label="Updated Date" value={formatDate(submission.updatedAt)} />
    <InfoItem label="Final Status" value={data.finalStatus || submission.finalStatus} />
    <InfoItem label="Day Index" value={data.dayIndex} />
    <InfoItem label="Media Types" value={Array.isArray(data.typeOfMedia) ? data.typeOfMedia.join(", ") : data.typeOfMedia} />
    <InfoItem label="Finance Required" value={data.financeRequired} />
  </div>
));

const EmployeeDetailsSection = memo(({ employee }) => {
  if (!employee?.name) return null;
  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader icon={User} title="Employee Details" subtitle="Information about the requesting employee" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoItem label="Name" value={employee.name} />
        <InfoItem label="Employee ID" value={employee.empId} />
        <InfoItem label="Email" value={employee.email} />
        <InfoItem label="Phone" value={employee.phone} />
        <InfoItem label="Department" value={employee.department} />
        <InfoItem label="Designation" value={employee.designation} />
        <InfoItem label="Category" value={employee.employeeCategory} />
        <InfoItem label="Location" value={employee.location} />
      </div>
    </div>
  );
});

const VideoContentSection = memo(({ video, onInterchange }) => {
  if (!video) return null;
  const preEvent = Array.isArray(video.preEventVideos) ? video.preEventVideos : [];
  const eventCov = Array.isArray(video.eventCoverage) ? video.eventCoverage : [];
  const postEvent = Array.isArray(video.postEventVideos) ? video.postEventVideos : [];
  const specialVids = Array.isArray(video.specialVideos) ? video.specialVideos : [];
  const refFiles = Array.isArray(video.referenceFiles) ? video.referenceFiles : [];
  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader
        icon={Package}
        title="Video Requirements"
        action={onInterchange && (
          <button
            type="button"
            onClick={onInterchange}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B3DFF]/15 px-3 py-1.5 text-xs font-medium text-[#8B3DFF] transition hover:bg-[#8B3DFF]/25"
          >
            <Shuffle size={14} />
            Interchange Video
          </button>
        )}
      />
      <div className="space-y-4">
        <InfoItem label="Video Content" value={video.videoContent} span={2} />
        {preEvent.length > 0 && <InfoItem label="Pre-Event Videos" value={preEvent.join(", ")} span={2} />}
        {eventCov.length > 0 && <InfoItem label="Event Coverage" value={eventCov.join(", ")} span={2} />}
        {postEvent.length > 0 && <InfoItem label="Post-Event Videos" value={postEvent.join(", ")} span={2} />}
        {specialVids.length > 0 && <InfoItem label="Special Videos" value={specialVids.join(", ")} span={2} />}
        {refFiles.length > 0 && <InfoItem label="Reference Files" value={refFiles.map((f) => f.url || f).join(", ")} span={2} />}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem label="Delivery Date" value={formatDate(video.deliveryDate)} />
          <InfoItem label="Priority" value={video.priority} />
        </div>
        <InfoItem label="Special Requirements" value={video.specialRequirements} span={2} />
      </div>
    </div>
  );
});

const FinanceDetailsSection = memo(({ data }) => {
  if (!data.financeRequired && !data.advanceAmount && !data.advancePurpose) return null;
  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader icon={CalendarDays} title="Finance Details" subtitle="Advance and financial information" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoItem label="Finance Required" value={data.financeRequired} />
        <InfoItem label="Advance Amount" value={data.advanceAmount ? `\u20B9${data.advanceAmount}` : "-"} />
        <InfoItem label="Advance Purpose" value={data.advancePurpose} />
      </div>
    </div>
  );
});

const ApprovalStageCard = memo(({ label, approval }) => {
  const statusText = approval?.status || "-";
  return (
    <div className="rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">{label}</h4>
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${getStatusBadgeClass(statusText)}`}>{statusText}</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#CBC3D7]/55">Status</span>
          <span className={`font-medium ${getStatusDotColor(statusText) === "bg-[#20D18C]" ? "text-[#20D18C]" : "text-[#FF4F91]"}`}>{statusText}</span>
        </div>
        {approval?.approvedBy && <div className="flex items-center justify-between text-sm"><span className="text-[#CBC3D7]/55">Approved By</span><span className="font-medium text-white">{approval.approvedBy}</span></div>}
        {approval?.approvedAt && <div className="flex items-center justify-between text-sm"><span className="text-[#CBC3D7]/55">Approved At</span><span className="font-medium text-white">{formatDateTime(approval.approvedAt)}</span></div>}
        {approval?.updatedAt && <div className="flex items-center justify-between text-sm"><span className="text-[#CBC3D7]/55">Updated At</span><span className="font-medium text-white">{formatDateTime(approval.updatedAt)}</span></div>}
        {approval?.reason && (
          <div className="mt-1 rounded-lg bg-[#232A3B] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/40">Reason</p>
            <p className="mt-1 text-xs leading-5 text-[#CBC3D7]/80">{approval.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
});

const ApprovalStagesSection = memo(({ data }) => {
  const approvalKeys = useMemo(() => {
    if (!data || typeof data !== "object") return [];
    return Object.keys(data).filter((key) => key.endsWith("Approval") || key.endsWith("approval"));
  }, [data]);
  if (approvalKeys.length === 0) return null;
  const formatLabel = (key) => key.replace(/([A-Z])/g, " $1").replace(/approval$/i, "Approval").replace(/^\w/, (c) => c.toUpperCase()).trim();
  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader icon={Shield} title="Approval Stages" subtitle="Status of each approval level" count={approvalKeys.length} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {approvalKeys.map((key) => <ApprovalStageCard key={key} label={formatLabel(key)} approval={data[key]} />)}
      </div>
    </div>
  );
});

const UploadedFilesSection = memo(({ data }) => {
  const files = useMemo(() => {
    const result = [];
    if (data?.principalApprovalForm?.url) result.push({ label: "Principal Approval Form", url: data.principalApprovalForm.url, publicId: data.principalApprovalForm.publicId });
    if (Array.isArray(data?.files)) {
      data.files.forEach((file, index) => {
        const url = typeof file === "string" ? file : file?.url;
        if (url) result.push({ label: file?.fileName || `File ${index + 1}`, url, publicId: file?.publicId });
      });
    }
    return result;
  }, [data]);
  if (files.length === 0) return null;
  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <SectionHeader icon={Upload} title="Uploaded Files" count={files.length} />
      <div className="space-y-3">
        {files.map((file, index) => (
          <div key={file.publicId || index} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#374155]/50 bg-[#242B3D] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B3DFF]/15"><FileText size={16} className="text-[#8B3DFF]" /></div>
              <div>
                <p className="text-sm font-medium text-white">{file.label}</p>
                {file.publicId && <p className="mt-0.5 text-[10px] text-[#CBC3D7]/40">Public ID: {file.publicId}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#374155] bg-[#1B2334] px-3 py-2 text-xs font-medium text-[#CBC3D7]/80 transition hover:border-[#8B3DFF]/50 hover:text-white"><Eye size={13} /> View</a>
              <a href={file.url} download className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B3DFF]/20 px-3 py-2 text-xs font-medium text-[#8B3DFF] transition hover:bg-[#8B3DFF]/30"><Download size={13} /> Download</a>
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
      <SectionHeader icon={Clock} title="Approval History" count={history.length} />
      <div className="relative ml-4 border-l-2 border-[#374155]/50 pl-6">
        {history.map((entry, index) => {
          const action = entry.action || entry.status || "Action";
          const isApproved = String(action).toLowerCase() === "approved";
          const isPending = String(action).toLowerCase() === "pending";
          const isRejected = String(action).toLowerCase() === "rejected";
          return (
            <div key={entry._id || index} className="relative pb-6 last:pb-0">
              <div className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b1326] ${isApproved ? "bg-[#20D18C]/20" : isPending ? "bg-[#FF4F91]/20" : isRejected ? "bg-red-500/20" : "bg-[#8B3DFF]/20"}`}>
                {isApproved ? <CheckCircle2 size={12} className="text-[#20D18C]" /> : isRejected ? <XCircle size={12} className="text-red-500" /> : <Clock size={12} className={isPending ? "text-[#FF4F91]" : "text-[#8B3DFF]"} />}
              </div>
              <div className="rounded-lg border border-[#374155]/50 bg-[#242B3D] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{action}</p>
                    {entry.status && entry.status !== entry.action && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(entry.status)}`}>{entry.status}</span>}
                  </div>
                  {(entry.actionDate || entry.updatedAt) && <span className="text-[11px] text-[#CBC3D7]/50">{formatDateTime(entry.actionDate || entry.updatedAt)}</span>}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {entry.role && <span className="inline-block rounded-full bg-[#8B3DFF]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#8B3DFF]">{entry.role}</span>}
                  {(entry.approvedBy || entry.performedBy) && <span className="inline-block rounded-full bg-[#242B3D] border border-[#374155]/50 px-2.5 py-0.5 text-[10px] font-medium text-[#CBC3D7]/60">By: {entry.approvedBy || entry.performedBy}</span>}
                </div>
                {entry.remarks && <p className="mt-2.5 rounded-md bg-[#1B2334] p-2.5 text-xs leading-5 text-[#CBC3D7]/75">{entry.remarks}</p>}
                {entry.reason && entry.reason !== entry.remarks && <p className="mt-2 rounded-md bg-[#1B2334] p-2.5 text-xs leading-5 text-[#CBC3D7]/75"><span className="font-medium text-[#CBC3D7]/50">Reason: </span>{entry.reason}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const VideoIndividualDetailViewPage = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Interchange modal state ──────────────────────────────────────────
  const [isInterchangeModalOpen, setIsInterchangeModalOpen] = useState(false);
  const [interchangeType, setInterchangeType] = useState(null);

  const fetchSubmission = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/individual-submissions/getrequest/${id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error("Failed to fetch video submission");
      const response = await res.json();
      if (!response.success) throw new Error(response.message || "Failed to fetch video submission");
      const videoSubmission = Array.isArray(response.data) ? response.data[0] : response.data;
      setSubmission(videoSubmission || null);
    } catch (err) {
      setError(err.message || "Failed to load video details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleOpenInterchange = (type) => {
    setInterchangeType(type);
    setIsInterchangeModalOpen(true);
  };

  const innerData = submission?.data || {};
  const employee = innerData.employee || {};
  const video = innerData.video || null;
  const topStatus = submission?.status || innerData.overallStatus || "-";
  const submissionId = submission?.id || submission?._id || submission?.data?._id || id;
  const mediaTypes = Array.isArray(innerData.typeOfMedia)
    ? innerData.typeOfMedia
    : [];
  const hasVideo = mediaTypes.some((t) => String(t).toLowerCase() === "video");

  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <DashboardHeader basePath="/dashboard-video" />
      <main className="px-4 pb-8 sm:px-6">
        <div className="flex items-center justify-between gap-2 py-3 text-sm text-[#CBC3D7]/50">
          <div className="flex items-center gap-2">
            <Link to="/dashboard-video" className="hover:text-white transition-colors">Video Dashboard</Link>
            <ChevronRight size={14} />
            <span className="text-[#D0BCFF]">Individual Video Details</span>
            {employee.name && (<><ChevronRight size={14} /><span className="text-[#D0BCFF]">{employee.name}</span></>)}
          </div>
        </div>
        <section className="mt-2 rounded-xl border border-[#27334c] bg-[#151d31] p-5 sm:p-6">
          {loading ? <SkeletonLoader /> : error ? <ErrorState message={error} /> : !submission ? <EmptyState /> : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-semibold text-[#8B3DFF]">Individual Video Request Details</h1>
                  <p className="mt-1.5 text-xs leading-6 text-[#CBC3D7]/50">Complete details of the individual video submission.</p>
                </div>
                {topStatus && <span className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-semibold ${getStatusBadgeClass(topStatus)}`}>{topStatus}</span>}
              </div>
              <RequestInfoGrid submission={submission} data={innerData} />
              <EmployeeDetailsSection employee={employee} />
              {video && hasVideo && (
                <VideoContentSection
                  video={video}
                  onInterchange={() => handleOpenInterchange("Video")}
                />
              )}
              <FinanceDetailsSection data={innerData} />
              <ApprovalStagesSection data={innerData} />
              <UploadedFilesSection data={innerData} />
              <ApprovalHistoryTimeline history={innerData.approvalHistory} />
            </>
          )}
        </section>
      </main>

      {/* Interchange Modal */}
      {isInterchangeModalOpen && interchangeType && submissionId && (
        <MediaStaffInterchangeModal
          event={{
            eventId: submissionId,
            _id: submissionId,
            media: [{ typeOfMedia: [interchangeType.toLowerCase()] }],
          }}
          mediaType={interchangeType.toLowerCase()}
          isIndividualInterchange={true}
          title={`Interchange ${interchangeType} Request`}
          onClose={() => {
            setIsInterchangeModalOpen(false);
            setInterchangeType(null);
          }}
          onSuccess={() => {
            fetchSubmission();
          }}
        />
      )}
    </section>
  );
};

export default memo(VideoIndividualDetailViewPage);
