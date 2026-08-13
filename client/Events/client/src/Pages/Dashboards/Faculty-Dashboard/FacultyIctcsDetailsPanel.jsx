import React from 'react'
import { Monitor } from 'lucide-react'
import { FacultyKeyValueGrid, FacultySectionCard } from './FacultyDetailsPanelShared'

const FacultyIctcsDetailsPanel = ({ ictsDetails, specialRequirement }) => {
  return (
    <div className="space-y-5">
      <FacultySectionCard title="Basic Requirement" icon={Monitor}>
        <FacultyKeyValueGrid items={ictsDetails} />
      </FacultySectionCard>

      <FacultySectionCard title="Special Requirement">
        <p className="text-sm leading-7 text-[#E6E2F0]">{specialRequirement}</p>
      </FacultySectionCard>
    </div>
  )
}

export default FacultyIctcsDetailsPanel
