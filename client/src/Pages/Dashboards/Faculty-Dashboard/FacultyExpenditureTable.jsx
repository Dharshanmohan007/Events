import React, { useState, useEffect, useMemo } from "react";
import { Search, CalendarDays, ExternalLink, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const tabs = ["Event expenditures", "Individual expenditures"];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FacultyExpenditureTable = () => {
  // ── Authentication ──────────────────────────────────────────────────────
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const facultyId = decoded.facultyId || decoded.id || decoded._id;

  // ── State Variables ──────────────────────────────────────────────────────
  const [individualExpenditureList, setIndividualExpenditureList] = useState(
    [],
  );
  const [eventsExpenditureData, setEventsExpenditureData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Event expenditures");
  const [searchQuery, setSearchQuery] = useState("");


  const getStatusColor = (status = "") => {
  const normalizedStatus = String(status).toLowerCase();

  if (normalizedStatus.includes("rejected")) {
    return {
      text: "text-red-400",
      dot: "bg-red-400",
    };
  }

  if (normalizedStatus.includes("acknowledged")) {
    return {
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    };
  }

  if (normalizedStatus.includes("approved")) {
    return {
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    };
  }

  if (normalizedStatus.includes("pending")) {
    return {
      text: "text-pink-600",
      dot: "bg-pink-600",
    };
  }

  if (normalizedStatus.includes("submitted")) {
    return {
      text: "text-yellow-400",
      dot: "bg-yellow-400",
    };
  }
  if (normalizedStatus.includes("completed")) {
    return {
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    };
  }

  return {
    text: "text-white",
    dot: "bg-white",
  };
};

  // ── Fetch Event Expenditures from API ────────────────────────────────────
  useEffect(() => {
    const fetchEventExpenditures = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/event-expenditures/faculty/${facultyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setEventsExpenditureData(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch faculty event expenditures:", error);
      }
    };

    if (facultyId) {
      fetchEventExpenditures();
    }
  }, [facultyId, token]);

  // ── Fetch Individual Expenditures from API ──────────────────────────────
  useEffect(() => {
    const fetchIndividualExpenditures = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/individual/expenditure`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log(
          "Faculty Individual Expenditures response :",
          res.data.data,
        );
        setIndividualExpenditureList(res.data.data || []);
      } catch (error) {
        console.error(
          "Failed to fetch faculty individual expenditures:",
          error,
        );
      }
    };

    if (facultyId) {
      fetchIndividualExpenditures();
    }
  }, [facultyId, token]);

  // ── Filtered data for search ──────────────────────────────────────────────
  const filteredEventsData = useMemo(() => {
    if (!searchQuery.trim()) return eventsExpenditureData;
    const q = searchQuery.toLowerCase();
    return eventsExpenditureData.filter((item) => {
      const eventName = item?.basicDetails?.eventName || "";
      const eventType = item?.eventId?.requestDetails?.eventDetails?.eventType || "";
      const status = item?.eventId?.documentExpenditureApproved ? "approved" : "pending";
      return (
        eventName.toLowerCase().includes(q) ||
        eventType.toLowerCase().includes(q) ||
        status.toLowerCase().includes(q)
      );
    });
  }, [eventsExpenditureData, searchQuery]);

  const filteredIndividualData = useMemo(() => {
    if (!searchQuery.trim()) return individualExpenditureList;
    const q = searchQuery.toLowerCase();
    return individualExpenditureList.filter((item) => {
      const module = item?.module || "";
      const department = item?.faculty?.department || "";
      const status = item?.expenditure?.approvalStatus || "";
      return (
        module.toLowerCase().includes(q) ||
        department.toLowerCase().includes(q) ||
        status.toLowerCase().includes(q)
      );
    });
  }, [individualExpenditureList, searchQuery]);

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

  return (
    <>
      <div className="header mt-4">
        <h1 className="text-xl font-medium text-white">Expenditure List</h1>

        <div className="tabs mt-4 flex items-center gap-3 text-white border-b border-gray-600">
          {tabs.map((item) => {
            return (
              <button
                key={item}
                onClick={() => {
                  setSelectedTab(item);
                  setSearchQuery("");
                }}
                className={`pb-3 px-3 ${
                  selectedTab === item
                    ? "border-b border-violet-700 text-violet-500 font-semibold"
                    : "cursor-pointer"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* -------------------------- Events expenditure table  ----------------------- */}
      {selectedTab === "Event expenditures" ? (
        <div className="w-[100%] mt-4 m-auto bg-[#171f31] rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-3">
            <h2 className="text-[18px] text-white font-medium">
              Events Expenditure List{" "}
              <span className="text-[#a855f7]">
                ({filteredEventsData.length})
              </span>
            </h2>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex h-7 w-[275px] items-center gap-2 rounded-full border border-[#30394d] bg-[#222b3e] py-4 px-3">
                <Search size={14} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search events, venues"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-[14px] text-white outline-none placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
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
                      key={item._id || index}
                      className="h-[50px] border-t border-[#252d40] hover:bg-[#192235]"
                    >
                      <td className="px-3 text-[14px] font-medium text-white">
                        {item?.basicDetails?.eventName}
                      </td>
                      {/* Event Date */}
                      <td className="px-3 text-[14px] text-[#d1d5db] flex items-center gap-2">
                        <span className="mt-2">
                          {formatDate(
                            item?.eventId?.requestDetails?.eventDetails
                              ?.eventSchedule[0].eventDate,
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
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 text-[14px] text-[#d1d5db]">
                        {item?.eventId?.requestDetails?.eventDetails?.eventType}
                      </td>
                      <td className="px-3 text-[14px] text-[#d1d5db]">
                        {formatDate(item?.createdAt)}
                      </td>
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
                      <td className="px-3">
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            to={`/dashboard-faculty/expenditures/EventExpenditureDetailView/${item.eventId?._id}`}
                            type="button"
                            className="text-[#8b93a5] transition hover:text-white"
                          >
                            <ExternalLink size={13} strokeWidth={1.8} />
                          </Link>
                          <button
                            type="button"
                            className="text-[#8b93a5] transition hover:text-white"
                          >
                            <Download size={13} strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-[14px] text-[#7d8495]"
                    >
                      No event expenditures found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* -------------------------- Individual expenditure table  ----------------------- */
        <div className="w-[100%] mt-4 m-auto bg-[#171f31] rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-3">
            <h2 className="text-[18px] text-white font-medium">
              Individual Expenditure List{" "}
              <span className="text-[#a855f7]">
                ({filteredIndividualData.length})
              </span>
            </h2>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex h-7 w-[275px] items-center gap-2 rounded-full border border-[#30394d] bg-[#222b3e] py-4 px-3">
                <Search size={14} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search individual expenditures"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-[14px] text-white outline-none placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

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
                  filteredIndividualData.map((item) => {
                  return (
                    <tr className="h-[50px] border-b border-[#252d40] hover:bg-[#192235]">
                      <td className="px-3 text-[14px] font-medium text-white">
                        {item?.module}
                      </td>
                      <td className="px-3 text-[14px] text-[#d1d5db]">
                        {formatDate(item?.requestDate)}
                      </td>
                      <td className="px-3 text-[14px] text-[#d1d5db]">
                        {item?.faculty?.department}
                      </td>
                      <td className="px-3 text-[14px] text-[#d1d5db]">
                        {formatDate(item?.expenditure?.createdAt)}
                      </td>
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
                      <td className="px-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            className="text-[#8b93a5] hover:text-white"
                          >
                            <ExternalLink size={13} strokeWidth={1.8} />
                          </button>
                          <button
                            type="button"
                            className="text-[#8b93a5] hover:text-white"
                          >
                            <Download size={13} strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-[14px] text-[#777f91]"
                    >
                      No individual expenditures found
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

export default FacultyExpenditureTable;
