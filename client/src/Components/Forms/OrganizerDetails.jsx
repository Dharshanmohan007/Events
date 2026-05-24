import React from 'react'
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";

export default function OrganizerDetails({ dayIndex, data = {}, errors = {}, onChange }) {
  const handle = (field) => (e) => onChange({ ...data, [field]: e.target.value });
  const handleSelect = (field) => (val) => onChange({ ...data, [field]: val });

  return (
    <div className='rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-6'>
      <h2 className='text-purple-400 text-sm font-semibold tracking-wide'>
        Organizer {dayIndex}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="Organizing Co-Ordinator Name *"
            value={data.name || ""}
            onChange={handle("name")}
            placeholder="Enter coordinator name"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <CustomSelect
            labelBg="#1E1E35"
            label="Department"
            required
            value={data.department || ""}
            onChange={handleSelect("department")}
            options={["AIML","AIDS","CSE","CYS","CSBS","ECE","CCE","EEE","MECH","S&H","Media","Transport"]}
            placeholder="Select department"
            searchable
          />
          {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
        </div>
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="Mobile Number *"
            type="tel"
            value={data.mobile || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              onChange({ ...data, mobile: val });
            }}
            placeholder="Enter 10-digit mobile number"
          />
          {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="Designation *"
            value={data.designation || ""}
            onChange={handle("designation")}
            placeholder="Enter designation"
          />
          {errors.designation && <p className="text-red-400 text-xs mt-1">{errors.designation}</p>}
        </div>
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="Emp Id *"
            value={data.empId || ""}
            onChange={handle("empId")}
            placeholder="Enter employee ID"
          />
          {errors.empId && <p className="text-red-400 text-xs mt-1">{errors.empId}</p>}
        </div>
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="E-Mail *"
            type="email"
            value={data.empEmail || ""}
            onChange={handle("empEmail")}
            placeholder="Enter email address"
          />
          {errors.empEmail && <p className="text-red-400 text-xs mt-1">{errors.empEmail}</p>}
        </div>
      </div>
    </div>
  );
}