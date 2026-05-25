import React from 'react'
import { ArrowRight, Bell, Calendar, Check, CircleQuestionMark, ExternalLink, Filter, Hourglass, Search, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import FeedbackRatings from '../../../Components/FeedbackRatings'
import smallLogo from '../../../assets/small-logo.svg'
import profileAvatar from '../../../assets/profile-avatar.svg'

const statGroups = [
    {
        title: 'Event Poster Media Request',
        cards: [
            { label: 'Total Request', value: 50, icon: Calendar, className: 'from-[#3A286F] to-[#5B1B8F]', iconBg: 'bg-[#A78BFA]' },
            { label: 'Completed Request', value: 50, icon: Check, className: 'from-[#143D40] to-[#0B8C64]', iconBg: 'bg-[#45D6A4]' },
            { label: 'Acknowledged', value: 50, icon: Check, className: 'from-[#1A2A63] to-[#2921A3]', iconBg: 'bg-[#8EA0FF]' },
            { label: 'Pending Acknowledgement', value: 50, icon: Hourglass, className: 'from-[#3B213A] to-[#8C174B]', iconBg: 'bg-[#FF6DB3]' },
        ],
    },
    {
        title: 'Individual Poster Media Request',
        cards: [
            { label: 'Total Request', value: 50, icon: Calendar, className: 'from-[#3A286F] to-[#5B1B8F]', iconBg: 'bg-[#A78BFA]' },
            { label: 'Completed Request', value: 50, icon: Check, className: 'from-[#143D40] to-[#0B8C64]', iconBg: 'bg-[#45D6A4]' },
            { label: 'Acknowledged', value: 50, icon: Check, className: 'from-[#1A2A63] to-[#2921A3]', iconBg: 'bg-[#8EA0FF]' },
            { label: 'Pending Acknowledgement', value: 50, icon: Hourglass, className: 'from-[#3B213A] to-[#8C174B]', iconBg: 'bg-[#FF6DB3]' },
        ],
    },
]

const requestRows = Array.from({ length: 20 }, (_, index) => ({
    eventName: 'Welcome Freshers',
    eventType: 'Seminar',
    eventDateTime: '15-03-2026 / 09:00AM- 12:00PM',
    eventVenue: index === 0 ? 'Main Board Room' : 'Vista Hall',
    department: 'CSE',
    internetFacility: index === 0 ? 'LAN' : 'WIFI',
    status: index === 1 || index === 3 ? 'Pending Acknowledge' : 'Acknowledged',
}))

const chartData = [
    { name: 'CSE', value: 25, color: '#74B9FF' },
    { name: 'AI&ML', value: 55, color: '#159283' },
    { name: 'EEE', value: 12, color: '#68DF85' },
    { name: 'VLSI', value: 8, color: '#3352C8' },
]

const feedbackRows = Array.from({ length: 13 }, () => ({
    name: 'Dr. Sarah Jenkins',
    department: 'Dept. of Computer Science',
    quote: '"The event poster exceeded expectations. The team captured the technical essence perfectly with modern aesthetics."',
    time: '2 HOURS AGO',
}))

const DashboardHeader = () => (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-6 py-3">
        <div className="flex items-center gap-6">
            <img src={smallLogo} alt="Logo" className="h-11 w-11" />
            <nav className="flex items-center gap-8 text-sm font-medium">
                <Link to="/dashboard-poster" className="border-b border-[#8B3DFF] pb-2 text-[#8B3DFF]">Dashboard</Link>
                <Link to="/dashboard-poster/requests" className="pb-2 text-[#FFFFFF80] hover:text-white">Request List</Link>
                <span className="pb-2 text-[#FFFFFF80]">Calendar</span>
                <Link to="/dashboard-poster/reports" className="pb-2 text-[#FFFFFF80] hover:text-white">Reports</Link>
                <Link to="/dashboard-poster/feedback" className="pb-2 text-[#FFFFFF80] hover:text-white">Feedback</Link>
            </nav>
        </div>

        <div className="flex items-center gap-6">
            <div className="flex w-[290px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#161a23] px-3 py-2">
                <Search size={15} className="text-[#8b93a4]" />
                <input className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]" placeholder="Search events, venues, or faculty..." />
            </div>
            <div className="flex items-center gap-5 text-[#b7bdc8]">
                <Bell size={18} />
                <CircleQuestionMark size={18} />
                <Settings size={18} />
                <img src={profileAvatar} alt="Profile Avatar" className="h-8 w-8 rounded-full" />
            </div>
        </div>
    </header>
)

const StatGroup = ({ title, cards }) => (
    <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] p-2">
        <h2 className="text-lg font-medium text-white">{title}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
            {cards.map(({ label, value, icon, className, iconBg }) => {
                const IconComponent = icon

                return (
                    <article key={label} className={`flex h-[70px] justify-between rounded-lg bg-gradient-to-r ${className} px-3 py-3`}>
                        <div>
                            <p className="text-sm text-white">{label}</p>
                            <p className="text-xl font-medium text-white">{value}</p>
                        </div>
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
                            <IconComponent size={17} className="text-white" />
                        </span>
                    </article>
                )
            })}
        </div>
    </section>
)

const Status = ({ status }) => {
    const acknowledged = status === 'Acknowledged'

    return (
        <span className={`inline-flex items-center gap-2 font-semibold ${acknowledged ? 'text-[#20D18C]' : 'text-[#F20768]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${acknowledged ? 'bg-[#20D18C]' : 'bg-[#F20768]'}`} />
            {status}
        </span>
    )
}

const RequestTable = () => (
    <section className="rounded-lg border border-[#2a3347] bg-[#151c2c]">
        <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4">
            <div className="flex w-[290px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#232A3C] px-3 py-2">
                <Search size={14} className="text-[#8b93a4]" />
                <input className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]" placeholder="Search events, venues" />
            </div>
            {["Filters"].map((filter) => (
                <button key={filter} className="flex items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 py-2 text-xs text-white">
                    <Filter size={12} className="text-[#8b93a4]" />
                    {filter}
                </button>
            ))}
            <div>
                <Link to="/dashboard-poster/requests" className="text-sm flex items-center gap-2 text-[#853FF9] font-medium cursor-pointer">
                    View all <span><ArrowRight size={14} /></span>
                </Link>
            </div>
        </div>

        <div className="overflow-auto h-[calc(100vh-270px)] table-custom-scrollbar">
            <table className="w-full overflow-auto text-left">
                <thead className="bg-[#1B2335] text-xs uppercase text-[#7f8799]">
                    <tr>
                        {['Event Name', 'Event Type', 'Event Date & Time', 'Event Venue', 'Department', 'Internet Facility', 'Acknowledge Status', 'Action'].map((column) => (
                            <th key={column} className="px-4 py-4 font-semibold">{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {requestRows.map((row, index) => (
                        <tr key={index} className="border-t border-[#20283a] text-xs text-white">
                            <td className="px-4 py-4 font-medium">{row.eventName}</td>
                            <td className="px-4 py-4">{row.eventType}</td>
                            <td className="px-4 py-4">{row.eventDateTime}</td>
                            <td className="px-4 py-4">{row.eventVenue}</td>
                            <td className="px-4 py-4">{row.department}</td>
                            <td className="px-4 py-4">{row.internetFacility}</td>
                            <td className="px-4 py-4"><Status status={row.status} /></td>
                            <td className="px-4 py-4">
                                <Link to={`/dashboard-poster/detailView/${index + 1}`} className="inline-flex text-[#8b93a7] hover:text-white">
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

const PosterDashboard = () => {
    return (
        <section className="min-h-screen overflow-auto bg-[#0b1326] pt-16.25 text-white poppins table-custom-scrollbar">
            <DashboardHeader />
            <main className="px-6 py-5">
                <h1 className="text-lg font-medium">Dashboard Overview</h1>
                <p className="mt-1 mb-1 text-sm text-[#FFFFFF80]">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    {statGroups.map((group) => <StatGroup key={group.title} {...group} />)}
                </div>

                <div className="mt-7">
                    <RequestTable />
                </div>

                <div className="mt-8 grid grid-cols-12 gap-3">
                    <FeedbackRatings rows={feedbackRows} feedbackLink="/dashboard-poster/feedback" />
                    <DepartmentRequestChart data={chartData} title="Event Poster Request By Department" />
                </div>
            </main>
        </section>
    )
}

export default PosterDashboard
