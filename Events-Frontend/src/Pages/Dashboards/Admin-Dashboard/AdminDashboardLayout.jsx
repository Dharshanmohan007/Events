import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminDashboardHeader from './AdminDashboardHeader'

const AdminDashboardLayout = () => {

    return (
        <section className='min-h-screen bg-[#0b1326] poppins'>
            <AdminDashboardHeader />
            {/* <Outlet key={location.pathname} /> */}
               <Outlet />
        </section>
    )
}

export default AdminDashboardLayout
