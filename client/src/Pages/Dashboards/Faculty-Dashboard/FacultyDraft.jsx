import React from 'react'
import { CircleAlert } from 'lucide-react'

const FacultyDraft = () => {
    return (
        <section className="mt-6 rounded-lg border border-dashed border-[#283247] bg-[#151d2e] px-5 py-3">
            <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#B692FF] text-white">
                        <CircleAlert size={18} />
                    </div>
                    <div>
                        <h2 className="text-md font-medium text-white">Attention required</h2>
                        <p className="
                        
                        text-xs text-[#FFFFFF80]">
                            Scholarship event form is partially filled, Do you want to continue?
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="rounded-md  bg-linear-to-r from-[#853FF9] to-[#4F2593] cursor-pointer hover:bg-linear-to-l hover:from-[#853FF9] hover:to-[#4F2593] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#8B5CF6]">
                        Yes, Continue
                    </button>
                    <button className="rounded-md border border-[#F20768] px-5 py-2.5 text-sm cursor-pointer font-medium text-[#F20768] transition hover:bg-[#F207681A]">
                        No
                    </button>
                </div>
            </div>
        </section>
    )
}

export default FacultyDraft
