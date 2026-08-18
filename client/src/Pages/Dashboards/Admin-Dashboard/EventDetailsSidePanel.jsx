import React from 'react'
import { ChevronRight } from 'lucide-react'

const getStatusBadgeColor = (status) => {
  if (!status) return ''
  const s = String(status).toLowerCase()
  if (s.includes('acknowledged')) return 'bg-[#25A987]'
  if (s.includes('pending')) return 'bg-[#B32058]'
  if (s.includes('completed')) return 'bg-[#6D3BD8]'
  return ''
}

const EventDetailsSidePanel = ({ tabs = [], activeTab, onTabChange }) => {
  if (tabs.length === 0) {
    return (
      <aside className="w-[20%] shrink-0 rounded-lg border border-[#27334c] bg-[#151d31] p-4">
        <p className="text-xs text-[#CBC3D7]/50 text-center py-4">No tabs available</p>
      </aside>
    )
  }

  return (
    <aside className="w-[20%] max-h-[calc(100vh-130px)] overflow-auto table-custom-scrollbar shrink-0 rounded-lg border border-[#27334c] bg-[#151d31] p-4">
      <nav className="space-y-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name
          const statusColor = getStatusBadgeColor(tab.status)

          return (
            <button
              key={tab.name}
              type="button"
              onClick={() => onTabChange(tab.name)}
              className={`relative flex min-h-11 w-full items-center justify-between overflow-hidden rounded-md px-3 text-left text-xs font-semibold text-white transition ${
                isActive
                  ? 'bg-gradient-to-r from-[#7C3AE7] to-[#4E2593] shadow-[0_10px_22px_rgba(124,58,231,0.24)]'
                  : 'bg-[#232b3f] hover:bg-[#2b344b]'
              }`}
            >
              {statusColor && (
                <span className={`absolute left-0 top-0 h-full w-1 ${statusColor}`} />
              )}
              <span>{tab.name}</span>
              <ChevronRight size={14} />
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default EventDetailsSidePanel
