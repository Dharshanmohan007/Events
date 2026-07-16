import React, { useState } from "react";
import { FileText, Image as ImageIcon, Video as VideoIcon, Paperclip, Clock, Flag } from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────

function getFileLabel(file) {
  if (!file) return "";
  if (file instanceof File) return file.name;
  if (typeof file === "string") return file.split("/").pop();
  if (file.name) return file.name;
  if (file.url) return file.url.split("/").pop();
  return "Document";
}

function fileTypeIcon(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return <ImageIcon className="w-4 h-4 text-green-400" />;
  if (["mp4", "mov", "avi", "mkv"].includes(ext)) return <VideoIcon className="w-4 h-4 text-green-400" />;
  return <FileText className="w-4 h-4 text-green-400" />;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

const asFileArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// ── Presentational primitives ────────────────────────────────────────────────

const ContentBlock = ({ icon, label, content }) => (
  <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-5">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h4 className="text-white text-sm font-semibold">{label}</h4>
    </div>
    <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">
      {content?.trim() ? content : "—"}
    </p>
  </div>
);

const FileRow = ({ label, files = [] }) => {
  const list = asFileArray(files);
  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] flex items-stretch overflow-hidden">
      <div className="flex-1 flex items-center px-5 py-4">
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="w-px bg-[#3A3A5A]" />
      <div className="flex-1 flex flex-wrap items-center gap-3 px-5 py-4">
        {list.length === 0 ? (
          <span className="text-gray-600 text-xs">No file uploaded</span>
        ) : (
          list.map((f, i) => {
            const name = getFileLabel(f);
            return (
              <span key={i} className="flex items-center gap-2 text-sm text-white">
                {fileTypeIcon(name)}
                <span className="truncate max-w-[160px]">{name}</span>
              </span>
            );
          })
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon }) => (
  <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] flex items-stretch overflow-hidden">
    <div className="flex-1 flex items-center gap-2 px-5 py-4">
      {icon}
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
    <div className="w-px bg-[#3A3A5A]" />
    <div className="flex-1 flex items-center px-5 py-4">
      <span className="text-white text-sm">{value || "—"}</span>
    </div>
  </div>
);

const PillList = ({ label, items = [] }) => (
  <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-5">
    <h4 className="text-white text-sm font-semibold mb-3">{label}</h4>
    <div className="flex flex-wrap gap-2">
      {(!items || items.length === 0) ? (
        <span className="text-gray-600 text-xs">—</span>
      ) : (
        items.map((it, i) => (
          <span
            key={i}
            className="text-xs px-3 py-1.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30"
          >
            {it}
          </span>
        ))
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30 whitespace-nowrap">
    {status}
  </span>
);

// ── Poster / Video preview sections ──────────────────────────────────────────

function PosterPreview({ data = {} }) {
  const showFlex = data.displayNeeded?.includes("Flex");
  const showGlass = data.displayNeeded?.includes("Glass Sticker");

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[#9810fa] text-base font-semibold">Poster</h3>

      <ContentBlock icon={<FileText className="w-4 h-4 text-purple-400" />} label="Content for Poster" content={data.contentPoster} />
      <FileRow label="Reference poster" files={data.referencePoster} />

      <ContentBlock icon={<FileText className="w-4 h-4 text-purple-400" />} label="Content for Certificate" content={data.contentCertificate} />
      <FileRow label="Reference Certificate" files={data.referenceCertificate} />

      <ContentBlock icon={<FileText className="w-4 h-4 text-purple-400" />} label="Content for Trophy" content={data.contentTrophy} />

      <PillList label="Display Needed" items={data.displayNeeded} />

      {(showFlex || showGlass) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {showFlex && <InfoRow label="Size for Flex" value={data.sizeForFlex} />}
          {showGlass && <InfoRow label="Size for Glass Sticker" value={data.sizeForGlass} />}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoRow icon={<Clock className="w-4 h-4 text-purple-400" />} label="Delivery Date" value={formatDate(data.deliveryDate)} />
        <InfoRow icon={<Flag className="w-4 h-4 text-purple-400" />} label="Priority" value={data.priority} />
      </div>

      {data.specialReq?.trim() && (
        <ContentBlock icon={<Paperclip className="w-4 h-4 text-purple-400" />} label="Special Requirements" content={data.specialReq} />
      )}
    </div>
  );
}

function VideoPreview({ data = {} }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[#9810fa] text-base font-semibold">Video</h3>

      <ContentBlock icon={<VideoIcon className="w-4 h-4 text-purple-400" />} label="Content for Video" content={data.contentVideo} />

      <PillList label="Pre-Event Videos Needed" items={data.preEvent} />
      <PillList label="Event Coverage Needed" items={data.eventCoverage} />
      <PillList label="Post-Event Videos Needed" items={data.postEvent} />
      <PillList label="Special Videos Needed" items={data.specialVideos} />

      <FileRow label="Reference Video" files={data.referenceVideo} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoRow icon={<Clock className="w-4 h-4 text-purple-400" />} label="Delivery Date" value={formatDate(data.deliveryDate)} />
        <InfoRow icon={<Flag className="w-4 h-4 text-purple-400" />} label="Priority" value={data.priority} />
      </div>

      {data.specialReq?.trim() && (
        <ContentBlock icon={<Paperclip className="w-4 h-4 text-purple-400" />} label="Special Requirements" content={data.specialReq} />
      )}
    </div>
  );
}

// ── Main MediaPreview ─────────────────────────────────────────────────────────

export default function MediaPreview({ media, mediaData, eventDays = [], status = "Pending Acknowledgment" }) {
  const [activeDay, setActiveDay] = useState(0);

  // Accept both media and mediaData props
    const rawData = mediaData ?? media;
    const mediaItems = Array.isArray(rawData)
    ? rawData
    : rawData
    ? [rawData]
    : [];

  const dayCount = mediaItems.length;

  if (dayCount === 0) {
    return (
      <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
        <p className="text-gray-400 text-sm">No media requirement details submitted.</p>
      </div>
    );
  }

  const dayLabel = (i) => {
    const d = eventDays?.[i]?.date;
    return d ? `Day ${i + 1} • ${formatDate(d)}` : `Day ${i + 1}`;
  };

  const current = mediaItems[activeDay] || {};
  const showPoster = current.designType === "Poster" || current.designType === "Both";
  const showVideo = current.designType === "Video" || current.designType === "Both";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[#9810fa] text-xl font-bold playfair">Media Details</h2>
          <p className="text-gray-400 text-sm mt-1">
            Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
            standard dummy text.
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {dayCount > 1 && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: dayCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`text-xs sm:text-sm px-4 py-2 rounded-full border transition-colors duration-150 ${
                activeDay === i
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-transparent border-[#3A3A5A] text-gray-400 hover:border-purple-500/60 hover:text-white"
              }`}
            >
              {dayLabel(i)}
            </button>
          ))}
        </div>
      )}

      {!current.designType && (
        <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
          <p className="text-gray-400 text-sm">No design type selected for this day.</p>
        </div>
      )}

      {showPoster && <PosterPreview data={current.poster} />}
      {showVideo && <VideoPreview data={current.video} />}
    </div>
  );
}