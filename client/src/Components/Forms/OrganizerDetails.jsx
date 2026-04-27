import React,{useState} from 'react'
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";

export default function OrganizerDetails() {
    const [department, setDepartment] = useState("");
  return (
    <div className='rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-6'>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <CustomInput label="Organizing Co-Ordinator Name *" />
            <CustomSelect
                label="Department"
                required
                value={department}
                onChange={setDepartment}
                options={["AIML","AIDS","CSE","CYS","CSBS","ECE","CCE","EEE","MECH","S&H","Media","Transport"]}
            />
            <CustomInput label="Mobile Number *" type="tel" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <CustomInput label="Designation *" />
            <CustomInput label="Emp Id *" />
        </div>
    </div>
  )
}
