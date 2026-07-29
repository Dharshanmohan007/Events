import EventCard from "./EventCard.jsx";
import { getHourSlots, isSameDay, isToday, timeToMinutes } from "../../utils/dateUtils.js";

const HOUR_HEIGHT = 80;
const START_HOUR = 0;
const END_HOUR = 22;

function topFor(minutes) {
  return ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
}

export default function DayView({ currentDate, events, onSelectEvent }) {
  const hours = getHourSlots(START_HOUR, END_HOUR);
  const gridHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  const dayEvents = events.filter(
    (e) => e.eventDate && isSameDay(new Date(e.eventDate), currentDate),
  );

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine =
    isToday(currentDate) && nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;

  return (
    <div className="flex-1 overflow-auto px-8 pb-8 mt-4 table-custom-scrollbar">
      <div className="sticky top-0 z-30 bg-[#0b0f1a] pb-4">
      <div className="text-center">
        <p className="text-xs font-medium text-slate-500">
          {currentDate
            .toLocaleDateString(undefined, { weekday: "short" })
            .toUpperCase()}
        </p>

        <p
          className={[
            "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
            isToday(currentDate)
              ? "bg-violet-500 text-white"
              : "text-slate-200",
          ].join(" ")}
        >
          {currentDate.getDate()}
        </p>
      </div>
    </div>

      <div className="relative grid grid-cols-[64px_1fr] mt-2" style={{ height: gridHeight }}>
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

        <div className="relative border-l border-white/5">
          {hours.map((h) => (
            <div
              key={h.hour}
              className="absolute left-0 right-0 border-t border-white/5"
              style={{ top: topFor(h.hour * 60) }}
            />
          ))}

          {dayEvents.map((event, i) => {
            const start = timeToMinutes(event.startTime);
            const end = event.endTime ? timeToMinutes(event.endTime) : start + 60;
            const top = topFor(start);
            const height = Math.max(((end - start) / 60) * HOUR_HEIGHT, 48);
            return (
              <EventCard
                key={`${event.eventId}-${i}`}
                event={event}
                size="day"
                style={{ top, height }}
                onClick={() => onSelectEvent?.(event)}
              />
            );
          })}

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
    </div>
  );
}
