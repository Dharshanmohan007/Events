import React, { useState } from 'react'
import { Download, Filter, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import smallLogo from '../../../assets/small-logo.svg'
import LogoutButton from '../../../Components/LogoutButton'

const eventReportRows = Array.from({ length: 9 }, (_, index) => ({
    eventName: 'Welcome Freshers',
    eventType: 'Seminar',
    eventVenue: 'Main Board Room',
    eventDate: '15-03-2026',
    status: [1, 6, 7, 8].includes(index) ? 'Not Completed' : 'Completed',
}))

const individualReportRows = Array.from({ length: 9 }, (_, index) => ({
    eventName: 'Dharsan',
    eventType: 'Individual',
    eventVenue: index % 2 === 0 ? 'Main Board Room' : 'Vista Hall',
    eventDate: '15-03-2026',
    status: [2, 5, 8].includes(index) ? 'Not Completed' : 'Completed',
}))

const PosterHeader = () => (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-6 py-3">
        <div className="flex items-center gap-8">
            <img src={smallLogo} alt="Logo" className="h-11 w-11" />
            <nav className="flex items-center gap-8 text-sm font-medium">
                <Link to="/dashboard-poster" className="pb-2 text-[#FFFFFF80] hover:text-white">Dashboard</Link>
                <Link to="/dashboard-poster/requests" className="pb-2 text-[#FFFFFF80] hover:text-white">Request List</Link>
                <Link to="/calendar" className="pb-2 text-[#FFFFFF80] hover:text-white">Calendar</Link>
                <Link to="/dashboard-poster/reports" className="border-b border-[#8B3DFF] pb-2 text-[#8B3DFF]">Reports</Link>
                <Link to="/dashboard-poster/feedback" className="pb-2 text-[#FFFFFF80] hover:text-white">Feedback</Link>
            </nav>
        </div>

        <div className="flex items-center gap-6">
            <LogoutButton />
        </div>
    </header>
)

const Status = ({ status }) => {
    const completed = status === 'Completed'

    return (
        <span className={`inline-flex items-center gap-2 font-semibold ${completed ? 'text-[#20D18C]' : 'text-[#F20768]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${completed ? 'bg-[#20D18C]' : 'bg-[#F20768]'}`} />
            {status}
        </span>
    )
}

const ReportTable = ({ rows }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const filteredRows = rows.filter((row) => (
        `${row.eventName} ${row.eventType} ${row.eventVenue} ${row.status}`.toLowerCase().includes(searchTerm.toLowerCase())
    ))

    const handleDownload = (row) => {
        const csv = [
            'Event Name,Event Type,Event Venue,Event Date,Status',
            [row.eventName, row.eventType, row.eventVenue, row.eventDate, row.status].join(','),
        ].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${row.eventName.replaceAll(' ', '-')}-poster-report.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <section className="mt-4 rounded-lg border border-[#2a3347] bg-[#151c2c]">
            <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-4">
                <div className="flex h-9 w-[285px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#232A3C] px-3">
                    <Search size={14} className="text-[#8b93a4]" />
                    <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]" placeholder="Search events, venues" />
                </div>
                <button type="button" className="flex h-9 items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 text-xs text-white">
                    <Filter size={12} className="text-[#8b93a4]" />
                    Seminar
                </button>
                <button type="button" className="flex h-9 items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 text-xs text-white">
                    <Filter size={12} className="text-[#8b93a4]" />
                    Completed
                </button>
            </div>

            <div className="overflow-auto max-h-[calc(100vh-320px)] table-custom-scrollbar ">
                <table className="w-full text-left ">
                    <thead className="bg-[#1B2335] text-xs uppercase text-[#7f8799] sticky top-0">
                        <tr>
                            {['Event Name', 'Event Type', 'Event Venue', 'Event Date', 'Status', 'Action'].map((column) => (
                                <th key={column} className="px-5 py-4 font-semibold last:text-center">{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((row, index) => (
                            <tr key={`${row.eventName}-${index}`} className="border-t border-[#20283a] text-xs text-white">
                                <td className="px-5 py-4 font-medium">{row.eventName}</td>
                                <td className="px-5 py-4">{row.eventType}</td>
                                <td className="px-5 py-4">{row.eventVenue}</td>
                                <td className="px-5 py-4">{row.eventDate}</td>
                                <td className="px-5 py-4"><Status status={row.status} /></td>
                                <td className="px-5 py-4 text-center">
                                    <button type="button" onClick={() => handleDownload(row)} className="inline-flex text-[#8b93a7] hover:text-white" aria-label="Download report">
                                        <Download size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

const PosterReportsPage = () => {
    const [activeTab, setActiveTab] = useState('event')
    const isEventReport = activeTab === 'event'

    return (
        <section className="min-h-screen bg-[#0b1326] pt-16.25 text-white poppins">
            <PosterHeader />
            <main className="px-6 py-5">
                <h1 className="text-lg font-semibold">Reports</h1>
                <p className="mt-3 text-sm text-[#FFFFFF80]">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                </p>

                <div className="mt-5 flex border-b border-[#52596b]">
                    <button
                        type="button"
                        onClick={() => setActiveTab('event')}
                        className={`min-w-[175px] px-3 pb-3 cursor-pointer text-left text-base font-medium ${isEventReport ? 'border-b-2 border-[#8B3DFF] text-[#8B3DFF]' : 'text-white'}`}
                    >
                        Event Request Report
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('individual')}
                        className={`min-w-[205px] px-3 pb-3 cursor-pointer text-left text-base font-medium ${!isEventReport ? 'border-b-2 border-[#8B3DFF] text-[#8B3DFF]' : 'text-white'}`}
                    >
                        Individual Request Report
                    </button>
                </div>

                <ReportTable rows={isEventReport ? eventReportRows : individualReportRows} />
            </main>
        </section>
    )
}

export default PosterReportsPage
