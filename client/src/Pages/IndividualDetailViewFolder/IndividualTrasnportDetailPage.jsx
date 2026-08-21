import React from 'react';
import {
  ChevronRight, CalendarDays,
  UserRound,
  Phone,
  FileText,
  Clock3,
  MapPin,
  ClipboardList,
} from 'lucide-react';


const IndividualTrasnportDetailPage = () => {
  return (
    <main>
      <breadcrumb className="flex items-center gap-2">
        <h1 className="text-gray-500">Transport Request List</h1>
        <ChevronRight size={16} className="" />
        <h1 className="text-white font-medium">Event Name</h1>
        <ChevronRight size={16} className="" />
        <button className="bg-green-200/10 px-3 py-2 rounded-full text-xs text-[#34D399]">Department</button>
      </breadcrumb>


      <div className="bg-[#232a3c]/30 mt-4  p-4 rounded-xl border border-gray-700 w-full">
        <h1 className="text-lg text-[#853FF9] font-medium">Transport Details</h1>

        <div className="mt-3">

          {/* Main Container */}
          <div className="rounded-lg border border-slate-600/40 bg-[#1d2639] p-3">

            {/* ================= TOP DATE SECTION ================= */}
            <div className="grid grid-cols-2 gap-2">

              {/* Pickup */}
              <div className="rounded-lg bg-[#2a3347] p-2.5">

                <div className="grid grid-cols-2">

                  {/* Pickup Date */}
                  <div className="flex items-start gap-2 border-r border-slate-500/40 pr-3">

                    <CalendarDays
                      size={12}
                      strokeWidth={1.8}
                      className="mt-0.5 text-purple-300"
                    />

                    <div>
                      <p className="text-[14px] uppercase text-slate-400">
                        Pickup Date
                      </p>

                      <p className="text-[14px] font-semibold text-white">
                        12/06/2026
                      </p>
                    </div>

                  </div>

                  {/* Pickup Time */}
                  <div className="flex items-start gap-2 pl-3">

                    <Clock3
                      size={12}
                      strokeWidth={1.8}
                      className="mt-0.5 text-purple-300"
                    />

                    <div>
                      <p className="text-[14px] uppercase text-slate-400">
                        Pickup Time
                      </p>

                      <p className="text-[14px] font-semibold text-white">
                        09:30 AM
                      </p>
                    </div>

                  </div>

                </div>
              </div>

              {/* Drop */}
              <div className="rounded-lg bg-[#2a3347] p-2.5">

                <div className="grid grid-cols-2">

                  {/* Drop Date */}
                  <div className="flex items-start gap-2 border-r border-slate-500/40 pr-3">

                    <CalendarDays
                      size={12}
                      strokeWidth={1.8}
                      className="mt-0.5 text-purple-300"
                    />

                    <div>
                      <p className="text-[14px] uppercase text-slate-400">
                        Drop Date
                      </p>

                      <p className="text-[14px] font-semibold text-white">
                        12/06/2026
                      </p>
                    </div>

                  </div>

                  {/* Drop Time */}
                  <div className="flex items-start gap-2 pl-3">

                    <Clock3
                      size={12}
                      strokeWidth={1.8}
                      className="mt-0.5 text-purple-300"
                    />

                    <div>
                      <p className="text-[14px] uppercase text-slate-400">
                        Drop Time
                      </p>

                      <p className="text-[14px] font-semibold text-white">
                        09:30 AM
                      </p>
                    </div>

                  </div>

                </div>
              </div>

            </div>


            {/* ================= LOCATION SECTION ================= */}
            <div className="relative my-3 mt-4 flex items-center justify-between">

              {/* Connecting Line */}
              <div className="absolute left-[11%] right-[11%] top-1/2 border-t border-dashed border-slate-500/50" />

              {/* Pickup Location */}
              <div className="relative z-10 flex w-[23%] items-center gap-2 rounded-lg bg-[#2a3347] px-2 py-2">

                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <MapPin
                    size={10}
                    className="text-white"
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[14px] uppercase text-slate-400">
                    Pickup Location
                  </p>

                  <p className="truncate text-[12px] font-semibold text-white">
                    Sri Eshwar College of engineering
                  </p>
                </div>

              </div>


              {/* Checkpoint */}
              <div className="relative z-10 flex w-[23%] items-center gap-2 rounded-lg bg-[#2a3347] px-2 py-2">

                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <MapPin
                    size={10}
                    className="text-white"
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <p className="text-[14px] uppercase text-slate-400">
                    Checkpoint
                  </p>

                  <p className="text-[12px] font-semibold text-white">
                    Hotel
                  </p>
                </div>

              </div>


              {/* Drop Location */}
              <div className="relative z-10 flex w-[23%] items-center gap-2 rounded-lg bg-[#2a3347] px-2 py-2">

                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <MapPin
                    size={10}
                    className="text-white"
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[14px] uppercase text-slate-400">
                    Drop Location
                  </p>

                  <p className="truncate text-[12px] font-semibold text-white">
                    Coimbatore Airport
                  </p>
                </div>

              </div>

            </div>


            {/* ================= MEMBERS / VEHICLE ================= */}
            <div className="mb-2 grid grid-cols-2 mt-4  rounded-lg border border-slate-600/30 bg-[#2a3347]">

              {/* Left */}
              <div className="flex items-center justify-between border-r border-slate-500/40 px-3 py-3">

                <span className="text-[14px] text-slate-300">
                  Total Number of Members
                </span>

                <span className="text-[14px] font-semibold text-white">
                  100
                </span>

              </div>

              {/* Right */}
              <div className="flex items-center justify-between px-3 py-3">

                <span className="text-[14px] text-slate-300">
                  Types of Vehicle needed
                </span>

                <span className="text-[14px] font-semibold text-white">
                  Car / bus
                </span>

              </div>

            </div>


            {/* ================= VEHICLE COUNT ================= */}
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-600/30 bg-[#2a3347]">

              {/* Left */}
              <div className="flex items-center justify-between border-r border-slate-500/40 px-3 py-3">

                <span className="text-[14px] text-slate-300">
                  Total bus needed
                </span>

                <span className="text-[14px] font-semibold text-white">
                  10
                </span>

              </div>

              {/* Right */}
              <div className="flex items-center justify-between px-3 py-3">

                <span className="text-[14px] text-slate-300">
                  Total car needed
                </span>

                <span className="text-[14px] font-semibold text-white">
                  10
                </span>

              </div>

            </div>


            {/* ================= STAFF DETAILS ================= */}
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-600/30 bg-[#2a3347]">

              {/* Staff Name */}
              <div className="flex items-center gap-2 border-r border-slate-500/40 px-3 py-2.5">

                <UserRound
                  size={13}
                  strokeWidth={1.7}
                  className="text-purple-300"
                />

                <div>
                  <p className="text-[14px] uppercase text-slate-400">
                    Accompanying Staff Name
                  </p>

                  <p className="text-[14px] font-semibold text-white">
                    Surya Chandran
                  </p>
                </div>

              </div>


              {/* Mobile */}
              <div className="flex items-center gap-2 px-3 py-2.5">

                <Phone
                  size={13}
                  strokeWidth={1.7}
                  className="text-purple-300"
                />

                <div>
                  <p className="text-[14px] uppercase text-slate-400">
                    Accompanying Mobile Number
                  </p>

                  <p className="text-[14px] font-semibold text-white">
                    1234567890
                  </p>
                </div>

              </div>

            </div>


            {/* ================= SPECIAL REQUIREMENT ================= */}
            <div className="rounded-lg border border-slate-500/40 bg-[#2a3347] px-3 py-3">

              {/* Header */}
              <div className="mb-2 flex items-center gap-1.5">

                <ClipboardList
                  size={12}
                  strokeWidth={1.8}
                  className="text-slate-200"
                />

                <span className="text-[14px] font-medium text-white">
                  Special Requirement
                </span>

              </div>

              {/* Description */}
              <p className="text-[14px] leading-5 text-slate-300">
                Lorem ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy text
                ever since the 1500s Lorem Ipsum is simply dummy text of the
                printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s
              </p>

            </div>

          </div>
        </div>

      </div>

    </main>
  );
};

export default IndividualTrasnportDetailPage;
