import React from 'react'
import { Star, X } from 'lucide-react'

const PosterFeedbackPoupu = ({ feedback, onClose }) => {
    if (!feedback) return null

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 px-4 poppins" onClick={onClose}>
            <section className="relative w-full max-w-[540px]  rounded-lg bg-[#0b1326]  shadow-2xl" onClick={(event) => event.stopPropagation()}>

                <header className="px-6 py-3 flex items-center justify-between border-b border-[#20283a]">


                    <h2 className="text-lg font-semibold text-white">Feedback details</h2>     <button
                        type="button"
                        onClick={onClose}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2a3347] text-[#cfd5e5] transition-colors hover:bg-[#37425a] hover:text-white"
                        aria-label="Close feedback details"
                    >
                        <X size={15} className="transition-all duration-300 hover:rotate-180" />
                    </button>
                </header>

                <dl className="mt-6 space-y-4 text-xs py-5 px-6 ">
                    <div className="grid grid-cols-[120px_1fr] gap-3">
                        <dt className="font-semibold uppercase text-[#7f8799]">Event Name :</dt>
                        <dd className="font-medium  text-gray-100">{feedback.eventName}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-3">
                        <dt className="font-semibold uppercase text-[#7f8799]">Event Venue :</dt>
                        <dd className="font-medium text-gray-100">{feedback.eventVenue}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-3">
                        <dt className="font-semibold uppercase text-[#7f8799]">Event Date :</dt>
                        <dd className="font-medium text-gray-100">{feedback.eventDateRange}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-3">
                        <dt className="font-semibold uppercase text-[#7f8799]">Your Performance Rating :</dt>
                        <dd className="flex items-center gap-2 font-semibold text-gray-100">
                            <Star size={13} className="text-[#FFC107]" fill="currentColor" />
                            {feedback.rating}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-semibold uppercase text-[#7f8799]">Your Performance Feedback :</dt>
                        <dd className="mt-2 text-sm leading-5 text-gray-100">{feedback.fullFeedback}</dd>
                    </div>
                </dl>
            </section>
        </div>
    )
}

export default PosterFeedbackPoupu
