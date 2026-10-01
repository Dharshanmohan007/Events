import React, { useEffect, useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import TicketingNavbar from "./TicketingNavbar";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

const TicketingRequestListpage = () => {
  const navigate = useNavigate();
  const [eventTicketingData, setEventTicketingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch event ticketing data from the API
  const fetchEventTicketingData = () => {
    const token = localStorage.getItem("token");
    setLoading(true);

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
        setEventTicketingData(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("error while fetching ticketing event data : ", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEventTicketingData();
  }, []);

  // Status color helper
  const getStatusColor = (status = "") => {
    const isPending = status.toLowerCase().includes("pending");
    return isPending ? "text-red-500" : "text-green-500";
  };

  // search function
  const filteredEventTicketingData = eventTicketingData?.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      item?.eventName?.toLowerCase().includes(search) ||
      item?.venue?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <main className="bg-[#0b1326] min-h-screen">
        <TicketingNavbar />
        <div className="bg-[#101827] p-5 text-white">
          {/* Page Heading */}
          <div className="mb-5">
            <h1 className="text-[19px] font-semibold text-[#f1eee9]">
              Ticketing Request List Overview
            </h1>
            <p className="mt-1 text-sm text-[#9ba6b9]">
              View and manage ticketing event requests.
            </p>
          </div>

          {/* Main Container */}
          <div className="overflow-hidden rounded-lg border border-[#2f3b50] bg-[#192233]">
            {/* Top Section */}
            <div className="border-b border-[#293449] px-5 pt-3 pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[#f1eee9]">
                  Event Request List
                </h2>
                {/* Search */}
                <div className="flex h-9 w-[256px] items-center gap-2 rounded-lg border border-[#39455b] bg-[#222c3e] px-4">
                  <Search size={16} className="text-[#8290a6]" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search events, venues"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#7f8ba0]"
                  />
                </div>
              </div>
            </div>

            {/* EVENT REQUEST TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-800 sticky top-0">
                  <tr className="border-b border-[#2e394d]">
                    <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                      EVENT NAME
                    </th>
                    <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                      EVENT TYPE
                    </th>
                    <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                      REQUIRED DATE
                    </th>
                    <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                      DEPARTMENT
                    </th>
                    <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                      ACKNOWLEDGE STATUS
                    </th>
                    <th className="px-5 py-4 text-center text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-[#8b95a7]"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : filteredEventTicketingData?.length > 0 ? (
                    filteredEventTicketingData.map((item, index) => (
                      <tr
                        key={item?._id || index}
                        className="border-b border-[#202a3b] transition hover:bg-[#1a2435]"
                      >
                        <td
                          className="max-w-[100px] truncate px-5 py-3 text-[#d2d6de]"
                          title={item?.eventName}
                        >
                          {item?.eventName || "-"}
                        </td>

                        <td className="px-5 py-3 text-[#b0b7c5]">
                          {item?.eventType || "-"}
                        </td>

                        <td className="px-5 py-3 text-[#b0b7c5]">
                          <div className="flex items-center gap-2">
                            <span>
                              {item?.dates?.[0]
                                ? new Date(item.dates[0])
                                    .toLocaleDateString("en-GB")
                                    .replaceAll("/", "-")
                                : "-"}
                            </span>

                            {item?.dates?.length > 1 && (
                              <div className="group relative">
                                <div className="flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-md bg-gray-700 px-1 text-xs text-white">
                                  +{item.dates.length - 1}
                                </div>

                                <div className="absolute left-0 top-8 z-50 hidden min-w-[150px] rounded-md border border-gray-600 bg-[#1f2937] p-2 shadow-lg group-hover:block">
                                  {item.dates.slice(1).map((date, di) => (
                                    <div
                                      key={di}
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

                        <td className="px-5 py-3 text-[#b0b7c5]">
                          {item?.organizingDepartment || "-"}
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center ${getStatusColor(
                              item?.departmentStatus,
                            )}`}
                          >
                            <span className="mr-1">●</span>
                            {item?.departmentStatus || "-"}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() =>
                              navigate(
                                `/ticketing-dashboard/event-request/${item?.eventId}`,
                              )
                            }
                            className="cursor-pointer text-[#aab3c3] hover:text-white"
                          >
                            <ArrowUpRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-[#8b95a7]"
                      >
                        No events found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TicketingRequestListpage;
