import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search,
  Check,
  ChevronDown,
  CalendarDays,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { mapSettlementData } from "../../../utils/settlementMapper.js";
import { generateSettlementPdf } from "../../../utils/settlementPdfGenerator.js";

// ══════════════════════════════════════════════════════════════════════════════
// TAB CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const TABS = ["Event expenditures", "Individual expenditures"];

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN EXPENDITURE TABLE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

const AdminExpenditureTable = () => {
  // ── Authentication Token ─────────────────────────────────────────────────
  const token = localStorage.getItem("token");

  // ── State Variables ──────────────────────────────────────────────────────
  const [selectedTab, setSelectedTab] = useState("Event expenditures");
  const [eventsExpenditureData, setEventsExpenditureData] = useState([]);
  const [individualExpenditureData, setIndividualExpenditureData] = useState([]);

  // ── Search State Variables ───────────────────────────────────────────────
  const [eventsSearchQuery, setEventsSearchQuery] = useState("");
  const [individualSearchQuery, setIndividualSearchQuery] = useState("");

  // ── PDF Download State ─────────────────────────────────────────────────
  const [downloadingEventId, setDownloadingEventId] = useState(null);

  // ══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Format a date value to DD/MM/YYYY format
   * @param {string} dateValue - The date string to format
   * @returns {string} Formatted date or "-" if invalid
   */
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

  /**
   * Get status color classes based on status text
   * @param {string} status - The status text
   * @returns {object} Object with text and dot color classes
   */
  const getStatusColor = (status = "") => {
    const normalizedStatus = String(status).toLowerCase();

    if (normalizedStatus.includes("rejected")) {
      return { text: "text-red-400", dot: "bg-red-400" };
    }

    if (normalizedStatus.includes("acknowledged")) {
      return { text: "text-emerald-400", dot: "bg-emerald-400" };
    }

    if (normalizedStatus.includes("approved")) {
      return { text: "text-emerald-400", dot: "bg-emerald-400" };
    }

    if (normalizedStatus.includes("pending")) {
      return { text: "text-pink-600", dot: "bg-pink-600" };
    }

    if (normalizedStatus.includes("submitted")) {
      return { text: "text-yellow-400", dot: "bg-yellow-400" };
    }

    if (normalizedStatus.includes("completed")) {
      return { text: "text-emerald-400", dot: "bg-emerald-400" };
    }

    return { text: "text-white", dot: "bg-white" };
  };

  // ══════════════════════════════════════════════════════════════════════════
  // FILTERED DATA (Memoized for performance)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Filter events expenditure data based on search query
   * Searches in: eventName, eventType, status
   */
  const filteredEventsData = useMemo(() => {
    if (!eventsSearchQuery.trim()) {
      return eventsExpenditureData;
    }

    const query = eventsSearchQuery.toLowerCase().trim();

    return eventsExpenditureData.filter((item) => {
      const eventName = item?.basicDetails?.eventName?.toLowerCase() || "";
      const eventType =
        item?.eventId?.requestDetails?.eventDetails?.eventType?.toLowerCase() ||
        "";
      const status = item?.eventId?.documentExpenditureApproved
        ? "approved"
        : "pending";

      return (
        eventName.includes(query) ||
        eventType.includes(query) ||
        status.includes(query)
      );
    });
  }, [eventsExpenditureData, eventsSearchQuery]);

  /**
   * Filter individual expenditure data based on search query
   * Searches in: module, department, status
   */
  const filteredIndividualData = useMemo(() => {
    if (!individualSearchQuery.trim()) {
      return individualExpenditureData;
    }

    const query = individualSearchQuery.toLowerCase().trim();

    return individualExpenditureData.filter((item) => {
      const module = item?.module?.toLowerCase() || "";
      const department = item?.faculty?.department?.toLowerCase() || "";
      const status =
        item?.expenditure?.approvalStatus?.toLowerCase() || "";

      return (
        module.includes(query) ||
        department.includes(query) ||
        status.includes(query)
      );
    });
  }, [individualExpenditureData, individualSearchQuery]);

  // ══════════════════════════════════════════════════════════════════════════
  // API FETCH FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Fetch individual expenditure list from API
   */
  const fetchIndividualList = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/individual/expenditure/overall`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("individual expenditure list : ", res.data.data);
      setIndividualExpenditureData(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Fetch events expenditure list from API
   */
  const fetchEventsList = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/event-expenditures`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("events expenditure list : ", res.data.data);
      setEventsExpenditureData(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PDF DOWNLOAD HANDLER
  // ══════════════════════════════════════════════════════════════════════════

  const downloadSettlementPdf = useCallback(
    async (eventId) => {
      if (!eventId) {
        toast.error("Invalid event ID");
        return;
      }

      setDownloadingEventId(eventId);

      try {
        await generateSettlementPdf(eventId, token, mapSettlementData);
        toast.success("PDF downloaded successfully!");
      } catch (err) {
        console.error("Settlement PDF generation failed:", err);
        toast.error(
          err.message || "Failed to generate PDF. Please try again."
        );
      } finally {
        setDownloadingEventId(null);
      }
    },
    [token]
  );

  // ══════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    fetchIndividualList();
    fetchEventsList();
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER - MAIN CONTAINER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="header mx-7 mt-4">
        <h1 className="text-xl font-medium text-white">Expenditure List</h1>

        {/* ── Tab Navigation ──────────────────────────────────────────────── */}
        <div className="tabs mt-4 flex items-center gap-3 text-white border-b border-gray-600">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`pb-3 px-3 ${
                selectedTab === tab
                  ? "border-b border-violet-700 text-violet-500 font-semibold"
                  : "cursor-pointer"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* EVENTS EXPENDITURE TABLE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {selectedTab === "Event expenditures" && (
        <div className="w-[96%] mt-4 m-auto bg-[#171f31] rounded-xl">
          {/* ── Events Header with Count and Search ──────────────────────────── */}
          <div className="flex items-center justify-between px-3 py-3">
            {/* Title with Count */}
            <h2 className="text-[18px] text-white font-medium">
              Events Expenditure List{" "}
              <span className="text-[#a855f7]">
                ({filteredEventsData.length})
              </span>
            </h2>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-[275px] items-center gap-2 rounded-full border border-[#30394d] bg-[#222b3e] py-4 px-3">
                <Search size={14} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, type, status..."
                  value={eventsSearchQuery}
                  onChange={(e) => setEventsSearchQuery(e.target.value)}
                  className="w-full text-[14px] text-white outline-none placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* ── Events Table ────────────────────────────────────────────────── */}
          <div className="w-full rounded-md border border-[#252d40] max-h-[calc(100vh-270px)] overflow-auto bg-[#151d30]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="h-[34px] bg-[#192235]">
                  <th className="px-3 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Event Name
                  </th>
                  <th className="px-3 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Event Date
                  </th>
                  <th className="px-3 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Event Type
                  </th>
                  <th className="px-3 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Submission Date
                  </th>
                  <th className="px-3 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Status
                  </th>
                  <th className="px-3 text-center text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEventsData.length > 0 ? (
                  filteredEventsData.map((item, index) => (
                    <tr
                      key={index}
                      className="h-[40px] border-t border-[#252d40] hover:bg-[#192235]"
                    >
                      {/* Event Name */}
                      <td className="px-3 text-[14px] font-medium text-white">
                        {item?.basicDetails?.eventName}
                      </td>

                      {/* Event Date */}
                      <td className="px-3 text-[14px] text-[#d1d5db] flex items-center gap-2">
                        <span className="mt-2">
                          {formatDate(
                            item?.eventId?.requestDetails?.eventDetails
                              ?.eventSchedule[0].eventDate
                          )}
                        </span>

                        {/* Show "+N" if multiple dates */}
                        {item?.eventId?.requestDetails?.eventDetails
                          ?.eventSchedule.length > 1 && (
                          <div className="relative mt-1 group">
                            <button
                              type="button"
                              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#374151] px-1.5 text-[11px] font-medium text-white"
                            >
                              +
                              {item?.eventId?.requestDetails?.eventDetails
                                ?.eventSchedule.length - 1}
                            </button>

                            {/* Tooltip with all dates */}
                            <div className="pointer-events-none absolute left-0 -top-10 z-50 mt-2 hidden w-max -translate-x-1/2 rounded-md bg-[#1f2937] px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                              <div className="space-y-1">
                                {item?.eventId?.requestDetails?.eventDetails.eventSchedule.map(
                                  (schedule, idx) => (
                                    <div key={idx}>
                                      {formatDate(schedule.eventDate)}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Event Type */}
                      <td className="px-3 text-[14px] text-[#d1d5db]">
                        {item.eventId?.requestDetails?.eventDetails?.eventType}
                      </td>

                      {/* Submission Date */}
                      <td className="px-3 text-[14px] text-[#d1d5db]">
                        {formatDate(item?.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-3">
                        <div
                          className={`flex items-center gap-1 text-[14px] font-medium ${
                            item?.eventId?.documentExpenditureApproved
                              ? "text-[#00d69b]"
                              : "text-[#e90067]"
                          }`}
                        >
                          <span
                            className={`h-[5px] w-[5px] rounded-full ${
                              item?.eventId?.documentExpenditureApproved
                                ? "bg-[#00d69b]"
                                : "bg-[#e90067]"
                            }`}
                          />
                          {item?.eventId?.documentExpenditureApproved
                            ? "Approved"
                            : "Pending"}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-3">
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            to={`/dashboard-admin/expenditures/EventExpenditureDetailView/${item?.eventId?._id}`}
                            type="button"
                            className="text-[#8b93a5] transition hover:text-white"
                          >
                            <ExternalLink size={13} strokeWidth={1.8} />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              downloadSettlementPdf(item?.eventId?._id)
                            }
                            disabled={
                              downloadingEventId === item?.eventId?._id
                            }
                            className="text-[#8b93a5] transition hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingEventId === item?.eventId?._id ? (
                              <Loader2 size={13} strokeWidth={1.8} className="animate-spin" />
                            ) : (
                              <Download size={13} strokeWidth={1.8} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Empty State */
                  <tr>
                    <td colSpan="6" className="px-3 py-8 text-center">
                      <p className="text-[14px] text-gray-500">
                        No events expenditure found
                        {eventsSearchQuery && ` for "${eventsSearchQuery}"`}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* INDIVIDUAL EXPENDITURE TABLE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {selectedTab === "Individual expenditures" && (
        <div className="w-[96%] mt-4 m-auto bg-[#171f31] rounded-xl">
          {/* ── Individual Header with Count and Search ──────────────────────── */}
          <div className="flex items-center justify-between px-3 py-3">
            {/* Title with Count */}
            <h2 className="text-[18px] text-white font-medium">
              Individual Expenditure List{" "}
              <span className="text-[#a855f7]">
                ({filteredIndividualData.length})
              </span>
            </h2>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-[275px] items-center gap-2 rounded-full border border-[#30394d] bg-[#222b3e] py-4 px-3">
                <Search size={14} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by module, dept, status..."
                  value={individualSearchQuery}
                  onChange={(e) => setIndividualSearchQuery(e.target.value)}
                  className="w-full text-[14px] text-white outline-none placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* ── Individual Table ────────────────────────────────────────────── */}
          <div className="w-full rounded-md border border-[#252d40] max-h-[calc(100vh-270px)] overflow-auto bg-[#151d30]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="h-[48px] bg-[#192235]">
                  <th className="px-3 text-left text-[14px] font-medium uppercase text-[#777f91]">
                    Individual Request Name
                  </th>
                  <th className="px-3 text-left text-[14px] font-medium uppercase text-[#777f91]">
                    Requested Date
                  </th>
                  <th className="px-3 text-left text-[14px] font-medium uppercase text-[#777f91]">
                    Department
                  </th>
                  <th className="px-3 text-left text-[14px] font-medium uppercase text-[#777f91]">
                    Expenditure Submission Date
                  </th>
                  <th className="px-3 text-left text-[14px] font-medium uppercase text-[#777f91]">
                    Status
                  </th>
                  <th className="px-3 text-center text-[14px] font-medium uppercase text-[#777f91]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredIndividualData.length > 0 ? (
                  filteredIndividualData.map((item, index) => (
                    <tr
                      key={index}
                      className="h-[50px] border-b border-[#252d40]"
                    >
                      {/* Module Name */}
                      <td className="px-3 text-[14px] font-medium text-white">
                        {item?.module}
                      </td>

                      {/* Requested Date */}
                      <td className="px-3 text-[14px] text-[#d1d5db]">
                        15-03-2026
                      </td>

                      {/* Department */}
                      <td className="px-3 text-[14px] text-[#d1d5db]">
                        {item?.faculty?.department}
                      </td>

                      {/* Expenditure Submission Date */}
                      <td className="px-3 text-[14px] text-[#d1d5db]">
                        {formatDate(item?.expenditure?.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-3">
                        <div
                          className={`flex items-center gap-1 text-[14px] font-medium ${
                            getStatusColor(item?.expenditure?.approvalStatus)
                              .text
                          }`}
                        >
                          <span
                            className={`h-[5px] w-[5px] rounded-full ${
                              getStatusColor(item?.expenditure?.approvalStatus)
                                .dot
                            }`}
                          />
                          {item?.expenditure?.approvalStatus}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-3">
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            to={`/dashboard-admin/expenditures/IndividualExpenditureDetailView/${item?.expenditure?._id}`}
                            className="text-[#8b93a5] hover:text-white"
                          >
                            <ExternalLink size={13} strokeWidth={1.8} />
                          </Link>

                          <button
                            type="button"
                            className="text-[#8b93a5] hover:text-white"
                          >
                            <Download size={13} strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Empty State */
                  <tr>
                    <td colSpan="6" className="px-3 py-8 text-center">
                      <p className="text-[14px] text-gray-500">
                        No individual expenditure found
                        {individualSearchQuery &&
                          ` for "${individualSearchQuery}"`}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminExpenditureTable;
