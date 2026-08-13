import React from 'react'
import AdminUpcomingEventsTable from './AdminUpcomingEventsTable'
import AdminEventsRequestTable from './Admineventsrequesttable'

const AdminEventsListPage = () => {
  return (
    <main className='px-6'>
        {/* header  */}
      <div className="heading mt-2">
        <h1 className='text-white text-lg font-medium'>Admin Request List Overview</h1>
        <p className='text-[#FFFFFF80] text-sm'>View and manage event requests.</p>
      </div>

      {/* table  */}

      <AdminEventsRequestTable/> 
    </main>
  )
}

export default AdminEventsListPage
