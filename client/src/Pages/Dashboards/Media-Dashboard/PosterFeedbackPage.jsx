import React, { useState } from 'react'
import { Bell, CircleQuestionMark, ExternalLink, Filter, Search, Settings, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import smallLogo from '../../../assets/small-logo.svg'
import profileAvatar from '../../../assets/profile-avatar.svg'
import PosterFeedbackPoupu from './PosterFeedbackPoupu'

const baseFeedback = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"

const eventFeedbackRows = Array.from({ length: 11 }, (_, index) => ({
    eventName: 'Welcome Freshers',
    department: 'CSE',
    eventDate: '15-03-2026',
    eventDateRange: '15-03-2026 / 18-03-2026',
    eventVenue: 'Main Board Room',
    rating: index % 3 === 0 ? 4 : 2,
    feedback: 'Lorem Ipsum is simply dummy text of the printing and..............',
    fullFeedback: baseFeedback,
}))

const individualFeedbackRows = Array.from({ length: 11 }, (_, index) => ({
    eventName: 'Dharsan',
    department: 'CSE',
    eventDate: '15-03-2026',
    eventDateRange: '15-03-2026 / 18-03-2026',
    eventVenue: index % 2 === 0 ? 'Main Board Room' : 'Vista Hall',
    rating: index % 4 === 0 ? 5 : 4,
    feedback: 'Lorem Ipsum is simply dummy text of the printing and..............',
    fullFeedback: baseFeedback,
}))

const ratingSummary = [
    { label: '5 star', value: 10 },
    { label: '4 star', value: 10 },
    { label: '3 star', value: 10 },
    { label: '2 star', value: 10 },
    { label: '1 star', value: 10 },
]

const PosterHeader = () => (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-6 py-3">
        <div className="flex items-center gap-8">
            <img src={smallLogo} alt="Logo" className="h-11 w-11" />
            <nav className="flex items-center gap-8 text-sm font-medium">
                <Link to="/dashboard-poster" className="pb-2 text-[#FFFFFF80] hover:text-white">Dashboard</Link>
                <Link to="/dashboard-poster/requests" className="pb-2 text-[#FFFFFF80] hover:text-white">Request List</Link>
                <span className="pb-2 text-[#FFFFFF80]">Calendar</span>
                <Link to="/dashboard-poster/reports" className="pb-2 text-[#FFFFFF80] hover:text-white">Reports</Link>
                <Link to="/dashboard-poster/feedback" className="border-b border-[#8B3DFF] pb-2 text-[#8B3DFF]">Feedback</Link>
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

const FeedbackTable = ({ activeTab, onTabChange, onOpenFeedback }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const isEventFeedback = activeTab === 'event'
    const rows = isEventFeedback ? eventFeedbackRows : individualFeedbackRows
    const filteredRows = rows.filter((row) => (
        `${row.eventName} ${row.department} ${row.eventVenue} ${row.feedback}`.toLowerCase().includes(searchTerm.toLowerCase())
    ))

    return (
        <section className="flex h-full min-h-0 flex-col rounded-lg border border-[#2a3347] bg-[#151c2c]">
            <div className="flex flex-wrap items-center gap-3 px-4 py-4">
                <button
                    type="button"
                    onClick={() => onTabChange('event')}
                    className={`h-10 rounded-md px-5 text-xs font-semibold ${isEventFeedback ? 'bg-[#8B3DFF] text-white' : 'bg-[#232A3C] text-white'}`}
                >
                    Event request Feedback
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange('individual')}
                    className={`h-10 rounded-md px-5 text-xs font-semibold ${!isEventFeedback ? 'bg-[#8B3DFF] text-white' : 'bg-[#232A3C] text-white'}`}
                >
                    Individual Request Feedback
                </button>

                <div className="ml-auto flex h-9 w-[285px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#232A3C] px-3">
                    <Search size={14} className="text-[#8b93a4]" />
                    <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]" placeholder="Search events, venues" />
                </div>
                <button type="button" className="flex h-9 items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 text-xs text-white">
                    <Filter size={12} className="text-[#8b93a4]" />
                    Department
                </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto table-custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-[#1B2335] text-xs uppercase text-[#7f8799]">
                        <tr>
                            {['Event Name', 'Department', 'Event Date', 'Rating', 'Feedback', 'Action'].map((column) => (
                                <th key={column} className="px-4 py-4 font-semibold last:text-center">{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((row, index) => (
                            <tr key={`${row.eventName}-${index}`} className="border-t border-[#20283a] text-xs text-white">
                                <td className="px-4 py-3 font-medium">{row.eventName}</td>
                                <td className="px-4 py-3">{row.department}</td>
                                <td className="px-4 py-3">{row.eventDate}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1">
                                        <Star size={12} className="text-[#FFC107]" fill="currentColor" />
                                        {row.rating}
                                    </span>
                                </td>
                                <td className="px-4 py-3">{row.feedback}</td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        type="button"
                                        onClick={() => onOpenFeedback(row)}
                                        className="inline-flex text-[#8b93a7] hover:text-white"
                                        aria-label="Open feedback details"
                                    >
                                        <ExternalLink size={15} />
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

const OverallRating = () => (
    <section className="flex min-h-0 flex-col rounded-lg border border-[#2a3347] bg-[#151c2c] p-5">
        <h2 className="text-base font-semibold text-white">Overall Rating</h2>
        <div className="flex flex-1 items-center justify-center">
            <div
                className="flex h-44 w-44 items-center justify-center rounded-full"
                style={{ background: 'conic-gradient(#8B3DFF 82%, #E5E7EB 82%)' }}
            >
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#151c2c] text-2xl font-bold text-white">
                    4.1 / 5
                </div>
            </div>
        </div>
    </section>
)

const SatisfactionSummary = () => (
    <section className="flex min-h-0 flex-col rounded-lg border border-[#2a3347] bg-[#151c2c] p-5">
        <h2 className="text-base font-semibold text-white">Satisfaction Summary</h2>
        <div className="mt-5 flex flex-1 flex-col justify-between">
            {ratingSummary.map((item, index) => (
                <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-white">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#343b4a]">
                        <div className="h-1.5 rounded-full bg-[#8B3DFF]" style={{ width: `${90 - index * 8}%` }} />
                    </div>
                </div>
            ))}
        </div>
    </section>
)

const PosterFeedbackPage = () => {
    const [activeTab, setActiveTab] = useState('event')
    const [selectedFeedback, setSelectedFeedback] = useState(null)

    return (
        <section className="min-h-screen bg-[#0b1326] pt-16.25 text-white poppins">
            <PosterHeader />
            <main className="px-6 py-3">
                <h1 className="text-lg font-medium">Feedback & Rating</h1>
                <p className="mt-1 text-sm text-[#FFFFFF80]">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                </p>

                <div className="mt-5 grid h-[calc(100vh-165px)]  grid-cols-12 items-stretch gap-5">
                    <div className="h-full min-h-0 col-span-9">
                        <div className="sr-only" aria-label="Feedback tabs">
                            <button type="button" onClick={() => setActiveTab('event')}>Event request Feedback</button>
                            <button type="button" onClick={() => setActiveTab('individual')}>Individual Request Feedback</button>
                        </div>
                        <FeedbackTable activeTab={activeTab} onTabChange={setActiveTab} onOpenFeedback={setSelectedFeedback} />
                    </div>

                    <aside className="grid min-h-0 col-span-3 grid-rows-2 gap-4">
                        <OverallRating />
                        <SatisfactionSummary />
                    </aside>
                </div>
            </main>

            {selectedFeedback && (
                <PosterFeedbackPoupu feedback={selectedFeedback} onClose={() => setSelectedFeedback(null)} />
            )}
        </section>
    )
}

export default PosterFeedbackPage
