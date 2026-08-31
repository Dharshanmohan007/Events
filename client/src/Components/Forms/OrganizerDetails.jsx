import React, { useEffect, useState } from "react";
import { searchFaculty } from "../../services/events/facultySearchService";
import CustomSelect from "../CustomSelect";
import CustomInput from "../CustomInput";

export default function OrganizerDetails({ title, data = {}, errors = {}, onChange, hideSearch = false }) {
  const handle = (field) => (e) => onChange({ ...data, [field]: e.target.value });
  const handleSelect = (field) => (val) =>
    onChange({ ...data, [field]: val });

  const [query, setQuery] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.trim().length < 2) {
        setFacultyList([]);
        return;
      }

      const res = await searchFaculty(query);
      setFacultyList(res);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const selectFaculty = (faculty) => {
    onChange({
      ...data,
      name: faculty.name,
      department: faculty.department,
      mobile: faculty.phone != null ? String(faculty.phone) : "",   // ← force string
      designation: faculty.designation,
      empId: faculty.empId,
      empEmail: faculty.email,
    });

    setQuery(`${faculty.name} (${faculty.empId})`);
    setShowDropdown(false);
  };

  return (
    <div className='rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-6'>
      <h2 className='text-purple-400 text-sm font-semibold tracking-wide'>
        {title}
      </h2>
      {!hideSearch && (
        <div className="relative mb-5">

      <label className="block text-white text-sm mb-2">
          Search Faculty
      </label>

      <input
          type="text"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="Search by Faculty Name or Employee ID"
          className="w-full rounded-lg border border-[#3A3A5A] bg-transparent p-3 text-white outline-none"
      />

      {
          showDropdown &&
          facultyList.length > 0 &&
          (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#252541] rounded-lg border border-[#3A3A5A] max-h-64 overflow-y-auto z-50">

                  {
                      facultyList.map((faculty)=>(
                          <div
                              key={faculty.facultyId}
                              onClick={()=>selectFaculty(faculty)}
                              className="flex items-center gap-3 p-3 hover:bg-[#34345f] cursor-pointer"
                          >

                              <img
                                  src={
                                      faculty.profileImage ||
                                      "https://ui-avatars.com/api/?name="+faculty.name
                                  }
                                  className="w-10 h-10 rounded-full object-cover"
                              />

                              <div>

                                  <p className="text-white">
                                      {faculty.name}
                                  </p>

                                  <p className="text-gray-400 text-sm">
                                      {faculty.empId}
                                  </p>

                              </div>

                          </div>
                      ))
                  }

              </div>
          )
      }

  </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <CustomInput
            labelBg="#1E1E35"
            label="Name *"
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