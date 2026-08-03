import React, { useState } from 'react'
import { Download, Filter, Search } from 'lucide-react'

const defaultRows = Array.from({ length: 12 }, (_, index) => ({
    eventName: 'Welcome Freshers',
    department: index % 2 === 0 ? 'CSE' : 'AIML',
    requesterName: index % 2 === 0 ? 'Dr. Sarah Jenkins' : 'Dr. Arun Kumar',
    requesterPhone: index % 2 === 0 ? '+91 98765 43210' : '+91 98765 12340',
    requiredDate: '15-03-2026',
    status: [1, 5, 8].includes(index) ? 'Not Completed' : 'Completed',
}))

const Status = ({ status }) => {
    const completed = status === 'Completed'

    return (
        <span className={`inline-flex items-center gap-2 font-semibold ${completed ? 'text-[#20D18C]' : 'text-[#F20768]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${completed ? 'bg-[#20D18C]' : 'bg-[#F20768]'}`} />
            {status}
        </span>
    )
}

const RequesterReportsPage = ({
    Header,
    rows = defaultRows,
    title = 'Reports',
    description = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    downloadPrefix = 'request',
}) => {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredRows = rows.filter((row) => (
        `${row.eventName} ${row.department} ${row.requesterName} ${row.requesterPhone} ${row.requiredDate} ${row.status}`.toLowerCase().includes(searchTerm.toLowerCase())
    ))

    const handleDownload = (row) => {
        const csv = [
            'Event Name,Department,Requester Name,Requester Phone,Required Date,Status',
            [row.eventName, row.department, row.requesterName, row.requesterPhone, row.requiredDate, row.status].join(','),
        ].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${downloadPrefix}-${row.eventName.replaceAll(' ', '-')}-report.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <section className="min-h-screen overflow-auto bg-[#0b1326] text-white poppins table-custom-scrollbar">
            {Header}
            <main className="px-6 py-5">
                <h1 className="text-lg font-semibold">{title}</h1>
                <p className="mt-3 text-sm text-[#FFFFFF80]">{description}</p>

                <section className="mt-5 h-[calc(100vh-270px)] rounded-lg border border-[#2a3347] bg-[#151c2c] flex flex-col">
                    <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-4 flex-shrink-0">
                        <div className="flex h-9 w-[285px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#232A3C] px-3">
                            <Search size={14} className="text-[#8b93a4]" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]"
                                placeholder="Search events, requesters"
                            />
                        </div>
                        <button type="button" className="flex h-9 items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 text-xs text-white">
                            <Filter size={12} className="text-[#8b93a4]" />
                            Filters
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto table-custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-[#1B2335] text-xs uppercase text-[#7f8799]">
                                <tr>
                                    {['Event Name', 'Dept', 'Requester Name', 'Requester Phone', 'Required Date', 'Status', 'Action'].map((column) => (
                                        <th key={column} className="px-5 py-4 font-semibold last:text-center">{column}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((row, index) => (
                                    <tr key={`${row.eventName}-${index}`} className="border-t border-[#20283a] text-xs text-white">
                                        <td className="px-5 py-4 font-medium">{row.eventName}</td>
                                        <td className="px-5 py-4">{row.department}</td>
                                        <td className="px-5 py-4">{row.requesterName}</td>
                                        <td className="px-5 py-4">{row.requesterPhone}</td>
                                        <td className="px-5 py-4">{row.requiredDate}</td>
                                        <td className="px-5 py-4"><Status status={row.status} /></td>
                                        <td className="px-5 py-4 text-center">
                                            <button type="button" onClick={() => handleDownload(row)} className="inline-flex text-[#8b93a7] hover:text-white" aria-label="Download report">
                                                <Download size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </section>
    )
}

export default RequesterReportsPage
