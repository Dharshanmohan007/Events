import React, { useState, forwardRef, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays, Clock, User, Phone, ChevronDown } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

const DateInput = forwardRef(({ value, onClick, label }, ref) => (
  <div className="relative w-full">
    <input
      ref={ref}
      value={value || ""}
      onClick={onClick}
      readOnly
      className="w-full p-3 rounded-lg bg-transparent border border-[#3a3a5a] text-white cursor-pointer
      focus:border-[#ab45ff] outline-none transition"
    />
    <label className="absolute left-3 -top-2 text-xs text-gray-300 bg-[#1f1f38] px-1">
      {label}
    </label>

    <div className="absolute right-3 top-3 flex gap-2 text-gray-400">
      <CalendarDays size={14} />
      <Clock size={14} />
    </div>
  </div>
));

export default function AccommodationForm({ nextStep, handlePrevious }) {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  const [values, setValues] = useState({});
  const [selectedRequirements, setSelectedRequirements] = useState([]);

  const [form, setForm] = useState({
    singleRooms: "",
    doubleRooms: "",
    suiteRooms: "",
    dBlockRooms: "",
    roomType: "",
    dine: "",
    dineType: "",
    hostelGuests: "1",
    amenityGuests: "1",
    special: "",
  });

  const [guests, setGuests] = useState([
    { id: 1, name: "Surya Chandran", gender: "Male", phone: "9080884370", selected: false },
    { id: 2, name: "Surya Chandran", gender: "Male", phone: "9080884370", selected: true },
  ]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleGuest = (id) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g))
    );
  };

  const handleNextClick = () => {
    const selected = Object.keys(values).filter(
      (key) => values[key] === ""
    );

    setSelectedRequirements(selected);
    console.log("Next clicked");

    if (nextStep) nextStep();
  };

  const handlePrevClick = () => {
    if (handlePrevious) handlePrevious();
  };

  return (
    <div className="bg-[#1f1f38] p-6 rounded-xl text-white w-full">

   
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full">
          <DatePicker
            selected={checkIn}
            onChange={setCheckIn}
            showTimeSelect
            dateFormat="dd/MM/yyyy h:mm aa"
            customInput={<DateInput label="Check In date & Time *" />}
            withPortal
          />
        </div>

        <div className="w-full">
          <DatePicker
            selected={checkOut}
            onChange={setCheckOut}
            showTimeSelect
            dateFormat="dd/MM/yyyy h:mm aa"
            customInput={<DateInput label="Check Out & Time *" />}
            withPortal
          />
        </div>
      </div>


      <div className="flex justify-between mb-2">
        <p className="text-purple-400 text-sm">
          Select the Guest who needed Accommodation
        </p>
        <p className="text-xs text-gray-400">
          Selected Guest : {guests.filter(g => g.selected).length} / {guests.length}
        </p>
      </div>

      <div className="mb-6">
        {guests.map((g) => (
          <div key={g.id}
            className="flex justify-between items-center bg-[#2a2a4a] border border-[#3a3a5a] p-3 rounded-lg mb-2">
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={g.selected}
                onChange={() => toggleGuest(g.id)}
                className="accent-[#ab45ff]"
              />
              <span>{g.name}</span>
            </div>

            <div className="flex gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <User size={14} /> {g.gender}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={14} /> {g.phone}
              </span>
            </div>
          </div>
        ))}
      </div>

 
      <div className="grid md:grid-cols-2 gap-4">

        <Input label="No. of SSSingle Rooms *"
          value={form.singleRooms}
          onChange={(e) => handleChange("singleRooms", e.target.value)}
        />

        <Input label="No. of Double Rooms *"
          value={form.doubleRooms}
          onChange={(e) => handleChange("doubleRooms", e.target.value)}
        />

        <CustomSelect
          label="Type of Room Wanted *"
          value={form.roomType}
          onChange={(val) => handleChange("roomType", val)}
          options={[
            { label: "Suite Room", value: "suite" },
            { label: "D - Block", value: "dblock" },
          ]}
          full
        />

        <Input label="No. of Suite Rooms *"
          value={form.suiteRooms}
          onChange={(e) => handleChange("suiteRooms", e.target.value)}
        />

        <Input label="No. of D - Block Rooms *"
          value={form.dBlockRooms}
          onChange={(e) => handleChange("dBlockRooms", e.target.value)}
        />

        <CustomSelect
          label="Do You want dine-in Request for this guest? *"
          value={form.dine}
          onChange={(val) => handleChange("dine", val)}
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
          full
        />

        {form.dine === "yes" && (
          <>
            <CustomSelect
              label="Select the Dine-in wanted *"
              value={form.dineType}
              onChange={(val) => handleChange("dineType", val)}
              options={[
                { label: "Amenity / Hostel", value: "both" },
                { label: "Hostel", value: "hostel" },
                { label: "Amenity", value: "amenity" },
              ]}
              full
            />

            <div className="col-span-2 grid md:grid-cols-2 gap-4">
              <Input
                label="No. of Guest In hostel Dine-in *"
                value={form.hostelGuests}
                onChange={(e) => handleChange("hostelGuests", e.target.value)}
              />
              <Input
                label="No. of Guest In Amenity Dine-in *"
                value={form.amenityGuests}
                onChange={(e) => handleChange("amenityGuests", e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <Textarea
                label="Special Requirements, If any *"
                value={form.special}
                onChange={(e) => handleChange("special", e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mt-14 w-full">
        <button
          onClick={handlePrevClick}
          className="border border-purple-500 text-purple-500 px-6 py-2 rounded-lg  transition"
        >
          ← Back
        </button>

        <button
          onClick={handleNextClick}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          Next →
        </button>
      </div>  
    </div>
  );
}


function Input({ label, value, onChange }) {
  return (
    <div className="relative w-full">
      <input
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-lg bg-transparent border border-[#3a3a5a] text-white
        focus:border-[#ab45ff] outline-none transition"
      />
      <label className="absolute left-3 -top-2 text-xs text-gray-300 bg-[#1f1f38] px-1">
        {label}
      </label>
    </div>
  );
}


function Textarea({ label, value, onChange }) {
  return (
    <div className="relative w-full">
      <textarea
        rows={4}
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-lg bg-transparent border border-[#3a3a5a] text-white
        focus:border-[#ab45ff] outline-none transition"
      />
      <label className="absolute left-3 -top-2 text-xs text-gray-300 bg-[#1f1f38] px-1">
        {label}
      </label>
    </div>
  );
}


function CustomSelect({ label, value, onChange, options, full }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) => {
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className={`relative w-full ${full ? "col-span-2" : ""}`}>
      <div
        onClick={() => setOpen(!open)}
        className="w-full p-3 rounded-lg bg-[#1f1f38] border border-[#3a3a5a] flex justify-between items-center cursor-pointer"
      >
        <span className={!value ? "text-gray-400" : ""}>
          {options.find(o => o.value === value)?.label || "Select"}
        </span>

        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      <label className="absolute left-3 -top-2 text-xs text-gray-300 bg-[#1f1f38] px-1">
        {label}
      </label>

      {open && (
        <div className="absolute mt-2 w-full bg-[#1f1f38] border border-[#3a3a5a] rounded-md z-50">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-[#ab45ff] cursor-pointer"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}