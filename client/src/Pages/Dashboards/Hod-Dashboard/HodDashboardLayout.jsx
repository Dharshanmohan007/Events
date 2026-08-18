import React from 'react'
import { Outlet } from 'react-router-dom'
import HodDashboardHeader from './HodDashboardHeader'

const HodDashboardLayout = () => {

    return (
        <section className='min-h-screen bg-[#0b1326] poppins'>
            <HodDashboardHeader />
            <Outlet />
        </section>
    )
}

export default HodDashboardLayout
