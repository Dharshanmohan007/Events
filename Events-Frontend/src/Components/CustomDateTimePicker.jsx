import React, { useState, useRef, useEffect, useCallback } from "react";
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// ─── Scroll Drum ─────────────────────────────────────────────────────────────
// A vertically-scrollable drum picker with hidden scrollbar.
// items: array of display strings; value: currently selected index; onChange(index)
function ScrollDrum({ items, value, onChange }) {
  const containerRef = useRef(null);
  const ITEM_H = 40; // px per item
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);

  // Scroll to selected item on mount and when value changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = value * ITEM_H;
  }, [value]);

  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      // Snap
      el.scrollTop = clamped * ITEM_H;
      if (clamped !== value) onChange(clamped);
      isScrollingRef.current = false;
    }, 80);
  }, [items.length, onChange, value]);

  return (
    <div className="relative flex flex-col items-center" style={{ width: 56 }}>
      {/* Fade top */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none rounded-t-lg"
        style={{
          height: ITEM_H * 2,
          background: "linear-gradient(to bottom, #1a1a35 0%, transparent 100%)",
        }}
      />
      {/* Highlight band */}
      <div
        className="absolute left-0 right-0 z-10 pointer-events-none rounded-md border border-purple-500/40 bg-purple-600/10"
        style={{ top: ITEM_H * 2, height: ITEM_H }}
      />
      {/* Fade bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none rounded-b-lg"
        style={{
          height: ITEM_H * 2,
          background: "linear-gradient(to top, #1a1a35 0%, transparent 100%)",
        }}
      />

      {/* Scroll container — hidden scrollbar */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: ITEM_H * 5,
          overflowY: "scroll",
          scrollbarWidth: "none",       // Firefox
          msOverflowStyle: "none",      // IE/Edge
        }}
        className="w-full"
      >
        {/* webkit hidden scrollbar via inline style tag trick — handled in global CSS,
            but we also do it here via a className we'll add */}
        <style>{`
          .drum-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        <div
          className="drum-scroll"
          style={{
            overflowY: "scroll",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Padding spacers so first/last items can center */}
          <div style={{ height: ITEM_H * 2 }} />
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                onChange(i);
                containerRef.current.scrollTop = i * ITEM_H;
              }}
              style={{ height: ITEM_H }}
              className={`flex items-center justify-center text-base font-mono cursor-pointer select-none transition-colors ${
                i === value ? "text-white font-semibold" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {item}
            </div>
          ))}
          <div style={{ height: ITEM_H * 2 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Picker ──────────────────────────────────────────────────────────────
export default function CustomDateTimePicker({ label, value, onChange, placeholder, minDate }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("calendar");
  const [displayMonth, setDisplayMonth] = useState(() =>
    value ? value.getMonth() : new Date().getMonth()
  );
  const [displayYear, setDisplayYear] = useState(() =>
    value ? value.getFullYear() : new Date().getFullYear()
  );
  const [yearPage, setYearPage] = useState(() =>
    Math.floor((value ? value.getFullYear() : new Date().getFullYear()) / 12)
  );
  const [selectedDate, setSelectedDate] = useState(value || null);

  // Hour index 0-11 → displays 12,1,2,...,11
  const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, "0"));
  const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  const getHourIdx = (d) => {
    if (!d) return 11; // display "12"
    const h = d.getHours() % 12; // 0 for 12:xx
    return h === 0 ? 0 : h; // index 0 → "12", index 1 → "01", ...
  };

  const [hourIdx, setHourIdx] = useState(() => getHourIdx(value));
  const [minuteIdx, setMinuteIdx] = useState(() => (value ? value.getMinutes() : 0));
  const [ampm, setAmpm] = useState(() =>
    value ? (value.getHours() >= 12 ? "PM" : "AM") : "AM"
  );

  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (value) {
      setDisplayMonth(value.getMonth());
      setDisplayYear(value.getFullYear());
      setSelectedDate(value);
      setHourIdx(getHourIdx(value));
      setMinuteIdx(value.getMinutes());
      setAmpm(value.getHours() >= 12 ? "PM" : "AM");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatDisplay = () => {
    if (!value) return placeholder || "__/__/____  --:-- --";
    const d = value;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const rawH = d.getHours();
    const h12 = rawH === 0 ? 12 : rawH > 12 ? rawH - 12 : rawH;
    const hh = String(h12).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ap = rawH >= 12 ? "PM" : "AM";
    return `${dd}/${mm}/${yyyy}  ${hh}:${min} ${ap}`;
  };

  const commitDateTime = useCallback(
    (date, hIdx, mIdx, ap) => {
      if (!date) return;
      const d = new Date(date);
      // hIdx 0 → hour display "12" → 0 or 12
      let hours = hIdx % 12; // 0 for 12:xx, 1 for 1:xx, ...
      if (ap === "PM") hours += 12;
      d.setHours(hours, mIdx, 0, 0);
      onChange(d);
    },
    [onChange]
  );

  const handleDayClick = (day) => {
    const newDate = new Date(displayYear, displayMonth, day);
    setSelectedDate(newDate);
    commitDateTime(newDate, hourIdx, minuteIdx, ampm);
    setView("time");
  };

  const handleTimeConfirm = () => {
    commitDateTime(selectedDate, hourIdx, minuteIdx, ampm);
    setOpen(false);
    setView("calendar");
  };

  const prevMonth = () => {
    if (displayMonth === 0) { setDisplayMonth(11); setDisplayYear((y) => y - 1); }
    else setDisplayMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (displayMonth === 11) { setDisplayMonth(0); setDisplayYear((y) => y + 1); }
    else setDisplayMonth((m) => m + 1);
  };

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
  const yearStart = yearPage * 12;
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  return (
    <div ref={ref} className="relative w-full">
      {/* Floating label */}
      {label && (
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none bg-[#1f1f3a]">
          {label}
        </span>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((p) => !p); setView("calendar"); }}
        className={`w-full flex items-center justify-between bg-transparent px-4 py-[13px] rounded-lg border text-left transition-colors ${
          open ? "border-purple-500" : "border-[#3A3A5A]"
        }`}
      >
        <span className={`text-sm ${value ? "text-gray-300" : "text-gray-500"}`}>
          {formatDisplay()}
        </span>
        <div className="flex gap-2 text-gray-400 flex-shrink-0">
          <CalendarDays size={18} />
          <Clock size={18} />
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-2 bg-[#1a1a35] border border-[#3A3A5A] rounded-xl shadow-2xl w-72 overflow-hidden">

          {/* ── CALENDAR VIEW ── */}
          {view === "calendar" && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth}
                  className="p-1 hover:bg-[#2a2a4a] rounded-lg text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setView("month")}
                    className="text-sm font-medium text-white hover:text-purple-400 transition-colors">
                    {MONTHS[displayMonth]}
                  </button>
                  <button type="button"
                    onClick={() => { setYearPage(Math.floor(displayYear / 12)); setView("year"); }}
                    className="text-sm font-medium text-white hover:text-purple-400 transition-colors">
                    {displayYear}
                  </button>
                </div>
                <button type="button" onClick={nextMonth}
                  className="p-1 hover:bg-[#2a2a4a] rounded-lg text-gray-400 hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                  <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const currentDayDate = new Date(displayYear, displayMonth, day);
                  let isDisabled = false;
                  if (minDate) {
                    const minD = new Date(minDate);
                    minD.setHours(0, 0, 0, 0);
                    if (currentDayDate < minD) isDisabled = true;
                  }

                  const isSelected =
                    selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === displayMonth &&
                    selectedDate.getFullYear() === displayYear;
                  return (
                    <button key={day} type="button" 
                      onClick={() => !isDisabled && handleDayClick(day)}
                      disabled={isDisabled}
                      className={`text-xs py-1.5 rounded-lg transition-colors ${
                        isDisabled
                          ? "text-gray-600 cursor-not-allowed"
                          : isSelected
                          ? "bg-purple-600 text-white"
                          : "text-gray-300 hover:bg-[#2a2a4a] hover:text-white"
                      }`}>
                      {day}
                    </button>
                  );
                })}
              </div>

              <button type="button" onClick={() => setView("time")}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#3A3A5A] text-gray-400 hover:text-white hover:border-purple-500 text-xs transition-colors">
                <Clock size={14} /> Set Time
              </button>
            </div>
          )}

          {/* ── MONTH VIEW ── */}
          {view === "month" && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setView("calendar")}
                  className="text-xs text-purple-400 hover:text-purple-300">← Back</button>
                <span className="text-sm font-medium text-white">{displayYear}</span>
                <div />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((m, i) => (
                  <button key={m} type="button"
                    onClick={() => { setDisplayMonth(i); setView("calendar"); }}
                    className={`py-2 rounded-lg text-xs transition-colors ${
                      displayMonth === i ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-[#2a2a4a]"
                    }`}>
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── YEAR VIEW ── */}
          {view === "year" && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setYearPage((p) => p - 1)}
                  className="p-1 hover:bg-[#2a2a4a] rounded-lg text-gray-400 hover:text-white">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={() => setView("calendar")}
                  className="text-xs text-purple-400 hover:text-purple-300">← Back</button>
                <button type="button" onClick={() => setYearPage((p) => p + 1)}
                  className="p-1 hover:bg-[#2a2a4a] rounded-lg text-gray-400 hover:text-white">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {years.map((y) => (
                  <button key={y} type="button"
                    onClick={() => { setDisplayYear(y); setView("calendar"); }}
                    className={`py-2 rounded-lg text-xs transition-colors ${
                      displayYear === y ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-[#2a2a4a]"
                    }`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── TIME VIEW ── */}
          {view === "time" && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setView("calendar")}
                  className="text-xs text-purple-400 hover:text-purple-300">← Date</button>
                <span className="text-sm font-medium text-white flex items-center gap-1">
                  <Clock size={14} /> Select Time
                </span>
                <div />
              </div>

              {/* Drum pickers */}
              <div className="flex items-center justify-center gap-2">
                {/* Hour drum */}
                <ScrollDrum
                  items={HOURS}
                  value={hourIdx}
                  onChange={(i) => {
                    setHourIdx(i);
                    if (selectedDate) commitDateTime(selectedDate, i, minuteIdx, ampm);
                  }}
                />

                <span className="text-white text-2xl font-mono mb-1 select-none">:</span>

                {/* Minute drum */}
                <ScrollDrum
                  items={MINUTES}
                  value={minuteIdx}
                  onChange={(i) => {
                    setMinuteIdx(i);
                    if (selectedDate) commitDateTime(selectedDate, hourIdx, i, ampm);
                  }}
                />

                {/* AM / PM */}
                <div className="flex flex-col gap-2 ml-2">
                  {["AM", "PM"].map((ap) => (
                    <button
                      key={ap}
                      type="button"
                      onClick={() => {
                        setAmpm(ap);
                        if (selectedDate) commitDateTime(selectedDate, hourIdx, minuteIdx, ap);
                      }}
                      className={`w-12 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        ampm === ap
                          ? "bg-purple-600 text-white"
                          : "bg-[#2a2a4a] text-gray-400 hover:text-white"
                      }`}
                    >
                      {ap}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-gray-500 mt-2 mb-3">
                Scroll to pick hour &amp; minute
              </p>

              <button type="button" onClick={handleTimeConfirm}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
                Confirm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
