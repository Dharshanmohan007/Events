import React, { useState, useEffect } from "react";
import { Calendar, CreditCard, FileText, User, Users } from "lucide-react";

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function formatDate(date) {
  if (!date) return "—";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function padQty(value) {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value).trim();
  if (/^\d+$/.test(str) && str.length === 1) return `0${str}`;
  return str;
}

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
      // fall through
    }
  }
  return `Day ${index + 1}`;
}

// -------------------------------------------------------
// Header
// -------------------------------------------------------

function PreviewHeader({ description }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-purple-400 playfair">
          Purchase Preview
        </h2>

        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 leading-6">
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
    <div className="rounded-xl bg-slate-50 dark:bg-[#20263B] border border-slate-200 dark:border-[#343C59] p-5">
      <h3 className="flex items-center gap-2 font-semibold mb-5 text-lg">
        <Icon size={18} className="text-[#C4B5FD]" />
        {title}
      </h3>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="flex-1 min-w-[180px]">
      <p className="text-[13px] text-[#C4C8D4] mb-1.5">{label}</p>
      <p className="text-[14px] text-slate-900 dark:text-white font-semibold break-words">{value}</p>
    </div>
  );
}

function DetailGrid({ items }) {
  const visible = (items || []).filter(
    (item) =>
      item.value !== undefined &&
      item.value !== null &&
      item.value !== ""
  );

  if (!visible.length) return null;

  const rows = [];
  for (let i = 0; i < visible.length; i += 2) {
    rows.push(visible.slice(i, i + 2));
  }

  return (
    <div className="space-y-4">
      {rows.map((pair, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-[#161B2D] border border-slate-200 dark:border-[#2E3652] rounded-xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Section */}
            <div className="flex items-center justify-between px-6 py-6">
              <div>
                <p className="text-slate-500 dark:text-gray-400 text-xs uppercase mb-2">
                  {pair[0]?.label}
                </p>

                <p className="text-[15px] font-semibold text-slate-900 dark:text-white">
                  {pair[0]?.value}
                </p>
              </div>
            </div>

            {/* Right Section */}
            {pair[1] && (
              <div className="border-l border-slate-200 dark:border-[#495066] flex items-center justify-between px-6 py-6">
                <div>
                  <p className="text-slate-500 dark:text-gray-400 text-xs uppercase mb-2">
                    {pair[1].label}
                  </p>

                  <p className="text-[15px] font-semibold text-slate-900 dark:text-white">
                    {pair[1].value}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
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
// Data shaping
// -------------------------------------------------------

function buildPersonItems(personData = {}, kind) {
  const items = [];
  const giftType = personData.giftType || [];
  const trophyType = personData.trophyType || [];

  if (giftType.includes("Trophy")) {
    if (trophyType.includes("Basic")) {
      items.push({ label: "Basic Trophy Quantity", value: padQty(personData.basicTrophyQty) });
    }

    if (trophyType.includes("Elite")) {
      items.push({ label: "Elite Trophy Quantity", value: padQty(personData.eliteTrophyQty) });
    }
  }

  if (kind === "student" && giftType.includes("Cash Prize")) {
    items.push({
      label: "Cash Prize Amount",
      value:
        personData.cashPrizeAmount !== "" && personData.cashPrizeAmount !== undefined
          ? `₹ ${personData.cashPrizeAmount}`
          : "",
    });
  }

  if (kind === "guest" && giftType.includes("Gifts")) {
    items.push({ label: "Gift Count", value: padQty(personData.giftsQty ?? personData.glassCupQty) });
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
      items.push({ label: `Voucher worth Quantity (${w})`, value: padQty(worthQty[w]) });
    });
  }

  return items;
}

function requirementItems(day) {
  const items = [];

  if (day.requirementNeeded?.includes("Id Card")) {
    items.push({ label: "Id Card Hard Copy Quantity", value: padQty(day.idCardQty) });
  }

  if (day.requirementNeeded?.includes("Certificate")) {
    items.push({ label: "Certificate Hard Copy Quantity", value: padQty(day.certificateQty) });
  }

  return items;
}

// -------------------------------------------------------
// Day Preview
// -------------------------------------------------------

function SpecialRequirementBox({ text }) {
  if (!text || !text.trim()) return null;

  return (
    <div className="bg-white dark:bg-[#161B2D] border border-slate-200 dark:border-[#2E3652] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={16} className="text-purple-400" />
        <span className="text-sm font-semibold text-slate-900 dark:text-white">Special Requirement</span>
      </div>
      <p className="text-slate-500 dark:text-gray-400 text-sm leading-6 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function DayPreview({ day }) {
  if (!day) {
    return <EmptyState message="No purchase details were provided for this day." />;
  }

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
    <div className="space-y-6">
      {reqItems.length > 0 && (
        <SectionCard title="Required Quantity" icon={FileText}>
          <DetailGrid items={reqItems} />
        </SectionCard>
      )}

      {showStudent && (
        <SectionCard title="Students" icon={Users}>
          <DetailGrid items={studentItems} />
          <SpecialRequirementBox text={day.studentData?.specialRequirements} />
        </SectionCard>
      )}

      {showGuest && (
        <SectionCard title="Guest" icon={User}>
          <DetailGrid items={guestItems} />
          <SpecialRequirementBox text={day.guestData?.specialRequirements} />
        </SectionCard>
      )}
    </div>
  );
}

// -------------------------------------------------------
// Main Component
// -------------------------------------------------------

const DEFAULT_DESCRIPTION =
  "Review the purchase requisition details for the selected event day, including required quantities, student or guest gifting data, and any special purchase instructions before final submission.";

export default function PurchasePreview({
  purchase,
  purchaseData,
  eventDays = [],
  description = DEFAULT_DESCRIPTION,
}) {
  const rawData = purchaseData ?? purchase;
  const days = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];

  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    if (currentDayIndex >= days.length) {
      setCurrentDayIndex(Math.max(days.length - 1, 0));
    }
  }, [days.length, currentDayIndex]);

  if (days.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#161B2D] rounded-xl border border-slate-200 dark:border-[#2E3652] p-6 text-slate-900 dark:text-white space-y-6">
          <PreviewHeader description={description} />
        </div>
        <EmptyState message="No purchase details have been submitted yet." />
      </div>
    );
  }

  const dayLabels = days.map((day, i) => formatDayLabel(eventDays[i], i));
  const currentDay = days[currentDayIndex];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#161B2D] rounded-xl border border-slate-200 dark:border-[#2E3652] p-6 text-slate-900 dark:text-white space-y-6">
        <PreviewHeader description={description} />

        {/* <TwoColumnCard
          leftLabel="Purchase Day"
          leftValue={formatDayLabel(eventDays[currentDayIndex], currentDayIndex)}
          leftIcon={Calendar}
          rightLabel="Purchase Type"
          rightValue={currentDay?.selectedPersons || "—"}
          rightIcon={CreditCard}
        /> */}

        <DayTabs
          labels={dayLabels}
          current={currentDayIndex}
          onChange={setCurrentDayIndex}
        />

        <DayPreview day={currentDay} />
      </div>
    </div>
  );
}