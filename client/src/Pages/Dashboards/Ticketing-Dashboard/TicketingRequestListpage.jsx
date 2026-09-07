import React from "react";
import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import TicketingNavbar from "./TicketingNavbar";
import { Link, useNavigate } from "react-router-dom";

const TicketingRequestListpage = () => {
  // states
  const [activeTab, setActiveTab] = useState("event");

  const navigate = useNavigate()
  return (
    <>
      <main className="bg-[#0b1326] min-h-screen">
        <TicketingNavbar />
        <div className="bg-[#101827] p-5 text-white">
          {/* Page Heading */}
          <div className="mb-5">
            <h1 className="text-[19px] font-semibold text-[#f1eee9]">
              Transport Request List Overview
            </h1>

            <p className="mt-1 text-sm text-[#9ba6b9]">
              View and manage transport event requests.
            </p>
          </div>

          {/* Main Container */}
          <div className="overflow-hidden rounded-lg border border-[#2f3b50] bg-[#192233]">
            {/* Top Section */}
            <div className="border-b border-[#293449] px-5 pt-3 pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[#f1eee9]">
                  {activeTab === "event"
                    ? "Event Request List"
                    : "Individual Request List"}

                  <span className="ml-1 text-[#8b4df5]">
                    ({activeTab === "event" ? "4" : "3"})
                  </span>
                </h2>

                {/* Tabs */}
                <div className="flex rounded-md bg-[#263147] p-1">
                  <button
                    onClick={() => setActiveTab("event")}
                    className={`rounded-md px-4 py-2 text-[13px] font-medium transition ${
                      activeTab === "event"
                        ? "bg-[#7c3aed] text-white shadow"
                        : "text-[#aeb8c8] hover:text-white"
                    }`}
                  >
                    Event Requests
                  </button>

                  <button
                    onClick={() => setActiveTab("individual")}
                    className={`rounded-md px-4 py-2 text-[13px] font-medium transition ${
                      activeTab === "individual"
                        ? "bg-[#7c3aed] text-white shadow"
                        : "text-[#aeb8c8] hover:text-white"
                    }`}
                  >
                    Individual Requests
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4 flex items-center justify-end gap-3">
                {/* Search */}
                <div className="flex h-9 w-[256px] items-center gap-2 rounded-lg border border-[#39455b] bg-[#222c3e] px-4">
                  <Search size={16} className="text-[#8290a6]" />

                  <input
                    type="text"
                    placeholder={
                      activeTab === "event"
                        ? "Search events, venues"
                        : "Search individuals"
                    }
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#7f8ba0]"
                  />
                </div>
              </div>
            </div>

            {/* EVENT REQUEST TABLE */}
            {activeTab === "event" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#222c3e]">
                    <tr className="border-b border-[#2e394d]">
                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        EVENT NAME
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        EVENT TYPE
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        EVENT VENUE
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        EVENT DATE
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        DPT
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        EVENT STATUS
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        APPROVED STATUS
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        ACTION
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Row 1 */}
                    <tr className="border-b border-[#2a3548]">
                      <td className="px-5 py-5 text-sm font-semibold">
                        Span Technology
                      </td>

                      <td className="px-5 py-5 text-sm text-[#e7e3df]">
                        Other
                      </td>

                      <td className="px-5 py-5 text-sm">Auditorium</td>

                      <td className="px-5 py-5 text-sm font-semibold">
                        01/09/2026
                      </td>

                      <td className="px-5 py-5 text-sm font-semibold">
                        PLACEMENT
                      </td>

                      <td className="px-5 py-5 text-sm font-medium text-[#f5bd42]">
                        Not closed
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#65d6ad]">
                          <span className="h-2 w-2 rounded-full bg-[#65d6ad]" />
                          Approved
                        </div>
                      </td>

                      <td className="px-2 py-2 text-center ">
                        <button
                          onClick={() => {
                            navigate(`/ticketing-dashboard/event-request/123`);
                          }}
                          className="text-[#aab3c3] cursor-pointer hover:text-white"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* INDIVIDUAL REQUEST TABLE */}
            {activeTab === "individual" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#222c3e]">
                    <tr className="border-b border-[#2e394d]">
                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        GUEST NAME
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        MOBILE NUMBER
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        PICKUP LOCATION
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        DROP LOCATION
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        DATE
                      </th>

                      <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        STATUS
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-semibold tracking-wide text-[#91a0b6]">
                        ACTION
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Individual Row 1 */}
                    <tr className="border-b border-[#2a3548]">
                      <td className="px-5 py-5 text-sm font-semibold">
                        Priyanka
                      </td>

                      <td className="px-5 py-5 text-sm">977903441715</td>

                      <td className="px-5 py-5 text-sm">SECE</td>

                      <td className="px-5 py-5 text-sm">Brookfields</td>

                      <td className="px-5 py-5 text-sm font-semibold">
                        06/09/2026
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#65d6ad]">
                          <span className="h-2 w-2 rounded-full bg-[#65d6ad]" />
                          Approved
                        </div>
                      </td>

                      <td className="px-5 py-5 text-center">
                        <ExternalLink
                          size={17}
                          className="inline text-[#8d9aae]"
                        />
                      </td>
                    </tr>

                    {/* Individual Row 2 */}
                    <tr className="border-b border-[#2a3548]">
                      <td className="px-5 py-5 text-sm font-semibold">
                        Rahul Kumar
                      </td>

                      <td className="px-5 py-5 text-sm">9876543210</td>

                      <td className="px-5 py-5 text-sm">Gandhipuram</td>

                      <td className="px-5 py-5 text-sm">SECE</td>

                      <td className="px-5 py-5 text-sm font-semibold">
                        08/09/2026
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#f5bd42]">
                          <span className="h-2 w-2 rounded-full bg-[#f5bd42]" />
                          Pending
                        </div>
                      </td>

                      <td className="px-5 py-5 text-center">
                        <ExternalLink
                          size={17}
                          className="inline text-[#8d9aae]"
                        />
                      </td>
                    </tr>

                    {/* Individual Row 3 */}
                    <tr>
                      <td className="px-5 py-5 text-sm font-semibold">
                        Arjun Raj
                      </td>

                      <td className="px-5 py-5 text-sm">9871234567</td>

                      <td className="px-5 py-5 text-sm">Airport</td>

                      <td className="px-5 py-5 text-sm">Gandhipuram</td>

                      <td className="px-5 py-5 text-sm font-semibold">
                        10/09/2026
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#65d6ad]">
                          <span className="h-2 w-2 rounded-full bg-[#65d6ad]" />
                          Approved
                        </div>
                      </td>

                      <td className="px-5 py-5 text-center">
                        <ExternalLink
                          size={17}
                          className="inline text-[#8d9aae]"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default TicketingRequestListpage;
