import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, FileText, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import DashboardHeader from "../ICTC-Dashboard/DashboardHeader";
import Modal from "../../../Components/Modal";

// Faculty detail panels — polished design matching Venue/Food/Transport detail views
import FacultyPurchaseDetailsPanel from "../Faculty-Dashboard/FacultyPurchaseDetailsPanel";
import FacultyMediaDetailsPanel from "../Faculty-Dashboard/FacultyMediaDetailsPanel";
import FacultyAccommodationDetailsPanel from "../Faculty-Dashboard/FacultyAccommodationDetailsPanel";
import FacultyVenueDetailsPanel from "../Faculty-Dashboard/FacultyVenueDetailsPanel";
import FacultyAudioDetailsPanel from "../Faculty-Dashboard/FacultyAudioDetailsPanel";
import FacultyIctcsDetailsPanel from "../Faculty-Dashboard/FacultyIctcsDetailsPanel";
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

const formatDateTime = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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

const ApprovalStageCard = ({ stage, approval }) => {
  const statusText = approval?.status || "-";
  const isApproved = String(statusText).toLowerCase() === "approved";
  const isPending = String(statusText).toLowerCase() === "pending";
  const statusColor = isApproved
    ? "text-[#20D18C]"
    : isPending
      ? "text-[#FF4F91]"
      : "text-white";

  return (
    <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
        {stage.label}
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#CBC3D7]/65">Status</span>
          <span className={`font-medium ${statusColor}`}>{statusText}</span>
        </div>
        {approval?.approvedBy && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#CBC3D7]/65">Approved By</span>
            <span className="font-medium text-white">
              {approval.approvedBy}
            </span>
          </div>
        )}
        {approval?.approvedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#CBC3D7]/65">Approved At</span>
            <span className="font-medium text-white">
              {formatDateTime(approval.approvedAt)}
            </span>
          </div>
        )}
        {approval?.updatedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#CBC3D7]/65">Updated At</span>
            <span className="font-medium text-white">
              {formatDateTime(approval.updatedAt)}
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
};

const ModuleStatusCard = ({ statuses }) => (
  <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
    <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
      Module Status
    </h3>
    <div className="space-y-2">
      {Object.entries(statuses).map(([dept, st]) => (
        <div
          key={dept}
          className="flex items-center justify-between border-b border-[#30384d]/40 py-2 text-sm last:border-b-0"
        >
          <span className="text-[#CBC3D7]/65 capitalize">{dept}</span>
          <span
            className={`font-medium ${String(st).toLowerCase() === "approved" ? "text-[#34D399]" : String(st).toLowerCase() === "pending" ? "text-[#FF4F91]" : "text-white"}`}
          >
            {String(st)}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Transport inline section ──────────────────────────────────────────
const TransportDetailsSection = ({ data }) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-[#374155] bg-[#1B2334]">
        <p className="text-sm font-medium text-[#CBC3D7]/50">
          No transport details available.
        </p>
      </div>
    );
  }

  const checkpoints = data.checkpoints || [];
  const vehicles = data.vehicles || [];
  const accompanyingStaff = data.accompanyingStaff || [];

  return (
    <div className="mt-6 space-y-5">
      {/* Transport Details card */}
      <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
          Transport Details
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoGridItem
            label="Pickup Date & Time"
            value={formatDateTime(data.pickupDateTime)}
          />
          <InfoGridItem
            label="Drop Date & Time"
            value={formatDateTime(data.dropDateTime)}
          />
          <InfoGridItem label="Pickup Location" value={data.pickupLocation} />
          <InfoGridItem label="Drop Location" value={data.dropLocation} />
          <InfoGridItem label="Total Passengers" value={data.totalPassengers} />
          <InfoGridItem
            label="Number of Buses Needed"
            value={data.numberOfBusNeeded}
          />
          <InfoGridItem
            label="Number of Accompanying Staff"
            value={data.numberOfAccompanyingStaff}
          />
        </div>
      </div>

      {/* Checkpoints */}
      {checkpoints.length > 0 && (
        <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
            Checkpoints ({checkpoints.length})
          </h3>
          <div className="space-y-2">
            {checkpoints.map((cp, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md bg-[#242B3D] px-4 py-3 border border-[#374155]/50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8B3DFF]/20 text-[10px] font-bold text-[#8B3DFF]">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-white">
                  {cp.location || "-"}
                </span>
                {cp.time && (
                  <span className="ml-auto text-xs text-[#CBC3D7]/50">
                    {cp.time}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicles */}
      {vehicles.length > 0 && (
        <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
            Vehicles ({vehicles.length})
          </h3>
          <div className="space-y-2">
            {vehicles.map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md bg-[#242B3D] px-4 py-3 border border-[#374155]/50"
              >
                <span className="text-sm font-medium text-white capitalize">
                  {v.type || "-"}
                </span>
                <span className="rounded-full bg-[#8B3DFF]/15 px-3 py-1 text-xs font-semibold text-[#8B3DFF]">
                  Count: {v.count || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accompanying Staff */}
      {accompanyingStaff.length > 0 && (
        <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
            Accompanying Staff ({accompanyingStaff.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#374155]/60 text-[10px] uppercase text-[#CBC3D7]/45">
                  <th className="px-4 py-2 font-semibold">#</th>
                  <th className="px-4 py-2 font-semibold">Name</th>
                  <th className="px-4 py-2 font-semibold">Mobile</th>
                </tr>
              </thead>
              <tbody>
                {accompanyingStaff.map((staff, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#30384d]/40 text-white"
                  >
                    <td className="px-4 py-2.5 text-[#CBC3D7]/50">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">
                      {staff.name || "-"}
                    </td>
                    <td className="px-4 py-2.5">{staff.mobile || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Special Requirements */}
      {data.specialRequirements && (
        <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
            Special Requirements
          </h3>
          <p className="text-sm leading-6 text-[#CBC3D7]/80">
            {data.specialRequirements}
          </p>
        </div>
      )}

      {/* Principal Approval Document */}
      {data.principalApprovalForm?.url && (
        <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
            Principal Approval Document
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={data.principalApprovalForm.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#374155] bg-[#242B3D] px-4 py-3 text-sm text-[#CBC3D7]/80 hover:text-white hover:border-[#8B3DFF]/50 transition-colors"
            >
              <FileText size={16} className="text-[#8B3DFF]" />
              <span>View Document</span>
            </a>
            <a
              href={data.principalApprovalForm.url}
              download
              className="inline-flex items-center gap-2 rounded-lg bg-[#8B3DFF]/20 px-4 py-3 text-sm font-medium text-[#8B3DFF] hover:bg-[#8B3DFF]/30 transition-colors"
            >
              <FileText size={16} />
              <span>Download</span>
            </a>
          </div>
          {data.principalApprovalForm.publicId && (
            <span className="mt-2 inline-block text-[10px] text-[#CBC3D7]/50">
              Public ID: {data.principalApprovalForm.publicId}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Food inline section ───────────────────────────────────────────────
const FoodDetailsSection = ({ data }) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-[#374155] bg-[#1B2334]">
        <p className="text-sm font-medium text-[#CBC3D7]/50">
          No food details available.
        </p>
      </div>
    );
  }

  const resourcePersonTypes = Array.isArray(data.resourcePersonType)
    ? data.resourcePersonType
        .map((r) => r?.type || r)
        .filter(Boolean)
        .join(", ")
    : data.resourcePersonType || "-";

  const accompanyingStaff = data.accompanyingStaff || [];
  const foodTypes = data.foodTypes || [];

  return (
    <div className="mt-6 space-y-5">
      {/* Food Details card */}
      <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
          Food Details
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoGridItem label="Required Date" value={formatDate(data.date)} />
          <InfoGridItem
            label="Resource Person Types"
            value={resourcePersonTypes}
          />
          <InfoGridItem
            label="Number of Resource Persons"
            value={data.numberOfResourcePersons}
          />
          <InfoGridItem
            label="Number of Internal Accompanying Staff"
            value={data.numberOfInternalAccompanyingStaff}
          />
        </div>
      </div>

      {/* Accompanying Staff */}
      {accompanyingStaff.length > 0 && (
        <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
            Accompanying Staff ({accompanyingStaff.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#374155]/60 text-[10px] uppercase text-[#CBC3D7]/45">
                  <th className="px-4 py-2 font-semibold">#</th>
                  <th className="px-4 py-2 font-semibold">Name</th>
                  <th className="px-4 py-2 font-semibold">Mobile</th>
                </tr>
              </thead>
              <tbody>
                {accompanyingStaff.map((staff, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#30384d]/40 text-white"
                  >
                    <td className="px-4 py-2.5 text-[#CBC3D7]/50">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">
                      {staff.name || "-"}
                    </td>
                    <td className="px-4 py-2.5">{staff.mobile || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Food Types */}
      {foodTypes.length > 0 && (
        <div className="space-y-4">
          {foodTypes.map((group, gIdx) => {
            const mealTypes = group.foodTypes || [];
            return (
              <div
                key={gIdx}
                className="rounded-lg border border-[#374155] bg-[#1B2334] p-4"
              >
                <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                  Meal Requirement {gIdx + 1}
                </h3>

                {mealTypes.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {mealTypes.map((mealType, mIdx) => (
                      <span
                        key={mIdx}
                        className="rounded-full bg-[#8B3DFF]/15 px-3 py-1 text-xs font-medium text-[#8B3DFF]"
                      >
                        {mealType?.type || mealType}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-[#374155]/50 bg-[#242B3D] p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase text-[#CBC3D7]/45">
                      Participants
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#CBC3D7]/65">Vegetarian</span>
                        <span className="font-medium text-white">
                          {group.participants?.vegCount ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#CBC3D7]/65">
                          Non-Vegetarian
                        </span>
                        <span className="font-medium text-white">
                          {group.participants?.nonVegCount ?? "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-[#374155]/50 bg-[#242B3D] p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase text-[#CBC3D7]/45">
                      VIP Guests
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#CBC3D7]/65">Vegetarian</span>
                        <span className="font-medium text-white">
                          {group.vipGuests?.vegCount ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#CBC3D7]/65">
                          Non-Vegetarian
                        </span>
                        <span className="font-medium text-white">
                          {group.vipGuests?.nonVegCount ?? "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Special Requirements */}
      {data.specialRequirements && (
        <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
            Special Requirements
          </h3>
          <p className="text-sm leading-6 text-[#CBC3D7]/80">
            {data.specialRequirements}
          </p>
        </div>
      )}

      {/* Uploaded Document */}
      {data.uploadedFile?.url && (
        <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
            Uploaded Document
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={data.uploadedFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#374155] bg-[#242B3D] px-4 py-3 text-sm text-[#CBC3D7]/80 hover:text-white hover:border-[#8B3DFF]/50 transition-colors"
            >
              <FileText size={16} className="text-[#8B3DFF]" />
              <span>View Document</span>
            </a>
            <a
              href={data.uploadedFile.url}
              download
              className="inline-flex items-center gap-2 rounded-lg bg-[#8B3DFF]/20 px-4 py-3 text-sm font-medium text-[#8B3DFF] hover:bg-[#8B3DFF]/30 transition-colors"
            >
              <FileText size={16} />
              <span>Download</span>
            </a>
          </div>
          {data.uploadedFile.fileName && (
            <span className="mt-2 inline-block text-[10px] text-[#CBC3D7]/50">
              File: {data.uploadedFile.fileName}
            </span>
          )}
          {data.uploadedFile.publicId && (
            <span className="mt-2 inline-block text-[10px] text-[#CBC3D7]/50">
              Public ID: {data.uploadedFile.publicId}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Map individual submission form types to their Faculty panel components
// and prepare the data in the shape the panels expect.
const FORM_TYPE_CONFIG = {
  purchase: {
    component: FacultyPurchaseDetailsPanel,
    props: (data) => ({
      purchaseDetails: { purchases: data?.purchases || [] },
      eventSchedule: [],
    }),
  },
  transport: {
    component: TransportDetailsSection,
    props: (data) => ({ data: data || {} }),
  },
  food: {
    component: FoodDetailsSection,
    props: (data) => ({ data: data || {} }),
  },
  media: {
    component: FacultyMediaDetailsPanel,
    props: (data) => ({
      mediaDetails: { mediaRequirements: data?.mediaRequirements || [data] },
    }),
  },
  accommodation: {
    component: FacultyAccommodationDetailsPanel,
    props: (data) => ({
      accommodationDetails: { accommodations: [data] },
      eventSchedule: [],
    }),
  },
  venue: {
    component: FacultyVenueDetailsPanel,
    props: (data) => ({
      venueDetails: { venues: [data] },
      eventSchedule: [],
    }),
  },
  audio: {
    component: FacultyAudioDetailsPanel,
    props: (data) => ({
      audioDetails: { audios: [data] },
      eventSchedule: [],
    }),
  },
  icts: {
    component: FacultyIctcsDetailsPanel,
    props: (data) => ({
      ictsDetails: { ictses: [data] },
      eventSchedule: [],
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
  if (key.includes("accommodation")) return "accommodation";
  if (key.includes("venue")) return "venue";
  if (key.includes("audio") || key.includes("sound")) return "audio";
  if (key.includes("icts") || key.includes("ictc")) return "icts";
  return null;
};

const IndividualEventDetailPage = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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
          setSubmission(submissionData || null);
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
      window.location.reload();
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
      window.location.reload();
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

  const data = submission?.data || {};
  const employee = data.employee || {};
  const formTypeKey = resolveFormType(submission?.formType);
  const config = FORM_TYPE_CONFIG[formTypeKey];
  const DetailComponent = config?.component;
  const detailProps = config?.props?.(data) || {};
  const status = submission?.status || data.overallStatus || "-";
  const employeeName = employee.name || submission?.employee || "-";
  const employeeEmail = employee.email || submission?.employeeEmail || "-";

  const [isHead, setIsHead] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const decode = jwtDecode(token);
    if (decode.role == "head") {
      setIsHead(true);
    }
    // console.log("decoded token : ", decode)
  }, []);

  // console.log("is head : ", isHead)
  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <DashboardHeader basePath="/dashboard-admin" />

      <main className="px-6 pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 justify-between py-3 text-sm text-[#CBC3D7]/50">
          <div className="flex items-center gap-2 ">
            {/* <Link
              to="/dashboard-admin"
              className="hover:text-white transition-colors"
            >
              Admin Dashboard
            </Link> */}
            {/* <ChevronRight size={14} /> */}
            <span className="text-[#D0BCFF]">Individual Request Details</span>
            {employee.name && (
              <>
                <ChevronRight size={14} />
                <span className="text-[#D0BCFF]">{employee.name}</span>
              </>
            )}
            {submission?.formType && (
              <span className="ml-1 rounded-full bg-[#8B3DFF]/15 px-3 py-0.5 text-[11px] font-semibold text-[#8B3DFF]">
                {submission.formType}
              </span>
            )}
          </div>
          {/* approval button   */}

          {isHead &&
            submission?.data?.headApproval?.status.toLowerCase() ==
              "completed" && (
              <button className="bg-emerald-800 flex items-center gap-2 text-white px-4 py-2 text-sm rounded-lg">
                <span><Check size={16} className="text-white" /></span> Completed
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
              {/* Header with title, description, and status badge */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-[#8B3DFF]">
                    {submission.formType} Details
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-[#CBC3D7]/55">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the
                    industry&apos;s standard dummy text ever since the 1500s
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {status && status !== "-" && (
                    <span
                      className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium ${getStatusClassName(status)}`}
                    >
                      {status}
                    </span>
                  )}
                  {data.superAdminApproval?.status?.toLowerCase() ===
                  "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#07785D] to-[#07785D] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        <Check size={16} className="text-white" />
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 rounded-lg border border-[#FF0063] px-4 py-2 text-sm font-medium text-[#FF0063] transition hover:bg-[#FF0063]/10 disabled:opacity-50"
                      >
                        <X size={14} className="text-[#FF0063]" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    data.superAdminApproval?.status && (
                      <span
                        className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium ${getStatusClassName(data.superAdminApproval.status)}`}
                      >
                        Super Admin: {data.superAdminApproval.status}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Submission Info Grid — ALL top-level fields */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <InfoGridItem label="Request ID" value={submission.id} />
                <InfoGridItem label="Organizer" value={employeeName} />
                <InfoGridItem label="Email" value={employeeEmail} />
                <InfoGridItem label="Form Type" value={submission.formType} />
                <InfoGridItem label="Status" value={submission.status || "-"} />
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
                {data.finalStatus && (
                  <InfoGridItem label="Final Status" value={data.finalStatus} />
                )}
                {data.overallStatus && (
                  <InfoGridItem
                    label="Overall Status"
                    value={data.overallStatus}
                  />
                )}
                {data._id && <InfoGridItem label="Data ID" value={data._id} />}
                {data.status && typeof data.status !== "object" && (
                  <InfoGridItem label="Inner Status" value={data.status} />
                )}
                {data.workflowStage && (
                  <InfoGridItem
                    label="Inner Workflow Stage"
                    value={data.workflowStage}
                  />
                )}
                {data.createdAt && (
                  <InfoGridItem
                    label="Data Created"
                    value={formatDate(data.createdAt)}
                  />
                )}
                {data.updatedAt && (
                  <InfoGridItem
                    label="Data Updated"
                    value={formatDate(data.updatedAt)}
                  />
                )}
              </div>

              {/* Employee Detail — all fields */}
              {employee && Object.keys(employee).length > 0 && (
                <div className="mt-5 rounded-lg border border-[#374155] bg-[#1B2334] p-4">
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                    Employee Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InfoGridItem
                      label="Record ID"
                      value={employee._id || "-"}
                    />
                    <InfoGridItem label="Name" value={employee.name || "-"} />
                    <InfoGridItem
                      label="Employee Code"
                      value={employee.empId || "-"}
                    />
                    <InfoGridItem label="Email" value={employee.email || "-"} />
                    <InfoGridItem label="Phone" value={employee.phone || "-"} />
                    <InfoGridItem
                      label="Department"
                      value={employee.department || "-"}
                    />
                    <InfoGridItem
                      label="Designation"
                      value={employee.designation || "-"}
                    />
                    <InfoGridItem
                      label="Category"
                      value={employee.employeeCategory || "-"}
                    />
                    <InfoGridItem
                      label="Gender"
                      value={employee.gender || "-"}
                    />
                    <InfoGridItem
                      label="Date of Birth"
                      value={formatDate(employee.dob)}
                    />
                    <InfoGridItem
                      label="Date of Joining"
                      value={formatDate(employee.doj)}
                    />
                    <InfoGridItem
                      label="Employment Status"
                      value={
                        employee.employmentStatus !== undefined
                          ? employee.employmentStatus
                            ? "Active"
                            : "Inactive"
                          : "-"
                      }
                    />
                    <InfoGridItem
                      label="Location"
                      value={employee.location || "-"}
                    />
                    <InfoGridItem
                      label="Employee Created"
                      value={formatDate(employee.createdAt)}
                    />
                    <InfoGridItem
                      label="Employee Updated"
                      value={formatDate(employee.updatedAt)}
                    />
                  </div>
                </div>
              )}

              {/* Finance Details — for Purchase & Transport */}
              {(data.financeRequired ||
                data.advanceAmount ||
                data.advancePurpose) && (
                <div className="mt-5 rounded-lg border border-[#374155] bg-[#1B2334] p-4">
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                    Finance Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InfoGridItem
                      label="Finance Required"
                      value={data.financeRequired}
                    />
                    <InfoGridItem
                      label="Advance Amount"
                      value={
                        data.advanceAmount ? `₹${data.advanceAmount}` : "-"
                      }
                    />
                    <InfoGridItem
                      label="Advance Purpose"
                      value={data.advancePurpose || "-"}
                    />
                  </div>
                </div>
              )}

              {/* Approval Stages — dynamically render all approval levels present in the response */}
              {(() => {
                const APPROVAL_STAGES = [
                  { key: "adminApproval", label: "Admin Approval" },
                  { key: "hodApproval", label: "HOD Approval" },
                  { key: "departmentApproval", label: "Department Approval" },
                  { key: "superAdminApproval", label: "Super Admin Approval" },
                  { key: "headApproval", label: "Head Approval" },
                ];
                const availableStages = APPROVAL_STAGES.filter(
                  (s) => data[s.key],
                );
                const hasMultiStatus =
                  data.status && typeof data.status === "object";

                if (availableStages.length === 0 && !hasMultiStatus)
                  return null;

                return (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {availableStages.map((stage) => (
                      <ApprovalStageCard
                        key={stage.key}
                        stage={stage}
                        approval={data[stage.key]}
                      />
                    ))}
                    {hasMultiStatus && (
                      <ModuleStatusCard statuses={data.status} />
                    )}
                  </div>
                );
              })()}

              {/* Principal Approval Form / Uploaded File — view + download links with metadata */}
              {(data.principalApprovalForm?.url || data.uploadedFile?.url) && (
                <div className="mt-5 rounded-lg border border-[#374155] bg-[#1B2334] p-4">
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                    Uploaded Documents
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={
                        data.principalApprovalForm?.url ||
                        data.uploadedFile?.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#374155] bg-[#1B2334] px-4 py-3 text-sm text-[#CBC3D7]/80 hover:text-white hover:border-[#8B3DFF]/50 transition-colors"
                    >
                      <FileText size={16} className="text-[#8B3DFF]" />
                      <span>View Document</span>
                    </a>
                    <a
                      href={
                        data.principalApprovalForm?.url ||
                        data.uploadedFile?.url
                      }
                      download
                      className="inline-flex items-center gap-2 rounded-lg bg-[#8B3DFF]/20 px-4 py-3 text-sm font-medium text-[#8B3DFF] hover:bg-[#8B3DFF]/30 transition-colors"
                    >
                      <FileText size={16} />
                      <span>Download</span>
                    </a>
                  </div>
                  {data.principalApprovalForm?.publicId && (
                    <span className="mt-2 inline-block text-[10px] text-[#CBC3D7]/50">
                      Public ID: {data.principalApprovalForm.publicId}
                    </span>
                  )}
                  {data.uploadedFile?.publicId && (
                    <span className="mt-2 inline-block text-[10px] text-[#CBC3D7]/50">
                      Public ID: {data.uploadedFile.publicId}
                    </span>
                  )}
                  {data.uploadedFile?.fileName && (
                    <span className="mt-2 inline-block text-[10px] text-[#CBC3D7]/50">
                      File: {data.uploadedFile.fileName}
                    </span>
                  )}
                </div>
              )}

              {/* Reference Files — download links */}
              {data.referenceFiles?.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                    Reference Files
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {data.referenceFiles.map((file, index) => {
                      const fileUrl = file?.url || file;
                      return (
                        <a
                          key={index}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-[#374155] bg-[#1B2334] px-4 py-3 text-sm text-[#CBC3D7]/80 hover:text-white hover:border-[#8B3DFF]/50 transition-colors"
                        >
                          <FileText size={16} className="text-[#8B3DFF]" />
                          <span>File {index + 1}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form-specific detail panel — using Faculty panels for consistent polished design */}
              <div className="mt-8">
                {DetailComponent ? (
                  <DetailComponent {...detailProps} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-[#374155] bg-[#1B2334]">
                    <FileText size={40} className="mb-3 text-[#CBC3D7]/30" />
                    <p className="text-sm font-medium text-[#CBC3D7]/50">
                      No detail view available for &quot;{submission.formType}
                      &quot;
                    </p>
                    <p className="mt-1 text-xs text-[#CBC3D7]/35">
                      This form type does not have a configured detail panel.
                    </p>
                  </div>
                )}
              </div>

              {/* Approval History — timeline of all approval actions */}
              {data.approvalHistory?.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-4 text-sm font-semibold text-[#CBC3D7]/65 uppercase tracking-wider">
                    Approval History
                  </h3>
                  <div className="space-y-3">
                    {data.approvalHistory.map((entry, index) => (
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
                            {entry.updatedAt && (
                              <span className="text-xs text-[#CBC3D7]/50">
                                {formatDate(entry.updatedAt)}
                              </span>
                            )}
                          </div>
                          {entry.performedBy && (
                            <p className="mt-1 text-xs text-[#CBC3D7]/65">
                              By: {entry.performedBy}
                            </p>
                          )}
                          {entry.reason && (
                            <p className="mt-2 rounded-md bg-[#232A3B] p-2.5 text-xs leading-5 text-[#CBC3D7]/80">
                              {entry.reason}
                            </p>
                          )}
                          {entry.role && (
                            <span className="mt-2 inline-block rounded-full bg-[#8B3DFF]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#8B3DFF]">
                              {entry.role}
                            </span>
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

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
        }}
        title="Reason for Rejection"
      >
        <p className="text-sm text-[#CBC3D7]/70">
          The request was rejected for the following reason
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="mt-4 min-h-[100px] w-full rounded-lg border border-[#374155] bg-[#1B2334] p-3 text-sm text-white placeholder:text-[#CBC3D7]/40 focus:outline-none focus:ring-1 focus:ring-[#FF0063]"
          placeholder="Enter rejection reason..."
        />
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason("");
            }}
            className="rounded-lg border border-[#374155] px-4 py-2 text-sm text-[#CBC3D7]/70 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={actionLoading}
            className="rounded-lg bg-gradient-to-r from-[#FF0063] to-[#D90056] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {actionLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </Modal>
    </section>
  );
};

export default IndividualEventDetailPage;
