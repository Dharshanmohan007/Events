import { ListFilter, Plus, Search } from 'lucide-react'
import React from 'react'
import VenueCard from './VenueCard'

const venues = [
  {
    name: "Main Board Room",
    location: "AI&DS Block , First Floor",
    capacity: "80 Seats",
    withProctoring: "80 Seats",
    withoutProctoring: "80 Seats",
    collarMic: "80 Seats",
    handMic: "80 Seats",
    handSpeaker: "80 Seats",
    podiumWithMic: "80 Seats",
  },
  {
    name: "Main Board Room",
    location: "AI&DS Block , First Floor",
    capacity: "80 Seats",
    withProctoring: "80 Seats",
    withoutProctoring: "80 Seats",
    collarMic: "80 Seats",
    handMic: "80 Seats",
    handSpeaker: "80 Seats",
    podiumWithMic: "80 Seats",
  },
  {
    name: "Main Board Room",
    location: "AI&DS Block , First Floor",
    capacity: "80 Seats",
    withProctoring: "80 Seats",
    withoutProctoring: "80 Seats",
    collarMic: "80 Seats",
    handMic: "80 Seats",
    handSpeaker: "80 Seats",
    podiumWithMic: "80 Seats",
  },
  {
    name: "Main Board Room",
    location: "AI&DS Block , First Floor",
    capacity: "80 Seats",
    withProctoring: "80 Seats",
    withoutProctoring: "80 Seats",
    collarMic: "80 Seats",
    handMic: "80 Seats",
    handSpeaker: "80 Seats",
    podiumWithMic: "80 Seats",
  },
  {
    name: "Main Board Room",
    location: "AI&DS Block , First Floor",
    capacity: "80 Seats",
    withProctoring: "80 Seats",
    withoutProctoring: "80 Seats",
    collarMic: "80 Seats",
    handMic: "80 Seats",
    handSpeaker: "80 Seats",
    podiumWithMic: "80 Seats",
  },
  {
    name: "Main Board Room",
    location: "AI&DS Block , First Floor",
    capacity: "80 Seats",
    withProctoring: "80 Seats",
    withoutProctoring: "80 Seats",
    collarMic: "80 Seats",
    handMic: "80 Seats",
    handSpeaker: "80 Seats",
    podiumWithMic: "80 Seats",
  },
  {
    name: "Main Board Room",
    location: "AI&DS Block , First Floor",
    capacity: "80 Seats",
    withProctoring: "80 Seats",
    withoutProctoring: "80 Seats",
    collarMic: "80 Seats",
    handMic: "80 Seats",
    handSpeaker: "80 Seats",
    podiumWithMic: "80 Seats",
  },

];

const VenueManagementPage = () => {
  return (
    <>
      <main className='px-6'>

        {/* header  */}
        <div className="heading mt-2 flex items-center justify-between">
          <div>
            <h1 className='text-white text-lg font-medium'>Venue Management</h1>
            <p className='text-[#FFFFFF80] text-sm'>View, manage, and organize all venue details, availability, and booking information easily.</p>
          </div>

          <button  className='flex items-center gap-2 cursor-pointer hover:bg-gradient-to-r hover:from-[#7c3ae7d2] hover:to-[#3f1e79] px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-[#7C3AE7] to-[#4E2593]'>
            <Plus size={17} />
            Add Venue
          </button>
        </div>

        {/* card filters  */}

        <div className="container-fluid mt-6 flex items-center justify-between">
          <h1 className='text-white text-lg font-medium'>Total Venue <span className='text-[#853FF9]'>(47)</span></h1>

          {/* Toolbar */}
          <div className="flex items-center justify-end gap-3  flex-wrap ">
            {/* Search */}
            <div className="search-bar flex items-center gap-2 border border-gray-700 py-2 px-4 rounded-full bg-[#232A3C]">
              <Search size={16} className="text-gray-400" />
              <input type="text" placeholder="Search events, venue" className="text-gray-300 bg-[#171F31] placeholder:text-gray-500 outline-none bg-[#232A3C]" />
            </div>

            {/* Floor filter  */}

            <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-3 bg-[#232A3C]">
              <ListFilter size={16} className="text-gray-400" />
              <p className="text-gray-300">Floor</p>
            </div>

            {/* Block filter */}
            <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-3 bg-[#232A3C]">
              <ListFilter size={16} className="text-gray-400" />
              <p className="text-gray-300">Block</p>
            </div>

            {/* Venue filter */}
            <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-3 bg-[#232A3C]">
              <ListFilter size={16} className="text-gray-400" />
              <p className="text-gray-300">Venue</p>
            </div>

          </div>

        </div>


        {/* cards   */}




        <VenueCard venues={venues} />

      </main>
    </>
  )
}

export default VenueManagementPage