import React, { useMemo, useState, useRef, useEffect } from "react";

export default function TimePickerInput({
  label,
  labelClassName = "bg-slate-50 dark:bg-[#16162A]",
  value,
  onChange,
  className = "",
}) {
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const periods = ["AM", "PM"];

  const [openDropdown, setOpenDropdown] = useState(null); // 'hour' | 'minute' | 'period' | null
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

  const [h, m, period] = useMemo(() => {
    if (!value) return ["", "", "AM"];
    const [hh, mm] = value.split(":");
    const hour = parseInt(hh);
    return [
      String(hour > 12 ? hour - 12 : hour === 0 ? 12 : hour).padStart(2, "0"),
      mm,
      hour >= 12 ? "PM" : "AM",
    ];
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const emit = (newH, newM, newPeriod) => {
    if (!newH || !newM) return;
    let hour24 = parseInt(newH);
    if (newPeriod === "AM" && hour24 === 12) hour24 = 0;
    if (newPeriod === "PM" && hour24 !== 12) hour24 += 12;
    onChange({ target: { value: `${String(hour24).padStart(2, "0")}:${newM}` } });
  };

  const DropdownList = ({ items, selected, onSelect, type }) => (
    openDropdown === type && (
      <div
        className="absolute z-50 mt-1 rounded-lg overflow-y-auto custom-scrollbar bg-white dark:bg-[#1E1E35] border border-slate-300 dark:border-[#3A3A5A]"
        style={{
          maxHeight: "180px",
          minWidth: "60px",
          top: "100%",
          left: 0,
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
              setOpenDropdown(null);
            }}
            className="px-3 py-2 text-sm cursor-pointer"
            style={{
              color: selected === item ? "#a855f7" : "",
              background: selected === item ? "rgba(168,85,247,0.15)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (selected !== item) e.currentTarget.style.background = "rgba(168,85,247,0.1)";
            }}
            onMouseLeave={(e) => {
              if (selected !== item) e.currentTarget.style.background = "transparent";
            }}
          >
            <span className={selected === item ? "" : "text-slate-900 dark:text-white"}>{item}</span>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Floating label */}
      <span
        className={`absolute left-3 -top-[9px] text-xs text-slate-800 dark:text-white px-1 z-10 pointer-events-none ${labelClassName}`}
      >
        {label}
      </span>

      {/* Input box */}
      <div
        className={`w-full bg-transparent rounded-lg flex items-center gap-2 px-3 border transition-colors ${
          isFocused ? "border-purple-500" : "border-slate-300 dark:border-[#3A3A5A]"
        } ${className}`}
        style={{
          height: "47px",
        }}
      >
        {/* Hour selector */}
        <div className="relative flex-shrink-0">
          <div
            className="flex items-center gap-1 cursor-pointer select-none"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsFocused(true);
              setOpenDropdown(openDropdown === "hour" ? null : "hour");
            }}
          >
            <span className={`text-sm ${h ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-gray-500"}`} style={{ minWidth: "22px" }}>
              {h || "HH"}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <DropdownList
            type="hour"
            items={hours}
            selected={h}
            onSelect={(val) => emit(val, m || "00", period)}
          />
        </div>

        <span className="text-gray-400 text-sm">:</span>

        {/* Minute selector */}
        <div className="relative flex-shrink-0">
          <div
            className="flex items-center gap-1 cursor-pointer select-none"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsFocused(true);
              setOpenDropdown(openDropdown === "minute" ? null : "minute");
            }}
          >
            <span className={`text-sm ${m ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-gray-500"}`} style={{ minWidth: "22px" }}>
              {m || "MM"}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <DropdownList
            type="minute"
            items={minutes}
            selected={m}
            onSelect={(val) => emit(h || "12", val, period)}
          />
        </div>

        {/* AM/PM selector */}
        <div className="relative flex-shrink-0 ml-1">
          <div
            className="flex items-center gap-1 cursor-pointer select-none"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsFocused(true);
              setOpenDropdown(openDropdown === "period" ? null : "period");
            }}
          >
            <span className="text-sm text-slate-900 dark:text-white" style={{ minWidth: "28px" }}>
              {period}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <DropdownList
            type="period"
            items={periods}
            selected={period}
            onSelect={(val) => emit(h || "12", m || "00", val)}
          />
        </div>
      </div>
    </div>
  );
}