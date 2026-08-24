import React, { useEffect, useState } from 'react'

import IndividualFoodDetailPage from '../IndividualFoodDetailPage'
import IndividualPurchaseDetailPage from '../IndividualPurchaseDetailPage'
import IndividualTrasnportDetailPage from '../IndividualTrasnportDetailPage'
import IndividualMediaDetailPage from '../IndividualMediaDetailPage'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const AdminIndividualDetailView = () => {

    const apiUrl = import.meta.env.VITE_API_BASE_URL
    const { eventId } = useParams()

    console.log("id ", eventId)


    // token 
    const token = localStorage.getItem('token');

    const [data, setData] = useState([]);
    const [formType, setFormType] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`${apiUrl}/api/individual-submissions/getrequest/${eventId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setData(res.data.data);
                setFormType(res.data.data[0].formType);
            } catch (err) {
                console.error("error occured while fetching invidiual details page data : ", err)
            }
        }

        fetchData()


    }, [eventId])

    // console.log("individual data : ", data[0])
    // console.log("Form type  : ", formType)

    return (
        <div className="main-container text-white p-5">

            {formType?.toLowerCase() == "food" && <IndividualFoodDetailPage data={data[0]} />}
            {formType?.toLowerCase() == "purchase" && <IndividualPurchaseDetailPage data={data[0]} />}


            {/* <IndividualTrasnportDetailPage /> */}
            {/* <IndividualMediaDetailPage /> */}

        </div>
    )
}

export default AdminIndividualDetailView