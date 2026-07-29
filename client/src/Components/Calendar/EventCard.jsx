import { gradientForColorKey } from "../../utils/departmentColors.js";
import { formatTimeRange } from "../../utils/dateUtils.js";

/** 
 * A single event block. `size` controls how much detail is shown:
 *  - "day"   : big block, name + venue/subtitle + time
 *  - "week"  : compact block, name + time
 *  - "chip"  : tiny month-view pill, name only
 */
export default function EventCard({ event, size = "week", style, onClick }) {
  const gradient = gradientForColorKey(event.color);

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
    <button
      onClick={onClick}
      style={style}
      className={`group absolute left-1 right-1 overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-3 text-left text-white shadow-lg shadow-black/30 ring-1 ring-white/10 transition hover:brightness-110`}
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
  );
}
