import React from "react";

export default function CustomInput({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  labelBg = "#16162A",
  borderColor = "#3A3A5A",
}) {
  const isDarkBg = type === "date" || type === "time";

  return (
    <div className="relative w-full">
      <span
        className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
        style={{ backgroundColor: labelBg }}
      >
        {label}
      </span>

      <input
        type={type}
        {...(value !== undefined ? { value } : {})}
        {...(onChange ? { onChange } : {})}
        className={`w-full bg-transparent text-white rounded-lg focus:outline-none p-3.5 text-sm border ${
          isDarkBg ? "text-gray-400 [color-scheme:dark]" : ""
        } ${className}`}
        style={{
          borderColor: borderColor,
          // focus border handled below via onFocus/onBlur if needed
        }}
        onFocus={e => (e.target.style.borderColor = "#a855f7")}
        onBlur={e => (e.target.style.borderColor = borderColor)}
      />
    </div>
  );
}