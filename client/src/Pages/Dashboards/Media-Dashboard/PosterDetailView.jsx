import React, { useState } from 'react'
import { Bell, CalendarDays, Check, CircleQuestionMark, ClipboardList, Clock3, FileText, Mail, MapPin, Network, Phone, Search, Settings, Shuffle, Sparkles, UserRound, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import smallLogo from '../../../assets/small-logo.svg'
import profileAvatar from '../../../assets/profile-avatar.svg'
import RequestToInterchangeModal from './RequestToInterchangeModal'

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

const requestText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"

const days = ['Day 1', 'Day 2', 'Day 3']

const DetailHeader = () => (
    <header className="sticky top-0 z-40 flex h-[71px] items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-5">
        <div className="flex items-center gap-4">
            <img src={smallLogo} alt="Logo" className="h-10 w-10" />
            <nav className="flex items-center gap-4 text-sm font-medium">
                <Link to="/dashboard-poster" className="text-[#FFFFFF80]">Dashboard</Link>
                <span className="border-b border-[#8B3DFF] pb-1 text-[#8B3DFF]">Request List</span>
                <span className="text-[#FFFFFF80]">Calender</span>
                <span className="text-[#FFFFFF80]">Reports</span>
            </nav>
        </div>

        <div className="flex items-center gap-6">
            <div className="flex h-9 w-[289px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#161a23] px-3">
                <Search size={14} className="text-[#8b93a4]" />
                <input className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]" placeholder="Search events, venues, or faculty..." />
            </div>
            <div className="flex items-center gap-5 text-[#b7bdc8]">
                <Bell size={16} />
                <CircleQuestionMark size={16} />
                <Settings size={16} />
                <img src={profileAvatar} alt="Profile Avatar" className="h-8 w-8 rounded-full" />
            </div>
        </div>
    </header>
)

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="border-r border-[#5b6378] px-3 py-1 last:border-r-0">
        <Icon size={15} className="text-[#c3a8ff]" />
        <p className="mt-2 text-[10px] font-semibold uppercase text-[#8f96a8]">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
    </div>
)

const TextCard = ({ title, children }) => (
    <section className="rounded-lg border border-[#3a4560] bg-[#1b2335]/80 p-5">
        <h3 className="flex items-center gap-2 text-lg font-medium text-[#dce4f7]">
            <ClipboardList size={17} />
            {title}
        </h3>
        <p className="mt-5 text-sm font-medium leading-7 text-[#d6d1e4]/90">{children}</p>
    </section>
)

const ReferenceRow = ({ label }) => (
    <div className="grid min-h-[70px] grid-cols-[1fr_1fr] items-center rounded-lg border border-[#3a4560] bg-[#20283A]">
        <div className="px-7 text-sm text-[#d6d1e4]/85">{label}</div>
        <div className="flex h-full items-center gap-3 border-l border-[#6a7288] px-9">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#075852]/60 text-[#20D18C]">
                <FileText size={17} />
            </span>
            <span className="text-base font-semibold text-[#d6d1e4]">Previous Event Completion Document.pdf</span>
        </div>
    </div>
)

const RequirementBox = ({ title, rows }) => (
    <section className="rounded-lg border border-[#3a4560] bg-[#1b2335]/80 p-5">
        <h3 className="flex items-center gap-2 text-lg font-medium text-[#dce4f7]">
            <ClipboardList size={17} />
            {title}
        </h3>
        <div className="mt-5 divide-y divide-[#2b3449]">
            {rows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-medium text-[#d6d1e4]">{label}</span>
                    {value && <span className="text-sm font-bold text-[#d9c8ff]">{value}</span>}
                </div>
            ))}
        </div>
    </section>
)

const PosterDetailView = () => {
    const { posterId } = useParams()
    const [activeDay, setActiveDay] = useState(days[0])
    const [isInterchangeOpen, setIsInterchangeOpen] = useState(false)

    return (
        <section className="min-h-screen bg-[#0b1326] text-white poppins">
            <DetailHeader />

            <main className="px-5 pb-8 pt-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-[#8c94a8]">
                        <Link to="/dashboard-poster" className="hover:text-white">Poster</Link>
                        <span className="mx-2 text-[#596276]">&gt;</span>
                        <span className="text-[#D0BCFF]">{eventDetails.title}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsInterchangeOpen(true)}
                            className="flex h-11 items-center gap-2 rounded-md bg-linear-to-r from-[#078B72] to-[#035546] hover:bg-linear-to-l hover:from-[#078B72] hover:to-[#035546] px-5 text-base font-medium text-white"
                        >
                            <Shuffle size={17} />
                            Request to Interchange
                        </button>
                        <button type="button" className="flex h-11 items-center gap-2 rounded-md bg-linear-to-r from-[#8D3CF2] to-[#55279E]  hover:bg-linear-to-l hover:from-[#8D3CF2] hover:to-[#55279E]  px-5 text-base font-medium text-white">
                            <Check size={17} />
                            Acknowledge
                        </button>
                    </div>
                </div>

                <section className="mt-5 rounded-lg border border-[#2a3347] bg-[#151c2c] p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Sparkles size={31} className="text-[#cbb6ff]" />
                                <h1 className="text-lg font-medium text-[#e8edfb]">{eventDetails.title}</h1>
                            </div>
                            <p className="mt-4 text-sm leading-5 text-[#9aa2b5]">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                            </p>
                        </div>
                        <span className="rounded-full bg-[#063f43] px-5 py-2 text-sm font-semibold text-[#20D18C]">{eventDetails.category}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-4 rounded-lg border border-[#2e384e] bg-[#232A3B] py-2">
                        <InfoItem icon={UserRound} label="Organizer Name" value={eventDetails.organizerName} />
                        <InfoItem icon={Mail} label="Organizer Email" value={eventDetails.organizerEmail} />
                        <InfoItem icon={Phone} label="Organizer Phone Number" value={eventDetails.organizerPhone} />
                        <InfoItem icon={Network} label="Organizer Department" value={eventDetails.organizerDepartment} />
                    </div>
                </section>

                <section className="mt-4 rounded-lg border border-[#2a3347] bg-[#151c2c] p-4">
                    <div className="flex border-b border-[#3a4560]">
                        {days.map((day) => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => setActiveDay(day)}
                                className={`min-w-[90px] px-7 pb-3 text-left text-base font-semibold ${activeDay === day ? 'border-b-2 border-[#8B3DFF] text-[#8B3DFF]' : 'text-white'}`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    <div className="mt-5 grid grid-cols-4 rounded-lg border border-[#2e384e] bg-[#232A3B] py-2">
                        <InfoItem icon={MapPin} label="Venue Name" value={eventDetails.venue} />
                        <InfoItem icon={CalendarDays} label="Event Date" value={eventDetails.eventDate} />
                        <InfoItem icon={Clock3} label="Event Time" value={eventDetails.eventTime} />
                        <InfoItem icon={Users} label="Total Members" value={eventDetails.totalMembers} />
                    </div>

                    <div className="mt-7">
                        <h2 className="text-xl font-semibold text-white">Poster Request List</h2>
                        <p className="mt-3 text-sm leading-5 text-[#9aa2b5]">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                        </p>
                    </div>

                    <div className="mt-7 space-y-4">
                        <TextCard title="Content for Poster">
                            {requestText}
                        </TextCard>
                        <ReferenceRow label="Reference poster" />
                        <TextCard title="Content for Certificate">
                            {requestText}
                        </TextCard>
                        <ReferenceRow label="Reference Certificate" />
                        <TextCard title="Content for Trophy">
                            {requestText}
                        </TextCard>

                        <div className="grid grid-cols-2 gap-7">
                            <RequirementBox
                                title="Display Requirement"
                                rows={[
                                    ['Flex'],
                                    ['Glass Sticker'],
                                ]}
                            />
                            <RequirementBox
                                title="Size Requirement"
                                rows={[
                                    ['Size for Flex', '1200cm'],
                                    ['Size for Glass Sticker', '10cm'],
                                ]}
                            />
                        </div>

                        <div className="grid grid-cols-2 rounded-lg border border-[#3a4560] bg-[#20283A]">
                            <div className="flex items-center justify-between border-r border-[#6a7288] px-7 py-5">
                                <span className="flex items-center gap-2 text-sm text-[#d6d1e4]/85">
                                    <CalendarDays size={16} className="text-[#c3a8ff]" />
                                    Delivery Date
                                </span>
                                <span className="text-base font-semibold text-white">12/05/2026</span>
                            </div>
                            <div className="flex items-center justify-between px-7 py-5">
                                <span className="text-sm text-[#d6d1e4]/85">Priority</span>
                                <span className="text-sm font-bold text-[#F20768]">HIGH</span>
                            </div>
                        </div>

                        <TextCard title="Special Requirement">
                            {requestText}
                        </TextCard>
                    </div>
                </section>

                <p className="sr-only">Poster detail id: {posterId}</p>
            </main>

            {isInterchangeOpen && <RequestToInterchangeModal onClose={() => setIsInterchangeOpen(false)} isInterchangeOpen={isInterchangeOpen} />}
        </section>
    )
}

export default PosterDetailView
