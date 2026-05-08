import React, { useState } from "react";
import {CalendarDays,Clock,MapPin,Plus,Trash2,} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";
export default function TransportForm({nextStep,handlePrevious,}){
  const [values, setValues] = useState({});
  const [selectedRequirements, setSelectedRequirements] =
    useState([]);
  const [forms, setForms] = useState([
    {
      pickupDate: null,
      dropDate: null,
      vistaTransport: "",
      staffCount: "",
      checkpoints: [],
    },
  ]);
  const handleNextClick = () => {
    const selected = Object.keys(values).filter(
      (key) => values[key] === ""
    );
    setSelectedRequirements(selected);
    console.log("Next clicked");
    if (nextStep) {
      nextStep();
    }
  };
  const handlePrevClick = () => {
    console.log("Back clicked");
    if (handlePrevious) {
      handlePrevious();
    }
  };
  const handleAddForm = () => {
    setForms([
      ...forms,
      {
        pickupDate: null,
        dropDate: null,
        vistaTransport: "",
        staffCount: "",
        checkpoints: [],
      },
    ]);
  };
  const removeForm = (index) => {
    const updated = forms.filter((_, i) => i !== index);
    setForms(updated);
  };
  const handleChange = (index, field, value) => {
    const updated = [...forms];
    updated[index][field] = value;
    setForms(updated);
  };
  const addCheckpoint = (formIndex) => {
    const updated = [...forms];

    updated[formIndex].checkpoints.push({
      name: "",
    });
  setForms(updated);
  };
  const handleCheckpointChange = (
    formIndex,
    cpIndex,
    value
  ) => {
    const updated = [...forms];
    updated[formIndex].checkpoints[cpIndex].name =
      value;

    setForms(updated);
  };
  const removeCheckpoint = (
    formIndex,
    cpIndex
  ) => {
    const updated = [...forms];

    updated[formIndex].checkpoints.splice(
      cpIndex,
      1
    );
    setForms(updated);
  };
  return (
    <div className="w-full">

      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddForm}
          className="
            bg-purple-600
            hover:bg-purple-500
            text-white
            px-4 py-2
            rounded-lg
            text-sm
            font-medium
          "
        >
          + Add
        </button>
      </div>

      
      {forms.map((form, formIndex) => (
        <div key={formIndex}>
          {/* FORM CONTAINER */}
          <div
            className="relative bg-[#1f1f3a] p-6 rounded-xl w-full  text-red-600 mb-6" >
           
            {formIndex !== 0 && (
              <button
                onClick={() =>
                  removeForm(formIndex)
                }
                className=" absolute
                  top-3
                  right-3
                  bg-red-100
                  text-red-500
                  hover:bg-red-200
                  p-2
                  rounded-full
                "
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
         
              <div>
                <label className="text-sm text-gray-300">
                  Pickup date & Time *
                </label>

                <div
                  className="
                    flex items-center
                    bg-[#2a2a4a]
                    mt-1
                    px-4 py-2
                    rounded-lg
                    border border-gray-600
                  "
                >
                  <DatePicker
                    selected={form.pickupDate}
                    onChange={(date) =>
                      handleChange(
                        formIndex,
                        "pickupDate",
                        date
                      )
                    }
                    showTimeSelect
                    dateFormat="dd/MM/yyyy h:mm aa"
                    placeholderText="__/__/____"
                    className="
                      bg-transparent
                      outline-none
                      text-gray-300
                      w-full
                    "
                    withPortal
                  />

                  <div className="flex gap-2 text-gray-400">
                    <CalendarDays size={18} />
                    <Clock size={18} />
                  </div>
                </div>
              </div>

              {/* DROP */}
              <div>
                <label className="text-sm text-gray-300">
                  Drop date & Time *
                </label>

                <div
                  className="
                    flex items-center
                    bg-[#2a2a4a]
                    mt-1
                    px-4 py-2
                    rounded-lg
                    border border-gray-600
                  "
                >
                  <DatePicker
                    selected={form.dropDate}
                    onChange={(date) =>
                      handleChange(
                        formIndex,
                        "dropDate",
                        date
                      )
                    }
                    showTimeSelect
                    dateFormat="dd/MM/yyyy h:mm aa"
                    placeholderText="__/__/____"
                    className="
                      bg-transparent
                      outline-none
                      text-gray-300
                      w-full
                    "
                    withPortal
                  />

                  <div className="flex gap-2 text-gray-400">
                    <CalendarDays size={18} />
                    <Clock size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-300">
                Pickup Location *
              </label>

              <div
                className="
                  flex items-center
                  bg-[#2a2a4a]
                  mt-1
                  px-4 py-2
                  rounded-lg
                  border border-gray-600
                "
              >
                <MapPin
                  size={18}
                  className="text-gray-400 mr-2"
                />

                <input
                  type="text"
                  placeholder="Pickup location"
                  className="
                    bg-transparent
                    outline-none
                    text-gray-300
                    w-full
                  "
                />
              </div>
            </div>

         
            {form.checkpoints.map(
              (cp, cpIndex) => (
                <div
                  key={cpIndex}
                  className="
                    flex items-center
                    justify-between
                    bg-[#2a2a4a]
                    px-4 py-2
                    rounded-lg
                    border border-gray-600
                    mb-2
                  "
                >
                  <div className="flex items-center w-full">
                    <MapPin
                      size={16}
                      className="text-gray-400 mr-2"
                    />

                    <input
                      type="text"
                      placeholder={`${cpIndex + 1}. Checkpoint`}
                      value={cp.name}
                      onChange={(e) =>
                        handleCheckpointChange(
                          formIndex,
                          cpIndex,
                          e.target.value
                        )
                      }
                      className="
                        bg-transparent
                        outline-none
                        text-gray-300
                        w-full
                      "
                    />
                  </div>

                 {/* REMOVE CHECKPOINT BUTTON */}
    <button
      onClick={() =>
        removeCheckpoint(
          formIndex,
          cpIndex
        )
      }
      className=" ml-2 w-6 h-8 flex items-center justify-center text-red-400transition-all duration-200"
    >
      ✕
    </button>
                </div>
              )
            )}

            <div className="flex justify-center mt-4 mb-6">
              <button
                onClick={() =>
                  addCheckpoint(formIndex)
                }
                className="
                  flex items-center
                  gap-2
                  text-purple-400
                "
              >
                <span
                  className="
                    bg-purple-600
                    text-white
                    rounded-full
                    p-1
                  "
                >
                  <Plus size={14} />
                </span>

                Add Checkpoint
              </button>
            </div>

         
            <div className="mb-6">
              <label className="text-sm text-gray-300">
                Drop Location *
              </label>

              <div
                className="
                  flex items-center
                  bg-[#1f1f38]
                  mt-1
                  px-4 py-2
                  rounded-lg
                  border border-gray-600
                "
              >
                <MapPin
                  size={18}
                  className="text-gray-400 mr-2"
                />

                <input
                  type="text"
                  placeholder="Drop location"
                  className="
                    bg-transparent
                    outline-none
                    text-gray-300
                    w-full
                  "
                />
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInput label="Total Number of passengers *" />

              <CustomSelect
                label="Types of vehicles needed *"
                value={form.vistaTransport}
                onChange={(val) =>
                  handleChange(
                    formIndex,
                    "vistaTransport",
                    val
                  )
                }
                options={[
                  "Bus",
                  "Van",
                  "Car",
                  "Outsource car",
                ]}
              />

              <CustomInput label="Number of bus needed *" />

              <CustomSelect
                label="Number of Accompanying Staff *"
                value={form.staffCount}
                onChange={(val) =>
                  handleChange(
                    formIndex,
                    "staffCount",
                    val
                  )
                }
                options={[
                  "1",
                  "2",
                  "3",
                  "4",
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <CustomInput label="Accompanying Staff name *" />

              <CustomInput label="Accompanying Staff Mobile Number *" />
            </div>

        
            <div className="relative mb-6 mt-4">
             <textarea
  className="
    w-full
    p-4
    rounded-lg
    border border-gray-700
    text-gray-300
   
    focus:outline-none
    focus:border-purple-500
    transition-all duration-200
  "
  rows={4}
/>

              <label
                className="
                  absolute
                  -top-2
                  left-3
                  text-xs
                  text-white
                  bg-[#1f1f38]
                  px-1
                "
              >
                Special Requirements *
              </label>
            </div>  
          </div>

  
<div className="w-full mt-8">
  <div className="flex justify-between items-center">
    
   
    <button
      onClick={handlePrevClick}
      className="
        border border-purple-600
        text-purple-500
        px-8 py-2
        rounded-md
        text-sm font-medium
        transition-all duration-200
      "
    >
      ← Back
    </button>

   
    <button
      onClick={handleNextClick}
      className="
        bg-gradient-to-r
        from-purple-600
        to-purple-500
        text-white
        px-8 py-2
        rounded-md
        text-sm font-medium
        hover:opacity-90
        transition-all duration-200
      "
    >
      Next →
    </button>
  </div>
</div>
        </div>
      ))}
    </div>
  );
}