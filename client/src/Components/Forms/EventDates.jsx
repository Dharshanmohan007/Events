import React, { useState } from 'react'
import CustomInput from "../CustomInput";

const GuestFields = ({ guestIndex, dayIndex }) => (
  <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
    <CustomInput label={`Day ${dayIndex} · Guest ${guestIndex} – Name *`} />
    <CustomInput label={`Day ${dayIndex} · Guest ${guestIndex} – Designation *`} />
    <CustomInput label={`Day ${dayIndex} · Guest ${guestIndex} – Organization *`} />
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

      <h2 className='text-purple-400 text-sm font-semibold tracking-wide'>
        Day {dayIndex}
      </h2>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <CustomInput type="date" label={`Day ${dayIndex} – Event Date *`} />
        <CustomInput type="time" label={`Day ${dayIndex} – Start Time *`} />
        <CustomInput type="time" label={`Day ${dayIndex} – End Time *`} />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <CustomInput
          label={`Day ${dayIndex} – Total Number of Guests *`}
          type="number"
          value={numGuests}
          onChange={handleGuestsChange}
        />
      </div>

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