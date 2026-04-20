import React, { useState } from 'react'

const inputBase =
  "w-full h-12 sm:h-14 bg-transparent border border-[#3A3A5A] text-white rounded-lg focus:outline-none focus:border-purple-500";

const FloatingInput = ({ label, type = "text", value, onChange }) => (
  <div className="relative w-full">
    <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
      {label}
    </span>
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      className={`${inputBase} px-4`}
      placeholder=""
    />
  </div>
);

const FloatingDateInput = ({ label }) => (
  <div className="relative w-full">
    <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
      {label}
    </span>
    <input
      type="date"
      className={`${inputBase} px-4 text-gray-400 [color-scheme:dark]`}
    />
  </div>
);

const FloatingTimeInput = ({ label }) => (
  <div className="relative w-full">
    <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
      {label}
    </span>
    <input
      type="time"
      className={`${inputBase} px-4 text-gray-400 [color-scheme:dark]`}
    />
  </div>
);

// Guest row — name, designation, organization
const GuestFields = ({ guestIndex, dayIndex }) => (
  <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
    <FloatingInput label={`Day ${dayIndex} · Guest ${guestIndex} – Name *`} />
    <FloatingInput label={`Day ${dayIndex} · Guest ${guestIndex} – Designation *`} />
    <FloatingInput label={`Day ${dayIndex} · Guest ${guestIndex} – Organization *`} />
  </div>
);

export default function EventDates({ dayIndex }) {
  const [numGuests, setNumGuests] = useState("1");

  const handleGuestsChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && parseInt(val) >= 1)) {
      setNumGuests(val);
    }
  };

  const guestCount = parseInt(numGuests) > 0 ? parseInt(numGuests) : 0;

  return (
    <div className='rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-6'>

      {/* Day label */}
      <h2 className='text-purple-400 text-sm font-semibold tracking-wide'>
        Day {dayIndex}
      </h2>

      {/* Date / Start Time / End Time */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <FloatingDateInput label={`Day ${dayIndex} – Event Date *`} />
        <FloatingTimeInput label={`Day ${dayIndex} – Start Time *`} />
        <FloatingTimeInput label={`Day ${dayIndex} – End Time *`} />
      </div>

      {/* Total Number of Guests — controls guest rows */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <FloatingInput
          label={`Day ${dayIndex} – Total Number of Guests *`}
          type="number"
          value={numGuests}
          onChange={handleGuestsChange}
        />
      </div>

      {/* Render one GuestFields block per guest */}
      {guestCount > 0 && (
        <div className='flex flex-col gap-5'>
          {Array.from({ length: guestCount }, (_, i) => (
            <GuestFields key={i} guestIndex={i + 1} dayIndex={dayIndex} />
          ))}
        </div>
      )}
    </div>
  );
}