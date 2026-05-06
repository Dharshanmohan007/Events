import React, { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays, Trash2 } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";

// ✅ DATE INPUT (FIXED)
const DateInput = forwardRef(({ value, onClick, label }, ref) => (
  <div className="relative w-full">
    <input
      ref={ref}
      value={value || ""}
      readOnly
      placeholder={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="w-full p-3 rounded-lg bg-[#2a2a4a] text-white pr-10 cursor-pointer"
    />

    <CalendarDays
      size={18}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute right-3 top-3 text-gray-400 cursor-pointer"
    />
  </div>
));

export default function FoodAndRefreshments({ nextStep, handlePrevious }) {

  const createForm = () => ({
    id: Date.now() + Math.random(), // ✅ UNIQUE KEY
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

  // ✅ SAFE STATE UPDATE
  const handleChange = (id, field, value, section) => {
    setForms((prev) =>
      prev.map((form) => {
        if (form.id !== id) return form;

        if (section) {
          return {
            ...form,
            [section]: {
              ...form[section],
              [field]: value,
            },
          };
        }

        return { ...form, [field]: value };
      })
    );
  };

  // ✅ ADD
  const handleAdd = () => {
    setForms((prev) => [...prev, createForm()]);
  };

  // ✅ DELETE
  const handleDelete = (id) => {
    setForms((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="w-full">

      {forms.map((form, index) => (
        <div key={form.id} className="bg-[#1f1f38] rounded-lg mb-5">

          {/* BUTTON */}
          <div className="flex justify-end p-4 pb-0">
            {index === 0 ? (
              <button
                onClick={handleAdd}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white"
              >
                + Add
              </button>
            ) : (
              <button
                onClick={() => handleDelete(form.id)}
                className="p-2 rounded-full bg-[#ffd6d6] text-red-500"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* DATE PICKER */}
            <DatePicker
              selected={form.date}
              onChange={(date) =>
                handleChange(form.id, "date", date)
              }
              customInput={<DateInput label="Select Date *" />}
            />

            <CustomSelect
              label="Type of resource Person *"
              value={form.resourceType}
              onChange={(val) =>
                handleChange(form.id, "resourceType", val)
              }
              options={["VIP", "Trainer", "Placement"]}
            />

            <CustomInput
              label="Total number of resource Person *"
              value={form.resourcePersons}
              onChange={(e) =>
                handleChange(form.id, "resourcePersons", e.target.value)
              }
              type="number"
            />

            <CustomInput
              label="Total number of Internal Accompanying Person *"
              value={form.internalCount}
              onChange={(e) =>
                handleChange(form.id, "internalCount", e.target.value)
              }
              type="number"
            />

            <CustomInput
              label="Internal Accompanying staff name *"
              value={form.staffName}
              onChange={(e) =>
                handleChange(form.id, "staffName", e.target.value)
              }
            />

            <CustomInput
              label="Internal Accompanying staff Mobile number *"
              value={form.mobileNumber}
              onChange={(e) =>
                handleChange(form.id, "mobileNumber", e.target.value)
              }
              type="number"
            />

            <div className="col-span-2">
              <CustomSelect
                label="Food Type *"
                value={form.foodType}
                onChange={(val) =>
                  handleChange(form.id, "foodType", val)
                }
                options={[
                  "Breakfast",
                  "Lunch",
                  "Dinner",
                  "Morning Refreshment",
                  "Evening Refreshment",
                ]}
              />
            </div>

            <Meal
              title="Breakfast"
              data={form.breakfast}
              onChange={(f, v) =>
                handleChange(form.id, f, v, "breakfast")
              }
            />

            <Meal
              title="Lunch"
              data={form.lunch}
              onChange={(f, v) =>
                handleChange(form.id, f, v, "lunch")
              }
            />

            <Meal
              title="Dinner"
              data={form.dinner}
              onChange={(f, v) =>
                handleChange(form.id, f, v, "dinner")
              }
            />

          </div>
        </div>
      ))}

      {/* FOOTER */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={handlePrevious}
          className="px-4 py-2 border rounded-lg"
        >
          Previous
        </button>

        <button
          onClick={nextStep}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ✅ MEAL COMPONENT
function Meal({ title, data, onChange }) {
  return (
    <div className="col-span-2 bg-[#2a2a4a] rounded-lg p-4 mt-2">
      <h1 className="text-purple-400 font-semibold mb-3">
        {title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <CustomInput
          label="Veg Participants"
          value={data.vegParticipants}
          onChange={(e) => onChange("vegParticipants", e.target.value)}
        />

        <CustomInput
          label="Veg Guest"
          value={data.vegGuest}
          onChange={(e) => onChange("vegGuest", e.target.value)}
        />

        <CustomInput
          label="Non-Veg Participants"
          value={data.nonVegParticipants}
          onChange={(e) => onChange("nonVegParticipants", e.target.value)}
        />

        <CustomInput
          label="Non-Veg Guest"
          value={data.nonVegGuest}
          onChange={(e) => onChange("nonVegGuest", e.target.value)}
        />

      </div>
    </div>
  );
}