import EventCard from "./EventCard";
import { DAY_LABELS, getMonthGrid, isSameDay, isToday } from "../../utils/dateUtils.js";
  
const MAX_CHIPS = 3;

export default function MonthView({ currentDate, events, onSelectEvent }) {
  const grid = getMonthGrid(currentDate);
  const currentMonth = currentDate.getMonth();

  const eventsFor = (day) =>
    events.filter((e) => e.eventDate && isSameDay(new Date(e.eventDate), day));

  return (
    <div className="flex-1 overflow-auto px-8 mt-4 pb-8">
      <div className="grid grid-cols-7 border-b border-white/5 pb-2">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-slate-500">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6" style={{ height: "calc(100% - 28px)" }}>
        {grid.map((day, i) => {
          const dayEvents = eventsFor(day);
          const inMonth = day.getMonth() === currentMonth;
          const today = isToday(day);

          return (
            <div
              key={i}
              className={[
                "flex flex-col gap-1 border-b border-l border-white/5 p-2",
                i % 7 === 0 ? "border-l-0" : "",
                inMonth ? "" : "opacity-40",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  today ? "bg-violet-500 text-white" : "text-slate-300",
                ].join(" ")}
              >
                {day.getDate()}
              </span>

              <div className="flex flex-col gap-1">
                {dayEvents.slice(0, MAX_CHIPS).map((event, idx) => (
                  <EventCard
                    key={`${event.eventId}-${idx}`}
                    event={event}
                    size="chip"
                    onClick={() => onSelectEvent?.(event)}
                  />
                ))}
                {dayEvents.length > MAX_CHIPS && (
                  <span className="pl-1 text-[11px] text-slate-500">
                    +{dayEvents.length - MAX_CHIPS} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
