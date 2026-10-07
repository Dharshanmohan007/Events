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
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/5 dark:bg-white/5 p-4 shadow-sm dark:shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor((c) => addMonths(c, -1))}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DAY_LABELS_SHORT.map((d, i) => (
          <span key={i} className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
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
                    ? "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                    : "text-slate-400 hover:bg-slate-50 dark:text-slate-600 dark:hover:bg-white/5",
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
