import React, { useState, useMemo, useEffect, useRef } from 'react';
import CustomSelect from '../CustomSelect';
import { Trash2, Plus, X } from 'lucide-react';

const YEAR_OPTIONS = ["I", "II", "III", "IV"];
const YEAR_MAP = { "I": "1st", "II": "2nd", "III": "3rd", "IV": "4th" };
const REVERSE_YEAR_MAP = { "1st": "I", "2nd": "II", "3rd": "III", "4th": "IV" };

const DEPT_OPTIONS = ["AIML", "AIDS", "CCE", "CSE", "CYS", "CSBS", "IT", "ECE", "EEE", "MECH", "VLSI", "S&H"];
const SECTION_OPTIONS = [
  "AI&DS-A", "AI&DS-B", "AI&DS-C", "AI&DS-D",
  "AI&ML-A", "AI&ML-B",
  "CSE-A", "CSE-B", "CSE-C", "CSE-D",
  "Mech", "CCE", "CYS", "CSBS",
  "ECE-A", "ECE-B", "ECE-C/VLSI", "EEE", "IT",
  "VLSI", "S&H"
];

const getDisplaySectionName = (dept, section) => {
  if (["CCE", "CYS", "CSBS", "EEE", "IT", "VLSI", "S&H"].includes(dept)) return dept;
  if (dept === "MECH") return "Mech";
  if (dept === "ECE" && section === "C/VLSI") return "ECE-C/VLSI";
  if (dept === "AIDS") return `AI&DS-${section}`;
  if (dept === "AIML") return `AI&ML-${section}`;
  return `${dept}-${section}`;
};

const guessDept = (secStr) => {
  if (secStr.startsWith("AI&DS")) return "AIDS";
  if (secStr.startsWith("AI&ML")) return "AIML";
  if (secStr.startsWith("CSE")) return "CSE";
  if (secStr.startsWith("ECE")) return "ECE";
  if (secStr.toLowerCase() === "mech") return "MECH";
  if (secStr === "CCE") return "CCE";
  if (secStr === "CYS") return "CYS";
  if (secStr === "CSBS") return "CSBS";
  if (secStr === "EEE") return "EEE";
  if (secStr === "IT") return "IT";
  if (secStr.includes("VLSI")) return "VLSI";
  return "S&H";
};

export default function InternalStudentBreakdown({ eventData, setEventData, errors }) {
  const [inputGroups, setInputGroups] = useState([{ id: Date.now(), year: "", depts: [], sections: [] }]);
  const [countErrors, setCountErrors] = useState({});
  const populatedRef = useRef(false);

  const breakdown = eventData?.internalStudentsBreakdown || [];

  useEffect(() => {
    if (!populatedRef.current && breakdown.length > 0) {
      const newGroups = breakdown.map((y, i) => {
        const yName = REVERSE_YEAR_MAP[y.year] || "I";
        const depts = y.departments.map(d => d.department);
        let sections = [];
        y.departments.forEach(d => {
          d.sections.forEach(s => {
            sections.push(getDisplaySectionName(d.department, s.section));
          });
        });
        
        return {
          id: Date.now() + i,
          year: yName,
          depts,
          sections
        };
      });
      setInputGroups(newGroups);
      populatedRef.current = true;
    }
  }, [breakdown]);

  const handleAddInputGroup = () => {
    if (inputGroups.length >= 4) return;
    setInputGroups([...inputGroups, { id: Date.now(), year: "", depts: [], sections: [] }]);
  };

  const handleRemoveInputGroup = (index) => {
    const group = inputGroups[index];
    
    // If the group has a year selected, also remove its data from the breakdown table
    if (group.year) {
      const targetYear = YEAR_MAP[group.year];
      const newBreakdown = breakdown.filter(y => y.year !== targetYear);
      setEventData(prev => ({ ...prev, internalStudentsBreakdown: newBreakdown }));
    }

    if (inputGroups.length > 1) {
      setInputGroups(inputGroups.filter((_, i) => i !== index));
    } else {
      // If it's the last group, just clear it instead of removing completely
      setInputGroups([{ id: Date.now(), year: "", depts: [], sections: [] }]);
    }
  };

  const updateGroup = (index, field, value) => {
    const newGroups = [...inputGroups];
    newGroups[index][field] = value;
    setInputGroups(newGroups);
  };

  const handleAdd = (index) => {
    const group = inputGroups[index];
    
    const newErrors = {};
    if (!group.year) newErrors.year = "Year is required";
    if (group.depts.length === 0) newErrors.depts = "Select at least one department";
    if (group.sections.length === 0) newErrors.sections = "Select at least one section";
    
    if (Object.keys(newErrors).length > 0) {
      updateGroup(index, 'errors', newErrors);
      return;
    } else {
      updateGroup(index, 'errors', null);
    }
    
    let newBreakdown = [...breakdown];
    const targetYear = YEAR_MAP[group.year];

    let isNewYear = false;
    let yearGroup = newBreakdown.find(y => y.year === targetYear);
    if (!yearGroup) {
      yearGroup = { year: targetYear, departments: [] };
      isNewYear = true;
    }

    const getShortSection = (secStr) => {
      if (secStr.includes("-")) return secStr.split("-")[1];
      return "A";
    };

    let addedSomething = false;
    group.sections.forEach(sec => {
      const gDept = guessDept(sec);
      const assignedDept = group.depts.includes(gDept) ? gDept : null;
      
      if (assignedDept) {
        addedSomething = true;
        let dGroup = yearGroup.departments.find(d => d.department === assignedDept);
        if (!dGroup) {
          dGroup = { department: assignedDept, sections: [] };
          yearGroup.departments.push(dGroup);
        }
        
        const shortSec = getShortSection(sec);
        const sGroup = dGroup.sections.find(s => s.section === shortSec);
        if (!sGroup) {
          dGroup.sections.push({ section: shortSec, count: 0 });
        }
      }
    });

    // Only push if we actually added valid sections
    if (isNewYear && addedSomething) {
      newBreakdown.push(yearGroup);
    }

    if (addedSomething || !isNewYear) {
      setEventData(prev => ({ ...prev, internalStudentsBreakdown: newBreakdown }));
    }
  };

  const handleCountChange = (yIdx, dIdx, sIdx, val) => {
    let num = val;
    const errorKey = `${yIdx}-${dIdx}-${sIdx}`;
    
    if (val !== "") {
      num = parseInt(val, 10);
      if (isNaN(num)) num = 0;
      
      if (num > 100) {
        setCountErrors(prev => ({ ...prev, [errorKey]: "Max 100 students for one class" }));
        num = 100;
      } else {
        setCountErrors(prev => {
          const newErr = { ...prev };
          delete newErr[errorKey];
          return newErr;
        });
      }
    } else {
      setCountErrors(prev => {
        const newErr = { ...prev };
        delete newErr[errorKey];
        return newErr;
      });
    }

    const newBreakdown = [...breakdown];
    newBreakdown[yIdx] = { ...newBreakdown[yIdx] };
    newBreakdown[yIdx].departments = [...newBreakdown[yIdx].departments];
    newBreakdown[yIdx].departments[dIdx] = { ...newBreakdown[yIdx].departments[dIdx] };
    newBreakdown[yIdx].departments[dIdx].sections = [...newBreakdown[yIdx].departments[dIdx].sections];
    newBreakdown[yIdx].departments[dIdx].sections[sIdx] = {
      ...newBreakdown[yIdx].departments[dIdx].sections[sIdx],
      count: num
    };
    
    setEventData(prev => ({ ...prev, internalStudentsBreakdown: newBreakdown }));
  };

  const handleDeleteSection = (yIdx, dIdx, sIdx) => {
    const newBreakdown = JSON.parse(JSON.stringify(breakdown));
    
    const yearGroup = newBreakdown[yIdx];
    const deptGroup = yearGroup.departments[dIdx];
    const deletedSection = deptGroup.sections[sIdx];
    const deptName = deptGroup.department;
    
    deptGroup.sections.splice(sIdx, 1);
    
    let deptDeleted = false;
    if (deptGroup.sections.length === 0) {
      yearGroup.departments.splice(dIdx, 1);
      deptDeleted = true;
    }
    
    if (yearGroup.departments.length === 0) {
      newBreakdown.splice(yIdx, 1);
    }
    
    setEventData(prev => ({ ...prev, internalStudentsBreakdown: newBreakdown }));

    // Sync removal with input groups
    const targetYear = REVERSE_YEAR_MAP[breakdown[yIdx].year];
    if (targetYear) {
      const originalSectionName = getDisplaySectionName(deptName, deletedSection.section);
      
      if (yearGroup.departments.length === 0) {
        // The entire year is gone, so remove or clear the matching input group
        const groupsToKeep = inputGroups.filter(g => g.year !== targetYear);
        if (groupsToKeep.length === 0) {
          setInputGroups([{ id: Date.now(), year: "", depts: [], sections: [] }]);
        } else {
          setInputGroups(groupsToKeep);
        }
      } else {
        // Just update the sections/depts of the matching group
        const newGroups = inputGroups.map(group => {
          if (group.year === targetYear) {
            const newSections = group.sections.filter(s => s !== originalSectionName);
            let newDepts = [...group.depts];
            if (deptDeleted) {
              newDepts = newDepts.filter(d => d !== deptName);
            }
            return { ...group, sections: newSections, depts: newDepts };
          }
          return group;
        });
        setInputGroups(newGroups);
      }
    }
  };

  const handleDeleteYear = (year) => {
    // Remove from breakdown
    const newBreakdown = breakdown.filter(y => y.year !== year);
    setEventData(prev => ({ ...prev, internalStudentsBreakdown: newBreakdown }));

    // Remove or clear matching input groups
    const dropdownYear = REVERSE_YEAR_MAP[year];
    
    if (dropdownYear) {
      const groupsToKeep = inputGroups.filter(group => group.year !== dropdownYear);
      
      if (groupsToKeep.length === 0) {
        // If removing matching groups leaves 0 groups, reset to a single empty group
        setInputGroups([{ id: Date.now(), year: "", depts: [], sections: [] }]);
      } else {
        // Otherwise, keep the groups that don't match the deleted year
        setInputGroups(groupsToKeep);
      }
    }
  };

  const totalCount = useMemo(() => {
    return breakdown.reduce((sum, y) => 
      sum + y.departments.reduce((dSum, d) => 
        dSum + d.sections.reduce((sSum, s) => sSum + (parseInt(s.count) || 0), 0)
      , 0)
    , 0);
  }, [breakdown]);

  return (
    <div className="relative rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-4 mb-4 mt-2">
      <div className="flex justify-between items-center">
        <h2 className="text-white text-md font-semibold">Internal Students Breakdown</h2>
        {inputGroups.length < 4 && (
          <button
            type="button"
            onClick={handleAddInputGroup}
            className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-purple-600 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        )}
      </div>
      
      <div className="space-y-4 mb-2">
        {inputGroups.map((group, index) => (
          <div key={group.id} className="relative p-4 border border-[#3A3A5A] rounded-lg bg-[#2E3645]">
            {inputGroups.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveInputGroup(index)}
                className="absolute top-2 right-2 text-zinc-400 hover:text-red-400 transition-colors"
                title="Remove this configuration row"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <div className="col-span-1">
                <CustomSelect
                  labelBg="#2E3645"
                  label="Year *"
                  value={group.year}
                  onChange={(val) => {
                    updateGroup(index, 'year', val);
                    if (group.errors?.year) updateGroup(index, 'errors', { ...group.errors, year: null });
                  }}
                  options={YEAR_OPTIONS}
                  placeholder="Select Year"
                  borderColor={group.errors?.year ? "#f87171" : "#FFFFFF66"}
                />
                {group.errors?.year && <p className="text-red-400 text-xs mt-1">{group.errors.year}</p>}
              </div>
              <div className="col-span-1">
                <CustomSelect
                  labelBg="#2E3645"
                  label="Departments *"
                  multi
                  searchable
                  value={group.depts}
                  onChange={(val) => {
                    updateGroup(index, 'depts', val);
                    if (group.errors?.depts) updateGroup(index, 'errors', { ...group.errors, depts: null });
                    // Also filter out any selected sections that don't belong to the new depts
                    if (val && val.length > 0) {
                      const validSections = group.sections.filter(sec => val.includes(guessDept(sec)));
                      updateGroup(index, 'sections', validSections);
                    } else {
                      updateGroup(index, 'sections', []);
                    }
                  }}
                  options={DEPT_OPTIONS}
                  placeholder="Select Depts"
                  borderColor={group.errors?.depts ? "#f87171" : "#FFFFFF66"}
                />
                {group.errors?.depts && <p className="text-red-400 text-xs mt-1">{group.errors.depts}</p>}
              </div>
              <div className="col-span-1">
                <CustomSelect
                  labelBg="#2E3645"
                  label="Sections *"
                  multi
                  searchable
                  value={group.sections}
                  onChange={(val) => {
                    updateGroup(index, 'sections', val);
                    if (group.errors?.sections) updateGroup(index, 'errors', { ...group.errors, sections: null });
                  }}
                  options={group.depts.length > 0 ? SECTION_OPTIONS.filter(sec => group.depts.includes(guessDept(sec))) : SECTION_OPTIONS}
                  placeholder="Select Sections"
                  borderColor={group.errors?.sections ? "#f87171" : "#FFFFFF66"}
                />
                {group.errors?.sections && <p className="text-red-400 text-xs mt-1">{group.errors.sections}</p>}
              </div>
              <div className="col-span-1 flex items-end pb-1">
                <button
                  type="button"
                  onClick={() => handleAdd(index)}
                  className="w-full bg-[#8b5cf6] hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Add Count 
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {breakdown.filter(y => y.departments.length > 0).length > 0 && (
        <div className="space-y-6">
          {breakdown.map((yearGroup, yIdx) => {
            if (yearGroup.departments.length === 0) return null;
            return (
            <div key={yearGroup.year} className="rounded-xl border border-[#3A3A5A] bg-[#2E3645] p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-purple-400 text-sm font-semibold tracking-wide">Year {yearGroup.year}</h3>
                <button
                  type="button"
                  onClick={() => handleDeleteYear(yearGroup.year)}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-red-400/40 text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors"
                  title={`Delete Year ${yearGroup.year}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-[#3A3A5A]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1E1E35] border-b border-[#3A3A5A]">
                      <th className="py-3 px-4 text-gray-300 font-medium text-sm">Department</th>
                      <th className="py-3 px-4 text-gray-300 font-medium text-sm">Section</th>
                      <th className="py-3 px-4 text-gray-300 font-medium text-sm w-32">Count</th>
                      <th className="py-3 px-4 text-gray-300 font-medium text-sm w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A3A5A] bg-transparent">
                    {yearGroup.departments.map((deptGroup, dIdx) =>
                      deptGroup.sections.map((sec, sIdx) => (
                        <tr key={`${yearGroup.year}-${deptGroup.department}-${sec.section}`} className="hover:bg-[#1E1E35]/50 transition-colors">
                          <td className="py-3 px-4 text-white text-sm">{deptGroup.department}</td>
                          <td className="py-3 px-4 text-white text-sm">{getDisplaySectionName(deptGroup.department, sec.section)}</td>
                          <td className="py-3 px-4 relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === '.') e.preventDefault();
                              }}
                              className={`bg-[#1E1E35] border ${countErrors[`${yIdx}-${dIdx}-${sIdx}`] ? 'border-red-500' : 'border-[#3A3A5A]'} text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2`}
                              value={sec.count === 0 && !sec.count.toString().length ? "" : sec.count}
                              onChange={(e) => handleCountChange(yIdx, dIdx, sIdx, e.target.value)}
                            />
                            {countErrors[`${yIdx}-${dIdx}-${sIdx}`] && (
                              <p className="text-red-400 text-[10px] absolute -bottom-1 left-4 w-[120%]">{countErrors[`${yIdx}-${dIdx}-${sIdx}`]}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(yIdx, dIdx, sIdx)}
                              className="text-red-400 hover:text-red-300 p-2 hover:bg-[#1E1E35] rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )})}
          <div className="mt-4 flex justify-end">
            <div className="bg-[#1E1E35] border border-[#3A3A5A] px-6 py-3 rounded-lg flex items-center gap-4">
              <span className="text-gray-400 font-medium text-sm">Consolidated Total:</span>
              <span className="text-white font-bold text-lg">{totalCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
