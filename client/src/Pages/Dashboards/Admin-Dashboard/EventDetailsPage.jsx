import { Check, ChevronRight, Pencil, Trash, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EventRequisitionDetailsPanel from "./EventRequisitionDetailsPanel";
import EventDetailsSidePanel from "./EventDetailsSidePanel";
import VenueDetailsPanel from "./VenueDetailsPanel";
import IctcsDetailsPanel from "./IctcsDetailsPanel";
import AudioDetailsPanel from "./AudioDetailsPanel";
import TransportationDetailsPanel from "./TransportationDetailsPanel";
import FoodRefreshmentDetailsPanel from "./FoodRefreshmentDetailsPanel";
import AccommodationDetailsPanel from "./AccommodationDetailsPanel";
import PurchaseDetailsPanel from "./PurchaseDetailsPanel";
import MediaDetailsPanel from "./MediaDetailsPanel";
import RejectionReasonPopup from "./RejectionReasonPopup";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const DEPARTMENT_TAB_MAP = {
  venue: { name: "Venue Details", color: "#F20768" },
  icts: { name: "ICTCS Details", color: "#48E0CF" },
  audio: { name: "Audio Details", color: "#8B3DFF" },
  transport: { name: "Transportation Details", color: "#8B3DFF" },
  refreshment: { name: "Food Details", color: "#48E0CF" },
  accommodation: { name: "Accommodation Details", color: "#48E0CF" },
  purchase: { name: "Purchase Details", color: "#F20768" },
  media: { name: "Media Details", color: "#F20768" },
  poster: { name: "Media Details", color: "#F20768" },
  video: { name: "Media Details", color: "#F20768" },
};

const getStatusClassName = (status) => {
  if (!status || status === "-") return "bg-[#0e5149]/55 text-[#20D18C]";
  const s = String(status).toLowerCase();
  if (s === "completed") return "bg-[#4A2BB7]/35 text-[#A78BFA]";
  if (s === "pending for acknowledge") return "bg-[#5D1438]/50 text-[#FF4F91]";
  if (s === "acknowledged")
    return "bg-gradient-to-r from-emerald-700 to-emerald-900 text-[#ffffff]/80";
  if (s === "admin canceled") return "bg-yellow-700 text-[#FF4F91]";
  if (s.includes("rejected")) return "bg-red-500/20 text-red-400";
  if (s.includes("approved")) return "bg-emerald-500/20 text-emerald-400";
  if (s.includes("submitted")) return "bg-yellow-500/20 text-yellow-400";
  if (s.includes("pending")) return "bg-pink-600/20 text-pink-600";
  return "bg-[#0e5149]/55 text-[#20D18C]";
};

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // ── Tabs state ──────────────────────────────────────────────────────
  const [detailTabs, setDetailTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const activeTabConfig = detailTabs.find((tab) => tab.name === activeTab);

  // ── Requisition state ───────────────────────────────────────────────
  const [requestDetails, setRequestDetails] = useState(null);
  const [requisitionLoading, setRequisitionLoading] = useState(true);
  const [requisitionError, setRequisitionError] = useState("");
  const [data, setData] = useState([]);

  // ── Venue state ─────────────────────────────────────────────────────
  const [venueDetails, setVenueDetails] = useState(null);
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueError, setVenueError] = useState("");

  // ── Audio state ─────────────────────────────────────────────────────
  const [audioDetails, setAudioDetails] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState("");

  // ── Transport state ─────────────────────────────────────────────────
  const [transportDetails, setTransportDetails] = useState(null);
  const [transportLoading, setTransportLoading] = useState(false);
  const [transportError, setTransportError] = useState("");

  // ── Media state ─────────────────────────────────────────────────────
  const [mediaDetails, setMediaDetails] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");

  // ── Refreshment state ───────────────────────────────────────────────
  const [refreshmentDetails, setRefreshmentDetails] = useState(null);
  const [refreshmentLoading, setRefreshmentLoading] = useState(false);
  const [refreshmentError, setRefreshmentError] = useState("");

  // ── ICTS state ─────────────────────────────────────────────────────
  const [ictsDetails, setIctsDetails] = useState(null);
  const [ictsLoading, setIctsLoading] = useState(false);
  const [ictsError, setIctsError] = useState("");

  // ── Accommodation state ─────────────────────────────────────────────
  const [accommodationDetails, setAccommodationDetails] = useState(null);
  const [accommodationLoading, setAccommodationLoading] = useState(false);
  const [accommodationError, setAccommodationError] = useState("");

  // ── Purchase state ──────────────────────────────────────────────────
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  // ── Loading state for actions ─────────────────────────────────────
  const [actionLoading, setActionLoading] = useState(null);

  // ── Reject popup state ────────────────────────────────────────────
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ── Delete confirmation state ─────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch requisition details (extracted for reuse) ────────────────
  const fetchRequisitionDetails = async () => {
    setRequisitionLoading(true);
    setRequisitionError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = await res.json();
      if (!res.ok)
        throw new Error(
          payload.message || "Failed to fetch event requisition details",
        );

      const eventData = payload.data || payload;
      const details = eventData.requestDetails;
      // console.log('Admin event detail page data:', details)
      if (!details)
        throw new Error("Event requisition details are not available");

      setRequestDetails(details);
      setData(eventData);

      // Build dynamic tabs from requirements
      const tabs = [
        {
          name: "Event Requisition Details",
          color: "#8B5CF6",
          status: eventData.status || "Submitted",
        },
      ];
      const requirements = details.requirementDetails || {};
      const seen = new Set();
      for (const [key, required] of Object.entries(requirements)) {
        const module = key.replace(/Required$/, "");
        const config = DEPARTMENT_TAB_MAP[module];
        if (required && config && !seen.has(config.name)) {
          seen.add(config.name);
          tabs.push({
            name: config.name,
            color: config.color,
            status: "Pending for Acknowledge",
          });
        }
      }
      setDetailTabs(tabs);
      setActiveTab("Event Requisition Details");
    } catch (err) {
      console.error("Failed to fetch requisition details:", err);
      setRequestDetails(null);
      setDetailTabs([]);
      setRequisitionError(
        err.message || "Failed to fetch event requisition details",
      );
    } finally {
      setRequisitionLoading(false);
    }
  };

  // ── Fetch requisition details on mount ──────────────────────────────
  useEffect(() => {
    fetchRequisitionDetails();
  }, [eventId]);

  // ── Lazy fetch venue details ────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "Venue Details") return;

    const fetchVenueDetails = async () => {
      setVenueLoading(true);
      setVenueError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}?module=venue`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const payload = await res.json();
        if (!res.ok)
          throw new Error(payload.message || "Failed to fetch venue details");

        const eventData = payload.data || payload;
        if (!eventData.venueDetails)
          throw new Error("Venue details are not available");
        setVenueDetails(eventData.venueDetails);

        const venueStatus = eventData.venueDetails.status?.status;
        if (venueStatus) {
          setDetailTabs((tabs) =>
            tabs.map((tab) =>
              tab.name === "Venue Details"
                ? { ...tab, status: venueStatus }
                : tab,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch venue details:", err);
        setVenueDetails(null);
        setVenueError(err.message || "Failed to fetch venue details");
      } finally {
        setVenueLoading(false);
      }
    };

    fetchVenueDetails();
  }, [activeTab, eventId]);

  // ── Lazy fetch audio details ────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "Audio Details") return;

    const fetchAudioDetails = async () => {
      setAudioLoading(true);
      setAudioError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}?module=audio`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const payload = await res.json();
        if (!res.ok)
          throw new Error(payload.message || "Failed to fetch audio details");

        const eventData = payload.data || payload;
        if (!eventData.audioDetails)
          throw new Error("Audio details are not available");
        setAudioDetails(eventData.audioDetails);

        const audioStatus = eventData.audioDetails.status?.status;
        if (audioStatus) {
          setDetailTabs((tabs) =>
            tabs.map((tab) =>
              tab.name === "Audio Details"
                ? { ...tab, status: audioStatus }
                : tab,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch audio details:", err);
        setAudioDetails(null);
        setAudioError(err.message || "Failed to fetch audio details");
      } finally {
        setAudioLoading(false);
      }
    };

    fetchAudioDetails();
  }, [activeTab, eventId]);

  // ── Lazy fetch transport details ────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "Transportation Details") return;

    const fetchTransportDetails = async () => {
      setTransportLoading(true);
      setTransportError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}?module=transport`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const payload = await res.json();
        if (!res.ok)
          throw new Error(
            payload.message || "Failed to fetch transportation details",
          );

        const eventData = payload.data || payload;
        if (!eventData.transportDetails)
          throw new Error("Transportation details are not available");
        setTransportDetails(eventData.transportDetails);

        const transportStatus = eventData.transportDetails.status?.status;
        if (transportStatus) {
          setDetailTabs((tabs) =>
            tabs.map((tab) =>
              tab.name === "Transportation Details"
                ? { ...tab, status: transportStatus }
                : tab,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch transportation details:", err);
        setTransportDetails(null);
        setTransportError(
          err.message || "Failed to fetch transportation details",
        );
      } finally {
        setTransportLoading(false);
      }
    };

    fetchTransportDetails();
  }, [activeTab, eventId]);

  // ── Lazy fetch media details ────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "Media Details") return;

    const fetchMediaDetails = async () => {
      setMediaLoading(true);
      setMediaError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}?module=media`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const payload = await res.json();
        if (!res.ok)
          throw new Error(payload.message || "Failed to fetch media details");

        const eventData = payload.data || payload;
        if (!eventData.mediaRequirementDetails)
          throw new Error("Media details are not available");
        setMediaDetails(eventData.mediaRequirementDetails);

        const mediaRequirements =
          eventData.mediaRequirementDetails.mediaRequirements || [];
        const statuses = mediaRequirements
          .flatMap((requirement) =>
            (requirement.typeOfMedia || []).map(
              (type) => requirement[type]?.status,
            ),
          )
          .filter(Boolean);
        if (statuses.length) {
          setDetailTabs((tabs) =>
            tabs.map((tab) =>
              tab.name === "Media Details"
                ? { ...tab, status: statuses[0] }
                : tab,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch media details:", err);
        setMediaDetails(null);
        setMediaError(err.message || "Failed to fetch media details");
      } finally {
        setMediaLoading(false);
      }
    };

    fetchMediaDetails();
  }, [activeTab, eventId]);

  // ── Lazy fetch food details ─────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "Food Details") return;

    const fetchRefreshmentDetails = async () => {
      setRefreshmentLoading(true);
      setRefreshmentError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}?module=refreshment`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const payload = await res.json();
        if (!res.ok)
          throw new Error(payload.message || "Failed to fetch food details");

        const eventData = payload.data || payload;
        if (!eventData.refreshmentDetails)
          throw new Error("Food details are not available");
        setRefreshmentDetails(eventData.refreshmentDetails);

        const foodStatus = eventData.refreshmentDetails.status?.status;
        if (foodStatus) {
          setDetailTabs((tabs) =>
            tabs.map((tab) =>
              tab.name === "Food Details"
                ? { ...tab, status: foodStatus }
                : tab,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch food details:", err);
        setRefreshmentDetails(null);
        setRefreshmentError(err.message || "Failed to fetch food details");
      } finally {
        setRefreshmentLoading(false);
      }
    };

    fetchRefreshmentDetails();
  }, [activeTab, eventId]);

  // ── Lazy fetch ICTS details ─────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "ICTCS Details") return;

    const fetchIctsDetails = async () => {
      setIctsLoading(true);
      setIctsError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}?module=icts`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const payload = await res.json();
        if (!res.ok)
          throw new Error(payload.message || "Failed to fetch ICTS details");

        const eventData = payload.data || payload;
        if (!eventData.ictsDetails)
          throw new Error("ICTS details are not available");
        setIctsDetails(eventData.ictsDetails);

        const ictsStatus = eventData.ictsDetails.status?.status;
        if (ictsStatus) {
          setDetailTabs((tabs) =>
            tabs.map((tab) =>
              tab.name === "ICTCS Details"
                ? { ...tab, status: ictsStatus }
                : tab,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch ICTS details:", err);
        setIctsDetails(null);
        setIctsError(err.message || "Failed to fetch ICTS details");
      } finally {
        setIctsLoading(false);
      }
    };

    fetchIctsDetails();
  }, [activeTab, eventId]);

  // ── Lazy fetch accommodation details ────────────────────────────────
  useEffect(() => {
    if (activeTab !== "Accommodation Details") return;

    const fetchAccommodationDetails = async () => {
      setAccommodationLoading(true);
      setAccommodationError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}?module=accommodation`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const payload = await res.json();
        if (!res.ok)
          throw new Error(
            payload.message || "Failed to fetch accommodation details",
          );

        const eventData = payload.data || payload;
        if (!eventData.accommodationDetails)
          throw new Error("Accommodation details are not available");
        setAccommodationDetails(eventData.accommodationDetails);

        const accommodationStatus =
          eventData.accommodationDetails.status?.status;
        if (accommodationStatus) {
          setDetailTabs((tabs) =>
            tabs.map((tab) =>
              tab.name === "Accommodation Details"
                ? { ...tab, status: accommodationStatus }
                : tab,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch accommodation details:", err);
        setAccommodationDetails(null);
        setAccommodationError(
          err.message || "Failed to fetch accommodation details",
        );
      } finally {
        setAccommodationLoading(false);
      }
    };

    fetchAccommodationDetails();
  }, [activeTab, eventId]);

  // ── Lazy fetch purchase details ─────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "Purchase Details") return;

    const fetchPurchaseDetails = async () => {
      setPurchaseLoading(true);
      setPurchaseError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}?module=purchase`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const payload = await res.json();
        if (!res.ok)
          throw new Error(
            payload.message || "Failed to fetch purchase details",
          );

        const eventData = payload.data || payload;
        if (!eventData.purchaseDetails)
          throw new Error("Purchase details are not available");
        setPurchaseDetails(eventData.purchaseDetails);

        const purchaseStatus = eventData.purchaseDetails.status?.status;
        if (purchaseStatus) {
          setDetailTabs((tabs) =>
            tabs.map((tab) =>
              tab.name === "Purchase Details"
                ? { ...tab, status: purchaseStatus }
                : tab,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch purchase details:", err);
        setPurchaseDetails(null);
        setPurchaseError(err.message || "Failed to fetch purchase details");
      } finally {
        setPurchaseLoading(false);
      }
    };

    fetchPurchaseDetails();
  }, [activeTab, eventId]);

  // decoding token
  const token = localStorage.getItem("token");
  let decodedToken = jwtDecode(token);
  let role = decodedToken?.role;

  // ── Generic status update handler ─────────────────────────────────
  const updateStatus = async (action, reason = "") => {
    setActionLoading(action);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, ...(reason ? { reason } : {}) }),
      });
      const responseData = await res.json();
      if (!res.ok || !responseData.success)
        throw new Error(responseData.message || `Failed to ${action} event`);
      toast.success(
        `Event ${action === "adminApprove" ? "approved" : "rejected"} successfully`,
      );
      // Refetch the data to reflect the updated status
      fetchRequisitionDetails();
      return true;
    } catch (err) {
      toast.error(err.message || `Failed to ${action} event`);
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = () => {
    const normalizedRole = role?.toLowerCase().trim();

    const isSuperAdmin =
      normalizedRole === "super admin" ||
      normalizedRole === "super admin 1" ||
      normalizedRole === "super admin 2";

    const action =
      isSuperAdmin || normalizedRole === "admin"
        ? "adminApprove"
        : "hodApprove";

    updateStatus(action);
  };

  // Reject opens a popup to collect the rejection reason
  const handleReject = () => setShowRejectPopup(true);

  // ── Delete event handler ──────────────────────────────────────────
  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const responseData = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(responseData.message || "Failed to delete event");
      toast.success("Event deleted successfully");
      setShowDeleteConfirm(false);
      // Go back to the previous page after deletion
      navigate(-1);
    } catch (err) {
      toast.error(err.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    const ok = await updateStatus("reject", rejectReason.trim());
    if (ok) {
      setShowRejectPopup(false);
      setRejectReason("");
      // Reload the page so the UI reflects the updated status
      window.location.reload();
    }
  };

  // ── Render active panel based on tab ────────────────────────────────
  const renderActivePanel = () => {
    // Determine if we're in a loading/error state for the current module
    const isLoading = requisitionLoading;
    const isError = requisitionError;

    if (activeTab === "Event Requisition Details") {
      return <EventRequisitionDetailsPanel requestDetails={requestDetails} />;
    }

    if (activeTab === "Venue Details") {
      if (venueLoading)
        return (
          <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
            Loading venue details...
          </p>
        );
      if (venueError)
        return (
          <p className="py-10 text-center text-sm text-[#FF4F91]">
            {venueError}
          </p>
        );
      return (
        <VenueDetailsPanel
          venueDetails={venueDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      );
    }

    if (activeTab === "ICTCS Details") {
      if (ictsLoading)
        return (
          <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
            Loading ICTS details...
          </p>
        );
      if (ictsError)
        return (
          <p className="py-10 text-center text-sm text-[#FF4F91]">
            {ictsError}
          </p>
        );
      return (
        <IctcsDetailsPanel
          ictsDetails={ictsDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      );
    }

    if (activeTab === "Audio Details") {
      if (audioLoading)
        return (
          <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
            Loading audio details...
          </p>
        );
      if (audioError)
        return (
          <p className="py-10 text-center text-sm text-[#FF4F91]">
            {audioError}
          </p>
        );
      return (
        <AudioDetailsPanel
          audioDetails={audioDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      );
    }

    if (activeTab === "Transportation Details") {
      if (transportLoading)
        return (
          <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
            Loading transportation details...
          </p>
        );
      if (transportError)
        return (
          <p className="py-10 text-center text-sm text-[#FF4F91]">
            {transportError}
          </p>
        );
      return (
        <TransportationDetailsPanel
          transportDetails={transportDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      );
    }

    if (activeTab === "Food Details") {
      if (refreshmentLoading)
        return (
          <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
            Loading food details...
          </p>
        );
      if (refreshmentError)
        return (
          <p className="py-10 text-center text-sm text-[#FF4F91]">
            {refreshmentError}
          </p>
        );
      return (
        <FoodRefreshmentDetailsPanel
          refreshmentDetails={refreshmentDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      );
    }

    if (activeTab === "Accommodation Details") {
      if (accommodationLoading)
        return (
          <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
            Loading accommodation details...
          </p>
        );
      if (accommodationError)
        return (
          <p className="py-10 text-center text-sm text-[#FF4F91]">
            {accommodationError}
          </p>
        );
      return (
        <AccommodationDetailsPanel
          accommodationDetails={accommodationDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      );
    }

    if (activeTab === "Purchase Details") {
      if (purchaseLoading)
        return (
          <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
            Loading purchase details...
          </p>
        );
      if (purchaseError)
        return (
          <p className="py-10 text-center text-sm text-[#FF4F91]">
            {purchaseError}
          </p>
        );
      return (
        <PurchaseDetailsPanel
          purchaseDetails={purchaseDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      );
    }

    if (activeTab === "Media Details") {
      if (mediaLoading)
        return (
          <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
            Loading media details...
          </p>
        );
      if (mediaError)
        return (
          <p className="py-10 text-center text-sm text-[#FF4F91]">
            {mediaError}
          </p>
        );
      return <MediaDetailsPanel mediaDetails={mediaDetails} />;
    }

    return null;
  };

  // jsx
  return (
    <>
      <main className="px-6 pb-8 ">
        {/* Breadcrumb */}
        {/* <div className="flex items-center gap-2 py-3 text-sm text-[#CBC3D7]/50">
            <Link to="/dashboard-admin" className="hover:text-white transition-colors">
              Admin Dashboard
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#D0BCFF]">Event Details</span>
            {requestDetails?.eventDetails?.eventName && (
              <>
                <ChevronRight size={14} />
                <span className="text-[#D0BCFF]">{requestDetails.eventDetails.eventName}</span>
              </>
            )}
          </div> */}

        {/* Header with Approve / Reject */}
        {/* {console.log("event details : ", data)} */}
        <header className="flex items-center justify-between mt-2 ">
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-md font-medium text-[#CBC3D7]/50">
              Event Details
            </h1>
            <ChevronRight size={14} className="text-white" />
            <h2 className="text-md font-medium text-[#D0BCFF]">
              {requestDetails?.eventDetails?.eventName || "Loading..."}
            </h2>
            <ChevronRight size={14} className="text-white" />
            {/* edit button  */}

            <div className="status-container">
              {activeTabConfig?.status && (
                <span
                  className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium ${getStatusClassName(activeTabConfig.status)}`}
                >
                  {activeTabConfig?.status}
                </span>
              )}
            </div>

            {role.toLowerCase() == "hod" ? (
              ""
            ) : (
              <>
                {data?.status?.toLowerCase() !== "closed" && (
                  <Link
                    to={`/forms/edit/${eventId}`}
                    className="flex items-center gap-2 text-white text-sm bg-[#2e3c5cce] hover:bg-[#263352ce]  px-2 py-2 rounded-lg cursor-pointer "
                  >
                    <Pencil size={14} className="text-[#34D399]  " />
                  </Link>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete event"
                  className="bg-[#2e3c5cce] px-2 py-2 rounded-lg cursor-pointer hover:bg-[#263352ce]"
                >
                  <Trash size={14} className="text-red-500" />
                </button>
              </>
            )}

            {requestDetails?.eventDetails?.organizingDepartment && (
              <div className="ml-3 bg-green-400/10 text-sm text-[#10B981] px-5 py-2 rounded-full">
                <h1>{requestDetails.eventDetails.organizingDepartment}</h1>
              </div>
            )}
          </div>
          {String(data?.status || "").toLowerCase() === "closed" ? (
            <div className="flex items-center gap-1 bg-gradient-to-r from-[#07785D] to-[#07785D] text-white px-4 py-1 rounded-md">
              <Check size={16} className="text-white" />
              Closed
            </div>
          ) : data?.adminApproval == false ? (
            <div className="btn-container flex items-center gap-2">
              <button
                onClick={handleApprove}
                disabled={actionLoading !== null}
                className="flex items-center gap-1 bg-gradient-to-r from-[#07785D] to-[#07785D] text-white px-4 py-1 rounded-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  <Check size={16} className="text-white" />
                </span>{" "}
                {actionLoading === "adminApprove" ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading !== null}
                className="flex items-center gap-2 text-[#FF0063] px-4 py-1 rounded-md border border-[#FF0063] hover:bg-[#FF0063]/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  <X size={14} className="text-[#FF0063]" />
                </span>{" "}
                {actionLoading === "reject" ? "Processing..." : "Reject"}
              </button>
            </div>
          ) : (
            ""
          )}
        </header>

        {/* Status summary bar */}
        {detailTabs.length > 0 && (
          <div className="mt-3 mb-2 flex items-center gap-6 text-[10px] font-medium text-[#CBC3D7]/65">
            {(() => {
              const counts = { acknowledged: 0, pending: 0, completed: 0 };
              detailTabs.forEach((t) => {
                const s = String(t.status || "").toLowerCase();
                if (s.includes("acknowledged")) counts.acknowledged++;
                else if (s.includes("pending")) counts.pending++;
                else if (s.includes("completed")) counts.completed++;
              });
              return (
                <>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#25A987]" />
                    ACKNOWLEDGED ({counts.acknowledged})
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#B32058]" />
                    PENDING ({counts.pending})
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#6D3BD8]" />
                    COMPLETED ({counts.completed})
                  </span>
                </>
              );
            })()}
          </div>
        )}

        {/* Main content: sidebar + panel */}
        <section className="mt-2 flex min-h-[calc(100vh-160px)] gap-2">
          <EventDetailsSidePanel
            tabs={detailTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="flex-1 overflow-auto rounded-lg border border-[#27334c] bg-[#151d31] p-5 table-custom-scrollbar max-h-[calc(100vh-130px)]">
            {requisitionLoading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
                Loading event details...
              </p>
            ) : requisitionError ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">
                {requisitionError}
              </p>
            ) : activeTabConfig ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-[#8B3DFF]">
                      {activeTab}
                    </h2>
                    <p className="mt-2 text-xs leading-6 text-[#CBC3D7]/55">
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry.
                    </p>
                  </div>
                </div>
                <div className="mt-8">{renderActivePanel()}</div>
              </>
            ) : (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
                No details available for this event.
              </p>
            )}
          </main>
        </section>
      </main>

      {/* Rejection reason popup */}
      {showRejectPopup && (
        <RejectionReasonPopup
          value={rejectReason}
          onChange={setRejectReason}
          onSubmit={handleRejectConfirm}
          submitting={actionLoading === "reject"}
          onClose={() => {
            setShowRejectPopup(false);
            setRejectReason("");
          }}
        />
      )}

      {/* Delete confirmation popup */}
      {showDeleteConfirm && (
        <DeleteConfirmationPopup
          title="Delete Event"
          message="Are you sure you want to delete this event? This action cannot be undone."
          deleting={deleting}
          onCancel={() => setShowDeleteConfirm(false)}
          onDelete={handleDeleteEvent}
        />
      )}
    </>
  );
};

export default EventDetailsPage;
