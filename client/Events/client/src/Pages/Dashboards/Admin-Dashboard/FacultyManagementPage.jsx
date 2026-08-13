import { Plus } from 'lucide-react'
import React from 'react'
import FacultyManagementTable from './FacultyManagementTable'

const FacultyManagementPage = () => {
    return (
        <>
            <main className='px-6'>
                {/* header  */}
                <div className="heading mt-2 flex items-center justify-between">
                    <div>
                        <h1 className='text-white text-lg font-medium'>Faculty Management</h1>
                        <p className='text-[#FFFFFF80] text-sm'>View and manage faculty members.</p>
                    </div>

                    <button className='flex items-center gap-2 cursor-pointer hover:bg-gradient-to-r hover:from-[#7c3ae7d2] hover:to-[#3f1e79] px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-[#7C3AE7] to-[#4E2593]'>
                        <Plus size={17} />
                        Add Faculty
                    </button>
                </div>

                {/* table  */}
                <FacultyManagementTable />

            </main>
        </>
    )
}

export default FacultyManagementPage