import React from 'react'
import EventsSidebar from '../Components/EventsSidebar'
// import EventRequistionDetails from '../Components/Forms/EventRequistionDetails'
import Form from './Form'

export default function EventsForm() {
  return (
    <div className='bg-[#16162A] flex h-screen w-screen overflow-hidden'>
      {/* <EventsSidebar /> */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <Form />
      </div>
    </div>
  )
}
