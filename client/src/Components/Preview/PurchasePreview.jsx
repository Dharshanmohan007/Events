import React, { useState, useEffect } from "react";

// ── Small presentational helpers ───────────────────────────────────────────

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 text-purple-400"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

const STATUS_STYLES = {
  "Pending Acknowledgment": "bg-pink-500/10 text-pink-400 border-pink-500/30",
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  Rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  Draft: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

// function StatusBadge({ status }) {
//   if (!status) return null;
//   const style = STATUS_STYLES[status] || STATUS_STYLES.Draft;
//   return (
//     <span
//       className={`shrink-0 text-[11px] sm:text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full border ${style}`}
//     >
//       {status}
//     </span>
//   );
// }

// Pads simple numeric-looking quantities so "1" reads as "01", matching the
// two-digit look used across the requisition preview screens.
function padQty(value) {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value).trim();
  if (/^\d+$/.test(str) && str.length === 1) return `0${str}`;
  return str;
}

function DetailRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex-1 min-w-[160px]">
      <p className="text-gray-400 text-xs mb-1.5">{label}</p>
      <p className="text-white text-sm font-semibold break-words">{value}</p>
    </div>
  );
}

// Renders a list of {label, value} items two-per-row, with a hairline
// divider between each row, matching the layout in the reference screens.
function DetailGrid({ items }) {
  const visible = (items || []).filter(
    (item) => item.value !== undefined && item.value !== null && item.value !== ""
  );
  if (visible.length === 0) return null;

  const rows = [];
  for (let i = 0; i < visible.length; i += 2) rows.push(visible.slice(i, i + 2));

  return (
    <div className="flex flex-col gap-5">
      {rows.map((pair, idx) => (
        <div
          key={idx}
          className={`flex flex-wrap gap-6 ${
            idx < rows.length - 1 ? "pb-5 border-b border-[#2A2A45]" : ""
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

function InfoCard({ children }) {
  return (
    <div className="rounded-2xl border border-[#2A2A45] bg-[#1B1B30] p-4 sm:p-6 flex flex-col gap-5">
      {children}
    </div>
  );
}

function SectionHeading({ children }) {
  return <h3 className="text-purple-400 text-base font-bold">{children}</h3>;
}

function SpecialRequirementBox({ text }) {
  if (!text || !text.trim()) return null;
  return (
    <div className="rounded-xl bg-[#16162A] border border-[#2A2A45] p-4">
      <div className="flex items-center gap-2 mb-2">
        <FileIcon />
        <span className="text-purple-300 text-sm font-medium">Special Requirement</span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-[#2A2A45] bg-[#1B1B30] p-6 text-center">
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

// ── Day tabs ────────────────────────────────────────────────────────────────

function formatDayLabel(day, index) {
  if (day?.date) {
    try {
      const d = new Date(day.date);
      if (!isNaN(d.getTime())) {
        const formatted = d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        });
        return `Day ${index + 1} · ${formatted}`;
      }
    } catch {
      // fall through to default label
    }
  }
  return `Day ${index + 1}`;
}

function DayTabs({ labels, current, onChange }) {
  if (!labels || labels.length <= 1) return null;
  return (
    <div className="flex gap-2 flex-wrap">
      {labels.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors duration-150 ${
            i === current
              ? "bg-purple-600 border-purple-600 text-white"
              : "border-[#3A3A5A] text-gray-400 hover:text-white hover:border-purple-500/60"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Data shaping ──────────────────────────────────────────────────────────

// Builds the ordered list of {label, value} rows for a Student or Guest
// gift card, mirroring the fields captured in the Purchase form.
function buildPersonItems(personData = {}, kind) {
  const items = [];
  const giftType = personData.giftType || [];
  const trophyType = personData.trophyType || [];

  if (giftType.includes("Trophy")) {
    if (trophyType.includes("Basic"))
      items.push({ label: "Basic Trophy Quantity", value: padQty(personData.basicTrophyQty) });
    if (trophyType.includes("Elite"))
      items.push({ label: "Elite Trophy Quantity", value: padQty(personData.eliteTrophyQty) });
  }

  if (kind === "student" && giftType.includes("Cash Prize")) {
    items.push({
      label: "Cash Prize Amount",
      value: personData.cashPrizeAmount !== "" && personData.cashPrizeAmount !== undefined
        ? `₹ ${personData.cashPrizeAmount}`
        : "",
    });
  }

  if (kind === "guest" && giftType.includes("Glass Cup")) {
    items.push({ label: "Glass Cup Quantity", value: padQty(personData.glassCupQty) });
  }

  if (personData.registrationKitNeeded === "Yes") {
    items.push({ label: "Registration Kit Quantity", value: padQty(personData.registrationKitQty) });
  }

  if (giftType.includes("Voucher")) {
    const worths = Array.isArray(personData.voucherWorth)
      ? personData.voucherWorth
      : personData.voucherWorth
      ? [personData.voucherWorth]
      : [];
    const worthQty = personData.voucherWorthQty || {};
    worths.forEach((w) => {
      items.push({ label: "Voucher worth", value: w });
      items.push({ label: `Voucher worth Quantity ( ${w} )`, value: padQty(worthQty[w]) });
    });
  }

  return items;
}

function requirementItems(day) {
  const items = [];
  if (day.requirementNeeded?.includes("Id Card"))
    items.push({ label: "Id Card Hard Copy Quantity", value: padQty(day.idCardQty) });
  if (day.requirementNeeded?.includes("Certificate"))
    items.push({ label: "Certificate Hard Copy Quantity", value: padQty(day.certificateQty) });
  return items;
}

// ── Single day preview ──────────────────────────────────────────────────────

function DayPreview({ day }) {
  if (!day) return <EmptyState message="No purchase details were provided for this day." />;

  const showStudent = day.selectedPersons === "Students" || day.selectedPersons === "Both";
  const showGuest = day.selectedPersons === "Guest" || day.selectedPersons === "Both";

  const reqItems = requirementItems(day);
  const studentItems = showStudent ? buildPersonItems(day.studentData, "student") : [];
  const guestItems = showGuest ? buildPersonItems(day.guestData, "guest") : [];

  const nothingToShow =
    reqItems.length === 0 && studentItems.length === 0 && guestItems.length === 0;

  if (nothingToShow) {
    return <EmptyState message="No purchase details were provided for this day." />;
  }

  return (
    <div className="flex flex-col gap-6">
      {reqItems.length > 0 && (
        <InfoCard>
          <DetailGrid items={reqItems} />
        </InfoCard>
      )}

      {showStudent && (
        <InfoCard>
          <SectionHeading>Students</SectionHeading>
          <DetailGrid items={studentItems} />
          <SpecialRequirementBox text={day.studentData?.specialRequirements} />
        </InfoCard>
      )}

      {showGuest && (
        <InfoCard>
          <SectionHeading>Guest</SectionHeading>
          <DetailGrid items={guestItems} />
          <SpecialRequirementBox text={day.guestData?.specialRequirements} />
        </InfoCard>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

const DEFAULT_DESCRIPTION =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's";

export default function PurchasePreview({
  purchase,
  purchaseData,
  eventDays = [],
  status = "Pending Acknowledgment",
  description = DEFAULT_DESCRIPTION,
}) {
  // Accept either `purchaseData` (array, matching the rest of the app) or the
  // simpler `purchase` prop name, and normalize to an array of day objects.
  const rawData = purchaseData ?? purchase;
  const days = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];

  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    if (currentDayIndex >= days.length) setCurrentDayIndex(Math.max(days.length - 1, 0));
  }, [days.length, currentDayIndex]);

  if (days.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-purple-400 text-xl font-bold">Purchase Details</h2>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">{description}</p>
          </div>
          {/* <StatusBadge status={status} /> */}
        </div>
        <EmptyState message="No purchase details have been submitted yet." />
      </div>
    );
  }

  const dayLabels = days.map((day, i) => formatDayLabel(eventDays[i], i));
  const currentDay = days[currentDayIndex];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-purple-400 text-xl font-bold">Purchase Details</h2>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">{description}</p>
        </div>
        {/* <StatusBadge status={status} /> */}
      </div>

      <DayTabs labels={dayLabels} current={currentDayIndex} onChange={setCurrentDayIndex} />

      <DayPreview day={currentDay} />
    </div>
  );
}