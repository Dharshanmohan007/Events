import React, { useState } from "react";
import { Filter, ArrowUpRight } from "lucide-react";

const tabs = ["Events", "Individuals"];

const TicketingUpcommingTable = () => {
  // states
  const [selectedTab, setSelectedTab] = useState("Events");

  return (
    <div className="w-full rounded-md border min-h-[calc(100vh-320px)] border-[#283247] bg-[#151e2e] p-4 shadow-lg">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-medium text-white">
          Upcoming {selectedTab == "Events" ? "Event" : "Individual"} Requests
        </h2>

        <div className="flex items-center border border-gray-700 rounded-md">
          {tabs.map((item, index) => {
            return (
              <button
                key={index}
                onClick={() => setSelectedTab(item)}
                className={`px-4 py-1 text-md text-white  ${selectedTab == item ? "bg-purple-700" : ""}  ${index == 0 ? "rounded-l-md" : "rounded-r-md"} `}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
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
                Allocated Person
              </th>

              <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                Due Date
              </th>

              <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                Department
              </th>

              <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                Acknowledge Status
              </th>

              <th className="px-2 py-2 text-left text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                Work Status
              </th>

              <th className="px-2 py-2 text-center text-[12px] font-medium uppercase tracking-wide text-[#858e9f]">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="text-[14px]  ">
            {/* Row 1 */}
            <tr className="border-b border-[#202a3b] transition hover:bg-[#1a2435]">
              <td className="px-2 py-3 text-[#d2d6de]">Welcome Freshers</td>
              <td className="px-2 py-3 text-[#b0b7c5]">Poster</td>
              <td className="px-2 py-3 text-[#b0b7c5]">Karthikeyan M</td>
              <td className="px-2 py-3 text-[#b0b7c5]">15-03-2026</td>
              <td className="px-2 py-3 text-[#b0b7c5]">CSE</td>

              <td className="px-2 py-2">
                <span className="text-[#55cbb0]">
                  <span className="mr-1">●</span>
                  Acknowledged
                </span>
              </td>

              <td className="px-2 py-2">
                <span className="text-[#55cbb0]">
                  <span className="mr-1">●</span>
                  Completed
                </span>
              </td>

              <td className="px-2 py-2 text-center">
                <button className="text-[#aab3c3] hover:text-white">
                  <ArrowUpRight size={11} />
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketingUpcommingTable;
