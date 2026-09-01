import React, { useState } from "react";
import CustomSelect from "../CustomSelect";

const LABEL_MAP = {
  venue: "Venue",
  icts: "ICTS",
  audio: "Audio",
  transport: "Transport",
  externalTransport: "External Transport",
  foodandrefreshments: "Food & Refreshments",
  accommodation: "Accommodation",
  purchase: "Purchase",
  media: "Media",
};

const defaultValues = {
  venue: "No",
  icts: "No",
  audio: "No",
  transport: "No",
  externalTransport: "No",
  foodandrefreshments: "No",
  accommodation: "No",
  purchase: "No",
  media: "No",
};

export default function EventRequirements({
  disabled = false,
  nextStep,
  setSelectedRequirements,
  onRequirementsChange,
  isLoading = false,
  initialValues = {},
  errors = {},
}) {
  const [values, setValues] = useState(() => ({ ...defaultValues, ...initialValues }));
  const [localErrors, setLocalErrors] = useState({});

  const handleChange = (key, val) => {
    const nextValues = {
      ...values,
      [key]: val,
    };

    setValues(nextValues);

    // Clear validation error for this field as soon as the user picks a value
    setLocalErrors((prev) => ({
      ...prev,
      [key]: "",
    }));

    if (onRequirementsChange) {
      onRequirementsChange(nextValues);
    }
  };

  const validate = () => {
    const newErrors = {};

    Object.keys(values).forEach((key) => {
      const val = values[key];
      if (!val || (typeof val === "string" && val.trim() === "")) {
        newErrors[key] = `${LABEL_MAP[key] || key} is required`;
      }
    });

    setLocalErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const isValid = validate();

    if (!isValid) return;

    if (setSelectedRequirements) {
      setSelectedRequirements(values);
    }

    if (nextStep) {
      nextStep(values);
    }
  };

  return (
    <div
      className={`${
        disabled ? "opacity-50 pointer-events-none select-none" : ""
      }`}
    >
      <div className="px-1 py-6 rounded-xl">
        <h1 className="text-white text-lg font-bold mb-6 playfair">Event Requirements</h1>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {Object.keys(values)
            .filter((key) => key !== "media")
            .map((key) => (
              <div key={key}>
                <CustomSelect
                  label={`${LABEL_MAP[key] || key} Required *`}
                  value={values[key]}
                  onChange={(val) => handleChange(key, val)}
                  options={["Yes", "No"]}
                />

                {(localErrors[key] || errors[key]) && (
                  <p className="text-red-400 text-xs mt-1">
                    {localErrors[key] || errors[key]}
                  </p>
                )}
              </div>
            ))}
        </div>

        {/* Media - Full Width */}
        <div className="w-full mb-6">
          <CustomSelect
            label={`${LABEL_MAP.media} Required *`}
            value={values.media}
            onChange={(val) => handleChange("media", val)}
            options={["Yes", "No"]}
          />

          {(localErrors.media || errors.media) && (
            <p className="text-red-400 text-xs mt-1">
              {localErrors.media || errors.media}
            </p>
          )}
        </div>

        {errors.requirements && (
          <p className="text-red-400 text-sm mb-4">{errors.requirements}</p>
        )}
      </div>
    </div>
  );
}