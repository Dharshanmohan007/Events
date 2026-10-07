import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const tabs = ["Events", "Individuals"];

const TicketingUpcommingTable = () => {
  const navigate = useNavigate();

  // states
  const [selectedTab, setSelectedTab] = useState("Events");
  const [individualTicketingData, setIndividualTicketingData] = useState([]);

  // transport event data from the api (will be used in the events table later)
  // eslint-disable-next-line no-unused-vars
  const [eventTicketingData, setEventTicketingData] = useState([]);
  const [individualLoading, setIndividualLoading] = useState(false);
  const [individualError, setIndividualError] = useState("");

  // function to fetch transport event data from the api
  const fetchEventTicketingData = () => {
    const token = localStorage.getItem("token");
    fetch(
      `${API_BASE_URL}/api/table/dashboard-table?module=externalTransports`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch event requests");
        return response.json();
      })
      .then((data) => {
        // log the data to check what the api returned

        // store the data in state
        setEventTicketingData(data.data);
      })
      .catch((error) => {
        console.log("error while fetching transport event data : ", error);
      });
  };

  console.log("transport event data : ", eventTicketingData);

  // Individual external transport requests are submitted as individual submissions.
  const fetchIndividualTicketingData = async () => {
    const token = localStorage.getItem("token");
    setIndividualLoading(true);
    setIndividualError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/individual-submissions/getrequest/`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Failed to fetch individual requests");
      }

      const records = Array.isArray(result.data)
        ? result.data
        : result.data?.requests || result.data?.tickets || result.requests || [];
      const externalTransportRequests = records.filter((request) => {
        const requestData = request?.data || request;
        return (
          requestData?.externalTransportRequired === true ||
          request?.module?.toLowerCase() === "externaltransports" ||
          request?.formType?.toLowerCase() === "externaltransport"
        );
      });
      setIndividualTicketingData(externalTransportRequests);
    } catch (error) {
      setIndividualError(error.message || "Failed to fetch individual requests");
      setIndividualTicketingData([]);
    } finally {
      setIndividualLoading(false);
    }
  };

  // when the tab changes, call the fetch function based on the selected tab
  useEffect(() => {
    if (selectedTab === "Events") {
      fetchEventTicketingData();
    }

    if (selectedTab === "Individuals") {
      fetchIndividualTicketingData();
    }
  }, [selectedTab]);

  // status color denotion function

  const getStatusColor = (status = "") => {
    const normalizedStatus = String(status).toLowerCase();
    if (normalizedStatus.includes("pending") || normalizedStatus.includes("reject")) {
      return "text-red-500";
    }
    if (
      normalizedStatus.includes("acknowledged") ||
      normalizedStatus.includes("completed") ||
      normalizedStatus.includes("approved")
    ) {
      return "text-green-500";
    }
    return "text-[#b0b7c5]";
  };

  return (
    <div className="w-full rounded-md border min-h-[calc(100vh-320px)] border-[#283247] bg-[#151e2e] p-4 shadow-lg">
      {/* Header and Events / Individuals tabs */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-medium text-white">
          Upcoming {selectedTab == "Events" ? "Event" : "Individual"} Requests
        </h2>
        <div className="flex items-center gap-2 rounded-lg border border-[#283247] bg-[#101827] p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedTab(tab)}
              className={`rounded-md px-4 py-2 text-sm transition ${
                selectedTab === tab
                  ? "bg-[#6d3bd8] text-white"
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      {selectedTab === "Events" && (
        <div className="overflow-x-auto table-custom-scrollbar  border max-h-[calc(100vh-400px)] overflow-auto border-gray-700 rounded-lg">
          <table className="w-full border-gray-700 rounded-lg border-collapse">
            <thead className="bg-gray-800 z-20 sticky top-0">
              <tr className="border-b border-[#252f41]">
                <th className="px-2 py-4 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Event Name
                </th>

                <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Type
                </th>

                <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Required Date
                </th>

                <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Department
                </th>

                <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Acknowledge Status
                </th>

                <th className="px-2 py-2 text-center text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="text-[14px]">
              {eventTicketingData?.length > 0 ? (
                eventTicketingData.map((item, index) => {
                  return (
                    <tr
                      key={item?._id || index}
                      className="border-b border-[#202a3b] transition hover:bg-[#1a2435]"
                    >
                      {/* Event Name */}
                      <td
                        className="max-w-[100px] truncate px-2 py-3 text-[#d2d6de]"
                        title={item?.eventName}
                      >
                        {item?.eventName || "-"}
                      </td>

                      {/* Event Type */}
                      <td className="px-2 py-3 text-[#b0b7c5]">
                        {item?.eventType || "-"}
                      </td>

                      {/* Dates */}
                      <td className="px-2 py-3 text-[#b0b7c5]">
                        <div className="flex items-center gap-2">
                          {/* First Date */}
                          <span>
                            {item?.dates?.[0]
                              ? new Date(item.dates[0])
                                  .toLocaleDateString("en-GB")
                                  .replaceAll("/", "-")
                              : "-"}
                          </span>

                          {/* Remaining Dates */}
                          {item?.dates?.length > 1 && (
                            <div className="group relative">
                              <div className="flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-md bg-gray-700 px-1 text-xs text-white">
                                +{item.dates.length - 1}
                              </div>

                              {/* Hover Tooltip */}
                              <div className="absolute left-0 top-8 z-50 hidden min-w-[150px] rounded-md border border-gray-600 bg-[#1f2937] p-2 shadow-lg group-hover:block">
                                {item.dates.slice(1).map((date, dateIndex) => (
                                  <div
                                    key={dateIndex}
                                    className="whitespace-nowrap py-1 text-sm text-[#b0b7c5]"
                                  >
                                    {new Date(date)
                                      .toLocaleDateString("en-GB")
                                      .replaceAll("/", "-")}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Organizing Department */}
                      <td className="px-2 py-3 text-[#b0b7c5]">
                        {item?.organizingDepartment || "-"}
                      </td>

                      {/* Department Status */}
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex items-center ${getStatusColor(
                            item?.departmentStatus,
                          )}`}
                        >
                          <span className="mr-1">●</span>

                          {item?.departmentStatus || "-"}
                        </span>
                      </td>

                      {/* View Button */}
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => {
                            navigate(`/ticketing-dashboard/event-request/${item?.eventId}`);
                          }}
                          className="text-[#aab3c3] hover:text-white"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-2 py-10 text-center text-[#8b95a7]"
                  >
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Individuals Table */}
      {selectedTab === "Individuals" && (
        <div className="overflow-x-auto table-custom-scrollbar  border max-h-[calc(100vh-400px)] overflow-auto border-gray-700 rounded-lg">
          <table className="w-full border-gray-700 rounded-lg border-collapse">
            <thead className="bg-gray-800 sticky top-0">
              <tr className="border-b border-[#252f41]">
                <th className="px-2 py-4 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Date
                </th>

                <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Employee Name
                </th>

                <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Request No.
                </th>

                <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Department
                </th>

                <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Status
                </th>

                <th className="px-2 py-2 text-center text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="text-[14px]  ">
              {individualLoading ? (
                <tr><td colSpan={6} className="px-2 py-10 text-center text-[#8b95a7]">Loading individual requests...</td></tr>
              ) : individualError ? (
                <tr><td colSpan={6} className="px-2 py-10 text-center text-red-400">{individualError}</td></tr>
              ) : individualTicketingData.length === 0 ? (
                <tr><td colSpan={6} className="px-2 py-10 text-center text-[#8b95a7]">No individual requests found</td></tr>
              ) : individualTicketingData.map((request, index) => {
                const requestData = request?.data || request;
                const employee = request?.employeeDetail ||
                  (typeof request?.employee === "object" ? request.employee : null) ||
                  requestData?.employee || {};
                const employeeName = [employee?.salutation, employee?.firstName || employee?.name, employee?.lastName]
                  .filter(Boolean).join(" ") || request?.employeeName || request?.employeeEmail || "-";
                const requestId = request?.requestId || request?.id || request?._id || requestData?._id;
                  const rawStatus = request?.headApproval?.status || requestData?.headApproval?.status ||
                    request?.status || request?.finalStatus || "Pending";
                  const requestStatus = typeof rawStatus === "string"
                    ? rawStatus
                    : rawStatus?.status || "Pending";
                const requestDate = request?.requestDate || request?.createdAt;
                return (
              <tr key={requestId || index} className="border-b border-[#202a3b] transition hover:bg-[#1a2435]">
                <td className="px-2 py-3 text-[#d2d6de]">{requestDate ? new Date(requestDate).toLocaleDateString("en-GB").replaceAll("/", "-") : "-"}</td>
                <td className="px-2 py-3 text-[#b0b7c5]">{employeeName}</td>
                <td className="px-2 py-3 text-[#b0b7c5]">{request?.requestNo || "External Transport"}</td>
                <td className="px-2 py-3 text-[#b0b7c5]">{employee?.department || requestData?.departmentCode || request?.department || "-"}</td>

                <td className="px-2 py-2">
                  <span className={getStatusColor(requestStatus)}>
                    <span className="mr-1">●</span>
                    {requestStatus}
                  </span>
                </td>

                <td className="px-2 py-2 text-center">
                  <button type="button" disabled={!requestId} onClick={() => requestId && navigate(`/dashboard/IndividualEvents/${requestId}`)} className="text-[#aab3c3] hover:text-white disabled:opacity-40">
                    <ArrowUpRight size={18} />
                  </button>
                </td>
              </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketingUpcommingTable;
