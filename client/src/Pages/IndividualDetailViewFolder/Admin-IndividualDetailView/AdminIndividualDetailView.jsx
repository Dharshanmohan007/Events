import React from 'react'

import IndividualFoodDetailPage from '../IndividualFoodDetailPage'
import IndividualPurchaseDetailPage from '../IndividualPurchaseDetailPage'
import IndividualTrasnportDetailPage from '../IndividualTrasnportDetailPage'
import IndividualMediaDetailPage from '../IndividualMediaDetailPage'

const AdminIndividualDetailView = () => {

    return (
        <div className="main-container text-white p-5">
            {/* <IndividualFoodDetailPage /> */}
            {/* <IndividualPurchaseDetailPage /> */}
            {/* <IndividualTrasnportDetailPage /> */}
            <IndividualMediaDetailPage />

        </div>
    )
}

export default AdminIndividualDetailView