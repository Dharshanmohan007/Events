import React from 'react'
import { FileText } from 'lucide-react'

export const FacultyKeyValueGrid = ({ items }) => (
  <div className="grid grid-cols-2 gap-x-8 rounded-lg border border-[#374155] bg-[#232A3B] p-5">
    {items.map(([label, value]) => (
      <div key={label} className="flex items-center justify-between border-b border-[#30384d]/60 py-3 text-sm last:border-b-0 even:last:border-b-0">
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className="text-right font-medium text-[#E6E2F0]">{value}</span>
      </div>
    ))}
  </div>
)

export const FacultySectionCard = ({ icon = FileText, title, children }) => {
  const IconComponent = icon

  return (
    <section className="rounded-lg border border-[#374155] bg-[#232A3B] p-5">
      <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#E6E2F0]">
        <IconComponent size={17} />
        {title}
      </div>
      {children}
    </section>
  )
}
