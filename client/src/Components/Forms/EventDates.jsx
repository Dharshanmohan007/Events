import React, { useState, useEffect } from 'react'
import CustomInput from "../CustomInput";
import CustomSelect from '../CustomSelect';
import TimePickerInput from "../TimePickerInput";
import CustomDatePicker from '../CustomDatePicker';

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
          options={["Male", "Female", "Other"]}
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

export default function EventDates({ dayIndex, dayData, updateDay, minDate, errors = {}, day1Guests = [],onDelete, }) {
  const [localTimeError, setLocalTimeError] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    // Set default Start Time and End Time when the day is initially created
  useEffect(() => {
    const updates = {};

    if (!dayData?.startTime) {
      updates.startTime = "08:40";
    }

    if (!dayData?.endTime) {
      updates.endTime = "16:10";
    }

    if (Object.keys(updates).length > 0) {
      updateDay({
        ...dayData,
        ...updates,
      });
    }
  }, []);
  
  useEffect(() => {
    if (dayData?.date && dayData?.startTime) {
      const today = new Date();
      const offset = today.getTimezoneOffset() * 60000;
      const todayStr = (new Date(today - offset)).toISOString().split("T")[0];
      
      if (dayData.date === todayStr) {
        const [selH, selM] = dayData.startTime.split(":").map(Number);
        const currentH = today.getHours();
        const currentM = today.getMinutes();
        
        if (selH < currentH || (selH === currentH && selM < currentM)) {
          const ampm = currentH >= 12 ? 'PM' : 'AM';
          let displayH = currentH % 12;
          displayH = displayH ? displayH : 12;
          const displayM = currentM.toString().padStart(2, '0');
          setLocalTimeError(`Current time is ${displayH}:${displayM} ${ampm}, cannot choose a past time for today.`);
        } else {
          setLocalTimeError("");
        }
      } else {
        setLocalTimeError("");
      }
    } else {
      setLocalTimeError("");
    }
  }, [dayData?.date, dayData?.startTime]);

  const handleGuestsChange = (e) => {
  const val = e.target.value;

  // Allow empty input
  if (val === "") {
    updateDay({
      ...dayData,
      numGuests: "",
      guests: [],
    });
    return;
  }

  // Allow only digits
  if (!/^\d+$/.test(val)) {
    return;
  }

  const count = parseInt(val, 10);

  // Maximum 10 guests
  if (count > 10) {
    return;
  }

  const existingGuests = dayData.guests || [];

  let newGuests;

  if (count > existingGuests.length) {
    const extra = Array.from(
      { length: count - existingGuests.length },
      () => ({
        name: "",
        designation: "",
        organization: "",
        mobile: "",
        gender: "",
      })
    );

    newGuests = [...existingGuests, ...extra];
  } else {
    newGuests = existingGuests.slice(0, count);
  }

  updateDay({
    ...dayData,
    numGuests: val,
    guests: newGuests,
  });
};

  const guestCount = parseInt(dayData?.numGuests) > 0 ? parseInt(dayData.numGuests) : 0;

  return (
    <div className='relative rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-6 mb-4'>
      {/* Delete Confirmation Popup */}
    {showDeleteConfirmation && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="w-full max-w-md rounded-xl border border-[#3A3A5A] bg-[#1E1E35] shadow-2xl p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10 border border-red-400/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5 text-red-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14a2 2 0 001.72 3h16.34a2 2 0 001.72-3l-8.18-14a2 2 0 00-3.44 0z"
                />
              </svg>
            </div>

            <h3 className="text-white text-lg font-semibold">
              Delete Day {dayIndex}?
            </h3>
          </div>

          {/* Message */}
          <p className="text-gray-300 text-sm leading-6">
            Are you sure you want to delete this day with the following
            date and time?
          </p>

          {/* Day Details */}
          <div className="mt-4 rounded-lg border border-[#3A3A5A] bg-[#16162A] p-4">
            <div className="space-y-2 text-sm">

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Day
                </span>
                <span className="text-white font-medium">
                  Day {dayIndex}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Date
                </span>
                <span className="text-white font-medium">
                  {dayData?.date || "Not selected"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Start Time
                </span>
                <span className="text-white font-medium">
                  {dayData?.startTime || "Not selected"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  End Time
                </span>
                <span className="text-white font-medium">
                  {dayData?.endTime || "Not selected"}
                </span>
              </div>

            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">

            {/* Cancel */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirmation(false)}
              className="px-5 py-2.5 rounded-lg border border-[#3A3A5A] text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
            >
              Cancel
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirmation(false);
                onDelete();
              }}
              className="px-5 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Delete
            </button>

          </div>
        </div>
      </div>
    )}
      <div className="flex items-center justify-between">
        <h2 className='text-purple-400 text-sm font-semibold tracking-wide'>
          Day {dayIndex}
        </h2>

        <button
          type="button"
          onClick={() => setShowDeleteConfirmation(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-red-400/40 text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors"
          title={`Delete Day ${dayIndex}`}
          aria-label={`Delete Day ${dayIndex}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7h10zM10 11v6M14 11v6"
            />
          </svg>
        </button>
      </div>

      {/* Date / Time */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className="relative w-full">
          <span
            className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
            style={{ backgroundColor: "#1E1E35" }}
          >
            {`Day ${dayIndex} – Event Date *`}
          </span>
          <CustomDatePicker
            value={dayData?.date || ""}
            onChange={(val) => updateDay({ ...dayData, date: val })}
            placeholder="DD/MM/YYYY"
            minDate={(() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const tomorrowStr = `${tomorrow.getFullYear()}-${String(
                tomorrow.getMonth() + 1
              ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

              if (!minDate) return tomorrowStr;

              return minDate > tomorrowStr ? minDate : tomorrowStr;
            })()}
            className="w-full !h-[50px] !text-sm !px-3.5 !rounded-lg !border-[#3A3A5A] !bg-transparent text-white"
          />
          {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
        </div>
                <div>
          <TimePickerInput
            labelBg="#1E1E35"
            label={`Day ${dayIndex} – Start Time *`}
            value={dayData?.startTime || "08:40"}
            onChange={(e) =>
              updateDay({
                ...dayData,
                startTime: e.target.value,
              })
            }
          />

          {localTimeError ? (
            <p className="text-red-400 text-xs mt-1">
              {localTimeError}
            </p>
          ) : errors.startTime ? (
            <p className="text-red-400 text-xs mt-1">
              {errors.startTime}
            </p>
          ) : null}
        </div>

        <div>
          <TimePickerInput
            labelBg="#1E1E35"
            label={`Day ${dayIndex} – End Time *`}
            value={dayData?.endTime || "16:10"}
            onChange={(e) =>
              updateDay({
                ...dayData,
                endTime: e.target.value,
              })
            }
          />

          {errors.endTime && (
            <p className="text-red-400 text-xs mt-1">
              {errors.endTime}
            </p>
          )}
        </div>
      </div>

      {/* Guests count */}
      {/* <div className=' items-center'> */}
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label={`Day ${dayIndex} – Total Number of Guests (max 10 guest allowed) *`}
            type="number"
            min={0}
            max={10}
            value={dayData?.numGuests ?? ""}
            onChange={handleGuestsChange}
            placeholder="Enter number of guests"
          />
          {errors.numGuests && <p className="text-red-400 text-xs mt-1">{errors.numGuests}</p>}
        </div>
      {/* </div> */}
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