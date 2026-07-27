import { ExternalLink, ListFilter, Search, SquarePen, Trash2 } from 'lucide-react'
import React, { useMemo, useState } from 'react'

const columns = [
    'FACULTY ID',
    'FACULTY NAME',
    'MAIL',
    'MOBILE NUMBER',
    'DEPARTMENT',
    'TYPE',
    'DESIGNATION',
    'ACTION',
]

const SelectFilter = ({ value, onChange, options, label }) => (
    <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-2 bg-[#232A3C]">
        <ListFilter size={16} className="text-gray-400" />
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`Filter by ${label}`}
            className="bg-transparent text-sm text-gray-300 outline-none"
        >
            <option value="all" className="bg-[#171F31] text-white">{label}</option>
            {options.map((option) => (
                <option key={option} value={option} className="bg-[#171F31] text-white">
                    {option}
                </option>
            ))}
        </select>
    </div>
)

const FacultyManagementTable = ({ faculties = [], onEdit, onDelete }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('all')
    const [designationFilter, setDesignationFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')

    const filterOptions = useMemo(() => ({
        departments: [...new Set(faculties.map((faculty) => faculty.department).filter(Boolean))],
        designations: [...new Set(faculties.map((faculty) => faculty.designation).filter(Boolean))],
        categories: [...new Set(faculties.map((faculty) => faculty.employeeCategory).filter(Boolean))],
    }), [faculties])

    const filteredData = faculties.filter((faculty) => {
        const query = searchQuery.toLowerCase()
        const searchableText = [
            faculty.name,
            faculty.empId,
            faculty.email,
            faculty.phone,
            faculty.department,
            faculty.designation,
            faculty.employeeCategory,
        ].join(' ').toLowerCase()

        const matchesSearch = searchableText.includes(query)
        const matchesDepartment = departmentFilter === 'all' || faculty.department === departmentFilter
        const matchesDesignation = designationFilter === 'all' || faculty.designation === designationFilter
        const matchesCategory = categoryFilter === 'all' || faculty.employeeCategory === categoryFilter

        return matchesSearch && matchesDepartment && matchesDesignation && matchesCategory
    })

    return (
        <div className="bg-[#171F31] mt-4 border border-gray-800 rounded-xl py-4">
            <div className="max-w-full">
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap px-6">
                    <h1 className='text-white text-lg font-medium'>
                        Faculty <span className='text-[#853FF9]'>({filteredData.length})</span>
                    </h1>
                    <div className='filters flex items-center gap-2 flex-wrap'>
                        <div className="search-bar flex items-center gap-2 border border-gray-700 py-2 px-4 rounded-full bg-[#232A3C]">
                            <Search size={16} className="text-gray-400" />
                            <input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                type="text"
                                placeholder="Search faculty, email"
                                className="text-gray-300 placeholder:text-gray-500 outline-none bg-transparent"
                            />
                        </div>

                        <SelectFilter value={departmentFilter} onChange={setDepartmentFilter} options={filterOptions.departments} label="Department" />
                        <SelectFilter value={designationFilter} onChange={setDesignationFilter} options={filterOptions.designations} label="Role" />
                        <SelectFilter value={categoryFilter} onChange={setCategoryFilter} options={filterOptions.categories} label="Type" />
                    </div>
                </div>

                <div className="max-h-[calc(100vh-260px)] table-custom-scrollbar overflow-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-[#1C2335]">
                            <tr className="border-b border-[#22253a]">
                                {columns.map((col) => (
                                    <th
                                        key={col}
                                        className={`px-5 py-3.5 text-[11px] font-semibold tracking-widest text-gray-500 uppercase whitespace-nowrap ${col === 'ACTION' ? 'text-center' : 'text-left'}`}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map((faculty) => (
                                <tr
                                    key={faculty._id}
                                    className="border-b border-[#1e2130] text-[#FFFFFF]/80 transition-colors hover:bg-[#1e2232]"
                                >
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.empId}</td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.name}</td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.email}</td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.phone}</td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.department}</td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.employeeCategory}</td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.designation}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-center gap-3 text-gray-400">
                                            <button
                                                type="button"
                                                onClick={() => onEdit?.(faculty)}
                                                className="hover:text-white"
                                                title="Edit"
                                            >
                                                <SquarePen size={17} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete?.(faculty)}
                                                className="hover:text-[#ff3045]"
                                                title="Delete"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                            <button
                                                type="button"
                                                className="hover:text-white"
                                                title="Open"
                                            >
                                                <ExternalLink size={17} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr className="border-b border-[#1e2130] text-sm text-[#8b93a7]">
                                    <td className="px-5 py-8 text-center" colSpan={columns.length}>
                                        No faculty available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default FacultyManagementTable
