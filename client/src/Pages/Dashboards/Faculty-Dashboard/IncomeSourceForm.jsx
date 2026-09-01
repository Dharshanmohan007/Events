import React from "react";

const FloatingInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
}) => (
  <div className="relative">
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="peer w-full bg-transparent border border-gray-700 rounded-md px-3 pt-5 pb-2 text-sm text-white placeholder-transparent focus:border-[#8B5CF6]"
    />
    <label className="absolute top-[-8px] left-3 bg-[#151d31] px-1 text-[11px] text-white peer-focus:text-[#8B5CF6] transition-colors pointer-events-none">
      {label}
    </label>
  </div>
);

const FloatingSelect = ({ label, value, onChange, children }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="peer w-full bg-transparent border border-gray-700 rounded-md px-3 pt-5 pb-2 text-sm text-white appearance-none cursor-pointer focus:border-[#8B5CF6]"
    >
      {children}
    </select>
    <label className="absolute top-[-8px] left-3 bg-[#151d31] px-1 text-[11px] text-[#CBC3D7]/60 peer-focus:text-[#8B5CF6] transition-colors pointer-events-none">
      {label}
    </label>
    {/* Dropdown arrow */}
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[#CBC3D7]/40"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  </div>
);

const FloatingTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}) => (
  <div className="relative">
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="peer w-full bg-transparent border border-gray-700 rounded-md px-3 pt-5 pb-2 text-sm text-white  resize-none focus:border-[#8B5CF6]"
    />
    <label className="absolute top-[-8px] left-3 bg-[#151d31] px-1 text-[11px] text-white peer-focus:text-[#8B5CF6] transition-colors pointer-events-none">
      {label}
    </label>
  </div>
);

const IncomeSourceForm = ({ incomeData, setIncomeData }) => {
  const handleChange = (section, field, value) => {
    setIncomeData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const sections = [
    {
      key: "registrationFees",
      title: "Registration Fees",
      fields: ["amount"],
      showDetails: true,
    },
    {
      key: "scholarship",
      title: "Scholarship",
      fields: ["amount"],
      showDetails: true,
    },
    {
      key: "institutionalAmount",
      title: "Institutional Amount",
      fields: ["selectRequired", "amount"],
      showDetails: true,
    },
    {
      key: "departmentFund",
      title: "Department Fund",
      fields: ["amount"],
      showDetails: true,
      detailsFirst: true,
    },
    {
      key: "others",
      title: "Others",
      fields: ["amount"],
      showDetails: true,
    },
  ];

  return (
    <div className="px-7 pt-3 text-white poppins">
      <div className="mb-2">
        <h1 className="text-xl font-medium text-white">
          Income Source Details
        </h1>
      </div>

      <div className="space-y-6  overflow-y-auto pr-3 custom-scrollbar">
        {sections.map((section) => {
          const data = incomeData[section.key] || {};

          return (
            <div key={section.key} className="rounded-lg bg-[#151d31]  p-5">
              <h3 className="text-[#8B5CF6] font-medium text-sm mb-4">
                {section.title}
              </h3>

              {section.detailsFirst && (
                <div className="mb-4">
                  <FloatingTextarea
                    placeholder="Details, Requirements (Nos.) and Calculation"
                    label="Details, If any ( 100 words ) *"
                    value={data.details || ""}
                    onChange={(e) =>
                      handleChange(section.key, "details", e.target.value)
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 ">
                {section.fields.map((field) => {
                  if (field === "selectRequired") {
                    return (
                      <div key={field}>
                        <FloatingSelect
                          label="Select Required *"
                          value={data.selectRequired || ""}
                          onChange={(e) =>
                            handleChange(
                              section.key,
                              "selectRequired",
                              e.target.value,
                            )
                          }
                        >
                          <option value="" className="bg-[#151d31]">
                            Select
                          </option>
                          <option value="CSE / ECE" className="bg-[#151d31]">
                            CSE / ECE
                          </option>
                          <option value="MECH" className="bg-[#151d31]">
                            MECH
                          </option>
                          <option value="EEE" className="bg-[#151d31]">
                            EEE
                          </option>
                          <option value="CIVIL" className="bg-[#151d31]">
                            CIVIL
                          </option>
                          <option value="IT" className="bg-[#151d31]">
                            IT
                          </option>
                        </FloatingSelect>
                      </div>
                    );
                  }

                  if (field === "amount") {
                    return (
                      <div key={field} className="relative">
                        <FloatingInput
                        
                          label="Amount *"
                          type="number"
                          value={data.amount || ""}
                          onChange={(e) =>
                            handleChange(section.key, "amount", e.target.value)
                          }
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#CBC3D7]/50 pointer-events-none z-10">
                          ₹
                        </span>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              {section.showDetails && !section.detailsFirst && (
                <div>
                  <FloatingTextarea
                    placeholder="Details, Requirements (Nos.) and Calculation"
                    label="Details, If any ( 100 words ) *"
                    value={data.details || ""}
                    onChange={(e) =>
                      handleChange(section.key, "details", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncomeSourceForm;
