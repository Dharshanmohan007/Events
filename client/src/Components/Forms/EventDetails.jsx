import React, { useState,useEffect  } from 'react'
import CustomSelect, { SDG_GOALS } from "../CustomSelect";
import CustomInput from "../CustomInput";
import EventDates from './EventDates';
import { getEventTypes } from "../../services/events/getEventTypes";

export default function EventDetails({disabled = false, setEventDays, errors = {}, eventData = {}, setEventData, setErrors }) {
  const daysData = eventData.eventDays || [];
  const numDays = daysData.length > 0 ? daysData.length.toString() : "";
  const [eventTypeOptions, setEventTypeOptions] = useState([]);

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await getEventTypes();

        // console.log("API Response:", response);

        if (response.success) {
          const types = response.data.map(item => item.eventType);

          // console.log("Types:", types);

          setEventTypeOptions([...types, "Other"]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchEventTypes();
  }, []);

  const handleDaysChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && parseInt(val) >= 1)) {
      const count = parseInt(val) || 0;
      // Preserve existing days data — only add new empty days or trim from the end
      const existing = eventData.eventDays || [];
      let newDays;
      if (count > existing.length) {
        // Adding more days: keep all existing, append new empty ones
        const extra = Array.from({ length: count - existing.length }, () => ({
          date: "",
          startTime: "",
          endTime: "",
          numGuests: "1",
          guests: [{ name: "", designation: "", organization: "", mobile: "", gender: "" }],
        }));
        newDays = [...existing, ...extra];
      } else {
        // Reducing days: trim from the END only
        newDays = existing.slice(0, count);
      }
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

  // logos is multi-select → value is an array
  const handleLogosChange = (val) => {
    // val is an array from the multi-select CustomSelect
    setEventData((prev) => ({ ...prev, logos: val }));
    if (setErrors) setErrors((prev) => ({ ...prev, logos: "" }));
  };

  // Normalize logos to array for display
  const logosValue = Array.isArray(eventData?.logos)
    ? eventData.logos
    : eventData?.logos
    ? [eventData.logos]
    : [];

  const dayCount = parseInt(numDays) > 0 ? parseInt(numDays) : 0;

  const audienceValue = Array.isArray(eventData?.audience)
  ? eventData.audience
  : eventData?.audience
  ? [eventData.audience]
  : [];

  return (
    <div
            className={`${
                disabled
                    ? "opacity-50 pointer-events-none select-none"
                    : ""
            }`}
        >
    <div className='px-1 py-6 rounded-xl'>
      <h1 className='text-white text-lg font-bold mb-6 playfair'>Event Details</h1>

      {/* Event Name */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <CustomInput
            label="Name of the Event *"
            value={eventData?.eventName || ""}
            onChange={handle("eventName")}
            placeholder="Enter event name"
          />
          {errors.eventName && <p className="text-red-400 text-xs mt-1">{errors.eventName}</p>}
        </div>
        <div>
          <CustomSelect
            label="IIC Need *"
            value={eventData?.iic || ""}
            onChange={handleSelect("iic")}
            options={["Yes", "No"]}
            placeholder="Select IIC need"
          />
          {errors.iic && <p className="text-red-400 text-xs mt-1">{errors.iic}</p>}
        </div>
      </div>

      {/* Event Type — single-select with search */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <CustomSelect
            label="Type of Event"
            required
            searchable
            value={eventData?.eventType || ""}
            onChange={handleSelect("eventType")}
            options={eventTypeOptions}
            placeholder="Select event type"
          />
          {errors.eventType && <p className="text-red-400 text-xs mt-1">{errors.eventType}</p>}
        </div>
        <div>
          <CustomInput
            label="If type of event is others, please specify *"
            value={eventData?.eventTypeOther || ""}
            onChange={handle("eventTypeOther")}
            disabled={eventData?.eventType !== "Other"}
            placeholder="Specify event type"
          />
          {errors.eventTypeOther && <p className="text-red-400 text-xs mt-1">{errors.eventTypeOther}</p>}
        </div>
      </div>

      {/* Professional Society — single-select with search */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <CustomSelect
            label="Professional Society Involved"
            required
            multi
            searchable
            value={
              Array.isArray(eventData?.society)
                ? eventData.society
                : eventData?.society
                ? [eventData.society]
                : []
            }
            onChange={(val) => {
              setEventData((prev) => ({
                ...prev,
                society: val,
              }));

              if (setErrors) {
                setErrors((prev) => ({
                  ...prev,
                  society: "",
                }));
              }
            }}
            options={["IEEE", "ISTE", "CSI", "IETE", "WICYS", "IGEN", "Other"]}
            placeholder="Select professional society"
          />
          {errors.society && (
            <p className="text-red-400 text-xs mt-1">{errors.society}</p>
          )}
        </div>
        <div>
          <CustomInput
            label="If professional society involved is others, please specify *"
            value={eventData?.societyOther || ""}
            onChange={handle("societyOther")}
            disabled={
              !(
                Array.isArray(eventData?.society)
                  ? eventData.society
                  : eventData?.society
                  ? [eventData.society]
                  : []
              ).includes("Other")
            }
            placeholder="Specify society"
          />
          {errors.societyOther && <p className="text-red-400 text-xs mt-1">{errors.societyOther}</p>}
        </div>
      </div>

      {/* Logos — multi-select with search */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <CustomSelect
            label="Logos in Poster"
            required
            multi
            value={logosValue}
            onChange={handleLogosChange}
            options={["AICTE", "IIC","Viksit Bharat", "Skill India", "IEEE","ISTE","CSI","IETE","IEI","WICYS", "IGEN", "SDG", "Other"]}
            nestedOptions={{ "SDG": SDG_GOALS }}
            placeholder="Select logos"
          />
          {errors.logos && <p className="text-red-400 text-xs mt-1">{errors.logos}</p>}
        </div>
        <div>
          <CustomInput
            label="If logos in poster is others, please specify *"
            value={eventData?.logosOther || ""}
            onChange={handle("logosOther")}
            disabled={!logosValue.includes("Other")}
            placeholder="Specify logos"
          />
          {errors.logosOther && <p className="text-red-400 text-xs mt-1">{errors.logosOther}</p>}
        </div>
      </div>

      {/* Days & Audience */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <CustomInput
            label="No of Days *"
            type="number"
            value={numDays}
            onChange={handleDaysChange}
            placeholder="Enter number of days"
          />
          {errors.numDays && <p className="text-red-400 text-xs mt-1">{errors.numDays}</p>}
        </div>
        <div>
          <CustomSelect
            label="Target Audience"
            required
            multi
            searchable
            value={audienceValue}
            onChange={(val) => {
              setEventData((prev) => ({
                ...prev,
                audience: val,
              }));

              if (setErrors) {
                setErrors((prev) => ({
                  ...prev,
                  audience: "",
                }));
              }
            }}
            options={[
              "Internal Students",
              "Internal Faculty",
              "External Students",
              "External Faculty",
              "Industry Person",
            ]}
            placeholder="Select target audience"
          />
          {errors.audience && <p className="text-red-400 text-xs mt-1">{errors.audience}</p>}
        </div>
      </div>

      {/* Day Cards */}
      {daysData.map((day, i) => {
        const today = new Date().toISOString().split("T")[0];
        let calculatedMinDate = today;
        if (i > 0 && daysData[i - 1].date) {
          calculatedMinDate = daysData[i - 1].date > today ? daysData[i - 1].date : today;
        }

        return (
          <EventDates
            key={i}
            dayIndex={i + 1}
            dayData={day}
            day1Guests={i > 0 ? daysData[0].guests : []}
            minDate={calculatedMinDate}
            errors={(errors.days && errors.days[i]) || {}}
            updateDay={(updatedDay) => {
              const updated = [...daysData];
              updated[i] = updatedDay;
              setEventDays(updated);
              setEventData((prev) => ({ ...prev, eventDays: updated }));
            }}
          />
        );
      })}
      </div>
    </div>
  );
}