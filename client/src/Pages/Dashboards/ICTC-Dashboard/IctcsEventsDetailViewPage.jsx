import React, { useState, useEffect } from 'react'
import { ChevronRight, Check } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import DashboardHeader from './DashboardHeader'
import FacultyIctcsDetailsPanel from '../Faculty-Dashboard/FacultyIctcsDetailsPanel'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const getStatusClassName = (status) => {
  if (status === 'Completed') return 'bg-[#4A2BB7]/35 text-[#A78BFA]'
  if (status === 'Pending for Acknowledge') return 'bg-[#5D1438]/50 text-[#FF4F91]'
  if (status === 'Acknowledged') return 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-[#ffffff]/80'
  if (status === 'Admin Canceled') return 'bg-yellow-700 text-[#FF4F91]'
  return 'bg-[#0e5149]/55 text-[#20D18C]'
}

const IctcsEventsDetailViewPage = () => {
  const { eventId } = useParams()
  const [ictsDetails, setIctsDetails] = useState(null)
  const [eventSchedule, setEventSchedule] = useState([])
  const [eventName, setEventName] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=icts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch ICTS details')

        const eventData = payload.data || payload
        if (!eventData.ictsDetails) throw new Error('ICTS details are not available')

        setIctsDetails(eventData.ictsDetails)
        setEventName(eventData.requestDetails?.eventDetails?.eventName || 'Event Details')
        setEventSchedule(eventData.requestDetails?.eventDetails?.eventSchedule || [])

        const ictsStatus = eventData.ictsDetails.status?.status
        if (ictsStatus) {
          setStatus(ictsStatus)
        } else {
          setStatus(eventData.status || 'Submitted')
        }
      } catch (err) {
        console.error('Failed to fetch ICTS details:', err)
        setError(err.message || 'Failed to fetch ICTS details')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [eventId])

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
        body: JSON.stringify({ action, module: 'icts' }),
      })
      const responseData = await res.json()
      if (!res.ok || !responseData.success) throw new Error(responseData.message || `Failed to ${action}`)
      toast.success(`Status updated to ${action === 'acknowledge' ? 'Acknowledged' : 'Completed'} successfully`)
      setStatus(action === 'acknowledge' ? 'Acknowledged' : 'Completed')
    } catch (err) {
      toast.error(err.message || `Failed to ${action}`)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <DashboardHeader />

      <main className="px-6 pb-8">
        <div className="flex items-center gap-2 py-3 text-sm text-[#CBC3D7]/50">
          <Link to="/dashboard-ictcs" className="hover:text-white transition-colors">
            ICTCS Dashboard
          </Link>
          <ChevronRight size={14} />
          <span className="text-[#D0BCFF]">{eventName || 'ICTCS Details'}</span>
        </div>

        <section className="mt-2 rounded-lg border border-[#27334c] bg-[#151d31] p-6">
          {loading ? (
            <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading ICTS details...</p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-[#FF4F91]">{error}</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-[#8B3DFF]">ICTCS Details</h2>
                  <p className="mt-2 text-xs leading-6 text-[#CBC3D7]/55">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {status === 'Pending for Acknowledge' && (
                    <button
                      onClick={() => handleStatusUpdate('acknowledge')}
                      disabled={actionLoading}
                      className="flex items-center gap-1 bg-gradient-to-r from-[#07785D] to-[#07785D] text-white px-4 py-1 rounded-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={16} className="text-white" /> {actionLoading ? 'Processing...' : 'Acknowledge'}
                    </button>
                  )}
                  {status === 'Acknowledged' && (
                    <button
                      onClick={() => handleStatusUpdate('complete')}
                      disabled={actionLoading}
                      className="flex items-center gap-1 bg-gradient-to-r from-[#4A2BB7] to-[#6D3BD8] text-white px-4 py-1 rounded-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={16} className="text-white" /> {actionLoading ? 'Processing...' : 'Complete'}
                    </button>
                  )}
                  {status && (
                    <span className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium ${getStatusClassName(status)}`}>
                      {status}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <FacultyIctcsDetailsPanel
                  ictsDetails={ictsDetails}
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

export default IctcsEventsDetailViewPage
