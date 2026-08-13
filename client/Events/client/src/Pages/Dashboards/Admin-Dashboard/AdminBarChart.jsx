import React, { useState, useEffect } from 'react'
import cylinder from '../../../assets/cylinder.svg'
import cylinderTop from '../../../assets/cylinder-top.svg'
import cylinderBottom from '../../../assets/cylinder-bottom.svg'

const AdminBarChart = ({ data = [
  {
    "count": 2,
    "department": "AIDS"
  },
  {
    "count": 1,
    "department": "CCE"
  },
  {
    "count": 2,
    "department": "CSE"
  },
  {
    "count": 1,
    "department": "ECE"
  },
  {
    "count": 1,
    "department": "EEE"
  },
  {
    "count": 2,
    "department": "IT"
  },
  {
    "count": 1,
    "department": "MATHS"
  },
  {
    "count": 1,
    "department": "Placement"
  },
  {
    "count": 1,
    "department": "Placement"
  },
  {
    "count": 4,
    "department": "Placement"
  },
  {
    "count": 2,
    "department": "IT"
  },
  {
    "count": 1,
    "department": "MATHS"
  },
  {
    "count": 1,
    "department": "Placement"
  },
  {
    "count": 1,
    "department": "Placement"
  },
  {
    "count": 3,
    "department": "Placement"
  }
] }) => {
   const chartData = data

const maxCount =
  chartData.length > 0
    ? Math.max(...chartData.map(item => item.count))
    : 0

    // useEffect(() => {
    //     if (data && data.length > 0) {
    //         setChartData(data)
    //         const max = Math.max(...data.map(item => item.count))
    //         setMaxCount(max)
    //     }
    // }, [data])

    // Calculate bar height as percentage of max count
    const getBarHeight = (count) => {
        if (maxCount === 0) return 0
        return (count / maxCount) * 100
    }

    return (
        <>
            <section className=" bg-[#171f31] rounded-lg p-4 w-[75%]">
                <h2 className="text-white text-base font-medium mb-4">
                    Faculty By Department
                </h2>

                {/* chart  */}
                <div className="chart-container flex gap-2 w-full">
                    {chartData.length > 0 ? (
                        chartData.map((item, index) => (
                            <div
                                key={index}
                                className="bar flex-1 min-w-0 flex flex-col items-center justify-end h-80 rounded-md px-1 py-3"
                            >
                                {/* Value */}
                                <span className="text-white text-xs mb-2 font-semibold">
                                    {item.count}
                                </span>

                                {/* Bar container */}
                                <div className="relative h-full flex items-end w-full">

                                    {/* Main bar */}
                                    <div className="w-full bg-gradient-to-b h-full from-[#192c4a] to-[#0b1f3a] rounded-t-lg flex items-end overflow-hidden transition-all duration-300"
                                    >

                                        {/* cylinder  */}
                                        <img src={cylinderTop} className=" top-cylinder absolute top-[-1.2px] w-full " />



                                        {/* Bottom highlight fill */}
                                        <div style={{ height: `${getBarHeight(item.count)}%` }} className="w-full h-full bg-gradient-to-r from-[#2164B7] relative to-blue-600/40 rounded-t-xl rounded-b-sm">
                                            <img src={cylinder} className=" top-cylinder absolute top-[-0px] rounded-t-xl w-full " />
                                            {/* <img src={cylinder} className=" top-cylinder absolute bottom-[0px] rounded-t-xl w-full " /> */}
                                        </div>

                                    </div>

                                </div>

                                {/* Label */}
                                <span className="text-gray-300 text-xs mt-2">
                                    {item.department}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 text-sm">No data available</div>
                    )}
                </div>
            </section>
        </>
    )
}

export default AdminBarChart