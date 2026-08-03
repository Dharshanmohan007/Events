import { ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import { formatMonthYear } from "../../utils/dateUtils";

const VIEWS = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "day", label: "Day" },
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
    <div className="flex items-center justify-between px-8 py-3 bg-white/4">
      <h1 className="text-xl font-semibold text-white">
        {formatMonthYear(currentDate)}
        <span className="text-slate-500"> - </span>
        <span className="text-violet-400">{venue}</span>
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex rounded-lg bg-white/5 p-1 text-xs font-medium">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => onChangeView(v.key)}
              className={[
                "rounded-md px-4 py-1.5 transition",
                view === v.key
                  ? "bg-violet-500 text-white shadow"
                  : "text-slate-400 hover:text-white",
              ].join(" ")}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={venue}
            onChange={(e) => onChangeVenue(e.target.value)}
            className="appearance-none rounded-lg b bg-white/5 py-1.5 pl-9 pr-8 text-sm font-medium text-slate-200 outline-none hover:bg-white/10 focus:ring-2 focus:ring-gray-500"
          >
            {venues.map((v) => (
              <option key={v} value={v} className="bg-[#0b0f1a]">
                {v}
              </option>
            ))}
          </select>
          <ListFilter
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 text-xs -translate-y-1/2 text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5">
          <button
            onClick={onPrev}
            className="rounded-md p-2 text-slate-300 hover:bg-white/10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={onToday}
            className="border-x border-white/10 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
          >
            Today
          </button>
          <button
            onClick={onNext}
            className="rounded-md p-2 text-slate-300 hover:bg-white/10"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
