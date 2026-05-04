import React, { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";

// Date Input
const DateInput = forwardRef(({ value, label }, ref) => (
  <div className="relative w-full">
    <CustomInput
      ref={ref}
      label={label}
      value={value || ""}
      onChange={() => {}}
      type="text"
      className="pr-10"
      readOnly
    />
    <CalendarDays
      size={18}
      className="absolute right-3 bottom-3 text-gray-400 pointer-events-none"
    />
  </div>
));

export default function FoodAndRefreshments({ nextStep, handlePrevious }) {

  // ✅ create fresh form
  const createForm = () => ({
    date: null,
    resourceType: "",
    resourcePersons: "",
    internalCount: "",
    staffName: "",
    mobileNumber: "",
    foodType: "",

    breakfast: {
      vegParticipants: "",
      vegGuest: "",
      nonVegParticipants: "",
      nonVegGuest: "",
    },
    lunch: {
      vegParticipants: "",
      vegGuest: "",
      nonVegParticipants: "",
      nonVegGuest: "",
    },
    dinner: {
      vegParticipants: "",
      vegGuest: "",
      nonVegParticipants: "",
      nonVegGuest: "",
    },
  });

  const [forms, setForms] = useState([createForm()]);

  // ✅ handle change
  const handleChange = (index, field, value, section) => {
    const updated = [...forms];

    if (section) {
      updated[index][section][field] = value;
    } else {
      updated[index][field] = value;
    }

    setForms(updated);
  };

  // ✅ ADD BELOW CURRENT CONTAINER
  const handleAdd = (index) => {
    const updated = [...forms];
    updated.splice(index + 1, 0, createForm());
    setForms(updated);
  };

  return (
    <div className="w-full">

      {forms.map((form, index) => (
        <div key={index} className="bg-[#1f1f38] rounded-lg mb-5">

          {/* ✅ ADD BUTTON PER CONTAINER */}
          <div className="flex justify-end p-4 pb-0">
            <button
              onClick={() => handleAdd(index)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl
                         bg-gradient-to-r from-purple-500 to-purple-600
                         text-white text-sm font-semibold
                         shadow-[0_6px_20px_rgba(168,85,247,0.4)]"
            >
              <span className="text-lg">+</span>
              Add
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">

            <DatePicker
              selected={form.date}
              onChange={(date) => handleChange(index, "date", date)}
              customInput={<DateInput label="Select Date *" />}
            />

            <CustomSelect
              label="Type of resource Person *"
              value={form.resourceType}
              onChange={(val) => handleChange(index, "resourceType", val)}
              options={["VIP", "Trainer", "Placement"]}
            />

            <CustomInput
              label="Total number of resource Person *"
              value={form.resourcePersons}
              onChange={(val) => handleChange(index, "resourcePersons", val)}
              type="number"
            />

            <CustomInput
              label="Total number of Internal Accompanying Person *"
              value={form.internalCount}
              onChange={(val) => handleChange(index, "internalCount", val)}
              type="number"
            />

            <CustomInput
              label="Internal Accompanying staff name *"
              value={form.staffName}
              onChange={(val) => handleChange(index, "staffName", val)}
              type="text"
            />

            <CustomInput
              label="Internal Accompanying staff Mobile number *"
              value={form.mobileNumber}
              onChange={(val) => handleChange(index, "mobileNumber", val)}
              type="number"
            />

            <div className="col-span-1 md:col-span-2">
              <CustomSelect
                label="Food Type *"
                value={form.foodType}
                onChange={(val) => handleChange(index, "foodType", val)}
                options={[
                  "Breakfast",
                  "Lunch",
                  "Dinner",
                  "Morning Refreshment",
                  "Evening Refreshment",
                ]}
              />
            </div>

            {/* BREAKFAST */}
            <Meal
              title="Breakfast"
              data={form.breakfast}
              onChange={(f, v) => handleChange(index, f, v, "breakfast")}
            />

            {/* LUNCH */}
            <Meal
              title="Lunch"
              data={form.lunch}
              onChange={(f, v) => handleChange(index, f, v, "lunch")}
            />

            {/* DINNER */}
            <Meal
              title="Dinner"
              data={form.dinner}
              onChange={(f, v) => handleChange(index, f, v, "dinner")}
            />

            {/* TEXTAREA */}
            <div className="col-span-1 md:col-span-2">
              <div className="relative mb-6 w-full">
                <textarea
                  className="w-full p-4 rounded-lg border border-gray-700 text-white bg-transparent outline-none focus:border-blue-200 focus:ring-1 focus:ring-blue-100 resize-none"
                  rows={3}
                />
                <label className="absolute -top-2 left-3 text-xs text-white bg-[#1f1f38] px-1">
                  Special Requirements, If any *
                </label>
              </div>
            </div>

          </div>
        </div>
      ))}

      {/* FOOTER */}
      <div className="flex justify-end gap-3 mt-4">
        <button onClick={handlePrevious} className="px-4 py-2 border rounded-lg">
          Previous
        </button>

        <button onClick={nextStep} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
          Next
        </button>
      </div>

    </div>
  );
}

// Meal Section
function Meal({ title, data, onChange }) {
  return (
    <div className="col-span-1 md:col-span-2 bg-[#2a2a4a] rounded-lg p-4 mt-2
                    [&_label]:bg-[#2a2a4a] [&_label]:px-1">

      <h3 className="text-purple-400 font-semibold mb-2">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <CustomInput
          label="No. of veg in Participants Menu *"
          value={data.vegParticipants}
          onChange={(v) => onChange("vegParticipants", v)}
          type="number"
        />

        <CustomInput
          label="No. of veg in Guest/VIP Menu *"
          value={data.vegGuest}
          onChange={(v) => onChange("vegGuest", v)}
          type="number"
        />

        <CustomInput
          label="No. of Non-veg in Participants Menu *"
          value={data.nonVegParticipants}
          onChange={(v) => onChange("nonVegParticipants", v)}
          type="number"
        />

        <CustomInput
          label="No. of Non-veg in Guest/VIP Menu *"
          value={data.nonVegGuest}
          onChange={(v) => onChange("nonVegGuest", v)}
          type="number"
        />

      </div>
    </div>
  );
}