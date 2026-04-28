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
          <CustomInput label="Organizing Co-Ordinator Name *" value={data.name || ""} onChange={handle("name")} />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <CustomSelect
            label="Department"
            required
            value={data.department || ""}
            onChange={handleSelect("department")}
            options={["AIML","AIDS","CSE","CYS","CSBS","ECE","CCE","EEE","MECH","S&H","Media","Transport"]}
          />
          {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
        </div>
        <div>
          <CustomInput label="Mobile Number *" type="tel" value={data.mobile || ""} onChange={handle("mobile")} />
          {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomInput label="Designation *" value={data.designation || ""} onChange={handle("designation")} />
          {errors.designation && <p className="text-red-400 text-xs mt-1">{errors.designation}</p>}
        </div>
        <div>
          <CustomInput label="Emp Id *" value={data.empId || ""} onChange={handle("empId")} />
          {errors.empId && <p className="text-red-400 text-xs mt-1">{errors.empId}</p>}
        </div>
      </div>
    </div>
  );
}