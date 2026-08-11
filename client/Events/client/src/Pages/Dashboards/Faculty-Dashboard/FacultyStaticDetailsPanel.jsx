import React from 'react'
import { FacultySectionCard } from './FacultyDetailsPanelShared'

const FacultyStaticDetailsPanel = ({ activeTab }) => {
  return (
    <FacultySectionCard title={activeTab}>
      <p className="text-sm leading-7 text-[#CBC3D7]/70">
        This department detail section is static for now. The live form data for this request can be connected here when the corresponding module is ready.
      </p>
    </FacultySectionCard>
  )
}

export default FacultyStaticDetailsPanel
