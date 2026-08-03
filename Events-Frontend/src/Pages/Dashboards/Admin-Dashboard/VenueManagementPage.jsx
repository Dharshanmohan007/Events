import { ListFilter, Plus, Search } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import DeleteConfirmationPopup from './DeleteConfirmationPopup'
import VenueCard from './VenueCard'
import VenuFormPopup from './VenuFormPopup'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sece-events.onrender.com'

const formatCount = (value, suffix = '') => `${Number(value) || 0}${suffix}`

const formatLocation = (block, floor) => [block, floor].filter(Boolean).join(' , ') || '-'

const normalizeVenue = (venue) => ({
  id: venue._id,
  raw: venue,
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

  const handleSelect = (selectedValue) => {
    onChange(selectedValue)
    setOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`filter-container border rounded-lg flex items-center py-2 px-3 gap-2 bg-[#232A3C] min-w-[120px] ${open ? 'border-[#853FF9]' : 'border-gray-700'
          }`}
      >
        <ListFilter size={16} className="text-gray-400" />
        <span className="max-w-[160px] truncate text-sm text-gray-300">
          {selectedLabel}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 min-w-full overflow-hidden rounded-lg border border-[#343b4a] bg-[#171F31] shadow-xl">
          <div className="max-h-[300px] overflow-y-auto table-custom-scrollbar py-1">
            <button
              type="button"
              onClick={() => handleSelect('all')}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-[#232A3C] ${value === 'all' ? 'text-[#853FF9]' : 'text-gray-300'
                }`}
            >
              {label}
            </button>
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-[#232A3C] ${value === option ? 'text-[#853FF9]' : 'text-gray-300'
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

const VenueManagementPage = () => {
  const [venues, setVenues] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [floorFilter, setFloorFilter] = useState('all')
  const [blockFilter, setBlockFilter] = useState('all')
  const [venueFilter, setVenueFilter] = useState('all')
  const [popupMode, setPopupMode] = useState(null)
  const [editingVenue, setEditingVenue] = useState(null)
  const [deletingVenue, setDeletingVenue] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingInProgress, setDeletingInProgress] = useState(false)

  const fetchVenues = async () => {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/api/venues`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!response.ok) {
      throw new Error('Failed to fetch venues')
    }

    const responseData = await response.json()
    setVenues((Array.isArray(responseData) ? responseData : []).map(normalizeVenue))
  }

  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('token')

    fetch(`${API_BASE_URL}/api/venues`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch venues')
        }
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

    return () => {
      isMounted = false
    }
  }, [])

  const closePopup = () => {
    setPopupMode(null)
    setEditingVenue(null)
  }

  const handleAddClick = () => {
    setEditingVenue(null)
    setPopupMode('add')
  }

  const handleEditClick = (venue) => {
    setEditingVenue(venue.raw)
    setPopupMode('edit')
  }

  const handleSubmitVenue = async (payload) => {
    setSaving(true)
    const token = localStorage.getItem('token')
    const isEdit = popupMode === 'edit'
    const url = isEdit
      ? `${API_BASE_URL}/api/venues/${editingVenue._id}`
      : `${API_BASE_URL}/api/venues`

    try {
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(isEdit ? 'Failed to update venue' : 'Failed to add venue')
      }

      await fetchVenues()
      closePopup()
    } catch (error) {
      console.warn(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteVenue = async () => {
    if (!deletingVenue) return

    setDeletingInProgress(true)
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/api/venues/${deletingVenue.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!response.ok) {
        throw new Error('Failed to delete venue')
      }

      await fetchVenues()
      setDeletingVenue(null)
    } catch (error) {
      console.warn(error.message)
    } finally {
      setDeletingInProgress(false)
    }
  }

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
    <>
      <main className='px-6'>

        {/* header  */}
        <div className="heading mt-2 flex items-center justify-between">
          <div>
            <h1 className='text-white text-lg font-medium'>Venue Management</h1>
            <p className='text-[#FFFFFF80] text-sm'>View, manage, and organize all venue details, availability, and booking information easily.</p>
          </div>

          <button onClick={handleAddClick} className='flex items-center gap-2 cursor-pointer hover:bg-gradient-to-r hover:from-[#7c3ae7d2] hover:to-[#3f1e79] px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-[#7C3AE7] to-[#4E2593]'>
            <Plus size={17} />
            Add Venue
          </button>
        </div>

        {/* card filters  */}

        <div className="container-fluid mt-6 flex items-center justify-between">
          <h1 className='text-white text-lg font-medium'>Total Venue <span className='text-[#853FF9]'>({filteredVenues.length})</span></h1>

          {/* Toolbar */}
          <div className="flex items-center justify-end gap-3  flex-wrap ">
            {/* Search */}
            <div className="search-bar flex items-center gap-2 border border-gray-700 py-2 px-4 rounded-full bg-[#232A3C]">
              <Search size={16} className="text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="text"
                placeholder="Search venue"
                className="text-gray-300 placeholder:text-gray-500 outline-none bg-transparent"
              />
            </div>

            {/* Floor filter  */}

            <SelectFilter value={floorFilter} onChange={setFloorFilter} options={filterOptions.floors} label="Floor" />

            {/* Block filter */}
            <SelectFilter value={blockFilter} onChange={setBlockFilter} options={filterOptions.blocks} label="Block" />

            {/* Venue filter */}
            <SelectFilter value={venueFilter} onChange={setVenueFilter} options={filterOptions.venueNames} label="Venue" />

          </div>

        </div>


        {/* cards   */}




        <VenueCard
          venues={filteredVenues}
          onEdit={handleEditClick}
          onDelete={setDeletingVenue}
        />

      </main>

      {popupMode && (
        <VenuFormPopup
          mode={popupMode}
          venue={editingVenue}
          onClose={closePopup}
          onSubmit={handleSubmitVenue}
          saving={saving}
          blockOptions={filterOptions.blocks}
          floorOptions={filterOptions.floors}
        />
      )}

      {deletingVenue && (
        <DeleteConfirmationPopup
          title="Delete Entry"
          message="Are you sure you want to delete this entry? This action cannot be undone."
          deleting={deletingInProgress}
          onCancel={() => setDeletingVenue(null)}
          onDelete={handleDeleteVenue}
        />
      )}
    </>
  )
}

export default VenueManagementPage
