import React, { useState } from "react";
import {
  ChevronDown,
  ArrowRight,
} from "lucide-react";

export default function CertificateForm() {
  const [requirement, setRequirement] =
    useState("Certificate / ID card");

  const [persons, setPersons] =
    useState("Students");

  return (
    <div className="w-full min-h-screen bg-[#141428] p-6 text-white">
      <h1 className="text-xl">
        Purchase Details
      </h1>

      <div className="w-full space-y-5 mt-4">

        {/* Requirement Needed */}
        <CustomDropdown
          label="Requirement Needed"
          value={requirement}
          setValue={setRequirement}
          options={[
            "Certificate / ID card",
            "Certificate",
            "ID card",
          ]}
        />

        {/* Quantity Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* BOTH */}
          {requirement ===
            "Certificate / ID card" && (
            <>
              <InputField
                label="Id Card Hard copy Quantity"
                placeholder="52"
              />

              <InputField
                label="Certificate Hard Copy Quantity"
                placeholder="52"
              />
            </>
          )}

          {/* CERTIFICATE ONLY */}
          {requirement ===
            "Certificate" && (
            <InputField
              label="Certificate Hard Copy Quantity"
              placeholder="52"
            />
          )}

          {/* ID CARD ONLY */}
          {requirement ===
            "ID card" && (
            <InputField
              label="Id Card Hard copy Quantity"
              placeholder="52"
            />
          )}
        </div>

        {/* Select Required Persons */}
        <CustomDropdown
          label="Select Required Persons*"
          value={persons}
          setValue={setPersons}
          options={[
            "Students",
            "Guest",
            "Both",
          ]}
        />

        {/* STUDENTS */}
        {(persons === "Students" ||
          persons === "Both") && (
          <PersonSection title="Students" />
        )}

        {/* GUEST */}
        {(persons === "Guest" ||
          persons === "Both") && (
          <PersonSection title="Guest" />
        )}

        {/* NEXT BUTTON */}
        <div className="flex justify-end">
          <button
            className="bg-[#8b3dff]
            hover:bg-[#9a52ff]
            transition-all duration-300
            text-white font-semibold
            px-10 py-3 rounded-lg
            flex items-center gap-2"
          >
            Next

            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= PERSON SECTION ================= */

function PersonSection({
  title,
}) {
  const [giftType, setGiftType] =
    useState(
      "Trophy / cash prize / Voucher"
    );

  const [kitNeeded, setKitNeeded] =
    useState("Yes");

  const [trophyType, setTrophyType] =
    useState("Basic");

  const [voucherWorth, setVoucherWorth] =
    useState("₹ 5000");

  return (
    <div
      className="w-full bg-[#1b1b35]
      rounded-xl p-5
      border border-[#2f2f5c]"
    >
      <h2
        className="text-[#8b3dff]
        text-2xl font-semibold mb-5"
      >
        {title}
      </h2>

      {/* First Row */}
      <div
        className="grid grid-cols-1
        md:grid-cols-2 gap-4 mb-4"
      >
        <CustomDropdown
          label="Gift Type *"
          value={giftType}
          setValue={setGiftType}
          options={[
            "Trophy / cash prize / Voucher",
            "Cash Prize",
            "Voucher",
          ]}
        />

        <CustomDropdown
          label="Registration Kit Needed *"
          value={kitNeeded}
          setValue={setKitNeeded}
          options={[
            "Yes",
            "No",
          ]}
        />
      </div>

      {/* Trophy Type */}
      <div className="mb-4">
        <CustomDropdown
          label="Type of Trophy Wanted *"
          value={trophyType}
          setValue={setTrophyType}
          options={[
            "Basic",
            "Elite",
          ]}
        />
      </div>

      {/* Trophy Quantity */}
      <div
        className="grid grid-cols-1
        md:grid-cols-2 gap-4 mb-4"
      >
        <InputField
          label="Basic Trophy Quantity *"
          placeholder="2"
        />

        <InputField
          label="Elite Trophy Quantity *"
          placeholder="2"
        />
      </div>

      {/* Voucher Section */}
      <div
        className="grid grid-cols-1
        md:grid-cols-2 gap-4 mb-4"
      >
        <InputField
          label="Voucher Worth Quantity *"
          placeholder="2"
        />

        <CustomDropdown
          label="Voucher worth *"
          value={voucherWorth}
          setValue={setVoucherWorth}
          options={[
            "₹ 1000",
            "₹ 2000",
            "₹ 5000",
            "₹ 10000",
          ]}
        />
      </div>

      {/* Registration Kit */}
      <div className="mb-4">
        <InputField
          label="Registration Kit Quantity *"
          placeholder="2"
        />
      </div>

      {/* Special Requirement */}
      <div className="w-full">
        <label className="text-sm text-white mb-2 block">
          Special Requirement
        </label>

        <textarea
          rows={5}
          placeholder="Enter special requirements..."
          className="w-full bg-[#1d1d39]
          border border-[#3b1f72]
          rounded-md px-4 py-3
          text-sm text-gray-300
          placeholder:text-gray-500
          outline-none resize-none
          focus:border-[#8b3dff]"
        />
      </div>
    </div>
  );
}

/* ================= INPUT FIELD ================= */

function InputField({
  label,
  placeholder,
}) {
  return (
    <div className="w-full">
      <label className="text-sm text-white mb-2 block">
        {label}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-[#1d1d39]
        border border-[#3b1f72]
        rounded-md px-4 py-3
        text-sm text-gray-300
        placeholder:text-gray-500
        outline-none
        focus:border-[#8b3dff]"
      />
    </div>
  );
}

/* ================= CUSTOM DROPDOWN ================= */

function CustomDropdown({
  label,
  value,
  setValue,
  options,
}) {
  const [isOpen, setIsOpen] =
    useState(false);

  return (
    <div className="relative w-full">
      {/* LABEL */}
      <label className="text-sm text-white mb-2 block">
        {label}
      </label>

      {/* SELECT BOX */}
      <div
        onClick={() =>
          setIsOpen(!isOpen)
        }
        className={`w-full bg-[#1d1d39]
        border rounded-md px-4 py-3
        flex items-center justify-between
        cursor-pointer transition-all duration-200
        ${
          isOpen
            ? "border-[#8b3dff]"
            : "border-[#3b1f72]"
        }`}
      >
        <span className="text-sm text-gray-300">
          {value}
        </span>

        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-300 ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
        />
      </div>

      {/* OPTIONS */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-full
          bg-[#141428]
          border border-[#5b21b6]
          rounded-xl overflow-hidden"
        >
          {options.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                setValue(item);
                setIsOpen(false);
              }}
              className={`px-4 py-3
              cursor-pointer
              text-sm
              border-b border-[#2d2d52]
              last:border-b-0
              transition-all duration-200
              ${
                value === item
                  ? "bg-[#2a174a] text-white"
                  : "bg-[#141428] text-gray-300 hover:bg-[#22163d]"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}