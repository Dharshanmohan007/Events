import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DAY_LABELS_SHORT,
  MONTH_LABELS,
  addMonths,
  getMonthGrid,
  isSameDay,
} from "../../utils/dateUtils.js";

export default function MiniCalendar({ selectedDate, onSelect }) {
  const [cursor, setCursor] = useState(selectedDate);
  const grid = getMonthGrid(cursor);
  const currentMonth = cursor.getMonth();

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor((c) => addMonths(c, -1))}
            className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DAY_LABELS_SHORT.map((d, i) => (
          <span key={i} className="text-[11px] font-medium text-slate-500">
            {d}
          </span>
        ))}

        {grid.map((day, i) => {
          const inMonth = day.getMonth() === currentMonth;
          const selected = isSameDay(day, selectedDate);
          return (
            <button
              key={i}
              onClick={() => onSelect(day)}
              className={[
                "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[12px] transition",
                selected
                  ? "bg-violet-500 font-semibold text-white"
                  : inMonth
                    ? "text-slate-200 hover:bg-white/10"
                    : "text-slate-600 hover:bg-white/5",
              ].join(" ")}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
