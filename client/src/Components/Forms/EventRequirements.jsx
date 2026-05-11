import React, { useState } from "react";
import CustomSelect from "../CustomSelect";

const defaultValues = {
  venue: "", icts: "", audio: "", transport: "",
  foodandrefreshments: "", accommodation: "", purchase: "", media: "",
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

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving...
            </>
          ) : (
            "Save & Next →"
          )}
        </button>
      </div>
    </div>
  );
}