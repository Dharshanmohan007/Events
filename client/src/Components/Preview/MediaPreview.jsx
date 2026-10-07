import React, { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Flag,
  Image as ImageIcon,
  Paperclip,
  Video as VideoIcon,
  X,
} from "lucide-react";

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function getFileLabel(file) {
  if (!file) return "";
  if (file instanceof File) return file.name;
  if (typeof file === "string") return file.split("/").pop();

  const label =
    file.originalName ||
    file.originalFilename ||
    file.fileName ||
    file.name ||
    file.filename ||
    file.url ||
    file.path ||
    file.key ||
    "Document";

  return typeof label === "string" ? label.split("/").pop() : "Document";
}

function getArrayValue(arr1, arr2) {
  if (Array.isArray(arr1) && arr1.length > 0) return arr1;
  if (Array.isArray(arr2) && arr2.length > 0) return arr2;
  return Array.isArray(arr1) ? arr1 : Array.isArray(arr2) ? arr2 : [];
}

function getFileUrl(file) {
  if (!file) return "";

  if (file instanceof File) {
    return URL.createObjectURL(file);
  }

  const API = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

  if (typeof file === "string") {
    if (
      file.startsWith("http://") ||
      file.startsWith("https://") ||
      file.startsWith("blob:")
    ) {
      return file;
    }

    return `${API}/${file.replace(/^\/+/, "")}`;
  }

  const path =
    file.url ||
    file.fileUrl ||
    file.downloadUrl ||
    file.path ||
    file.filePath ||
    file.key ||
    file.filename ||
    file.name;

  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  return `${API}/${path.replace(/^\/+/, "")}`;
}

function isImageFile(file) {
  if (!file) return false;
  const mime = file?.mimeType || file?.type || "";
  if (mime.startsWith("image/")) return true;
  const name = getFileLabel(file);
  const ext = name.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
}

function isVideoFile(file) {
  if (!file) return false;
  const mime = file?.mimeType || file?.type || "";
  if (mime.startsWith("video/")) return true;
  const name = getFileLabel(file);
  const ext = name.split(".").pop()?.toLowerCase();
  return ["mp4", "mov", "avi", "mkv", "webm"].includes(ext);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";

  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const asFileArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// -------------------------------------------------------
// Header
// -------------------------------------------------------

function PreviewHeader({ description }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-purple-400 playfair">
          Media Preview
        </h2>

        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 max-w-3xl leading-6">
          {description}
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Divider Card
// -------------------------------------------------------

function TwoColumnCard({
  leftLabel,
  leftValue,
  leftIcon: LeftIcon,
  rightLabel,
  rightValue,
  rightIcon: RightIcon,
}) {
  return (
    <div className="bg-slate-50 dark:bg-white dark:bg-[#252C3F] border border-slate-200 dark:border-slate-200 dark:border-[#343C59] rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-3">
            {LeftIcon && <LeftIcon size={18} className="text-[#C4B5FD]" />}
            <span className="text-[14px] text-[#C4C8D4]">{leftLabel}</span>
          </div>

          <span className="font-semibold text-slate-900 dark:text-white text-[14px]">
            {leftValue || "—"}
          </span>
        </div>

        <div className="border-l border-slate-200 dark:border-slate-200 dark:border-[#434A60] flex items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-3">
            {RightIcon && <RightIcon size={18} className="text-[#C4B5FD]" />}
            <span className="text-[14px] text-[#C4C8D4]">{rightLabel}</span>
          </div>

          <span className="font-semibold text-slate-900 dark:text-white text-[14px] text-right">
            {rightValue || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Section Card
// -------------------------------------------------------

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-[#20263B] border border-slate-200 dark:border-[#343C59] p-5 min-w-0 overflow-hidden">
      <h3 className="flex items-center gap-2 font-semibold mb-5 text-lg">
        <Icon size={18} className="text-[#C4B5FD]" />
        {title}
      </h3>

      <div className="space-y-3 min-w-0">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="flex-1 min-w-[180px] max-w-full">
      <p className="text-[13px] text-[#C4C8D4] mb-1.5">{label}</p>
      <p className="text-[14px] text-slate-900 dark:text-white font-semibold break-words overflow-hidden">{value}</p>
    </div>
  );
}

function DetailGrid({ items }) {
  const visible = (items || []).filter(
    (item) => item.value !== undefined && item.value !== null && item.value !== ""
  );

  if (visible.length === 0) return null;

  const rows = [];
  for (let i = 0; i < visible.length; i += 2) {
    rows.push(visible.slice(i, i + 2));
  }

  return (
    <div className="flex flex-col gap-5">
      {rows.map((pair, idx) => (
        <div
          key={idx}
          className={`flex flex-wrap gap-6 ${
            idx < rows.length - 1 ? "pb-5 border-b border-slate-200 dark:border-slate-200 dark:border-[#434A60]" : ""
          }`}
        >
          {pair.map((item, i) => (
            <DetailRow key={i} label={item.label} value={item.value} />
          ))}
        </div>
      ))}
    </div>
  );
}

function FileChip({ file, label, onOpen }) {
  const name = getFileLabel(file);
  const url = getFileUrl(file);
  const isImage = isImageFile(file);
  const isVideo = isVideoFile(file);

  if (!name) return null;

  return (
    <button
      type="button"
      onClick={() => onOpen({ name, url, isImage, isVideo })}
      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-[#2E3652] bg-white dark:bg-[#161B2D] px-3 py-2 text-left hover:border-slate-200 dark:border-[#8B5CF6] transition-colors"
    >
      {isImage ? (
        <ImageIcon className="w-4 h-4 text-[#C4B5FD]" />
      ) : isVideo ? (
        <VideoIcon className="w-4 h-4 text-[#C4B5FD]" />
      ) : (
        <FileText className="w-4 h-4 text-[#C4B5FD]" />
      )}

      <span className="text-[13px] text-slate-900 dark:text-white truncate max-w-[180px]">{name}</span>
    </button>
  );
}

function PreviewModal({
  open,
  title,
  src,
  type,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6">
      <div className="relative w-full max-w-6xl rounded-2xl bg-slate-50 dark:bg-white dark:bg-[#1C2233] border border-slate-200 dark:border-slate-200 dark:border-[#343C59] shadow-2xl">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-white dark:bg-[#2A3042] hover:bg-slate-50 dark:bg-[#374151]"
        >
          <X size={20} className="text-slate-900 dark:text-white" />
        </button>

        <div className="p-5 border-b border-slate-200 dark:border-slate-200 dark:border-[#343C59]">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
        </div>

        <div className="flex items-center justify-center bg-black p-5 max-h-[85vh] overflow-auto">
          {type === "image" ? (
            <img
              src={src}
              alt={title}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
              onError={(e) => {
                // console.log("Image URL:", src);
                e.target.src =
                  "https://placehold.co/800x500?text=Image+Not+Found";
              }}
            />
          ) : (
            <video
              src={src}
              controls
              className="max-h-[80vh] max-w-full rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-white dark:bg-[#161B2D] rounded-xl border border-slate-200 dark:border-[#2E3652] p-12 text-center text-slate-900 dark:text-white">
      <p className="text-slate-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

function DayTabs({ labels, current, onChange }) {
  if (!labels || labels.length <= 1) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {labels.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`px-6 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap ${
            i === current
              ? "bg-purple-600 text-slate-900 dark:text-white"
              : "bg-white dark:bg-[#1c1c34] text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-[#2a2a45] hover:text-slate-900 dark:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// -------------------------------------------------------
// Content blocks
// -------------------------------------------------------

function ContentBlock({ icon: Icon, title, content }) {
  return (
    <div className="bg-white dark:bg-[#161B2D] border border-slate-200 dark:border-[#2E3652] rounded-xl p-4 min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-purple-400" />
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
      </div>

      <p className="w-full min-w-0 overflow-hidden text-slate-500 dark:text-gray-400 text-sm leading-6 whitespace-pre-wrap break-words">
        {content?.trim() ? content : "—"}
      </p>
    </div>
  );
}

function PillList({ label, items = [] }) {
  return (
    <div className="bg-white dark:bg-[#161B2D] border border-slate-200 dark:border-[#2E3652] rounded-xl p-4 min-w-0 overflow-hidden">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{label}</h4>

      <div className="flex flex-wrap gap-2">
        {(!items || items.length === 0) ? (
          <span className="text-[14px] text-[#98A2B3]">—</span>
        ) : (
          items.map((item, index) => (
            <span
              key={index}
              className="rounded-full border border-slate-200 dark:border-[#7C3AED]/40 bg-[#7C3AED]/15 px-3 py-1 text-[13px] text-[#C4B5FD]"
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function FileDisplayRow({ label, files = [], onOpen }) {
  const list = asFileArray(files);

  return (
    <div className="bg-white dark:bg-[#161B2D] border border-slate-200 dark:border-[#2E3652] rounded-xl p-4">
      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{label}</p>

      {list.length === 0 ? (
        <span className="text-[14px] text-[#98A2B3]">No file uploaded</span>
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.map((file, index) => (
            <FileChip key={index} file={file} label={label} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-[#161B2D] border border-slate-200 dark:border-[#2E3652] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-purple-400" />
        <span className="text-slate-500 dark:text-gray-400 text-xs uppercase">{label}</span>
      </div>

      <p className="text-[14px] text-slate-900 dark:text-white font-semibold">{value || "—"}</p>
    </div>
  );
}

// -------------------------------------------------------
// Poster / Video preview sections
// -------------------------------------------------------

function PosterPreview({ data = {}, dayData = {}, onOpen }) {
  const flexSize = data.sizeForFlex || data.sizes?.find((s) => s.type === "Flex")?.value || "";
  const glassSize = data.sizeForGlass || data.sizes?.find((s) => s.type === "Glass Sticker")?.value || "";
  const showFlex = data.displayNeeded?.includes("Flex") || !!flexSize;
  const showGlass = data.displayNeeded?.includes("Glass Sticker") || !!glassSize;

  const referencePosterFiles = getArrayValue(dayData.referencePosterFiles, getArrayValue(data.referencePoster, data.referencePosterFiles));
  const referenceCertificateFiles = getArrayValue(dayData.referenceCertificateFiles, getArrayValue(data.referenceCertificate, data.referenceCertificateFiles));
  const specialReqs = data.specialReq || data.specialRequirements || "";

  return (
    <div className="space-y-4">
      <SectionCard title="Poster" icon={FileText}>
        <ContentBlock title="Content for Poster" icon={FileText} content={data.contentPoster || data.posterContent} />
        <FileDisplayRow label="Reference Poster" files={referencePosterFiles} onOpen={onOpen} />

        <ContentBlock title="Content for Certificate" icon={FileText} content={data.contentCertificate || data.certificateContent} />
        <FileDisplayRow label="Reference Certificate" files={referenceCertificateFiles} onOpen={onOpen} />

        <ContentBlock title="Content for Trophy" icon={FileText} content={data.contentTrophy || data.trophyContent} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <PillList label="Display Needed" items={data.displayNeeded} />

          {(showFlex || showGlass) ? (
            <div className="space-y-3">
              {showFlex && <InfoRow label="Size for Flex" value={flexSize} icon={Clock} />}
              {showGlass && <InfoRow label="Size for Glass Sticker" value={glassSize} icon={Flag} />}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161B2D] border border-slate-200 dark:border-[#2E3652] rounded-xl p-4">
              <p className="text-slate-500 dark:text-gray-400">No display size selected.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoRow label="Delivery Date" value={formatDate(data.deliveryDate)} icon={Calendar} />
          <InfoRow label="Priority" value={data.priority} icon={Flag} />
        </div>

        {specialReqs?.trim() && (
          <ContentBlock title="Special Requirements" icon={Paperclip} content={specialReqs} />
        )}
      </SectionCard>
    </div>
  );
}

function VideoPreview({ data = {}, dayData = {}, onOpen }) {
  const referenceVideoFiles = getArrayValue(dayData.referenceFiles, getArrayValue(data.referenceVideo, data.referenceFiles));
  const preEvent = getArrayValue(data.preEvent, data.preEventVideos);
  const postEvent = getArrayValue(data.postEvent, data.postEventVideos);
  const specialReqs = data.specialReq || data.specialRequirements || "";

  return (
    <div className="space-y-4">
      <SectionCard title="Video" icon={VideoIcon}>
        <ContentBlock title="Content for Video" icon={VideoIcon} content={data.contentVideo || data.videoContent} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <PillList label="Pre-Event Videos Needed" items={preEvent} />
          <PillList label="Event Coverage Needed" items={data.eventCoverage} />
          <PillList label="Post-Event Videos Needed" items={postEvent} />
          <PillList label="Special Videos Needed" items={data.specialVideos} />
        </div>

        <FileDisplayRow label="Reference Video" files={referenceVideoFiles} onOpen={onOpen} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoRow label="Delivery Date" value={formatDate(data.deliveryDate)} icon={Calendar} />
          <InfoRow label="Priority" value={data.priority} icon={Flag} />
        </div>

        {specialReqs?.trim() && (
          <ContentBlock title="Special Requirements" icon={Paperclip} content={specialReqs} />
        )}
      </SectionCard>
    </div>
  );
}

// -------------------------------------------------------
// Main Component
// -------------------------------------------------------

const DEFAULT_DESCRIPTION =
  "Review the media requirement details for the selected event day, including poster, certificate, and video references before final submission.";

export default function MediaPreview({
  media,
  mediaData,
  eventDays = [],
  status = "Pending Acknowledgment",
  description = DEFAULT_DESCRIPTION,
}) {
  const [activeDay, setActiveDay] = useState(0);
  const [modalData, setModalData] = useState({ open: false, title: "", src: "", type: "image" });

  const rawData = mediaData ?? media;
  const mediaItems = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
  const dayCount = mediaItems.length;

  const current = mediaItems[activeDay] || {};
  const showPoster =
    current.designType === "Poster" ||
    current.designType === "Both" ||
    (Array.isArray(current.typeOfMedia) && current.typeOfMedia.includes("poster"));
  const showVideo =
    current.designType === "Video" ||
    current.designType === "Both" ||
    (Array.isArray(current.typeOfMedia) && current.typeOfMedia.includes("video"));

  const dayLabels = useMemo(
    () =>
      mediaItems.map((_, index) => {
        const d = eventDays?.[index]?.date;
        return d ? `Day ${index + 1} • ${formatDate(d)}` : `Day ${index + 1}`;
      }),
    [mediaItems, eventDays]
  );

  if (dayCount === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#161B2D] rounded-xl border border-slate-200 dark:border-[#2E3652] p-6 text-slate-900 dark:text-white space-y-6">
          <PreviewHeader description={description} />
        </div>
        <EmptyState message="No media requirement details submitted." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#161B2D] rounded-xl border border-slate-200 dark:border-[#2E3652] p-6 text-slate-900 dark:text-white space-y-6">
        <PreviewHeader description={description} />

        {/* <TwoColumnCard
          leftLabel="Design Type"
          leftValue={current.designType || "—"}
          leftIcon={FileText}
          rightLabel="Status"
          rightValue={status}
          rightIcon={Flag}
        /> */}

        <DayTabs labels={dayLabels} current={activeDay} onChange={setActiveDay} />

        {!current.designType && (
          <EmptyState message="No design type selected for this day." />
        )}

        {showPoster && (
          <PosterPreview data={current.poster || {}} dayData={current} onOpen={(item) => setModalData({ open: true, ...item, type: item.isImage ? "image" : item.isVideo ? "video" : "image" })} />
        )}

        {showVideo && (
          <VideoPreview data={current.video || {}} dayData={current} onOpen={(item) => setModalData({ open: true, ...item, type: item.isImage ? "image" : item.isVideo ? "video" : "video" })} />
        )}
      </div>

      <PreviewModal
        open={modalData.open}
        title={modalData.title}
        src={modalData.src}
        type={modalData.type}
        onClose={() => setModalData((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}