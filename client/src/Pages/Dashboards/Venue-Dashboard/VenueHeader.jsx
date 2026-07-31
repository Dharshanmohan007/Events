import React from 'react'
import { Bell, CircleQuestionMark, Search, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import smallLogo from '../../../assets/small-logo.svg'
import profileAvatar from '../../../assets/profile-avatar.svg'

const VenueHeader = ({ basePath = '/dashboard-venue' }) => {
    const location = useLocation()

    const isActive = (path) => location.pathname === path
    const isSectionActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)

    return (
        <section className="dashboard-header bg-[#0a0e18] flex items-center justify-between py-4 px-4 poppins sticky top-0 z-50">
            <div className="first-container flex items-center gap-6">
                <img src={smallLogo} alt="Small Logo" className="h-10 w-10" />

                <div className="navlins text-white flex items-center gap-4 text-sm">
                    <Link to={basePath} className={`font-medium ${isActive(basePath) ? 'border-b border-[#8B5CF6] text-[#8B5CF6]' : 'text-[#FFFFFF80]'}`}>Dashboard</Link>
                    <Link to={`${basePath}/requests`} className={`font-medium ${isSectionActive(`${basePath}/requests`) ? 'border-b border-[#8B5CF6] text-[#8B5CF6]' : 'text-[#FFFFFF80]'}`}>Request List</Link>
                    <Link to={`${basePath}/reports`} className={`font-medium ${isActive(`${basePath}/reports`) ? 'border-b border-[#8B5CF6] text-[#8B5CF6]' : 'text-[#FFFFFF80]'}`}>Reports</Link>
                </div>
            </div>

            <div className="second-container flex items-center gap-6">
                <div className="search-container w-85 flex gap-2 items-center border bg-[#161a23] border-[#4b4e55] px-3 py-2 rounded-full">
                    <Search size={20} className="text-[#656f83]" />
                    <input type="text" className="outline-none w-full text-sm text-white bg-transparent placeholder:text-[#FFFFFF66]" placeholder="Search venue requests..." />
                </div>

                <div className="icons-container text-[#9d9fa3] flex items-center gap-4">
                    <Bell size={20} />
                    <CircleQuestionMark size={20} />
                    <Settings size={20} />
                    <img src={profileAvatar} alt="Profile Avatar" className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </section>
    )
}

export default VenueHeader
