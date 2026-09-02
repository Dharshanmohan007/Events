import React from "react";
import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  CalendarCheck2,
  FileText,
} from "lucide-react";

const RequestStats = () => {
  return (
    <div className="flex w-full gap-4 mt-3  ">
      {/* Event Request */}
      <div className="flex-1 rounded-md border border-[#293246] bg-[#171f30] p-4">
        <h3 className="mb-2 text-[16px] font-semibold text-[#c4c9d4]">
          Event Request
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {/* Total Event Request */}
          <div className="rounded-md border border-[#6440ad] bg-gradient-to-r from-[#25214a] to-[#44266b] p-2">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#c5c1d0]">Total Event request</p>

              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#b8a2ff]">
                <FileText size={14} className="text-[#ffffff]" />
              </div>
            </div>

            <p className="mt-1 text-sm font-semibold text-[#e6e7eb]">50</p>
          </div>

          {/* Approved Events */}
          <div className="rounded-md border border-[#267a6b] bg-gradient-to-r from-[#173b3a] to-[#215e52] p-2">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#c5c1d0]">Approved Events</p>

              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#63d5bd]">
                <CheckCircle2 size={14} className="text-[#ffffff]" />
              </div>
            </div>

            <p className="mt-1 text-sm font-semibold text-[#e6e7eb]">50</p>
          </div>

          {/* Completed Events */}
          <div className="rounded-md border border-[#48419b] bg-gradient-to-r from-[#1c2548] to-[#30306c] p-2">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#c5c1d0]">Completed Events</p>

              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#8f94f7]">
                <CalendarCheck2 size={14} className="text-[#ffffff]" />
              </div>
            </div>

            <p className="mt-1 text-sm font-semibold text-[#e6e7eb]">50</p>
          </div>

          {/* Pending Approval Events */}
          <div className="rounded-md border border-[#9b315e] bg-gradient-to-r from-[#49203e] to-[#7b294d] p-2">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#c5c1d0]">
                Pending Approval Events
              </p>

              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#f18ab8]">
                <Clock3 size={14} className="text-[#ffffff]" />
              </div>
            </div>

            <p className="mt-1 text-sm font-semibold text-[#e6e7eb]">50</p>
          </div>
        </div>
      </div>

      {/* Individual Request */}
      <div className="flex-1 rounded-md border border-[#293246] bg-[#171f30] p-4">
        <h3 className="mb-2 text-[16px] font-semibold text-[#c4c9d4]">
          Individual Request
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {/* Total Request */}
          <div className="rounded-md border border-[#6440ad] bg-gradient-to-r from-[#25214a] to-[#44266b] p-2">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#c5c1d0]">Total Request</p>

              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#b8a2ff]">
                <ClipboardList size={14} className="text-[#ffffff]" />
              </div>
            </div>

            <p className="mt-1 text-sm font-semibold text-[#e6e7eb]">50</p>
          </div>

          {/* Approved Request */}
          <div className="rounded-md border border-[#267a6b] bg-gradient-to-r from-[#173b3a] to-[#215e52] p-2">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#c5c1d0]">Approved Request</p>

              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#63d5bd]">
                <CheckCircle2 size={14} className="text-[#ffffff]" />
              </div>
            </div>

            <p className="mt-1 text-sm font-semibold text-[#e6e7eb]">50</p>
          </div>

          {/* Completed */}
          <div className="rounded-md border border-[#48419b] bg-gradient-to-r from-[#1c2548] to-[#30306c] p-2">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#c5c1d0]">Completed</p>

              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#8f94f7]">
                <CheckCircle2 size={14} className="text-[#ffffff]" />
              </div>
            </div>

            <p className="mt-1 text-sm font-semibold text-[#e6e7eb]">50</p>
          </div>

          {/* Pending Approval Request */}
          <div className="rounded-md border border-[#9b315e] bg-gradient-to-r from-[#49203e] to-[#7b294d] p-2">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#c5c1d0]">
                Pending Approval Request
              </p>

              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#f18ab8]">
                <Clock3 size={14} className="text-[#ffffff]" />
              </div>
            </div>

            <p className="mt-1 text-sm font-semibold text-[#e6e7eb]">50</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestStats;
