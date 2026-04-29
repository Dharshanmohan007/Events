import React, { useState } from "react";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";

export default function AudioForm({ onNextClick, handlePrevious }) {
  const [mainAudio, setMainAudio] = useState("");
  const [vistaAudio, setVistaAudio] = useState("");

  const [values, setValues] = useState({});
  const [selectedRequirements, setSelectedRequirements] = useState([]);

  // 👉 NEXT BUTTON
  const handleNextClick = () => {
    const selected = Object.keys(values).filter(
      (key) => values[key] === ""
    );

    setSelectedRequirements(selected);

    console.log("Next clicked"); // ✅ debug check

    if (onNextClick) {
      onNextClick(); // 🔥 THIS moves to ICTS
    }
  };

  // 👉 BACK BUTTON
  const handlePrevClick = () => {
    if (handlePrevious) {
      handlePrevious();
    }
  };

  return (
    <>
      {/* ===== Main Board Room ===== */}
      <div className="w-full p-4 sm:p-6 rounded-xl bg-[#1f1f38]">
        <h1 className="text-[#853ff9] font-bold mb-6">
          Main Board Room
        </h1>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <CustomSelect
            label="Audio Requirement"
            required
            value={mainAudio}
            onChange={setMainAudio}
            options={["Yes", "No"]}
          />
          <CustomInput label="Others (If applicable) *" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <CustomInput label="Hand Mic Quantity *" />
          <CustomInput label="Collar Quantity *" />
        </div>

        <div className="relative mb-6">
          <textarea
            className="w-full p-4 rounded-lg border border-gray-700 text-white bg-transparent focus:outline-none focus:border-blue-500"
            rows={2}
          />
          <label className="absolute -top-2 left-3 text-xs text-white bg-[#1f1f38] px-1">
            Special Requirements, If any *
          </label>
        </div>
      </div>

      {/* ===== Vista Hall ===== */}
      <div className="mt-8 w-full p-4 sm:p-6 rounded-xl bg-[#1f1f38]">
        <h1 className="text-[#853ff9] font-bold mb-6">
          Vista Hall
        </h1>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <CustomSelect
            label="Audio Requirement"
            required
            value={vistaAudio}
            onChange={setVistaAudio}
            options={["Yes", "No"]}
          />
          <CustomInput label="Others (If applicable) *" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <CustomInput label="Hand Mic Quantity *" />
          <CustomInput label="Collar Quantity *" />
        </div>

        <div className="relative mb-6">
          <textarea
            className="w-full p-4 rounded-lg border border-gray-700 text-white bg-transparent focus:outline-none focus:border-blue-500"
            rows={2}
          />
          <label className="absolute -top-2 left-3 text-xs text-white bg-[#1f1f38] px-1">
            Special Requirements, If any *
          </label>
        </div>
      </div>

      {/* ===== Buttons ===== */}
      <div className="flex justify-between mt-10">
        <button
          onClick={handlePrevClick}
          className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg"
        >
          Back
        </button>

        <button
          onClick={handleNextClick}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg"
        >
          Next
        </button>
      </div>
    </>
  );
}