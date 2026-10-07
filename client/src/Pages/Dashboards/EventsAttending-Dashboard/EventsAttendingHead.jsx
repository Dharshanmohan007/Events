
import React from 'react'
import smallLogo from '../../../assets/small-logo.svg'
import { Link, useLocation } from 'react-router-dom'
import LogoutButton from '../../../Components/LogoutButton'

const EventsAttendingHead = () => {
    const location = useLocation()

    const isActive = (path) => location.pathname === path
    const isSectionActive = (path) =>
        location.pathname === path || location.pathname.startsWith(`${path}/`)

    return (
        <>
            <section className='dashboard-header bg-[#0a0e18] flex items-center justify-between py-4 px-4 poppins sticky top-0 z-50'>
                
                <div className="first-container flex items-center gap-6">
                    <img
                        src={smallLogo}
                        alt="Small Logo"
                        className='w-10 h-10'
                    />

                    <div className="navlins text-white flex items-center gap-4 text-sm">

                        <Link
                            to="/dashboard-eventAttending"
                            className={`font-medium ${
                                isActive('/dashboard-eventAttending')
                                    ? 'border-b border-[#8B5CF6] text-[#8B5CF6]'
                                    : 'text-[#FFFFFF80]'
                            }`}
                        >
                            Dashboard
                        </Link>

                        <Link
                            to="/dashboard-eventAttending/requestLists"
                            className={`font-medium ${
                                isSectionActive('/dashboard-eventAttending/requestLists')
                                    ? 'border-b border-[#8B5CF6] text-[#8B5CF6]'
                                    : 'text-[#FFFFFF80]'
                            }`}
                        >
                            Request List
                        </Link>

                        <Link
                            to="/dashboard-evetnAttending/reports"
                            className={`font-medium ${
                                isActive('/dashboard-evetnAttending/reports')
                                    ? 'border-b border-[#8B5CF6] text-[#8B5CF6]'
                                    : 'text-[#FFFFFF80]'
                            }`}
                        >
                            Reports
                        </Link>

                        <Link
                            to="/calendar"
                            className={`font-medium ${
                                isActive('/calendar')
                                    ? 'border-b border-[#8B5CF6] text-[#8B5CF6]'
                                    : 'text-[#FFFFFF80]'
                            }`}
                        >
                            Calendar
                        </Link>

                    </div>
                </div>

                <div className="second-container flex items-center gap-6">
                    <LogoutButton />
                </div>

            </section>
        </>
    )
}

export default EventsAttendingHead
