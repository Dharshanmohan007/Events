import { Plus } from 'lucide-react'
import React from 'react'

const AdminManagementPage = () => {
    return (
        <>
            <main className='px-6'>
                {/* heading  */}
                <div className="heading mt-2">
                    <div>
                        <h1 className='text-white text-lg font-medium'>Admin Management</h1>
                        <p className='text-[#FFFFFF80] text-sm'><p className='text-[#FFFFFF80] text-sm'>Add, edit, and remove department heads and manage their access.</p></p>
                    </div>
<button className='flex items-center gap-2 cursor-pointer hover:bg-linear-to-r hover:from-[#7c3ae7d2] hover:to-[#3f1e79] px-4 py-2.5 rounded-lg text-white bg-linear-to-r from-[#7C3AE7] to-[#4E2593]'>
                        <Plus size={17} />
                        Add Faculty
                    </button>
                    
                </div>



            </main>


        </>
    )
}

export default AdminManagementPage