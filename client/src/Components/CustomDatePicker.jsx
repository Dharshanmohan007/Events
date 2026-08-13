import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR + i);

const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateKey) => {
    if (!dateKey) return "Select date";
    const [year, month, day] = dateKey.split("-");
    return `${day}/${month}/${year}`;
};

const CustomDropdown = ({ value, options, onChange, label, isOpen, setIsOpen }) => {
    const dropRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [setIsOpen]);

    const displayValue = typeof options[0] === "object"
        ? options.find(o => o.value === value)?.label
        : options.find(o => o === value);

    return (
        <div className="relative" ref={dropRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 rounded-md border border-[#283247] bg-[#1b2435] px-2 py-1 text-[11px] text-white cursor-pointer transition-colors hover:border-[#853FF9] focus:border-[#853FF9] outline-none"
            >
                <span className="min-w-[50px] text-left truncate">{displayValue || label}</span>
                <ChevronDown size={12} className={`text-[#FFFFFF80] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[#283247] bg-[#151d2e] shadow-xl custom-scrollbar">
                    {options.map((option) => {
                        const optValue = typeof option === "object" ? option.value : option;
                        const optLabel = typeof option === "object" ? option.label : option;
                        const isSelected = optValue === value;

                        return (
                            <button
                                key={optValue}
                                type="button"
                                onClick={() => {
                                    onChange(optValue);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-1.5 text-[11px] text-left cursor-pointer transition-colors ${
                                    isSelected
                                        ? "bg-[#853FF9]/15 text-[#A78BFA] font-medium"
                                        : "text-[#FFFFFFCC] hover:bg-[#232A3C] hover:text-white"
                                }`}
                            >
                                {optLabel}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const CustomDatePicker = ({ value, onChange, placeholder = "Select date", minDate, className = "" }) => {
    const selectedDate = useMemo(() => {
        if (!value) return null;
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    }, [value]);

    const [open, setOpen] = useState(false);
    const [displayMonth, setDisplayMonth] = useState(() => selectedDate?.getMonth() ?? new Date().getMonth());
    const [displayYear, setDisplayYear] = useState(() => selectedDate?.getFullYear() ?? new Date().getFullYear());
    const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const firstDay = new Date(displayYear, displayMonth, 1).getDay();
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

    const goToPreviousMonth = () => {
        if (displayMonth === 0) {
            setDisplayMonth(11);
            setDisplayYear((y) => y - 1);
            return;
        }
        setDisplayMonth((m) => m - 1);
    };

    const goToNextMonth = () => {
        if (displayMonth === 11) {
            setDisplayMonth(0);
            setDisplayYear((y) => y + 1);
            return;
        }
        setDisplayMonth((m) => m + 1);
    };

    const handleDateSelect = (day) => {
        onChange(getDateKey(new Date(displayYear, displayMonth, day)));
        setOpen(false);
    };

    return (
        <div ref={pickerRef} className="relative">
            <button
                type="button"
                onClick={() => {
                    if (selectedDate) {
                        setDisplayMonth(selectedDate.getMonth());
                        setDisplayYear(selectedDate.getFullYear());
                    }
                    setOpen((c) => !c);
                }}
                className={`flex h-8 items-center gap-2 rounded-md border px-2 text-[11px] transition-colors cursor-pointer ${open
                        ? "border-[#8B3DFF] text-white"
                        : "border-[#283247] text-[#FFFFFF80] hover:border-[#8B3DFF]"
                    } bg-[#1b2435] ${className}`}
            >
                <Calendar size={13} className="text-[#FFFFFF80]" />
                <span className="min-w-[70px] text-left">{value ? formatDisplayDate(value) : placeholder}</span>
                {value && (
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                onChange("");
                            }
                        }}
                        className="ml-1 rounded text-[#FFFFFF66] hover:text-white"
                        aria-label="Clear date"
                    >
                        <X size={12} />
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute bottom-full right-0 z-30 mb-2 w-72 rounded-xl border border-[#283247] bg-[#151d2e] p-3 shadow-2xl">
                    {/* Month & Year selectors */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={goToPreviousMonth}
                            className="rounded-lg p-1.5 text-[#FFFFFF80] hover:bg-[#232A3C] hover:text-white cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1.5">
                            <CustomDropdown
                                value={displayMonth}
                                options={MONTHS.map((month, i) => ({ value: i, label: month }))}
                                onChange={setDisplayMonth}
                                label="Month"
                                isOpen={monthDropdownOpen}
                                setIsOpen={setMonthDropdownOpen}
                            />

                            <CustomDropdown
                                value={displayYear}
                                options={YEAR_RANGE}
                                onChange={setDisplayYear}
                                label="Year"
                                isOpen={yearDropdownOpen}
                                setIsOpen={setYearDropdownOpen}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={goToNextMonth}
                            className="rounded-lg p-1.5 text-[#FFFFFF80] hover:bg-[#232A3C] hover:text-white cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Week day headers */}
                    <div className="mb-1 grid grid-cols-7">
                        {WEEK_DAYS.map((day) => (
                            <div key={day} className="py-1 text-center text-[10px] text-[#FFFFFF66]">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, index) => (
                            <div key={`empty-${index}`} />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, index) => {
                            const day = index + 1;
                            const dateKey = getDateKey(new Date(displayYear, displayMonth, day));
                            const isSelected = value === dateKey;
                            const isToday =
                                new Date().getDate() === day &&
                                new Date().getMonth() === displayMonth &&
                                new Date().getFullYear() === displayYear;

                            const isDisabled = minDate && dateKey < minDate;

                            return (
                                <button
                                    key={dateKey}
                                    type="button"
                                    onClick={() => !isDisabled && handleDateSelect(day)}
                                    disabled={isDisabled}
                                    className={`h-8 rounded-lg text-[11px] transition-colors ${
                                            isDisabled
                                                ? "text-[#FFFFFF40] cursor-not-allowed bg-transparent"
                                                : isSelected
                                                ? "bg-[#853FF9] text-white font-semibold cursor-pointer"
                                                : isToday
                                                    ? "border border-[#853FF9] text-[#A78BFA] cursor-pointer"
                                                    : "text-[#FFFFFFCC] hover:bg-[#232A3C] hover:text-white cursor-pointer"
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
