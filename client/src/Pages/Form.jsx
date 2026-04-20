import React from 'react'
import EventRequistionDetails from '../Components/Forms/EventRequistionDetails'

export default function Form() {
  return (
    <div className='flex flex-col h-full overflow-hidden'>

      {/* Fixed Header + Progress Bar */}
      <div className='flex-shrink-0 px-4 sm:px-6 lg:px-10 pt-4 pb-3 bg-[#16162A]'>
        <h1 className='text-white text-lg sm:text-xl font-bold mb-3'>
          Event Requistion Details
        </h1>
        <div className='w-full h-2 bg-gray-700 rounded'>
          <div
            className='h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded'
            style={{ width: '50%' }}
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className='flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-4'>
        <EventRequistionDetails />
      </div>

    </div>
  )
}