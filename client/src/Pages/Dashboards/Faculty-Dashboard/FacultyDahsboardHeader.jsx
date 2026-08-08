import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import smallLogo from '../../../assets/small-logo.svg'
import LogoutButton from '../../../Components/LogoutButton'
import ChangePasswordModal from '../../../Components/ChangePasswordModal'
import { Lock } from 'lucide-react'

const facultyRoutes = {
    dashboard: '/dashboard-faculty',
    requests: '/dashboard-faculty/events',
    venues: '/dashboard-faculty/venues',
    reports: '/dashboard-faculty/reports',
    calendar: '/calendar',
}

const getNavLinkClassName = ({ isActive }) =>
    `font-medium pb-1 ${isActive ? 'border-b border-[#8B5CF6] text-[#8B5CF6]' : 'text-[#FFFFFF80] hover:text-white'}`

const FacultyDahsboardHeader = () => {
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

    return (
        <section className='dashboard-header bg-[#0a0e18] border-b border-[#1d2638] flex items-center justify-between py-3 px-6 poppins sticky top-0 z-50'>
            <div className="first-container flex items-center gap-10">
                <img src={smallLogo} alt="Small Logo" className='w-10 h-10' />

                <nav className="navlins text-white flex items-center gap-8 text-sm">
                    <NavLink to={facultyRoutes.dashboard} end className={getNavLinkClassName}>Dashboard</NavLink>
                    <NavLink to={facultyRoutes.requests} className={getNavLinkClassName}>Request List</NavLink>
                    <NavLink to={facultyRoutes.reports} className={getNavLinkClassName}>Reports</NavLink>
                    <NavLink to={facultyRoutes.calendar} className={getNavLinkClassName}>Calendar</NavLink>
                    <NavLink to={facultyRoutes.venues} className={getNavLinkClassName}>Venue List</NavLink>
                </nav>
            </div>

            <div className="second-container flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="relative group flex items-center justify-center rounded-full p-2 transition hover:bg-[#1d2638]"
                    aria-label="Change password"
                >
                    <Lock className="text-white cursor-pointer" />

                    <span className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
                        Change password
                    </span>
                </button>
                <LogoutButton />
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </section>
    )
}

export default FacultyDahsboardHeader
