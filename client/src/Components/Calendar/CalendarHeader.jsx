import { ChevronLeft, ChevronRight, ListFilter, Maximize2 } from "lucide-react";
import { formatMonthYear } from "../../utils/dateUtils";

const VIEWS = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "day", label: "Day" },
  { key: "allVenues", label: "All Venues" },
  { key: "allRooms", label: "Rooms" },
];

export default function CalendarHeader({
  currentDate,
  view,
  onChangeView,
  venue,
  venues,
  onChangeVenue,
  onPrev,
  onNext,
  onToday,
}) {
  return (
    <div className="flex items-center justify-between px-8 py-3 bg-white dark:bg-white/4 border-b border-slate-200 dark:border-white/10">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
        {formatMonthYear(currentDate)}
        <span className="text-slate-500"> - </span>
        <span className="text-violet-400">
          {view === "allVenues" ? "All Venues" : view === "allRooms" ? "All Rooms" : venue}
        </span>
      </h1>

      <div className="flex items-center gap-3">
        {view === "allVenues" && (
          <a
            href={`/calendar/all-venues-fullscreen?date=${currentDate.toISOString()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white uppercase tracking-wider bg-violet-600 hover:bg-violet-500 rounded-lg shadow shadow-violet-500/20 transition hover:scale-105"
          >
            <Maximize2 size={13} />
            Enlarge
          </a>
        )}

        <div className="flex rounded-lg bg-slate-100 dark:bg-white/5 p-1 text-xs font-medium">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => onChangeView(v.key)}
              className={[
                "rounded-md px-4 py-1.5 transition",
                view === v.key
                  ? "bg-violet-500 text-white shadow"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white",
              ].join(" ")}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view !== "allVenues" && view !== "allRooms" && (
          <div className="relative">
            <select
              value={venue}
              onChange={(e) => onChangeVenue(e.target.value)}
              className="appearance-none rounded-lg bg-slate-100 dark:bg-white/5 py-1.5 pl-9 pr-8 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none hover:bg-slate-200 dark:hover:bg-white/10 focus:ring-2 focus:ring-gray-500"
            >
              {venues.map((v) => (
                <option key={v} value={v} className="bg-white text-slate-900 dark:bg-[#0b0f1a] dark:text-slate-200">
                  {v}
                </option>
              ))}
            </select>
            <ListFilter
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 text-xs -translate-y-1/2 text-slate-400"
            />
          </div>
        )}

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
            <button
              onClick={onPrev}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onToday}
              className="border-x border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Today
            </button>
            <button
              onClick={onNext}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <ChevronRight size={16} />
            </button>
          </div>
      </div>
    </div>
  );
}
