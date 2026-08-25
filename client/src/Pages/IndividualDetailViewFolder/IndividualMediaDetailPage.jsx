import {
  ChevronRight,
  CalendarDays,
  UserRound,
  Phone,
  FileText,
  FileCheck2,
} from "lucide-react";

import React from "react";

const IndividualMediaDetailPage = ({ data }) => {
  console.log("media data : ", data);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main>
      <breadcrumb className="flex items-center gap-2">
        <h1 className="text-gray-500">Media Request List</h1>
        <ChevronRight size={16} className="" />
        <button className="bg-green-200/10 px-3 py-2 rounded-full text-xs text-[#34D399]">
          {data?.data?.employee?.department}
        </button>
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
                <FileText size={11} strokeWidth={1.8} className="text-white" />

                <span className="text-[14px] font-medium text-white">
                  Content for Poster
                </span>
              </div>

              <p className="text-[14px] leading-4 text-white/60">
                {data?.data?.poster?.posterContent}
              </p>
            </div>

            {/* Reference Poster */}
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">
              <div className="flex items-center px-3 py-2.5">
                <span className="text-[13px] text-white">Reference poster</span>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-500/40 px-3 py-2.5">
                <FileCheck2
                  size={12}
                  strokeWidth={1.8}
                  className="text-emerald-400"
                />

                {data?.data?.poster?.referencePosterFiles.map((item) => (
                  <button
                    onClick={() =>
                      window.open(item.url, "_blank", "noopener, norefferrer")
                    }
                    className="text-[13px] font-medium underline cursor-pointer text-white"
                  >
                    Reference-file
                  </button>
                ))}
              </div>
            </div>

            {/* ================= CERTIFICATE ================= */}

            {/* Content for Certificate */}
            <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />

                <span className="text-[14px] font-medium text-white">
                  Content for Certificate
                </span>
              </div>

              <p className="text-[13px] leading-4 text-white">
                {data?.data?.poster?.certificateContent}
              </p>
            </div>

            {/* Reference Certificate */}
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">
              <div className="flex items-center px-3 py-2.5">
                <span className="text-[13px] text-white">
                  Reference Certificate
                </span>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-500/40 px-3 py-2.5">
                <FileCheck2
                  size={12}
                  strokeWidth={1.8}
                  className="text-emerald-400"
                />

                <span className="text-[13px] font-medium text-white">
                  Previous Event Completion Document.pdf
                </span>
              </div>
            </div>

            {/* ================= TROPHY ================= */}

            {/* Content for Trophy */}
            <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />

                <span className="text-[14px] font-medium text-white">
                  Content for Trophy
                </span>
              </div>

              <p className="text-[13px] leading-4 text-white">
                {data?.data?.poster?.trophyContent}
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
                    className="text-white"
                  />

                  <span className="text-[14px] font-medium text-white">
                    Display Requirement
                  </span>
                </div>

                <div className="requirement-container">
                  {data?.data?.poster?.displayNeeded?.map((item) => (
                    <p className="mb-2 text-[13px] font-medium text-white">
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              {/* Size Requirement */}
              <div className="rounded-lg border border-slate-500/30 bg-[#2a3347] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <FileText
                    size={11}
                    strokeWidth={1.8}
                    className="text-white"
                  />

                  <span className="text-[14px] font-medium text-white">
                    Size Requirement
                  </span>
                </div>

                {data?.data?.poster?.sizes.map((item) => {
                  return (
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[13px] text-white">
                        Size for {item.type}
                      </span>

                      <span className="text-[13px] font-semibold text-white">
                        {item.value} cm
                      </span>
                    </div>
                  );
                })}
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
                    className="text-white"
                  />

                  <span className="text-[13px] text-white">Delivery Date</span>
                </div>

                <span className="text-[13px] font-semibold text-white">
                  {formatDate(data?.data?.poster?.deliveryDate)}
                </span>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[13px] text-white">Priority</span>

                <span
                  className={`text-[13px] font-semibold ${data?.data?.poster?.priority == "High" ? "text-red-500" : "text-green-500"}  `}
                >
                  {data?.data?.poster?.priority}
                </span>
              </div>
            </div>

            {/* ================= SPECIAL REQUIREMENT ================= */}

            <div className="rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />

                <span className="text-[14px] font-medium text-white">
                  Special Requirement
                </span>
              </div>

              <p className="text-[13px] leading-4 text-white">
                {data?.data?.poster?.specialRequirements || "--"}
              </p>
            </div>
          </div>
        </div>

        {/* ============================== ---------------- Video section -------------------- ==========================  */}

        <div className="mt-4  ">
          {/* Main Container */}
          <div className="rounded-lg border border-slate-600/40 bg-[#1d2639] p-4">
            {/* ===================================================== VIDEO ========================================== */}
            <h2 className="mb-2 px-1 text-lg font-medium text-[#853FF9]">
              Video
            </h2>

            {/* Content for Poster */}
            <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />

                <span className="text-[14px] font-medium text-white">
                  Content for Video
                </span>
              </div>

              <p className="text-[14px] leading-4 text-white/60">
                {data?.data?.video?.videoContent}
              </p>
            </div>

            {/* Reference Poster */}
            <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">
              <div className="flex items-center px-3 py-2.5">
                <span className="text-[13px] text-white">Reference Video</span>
              </div>

              <div className="flex items-center flex-wrap gap-2 border-l border-slate-500/40 px-3 py-2.5">
                <FileCheck2
                  size={12}
                  strokeWidth={1.8}
                  className="text-emerald-400"
                />

                {data?.data?.video?.referenceFiles.map((item) => (
                  <button
                    onClick={() =>
                      window.open(item.url, "_blank", "noopener, norefferrer")
                    }
                    className="text-[13px] font-medium underline cursor-pointer text-white"
                  >
                    Reference-file
                  </button>
                ))}
              </div>
            </div>

            {/* ================= CERTIFICATE ================= */}

            {/* Content for Certificate */}
            {/* <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />

                <span className="text-[14px] font-medium text-white">
                  Content for Certificate
                </span>
              </div>

              <p className="text-[13px] leading-4 text-white">
                {data?.data?.poster?.certificateContent} 
              </p>
            </div> */}

            {/* Reference Certificate */}
            {/* <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-500/30 bg-[#2a3347]">
              <div className="flex items-center px-3 py-2.5">
                <span className="text-[13px] text-white">
                  Reference Certificate
                </span>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-500/40 px-3 py-2.5">
                <FileCheck2
                  size={12}
                  strokeWidth={1.8}
                  className="text-emerald-400"
                />

                <span className="text-[13px] font-medium text-white">
                  Previous Event Completion Document.pdf
                </span>
              </div>
            </div> */}

            {/* ================= TROPHY ================= */}

            {/* Content for Trophy */}
            {/* <div className="mb-2 rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />

                <span className="text-[14px] font-medium text-white">
                  Content for Trophy
                </span>
              </div>

              <p className="text-[13px] leading-4 text-white">
                {data?.data?.poster?.trophyContent}
              </p>
            </div> */}

            {/* ================= REQUIREMENTS ================= */}

            <div className="mb-2 grid grid-cols-2 gap-2">
              {/* Display Requirement */}
              <div className="rounded-lg border border-slate-500/30 bg-[#2a3347] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <FileText
                    size={11}
                    strokeWidth={1.8}
                    className="text-white"
                  />

                  <span className="text-[14px] font-medium text-white">
                    Pre-Event Videos
                  </span>
                </div>

                <div className="requirement-container">
                  {data?.data?.video?.preEventVideos?.map((item) => (
                    <p className="mb-2 text-[13px] font-medium text-white">
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              {/* Size Requirement */}
              <div className="rounded-lg border border-slate-500/30 bg-[#2a3347] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <FileText
                    size={11}
                    strokeWidth={1.8}
                    className="text-white"
                  />

                  <span className="text-[14px] font-medium text-white">
                    Post-Event Videos
                  </span>
                </div>

                {data?.data?.video?.postEventVideos?.map((item) => {
                  return (
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[13px] text-white">{item}</span>
                    </div>
                  );
                })}
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
                    className="text-white"
                  />

                  <span className="text-[13px] text-white">Delivery Date</span>
                </div>

                <span className="text-[13px] font-semibold text-white">
                  {formatDate(data?.data?.video?.deliveryDate)}
                </span>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[13px] text-white">Priority</span>

                <span
                  className={`text-[13px] font-semibold ${data?.data?.video?.priority == "High" ? "text-red-500" : "text-green-500"}  `}
                >
                  {data?.data?.video?.priority}
                </span>
              </div>
            </div>

            {/* ================= SPECIAL REQUIREMENT ================= */}

            <div className="rounded-lg border border-slate-500/40 bg-[#2a3347] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText size={11} strokeWidth={1.8} className="text-white" />

                <span className="text-[14px] font-medium text-white">
                  Special Requirement
                </span>
              </div>

              <p className="text-[13px] leading-4 text-white">
                {data?.data?.video?.specialRequirements || "--"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default IndividualMediaDetailPage;
