import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import Modal from '../../../Components/Modal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const FacultyDraft = ({ data }) => {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleContinue = () => {
        navigate('/')
    }

    const handleDeleteDraft = async () => {
        setIsModalOpen(false)
    }

    return (
        <>
            <section className="mt-6 rounded-lg border border-dashed border-[#283247] bg-[#151d2e] px-5 py-3">
                <div className="flex items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#B692FF] text-white">
                            <CircleAlert size={18} />
                        </div>
                        <div>
                            <h2 className="text-md font-medium text-white">Attention required</h2>
                            <p className="text-xs text-[#FFFFFF80]">
                                You have {data?.totalDrafts} unfinished event {data?.totalDrafts === 1 ? 'form' : 'forms'}. Do you want to continue?
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleContinue}
                            className="cursor-pointer rounded-md bg-linear-to-r from-[#853FF9] to-[#4F2593] px-5 py-3 text-sm font-medium text-white transition hover:bg-linear-to-l hover:from-[#853FF9] hover:to-[#4F2593]"
                        >
                            Yes, Continue
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="cursor-pointer rounded-md border border-[#F20768] px-5 py-2.5 text-sm font-medium text-[#F20768] transition hover:bg-[#F207681A]"
                        >
                            No
                        </button>
                    </div>
                </div>
            </section>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Keep as Draft">
                <p className="text-sm text-[#FFFFFF]/90">
                    Are you sure you want to keep this event as a draft?
                </p>
                <div className="mt-5 flex items-center justify-end gap-3">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="cursor-pointer rounded-md bg-linear-to-r from-[#853FF9] to-[#4F2593] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-linear-to-l hover:from-[#853FF9] hover:to-[#4F2593]"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => handleDeleteDraft()}
                        className="cursor-pointer rounded-md border border-[#F20768] px-5 py-2.5 text-sm font-medium text-[#F20768] transition hover:bg-[#F207681A]"
                    >
                        No
                    </button>
                </div>
            </Modal>
        </>
    )
}

export default FacultyDraft
