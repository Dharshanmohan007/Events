import React from 'react'
import { ArrowRight, ExternalLink, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

const getStatusColor = (status = '') => {
    const normalizedStatus = String(status).toLowerCase()
    if (normalizedStatus.includes('rejected')) return { text: 'text-red-400', dot: 'bg-red-400' }
    if (normalizedStatus.includes('acknowledged')) return { text: 'text-emerald-400', dot: 'bg-emerald-400' }
    if (normalizedStatus.includes('approved')) return { text: 'text-emerald-400', dot: 'bg-emerald-400' }
    if (normalizedStatus.includes('pending')) return { text: 'text-pink-600', dot: 'bg-pink-600' }
    if (normalizedStatus.includes('submitted')) return { text: 'text-yellow-400', dot: 'bg-yellow-400' }
    if (normalizedStatus.includes('completed')) return { text: 'text-emerald-400', dot: 'bg-emerald-400' }
    return { text: 'text-white', dot: 'bg-white' }
}

const StatusBadge = ({ status }) => {
    const { text, dot } = getStatusColor(status)
    return (
        <span className={`inline-flex items-center gap-2 ${text}`}>
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            {status}
        </span>
    )
}

const FoodRequestTable = ({
    requests,
    viewAllLink,
    title = 'Upcoming Food & Catering Requests',
}) => {
    return (
        <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] w-[70%] h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
                <h2 className="text-white font-medium text-sm">{title}</h2>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-md bg-[#1b2335] px-3 py-2 text-xs text-[#8b93a7] hover:text-white">
                        <SlidersHorizontal size={13} />
                        Filters
                    </button>

                    <Link
                        to={viewAllLink}
                        className="flex items-center gap-2 text-[#853FF9] hover:text-[#a76df9] cursor-pointer text-sm font-medium"
                    >
                        View All
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto flex-1 table-custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-[#151c2c]">
                        <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
                            <th className="px-6 py-4 font-semibold">Event Name & Date</th>
                            <th className="px-6 py-4 font-semibold">Department</th>
                            <th className="px-6 py-4 font-semibold">Service Type</th>
                            <th className="px-6 py-4 font-semibold">Expected Count</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {requests.map((request, index) => {
                            return (
                                <tr
                                    key={index}
                                    className="border-t border-[#20283a] text-sm text-white whitespace-nowrap"
                                >
                                    <td className="px-6 py-4 font-medium">
                                        {request.eventName}
                                    </td>

                                    <td className="px-6 py-4">
                                        {request.department}
                                    </td>

                                    <td className="px-6 py-4">
                                        {request.type}
                                    </td>

                                    <td className="px-6 py-4">
                                        {request.expectedCount}
                                    </td>

                                    <td className="px-6 py-4">
                                        <StatusBadge status={request.acknowledgeStatus} />
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

export default FoodRequestTable