import React, {
  useState,
  forwardRef,
  memo,
} from "react";

import DatePicker from "react-datepicker";

import {
  CalendarDays,
  Trash2,
} from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";

import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";



const DateInput = forwardRef(
  (
    {
      value,
      onClick,
      label,
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        {/* LABEL */}

        <label
          className="
            absolute
            -top-2
            left-3
            z-10
            bg-[#1f1f38]
            px-2
            text-xs
            text-white
          "
        >
          {label}
        </label>

        {/* INPUT */}

        <input
          ref={ref}
          value={value || ""}
          readOnly
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (onClick) {
              onClick(e);
            }
          }}
          className="
            w-full
            h-[52px]
            px-4
            pr-12
            rounded-xl
            border
            border-[#3d3d68]
            text-white
            outline-none
            cursor-pointer
            focus:border-purple-500
          "
        />



        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (onClick) {
              onClick(e);
            }
          }}
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-gray-400
            cursor-pointer
          "
        >
          <CalendarDays size={18} />
        </div>
      </div>
    );
  }
);

DateInput.displayName = "DateInput";



const Meal = memo(function Meal({
  title,
  data,
  onChange,
}) {
  return (
    <div
      className="
        col-span-1
        md:col-span-2
        bg-[#2a2a4a]
        border
        border-[#3b3b66]
        rounded-2xl
        p-5
      "
    >
      <h2 className="text-purple-400 font-semibold text-lg mb-5">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput
          label="Veg Participants"
          value={data.vegParticipants}
          onChange={(e) =>
            onChange(
              "vegParticipants",
              e.target.value
            )
          }
        />

        <CustomInput
          label="Veg Guest"
          value={data.vegGuest}
          onChange={(e) =>
            onChange(
              "vegGuest",
              e.target.value
            )
          }
        />

        <CustomInput
          label="Non-Veg Participants"
          value={data.nonVegParticipants}
          onChange={(e) =>
            onChange(
              "nonVegParticipants",
              e.target.value
            )
          }
        />

        <CustomInput
          label="Non-Veg Guest"
          value={data.nonVegGuest}
          onChange={(e) =>
            onChange(
              "nonVegGuest",
              e.target.value
            )
          }
        />
      </div>
    </div>
  );
});



export default function FoodAndRefreshments({
  nextStep,
  handlePrevious,
}) {


  const createForm = () => ({
    id: crypto.randomUUID(),

    date: null,

    resourceType: "",
    resourcePersons: "",
    internalCount: "",

    staffName: "",
    mobileNumber: "",

    foodType: "",

    specialRequirements: "",

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

  const [forms, setForms] = useState([
    createForm(),
  ]);


  const handleChange = (
    id,
    field,
    value,
    section = null
  ) => {
    setForms((prevForms) =>
      prevForms.map((form) => {
        if (form.id !== id) {
          return form;
        }

        if (section) {
          return {
            ...form,

            [section]: {
              ...form[section],

              [field]: value,
            },
          };
        }

        return {
          ...form,

          [field]: value,
        };
      })
    );
  };


  const handleAdd = () => {
    setForms((prev) => [
      ...prev,
      createForm(),
    ]);
  };

  const handleDelete = (id) => {
    setForms((prev) =>
      prev.filter(
        (form) => form.id !== id
      )
    );
  };

  return (
    <div className="w-full">
   

      {forms.map((form, index) => (
        <div
          key={form.id}
          className="
            bg-[#1f1f38]
            border
            border-[#32325a]
            rounded-2xl
            mb-6
            overflow-visible
          "
        >
   

          <div className="flex justify-end p-5 pb-0">
            {index === 0 ? (
              <button
                type="button"
                onClick={handleAdd}
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  bg-purple-600
                  hover:bg-purple-500
                  text-white
                  font-medium
                  transition-all
                "
              >
                + Add
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleDelete(form.id)
                }
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-[#ffd9d9]
                  text-red-500
                  flex
                  items-center
                  justify-center
                "
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

      

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* DATE */}

            <div className="w-full">
              <DatePicker
                selected={form.date}
                onChange={(date) =>
                  handleChange(
                    form.id,
                    "date",
                    date
                  )
                }
                dateFormat="dd/MM/yyyy"
                shouldCloseOnSelect={true}
                popperPlacement="bottom-start"
                withPortal={false}
                customInput={
                  <DateInput label="Select Date *" />
                }
              />
            </div>


            <CustomSelect
              label="Type of resource Person *"
              value={form.resourceType}
              onChange={(val) =>
                handleChange(
                  form.id,
                  "resourceType",
                  val
                )
              }
              options={[
                "VIP",
                "Trainer",
                "Placement",
              ]}
            />


            <CustomInput
              label="Total number of resource Person *"
              value={form.resourcePersons}
              onChange={(e) =>
                handleChange(
                  form.id,
                  "resourcePersons",
                  e.target.value
                )
              }
              type="number"
            />

            <CustomInput
              label="Total number of Internal Accompanying Person *"
              value={form.internalCount}
              onChange={(e) =>
                handleChange(
                  form.id,
                  "internalCount",
                  e.target.value
                )
              }
              type="number"
            />


            <CustomInput
              label="Internal Accompanying staff name *"
              value={form.staffName}
              onChange={(e) =>
                handleChange(
                  form.id,
                  "staffName",
                  e.target.value
                )
              }
            />

            <CustomInput
              label="Internal Accompanying staff Mobile number *"
              value={form.mobileNumber}
              onChange={(e) =>
                handleChange(
                  form.id,
                  "mobileNumber",
                  e.target.value
                )
              }
              type="number"
            />



            <div className="col-span-1 md:col-span-2">
              <CustomSelect
                label="Food Type *"
                value={form.foodType}
                onChange={(val) =>
                  handleChange(
                    form.id,
                    "foodType",
                    val
                  )
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
              onChange={(field, value) =>
                handleChange(
                  form.id,
                  field,
                  value,
                  "breakfast"
                )
              }
            />



            <Meal
              title="Lunch"
              data={form.lunch}
              onChange={(field, value) =>
                handleChange(
                  form.id,
                  field,
                  value,
                  "lunch"
                )
              }
            />



            <Meal
              title="Dinner"
              data={form.dinner}
              onChange={(field, value) =>
                handleChange(
                  form.id,
                  field,
                  value,
                  "dinner"
                )
              }
            />


            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <label
                  className="
                    absolute
                    -top-2
                    left-3
                    z-10
                    bg-[#1f1f38]
                    px-2
                    text-xs
                    text-white
                  "
                >
                  Special Requirements, If any *
                </label>

                <textarea
                  rows={4}
                  placeholder="reason"
                  value={form.specialRequirements}
                  onChange={(e) =>
                    handleChange(
                      form.id,
                      "specialRequirements",
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    bg-[#232347]
                    border
                    border-[#3d3d68]
                    px-4
                    py-4
                    text-white
                    placeholder:text-gray-400
                    outline-none
                    resize-none
                    focus:border-purple-500
                  "
                />
              </div>
            </div>
          </div>
        </div>
      ))}


      <div className="w-full mt-10 flex items-center justify-between">
      

        <button
          type="button"
          onClick={handlePrevious}
          className="
            min-w-[120px]
            h-[46px]
            rounded-xl
            border
            border-purple-600
            text-purple-500
            font-medium
            bg-transparent
          
            transition-all
            duration-300
          "
        >
          ← Back
        </button>



        <button
          type="button"
          onClick={nextStep}
          className="
            min-w-[120px]
            h-[46px]
            rounded-xl
            bg-gradient-to-r
            from-purple-500
            to-purple-600
            text-white
            font-medium
            hover:opacity-90
            transition-all
            duration-300
            shadow-lg
            shadow-purple-900/30
          "
        >
          Next →
        </button>
      </div>
    </div>
  );
}