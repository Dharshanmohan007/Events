import {
  ChevronRight, CalendarDays,
  UserRound,
  Phone,
  FileText,
  FileCheck2
} from 'lucide-react';

import React from 'react';

const IndividualMediaDetailPage = () => {
  return (
    <main>
      <breadcrumb className="flex items-center gap-2">
        <h1 className="text-gray-500">Media Request List</h1>
        <ChevronRight size={16} className="" />
        <h1 className="text-white font-medium">Event Name</h1>
        <ChevronRight size={16} className="" />
        <button className="bg-green-200/10 px-3 py-2 rounded-full text-xs text-[#34D399]">Department</button>
      </breadcrumb>


      <div className="bg-[#232a3c]/30 mt-4  p-4 rounded-xl border border-gray-700 w-full">
        <h1 className="text-lg text-[#853FF9] font-medium">Media Details</h1>

        {/* ============================== poster section  ==========================  */}


        <div className="mt-4  ">

          {/* Main Container */}
          <div className="rounded-lg border border-slate-600/40 bg-[#1d2639] p-4">

            {/* ===================================================== POSTER ========================================== */}
            <h2 className="mb-2 px-1 text-lg font-medium text-[#853FF9]">
              Poster
            </h2>

            {/* Content for Poster */}
            <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">

              <div className="mb-2 flex items-center gap-1.5">
                <FileText
                  size={11}
                  strokeWidth={1.8}
                  className="text-slate-300"
                />

                <span className="text-[14px] font-medium text-slate-300">
                  Content for Poster
                </span>
              </div>

              <p className="text-[12px]  leading-4 text-slate-300">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy text
                ever since the 1500s Lorem Ipsum is simply dummy text of the
                printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s
              </p>

            </div>


            {/* Reference Poster */}
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">

              <div className="flex items-center px-3 py-2.5">
                <span className="text-[13px] text-slate-300">
                  Reference poster
                </span>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-500/40 px-3 py-2.5">

                <FileCheck2
                  size={12}
                  strokeWidth={1.8}
                  className="text-emerald-400"
                />

                <span className="text-[13px] font-medium text-slate-300">
                  Previous Event Completion Document.pdf
                </span>

              </div>

            </div>


            {/* ================= CERTIFICATE ================= */}

            {/* Content for Certificate */}
            <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">

              <div className="mb-2 flex items-center gap-1.5">

                <FileText
                  size={11}
                  strokeWidth={1.8}
                  className="text-slate-300"
                />

                <span className="text-[14px] font-medium text-slate-300">
                  Content for Certificate
                </span>

              </div>

              <p className="text-[13px] leading-4 text-slate-300">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy text
                ever since the 1500s Lorem Ipsum is simply dummy text of the
                printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s
              </p>

            </div>


            {/* Reference Certificate */}
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">

              <div className="flex items-center px-3 py-2.5">

                <span className="text-[13px] text-slate-300">
                  Reference Certificate
                </span>

              </div>

              <div className="flex items-center gap-2 border-l border-slate-500/40 px-3 py-2.5">

                <FileCheck2
                  size={12}
                  strokeWidth={1.8}
                  className="text-emerald-400"
                />

                <span className="text-[13px] font-medium text-slate-300">
                  Previous Event Completion Document.pdf
                </span>

              </div>

            </div>


            {/* ================= TROPHY ================= */}

            {/* Content for Trophy */}
            <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">

              <div className="mb-2 flex items-center gap-1.5">

                <FileText
                  size={11}
                  strokeWidth={1.8}
                  className="text-slate-300"
                />

                <span className="text-[14px] font-medium text-slate-300">
                  Content for Trophy
                </span>

              </div>

              <p className="text-[13px] leading-4 text-slate-300">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy text
                ever since the 1500s Lorem Ipsum is simply dummy text of the
                printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s
              </p>

            </div>


            {/* ================= REQUIREMENTS ================= */}

            <div className="mb-2 grid grid-cols-2 gap-2">

              {/* Display Requirement */}
              <div className="rounded-lg border border-slate-500/30 bg-[#2a3347] p-3">

                <div className="mb-2 flex items-center gap-1.5">

                  <FileText
                    size={11}
                    strokeWidth={1.8}
                    className="text-slate-300"
                  />

                  <span className="text-[14px] font-medium text-slate-300">
                    Display Requirement
                  </span>

                </div>

                <p className="mb-2 text-[13px] font-medium text-slate-300">
                  Flex
                </p>

                <p className="text-[13px] font-semibold text-white">
                  Glass Sticker
                </p>

              </div>


              {/* Size Requirement */}
              <div className="rounded-lg border border-slate-500/30 bg-[#2a3347] p-3">

                <div className="mb-2 flex items-center gap-1.5">

                  <FileText
                    size={11}
                    strokeWidth={1.8}
                    className="text-slate-300"
                  />

                  <span className="text-[14px] font-medium text-slate-300">
                    Size Requirement
                  </span>

                </div>

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-[13px] text-slate-300">
                    Size for Flex
                  </span>

                  <span className="text-[13px] font-semibold text-white">
                    1200cm
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-[13px] text-slate-300">
                    Size for Glass Sticker
                  </span>

                  <span className="text-[13px] font-semibold text-white">
                    10cm
                  </span>

                </div>

              </div>

            </div>


            {/* ================= DELIVERY / PRIORITY ================= */}

            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">

              {/* Delivery Date */}
              <div className="flex items-center justify-between border-r border-slate-500/40 px-3 py-3">

                <div className="flex items-center gap-1.5">

                  <CalendarDays
                    size={11}
                    strokeWidth={1.8}
                    className="text-slate-300"
                  />

                  <span className="text-[13px] text-slate-300">
                    Delivery Date
                  </span>

                </div>

                <span className="text-[13px] font-semibold text-white">
                  12/05/2026
                </span>

              </div>


              {/* Priority */}
              <div className="flex items-center justify-between px-3 py-3">

                <span className="text-[13px] text-slate-300">
                  Priority
                </span>

                <span className="text-[13px] font-semibold text-red-500">
                  HIGH
                </span>

              </div>

            </div>


            {/* ================= SPECIAL REQUIREMENT ================= */}

            <div className="rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">

              <div className="mb-2 flex items-center gap-1.5">

                <FileText
                  size={11}
                  strokeWidth={1.8}
                  className="text-slate-300"
                />

                <span className="text-[14px] font-medium text-slate-300">
                  Special Requirement
                </span>

              </div>

              <p className="text-[13px] leading-4 text-slate-300">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy text
                ever since the 1500s Lorem Ipsum is simply dummy text of the
                printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s
              </p>

            </div>

          </div>
        </div>

        {/* ============================== Video section  ==========================  */}




      </div>

    </main>
  );
};

export default IndividualMediaDetailPage;
