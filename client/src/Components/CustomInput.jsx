import React from "react";

const baseStyle =
  "w-full bg-transparent border border-[#3A3A5A] text-white  rounded-lg focus:outline-none focus:border-purple-500";

export default function CustomInput({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  labelBg = "#16162A",

}) {
  const isDarkBg = type === "date" || type === "time";

  return (
    <div className="relative w-full">
      <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#16162A] z-10 pointer-events-none" style={{ backgroundColor: labelBg }}>
    <div className="relative w-full ">
      <span className="absolute left-3 -top-[9px] text-xs text-white px-1    z-10 pointer-events-none">
        {label}
      </span>

      <input
        type={type}
        {...(value !== undefined ? { value } : {})}
        {...(onChange ? { onChange } : {})}
        className={`${baseStyle}   p-3.5 text-sm ${
          isDarkBg ? "text-gray-400 [color-scheme:dark]" : ""
        } ${className}` }
      />
    </div>
  );
}