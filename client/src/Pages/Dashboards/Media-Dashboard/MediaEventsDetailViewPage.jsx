import React, { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import MediaDetailView from '../../../Components/MediaDetailView'
import { deriveMediaStatus } from './MediaDashboard'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const getStatusClassName = (status) => {
  if (!status || status === '-') return 'bg-[#0e5149]/55 text-[#20D18C]'
  const s = String(status).toLowerCase()
  if (s === 'completed') return 'bg-[#4A2BB7]/35 text-[#A78BFA]'
  if (s.includes('pending')) return 'bg-[#5D1438]/50 text-[#FF4F91]'
  if (s === 'acknowledged') return 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-[#ffffff]/80'
  if (s === 'admin canceled') return 'bg-yellow-700 text-[#FF4F91]'
  return 'bg-[#0e5149]/55 text-[#20D18C]'
}

const MediaEventsDetailViewPage = () => {
  const { eventId } = useParams()
  const [mediaDetails, setMediaDetails] = useState(null)
  const [eventName, setEventName] = useState('')
  const [organizingDepartment, setOrganizingDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}?module=media`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        )
        const payload = await res.json()
        if (!res.ok) {
          throw new Error(payload.message || 'Failed to fetch media details')
        }

        const eventData = payload.data || payload

        // Read media payload defensively
        const detailData =
          eventData.mediaRequirementDetails || eventData.mediaDetails || null

        if (!detailData) {
          throw new Error('Media details are not available')
        }

        setMediaDetails(detailData)

        // Try to get event name from requestDetails if available
        setEventName(
          eventData.requestDetails?.eventDetails?.eventName ||
            eventData.eventName ||
            'Event Media Details'
        )
        setOrganizingDepartment(
          eventData.requestDetails?.eventDetails?.organizingDepartment || ''
        )

        // Derive overall status from media requirements
        const requirements = detailData.mediaRequirements || []
        const derivedStatus = deriveMediaStatus(requirements)
        setStatus(derivedStatus)
      } catch (err) {
        console.error('Failed to fetch media details:', err)
        setError(err.message || 'Failed to fetch media details')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [eventId])

  return (
    <section className="min-h-screen bg-[#0b1326] text-white poppins">
      <DashboardHeader basePath="/dashboard-media" />

      <main className="h-[93vh] px-7 pt-2">
        <header className="mt-4 flex items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <Link to="/dashboard-media" className="text-md font-medium text-[#CBC3D7]/50 transition hover:text-white">Event Details</Link>
            <ChevronRight size={16} />
            <h1 className="text-md font-medium text-[#D0BCFF]">{eventName || 'Event Details'}</h1>
            {organizingDepartment && (
              <span className="ml-3 rounded-full bg-green-400/10 px-5 py-2 text-sm text-[#10B981]">{organizingDepartment}</span>
            )}
          </div>
        </header>

        {status && status !== '-' && (
          <section className="mt-3">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-medium text-[#CBC3D7]/65">
              <span className={`h-3 w-3 rounded-full ${status === 'Completed' ? 'bg-[#6D3BD8]' : status === 'Acknowledged' ? 'bg-[#25A987]' : 'bg-[#B32058]'}`} />
              {status === 'Completed' ? 'COMPLETED' : status === 'Acknowledged' ? 'ACKNOWLEDGED' : 'PENDING'} (1)
            </div>
          </section>
        )}

        <section className="mt-3 overflow-hidden">
          <section className="max-h-[calc(100vh-170px)] overflow-auto rounded-lg border border-[#27334c] bg-[#151d31] p-5 table-custom-scrollbar">
            {loading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
                Loading media details...
              </p>
            ) : error ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{error}</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-[#8B3DFF]">
                      Media Details
                    </h2>
                    <p className="mt-2 text-xs leading-6 text-[#CBC3D7]/55">
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the
                      industry&apos;s standard dummy text ever since the 1500s
                    </p>
                  </div>
                  {status && status !== '-' && (
                    <span
                      className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium ${getStatusClassName(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  )}
                </div>

                <div className="mt-8">
                  <MediaDetailView mediaDetails={mediaDetails} />
                </div>
              </>
            )}
          </section>
        </section>
      </main>
    </section>
  )
}

export default MediaEventsDetailViewPage
