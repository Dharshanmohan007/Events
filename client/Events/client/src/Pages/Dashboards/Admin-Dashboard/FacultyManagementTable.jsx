import { ExternalLink, ListFilter, Search, SquarePen, Trash, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

const facultyData = [
    { id: 1, facultyId: 'CSE001', facultyName: 'Dr. Arjun Menon', mail: 'arjun.menon@college.edu', mobileNumber: '+91 98765 43210', department: 'CSE', facultyType: 'Teaching', designation: 'HOD' },
    { id: 2, facultyId: 'CSE002', facultyName: 'Prof. Meera Nair', mail: 'meera.nair@college.edu', mobileNumber: '+91 98765 43211', department: 'CSE', facultyType: 'Teaching', designation: 'Assistant Professor' },
    { id: 3, facultyId: 'CSE003', facultyName: 'Dr. Ravi Kumar', mail: 'ravi.kumar@college.edu', mobileNumber: '+91 98765 43212', department: 'CSE', facultyType: 'Teaching', designation: 'Coordinator' },
    { id: 4, facultyId: 'CSE004', facultyName: 'Ms. Divya Suresh', mail: 'divya.suresh@college.edu', mobileNumber: '+91 98765 43213', department: 'CSE', facultyType: 'Non-Teaching', designation: 'Lab Assistant' },
    { id: 5, facultyId: 'CSE005', facultyName: 'Prof. Naveen Thomas', mail: 'naveen.thomas@college.edu', mobileNumber: '+91 98765 43214', department: 'CSE', facultyType: 'Teaching', designation: 'Associate Professor' },
    { id: 6, facultyId: 'CSE006', facultyName: 'Ms. Anjali Das', mail: 'anjali.das@college.edu', mobileNumber: '+91 98765 43215', department: 'CSE', facultyType: 'Non-Teaching', designation: 'Admin Staff' },
    { id: 7, facultyId: 'CSE007', facultyName: 'Dr. Priya Shah', mail: 'priya.shah@college.edu', mobileNumber: '+91 98765 43216', department: 'CSE', facultyType: 'Teaching', designation: 'Professor' },
    { id: 8, facultyId: 'CSE008', facultyName: 'Prof. Kiran Raj', mail: 'kiran.raj@college.edu', mobileNumber: '+91 98765 43217', department: 'CSE', facultyType: 'Teaching', designation: 'Assistant Professor' },
]

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

const FacultyManagementTable = () => {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredData = facultyData.filter((faculty) => {
        const query = searchQuery.toLowerCase()

        return (
            faculty.facultyName.toLowerCase().includes(query) ||
            faculty.facultyId.toLowerCase().includes(query) ||
            faculty.mail.toLowerCase().includes(query) ||
            faculty.mobileNumber.toLowerCase().includes(query) ||
            faculty.department.toLowerCase().includes(query) ||
            faculty.designation.toLowerCase().includes(query)
        )
    })

    return (
        <>
            <div className="bg-[#171F31] mt-4 border border-gray-800 rounded-xl py-4">
                <div className="max-w-full  ">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap px-6">
                        <h1 className='text-white text-lg font-medium'>CSE Faculty <span className='text-[#853FF9]'>(250)</span> </h1>
                        <div className='filters flex items-center gap-2'>
                            {/* Search */}
                            <div className="search-bar flex items-center gap-2 border border-gray-700 py-2 px-4 rounded-full bg-[#232A3C]">
                                <Search size={16} className="text-gray-400" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    type="text"
                                    placeholder="Search faculty, email"
                                    className="text-gray-300 placeholder:text-gray-500 outline-none bg-[#232A3C]"
                                />
                            </div>

                            {/* dept filter  */}

                            <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-3 bg-[#232A3C]">
                                <ListFilter size={16} className="text-gray-400" />
                                <p className="text-gray-300">CSE</p>
                            </div>

                            {/* role status filter */}
                            <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-3 bg-[#232A3C]">
                                <ListFilter size={16} className="text-gray-400" />
                                <p className="text-gray-300">HOD</p>
                            </div>

                            {/* teaching / non-teaching filter */}
                            <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-3 bg-[#232A3C]">
                                <ListFilter size={16} className="text-gray-400" />
                                <p className="text-gray-300">Teaching</p>
                            </div>
                        </div>

                    </div>

                    {/* table  */}
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
                                {filteredData.map((faculty) => (
                                    <tr
                                        key={faculty.id}
                                        className="border-b border-[#1e2130] text-[#FFFFFF]/80 transition-colors hover:bg-[#1e2232]"
                                    >
                                        <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.facultyId}</td>
                                        <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.facultyName}</td>
                                        <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.mail}</td>
                                        <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.mobileNumber}</td>
                                        <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.department}</td>
                                        <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.facultyType}</td>
                                        <td className="px-5 py-3.5 text-sm whitespace-nowrap">{faculty.designation}</td>
                                        <td className="px-5 py-3.5 text-center">
                                            <button
                                                className="text-gray-400  flex items-center gap-2 transition-colors text-lg"
                                                title="Open"
                                            >
                                                <SquarePen size={17} className='hover:text-white' />
                                                <Trash2 size={17} className='hover:text-white' />
                                                <ExternalLink size={17} className='hover:text-white' />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </>
    )
}

export default FacultyManagementTable
