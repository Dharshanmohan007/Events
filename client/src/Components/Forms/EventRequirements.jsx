import React, { useState } from "react";
import CustomSelect from "../CustomSelect";

const defaultValues = {
  venue: "", icts: "", purchase: "", media: "", audio: "", transport: "",
  foodandrefreshments: "", accommodation: "",
};

export default function EventRequirements({ nextStep, setSelectedRequirements, onRequirementsChange, isLoading = false, initialValues = {}, errors = {} }) {
  const [values, setValues] = useState(() => ({ ...defaultValues, ...initialValues }));
  const [localErrors, setLocalErrors] = useState({});

  const handleChange = (key, val) => {
    const nextValues = { ...values, [key]: val };
    setValues(nextValues);
    setLocalErrors((prev) => ({ ...prev, [key]: "" }));

    if (onRequirementsChange) {
      const selected = Object.keys(nextValues).filter((req) => nextValues[req] === "Yes");
      onRequirementsChange(selected);
    }
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(values).forEach((key) => {
      if (!values[key]) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });
    return newErrors;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setLocalErrors(errs);
      return;
    }
    const selected = Object.keys(values).filter((key) => values[key] === "Yes");
    setSelectedRequirements(selected);
    if (nextStep) nextStep(selected);
  };

  const LABEL_MAP = {
    venue: "Venue",
    icts: "ICTS",
    audio: "Audio",
    transport: "Transport",
    foodandrefreshments: "Food & Refreshments",
    accommodation: "Accommodation",
    purchase: "Purchase",
    media: "Media",
  };

  return (
    <div className='px-6 py-6 rounded-xl'>
      <h1 className="text-white text-lg font-bold mb-6 playfair">Event Requirements</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.keys(values).map((key) => (
          <div key={key}>
            <CustomSelect
              label={`${LABEL_MAP[key] || key} Required`}
              value={values[key]}
              onChange={(val) => handleChange(key, val)}
              options={["Yes", "No"]}
            />
            {(localErrors[key] || errors[key]) && <p className="text-red-400 text-xs mt-1">{localErrors[key] || errors[key]}</p>}
          </div>
        ))}
      </div>

      {errors.requirements && <p className="text-red-400 text-sm mb-4">{errors.requirements}</p>}
    </div>
  );
}