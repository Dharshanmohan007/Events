import React, { useState, useRef, useEffect } from "react";

export default function CustomSelect({
  label,
  options = [],
  value,
  onChange,
  required,
  labelBg = "#16162A", 
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#16162A] z-10 pointer-events-none" style={{ backgroundColor: labelBg }}>
        {label} {required && "*"}
      </span>

      <div
        onClick={() => setOpen(!open)}
        className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200
          ${open ? "border-purple-500" : "border-[#3A3A5A]"}`}
      >
        <span className={value ? "text-white text-sm" : "text-gray-500 text-sm"}>
          {value || ""}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                ${value === opt ? "bg-purple-600 text-white" : "text-white hover:bg-purple-500/30"}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}