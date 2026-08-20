import React from 'react'
import smallLogo from '../../../assets/small-logo.svg'
import { NavLink } from 'react-router-dom'
import LogoutButton from '../../../Components/LogoutButton'

const hodRoutes = {
    dashboard: '/dashboard-hod',
    requests: '/dashboard-hod/AdminEventsRequests',
    reports: '/dashboard-hod/reports',
    calendar: '/calendar',
}

const getNavLinkClassName = ({ isActive }) =>
    `font-medium ${isActive ? 'border-b border-[#8B5CF6] text-[#8B5CF6]' : 'text-[#FFFFFF80]'}`

const HodDashboardHeader = () => {
    return (
        <>
            <section className='dashboard-header bg-[#0a0e18] flex items-center justify-between py-4 px-4 poppins sticky top-0 z-50 '>
                <div className="first-container flex items-center gap-6 ">
                    <img src={smallLogo} alt="Small Logo" className='w-10 h-10' />

                    <div className="navlins text-white flex items-center gap-4 text-[13px] whitespace-nowrap 2xl:text-sm">
                        <NavLink to={hodRoutes.dashboard} end className={getNavLinkClassName}>Dashboard</NavLink>
                        <NavLink to={hodRoutes.requests} className={getNavLinkClassName}>Requests List</NavLink>
                        <NavLink to={hodRoutes.calendar} className={getNavLinkClassName}>Calendar</NavLink>
                        <NavLink to={hodRoutes.reports} className={getNavLinkClassName}>Reports</NavLink>
                    </div>
                </div>
                <div className="second-container flex items-center gap-6 ">
                    <LogoutButton />
                </div>
            </section>
        </>
    )
}

export default HodDashboardHeader
