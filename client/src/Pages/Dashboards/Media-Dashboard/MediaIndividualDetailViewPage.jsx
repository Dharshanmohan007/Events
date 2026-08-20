import React, { useState, useEffect, memo, useMemo } from "react";
import { ChevronRight, Shield, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DashboardHeader from "../ICTC-Dashboard/DashboardHeader";
import FacultyMediaDetailsPanel from "../Faculty-Dashboard/FacultyMediaDetailsPanel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getStatusClassName = (status) => {
  if (!status || status === "-") return "bg-[#0e5149]/55 text-[#20D18C]";
  const s = String(status).toLowerCase();
  if (s === "completed") return "bg-[#4A2BB7]/35 text-[#A78BFA]";
  if (s.includes("pending"))
    return "bg-[#5D1438]/50 text-[#FF4F91]";
  if (s === "acknowledged")
    return "bg-gradient-to-r from-emerald-700 to-emerald-900 text-[#ffffff]/80";
  if (s === "admin canceled") return "bg-yellow-700 text-[#FF4F91]";
  return "bg-[#0e5149]/55 text-[#20D18C]";
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

const formatDateTime = (dateValue) => {
  if (!dateValue) return "-";
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

const safeText = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

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

const EmployeeDetailsSection = memo(({ employee }) => {
  if (!employee?.name) return null;
  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
        Employee Details
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoItem label="Name" value={employee.name} />
        {employee.empId && (
          <InfoItem label="Employee Number" value={employee.empId} />
        )}
        <InfoItem label="Email" value={employee.email} />
        {employee.phone && <InfoItem label="Phone" value={employee.phone} />}
        <InfoItem label="Department" value={employee.department} />
        {employee.designation && (
          <InfoItem label="Designation" value={employee.designation} />
        )}
        {employee.employeeCategory && (
          <InfoItem label="Category" value={employee.employeeCategory} />
        )}
        {employee.location && (
          <InfoItem label="Location" value={employee.location} />
        )}
      </div>
    </div>
  );
});

const ApprovalStageCard = memo(({ label, approval }) => {
  const statusText = approval?.status || "-";
  return (
    <div className="rounded-xl border border-[#374155] bg-[#1B2334] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
          {label}
        </h4>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-semibold ${getStatusBadgeClass(statusText)}`}
        >
          {statusText}
        </span>
      </div>
      <div className="space-y-2">
        {approval?.approvedBy && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#CBC3D7]/55">Approved By</span>
            <span className="font-medium text-white">
              {approval.approvedBy}
            </span>
          </div>
        )}
        {(approval?.approvedAt || approval?.updatedAt) && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#CBC3D7]/55">Updated At</span>
            <span className="font-medium text-white">
              {formatDateTime(approval.approvedAt || approval.updatedAt)}
            </span>
          </div>
        )}
        {approval?.reason && (
          <div className="mt-1 rounded-lg bg-[#232A3B] px-3 py-2.5">
            <p className="text-xs leading-5 text-[#CBC3D7]/80">
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
  const formatLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/approval$/i, "Approval")
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Shield size={16} className="text-[#8B3DFF]" />
        <h3 className="text-base font-semibold text-white">Approval Stages</h3>
      </div>
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

const ApprovalHistoryTimeline = memo(({ history }) => {
  if (!Array.isArray(history) || history.length === 0) return null;
  return (
    <div className="mt-6 rounded-xl border border-[#374155] bg-[#1B2334] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock size={16} className="text-[#8B3DFF]" />
        <h3 className="text-base font-semibold text-white">
          Approval History
        </h3>
      </div>
      <div className="relative ml-4 border-l-2 border-[#374155]/50 pl-6">
        {history.map((entry, index) => {
          const action = entry.action || entry.status || "Action";
          const isApproved =
            String(action).toLowerCase() === "approved";
          const isPending =
            String(action).toLowerCase() === "pending";
          const isRejected =
            String(action).toLowerCase() === "rejected";
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
                    className={
                      isPending ? "text-[#FF4F91]" : "text-[#8B3DFF]"
                    }
                  />
                )}
              </div>
              <div className="rounded-lg border border-[#374155]/50 bg-[#242B3D] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{action}</p>
                  {(entry.actionDate || entry.updatedAt) && (
                    <span className="text-[11px] text-[#CBC3D7]/50">
                      {formatDateTime(entry.actionDate || entry.updatedAt)}
                    </span>
                  )}
                </div>
                {entry.role && (
                  <span className="mt-2 inline-block rounded-full bg-[#8B3DFF]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#8B3DFF]">
                    {entry.role}
                  </span>
                )}
                {entry.remarks && (
                  <p className="mt-2 rounded-md bg-[#1B2334] p-2.5 text-xs leading-5 text-[#CBC3D7]/75">
                    {entry.remarks}
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

const MediaIndividualDetailViewPage = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchSubmission = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/individual-submissions/getrequest/${id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        if (!res.ok) throw new Error("Failed to fetch media submission");
        const response = await res.json();
        if (!response.success)
          throw new Error(
            response.message || "Failed to fetch media submission",
          );
        if (isMounted) {
          const data = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setSubmission(data || null);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load media details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSubmission();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const innerData = submission?.data || {};
  const employee = innerData.employee || {};
  const status = submission?.status || innerData.overallStatus || "-";

  return (
    <section className="min-h-screen bg-[#0b1326] text-white poppins">
      <DashboardHeader basePath="/dashboard-media" />

      <main className="h-[93vh] px-7 pt-2">
        <header className="mt-4 flex items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard-media"
              className="text-md font-medium text-[#CBC3D7]/50 transition hover:text-white"
            >
              Media Dashboard
            </Link>
            <ChevronRight size={16} />
            <h1 className="text-md font-medium text-[#D0BCFF]">
              Individual Media Request
            </h1>
            {employee.name && (
              <span className="ml-3 rounded-full bg-green-400/10 px-5 py-2 text-sm text-[#10B981]">
                {employee.name}
              </span>
            )}
          </div>
        </header>

        {status && status !== "-" && (
          <section className="mt-3">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-medium text-[#CBC3D7]/65">
              <span
                className={`h-3 w-3 rounded-full ${status === "Completed" ? "bg-[#6D3BD8]" : status === "Acknowledged" ? "bg-[#25A987]" : "bg-[#B32058]"}`}
              />
              {status === "Completed"
                ? "COMPLETED"
                : status === "Acknowledged"
                  ? "ACKNOWLEDGED"
                  : "PENDING"}{" "}
              (1)
            </div>
          </section>
        )}

        <section className="mt-3 overflow-hidden">
          <section className="max-h-[calc(100vh-170px)] overflow-auto rounded-lg border border-[#27334c] bg-[#151d31] p-5 table-custom-scrollbar">
            {loading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
                Loading media details...
              </p>
            ) : error ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">
                {error}
              </p>
            ) : !submission ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
                Submission not found.
              </p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-[#8B3DFF]">
                      Media Request Details
                    </h2>
                    <p className="mt-2 text-xs leading-6 text-[#CBC3D7]/55">
                      Complete details of the individual media request
                      submission.
                    </p>
                  </div>
                  {status && status !== "-" && (
                    <span
                      className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium ${getStatusClassName(status)}`}
                    >
                      {status}
                    </span>
                  )}
                </div>

                <EmployeeDetailsSection employee={employee} />

                <div className="mt-8">
                  <FacultyMediaDetailsPanel
                    mediaDetails={{
                      mediaRequirements:
                        innerData.mediaRequirements || [innerData],
                    }}
                  />
                </div>

                <ApprovalStagesSection data={innerData} />
                <ApprovalHistoryTimeline
                  history={innerData.approvalHistory}
                />
              </>
            )}
          </section>
        </section>
      </main>
    </section>
  );
};

export default MediaIndividualDetailViewPage;
