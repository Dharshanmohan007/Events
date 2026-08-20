import React from 'react'
import HodEventsRequestTable from './HodEventsRequestTable'

const HodEventsListPage = () => {
  return (
    <main className='px-6'>
        {/* header  */}
      <div className="heading mt-2">
        <h1 className='text-white text-lg font-medium'>HOD Request List Overview</h1>
        <p className='text-[#FFFFFF80] text-sm'>View and manage event requests.</p>
      </div>

      {/* table  */}

      <HodEventsRequestTable />
    </main>
  )
}

export default HodEventsListPage
