import React from 'react'
import DashboardHeader from './DashboardHeader'
import IctcsStatcard from './IctcsStatcard'
import IctcsUpcomingEventsTable from './IctcsUpcomingEventsTable'
import IctcsEventsByDepartmentPiechart from './IctcsEventsByDepartmentPiechart'

const ICTCSDashboard = () => {
  return (
    <>
      <section className='bg-[#0b1326] poppins h-screen'>
        {/* header  */}
        <DashboardHeader />

        {/* main-container  */}

        <div className='main-body-container  px-6 '>
          {/* heading */}
          <div className="heading mt-2">
            <h1 className='text-white text-lg font-medium'>ICTCS Dashboard Overview</h1>
            <h1 className='text-[#FFFFFF80] text-sm'>Lorem Ipsumis simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</h1>
          </div>

          {/* stat cards  */}
          <IctcsStatcard />

          {/* table and charts   */}
          <div className="main-container mt-4 h-[calc(100vh-270px)] w-full flex gap-3">
            {/* table  */}
            <IctcsUpcomingEventsTable />
            {/* charts  */}
            <IctcsEventsByDepartmentPiechart />
          </div>

        </div>
      </section>
    </>
  )
}

export default ICTCSDashboard