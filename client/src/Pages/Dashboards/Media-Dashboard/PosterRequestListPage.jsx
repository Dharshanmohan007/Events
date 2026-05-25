import React, { useState } from 'react'
import { Bell, CalendarDays, CircleQuestionMark, ExternalLink, Filter, Search, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import smallLogo from '../../../assets/small-logo.svg'
import profileAvatar from '../../../assets/profile-avatar.svg'

const eventRows = [
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Welcome Freshers', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Completed' },
]

const individualRows = [
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Medium', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Not completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'High', department: 'CSE', acknowledgeStatus: 'Acknowledged', workStatus: 'Completed' },
    { name: 'Dharsan', dueDate: '15-03-2024', priority: 'Low', department: 'CSE', acknowledgeStatus: 'Pending Acknowledge', workStatus: 'Completed' },
]

const PosterHeader = () => (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-6 py-3">
        <div className="flex items-center gap-8">
            <img src={smallLogo} alt="Logo" className="h-11 w-11" />
            <nav className="flex items-center gap-8 text-sm font-medium">
                <Link to="/dashboard-poster" className="pb-2 text-[#FFFFFF80] hover:text-white">Dashboard</Link>
                <Link to="/dashboard-poster/requests" className="border-b border-[#8B3DFF] pb-2 text-[#8B3DFF]">Request List</Link>
                <span className="pb-2 text-[#FFFFFF80]">Calendar</span>
                <Link to="/dashboard-poster/reports" className="pb-2 text-[#FFFFFF80] hover:text-white">Reports</Link>
                <Link to="/dashboard-poster/feedback" className="pb-2 text-[#FFFFFF80] hover:text-white">Feedback</Link>
            </nav>
        </div>

        <div className="flex items-center gap-6">
            <div className="flex h-9 w-[290px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#161a23] px-3">
                <Search size={15} className="text-[#8b93a4]" />
                <input className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]" placeholder="Search events, venues, or faculty..." />
            </div>
            <div className="flex items-center gap-5 text-[#b7bdc8]">
                <Bell size={16} />
                <CircleQuestionMark size={16} />
                <Settings size={16} />
                <img src={profileAvatar} alt="Profile Avatar" className="h-8 w-8 rounded-full" />
            </div>
        </div>
    </header>
)

const StatusPill = ({ status }) => {
    const isPositive = status === 'Acknowledged' || status === 'Completed'

    return (
        <span className={`inline-flex items-center gap-2 font-semibold ${isPositive ? 'text-[#20D18C]' : 'text-[#F20768]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isPositive ? 'bg-[#20D18C]' : 'bg-[#F20768]'}`} />
            {status}
        </span>
    )
}

const RequestTable = ({ activeTab }) => {
    const isEventRequest = activeTab === 'event'
    const rows = isEventRequest ? eventRows : individualRows

    return (
        <section className="mt-4 rounded-lg border border-[#2a3347] bg-[#151c2c]">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <h2 className="text-lg font-semibold text-white">
                    {isEventRequest ? 'Event Poster Request List' : 'individual Poster Request List'} <span className="text-[#8B3DFF]">( 80 )</span>
                </h2>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-9 w-[285px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#232A3C] px-3">
                        <Search size={14} className="text-[#8b93a4]" />
                        <input className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]" placeholder="Search events, venues" />
                    </div>
                    <button type="button" className="flex h-9 items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 text-xs text-white">
                        <Filter size={12} className="text-[#8b93a4]" />
                        High
                    </button>
                    <button type="button" className="flex h-9 items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 text-xs text-white">
                        <Filter size={12} className="text-[#8b93a4]" />
                        Acknowledged
                    </button>
                    <button type="button" className="flex h-9 items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 text-xs text-white">
                        <CalendarDays size={13} className="text-[#8b93a4]" />
                        15/03/2026
                    </button>
                </div>
            </div>

            <div className="overflow-auto max-h-[calc(100vh-320px)] table-custom-scrollbar">
                <table className="w-full text-left ">
                    <thead className="bg-[#1B2335] text-xs uppercase text-[#7f8799] sticky top-0">
                        <tr>
                            <th className="px-4 py-4 font-semibold">{isEventRequest ? 'Event Name' : 'Requested Person'}</th>
                            <th className="px-4 py-4 font-semibold">Due Date</th>
                            <th className="px-4 py-4 font-semibold">Priority</th>
                            <th className="px-4 py-4 font-semibold">Department</th>
                            <th className="px-4 py-4 font-semibold">Acknowledge Status</th>
                            <th className="px-4 py-4 font-semibold">Work Status</th>
                            <th className="px-4 py-4 text-center font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={`${row.name}-${index}`} className="border-t border-[#20283a] text-xs text-white">
                                <td className="px-4 py-4 font-medium">{row.name}</td>
                                <td className="px-4 py-4">{row.dueDate}</td>
                                <td className="px-4 py-4">{row.priority}</td>
                                <td className="px-4 py-4">{row.department}</td>
                                <td className="px-4 py-4"><StatusPill status={row.acknowledgeStatus} /></td>
                                <td className="px-4 py-4"><StatusPill status={row.workStatus} /></td>
                                <td className="px-4 py-4 text-center">
                                    <Link to="/dashboard-poster/detailView/1" className="inline-flex text-[#8b93a7] hover:text-white" aria-label="Open poster request detail">
                                        <ExternalLink size={15} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

const PosterRequestListPage = () => {
    const [activeTab, setActiveTab] = useState('event')

    return (
        <section className="min-h-screen bg-[#0b1326] pt-16.25 text-white poppins">
            <PosterHeader />
            <main className="px-6 py-5">
                <h1 className="text-lg font-medium">Poster Request List</h1>
                <p className="mt-1 text-sm text-[#FFFFFF80]">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                </p>

                <div className="mt-5 flex border-b border-[#52596b]">
                    <button
                        type="button"
                        onClick={() => setActiveTab('event')}
                        className={`min-w-[145px] px-3 pb-3 cursor-pointer text-left text-base font-medium ${activeTab === 'event' ? 'border-b-2 border-[#8B3DFF] text-[#8B3DFF]' : 'text-white'}`}
                    >
                        Event Request
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('individual')}
                        className={`min-w-[165px] px-3 pb-3 cursor-pointer text-left text-base font-medium ${activeTab === 'individual' ? 'border-b-2 border-[#8B3DFF] text-[#8B3DFF]' : 'text-white'}`}
                    >
                        Individual Request
                    </button>
                </div>

                <RequestTable activeTab={activeTab} />
            </main>
        </section>
    )
}

export default PosterRequestListPage
