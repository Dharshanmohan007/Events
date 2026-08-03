import React from "react";

export default function CustomInput({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  labelBg = "#16162A",
  borderColor = "#3A3A5A",
  readOnly = false,
  placeholder = "",
  disabled = false,
  min,
  max,
}) {
  const isDarkBg = type === "date" || type === "time";

  // Generate a sensible default placeholder from the label if none provided
  const derivedPlaceholder =
    placeholder ||
    (type === "date"
      ? "DD/MM/YYYY"
      : type === "time"
      ? "HH:MM"
      : type === "number"
      ? "Enter number"
      : label
      ? `Enter ${label.replace(/\s*\*$/, "").toLowerCase()}`
      : "");

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
        placeholder={derivedPlaceholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full bg-transparent text-white rounded-lg focus:outline-none p-3.5 text-sm border placeholder-gray-500 ${
          isDarkBg ? "text-gray-400 [color-scheme:dark]" : ""
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
        style={{
          borderColor: borderColor,
        }}
        onFocus={(e) => {
          if (!disabled) e.target.style.borderColor = "#a855f7";
        }}
        onBlur={(e) => (e.target.style.borderColor = borderColor)}
      />
    </div>
  );
}