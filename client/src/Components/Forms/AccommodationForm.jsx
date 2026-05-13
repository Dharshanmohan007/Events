import React, { useState, forwardRef, useRef, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays, Clock, User, Phone } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";

const BASE_URL = "https://sece-events.onrender.com";

const DateInput = forwardRef(({ value, onClick, label }, ref) => (
  <div className="relative w-full">
    <input
      ref={ref}
      value={value || ""}
      onClick={onClick}
      readOnly
      className="w-full p-3 rounded-lg bg-transparent border border-[#3a3a5a] text-white cursor-pointer focus:border-[#ab45ff] outline-none transition"
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
DateInput.displayName = "DateInput";

function validateAccommodation(data) {
  const errors = {};
  if (!data.checkIn) errors.checkIn = "Check-in date is required";
  if (!data.checkOut) errors.checkOut = "Check-out date is required";
  if (!data.roomType) errors.roomType = "Room type is required";
  return errors;
}

export default function AccommodationForm({
  nextStep,
  prevStep,
  registerChildNavigation,
  accommodationData: initialData,
  onAccommodationDataChange,
  eventId,
  errors: propErrors = {},
}) {
  const defaultForm = {
    checkIn: null,
    checkOut: null,
    singleRooms: "",
    doubleRooms: "",
    suiteRooms: "",
    dBlockRooms: "",
    roomType: "",
    dine: "",
    dineType: "",
    hostelGuests: "",
    amenityGuests: "",
    special: "",
  };

  const [form, setForm] = useState(() =>
    initialData && Object.keys(initialData).length > 0 ? { ...defaultForm, ...initialData } : defaultForm
  );

  const [guests, setGuests] = useState(
    initialData?.guests && initialData.guests.length > 0
      ? initialData.guests
      : [
          { id: 1, name: "Surya Chandran", gender: "Male", phone: "9080884370", selected: false },
          { id: 2, name: "Surya Chandran", gender: "Male", phone: "9080884370", selected: true },
        ]
  );

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Always-fresh ref for handleNext
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);
  const guestsRef = useRef(guests);
  useEffect(() => { guestsRef.current = guests; }, [guests]);

  // Sync to parent
  const onChangeRef = useRef(onAccommodationDataChange);
  useEffect(() => { onChangeRef.current = onAccommodationDataChange; }, [onAccommodationDataChange]);
  useEffect(() => {
    if (onChangeRef.current) onChangeRef.current({ ...form, guests });
  }, [form, guests]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const toggleGuest = (id) =>
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g)));

  const handleNext = useCallback(async () => {
    const latest = formRef.current;
    const errs = validateAccommodation(latest);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    setApiError("");
    try {
      const selectedGuests = guestsRef.current.filter((g) => g.selected);
      const payload = {
        accommodationDetails: {
          checkIn: latest.checkIn ? latest.checkIn.toISOString() : "",
          checkOut: latest.checkOut ? latest.checkOut.toISOString() : "",
          singleRooms: parseInt(latest.singleRooms) || 0,
          doubleRooms: parseInt(latest.doubleRooms) || 0,
          suiteRooms: parseInt(latest.suiteRooms) || 0,
          dBlockRooms: parseInt(latest.dBlockRooms) || 0,
          roomType: latest.roomType || "",
          dineInRequired: latest.dine === "Yes",
          dineInType: latest.dineType || "",
          hostelGuestCount: parseInt(latest.hostelGuests) || 0,
          amenityGuestCount: parseInt(latest.amenityGuests) || 0,
          specialRequirements: latest.special || "",
          guests: selectedGuests.map((g) => ({ name: g.name, gender: g.gender, phone: g.phone })),
        },
      };
      const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Server error: ${response.status}`);
      nextStep();
    } catch (err) {
      setApiError(err.message || "Failed to save accommodation details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, nextStep]);

  const handleBack = useCallback(() => { if (prevStep) prevStep(); }, [prevStep]);

  const navRef = useRef({ next: handleNext, prev: handleBack, isLoading });
  useEffect(() => { navRef.current = { next: handleNext, prev: handleBack, isLoading }; });

  useEffect(() => {
    if (!registerChildNavigation) return;
    const stableNext = (...args) => navRef.current.next(...args);
    const stablePrev = (...args) => navRef.current.prev(...args);
    registerChildNavigation({ next: stableNext, prev: stablePrev, isLoading: false });
    return () => registerChildNavigation({ next: null, prev: null, isLoading: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerChildNavigation]);

  useEffect(() => {
    if (!registerChildNavigation) return;
    registerChildNavigation({ next: navRef.current.next, prev: navRef.current.prev, isLoading });
  }, [isLoading, registerChildNavigation]);

  return (
    <div className="bg-[#1f1f38] p-6 rounded-xl text-white w-full">
      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      {/* Check In / Out */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full">
          <DatePicker
            selected={form.checkIn}
            onChange={(date) => handleChange("checkIn", date)}
            showTimeSelect
            dateFormat="dd/MM/yyyy h:mm aa"
            customInput={<DateInput label="Check In Date & Time *" />}
            withPortal
          />
          {errors.checkIn && <p className="text-red-400 text-xs mt-1">{errors.checkIn}</p>}
        </div>
        <div className="w-full">
          <DatePicker
            selected={form.checkOut}
            onChange={(date) => handleChange("checkOut", date)}
            showTimeSelect
            dateFormat="dd/MM/yyyy h:mm aa"
            customInput={<DateInput label="Check Out Date & Time *" />}
            withPortal
          />
          {errors.checkOut && <p className="text-red-400 text-xs mt-1">{errors.checkOut}</p>}
        </div>
      </div>

      {/* Guest Selection */}
      <div className="flex justify-between mb-2">
        <p className="text-purple-400 text-sm">Select the Guest who needed Accommodation</p>
        <p className="text-xs text-gray-400">
          Selected Guest : {guests.filter((g) => g.selected).length} / {guests.length}
        </p>
      </div>
      <div className="mb-6">
        {guests.map((g) => (
          <div
            key={g.id}
            className="flex justify-between items-center bg-[#2a2a4a] border border-[#3a3a5a] p-3 rounded-lg mb-2"
          >
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
              <span className="flex items-center gap-1"><User size={14} /> {g.gender}</span>
              <span className="flex items-center gap-1"><Phone size={14} /> {g.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Room Fields */}
      <div className="grid md:grid-cols-2 gap-4">
        <CustomInput
          label="No. of Single Rooms *"
          value={form.singleRooms}
          onChange={(e) => handleChange("singleRooms", e.target.value)}
          type="number"
          labelBg="#1f1f38"
        />
        <CustomInput
          label="No. of Double Rooms *"
          value={form.doubleRooms}
          onChange={(e) => handleChange("doubleRooms", e.target.value)}
          type="number"
          labelBg="#1f1f38"
        />

        <div className="col-span-2 md:col-span-1">
          <CustomSelect
            label="Type of Room Wanted *"
            value={form.roomType}
            onChange={(val) => handleChange("roomType", val)}
            options={["Suite Room", "D - Block", "Single", "Double"]}
            labelBg="#1f1f38"
          />
          {errors.roomType && <p className="text-red-400 text-xs mt-1">{errors.roomType}</p>}
        </div>

        <CustomInput
          label="No. of Suite Rooms"
          value={form.suiteRooms}
          onChange={(e) => handleChange("suiteRooms", e.target.value)}
          type="number"
          labelBg="#1f1f38"
        />
        <CustomInput
          label="No. of D-Block Rooms"
          value={form.dBlockRooms}
          onChange={(e) => handleChange("dBlockRooms", e.target.value)}
          type="number"
          labelBg="#1f1f38"
        />

        <div className="col-span-2 md:col-span-1">
          <CustomSelect
            label="Do You want Dine-in Request for this Guest?"
            value={form.dine}
            onChange={(val) => handleChange("dine", val)}
            options={["Yes", "No"]}
            labelBg="#1f1f38"
          />
        </div>

        {form.dine === "Yes" && (
          <>
            <div className="col-span-2">
              <CustomSelect
                label="Select the Dine-in Wanted *"
                value={form.dineType}
                onChange={(val) => handleChange("dineType", val)}
                options={["Amenity / Hostel", "Hostel", "Amenity"]}
                labelBg="#1f1f38"
              />
            </div>
            <CustomInput
              label="No. of Guests in Hostel Dine-in *"
              value={form.hostelGuests}
              onChange={(e) => handleChange("hostelGuests", e.target.value)}
              type="number"
              labelBg="#1f1f38"
            />
            <CustomInput
              label="No. of Guests in Amenity Dine-in *"
              value={form.amenityGuests}
              onChange={(e) => handleChange("amenityGuests", e.target.value)}
              type="number"
              labelBg="#1f1f38"
            />
            <div className="col-span-2 relative">
              <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1f1f38] z-10 pointer-events-none">
                Special Requirements, If any
              </span>
              <textarea
                value={form.special}
                onChange={(e) => handleChange("special", e.target.value)}
                rows={4}
                className="w-full bg-transparent border border-[#3a3a5a] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}