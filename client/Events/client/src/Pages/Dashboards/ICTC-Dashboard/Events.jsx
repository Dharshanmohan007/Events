import React from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import IctcsEventsOverviewTable from './IctcsEventsOverviewTable'

const Events = () => {
    return (
        <section className='bg-[#0b1326] poppins h-screen'>
            {/* header  */}
            <DashboardHeader />

            {/* main-container  */}
            <div className='main-body-container  px-6 '>
                {/* heading */}
                <div className="heading mt-2">
                    <h1 className='text-white text-lg font-medium'>ICTCS Event Overview</h1>
                    <h1 className='text-[#FFFFFF80] text-sm'>Lorem Ipsumis simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</h1>
                </div>

                {/* table  */}
                <div className="table-container mt-6 w-full h-[calc(100vh-170px)] rounded-lg">
                    <IctcsEventsOverviewTable />
                </div>
            </div>
        </section>
    )
}

export default Events