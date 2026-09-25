import React from "react";

export default function CustomInput({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  labelClassName = "bg-slate-50 dark:bg-[#16162A]",
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
        className={`absolute left-3 -top-[9px] text-xs text-slate-800 dark:text-white px-1 z-10 pointer-events-none ${labelClassName}`}
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
        {...(min !== undefined ? { min } : {})}
        {...(max !== undefined ? { max } : {})}
        className={`w-full bg-transparent text-slate-900 dark:text-white rounded-lg focus:outline-none p-3.5 text-sm border border-slate-300 dark:border-[#3A3A5A] placeholder-slate-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-purple-500 ${
          isDarkBg ? "dark:[color-scheme:dark]" : ""
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
        style={{}}
        onFocus={(e) => {
          if (!disabled) {
            e.target.classList.add("border-purple-500", "dark:border-purple-500");
          }
        }}
        onBlur={(e) => {
          e.target.classList.remove("border-purple-500", "dark:border-purple-500");
        }}
      />
    </div>
  );
}