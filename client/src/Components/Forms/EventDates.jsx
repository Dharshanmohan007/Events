import React from 'react'
import CustomInput from "../CustomInput";
import CustomSelect from '../CustomSelect';
import TimePickerInput from "../TimePickerInput";

// Indian mobile regex
const MOBILE_REGEX = /^[6-9]\d{9}$/;
// Disallow purely numeric names
const NAME_REGEX = /^(?!\s*\d+\s*$).+/;

const GuestFields = ({ guestIndex, dayIndex, data = {}, errors = {}, onChange }) => (
  <div className='flex flex-col gap-6'>
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      <div>
        <CustomInput
          labelBg="#2E3645"
          label={`Day ${dayIndex} · Guest ${guestIndex} – Name *`}
          value={data.name || ""}
          onChange={(e) => {
            const val = e.target.value;
            // Prevent purely numeric input for name
            if (/^\d+$/.test(val)) return;
            onChange({ ...data, name: val });
          }}
          borderColor="#FFFFFF66"
          placeholder="Enter guest name"
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <CustomInput
          labelBg="#2E3645"
          label={`Day ${dayIndex} · Guest ${guestIndex} – Designation *`}
          value={data.designation || ""}
          onChange={(e) => onChange({ ...data, designation: e.target.value })}
          borderColor="#FFFFFF66"
          placeholder="Enter designation"
        />
        {errors.designation && <p className="text-red-400 text-xs mt-1">{errors.designation}</p>}
      </div>
      <div>
        <CustomInput
          labelBg="#2E3645"
          label={`Day ${dayIndex} · Guest ${guestIndex} – Organization *`}
          value={data.organization || ""}
          onChange={(e) => onChange({ ...data, organization: e.target.value })}
          borderColor="#FFFFFF66"
          placeholder="Enter organization"
        />
        {errors.organization && <p className="text-red-400 text-xs mt-1">{errors.organization}</p>}
      </div>
    </div>

    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <div>
        <CustomInput
          labelBg="#2E3645"
          label={`Day ${dayIndex} · Guest ${guestIndex} – Mobile Number *`}
          type="tel"
          value={data.mobile || ""}
          onChange={(e) => {
            // Only allow digits, max 10
            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
            onChange({ ...data, mobile: val });
          }}
          borderColor="#FFFFFF66"
          placeholder="Enter 10-digit mobile number"
        />
        {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
      </div>
      <div>
        <CustomSelect
          labelBg="#2E3645"
          options={["Male", "Female", "Others"]}
          label={`Day ${dayIndex} · Guest ${guestIndex} – Gender *`}
          value={data.gender || ""}
          onChange={(val) => onChange({ ...data, gender: val })}
          borderColor="#FFFFFF66"
          placeholder="Select gender"
        />
        {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
      </div>
    </div>
  </div>
);

export default function EventDates({ dayIndex, dayData, updateDay, minDate, errors = {}, day1Guests = [] }) {
  const handleGuestsChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && parseInt(val) >= 1)) {
      const count = parseInt(val) || 1;
      const existingGuests = dayData.guests || [];
      // Preserve existing guest data — only add empty entries or trim from end
      let newGuests;
      if (count > existingGuests.length) {
        const extra = Array.from({ length: count - existingGuests.length }, () => ({
          name: "", designation: "", organization: "", mobile: "", gender: "",
        }));
        newGuests = [...existingGuests, ...extra];
      } else {
        newGuests = existingGuests.slice(0, count);
      }
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
          <CustomInput
            labelBg="#1E1E35"
            type="date"
            label={`Day ${dayIndex} – Event Date *`}
            value={dayData?.date || ""}
            min={minDate}
            onChange={(e) => updateDay({ ...dayData, date: e.target.value })}
          />
          {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
        </div>
        <div>
          <TimePickerInput
            labelBg="#1E1E35"
            label={`Day ${dayIndex} – Start Time *`}
            value={dayData?.startTime || ""}
            onChange={(e) => updateDay({ ...dayData, startTime: e.target.value })}
          />
          {errors.startTime && <p className="text-red-400 text-xs mt-1">{errors.startTime}</p>}
        </div>
        <div>
          <TimePickerInput
            labelBg="#1E1E35"
            label={`Day ${dayIndex} – End Time *`}
            value={dayData?.endTime || ""}
            onChange={(e) => updateDay({ ...dayData, endTime: e.target.value })}
          />
          {errors.endTime && <p className="text-red-400 text-xs mt-1">{errors.endTime}</p>}
        </div>
      </div>

      {/* Guests count */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-center'>
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label={`Day ${dayIndex} – Total Number of Guests *`}
            type="number"
            value={dayData?.numGuests || ""}
            onChange={handleGuestsChange}
            placeholder="Enter number of guests"
          />
          {errors.numGuests && <p className="text-red-400 text-xs mt-1">{errors.numGuests}</p>}
        </div>
        {dayIndex > 1 && (
          <div className="flex items-center mt-2 sm:mt-0">
            <input
              type="checkbox"
              id={`same-as-day1-${dayIndex}`}
              className="mr-2 w-4 h-4 cursor-pointer"
              onChange={(e) => {
                if (e.target.checked) {
                  updateDay({
                    ...dayData,
                    numGuests: day1Guests.length.toString(),
                    guests: JSON.parse(JSON.stringify(day1Guests)),
                  });
                }
              }}
            />
            <label htmlFor={`same-as-day1-${dayIndex}`} className="text-white text-sm cursor-pointer">
              Same as Day 1 Guests
            </label>
          </div>
        )}
      </div>

      {/* Guest fields */}
      {guestCount > 0 && (
        <div className='flex flex-col gap-4'>
          {Array.from({ length: guestCount }, (_, i) => (
            <div
              key={i}
              className='rounded-xl border border-[#3A3A5A] bg-[#2E3645] p-4 sm:p-6'
            >
              <GuestFields
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}