import React, { useState, useEffect } from 'react'
import { ArrowRight, Bell, Calendar, Check, CircleQuestionMark, ExternalLink, Hourglass, Search, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import FeedbackRatings from '../../../Components/FeedbackRatings'
import smallLogo from '../../../assets/small-logo.svg'
import profileAvatar from '../../../assets/profile-avatar.svg'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ── Pure helpers (outside component) ─────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '-'
  return date
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-')
}

const getEventDateDisplay = (eventSchedule = []) => {
  const dates = eventSchedule.map((s) => s.eventDate).filter(Boolean)
  if (dates.length === 0) return '-'
  const first = formatDate(dates[0])
  if (dates.length === 1) return first
  return `${first} +${dates.length - 1}`
}

const deriveVideoStatus = (videoRequirements = []) => {
  const statuses = videoRequirements.map((r) => r.status).filter(Boolean)
  if (statuses.length === 0) return '-'
  const hasPending = statuses.some((s) => String(s).toLowerCase().includes('pending'))
  if (hasPending) return 'Pending for Acknowledge'
  return statuses[0]
}

const transformVideoEvents = (events = []) =>
  events.map((event) => ({
    _id: event._id,
    eventName: event.eventName || '-',
    eventDate: getEventDateDisplay(event.eventSchedule),
    department: event.organizingDepartment || '-',
    status: deriveVideoStatus(event.videoRequirements || event.posterRequirements),
  }))

// ── Static data ──────────────────────────────────────────────────────────

const statGroups = [
  {
    title: 'Event Video Media Request',
    cards: [
      { label: 'Total Request', value: 50, icon: Calendar, className: 'from-[#3A286F] to-[#5B1B8F]', iconBg: 'bg-[#A78BFA]' },
      { label: 'Completed Request', value: 50, icon: Check, className: 'from-[#143D40] to-[#0B8C64]', iconBg: 'bg-[#45D6A4]' },
      { label: 'Acknowledged', value: 50, icon: Check, className: 'from-[#1A2A63] to-[#2921A3]', iconBg: 'bg-[#8EA0FF]' },
      { label: 'Pending Acknowledgement', value: 50, icon: Hourglass, className: 'from-[#3B213A] to-[#8C174B]', iconBg: 'bg-[#FF6DB3]' },
    ],
  },
  {
    title: 'Individual Video Media Request',
    cards: [
      { label: 'Total Request', value: 50, icon: Calendar, className: 'from-[#3A286F] to-[#5B1B8F]', iconBg: 'bg-[#A78BFA]' },
      { label: 'Completed Request', value: 50, icon: Check, className: 'from-[#143D40] to-[#0B8C64]', iconBg: 'bg-[#45D6A4]' },
      { label: 'Acknowledged', value: 50, icon: Check, className: 'from-[#1A2A63] to-[#2921A3]', iconBg: 'bg-[#8EA0FF]' },
      { label: 'Pending Acknowledgement', value: 50, icon: Hourglass, className: 'from-[#3B213A] to-[#8C174B]', iconBg: 'bg-[#FF6DB3]' },
    ],
  },
]

const chartData = [
  { name: 'CSE', value: 25, color: '#74B9FF' },
  { name: 'AI&ML', value: 55, color: '#159283' },
  { name: 'EEE', value: 12, color: '#68DF85' },
  { name: 'VLSI', value: 8, color: '#3352C8' },
]

const feedbackRows = Array.from({ length: 13 }, () => ({
  name: 'Dr. Sarah Jenkins',
  department: 'Dept. of Computer Science',
  quote: '"The event video exceeded expectations. The team captured the technical essence perfectly with modern aesthetics."',
  time: '2 HOURS AGO',
}))

// ── Sub-components ───────────────────────────────────────────────────────

const DashboardHeader = () => (
  <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-6 py-3">
    <div className="flex items-center gap-6">
      <img src={smallLogo} alt="Logo" className="h-11 w-11" />
      <nav className="flex items-center gap-8 text-sm">
        <span className="border-b border-[#8B3DFF] pb-2 font-semibold text-[#8B3DFF]">Dashboard</span>
      </nav>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex w-[290px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#161a23] px-3 py-2">
        <Search size={15} className="text-[#8b93a4]" />
        <input className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]" placeholder="Search events, venues, or faculty..." />
      </div>
      <div className="flex items-center gap-5 text-[#b7bdc8]">
        <Bell size={18} />
        <CircleQuestionMark size={18} />
        <Settings size={18} />
        <img src={profileAvatar} alt="Profile Avatar" className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </header>
)

const StatGroup = ({ title, cards }) => (
  <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] p-2">
    <h2 className="text-lg font-medium text-white">{title}</h2>
    <div className="mt-4 grid grid-cols-2 gap-3">
      {cards.map(({ label, value, icon, className, iconBg }) => {
        const IconComponent = icon
        return (
          <article key={label} className={`flex h-[70px] justify-between rounded-lg bg-gradient-to-r ${className} px-3 py-3`}>
            <div>
              <p className="text-sm text-white">{label}</p>
              <p className="text-xl font-medium text-white">{value}</p>
            </div>
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
              <IconComponent size={17} className="text-white" />
            </span>
          </article>
        )
      })}
    </div>
  </section>
)

const Status = ({ status }) => {
  const isPending = String(status).toLowerCase().includes('pending')
  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${isPending ? 'text-[#F20768]' : 'text-[#20D18C]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isPending ? 'bg-[#F20768]' : 'bg-[#20D18C]'}`} />
      {status}
    </span>
  )
}

// ── Main component ───────────────────────────────────────────────────────

const VideoDashboard = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('events')

  useEffect(() => {
    const abortController = new AbortController()

    const fetchVideoEvents = async () => {
      setLoading(true)
      setError('')

      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Authentication token not found')

        const decoded = jwtDecode(token)
        const email = decoded?.email
        if (!email) throw new Error('Email not found in token')

        const url = `${API_BASE_URL}/api/dashboard/video-dashboard?email=${encodeURIComponent(email)}`

        const response = await fetch(url, {
          signal: abortController.signal,
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`)

        const json = await response.json()
        if (json.events && Array.isArray(json.events)) {
          setEvents(transformVideoEvents(json.events))
        } else {
          setEvents([])
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Failed to fetch video dashboard data:', err)
        setError(err.message || 'Failed to load video requests')
      } finally {
        if (!abortController.signal.aborted) setLoading(false)
      }
    }

    fetchVideoEvents()
    return () => abortController.abort()
  }, [])

  const headers = ['Event Name', 'Event Date', 'Dept', 'Status', 'Action']

  const renderTable = () => {
    if (events.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-[#CBC3D7]/65">No video event requests found.</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto overflow-y-auto flex-1 table-custom-scrollbar">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-[#151c2c]">
            <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
              {headers.map((header) => (
                <th
                  key={header}
                  className={`px-6 py-4 font-semibold ${header === 'Action' ? 'text-center' : ''}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isPending = String(event.status).toLowerCase().includes('pending')
              return (
                <tr
                  key={event._id}
                  className="border-t border-[#20283a] text-sm text-white whitespace-nowrap"
                >
                  <td className="px-6 py-4 font-medium">{event.eventName}</td>
                  <td className="px-6 py-4">{event.eventDate}</td>
                  <td className="px-6 py-4">{event.department}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 ${
                        isPending ? 'text-[#F20768]' : 'text-[#20D18C]'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isPending ? 'bg-[#F20768]' : 'bg-[#20D18C]'
                        }`}
                      />
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/dashboard-video/detailView/${event._id}`}
                      className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white"
                      aria-label={`View details for ${event.eventName}`}
                    >
                      <ExternalLink size={17} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <section className="min-h-screen overflow-auto bg-[#0b1326] pt-16.25 text-white poppins table-custom-scrollbar">
      <DashboardHeader />
      <main className="px-6 py-5">
        <h1 className="text-lg font-medium">Dashboard Overview</h1>
        <p className="mt-1 mb-1 text-sm text-[#FFFFFF80]">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {statGroups.map((group) => <StatGroup key={group.title} {...group} />)}
        </div>

        <div className="mt-7">
          <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
              <h2 className="text-white font-medium text-sm">Upcoming Video Requests</h2>

              <div className="flex items-center gap-4">
                <nav
                  className="flex rounded-md bg-[#1b2335] p-0.5"
                  aria-label="Request type tabs"
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab('events')}
                    className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                      activeTab === 'events'
                        ? 'bg-[#8B3DFF] text-white shadow-sm'
                        : 'text-[#8b93a7] hover:text-white'
                    }`}
                  >
                    Events
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('individual')}
                    className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                      activeTab === 'individual'
                        ? 'bg-[#8B3DFF] text-white shadow-sm'
                        : 'text-[#8b93a7] hover:text-white'
                    }`}
                  >
                    Individual
                  </button>
                </nav>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <p className="text-sm text-[#CBC3D7]/65">Loading video requests...</p>
              </div>
            ) : error ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <p className="text-sm text-[#FF4F91]">{error}</p>
              </div>
            ) : activeTab === 'events' ? (
              renderTable()
            ) : (
              <div className="flex flex-1 items-center justify-center py-12">
                <p className="text-sm text-[#CBC3D7]/65">Individual video requests will be available soon.</p>
              </div>
            )}
          </section>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-3">
          <FeedbackRatings rows={feedbackRows} feedbackLink="/dashboard-video/feedback" />
          <DepartmentRequestChart data={chartData} title="Event Video Request By Department" />
        </div>
      </main>
    </section>
  )
}

export default VideoDashboard
