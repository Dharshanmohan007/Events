import React, { useEffect } from "react";
import { useState } from "react";
import { Search, Download, ExternalLink } from "lucide-react";
import TicketingNavbar from "./TicketingNavbar";
import axios from "axios";

const TicketingReportsPage = () => {
  // Auth
  const token = localStorage.getItem("token");

  // states
  const [activeTab, setActiveTab] = useState("event");
  const [search, setSearch] = useState("");
  const [reportsData, setReportsData] = useState(null);

  async function fetchReportsData() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/table/dashboard-table?module=externalTransports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setReportsData(res.data.data);
    } catch (err) {
      console.error(
        "error occured while fetching reports data in External transport data : ",
        err.message,
      );
    }
  }

  useEffect(() => {
    fetchReportsData();
  }, []);
  console.log("external transports : ", reportsData);

  const filteredEvents = reportsData?.filter((event) =>
    event?.eventName?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <>
      <main className="bg-[#0b1326] min-h-screen">
        <TicketingNavbar />

        <div className="min-h-screen bg-[#111a2b] p-4">
          {/* Header */}
          <div className="mb-10 flex items-start justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-[#f4efe9]">
                Reports
              </h1>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-xl border border-[#263349] bg-[#172133]">
            {/* Search */}
            <div className="flex justify-end border-b border-[#263349] px-5 py-4">
              <div className="flex h-[36px] w-[260px] items-center gap-2 rounded-full border border-[#39465b] bg-[#1d2738] px-4">
                <Search size={16} className="shrink-0 text-[#8d99ac]" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    activeTab === "event"
                      ? "Search events, venues"
                      : "Search individual requests"
                  }
                  className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#778399]"
                />
              </div>
            </div>

            {/* EVENT REPORT */}
            {activeTab === "event" && (
              <table className="w-full border-collapse">
                <thead className="bg-[#151e2e]">
                  <tr className="border-b border-[#263349]">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      EVENT NAME
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      REQUIRED DATE
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      DEPT
                    </th>

                    <th className="px-5 py-3 text-center text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvents?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-[#8b95a7]"
                      >
                        No events found
                      </td>
                    </tr>
                  ) : (
                    filteredEvents?.map((event, index) => (
                      <tr
                        key={index}
                        className={
                          index !== filteredEvents.length - 1
                            ? "border-b border-[#263349]"
                            : ""
                        }
                      >
                        <td className="px-5 py-4 text-[13px] font-semibold text-[#f1eee9]">
                          {event.eventName}
                        </td>

                        <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                          <div className="flex items-center gap-2">
                            {/* First date */}
                            <span>{formatDate(event.dates[0])}</span>

                            {/* Remaining dates */}
                            {event.dates.length > 1 && (
                              <div className="relative group">
                                <span className="cursor-pointer text-[#8da2bf]">
                                  +{event.dates.length - 1}
                                </span>

                                {/* Tooltip */}
                                <div className="absolute left-0 top-full z-50 mt-2 hidden min-w-[150px] rounded-md bg-[#1e293b] p-2 shadow-lg group-hover:block">
                                  {event.dates.slice(1).map((date, index) => (
                                    <div
                                      key={index}
                                      className="whitespace-nowrap py-1"
                                    >
                                      {formatDate(date)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                          {event.organizingDepartment}
                        </td>

                        <td className="px-5 py-4 text-center flex">
                          <div className="btn-contaienr w-fit m-auto flex items-center gap-3">
                            <button className="text-[#8995a8] w-fit  hover:text-white flex items-center justify-center gap-3">
                              <ExternalLink size={16} />
                            </button>
                            <button className="text-[#8995a8] w-fit  hover:text-white flex items-center justify-center gap-3">
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default TicketingReportsPage;
