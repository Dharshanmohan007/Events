import React from 'react'
import smallLogo from '../../assets/small-logo.svg'
import { Search, Bell, CircleQuestionMark, Settings } from 'lucide-react'
import profileAvatar from '../../assets/profile-avatar.svg'
import { Link } from 'react-router-dom'
const DashboardHeader = () => {
    return (
        <>
            <section className='dashboard-header bg-[#0a0e18] flex items-center justify-between py-4 px-4 poppins '>
                <div className="first-container flex items-center gap-6 ">
                    <img src={smallLogo} alt="Small Logo" className='w-10 h-10' />

                    <div className="navlins text-white flex items-center gap-4 text-sm">
                        <Link to="/dashboard-ictcs" className='border-b border-[#8B5CF6] text-[#8B5CF6] font-medium'>Dashboard</Link>
                        <Link to="/Events" className='text-[#FFFFFF80]'>Events</Link>
                        <Link to="/Reports" className='text-[#FFFFFF80]'>Reports</Link>
                    </div>
                </div>
                <div className="second-container flex items-center gap-6 ">
                    <div className="search-container w-85 flex gap-2 items-center border bg-[#161a23] border-[#4b4e55] px-3 py-2 rounded-full">
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

export default DashboardHeader