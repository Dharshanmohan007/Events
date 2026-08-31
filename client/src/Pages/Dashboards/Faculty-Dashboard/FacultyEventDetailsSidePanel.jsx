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

const FacultyEventDetailsSidePanel = ({ tabs, activeTab, onTabChange }) => {
  return (
    <aside className="w-[310px] shrink overflow-auto  rounded-lg border border-[#27334c]  max-h-[calc(100vh-170px)]  bg-[#151d31] p-4 table-custom-scrollbar">
      <nav className="space-y-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name
          const statusColor = getStatusBadgeColor(tab.status)

          return (
            <button
              key={tab.name}
              type="button"
              onClick={() => onTabChange(tab.name)}
              className={`relative flex min-h-[45px] w-full items-center justify-between overflow-hidden rounded-md px-3 text-left font- text-sm text-white transition ${isActive ? 'bg-[#28264D]' : 'bg-[#232b3f] hover:bg-[#2b344b]'}`}
            >
              {statusColor && (
                <span className={`absolute left-0 top-0 h-full w-1 ${statusColor}`} />
              )}
              <span>{tab.name}</span>
              <ChevronRight size={18} />
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default FacultyEventDetailsSidePanel
