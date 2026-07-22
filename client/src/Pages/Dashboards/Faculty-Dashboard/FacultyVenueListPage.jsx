import React, { useState, useEffect, useMemo, useRef } from 'react'
import { ListFilter, MapPin, Search } from 'lucide-react'
import FacultyDahsboardHeader from './FacultyDahsboardHeader'
import infoIcon from '../../../assets/info.svg'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const formatCount = (value, suffix = '') => `${Number(value) || 0}${suffix}`

const formatLocation = (block, floor) => [block, floor].filter(Boolean).join(' , ') || '-'

const normalizeVenue = (venue) => ({
    id: venue._id,
    name: venue.venue || '-',
    location: formatLocation(venue.block, venue.floor),
    block: venue.block || '',
    floor: venue.floor || '',
    capacity: formatCount(venue.capacity, ' Seats'),
    withProctoring: formatCount(venue.seating?.withProctoring, ' Seats'),
    withoutProctoring: formatCount(venue.seating?.withoutProctoring, ' Seats'),
    collarMic: formatCount(venue.audio?.collarMic),
    handMic: formatCount(venue.audio?.handMic),
    handSpeaker: formatCount(venue.audio?.handSpeaker),
    podiumWithMic: formatCount(venue.audio?.podiumWithMic),
})

const SelectFilter = ({ value, onChange, options, label }) => {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)
    const selectedLabel = value === 'all' ? label : value

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`flex items-center gap-2 rounded-md border bg-[#171f31] px-4 py-2.5 text-xs text-white transition ${
                    open ? 'border-[#8B5CF6]' : 'border-[#343b4a] hover:border-[#8B5CF6]'
                }`}
            >
                <ListFilter size={13} className="text-[#8b93a4]" />
                {selectedLabel}
            </button>

            {open && (                    <div className="absolute right-0 z-30 mt-2 min-w-full overflow-hidden rounded-lg border border-[#343b4a] bg-[#171F31] shadow-xl">
                    <div className="max-h-[300px] overflow-y-auto table-custom-scrollbar py-1">
                        <button
                            type="button"
                            onClick={() => { onChange('all'); setOpen(false) }}
                            className={`block w-full px-3 py-2 text-left text-sm hover:bg-[#232A3C] ${
                                value === 'all' ? 'text-[#853FF9]' : 'text-gray-300'
                            }`}
                        >
                            {label}
                        </button>
                        {options.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => { onChange(option); setOpen(false) }}
                                className={`block w-full px-3 py-2 text-left text-sm hover:bg-[#232A3C] ${
                                    value === option ? 'text-[#853FF9]' : 'text-gray-300'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const FacultyVenueListPage = () => {
    const [venues, setVenues] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [floorFilter, setFloorFilter] = useState('all')
    const [blockFilter, setBlockFilter] = useState('all')
    const [venueFilter, setVenueFilter] = useState('all')

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')

        fetch(`${API_BASE_URL}/api/venues`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch venues')
                return response.json()
            })
            .then((responseData) => {
                if (isMounted) {
                    setVenues((Array.isArray(responseData) ? responseData : []).map(normalizeVenue))
                }
            })
            .catch((error) => {
                if (isMounted) console.warn(error.message)
            })

        return () => { isMounted = false }
    }, [])

    const filterOptions = useMemo(() => ({
        floors: [...new Set(venues.map((venue) => venue.floor).filter(Boolean))],
        blocks: [...new Set(venues.map((venue) => venue.block).filter(Boolean))],
        venueNames: [...new Set(venues.map((venue) => venue.name).filter(Boolean))],
    }), [venues])

    const filteredVenues = venues.filter((venue) => {
        const query = searchQuery.toLowerCase()
        const matchesSearch = [venue.name, venue.location, venue.block, venue.floor]
            .join(' ')
            .toLowerCase()
            .includes(query)
        const matchesFloor = floorFilter === 'all' || venue.floor === floorFilter
        const matchesBlock = blockFilter === 'all' || venue.block === blockFilter
        const matchesVenue = venueFilter === 'all' || venue.name === venueFilter

        return matchesSearch && matchesFloor && matchesBlock && matchesVenue
    })

    return (
        <section className="min-h-screen bg-[#0b1326] poppins">
            <FacultyDahsboardHeader />

            <main className="px-6 pb-8 ">
                <div className="mt-4">
                    <h1 className="text-[22px] font-medium text-white">Venue List</h1>
                    <p className="mt- text-sm text-[#FFFFFF80]">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-5 ">
                    <h2 className="text-lg font-medium text-white">
                        Total Venue <span className="text-[#853FF9]">({filteredVenues.length})</span>
                    </h2>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <div className="flex w-[290px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#171f31] px-4 py-2.5">
                            <Search size={16} className="text-[#8b93a4]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by venues"
                                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]"
                            />
                        </div>

                        <SelectFilter value={floorFilter} onChange={setFloorFilter} options={filterOptions.floors} label="Floor" />
                        <SelectFilter value={blockFilter} onChange={setBlockFilter} options={filterOptions.blocks} label="Block" />
                        <SelectFilter value={venueFilter} onChange={setVenueFilter} options={filterOptions.venueNames} label="Venue" />
                    </div>
                </div>

                {filteredVenues.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-gray-700 bg-[#171F31] px-6 py-10 text-center text-sm text-[#8b93a7]">
                        No venues available
                    </div>
                ) : (
                    <FacultyVenueCards venues={filteredVenues} />
                )}
            </main>
        </section>
    )
}

const FacultyVenueCards = ({ venues = [] }) => {
    return (
        <div className="mt-6 grid  max-h-[calc(100vh-260px)] grid-cols-1 gap-5 overflow-auto table-custom-scrollbar pr-2 lg:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue, index) => (
                <article
                    key={venue.id || index}
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
