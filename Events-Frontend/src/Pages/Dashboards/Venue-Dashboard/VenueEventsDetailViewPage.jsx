import React, { useState, useEffect } from 'react'
import { ChevronRight, Check } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import VenueHeader from './VenueHeader'
import FacultyVenueDetailsPanel from '../Faculty-Dashboard/FacultyVenueDetailsPanel'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const getStatusClassName = (status) => {
  if (status === 'Completed') return 'bg-[#4A2BB7]/35 text-[#A78BFA]'
  if (status === 'Pending for Acknowledge') return 'bg-[#5D1438]/50 text-[#FF4F91]'
  if (status === 'Acknowledged') return 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-[#ffffff]/80'
  if (status === 'Admin Canceled') return 'bg-yellow-700 text-[#FF4F91]'
  return 'bg-[#0e5149]/55 text-[#20D18C]'
}

const VenueEventsDetailViewPage = () => {
  const { eventId } = useParams()
  const [venueDetails, setVenueDetails] = useState(null)
  const [eventSchedule, setEventSchedule] = useState([])
  const [eventName, setEventName] = useState('')
  const [organizingDepartment, setOrganizingDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=venue`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch venue details')

        const eventData = payload.data || payload
        if (!eventData.venueDetails) throw new Error('Venue details are not available')

        setVenueDetails(eventData.venueDetails)
        const eventDetails = eventData.requestDetails?.eventDetails || {}
        setEventName(eventDetails.eventName || 'Event Details')
        setEventSchedule(eventDetails.eventSchedule || [])
        setOrganizingDepartment(eventDetails.organizingDepartment || '')

        const venueStatus = eventData.venueDetails.status?.status
        if (venueStatus) {
          setStatus(venueStatus)
        } else {
          setStatus(eventData.status || 'Submitted')
        }
      } catch (err) {
        console.error('Failed to fetch venue details:', err)
        setError(err.message || 'Failed to fetch venue details')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [eventId, reloadKey])

  const handleStatusUpdate = async (action) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, module: 'venue' }),
      })
      const responseData = await res.json()
      if (!res.ok || !responseData.success) throw new Error(responseData.message || `Failed to ${action}`)
      toast.success(`Status updated to ${action === 'acknowledge' ? 'Acknowledged' : 'Completed'} successfully`)
      setStatus(action === 'acknowledge' ? 'Acknowledged' : 'Completed')
      setReloadKey((k) => k + 1)
    } catch (err) {
      toast.error(err.message || `Failed to ${action}`)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-[#0b1326] text-white poppins">
      <VenueHeader />

      <main className="h-[93vh] px-7 pt-2">
        <header className="mt-4 flex items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <Link to="/dashboard-venue" className="text-md font-medium text-[#CBC3D7]/50 transition hover:text-white">Event Details</Link>
            <ChevronRight size={16} />
            <h1 className="text-md font-medium text-[#D0BCFF]">{eventName || 'Event Details'}</h1>
            {organizingDepartment && (
              <span className="ml-3 rounded-full bg-green-400/10 px-5 py-2 text-sm text-[#10B981]">{organizingDepartment}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {status === 'Pending for Acknowledge' && (
              <button
                onClick={() => handleStatusUpdate('acknowledge')}
                disabled={actionLoading}
                className="flex items-center gap-1 rounded-md bg-gradient-to-r from-[#07785D] to-[#07785D] px-4 py-1 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={16} /> {actionLoading ? 'Processing...' : 'Acknowledge'}
              </button>
            )}
            {status === 'Acknowledged' && (
              <button
                onClick={() => handleStatusUpdate('complete')}
                disabled={actionLoading}
                className="flex items-center gap-1 rounded-md bg-gradient-to-r from-[#4A2BB7] to-[#6D3BD8] px-4 py-1 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={16} /> {actionLoading ? 'Processing...' : 'Complete'}
              </button>
            )}
          </div>
        </header>

        <section className="mt-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-medium text-[#CBC3D7]/65">
            <span className={`h-3 w-3 rounded-full ${status === 'Completed' ? 'bg-[#6D3BD8]' : status === 'Acknowledged' ? 'bg-[#25A987]' : 'bg-[#B32058]'}`} />
            {status === 'Completed' ? 'COMPLETED' : status === 'Acknowledged' ? 'ACKNOWLEDGED' : 'PENDING'} (1)
          </div>
        </section>

        <section className="mt-3 overflow-hidden">
          <section className="max-h-[calc(100vh-170px)] overflow-auto rounded-lg border border-[#27334c] bg-[#151d31] p-5 table-custom-scrollbar">
            {loading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading venue details...</p>
            ) : error ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{error}</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-[#8B3DFF]">Venue Details</h2>
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
                  <FacultyVenueDetailsPanel
                    venueDetails={venueDetails}
                    eventSchedule={eventSchedule}
                  />
                </div>
              </>
            )}
          </section>
        </section>
      </main>
    </section>
  )
}

export default VenueEventsDetailViewPage
