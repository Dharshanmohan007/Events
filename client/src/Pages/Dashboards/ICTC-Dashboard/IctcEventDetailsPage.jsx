import React, { useState } from 'react'
import { CalendarDays, Check, Clock3, Mail, MapPin, Phone, Sparkles, User, Users, Building2, ClipboardList } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import DashboardHeader from './DashboardHeader'

const eventDetails = {
    title: 'Nexus Annual Tech Summit 2024',
    category: 'Placement',
    organizerName: 'Surya Chandran',
    organizerEmail: 'user@gmail.com',
    organizerPhone: '1234567890',
    organizerDepartment: 'CSE',
    venue: 'Main Board Room',
    eventDate: '12/06/2026',
    eventTime: '11.30AM - 2.30PM',
    totalMembers: '1200',
}

const basicRequirements = [
    ['Desktop', 'Yes'],
    ['Internet Facility', 'LAN'],
    ['Expected Internet Users', '20'],
    ['Total Number of Guest WIFI Count', '20'],
]

const objectRequirements = ['Chief Guest AV', 'Stage LED', 'Pointer', 'WebCam']

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="border-r border-[#47506a] last:border-r-0 px-4 py-1">
        <div className="flex items-center gap-1.5 text-[#9f86ff]">
            <Icon size={14} />
        </div>
        <p className="mt-1 text-[10px] font-medium uppercase text-[#8f96a8]">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-white">{value}</p>
    </div>
)

const RequirementCard = ({ title, children }) => (
    <div className="rounded-lg border border-[#3a4560] bg-[#232A3C]  p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
            <ClipboardList size={15} className="text-[#c6c9d4]" />
            {title}
        </div>
        {children}
    </div>
)

const IctcEventDetailsPage = () => {
    const { eventId } = useParams()
    const [requestStatus, setRequestStatus] = useState('pending')

    const isAcknowledged = requestStatus !== 'pending'

    const handleStatusClick = () => {
        setRequestStatus((currentStatus) => (
            currentStatus === 'pending' ? 'acknowledged' : 'completed'
        ))
    }

    return (
        <section className="min-h-screen bg-[#0b1326] poppins">
            <DashboardHeader />

            <main className="px-6 pb-8">
                <div className="py-3 text-lg font-medium text-[#8c94a8]">
                    <Link to="/dashboard-ictcs/events" className="hover:text-white">ICTCS Request List</Link>
                    <span className="mx-2 text-[#576071]">&gt;</span>
                    <span className="text-[#D0BCFF]">{eventDetails.title}</span>
                </div>

                <section className="rounded-xl">
                    <div className="rounded-lg border border-gray-800 bg-[#171F31] p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Sparkles size={24} className="text-[#b394ff]" />
                                    <h1 className="text-xl font-semibold text-white">{eventDetails.title}</h1>
                                </div>
                                <p className="mt-3 max-w-4xl text-xs leading-5 text-[#9aa2b5]">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                    Lorem Ipsum has been the industry's standard.
                                </p>
                            </div>

                            <span className="rounded-full bg-[#0a3b35] px-4 py-1.5 text-xs font-semibold text-[#34D399]">
                                {eventDetails.category}
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-4 py-2 rounded-lg bg-[#232A3B]">
                            <InfoItem icon={User} label="Organizer Name" value={eventDetails.organizerName} />
                            <InfoItem icon={Mail} label="Organizer Email" value={eventDetails.organizerEmail} />
                            <InfoItem icon={Phone} label="Organizer Phone Number" value={eventDetails.organizerPhone} />
                            <InfoItem icon={Building2} label="Organizer Department" value={eventDetails.organizerDepartment} />
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-[#171F31] p-5">
                        <div className="grid grid-cols-4 rounded-lg py-2 bg-[#232A3B]">
                            <InfoItem icon={MapPin} label="Venue Name" value={eventDetails.venue} />
                            <InfoItem icon={CalendarDays} label="Event Date" value={eventDetails.eventDate} />
                            <InfoItem icon={Clock3} label="Event Time" value={eventDetails.eventTime} />
                            <InfoItem icon={Users} label="Total Members" value={eventDetails.totalMembers} />
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-semibold text-white">ICTCS Request List</h2>
                                    {isAcknowledged && (
                                        <span className="rounded-full bg-[#0a3b35] px-3 py-1 text-[11px] font-semibold text-[#34D399]">
                                            {requestStatus === 'completed' ? 'Completed' : 'Acknowledged'}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 max-w-4xl text-xs leading-5 text-[#9aa2b5]">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                                </p>
                            </div>
                            {requestStatus !== "completed" &&
                                <button
                                    type="button"
                                    onClick={handleStatusClick}
                                    className={`inline-flex items-center gap-2 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-white ${isAcknowledged
                                        ? 'bg-linear-to-r from-[#097B5F] to-[#116565] hover:bg-linear-to-r hover:from-[#116565] hover:to-[#097B5F] hover:bg-[#34D399]'
                                        : 'bg-linear-to-r from-[#7C3AE7] to-[#4E2593] hover:bg-linear-to-r hover:from-[#662dc2e1] hover:to-[#3f1e79] hover:bg-[#9659fb]'
                                        }`}
                                >
                                    <Check size={16} />
                                    {requestStatus === 'pending' ? 'Acknowledge' : requestStatus === 'completed' ? 'Completed' : 'Complete'}
                                </button>}
                        </div>

                        <div className="mt-5 grid grid-cols-[1fr_0.75fr_1.2fr] gap-4">
                            <RequirementCard title="Basic Requirement">
                                <div className="space-y-3">
                                    {basicRequirements.map(([label, value]) => (
                                        <div key={label} className="flex items-center justify-between gap-4 text-xs border-b border-gray-700/20 pb-2">
                                            <span className="text-[#a9b0c1]">{label}</span>
                                            <span className="font-semibold text-white">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </RequirementCard>

                            <RequirementCard title="Object Requirement">
                                <div className="divide-y divide-[#2c354b]">
                                    {objectRequirements.map((item) => (
                                        <p key={item} className="py-2 text-xs font-medium text-white/80 first:pt-0 last:pb-0">
                                            {item}
                                        </p>
                                    ))}
                                </div>
                            </RequirementCard>

                            <RequirementCard title="Special Requirement">
                                <p className="text-xs font-medium leading-6 text-white/80">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                                </p>
                            </RequirementCard>
                        </div>

                        <p className="sr-only">Event detail id: {eventId}</p>
                    </div>
                </section>
            </main >
        </section >
    )
}

export default IctcEventDetailsPage
