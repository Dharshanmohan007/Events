import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

const ThemedDatePicker = ({ value, onChange, placeholder = "Select date" }) => {
    const selectedDate = useMemo(() => {
        if (!value) return null;

        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    }, [value]);

    const [open, setOpen] = useState(false);
    const [displayMonth, setDisplayMonth] = useState(() => selectedDate?.getMonth() ?? new Date().getMonth());
    const [displayYear, setDisplayYear] = useState(() => selectedDate?.getFullYear() ?? new Date().getFullYear());
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
            setDisplayYear((year) => year - 1);
            return;
        }

        setDisplayMonth((month) => month - 1);
    };

    const goToNextMonth = () => {
        if (displayMonth === 11) {
            setDisplayMonth(0);
            setDisplayYear((year) => year + 1);
            return;
        }

        setDisplayMonth((month) => month + 1);
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
                    setOpen((current) => !current);
                }}
                className={`filter-container border rounded-lg flex h-9 items-center px-3 gap-2 bg-[#232A3C] text-xs transition-colors ${open ? "border-[#8B3DFF] text-white" : "border-gray-700 text-gray-300"}`}
            >
                <Calendar size={16} className="text-gray-400" />
                <span className="min-w-[78px] text-left">{value ? formatDisplayDate(value) : placeholder}</span>
                {value && (
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                            event.stopPropagation();
                            onChange("");
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                onChange("");
                            }
                        }}
                        className="ml-1 rounded text-gray-500 hover:text-white"
                        aria-label="Clear date filter"
                    >
                        <X size={13} />
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-[#303b52] bg-[#171F31] p-3 shadow-2xl">
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={goToPreviousMonth}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#232A3C] hover:text-white"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-semibold text-white">
                            {MONTHS[displayMonth]} {displayYear}
                        </span>
                        <button
                            type="button"
                            onClick={goToNextMonth}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#232A3C] hover:text-white"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="mb-1 grid grid-cols-7">
                        {WEEK_DAYS.map((day) => (
                            <div key={day} className="py-1 text-center text-xs text-[#7f8799]">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, index) => (
                            <div key={`empty-${index}`} />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, index) => {
                            const day = index + 1;
                            const dateKey = getDateKey(new Date(displayYear, displayMonth, day));
                            const isSelected = value === dateKey;

                            return (
                                <button
                                    key={dateKey}
                                    type="button"
                                    onClick={() => handleDateSelect(day)}
                                    className={`h-8 rounded-lg text-xs transition-colors ${isSelected ? "bg-[#8B3DFF] text-white" : "text-gray-300 hover:bg-[#232A3C] hover:text-white"}`}
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

export default ThemedDatePicker;
