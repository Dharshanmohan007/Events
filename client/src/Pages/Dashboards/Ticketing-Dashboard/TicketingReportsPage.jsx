import React from "react";
import { useState } from "react";
import { Search, Download } from "lucide-react";
import TicketingNavbar from "./TicketingNavbar";

const TicketingReportsPage = () => {
  const [activeTab, setActiveTab] = useState("event");
  const [search, setSearch] = useState("");

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

            {/* Tabs */}
            <div className="grid grid-cols-2 rounded-md bg-[#222d42]">
              <button
                onClick={() => {
                  setActiveTab("event");
                  setSearch("");
                }}
                className={`px-5 py-2 text-[13px] font-medium transition ${
                  activeTab === "event"
                    ? "bg-[#7c3aed] text-white"
                    : "text-[#9ba7ba]"
                }`}
              >
                Event Request Report
              </button>

              <button
                onClick={() => {
                  setActiveTab("individual");
                  setSearch("");
                }}
                className={`px-5 py-2 text-[13px] font-medium  transition ${
                  activeTab === "individual"
                    ? "bg-[#7c3aed] text-white"
                    : "text-[#9ba7ba]"
                }`}
              >
                Individual Request Report
              </button>
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

                    <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      STATUS
                    </th>

                    <th className="px-5 py-3 text-center text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* Row 1 */}
                  {"span technology".includes(search.toLowerCase()) && (
                    <tr className="border-b border-[#263349]">
                      <td className="px-5 py-4 text-[13px] font-semibold text-[#f1eee9]">
                        Span Technology
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        01-09-2026
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        PLACEMENT
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-[#63d5ad]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#63d5ad]" />
                          Completed
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button className="text-[#8995a8] hover:text-white">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Row 2 */}
                  {"orientation programme".includes(search.toLowerCase()) && (
                    <tr className="border-b border-[#263349]">
                      <td className="px-5 py-4 text-[13px] font-semibold text-[#f1eee9]">
                        ORIENTATION PROGRAMME
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        01-09-2026
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        S&amp;H
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-[#63d5ad]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#63d5ad]" />
                          Completed
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button className="text-[#8995a8] hover:text-white">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Row 3 */}
                  {"1st year orientation program".includes(
                    search.toLowerCase(),
                  ) && (
                    <tr className="border-b border-[#263349]">
                      <td className="px-5 py-4 text-[13px] font-semibold text-[#f1eee9]">
                        1st Year Orientation Program
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        02-09-2026
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        PLACEMENT
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-[#63d5ad]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#63d5ad]" />
                          Completed
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button className="text-[#8995a8] hover:text-white">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Row 4 */}
                  {"mistrial on campus drive".includes(
                    search.toLowerCase(),
                  ) && (
                    <tr>
                      <td className="px-5 py-4 text-[13px] font-semibold text-[#f1eee9]">
                        Mistrial On Campus Drive
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        03-09-2026 +1
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        PLACEMENT
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-[#63d5ad]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#63d5ad]" />
                          Acknowledged
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button className="text-[#8995a8] hover:text-white">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* INDIVIDUAL REPORT */}
            {activeTab === "individual" && (
              <table className="w-full border-collapse">
                <thead className="bg-[#151e2e]">
                  <tr className="border-b border-[#263349]">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      GUEST NAME
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      REQUIRED DATE
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      DEPT
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      STATUS
                    </th>

                    <th className="px-5 py-3 text-center text-[10px] font-semibold tracking-wide text-[#8290a5]">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* Row 1 */}
                  {"priyanka".includes(search.toLowerCase()) && (
                    <tr className="border-b border-[#263349]">
                      <td className="px-5 py-4 text-[13px] font-semibold text-[#f1eee9]">
                        Priyanka
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        06-09-2026
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        SECE
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-[#63d5ad]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#63d5ad]" />
                          Completed
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button className="text-[#8995a8] hover:text-white">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Row 2 */}
                  {"rahul kumar".includes(search.toLowerCase()) && (
                    <tr className="border-b border-[#263349]">
                      <td className="px-5 py-4 text-[13px] font-semibold text-[#f1eee9]">
                        Rahul Kumar
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        08-09-2026
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        S&amp;H
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-[#63d5ad]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#63d5ad]" />
                          Completed
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button className="text-[#8995a8] hover:text-white">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Row 3 */}
                  {"arjun raj".includes(search.toLowerCase()) && (
                    <tr>
                      <td className="px-5 py-4 text-[13px] font-semibold text-[#f1eee9]">
                        Arjun Raj
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        10-09-2026
                      </td>

                      <td className="px-5 py-4 text-[13px] text-[#f1eee9]">
                        PLACEMENT
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-[#63d5ad]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#63d5ad]" />
                          Completed
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button className="text-[#8995a8] hover:text-white">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
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
