  import React, { useEffect, useState } from "react";
  import CustomDateTimePicker from "../../Components/CustomDateTimePicker";

  import {
    Plus,
    MapPin,
    GripVertical,
    X,
    ChevronDown,
    ArrowRight,
  } from "lucide-react";

  import { jwtDecode } from "jwt-decode";
  import { API_BASE } from "../../utils/apiConfig";

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

  return (
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
            options={["Guest Lecture", "Workshop","Seminar", "FDP", "POP", "Conference", "VAC", "IOC", "Training", "Orientation","Project Expo","Placement","Outreach","Hackathon","Contest", "Other"]}
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
            searchable
            value={eventData?.society || ""}
            onChange={handleSelect("society")}
            options={["IEEE", "ISTE", "CSI", "IETE", "WICYS","IGEN", "Other"]}
            placeholder="Select professional society"
          />
          {errors.society && <p className="text-red-400 text-xs mt-1">{errors.society}</p>}
        </div>
        <div>
          <CustomInput
            label="If professional society involved is others, please specify *"
            value={eventData?.societyOther || ""}
            onChange={handle("societyOther")}
            disabled={eventData?.society !== "Other"}
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
            value={eventData?.audience || ""}
            onChange={handleSelect("audience")}
            options={["Students", "Faculty", "Both"]}
            placeholder="Select target audience"
          />
          {errors.audience && <p className="text-red-400 text-xs mt-1">{errors.audience}</p>}
        </div>
      </div>
    );
  };

  export default TransportDetailsPage;