import React, { useState } from 'react'
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";
import EventDates from './EventDates';

export default function EventDetails({ setEventDays, errors = {}, eventData = {}, setEventData, setErrors }) {
  const daysData = eventData.eventDays || [];
  const numDays = daysData.length > 0 ? daysData.length.toString() : "";

  const handleDaysChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && parseInt(val) >= 1)) {
      const count = parseInt(val) || 0;
      const newDays = Array.from({ length: count }, (_, i) => ({
        date: "",
        startTime: "",
        endTime: "",
        numGuests: "1",
        guests: [{ name: "", designation: "", organization: "" }],
      }));
      setEventDays(newDays);
      setEventData((prev) => ({ ...prev, eventDays: newDays }));
      if (setErrors) setErrors((prev) => ({ ...prev, numDays: "" }));
    }
  };

  const handle = (field) => (e) => {
    const value = e.target.value;
    setEventData((prev) => ({ ...prev, [field]: value }));
    if (setErrors) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSelect = (field) => (val) => {
    setEventData((prev) => ({ ...prev, [field]: val }));
    if (setErrors) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const dayCount = parseInt(numDays) > 0 ? parseInt(numDays) : 0;

  return (
    <div className='px-6 py-6 rounded-xl'>
      <h1 className='text-white text-lg font-bold mb-6 playfair'>Event Details</h1>

      {/* Event Name */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <CustomInput label="Name of the Event *" value={eventData?.eventName || ""} onChange={handle("eventName")} />
          {errors.eventName && <p className="text-red-400 text-xs mt-1">{errors.eventName}</p>}
        </div>
        <div>
          <CustomSelect label="IIC Need *" value={eventData?.iic || ""} onChange={handleSelect("iic")}
            options={["Yes","No"]} />
          {errors.iic && <p className="text-red-400 text-xs mt-1">{errors.iic}</p>}
        </div>
      </div>

      {/* Event Type */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <CustomSelect label="Type of Event" required value={eventData?.eventType || ""} onChange={handleSelect("eventType")}
            options={["FDP","Hackathon","Workshop","Seminar","Conference","Symposium","Webinar","Other"]} />
          {errors.eventType && <p className="text-red-400 text-xs mt-1">{errors.eventType}</p>}
        </div>
        <div>
          <CustomInput
            label="If type of event is others, please specify *"
            value={eventData?.eventTypeOther || ""}
            onChange={handle("eventTypeOther")}
            disabled={eventData?.eventType !== "Other"}
          />
          {errors.eventTypeOther && <p className="text-red-400 text-xs mt-1">{errors.eventTypeOther}</p>}
        </div>
      </div>

      {/* Professional Society */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <CustomSelect label="Professional Society Involved" required value={eventData?.society || ""} onChange={handleSelect("society")}
            options={["IEEE","ISTE","CSI","ACM","Other"]} />
          {errors.society && <p className="text-red-400 text-xs mt-1">{errors.society}</p>}
        </div>
        <div>
          <CustomInput
            label="If professional society involved is others, please specify *"
            value={eventData?.societyOther || ""}
            onChange={handle("societyOther")}
            disabled={eventData?.society !== "Other"}
          />
          {errors.societyOther && <p className="text-red-400 text-xs mt-1">{errors.societyOther}</p>}
        </div>
      </div>

      {/* Logos */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <CustomSelect label="Logos in Poster" required value={eventData?.logos || ""} onChange={handleSelect("logos")}
            options={["College Logo","Society Logo","Both","Other"]} />
          {errors.logos && <p className="text-red-400 text-xs mt-1">{errors.logos}</p>}
        </div>
        <div>
          <CustomInput
            label="If logos in poster is others, please specify *"
            value={eventData?.logosOther || ""}
            onChange={handle("logosOther")}
            disabled={eventData?.logos !== "Other"}
          />
          {errors.logosOther && <p className="text-red-400 text-xs mt-1">{errors.logosOther}</p>}
        </div>
      </div>

      {/* Days & Audience */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <CustomInput label="No of Days *" type="number" value={numDays} onChange={handleDaysChange} />
          {errors.numDays && <p className="text-red-400 text-xs mt-1">{errors.numDays}</p>}
        </div>
        <div>
          <CustomSelect label="Target Audience" required value={eventData?.audience || ""} onChange={handleSelect("audience")}
            options={["Students","Faculty","Both"]} />
          {errors.audience && <p className="text-red-400 text-xs mt-1">{errors.audience}</p>}
        </div>
      </div>

      {/* Day Cards */}
      {daysData.map((day, i) => (
        <EventDates
          key={i}
          dayIndex={i + 1}
          dayData={day}
          errors={(errors.days && errors.days[i]) || {}}
          updateDay={(updatedDay) => {
            const updated = [...daysData];
            updated[i] = updatedDay;
            setEventDays(updated);
            setEventData((prev) => ({ ...prev, eventDays: updated }));
          }}
        />
      ))}
    </div>
  );
}