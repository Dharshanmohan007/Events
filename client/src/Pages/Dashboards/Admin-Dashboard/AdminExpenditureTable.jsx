import React, { useEffect, useState } from 'react'
import {
    Search,
    Check,
    ChevronDown,
    CalendarDays,
    ExternalLink,
} from "lucide-react";
import axios from 'axios';

const tabs = ["Event expenditures", "Individual expenditures"]

const AdminExpenditureTable = () => {
    // Auth 
    const token = localStorage.getItem('token')

    // states 
    const [individualExpenditureList, setIndividualExpenditureList] = useState([])
    const [selectedTab, setselectedTab] = useState('Event expenditures')

    // functions 
    const fetchIndividualList = async () => {
        try {

            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/individual/expenditure`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log("individual expenditure list : ", res)
        } catch (error) {
            console.error(error)
        }


    }

    const fetchEventsList = async () => {
        try {

            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/event-expenditures`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log("individual expenditure list : ", res)
        } catch (error) {
            console.error(error)
        }


    }


    useEffect(() => {
        // fetchIndividualList();
        fetchEventsList();
    }, [])

    return (
        <>

            <div className="header mx-7 mt-4">
                <h1 className="text-xl font-medium text-white">Expenditure Lists</h1>

                <div className="tabs mt-4 flex items-center gap-3 text-white border-b border-gray-600">
                    {tabs.map((item) => {
                        return <button onClick={() => setselectedTab(item)} className={`pb-3 px-3 ${selectedTab == item ? "border-b border-violet-700 text-violet-500 font-semibold" : "cursor-pointer"}`}>{item}</button>
                    })}
                </div>
            </div>


            {/* -------------------------- Events expenditure table  ----------------------- */}
            {selectedTab == "Event expenditures" ? <div className="w-[96%] mt-4 m-auto min-h-[calc(100vh-210px)] overflow-auto max-h-[calc(100vh-110px)] bg-[#171f31] rounded-xl">

                {/* Header */}
                <div className="flex items-center justify-between px-3  py-3">

                    <h2 className="text-[18px] text-white font-medium">
                        Events Expenditure List{" "}
                        <span className="text-[#a855f7]">( 0 )</span>
                    </h2>

                    <div className="flex items-center gap-2">

                        {/* Search */}
                        <div className="flex h-7 w-[275px] items-center gap-2 rounded-full border border-[#30394d] bg-[#222b3e] py-4 px-3">
                            <Search size={14} className="text-gray-500" />

                            <input
                                type="text"
                                placeholder="Search events, venues"
                                className="w-full text-[14px] text-white outline-none placeholder:text-gray-500"
                            />
                        </div>



                        {/* Date */}
                        <button className="flex h-7 items-center gap-2 rounded-md border border-[#30394d] bg-[#222b3e] px-2.5 text-[12px] text-gray-300">
                            <CalendarDays size={10} />
                            15/03/2026
                        </button>

                    </div>
                </div>

                {/* Table */}
                <div className="w-full">

                    {/* Table Header */}
                    <div className="grid grid-cols-[1.1fr_1.1fr_1.35fr_1.35fr_1.35fr_0.4fr] border-y border-[#252e42] bg-[#1c2537] px-2 py-2">

                        <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
                            Event
                        </p>

                        <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
                            Required Date
                        </p>

                        <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
                            Approved Status
                        </p>

                        <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
                            Acknowledge Status
                        </p>

                        <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
                            Event Status
                        </p>

                        <p className="text-right text-[12px] font-medium uppercase tracking-wide text-gray-500">
                            Action
                        </p>

                    </div>

                    {/* Row 1 */}
                    <div className="grid grid-cols-[1.1fr_1.1fr_1.35fr_1.35fr_1.35fr_0.4fr] items-center border-b border-[#252e42] px-2 py-2.5">

                        <p className="text-[12px] text-gray-200">Transport</p>

                        <p className="text-[12px] text-gray-300">15-03-2026</p>

                        <p className="text-[12px] text-emerald-400">
                            <span className="mr-1">•</span>Approved
                        </p>

                        <p className="text-[12px] text-emerald-400">
                            <span className="mr-1">•</span>Acknowledged
                        </p>

                        <p className="text-[12px] text-emerald-400">
                            <span className="mr-1">•</span>Closed
                        </p>

                        <button className="flex justify-end text-gray-400 hover:text-white">
                            <ExternalLink size={10} />
                        </button>

                    </div>





                </div>
            </div> : ""}
        </>
    )
}

export default AdminExpenditureTable