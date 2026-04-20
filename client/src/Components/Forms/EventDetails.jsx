import React, { useState } from 'react'
import CustomSelect from "../CustomSelect";
import EventDates from './EventDates';

const inputBase =
  "w-full h-14 bg-transparent border border-[#3A3A5A] text-white rounded-lg focus:outline-none focus:border-purple-500";

const FloatingInput = ({ label, type = "text", value, onChange }) => (
  <div className="relative w-full">
    <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#16162A] z-10 pointer-events-none">
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

export default function EventDetails() {
  const [department, setDepartment] = useState("");
  const [eventType, setEventType] = useState("");
  const [society, setSociety] = useState("");
  const [logos, setLogos] = useState("");
  const [audience, setAudience] = useState("");
  const [numDays, setNumDays] = useState("");

  const handleDaysChange = (e) => {
    const val = e.target.value;
    // only allow positive integers
    if (val === "" || (/^\d+$/.test(val) && parseInt(val) >= 1)) {
      setNumDays(val);
    }
  };

  const dayCount = parseInt(numDays) > 0 ? parseInt(numDays) : 0;

  return (
    <div className='p-6 rounded-xl'>
      <h1 className='text-white text-lg font-bold mb-6'>Event Details</h1>

      <div className='mb-6'>
        <FloatingInput label="Name of the Event *" />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <CustomSelect
          label="Tagging"
          required
          value={department}
          onChange={setDepartment}
          options={["AIML","AIDS","CSE","CYS","CSBS","ECE","CCE","EEE","MECH","S&H","Media","Transport"]}
        />
        <FloatingInput label="Tagging Details *" />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <CustomSelect
          label="Type of Event"
          required
          value={eventType}
          onChange={setEventType}
          options={["FDP","Hackathon","Workshop","Seminar","Conference","Symposium","Webinar","Other"]}
        />
        <FloatingInput label="If type of event is others, please specify *" />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <CustomSelect
          label="Professional Society Involved"
          required
          value={society}
          onChange={setSociety}
          options={["IEEE","ISTE","CSI","ACM","Other"]}
        />
        <FloatingInput label="If professional society involved is others, please specify *" />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <CustomSelect
          label="Logos in Poster"
          required
          value={logos}
          onChange={setLogos}
          options={["College Logo","Society Logo","Both","Other"]}
        />
        <FloatingInput label="If logos in poster is others, please specify *" />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        {/* No of Days — controls how many EventDates render */}
        <FloatingInput
          label="No of Days *"
          type="number"
          value={numDays}
          onChange={handleDaysChange}
        />
        <CustomSelect
          label="Target Audience"
          required
          value={audience}
          onChange={setAudience}
          options={["Students","Faculty","Both"]}
        />
      </div>

      {/* Render EventDates once per day */}
      {dayCount > 0 && (
        <div className='flex flex-col gap-6 mt-2'>
          {Array.from({ length: dayCount }, (_, i) => (
            <EventDates key={i} dayIndex={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}