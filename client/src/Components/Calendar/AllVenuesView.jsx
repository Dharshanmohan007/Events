import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { fetchAllVenuesEvents } from "../../api/calendarApi.js";
import { gradientForColorKey } from "../../utils/departmentColors.js";
import { formatTimeRange, isSameDay, isToday } from "../../utils/dateUtils.js";

/* ── constants ─────────────────────────────────────────────────────────────── */
const COL_W   = 140;
const VENUE_W = 190;
const ROW_MIN = 68;
const TT_W    = 224;

/* ── event chip with hover tooltip ─────────────────────────────────────────── */
function VenueEventChip({ event, onClick }) {
  const gradient = gradientForColorKey(event.color);
  const ref = useRef(null);
  const [tt, setTt] = useState(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let top = r.top > 160 ? r.top - 160 : r.bottom + 8;
    let left = Math.max(8, Math.min(r.left + r.width / 2 - TT_W / 2, window.innerWidth - TT_W - 8));
    setTt({ top, left });
  }, []);

  const hide = useCallback(() => setTt(null), []);

  return (
    <>
      <button
        ref={ref}
        onClick={onClick}
        onMouseEnter={show}
        onMouseLeave={hide}
        className={`w-full truncate rounded-lg bg-gradient-to-r ${gradient} px-2.5 py-1.5 text-left text-[11px] font-semibold text-white/95 shadow-sm ring-1 ring-white/10 transition hover:brightness-110 hover:scale-[1.02]`}
      >
        <span className="block truncate leading-tight">{event.eventName}</span>
        <span className="block truncate text-[10px] font-normal text-white/75 leading-tight mt-0.5">
          {formatTimeRange(event.startTime, event.endTime)}
        </span>
      </button>

      {tt && (
        <div
          style={{ position: "fixed", top: tt.top, left: tt.left, width: TT_W, zIndex: 9999 }}
          className="rounded-lg border border-[#2e394e] bg-[#0f172a] p-2.5 shadow-xl text-left pointer-events-none"
        >
          <p className="text-[14px] font-semibold text-white truncate">{event.eventName}</p>
          <p className="text-[14px] text-[#853FF9] font-medium mb-1.5">
            {event.department || "N/A"} &bull; {formatTimeRange(event.startTime, event.endTime)}
          </p>
          <div className="border-t border-[#1e293b] pt-1.5 space-y-0.5 text-[12px] text-slate-300">
            <p><span className="text-slate-400 font-medium">Organizer:</span> {event.organizerName || "N/A"}</p>
            <p><span className="text-slate-400 font-medium">Emp ID:</span> {event.organizerEmpId || "N/A"}</p>
            <p><span className="text-slate-400 font-medium">Mobile:</span> {event.organizerMobile || "N/A"}</p>
          </div>
        </div>
      )}
    </>
  );
}

/* ── main component ────────────────────────────────────────────────────────── */
export default function AllVenuesView({ currentDate, onSelectEvent }) {
  const [venues, setVenues]     = useState([]);
  const [eventsByVenue, setEventsByVenue] = useState({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // Days of the selected month
  const monthDays = useMemo(() => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const count = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => new Date(y, m, i + 1));
  }, [currentDate]);

  // Single API call to fetch all venues + events
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAllVenuesEvents({ date: currentDate })
      .then(({ venues: v, eventsByVenue: e }) => {
        if (cancelled) return;
        setVenues(v);
        setEventsByVenue(e);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load venue data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentDate]);

  // Events for a cell
  const cellEvents = useCallback(
    (venue, day) => (eventsByVenue[venue] || []).filter(
      (e) => e.eventDate && isSameDay(new Date(e.eventDate), day)
    ),
    [eventsByVenue]
  );

  const totalW = VENUE_W + monthDays.length * COL_W;

  /* ── loading / error ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          Loading all venues…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-8 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto table-custom-scrollbar">
      <div
        className="relative rounded-xl border border-white/5 bg-[#0d1220]"
        style={{ minWidth: totalW }}
      >
        {/* header row (sticky top) */}
        <div className="sticky top-0 z-20 flex border-b border-white/10" style={{ minWidth: totalW }}>
          <div
            className="sticky left-0 z-30 flex shrink-0 items-center border-r border-white/10 bg-[#0b0f1a] px-4 py-3"
            style={{ width: VENUE_W, minWidth: VENUE_W }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Venue / Date
            </span>
          </div>

          {monthDays.map((day, i) => {
            const today = isToday(day);
            const dayName = day.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
            return (
              <div
                key={i}
                className={[
                  "flex shrink-0 flex-col items-center justify-center border-r border-white/5 bg-[#0b0f1a] py-2.5",
                  today ? "bg-violet-500/10" : "",
                ].join(" ")}
                style={{ width: COL_W, minWidth: COL_W }}
              >
                <span className="text-[10px] font-medium text-slate-500">{dayName}</span>
                <span
                  className={[
                    "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    today ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30" : "text-slate-300",
                  ].join(" ")}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* venue rows */}
        {venues.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-slate-500">
            No venues available
          </div>
        )}

        {venues.map((venue, vi) => (
          <div
            key={venue}
            className={[
              "flex border-b border-white/5",
              vi % 2 === 0 ? "bg-white/[0.01]" : "bg-white/[0.03]",
            ].join(" ")}
            style={{ minHeight: ROW_MIN }}
          >
            {/* venue name (sticky left) */}
            <div
              className={[
                "sticky left-0 z-10 flex shrink-0 items-start  px-4 py-3",
                vi % 2 === 0 ? "bg-[#0c1120]" : "bg-[#0e1325]",
              ].join(" ")}
              style={{ width: VENUE_W, minWidth: VENUE_W }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-semibold text-slate-200 leading-tight">{venue}</span>
              </div>
            </div>

            {/* day cells */}
            {monthDays.map((day, di) => {
              const events = cellEvents(venue, day);
              const today = isToday(day);
              return (
                <div
                  key={di}
                  className={[
                    "flex shrink-0 flex-col gap-1.5 border-r border-white/5 p-1.5",
                    today ? "bg-violet-500/[0.04]" : "",
                  ].join(" ")}
                  style={{ width: COL_W, minWidth: COL_W, minHeight: ROW_MIN }}
                >
                  {events.map((event, ei) => (
                    <VenueEventChip
                      key={`${event.eventId || event._id}-${ei}`}
                      event={event}
                      onClick={() => onSelectEvent?.(event)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
