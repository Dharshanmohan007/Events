import React, { useState } from "react";
import CustomSelect from "../CustomSelect";

export default function EventRequirements({ nextStep, setSelectedRequirements }) {
  const [values, setValues] = useState({
    venue: "",
    audio: "",
    icts: "",
    transport: "",
    foodandrefreshments: "",
    accommodation: "",
    purchase: "",
    media: "",

  });

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleNext = () => {
    const selected = Object.keys(values).filter(
      (key) => values[key] === "Yes"
    );

    setSelectedRequirements(selected);
    nextStep();
  };

  return (
    <div className='p-6 rounded-xl'>
      <h1 className="text-white text-lg font-bold mb-6">
        Event Requirements
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.keys(values).map((key) => (
          <CustomSelect
            key={key}
            label={`${key.charAt(0).toUpperCase() + key.slice(1)} Required`}
            value={values[key]}
            onChange={(val) => handleChange(key, val)}
            options={["Yes", "No"]}
          />
        ))}
      </div>

      <button
        onClick={handleNext}
        className="bg-purple-600 text-white px-6 py-2 rounded-lg"
      >
        Next
      </button>
    </div>
  );
}