import React, { useEffect, useState } from "react";
import { Filter, ArrowUpRight, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const tabs = ["Events"];

const TicketingUpcommingTable = () => {
  const navigate = useNavigate();

  // states
  const [selectedTab, setSelectedTab] = useState("Events");
  // individual ticketing data from the api (will be used in the individuals table later)
  // eslint-disable-next-line no-unused-vars
  const [individualTicketingData, setIndividualTicketingData] = useState(null);

  // transport event data from the api (will be used in the events table later)
  // eslint-disable-next-line no-unused-vars
  const [eventTicketingData, setEventTicketingData] = useState(null);

  // function to fetch transport event data from the api
  const fetchEventTicketingData = () => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const dept = decoded.department;

    fetch(
      `${API_BASE_URL}/api/table/dashboard-table?module=externalTransports`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((response) => response.json())
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

  // function to fetch individual ticketing data from the api
  const fetchIndividualTicketingData = () => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/api/individual-ticketing/head`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // log the data to check what the api returned
        console.log("individual ticketing data : ", data);

        // store the data in state
        setIndividualTicketingData(data);
      })
      .catch((error) => {
        console.log("error while fetching individual ticketing data : ", error);
      });
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
    const isPending = status.toLowerCase().includes("pending");

    return isPending ? "text-red-500" : "text-green-500";
  };

  return (
    <div className="w-full rounded-md border min-h-[calc(100vh-320px)] border-[#283247] bg-[#151e2e] p-4 shadow-lg">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-medium text-white">
          Upcoming {selectedTab == "Events" ? "Event" : "Individual"} Requests
        </h2>
      </div>

      {/* Events Table */}
      {selectedTab === "Events" && (
        <div className="overflow-x-auto table-custom-scrollbar  border max-h-[calc(100vh-400px)] overflow-auto border-gray-700 rounded-lg">
          <table className="w-full border-gray-700 rounded-lg border-collapse">
            <thead className="bg-gray-800 sticky top-0">
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
                  Form Type
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
              {/* Row 1 */}
              <tr className="border-b border-[#202a3b] transition hover:bg-[#1a2435]">
                <td className="px-2 py-3 text-[#d2d6de]">15-03-2026</td>
                <td className="px-2 py-3 text-[#b0b7c5]">Karthikeyan M</td>
                <td className="px-2 py-3 text-[#b0b7c5]">Transport</td>
                <td className="px-2 py-3 text-[#b0b7c5]">CSE</td>

                <td className="px-2 py-2">
                  <span className="text-[#55cbb0]">
                    <span className="mr-1">●</span>
                    Acknowledged
                  </span>
                </td>

                <td className="px-2 py-2 text-center">
                  <button className="text-[#aab3c3] hover:text-white">
                    <ArrowUpRight size={18} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketingUpcommingTable;
