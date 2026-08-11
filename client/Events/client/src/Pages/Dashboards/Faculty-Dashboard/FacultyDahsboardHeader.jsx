import React from 'react'
import { Bell, CircleQuestionMark, Search, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import smallLogo from '../../../assets/small-logo.svg'
import profileAvatar from '../../../assets/profile-avatar.svg'

const facultyRoutes = {
    dashboard: '/dashboard-faculty',
    requests: '/dashboard-faculty/events',
    calendar: '/dashboard-faculty/calendar',
    reports: '/dashboard-faculty/reports',
    venues: '/dashboard-faculty/venues',
}

const getNavLinkClassName = ({ isActive }) =>
    `font-medium pb-1 ${isActive ? 'border-b border-[#8B5CF6] text-[#8B5CF6]' : 'text-[#FFFFFF80] hover:text-white'}`

const FacultyDahsboardHeader = () => {
    return (
        <section className='dashboard-header bg-[#0a0e18] border-b border-[#1d2638] flex items-center justify-between py-3 px-6 poppins sticky top-0 z-10'>
            <div className="first-container flex items-center gap-10">
                <img src={smallLogo} alt="Small Logo" className='w-10 h-10' />

                <nav className="navlins text-white flex items-center gap-8 text-sm">
                    <NavLink to={facultyRoutes.dashboard} end className={getNavLinkClassName}>Dashboard</NavLink>
                    <NavLink to={facultyRoutes.requests} className={getNavLinkClassName}>Request List</NavLink>
                    <NavLink to={facultyRoutes.calendar} className={getNavLinkClassName}>Calendar</NavLink>
                    <NavLink to={facultyRoutes.reports} className={getNavLinkClassName}>Reports</NavLink>
                    <NavLink to={facultyRoutes.venues} className={getNavLinkClassName}>Venue List</NavLink>
                </nav>
            </div>

            <div className="second-container flex items-center gap-6">
                <div className="search-container w-[290px] flex gap-2 items-center border bg-[#161a23] border-[#343b4a] px-3 py-2 rounded-full">
                    <Search size={16} className="text-[#8b93a4]" />
                    <input
                        type="text"
                        className='outline-none w-full text-xs text-white placeholder:text-[#FFFFFF66] bg-transparent'
                        placeholder='Search events, venues, or faculty...'
                    />
                </div>

                <div className="icons-container text-[#b7bdc8] flex items-center gap-5">
                    <Bell size={18} />
                    <CircleQuestionMark size={18} />
                    <Settings size={18} />
                    <img src={profileAvatar} alt="Profile Avatar" className="w-8 h-8 rounded-full" />
                </div>
            </div>
        </section>
    )
}

export default FacultyDahsboardHeader
