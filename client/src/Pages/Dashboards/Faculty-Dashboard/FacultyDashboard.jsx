import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import FacultyDahsboardHeader from './FacultyDahsboardHeader'
import FacultyDraft from './FacultyDraft'
import FacultyLatestEventsRequestTable from './FacultyLatestEventsRequestTable'
import FacultyQuickActions from './FacultyQuickActions'
import FacultyStatcard from './FacultyStatcard'
import FacultyVenueAvailability from './FacultyVenueAvailability'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const FacultyDashboard = () => {
    const [draftData, setDraftData] = useState(null)

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                const decoded = jwtDecode(token)
                const userId = decoded.facultyId

                const res = await fetch(`${API_BASE_URL}/api/events/draft/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const data = await res.json()
                if (data.success && data.totalDrafts > 0) {
                    setDraftData(data)
                }
            } catch (err) {
                console.error('Failed to fetch drafts:', err)
            }
        }

        fetchDrafts()
    }, [])

    return (
        <section className="min-h-screen bg-[#0b1326] poppins">
            <FacultyDahsboardHeader />

            <main className="px-6 pb-8">
                <div className="mt-4 flex items-start justify-between gap-5">
                    <div>
                        <h1 className="text-white text-lg font-medium">Faculty Dashboard Overview</h1>
                        <p className="text-[#FFFFFF80] text-sm">
                            Quick access to your key insights and updates. 
                        </p>
                    </div>

                    <Link
                        to="/forms"
                        className="flex items-center gap-2 rounded-md bg-linear-to-r from-[#853FF9] to-[#4F2593] hover:bg-linear-to-l hover:from-[#853FF9] hover:to-[#4F2593] px-3 py-2  font-medium text-white transition-all duration-300 "
                    >
                        <Plus size={22} />
                        New Event
                    </Link>
                </div>

                {draftData && <FacultyDraft data={draftData} />}
                <FacultyStatcard />
                <FacultyQuickActions />

                <div className="mt-4 grid grid-cols-2 gap-5  rounded-lg  ">
                    <FacultyVenueAvailability />
                    <FacultyLatestEventsRequestTable />
                </div>
            </main>
        </section>
    )
}

export default FacultyDashboard
