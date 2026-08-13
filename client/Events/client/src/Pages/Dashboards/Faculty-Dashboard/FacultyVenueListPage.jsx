import React from 'react'
import { ListFilter, MapPin, Search } from 'lucide-react'
import FacultyDahsboardHeader from './FacultyDahsboardHeader'
import infoIcon from '../../../assets/info.svg'

const venues = Array.from({ length: 12 }, () => ({
    name: 'Main Board Room',
    location: 'AI&DS Block , First Floor',
    capacity: '80 Seats',
    withProctoring: '80 Seats',
    withoutProctoring: '80 Seats',
    collarMic: '80 Seats',
    handMic: '80 Seats',
    handSpeaker: '80 Seats',
    podiumWithMic: '80 Seats',
}))

const FacultyVenueListPage = () => {
    return (
        <section className="min-h-screen bg-[#0b1326] poppins">
            <FacultyDahsboardHeader />

            <main className="px-6 pb-8">
                <div className="mt-4">
                    <h1 className="text-[22px] font-medium text-white">Venue List</h1>
                    <p className="mt- text-sm text-[#FFFFFF80]">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-5">
                    <h2 className="text-lg font-medium text-white">
                        Total Venue <span className="text-[#853FF9]">(47)</span>
                    </h2>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <div className="flex w-[290px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#171f31] px-4 py-2.5">
                            <Search size={16} className="text-[#8b93a4]" />
                            <input
                                type="text"
                                placeholder="Search by venues"
                                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]"
                            />
                        </div>

                        {['Floor', 'Block', 'Venue'].map((filter) => (
                            <button
                                key={filter}
                                className="flex items-center gap-2 rounded-md border border-[#343b4a] bg-[#171f31] px-4 py-2.5 text-xs text-white transition hover:border-[#8B5CF6]"
                            >
                                <ListFilter size={13} className="text-[#8b93a4]" />
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <FacultyVenueCards venues={venues} />
            </main>
        </section>
    )
}

const FacultyVenueCards = ({ venues = [] }) => {
    return (
        <div className="mt-6 grid max-h-[calc(100vh-260px)] grid-cols-1 gap-5 overflow-auto pr-2 table-custom-scrollbar lg:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue, index) => (
                <article
                    key={`${venue.name}-${index}`}
                    className="rounded-lg border border-[#2b3548] bg-[#171f31] p-4 transition hover:border-[#3b465b] hover:bg-[#141b2b]"
                >
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-medium text-white">{venue.name}</h3>
                            <img src={infoIcon} alt="Info" className="h-4 w-4 translate-y-[1px]" />
                        </div>

                        <div className="mt-1 flex items-center gap-1 text-xs text-[#FFFFFF99]">
                            <MapPin size={12} className="text-[#FFFFFF99]" />
                            <span>{venue.location}</span>
                        </div>
                    </div>

                    <div className="mb-3 grid grid-cols-3 gap-3">
                        <StatBox label="CAPACITY" value={venue.capacity} />
                        <StatBox label="WITH PROCTORING" value={venue.withProctoring} />
                        <StatBox label="WITHOUT PROCTORING" value={venue.withoutProctoring} />
                    </div>

                    <div className="grid grid-cols-4 overflow-hidden rounded-lg border border-[#2a3448] bg-[#232A3B]/55">
                        <StatItem label="COLLAR MIC" value={venue.collarMic} />
                        <StatItem label="HAND MIC" value={venue.handMic} border />
                        <StatItem label="HAND SPEAKER" value={venue.handSpeaker} border />
                        <StatItem label="PODIUM WITH MIC" value={venue.podiumWithMic} border />
                    </div>
                </article>
            ))}
        </div>
    )
}

const StatBox = ({ label, value }) => {
    return (
        <div className="rounded-lg border border-[#2a3448] bg-[#232A3B]/55 px-2 py-2">
            <p className="whitespace-nowrap text-[9px] font-semibold text-[#FFFFFF66]">{label}</p>
            <p className="mt-1 text-[12px] font-medium text-white">{value}</p>
        </div>
    )
}

const StatItem = ({ label, value, border }) => {
    return (
        <div className={`px-2 py-3 ${border ? 'border-l border-[#4b5364]' : ''}`}>
            <p className="whitespace-nowrap text-[9px] font-semibold text-[#FFFFFF66]">{label}</p>
            <p className="mt-1 text-[12px] font-medium text-white">{value}</p>
        </div>
    )
}

export default FacultyVenueListPage
