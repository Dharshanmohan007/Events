import React from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import ModuleIndividualDetailViewPage from '../../../Components/ModuleIndividualDetailViewPage'

const TransportIndividualDetailViewPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <DashboardHeader basePath="/dashboard-transports" />
    <ModuleIndividualDetailViewPage
      basePath="/dashboard-transports"
      breadcrumbLabel="Transport Dashboard"
      title="Individual Transport Request"
    />
  </section>
)

export default TransportIndividualDetailViewPage
