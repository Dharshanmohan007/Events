import React from 'react'
import { ChevronRight } from 'lucide-react'

const FacultyEventDetailsSidePanel = ({ tabs, activeTab, onTabChange }) => {
  return (
    <aside className="w-[310px] shrink overflow-auto  rounded-lg border border-[#27334c]  max-h-[calc(100vh-170px)]  bg-[#151d31] p-4 table-custom-scrollbar">
      <nav className="space-y-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name

          return (
            <button
              key={tab.name}
              type="button"
              onClick={() => onTabChange(tab.name)}
              style={{ borderLeftColor: tab.color }}
              className={`flex min-h-[45px] w-full items-center justify-between rounded-md border-l-2 px-3 text-left font- text-sm text-white transition ${isActive ? 'bg-[#28264D]' : 'bg-[#232b3f] hover:bg-[#2b344b]'}`}
            >
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
