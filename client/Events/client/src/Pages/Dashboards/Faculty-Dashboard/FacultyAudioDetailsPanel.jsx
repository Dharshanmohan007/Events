import React from 'react'
import { FileText } from 'lucide-react'

const objectRequirements = [
  ['Hand Mic', '2'],
  ['Collar Mic', '1'],
  ['Expected Internet Users', '20'],
  ['Total Number of Guest WIFI Count', '20'],
]

const RequirementCard = ({ title, children }) => (
  <section className="rounded-lg border border-[#374155] bg-[#232A3B] p-5">
    <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#E6E2F0]">
      <FileText size={17} />
      {title}
    </div>
    {children}
  </section>
)

const KeyValueList = ({ items }) => (
  <div>
    {items.map(([label, value]) => (
      <div key={label} className="flex items-center justify-between border-b border-[#30384d]/60 py-3 text-sm last:border-b-0">
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className="font-medium text-[#E6E2F0]">{value}</span>
      </div>
    ))}
  </div>
)

const FacultyAudioDetailsPanel = () => {
  return (
    <div className="grid grid-cols-2 gap-5">
      <RequirementCard title="Object Requirement">
        <KeyValueList items={objectRequirements} />
      </RequirementCard>

      <RequirementCard title="Special Requirement">
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
        </p>
      </RequirementCard>
    </div>
  )
}

export default FacultyAudioDetailsPanel
