import React from 'react'
import EventOrganizerDetails from './EventOrganizerDetails'
import EventDetails from './EventDetails'
import EventRequirements from './EventRequirements'

export default function EventRequistionDetails() {
  return (
    <div className='w-full flex flex-col gap-6 pb-6'>
      <EventOrganizerDetails />
      <EventDetails />
      <EventRequirements />
    </div>
  )
}