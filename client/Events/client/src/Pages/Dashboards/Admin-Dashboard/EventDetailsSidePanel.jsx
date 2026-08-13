import React from 'react'
import { ChevronRight } from 'lucide-react'

export const eventDetailsTabs = [
    'Event Requisition Details',
    'Venue Details',
    'ICTCS Details',
    'Audio Details',
    'Transportation Details',
    'Food Details',
    'Accommodation Details',
    'Purchase Details',
    'Media Details',
]

const EventDetailsSidePanel = ({ activeTab, onTabChange }) => {
    return (
        <aside className="w-[20%] max-h-[calc(100vh-150px)] overflow-auto table-custom-scrollbar shrink-0 rounded-lg border border-[#27334c] bg-[#151d31] p-4">
            <nav className="space-y-3">
                {eventDetailsTabs.map((tab) => {
                    const isActive = activeTab === tab

                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => onTabChange(tab)}
                            className={`flex min-h-11 w-full items-center justify-between rounded-md px-3 text-left text-xs font-semibold text-white transition ${isActive
                                ? 'bg-linear-to-r from-[#7C3AE7] to-[#4E2593] shadow-[0_10px_22px_rgba(124,58,231,0.24)]'
                                : 'bg-[#232b3f] hover:bg-[#2b344b]'
                                }`}
                        >
                            <span>{tab}</span>
                            <ChevronRight size={14} />
                        </button>
                    )
                })}
            </nav>
        </aside>
    )
}

export default EventDetailsSidePanel
