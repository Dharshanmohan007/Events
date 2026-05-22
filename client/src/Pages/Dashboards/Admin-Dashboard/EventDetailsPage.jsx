import { Check, ChevronRight, X } from 'lucide-react'
import React, { useState } from 'react'
import EventRequisitionDetailsPanel from './EventRequisitionDetailsPanel'
import EventDetailsSidePanel, { eventDetailsTabs } from './EventDetailsSidePanel'
import VenueDetailsPanel from './VenueDetailsPanel'
import RejectionReasonPopup from './RejectionReasonPopup'
import IctcsDetailsPanel from './IctcsDetailsPanel'
import AudioDetailsPanel from './AudioDetailsPanel'
import TransportationDetailsPanel from './TransportationDetailsPanel'
import FoodRefreshmentDetailsPanel from './FoodRefreshmentDetailsPanel'
import AccommodationDetailsPanel from './AccommodationDetailsPanel'
import PurchaseDetailsPanel from './PurchaseDetailsPanel'
import MediaDetailsPanel from './MediaDetailsPanel'

const EventDetailsPage = () => {
    // ==========================================  states ========================================
    const [activeTab, setActiveTab] = useState(eventDetailsTabs[0]);
    const [rejectionReasonPopupOpen, setRejectionReasonPopupOpen] = useState(false)

    // ==========================================  functions ========================================
    const handleRequestReject = () => {
        setRejectionReasonPopupOpen(true);
    }

    return (
        <>
            <main className='px-6'>
                <header className='flex items-center justify-between mt-2'>
                    {/* Breadcrumb  */}
                    <div className=" mt-2 flex items-center gap-1">
                        <h1 className='text-[#CBC3D7]/40'>{activeTab}</h1>
                        <ChevronRight size={14} className='text-white' />
                        <h1 className='text-[#D0BCFF]'>Nexus Annual Tech Summit 2024</h1>

                        <div className="event-from ml-3 bg-green-400/10 text-sm text-[#10B981] px-5 py-2 rounded-full text">
                            <h1>Placement</h1>
                        </div>
                    </div>

                    <div className="btn-container flex items-center gap-2">
                        <button className='flex items-center gap-1 bg-linear-to-r from-[#07785D] to-[#07785D] text-white px-4 py-1 rounded-md'><span><Check size={16} className='text-white' /></span> Approve</button>
                        <button onClick={() => { handleRequestReject() }} className='flex items-center gap-2 text-[#FF0063] px-4 py-1 rounded-md border border-red-[#FF0063]'><span><X size={14} className='text-[#FF0063]' /></span> Reject</button>
                    </div>
                </header>

                <section className="mt-2 flex min-h-[calc(100vh-150px)] max-h-[calc(100vh-150px)] gap-2">
                    <EventDetailsSidePanel activeTab={activeTab} onTabChange={setActiveTab} />

                    {activeTab === 'Venue Details' && <VenueDetailsPanel />}
                    {activeTab === 'ICTCS Details' && <IctcsDetailsPanel />}
                    {activeTab === 'Audio Details' && <AudioDetailsPanel />}
                    {activeTab === 'Transportation Details' && <TransportationDetailsPanel />}
                    {activeTab === 'Food Details' && <FoodRefreshmentDetailsPanel />}
                    {activeTab === 'Accommodation Details' && <AccommodationDetailsPanel />}
                    {activeTab === 'Purchase Details' && <PurchaseDetailsPanel />}
                    {activeTab === 'Media Details' && <MediaDetailsPanel />}
                    {!['Venue Details', 'ICTCS Details', 'Audio Details', 'Transportation Details', 'Food Details', 'Accommodation Details', 'Purchase Details', 'Media Details'].includes(activeTab) && (
                        <EventRequisitionDetailsPanel activeTab={activeTab} />
                    )}
                </section>
            </main>

            {rejectionReasonPopupOpen && <RejectionReasonPopup onClose={() => setRejectionReasonPopupOpen(false)} />}
        </>
    )
}

export default EventDetailsPage
