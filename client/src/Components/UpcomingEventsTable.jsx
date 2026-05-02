import React from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'



const UpcomingEventsTable = ({ events, viewAllLink, title = "Upcoming Events" }) => {
    return (
        <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] w-[70%] h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
                <h2 className="text-white font-medium">{title}</h2>

                <Link to={viewAllLink} className="flex items-center gap-2 text-[#853FF9] hover:text-[#a76df9] cursor-pointer text-sm font-medium">
                    View All
                    <ArrowRight size={16} />
                </Link>
            </div>

            <div className="overflow-x-auto overflow-y-auto flex-1 table-custom-scrollbar">
                <table className="w-full text-left">
                    <thead className='sticky top-0 bg-[#151c2c]'>
                        <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
                            <th className="px-6 py-4 font-semibold">Event Name</th>
                            <th className="px-6 py-4 font-semibold">Event Type</th>
                            <th className="px-6 py-4 font-semibold">Event Date</th>
                            <th className="px-6 py-4 font-semibold">Dpt</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {events.map((event, index) => {
                            const isAcknowledged =
                                event.acknowledgeStatus === 'Acknowledged'

                            return (
                                <tr
                                    key={index}
                                    className="border-t border-[#20283a] text-sm text-white"
                                >
                                    <td className="px-6 py-4 font-medium whitespace-nowrap">{event.eventName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{event.eventType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{event.eventDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{event.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center gap-2 ${isAcknowledged ? 'text-[#34D399]' : 'text-[#B32058]'
                                                }`}
                                        >
                                            <span
                                                className={`h-2 w-2 rounded-full ${isAcknowledged ? 'bg-[#34D399]' : 'bg-[#B32058]'
                                                    }`}
                                            />
                                            {event.acknowledgeStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white">
                                            <ExternalLink size={17} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default UpcomingEventsTable