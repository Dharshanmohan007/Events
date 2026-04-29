import React, { useState } from 'react'
import CustomInput from "../CustomInput";
import CustomSelect from '../CustomSelect';

const GuestFields = ({ guestIndex, dayIndex, data = {}, errors = {}, onChange }) => (
  <div className=' flex flex-col gap-6'>
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      <div>
        <CustomInput labelBg="#1E1E35" label={`Day ${dayIndex} · Guest ${guestIndex} – Name *`} value={data.name || ""} onChange={(e) => onChange({ ...data, name: e.target.value })} />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <CustomInput labelBg="#1E1E35" label={`Day ${dayIndex} · Guest ${guestIndex} – Designation *`} value={data.designation || ""} onChange={(e) => onChange({ ...data, designation: e.target.value })} />
        {errors.designation && <p className="text-red-400 text-xs mt-1">{errors.designation}</p>}
      </div>
      <div>
        <CustomInput labelBg="#1E1E35" label={`Day ${dayIndex} · Guest ${guestIndex} – Organization *`} value={data.organization || ""} onChange={(e) => onChange({ ...data, organization: e.target.value })} />
        {errors.organization && <p className="text-red-400 text-xs mt-1">{errors.organization}</p>}
      </div>
    </div>
    
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <div>
        <CustomInput labelBg="#1E1E35" label={`Day ${dayIndex} · Guest ${guestIndex} – Mobile Number *`} type="tel" value={data.mobile || ""} onChange={(e) => onChange({ ...data, mobile: e.target.value })} />
        {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
      </div>
      <div>
        <CustomSelect labelBg="#1E1E35" options={["Male", "Female", "Others"]} label={`Day ${dayIndex} · Guest ${guestIndex} – Gender *`} value={data.gender || ""} onChange={(e) => onChange({ ...data, gender: e.target.value })} />
        {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
      </div>
    </div>
  </div>
);

export default function EventDates({ dayIndex, dayData, updateDay, errors = {} }) {
  const handleGuestsChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && parseInt(val) >= 1)) {
      const count = parseInt(val) || 1;
      const existingGuests = dayData.guests || [];
      const newGuests = Array.from({ length: count }, (_, i) =>
        existingGuests[i] || { name: "", designation: "", organization: "" }
      );
      updateDay({ ...dayData, numGuests: val, guests: newGuests });
    }
  };

  const guestCount = parseInt(dayData?.numGuests) > 0 ? parseInt(dayData.numGuests) : 0;

  return (
    <div className='rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-6 mb-4'>
      <h2 className='text-purple-400 text-sm font-semibold tracking-wide'>Day {dayIndex}</h2>

      {/* Date / Time */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div>
          <CustomInput labelBg="#1E1E35" type="date" label={`Day ${dayIndex} – Event Date *`} value={dayData?.date || ""} onChange={(e) => updateDay({ ...dayData, date: e.target.value })} />
          {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
        </div>
        <div>
          <CustomInput labelBg="#1E1E35" type="time" label={`Day ${dayIndex} – Start Time *`} value={dayData?.startTime || ""} onChange={(e) => updateDay({ ...dayData, startTime: e.target.value })} />
          {errors.startTime && <p className="text-red-400 text-xs mt-1">{errors.startTime}</p>}
        </div>
        <div>
          <CustomInput labelBg="#1E1E35" type="time" label={`Day ${dayIndex} – End Time *`} value={dayData?.endTime || ""} onChange={(e) => updateDay({ ...dayData, endTime: e.target.value })} />
          {errors.endTime && <p className="text-red-400 text-xs mt-1">{errors.endTime}</p>}
        </div>
      </div>

      {/* Guests count */}
      <div className='grid grid-cols-1 sm:grid-cols-1 gap-4'>
        <div>
          <CustomInput labelBg="#1E1E35" label={`Day ${dayIndex} – Total Number of Guests *`} type="number" value={dayData?.numGuests || ""} onChange={handleGuestsChange} />
          {errors.numGuests && <p className="text-red-400 text-xs mt-1">{errors.numGuests}</p>}
        </div>
      </div>

      {/* Guest fields */}
      {guestCount > 0 && (
        <div className='flex flex-col gap-5'>
          {Array.from({ length: guestCount }, (_, i) => (
            <GuestFields
              key={i}
              guestIndex={i + 1}
              dayIndex={dayIndex}
              data={(dayData.guests && dayData.guests[i]) || {}}
              errors={(errors.guests && errors.guests[i]) || {}}
              onChange={(updated) => {
                const guests = [...(dayData.guests || [])];
                guests[i] = updated;
                updateDay({ ...dayData, guests });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}