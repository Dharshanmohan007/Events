import React, { useState, useRef, useEffect } from "react";

export default function CustomSelect({
  label,
  options = [],
  value,
  onChange,
  required,
  labelBg = "#16162A",
  borderColor = "#3A3A5A",
  readOnly = false,
  placeholder = "",
  multi = false,       // true → multi-select with search (used by logos)
  searchable = false,  // true → single-select with search
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open && (searchable || multi) && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open, searchable, multi]);

  // Normalize value for multi mode
  const selectedArr = multi
    ? Array.isArray(value) ? value : value ? [value] : []
    : [];

  const filteredOptions = (searchable || multi)
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const derivedPlaceholder =
    placeholder ||
    (label ? `Select ${label.replace(/\s*\*$/, "").toLowerCase()}` : "Select");

  // ── Single-select ─────────────────────────────────────────────────────────
  if (!multi) {
    return (
      <div className="relative w-full" ref={ref}>
        <span
          className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
          style={{ backgroundColor: labelBg }}
        >
          {label} {required && "*"}
        </span>

        <div
          onClick={() => {
            if (!readOnly) {
              setOpen(!open);
            }
          }}
          className={`w-full bg-transparent border rounded-lg p-3.5 flex items-center justify-between transition-colors duration-200 ${
              readOnly
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer"
            }`}
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: open ? "#a855f7" : borderColor,
            height: "47px",
          }}
        >
          <span className={value ? "text-white text-sm" : "text-gray-500 text-sm"}>
            {value || <span className="text-gray-500">{derivedPlaceholder}</span>}
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
          <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-60 overflow-hidden flex flex-col">
            {searchable && (
              <div className="p-2 border-b border-[#3A3A5A]">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-[#16162A] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none border border-[#3A3A5A] focus:border-purple-500 placeholder-gray-500"
                />
              </div>
            )}
            <div className="overflow-y-auto max-h-48 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No results</div>
              ) : (
                filteredOptions.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (readOnly) return;

                      onChange(opt);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      value === opt
                        ? "bg-purple-600 text-white"
                        : "text-white hover:bg-purple-500/30"
                    }`}
                  >
                    {opt}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Multi-select ──────────────────────────────────────────────────────────
  const toggleOption = (opt) => {
    const next = selectedArr.includes(opt)
      ? selectedArr.filter((s) => s !== opt)
      : [...selectedArr, opt];
    onChange(next);
  };

  // Selected options come first in the list
  const sortedOptions = [
    ...filteredOptions.filter((o) => selectedArr.includes(o)),
    ...filteredOptions.filter((o) => !selectedArr.includes(o)),
  ];

  const displayValue = selectedArr.join(" / ");

  return (
    <div className="relative w-full" ref={ref}>
      <span
        className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
        style={{ backgroundColor: labelBg }}
      >
        {label} {required && "*"}
      </span>

      <div
        onClick={() => {
          if (!readOnly) {
            setOpen(!open);
          }
        }}
        className={`w-full bg-transparent border rounded-lg p-3.5 flex items-center justify-between transition-colors duration-200 ${
          readOnly
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer"
        }`}
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: open ? "#a855f7" : borderColor,
        }}
      >
        <span className={selectedArr.length > 0 ? "text-white text-sm truncate pr-2" : "text-gray-500 text-sm"}>
          {selectedArr.length > 0 ? displayValue : derivedPlaceholder}
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
        <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-60 overflow-hidden flex flex-col">
          <div className="p-2">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#16162A] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none border border-[#3A3A5A] focus:border-purple-500 placeholder-gray-500"
            />
          </div>
          <div className="overflow-y-auto max-h-48 custom-scrollbar">
            {sortedOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No results</div>
            ) : (
              sortedOptions.map((opt, i) => {
                const isSelected = selectedArr.includes(opt);
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (!readOnly) {
                        toggleOption(opt);
                      }
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-purple-600/20 text-white"
                        : "text-white hover:bg-purple-500/30"
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}