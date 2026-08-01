import React from 'react'
import smallLogo from '../../../assets/small-logo.svg'
import { Search, Bell, CircleQuestionMark, Settings } from 'lucide-react'
import profileAvatar from '../../../assets/profile-avatar.svg'
import { NavLink } from 'react-router-dom'

const adminRoutes = {
    dashboard: '/dashboard-admin',
    requests: '/dashboard-admin/AdminEventsRequests',
    venues: '/dashboard-admin/VenueManagement',
    faculty: '/dashboard-admin/FacultyManagement',
    admins: '/dashboard-admin/AdminManagement',
    reports: '/dashboard-admin/reports',
    othermanagements: '/dashboard-admin/other-managements',
}

const getNavLinkClassName = ({ isActive }) =>
    `font-medium ${isActive ? 'border-b border-[#8B5CF6] text-[#8B5CF6]' : 'text-[#FFFFFF80]'}`

const   AdminDashboardHeader = () => {
    return (
        <>
            <section className='dashboard-header bg-[#0a0e18] flex items-center justify-between py-4 px-4 poppins sticky top-0 z-10 '>
                <div className="first-container flex items-center gap-6 ">
                    <img src={smallLogo} alt="Small Logo" className='w-10 h-10' />

                    <div className="navlins text-white flex items-center gap-4 text-[13px] whitespace-nowrap 2xl:text-sm">
                        <NavLink to={adminRoutes.dashboard} end className={getNavLinkClassName}>Dashboard</NavLink>
                        <NavLink to={adminRoutes.requests} className={getNavLinkClassName}>Requests List</NavLink>
                        <NavLink to={adminRoutes.venues} className={getNavLinkClassName}>Venue Management</NavLink>
                        <NavLink to={adminRoutes.faculty} className={getNavLinkClassName}>Faculty Management</NavLink>
                        {/* <NavLink to={adminRoutes.admins} className={getNavLinkClassName}>Admin Management</NavLink> */}
                        <NavLink to={adminRoutes.reports} className={getNavLinkClassName}>Reports</NavLink>
                        <NavLink to={adminRoutes.othermanagements} className={getNavLinkClassName}>Other Managements</NavLink>
                    </div>
                </div>
                <div className="second-container flex items-center gap-6 ">
                    <div className="search-container w-50 flex gap-2 items-center border bg-[#161a23] border-[#4b4e55] px-3 py-2 rounded-full">
                        <Search size={20} className="text-[#656f83]" />
                        <input type="text" className='outline-none w-full text-sm text-white' placeholder='Search events, venues, or faculty...' />
                    </div>

                    <div className="icons-container text-[#9d9fa3] flex items-center gap-4">
                        <Bell size={20} />
                        <CircleQuestionMark size={20} />
                        <Settings size={20} />
                        <img src={profileAvatar} alt="Profile Avatar" className="w-8 h-8 rounded-full" />
                    </div>
                </div>
            </section>
        </>
    )
}

export default AdminDashboardHeader
