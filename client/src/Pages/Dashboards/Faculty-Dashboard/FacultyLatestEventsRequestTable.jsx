import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink, ListFilter } from 'lucide-react'

const events = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    eventName: 'Welcome Freshers',
    eventType: 'Seminar',
    eventDate: '15-03-2026',
    status: index === 1 ? 'Pending Approval' : 'Approved',
}))

const Status = ({ status }) => {
    const isApproved = status === 'Approved'

    return (
        <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${isApproved ? 'text-[#20D18C]' : 'text-[#F20768]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isApproved ? 'bg-[#20D18C]' : 'bg-[#F20768]'}`} />
            {status}
        </span>
    )
}

const FacultyLatestEventsRequestTable = () => {
    return (
        <section className="rounded-lg border border-[#263044] bg-[#151d2d]">
            <div className="flex items-center justify-between px-4 py-4">
                <h2 className="text-sm font-semibold text-white">Latest Events Request</h2>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 rounded-md bg-[#222b3d] px-3 py-2 text-[10px] text-white">
                        <ListFilter size={12} />
                        Filters
                    </button>
                    <Link to="/dashboard-faculty/events" className="flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6]">
                        View All
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>

            <div className="overflow-auto">
                <table className="w-full min-w-[520px]">
                    <thead className="bg-[#1b2435]">
                        <tr>
                            {['EVENT NAME', 'EVENT TYPE', 'EVENT DATE', 'STATUS', 'ACTION'].map((column) => (
                                <th key={column} className="px-4 py-3 text-left text-[10px] font-semibold text-[#FFFFFF66]">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id} className="border-b border-[#222b3d] last:border-b-0">
                                <td className="px-4 py-3 text-[12px] font-medium text-white">{event.eventName}</td>
                                <td className="px-4 py-3 text-[12px] text-white">{event.eventType}</td>
                                <td className="px-4 py-3 text-[12px] text-white">{event.eventDate}</td>
                                <td className="px-4 py-3"><Status status={event.status} /></td>
                                <td className="px-4 py-3">
                                    <Link to={`/dashboard-faculty/events/detailView/${event.id}`} className="inline-flex text-[#FFFFFF80] transition hover:text-white" title="Open event">
                                        <ExternalLink size={14} />
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

export default FacultyLatestEventsRequestTable
