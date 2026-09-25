import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { fetchAllRoomsEvents } from "../../api/calendarApi.js";
import { gradientForColorKey } from "../../utils/departmentColors.js";
import { isSameDay, isToday } from "../../utils/dateUtils.js";

/* ── layout constants ─────────────────────────────────────────────────────── */
const COL_W  = 140;   // width of each day column (px)
const ROOM_W = 210;   // width of the sticky room-name column (px)
const ROW_MIN = 70;   // min row height (px)
const TT_W   = 236;   // tooltip width (px)

/* ── helpers ─────────────────────────────────────────────────────────────── */
function fmtDateTime(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Returns true when a booking's check-in/out span overlaps the given calendar day */
function bookingOnDay(booking, day) {
  const checkIn  = new Date(booking.checkInDateTime);
  const checkOut = new Date(booking.checkOutDateTime);

  // day boundaries (local)
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  return checkIn <= dayEnd && checkOut >= dayStart;
}

/* ── event chip with hover tooltip ──────────────────────────────────────── */
function RoomBookingChip({ booking, onClick }) {
  const gradient = gradientForColorKey(booking.color);
  const ref = useRef(null);
  const [tt, setTt] = useState(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let top  = r.top > 180 ? r.top - 180 : r.bottom + 8;
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
        <span className="block truncate leading-tight">{booking.eventName}</span>
        <span className="block truncate text-[10px] font-normal text-white/75 leading-tight mt-0.5">
          {booking.department || "—"}
        </span>
      </button>

      {tt && (
        <div
          style={{ position: "fixed", top: tt.top, left: tt.left, width: TT_W, zIndex: 9999 }}
          className="rounded-xl border border-slate-200 dark:border-[#2e394e] bg-white dark:bg-[#0f172a] p-3 shadow-2xl text-left pointer-events-none"
        >
          {/* Event name */}
          <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate mb-0.5">
            {booking.eventName}
          </p>

          {/* Dept */}
          {booking.department && (
            <p className="text-[12px] text-violet-400 font-medium mb-2">
              {booking.department}
            </p>
          )}

          {/* Check-in / out */}
          <div className="border-t border-slate-100 dark:border-[#1e293b] pt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
            <p>
              <span className="text-slate-400 font-medium">Check-in: </span>
              {fmtDateTime(booking.checkInDateTime)}
            </p>
            <p>
              <span className="text-slate-400 font-medium">Check-out: </span>
              {fmtDateTime(booking.checkOutDateTime)}
            </p>
            {booking.occupantCount > 0 && (
              <p>
                <span className="text-slate-400 font-medium">Guests: </span>
                {booking.occupantCount}
              </p>
            )}
          </div>

          {/* Organizer */}
          <div className="border-t border-slate-100 dark:border-[#1e293b] mt-2 pt-2 space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
            <p><span className="text-slate-400 font-medium">Organizer: </span>{booking.organizerName}</p>
            <p><span className="text-slate-400 font-medium">Emp ID: </span>{booking.organizerEmpId}</p>
            <p><span className="text-slate-400 font-medium">Mobile: </span>{booking.organizerMobile}</p>
          </div>
        </div>
      )}
    </>
  );
}

/* ── main component ──────────────────────────────────────────────────────── */
export default function AllRoomsView({ currentDate, onSelectEvent }) {
  const [rooms,        setRooms]        = useState([]);
  const [eventsByRoom, setEventsByRoom] = useState({});
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  /* days of the selected month */
  const monthDays = useMemo(() => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const count = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => new Date(y, m, i + 1));
  }, [currentDate]);

  /* fetch */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAllRoomsEvents({ date: currentDate })
      .then(({ rooms: r, eventsByRoom: e }) => {
        if (cancelled) return;
        setRooms(r);
        setEventsByRoom(e);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load room booking data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentDate]);

  /* bookings for a given room+day */
  const cellBookings = useCallback(
    (roomId, day) =>
      (eventsByRoom[roomId] || []).filter((b) => bookingOnDay(b, day)),
    [eventsByRoom]
  );

  const totalW = ROOM_W + monthDays.length * COL_W;

  /* ── group rooms by venue (must be before any early return) ─────────── */
  const venueGroups = useMemo(() => {
    const map = new Map();
    for (const room of rooms) {
      if (!map.has(room.venue)) map.set(room.venue, []);
      map.get(room.venue).push(room);
    }
    return map;
  }, [rooms]);

  /* ── loading / error ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
          Loading room bookings…
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

  /* flat ordered room list (same order as API, which sorts by venue, roomNumber) */
  const orderedRooms = rooms;

  return (
    <div className="flex-1 overflow-auto table-custom-scrollbar">
      <div
        className="relative rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d1220]"
        style={{ minWidth: totalW }}
      >

        {/* ── sticky header row ───────────────────────────────────────── */}
        <div className="sticky top-0 z-20 flex border-b border-slate-200 dark:border-white/10" style={{ minWidth: totalW }}>
          {/* room label corner */}
          <div
            className="sticky left-0 z-30 flex shrink-0 items-center border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0f1a] px-4 py-3"
            style={{ width: ROOM_W, minWidth: ROOM_W }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Room / Date
            </span>
          </div>

          {/* day columns */}
          {monthDays.map((day, i) => {
            const today   = isToday(day);
            const dayName = day.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
            return (
              <div
                key={i}
                className={[
                  "flex shrink-0 flex-col items-center justify-center border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0f1a] py-2.5",
                  today ? "bg-teal-500/10" : "",
                ].join(" ")}
                style={{ width: COL_W, minWidth: COL_W }}
              >
                <span className="text-[10px] font-medium text-slate-500">{dayName}</span>
                <span
                  className={[
                    "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    today
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30"
                      : "text-slate-700 dark:text-slate-300",
                  ].join(" ")}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── empty state ────────────────────────────────────────────── */}
        {orderedRooms.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-slate-500">
            No active rooms found
          </div>
        )}

        {/* ── room rows (grouped by venue with a separator) ──────────── */}
        {(() => {
          const rows = [];
          let globalIdx = 0;

          for (const [venueName, venueRooms] of venueGroups) {
            /* venue group header — full-width highlighted banner */
            rows.push(
              <div
                key={`vh-${venueName}`}
                className="relative flex border-y border-slate-300 dark:border-gray-500/30"
                style={{ minWidth: totalW }}
              >
                {/* full-row gradient overlay */}
                <div className="absolute inset-0 bg-white/10 pointer-events-none" />

                {/* sticky left label cell */}
                <div
                  className="relative sticky left-0 z-10 flex shrink-0 items-center gap-2.5 px-4 py-2.5 bg-slate-100 dark:bg-white/10 border-r border-slate-300 dark:border-gray-400/30"
                  style={{ width: ROOM_W, minWidth: ROOM_W }}
                >
                 
                  <span className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-slate-900 dark:text-white drop-shadow truncate">
                    {venueName}
                  </span>
                </div>

                {/* tinted day cells spanning the full width */}
                {monthDays.map((day, di) => (
                  <div
                    key={di}
                    className={[
                      "relative shrink-0 border-r border-slate-200 dark:border-teal-500/10 py-2.5",
                      isToday(day) ? "bg-teal-400/10" : "",
                    ].join(" ")}
                    style={{ width: COL_W, minWidth: COL_W }}
                  />
                ))}
              </div>
            );

            /* individual room rows */
            for (const room of venueRooms) {
              const vi = globalIdx++;
              rows.push(
                <div
                  key={room.roomId}
                  className={[
                    "flex border-b border-slate-200 dark:border-white/5",
                    vi % 2 === 0 ? "bg-slate-50 dark:bg-white/[0.01]" : "bg-white dark:bg-white/[0.025]",
                  ].join(" ")}
                  style={{ minHeight: ROW_MIN }}
                >
                  {/* sticky room label */}
                  <div
                    className={[
                      "sticky left-0 z-10 flex shrink-0 flex-col justify-center px-4 py-3 border-r border-slate-200 dark:border-transparent",
                      vi % 2 === 0 ? "bg-slate-50 dark:bg-[#0c1120]" : "bg-white dark:bg-[#0e1325]",
                    ].join(" ")}
                    style={{ width: ROOM_W, minWidth: ROOM_W }}
                  >
                    <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {room.roomNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Cap: {room.capacity}
                    </span>
                  </div>

                  {/* day cells */}
                  {monthDays.map((day, di) => {
                    const bookings = cellBookings(room.roomId, day);
                    const today    = isToday(day);
                    return (
                      <div
                        key={di}
                        className={[
                          "flex shrink-0 flex-col gap-1.5 border-r border-slate-200 dark:border-white/5 p-1.5",
                          today ? "bg-teal-500/[0.04]" : "",
                        ].join(" ")}
                        style={{ width: COL_W, minWidth: COL_W, minHeight: ROW_MIN }}
                      >
                        {bookings.map((b, bi) => (
                          <RoomBookingChip
                            key={`${b.eventId}-${bi}`}
                            booking={b}
                            onClick={() => onSelectEvent?.(b)}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            }
          }

          return rows;
        })()}
      </div>
    </div>
  );
}
