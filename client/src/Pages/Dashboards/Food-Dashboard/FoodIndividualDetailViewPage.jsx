import React from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import ModuleIndividualDetailViewPage from '../../../Components/ModuleIndividualDetailViewPage'

const FoodIndividualDetailViewPage = () => (
  <section className="min-h-screen bg-[#0b1326] poppins">
    <DashboardHeader basePath="/dashboard-food" />
    <ModuleIndividualDetailViewPage
      basePath="/dashboard-food"
      breadcrumbLabel="Food Dashboard"
      title="Individual Food Request"
    />
  </section>
)

export default FoodIndividualDetailViewPage
