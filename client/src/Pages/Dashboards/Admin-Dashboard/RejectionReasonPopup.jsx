import { X } from 'lucide-react'
import React from 'react'

const RejectionReasonPopup = ({ value = '', onChange, onSubmit, submitting = false, onClose }) => {
    return (
        <>

            <div className="tint-container fixed inset-0 bg-black/80 z-10"></div>
            <div className="popup z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#171F31] border border-white/10 w-120  rounded-lg px-4 py-4 ">
                <header className='flex items-center gap-2 justify-between'>
                    <div>
                        <h1 className='text-gray-50'>Reason for rejection</h1>
                        <h1 className='text-white/70 text-sm'>The request was rejected for the following reason</h1>
                    </div>

                    <button className="text-white hover:text-white bg-gray-900 rounded-full w-9 h-9 flex items-center justify-center group" onClick={onClose} disabled={submitting}>
                        <X size={16} className='group-hover:rotate-180 transition-all duration-300' />
                    </button>
                </header>
                <textarea
                    name="rejectionReason"
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="bg-[#171F31] mt-4 min-h-25 max-h-30  rounded-lg border border-white/20 w-full text-white placeholder:text-white/50 focus:outline-none focus:ring focus:ring-white p-3"
                ></textarea>
                <button
                    onClick={onSubmit}
                    disabled={submitting}
                    className='bg-linear-to-r from-[#823DF2] to-[#502697] text-white py-2 w-full cursor-pointer hover:bg-linear-to-l hover:from-[#823DF2] hover:to-[#502697] transition-all duration-600 rounded-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {submitting ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </>
    )
}

export default RejectionReasonPopup