import React from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import ModuleIndividualDetailViewPage from '../../../Components/ModuleIndividualDetailViewPage'

const MediaIndividualDetailViewPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <DashboardHeader basePath="/dashboard-media" />
    <ModuleIndividualDetailViewPage
      basePath="/dashboard-media"
      breadcrumbLabel="Media Dashboard"
      title="Individual Media Request"
    />
  </section>
)

export default MediaIndividualDetailViewPage
