import { useRef, useState, useCallback } from "react";
import { gradientForColorKey } from "../../utils/departmentColors.js";
import { formatTimeRange } from "../../utils/dateUtils.js";

/** 
 * A single event block. `size` controls how much detail is shown:
 *  - "day"   : big block, name + venue/subtitle + time
 *  - "week"  : compact block, name + time
 *  - "chip"  : tiny month-view pill, name only
 *
 * Tooltip uses position:fixed so it is never clipped by any overflow container.
 */
export default function EventCard({ event, size = "week", style, onClick }) {
  const gradient = gradientForColorKey(event.color);
  const cardRef  = useRef(null);
  const [tooltip, setTooltip] = useState(null); // { top, left } when visible

  const orgName   = event.organizerName   || "N/A";
  const orgEmpId  = event.organizerEmpId  || "N/A";
  const orgMobile = event.organizerMobile || "N/A";

  const TOOLTIP_WIDTH = 224; // w-56 = 224px
  const TOOLTIP_GAP   = 8;   // gap above the card

  const showTooltip = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    // Prefer above the card; fall back to below if not enough space
    let top = rect.top - TOOLTIP_GAP;
    const fitsAbove = top > 160; // rough height of tooltip ~130px + some breathing room
    if (!fitsAbove) top = rect.bottom + TOOLTIP_GAP;
    else top = rect.top - 160; // position tooltip top so it ends just above card

    // Center horizontally, clamp so it stays inside viewport
    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 8));

    setTooltip({ top, left });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  if (size === "chip") {
    return (
      <button
        onClick={onClick}
        title={event.eventName}
        className={`w-full truncate rounded-md bg-gradient-to-r ${gradient} px-2 py-0.5 text-left text-[11px] font-medium text-white/95 shadow-sm hover:brightness-110`}
      >
        {event.eventName}
      </button>
    );
  }

  return (
    <>
      <button
        ref={cardRef}
        onClick={onClick}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        style={style}
        className={`absolute left-1 right-1 overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-3 text-left text-white shadow-lg shadow-black/30 ring-1 ring-white/10 transition hover:brightness-110`}
      >
        <p className="truncate text-[13px] font-bold uppercase tracking-wide">
          {event.eventName}
        </p>
        {size === "day" && event.venueName && (
          <p className="mt-0.5 truncate text-xs text-white/80">
            {event.venueName}
            {event.department ? ` \u00b7 ${event.department}` : ""}
          </p>
        )}
        {!event.venueName && event.department && size !== "week" && (
          <p className="mt-0.5 truncate text-xs text-white/80">{event.department}</p>
        )}
        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/90">
          <span className="inline-block h-1 w-1 rounded-full bg-white/90" />
          {formatTimeRange(event.startTime, event.endTime)}
        </p>
      </button>

      {/* Tooltip rendered via fixed positioning — never clipped by any overflow */}
      {tooltip && (
        <div
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          style={{ position: "fixed", top: tooltip.top, left: tooltip.left, width: TOOLTIP_WIDTH, zIndex: 9999 }}
          className="rounded-lg border border-[#2e394e] bg-[#0f172a] p-2.5 shadow-xl text-left pointer-events-none"
        >
          <p className="text-[14px] font-semibold text-white truncate">{event.eventName}</p>
          <p className="text-[14px] text-[#853FF9] font-medium mb-1.5">
            {event.department || "N/A"} &bull; {formatTimeRange(event.startTime, event.endTime)}
          </p>
          <div className="border-t border-[#1e293b] pt-1.5 space-y-0.5 text-[12px] text-slate-300">
            <p><span className="text-slate-400 font-medium">Organizer:</span> {orgName}</p>
            <p><span className="text-slate-400 font-medium">Emp ID:</span> {orgEmpId}</p>
            <p><span className="text-slate-400 font-medium">Mobile:</span> {orgMobile}</p>
          </div>
        </div>
      )}
    </>
  );
}
