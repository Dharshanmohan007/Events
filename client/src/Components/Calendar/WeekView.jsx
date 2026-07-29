import EventCard from "./EventCard";
import {
  DAY_LABELS,
  getHourSlots,
  getWeekDays,
  isSameDay,
  isToday,
  timeToMinutes,
} from "../../utils/dateUtils.js";

const HOUR_HEIGHT = 80; // px per hour row

export default function WeekView({ currentDate, events, onSelectEvent }) {
  // Calculate start and end hour dynamically based on events
  let startHour = 8;
  let endHour = 18;

  events.forEach((event) => {
    if (event.startTime) {
      const startMin = timeToMinutes(event.startTime);
      const startH = Math.floor(startMin / 60);
      if (startH < startHour) startHour = startH;
    }
    if (event.endTime) {
      const endMin = timeToMinutes(event.endTime);
      const endH = Math.ceil(endMin / 60);
      if (endH > endHour) endHour = endH;
    } else if (event.startTime) {
      const endMin = timeToMinutes(event.startTime) + 60;
      const endH = Math.ceil(endMin / 60);
      if (endH > endHour) endHour = endH;
    }
  });

  const topFor = (minutes) => {
    return ((minutes - startHour * 60) / 60) * HOUR_HEIGHT;
  };

  const days = getWeekDays(currentDate);
  const hours = getHourSlots(startHour, endHour);
  const gridHeight = (endHour - startHour) * HOUR_HEIGHT;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayCol = days.findIndex((d) => isSameDay(d, now));
  const showNowLine =
    todayCol !== -1 &&
    nowMinutes >= startHour * 60 &&
    nowMinutes <= endHour * 60;

  const eventsByDay = days.map((day) =>
    events.filter((e) => e.eventDate && isSameDay(new Date(e.eventDate), day)),
  );

  return (
    <div className="flex-1 overflow-auto px-8 pb-8 mt-4 table-custom-scrollbar">
      <div className="sticky top-0 z-30 bg-[#0b0f1a]">
        <div className="grid grid-cols-[64px_repeat(7,1fr)]">
          <div />
          {days.map((day, i) => (
            <div key={i} className="pb-4 text-center">
              <p className="text-xs font-medium text-slate-500">
                {DAY_LABELS[i]}
              </p>

              <p
                className={[
                  "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                  isToday(day) ? "bg-violet-500 text-white" : "text-slate-200",
                ].join(" ")}
              >
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative grid grid-cols-[64px_repeat(7,1fr)] mt-2"
        style={{ height: gridHeight }}
      >
        {/* time gutter */}
        <div className="relative">
          {hours.map((h) => (
            <div
              key={h.hour}
              className="absolute right-3 -translate-y-1/2 text-[11px] text-slate-500"
              style={{ top: topFor(h.hour * 60) }}
            >
              {h.label}
            </div>
          ))}
        </div>

        {/* day columns */}
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="relative border-l border-white/5">
            {hours.map((h) => (
              <div
                key={h.hour}
                className="absolute left-0 right-0 border-t border-white/5"
                style={{ top: topFor(h.hour * 60) }}
              />
            ))}

            {eventsByDay[dayIdx].map((event, i) => {
              const start = timeToMinutes(event.startTime);
              const end = event.endTime
                ? timeToMinutes(event.endTime)
                : start + 60;
              const top = topFor(start);
              const height = Math.max(((end - start) / 60) * HOUR_HEIGHT, 36);
              return (
                <EventCard
                  key={`${event.eventId}-${i}`}
                  event={event}
                  size="week"
                  style={{ top, height }}
                  onClick={() => onSelectEvent?.(event)}
                />
              );
            })}
          </div>
        ))}

        {/* current-time indicator, spans full width from the gutter */}
        {showNowLine && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-10 border-t border-red-500"
            style={{ top: topFor(nowMinutes) }}
          >
            <span className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
          </div>
        )}
      </div>
    </div>
  );
}
