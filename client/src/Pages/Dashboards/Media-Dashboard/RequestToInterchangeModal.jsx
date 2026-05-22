import React from 'react'
import { ChevronDown, X } from 'lucide-react'

const RequestToInterchangeModal = ({ onClose, isInterchangeOpen }) => {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-4 poppins" onClick={onClose}>
            <div className="w-full max-w-[496px] rounded-lg bg-[#0b1326] px-5 py-4 shadow-2xl border border-gray-700" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white">Request to Interchange</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-6 w-6 transform transition-all hover:rotate-180 items-center justify-center rounded-full bg-[#2a3347] text-[#cfd5e5] hover:bg-[#37425a] hover:text-white"
                        aria-label="Close request to interchange modal"
                    >
                        <X size={16} className='' />
                    </button>
                </div>

                <form className="mt-7 space-y-5" onSubmit={(event) => event.preventDefault()}>
                    <label className="relative block">
                        <span className="absolute -top-2 left-2 bg-[#0b1326] px-1 text-[12px] font-medium text-white">
                            Interchange to*
                        </span>
                        <button
                            type="button"
                            className="flex h-8 w-full items-center justify-between rounded-[3px] border border-[#343b4a] bg-transparent p-4 text-left text-[12px] text-[#8f96a8]"
                        >
                            Karthick
                            <ChevronDown size={15} className="text-white" />
                        </button>
                    </label>

                    <label className="relative block">
                        <span className="absolute -top-2 left-2 bg-[#0b1326] px-1 text-[12px] font-medium text-white">
                            Reason for interchange*
                        </span>
                        <textarea
                            className="h-[117px] w-full  resize-none rounded-[3px] border border-[#343b4a] bg-transparent p-4 text-xs text-white outline-none placeholder:text-[#7f8799] focus:border-[#8B3DFF]"
                            placeholder="reason"
                        />
                    </label>

                    <button
                        type="submit"
                        className="h-9 w-full rounded-[4px] bg-linear-to-r from-[#8D3CF2] to-[#55279E] text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RequestToInterchangeModal
