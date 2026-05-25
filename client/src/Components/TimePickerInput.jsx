import React, { useMemo, useState, useRef, useEffect } from "react";

export default function TimePickerInput({
  label,
  labelBg = "#16162A",
  value,
  onChange,
  borderColor = "#3A3A5A",
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
        className="absolute z-50 mt-1 rounded-lg overflow-y-auto custom-scrollbar"
        style={{
          background: "#1E1E35",
          border: "1px solid #3A3A5A",
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
              color: selected === item ? "#a855f7" : "#ffffff",
              background: selected === item ? "rgba(168,85,247,0.15)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (selected !== item) e.currentTarget.style.background = "rgba(168,85,247,0.1)";
            }}
            onMouseLeave={(e) => {
              if (selected !== item) e.currentTarget.style.background = "transparent";
            }}
          >
            {item}
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Floating label */}
      <span
        className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
        style={{ backgroundColor: labelBg }}
      >
        {label}
      </span>

      {/* Input box */}
      <div
        className="w-full bg-transparent rounded-lg flex items-center gap-2 px-3"
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: isFocused ? "#a855f7" : borderColor,
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
            <span className="text-sm" style={{ color: h ? "#ffffff" : "#6b7280", minWidth: "22px" }}>
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
            <span className="text-sm" style={{ color: m ? "#ffffff" : "#6b7280", minWidth: "22px" }}>
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
            <span className="text-sm text-white" style={{ minWidth: "28px" }}>
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