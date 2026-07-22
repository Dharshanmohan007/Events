import React, { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import FacultyFoodRefreshmentDetailsPanel from '../Faculty-Dashboard/FacultyFoodRefreshmentDetailsPanel'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const getStatusClassName = (status) => {
  if (status === 'Completed') return 'bg-[#4A2BB7]/35 text-[#A78BFA]'
  if (status === 'Pending for Acknowledge') return 'bg-[#5D1438]/50 text-[#FF4F91]'
  if (status === 'Acknowledged') return 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-[#ffffff]/80'
  if (status === 'Admin Canceled') return 'bg-yellow-700 text-[#FF4F91]'
  return 'bg-[#0e5149]/55 text-[#20D18C]'
}

const FoodEventsDetailViewPage = () => {
  const { eventId } = useParams()
  const [refreshmentDetails, setRefreshmentDetails] = useState(null)
  const [eventSchedule, setEventSchedule] = useState([])
  const [eventName, setEventName] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=refreshment`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch food details')

        const eventData = payload.data || payload
        if (!eventData.refreshmentDetails) throw new Error('Food details are not available')

        setRefreshmentDetails(eventData.refreshmentDetails)
        setEventName(eventData.requestDetails?.eventDetails?.eventName || 'Event Details')
        setEventSchedule(eventData.requestDetails?.eventDetails?.eventSchedule || [])

        const foodStatus = eventData.refreshmentDetails.status?.status
        if (foodStatus) {
          setStatus(foodStatus)
        } else {
          setStatus(eventData.status || 'Submitted')
        }
      } catch (err) {
        console.error('Failed to fetch food details:', err)
        setError(err.message || 'Failed to fetch food details')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [eventId])

  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <DashboardHeader basePath="/dashboard-food" />

      <main className="px-6 pb-8">
        <div className="flex items-center gap-2 py-3 text-sm text-[#CBC3D7]/50">
          <Link to="/dashboard-food" className="hover:text-white transition-colors">
            Food Dashboard
          </Link>
          <ChevronRight size={14} />
          <span className="text-[#D0BCFF]">{eventName || 'Food Details'}</span>
        </div>

        <section className="mt-2 rounded-lg border border-[#27334c] bg-[#151d31] p-6">
          {loading ? (
            <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading food details...</p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-[#FF4F91]">{error}</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-[#8B3DFF]">Food Details</h2>
                  <p className="mt-2 text-xs leading-6 text-[#CBC3D7]/55">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                  </p>
                </div>
                {status && (
                  <span className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium ${getStatusClassName(status)}`}>
                    {status}
                  </span>
                )}
              </div>

              <div className="mt-8">
                <FacultyFoodRefreshmentDetailsPanel
                  refreshmentDetails={refreshmentDetails}
                  eventSchedule={eventSchedule}
                />
              </div>
            </>
          )}
        </section>
      </main>
    </section>
  )
}

export default FoodEventsDetailViewPage
