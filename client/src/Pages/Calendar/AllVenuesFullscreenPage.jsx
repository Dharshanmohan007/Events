import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AllVenuesView from "../../Components/Calendar/AllVenuesView.jsx";
import { formatMonthYear, addMonths } from "../../utils/dateUtils.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AllVenuesFullscreenPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read date from URL or default to now
  const initialDateStr = searchParams.get("date");
  const initialDate = initialDateStr ? new Date(initialDateStr) : new Date();
  const [currentDate, setCurrentDate] = useState(initialDate);

  // When date changes, update URL so refresh works
  const updateDate = (newDate) => {
    setCurrentDate(newDate);
    setSearchParams({ date: newDate.toISOString() }, { replace: true });
  };

  const goPrev = useCallback(() => updateDate(addMonths(currentDate, -1)), [currentDate, setSearchParams]);
  const goNext = useCallback(() => updateDate(addMonths(currentDate, 1)), [currentDate, setSearchParams]);
  const goToday = useCallback(() => updateDate(new Date()), [setSearchParams]);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden`}>
      <div className="flex flex-col h-full w-full bg-white dark:bg-[#0b0f1a] text-slate-900 dark:text-slate-200">
      {/* Minimal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1220]">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          All Venues <span className="text-slate-500"> - </span> {formatMonthYear(currentDate)}
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
            <button onClick={goPrev} className="rounded-md p-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10">
              <ChevronLeft size={16} />
            </button>
            <button onClick={goToday} className="border-x border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-white/10">
              Today
            </button>
            <button onClick={goNext} className="rounded-md p-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10">
              <ChevronRight size={16} />
            </button>
          </div>
          <button 
            onClick={() => window.close()} 
            className="px-4 py-2 text-xs font-medium text-slate-900 bg-slate-200 hover:bg-slate-300 dark:text-white dark:bg-white/10 dark:hover:bg-white/20 rounded-lg transition"
          >
            Close Window
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <AllVenuesView currentDate={currentDate} />
      </div>
      </div>
    </div>
  );
}
