import { jsPDF } from 'jspdf'

const MARGIN = 14
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const BOTTOM = 282

const hasValue = (value) => {
    if (value === undefined || value === null || value === '') return false
    if (typeof value === 'number') return Number.isFinite(value) && value !== 0
    if (typeof value === 'string') return value.trim() !== '' && !/^-+$/.test(value.trim()) && !(Number.isFinite(Number(value)) && Number(value) === 0)
    if (Array.isArray(value)) return value.some(hasValue)
    if (typeof value === 'object') return Object.values(value).some(hasValue)
    return true
}

const valueText = (value, fallback = '') => {
    if (!hasValue(value)) return fallback
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.filter(hasValue).map((item) => valueText(item, '')).filter(Boolean).join(', ') || fallback
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
}

const formatDateTime = (value) => {
    if (!hasValue(value)) return ''
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

const labelize = (value) => String(value).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase())

export const generateAccommodationConsolidatedReportPdf = ({ data, fromDate, toDate }) => {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    let y = 48
    let left = MARGIN
    let width = CONTENT_WIDTH
    let activeEvent = null

    const closeEventCard = (endY) => {
        if (!activeEvent) return
        const height = Math.max(5, Math.min(BOTTOM, endY) - activeEvent.startY)
        pdf.setDrawColor(207, 214, 225)
        pdf.setLineWidth(0.35)
        pdf.roundedRect(MARGIN, activeEvent.startY, CONTENT_WIDTH, height, 1.8, 1.8, 'S')
    }

    const ensureSpace = (height) => {
        if (y + height <= BOTTOM) return
        if (activeEvent) closeEventCard(BOTTOM)
        pdf.addPage()
        y = 18
        if (activeEvent) {
            activeEvent.startY = y
            const title = `${activeEvent.name || 'Accommodation details'} (continued)`
            const lines = pdf.splitTextToSize(title, CONTENT_WIDTH - 10)
            const titleHeight = Math.max(10, lines.length * 4 + 5)
            pdf.setFillColor(246, 243, 251)
            pdf.setDrawColor(226, 221, 236)
            pdf.roundedRect(MARGIN + 0.5, y + 0.5, CONTENT_WIDTH - 1, titleHeight, 1.5, 1.5, 'FD')
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(8.5)
            pdf.setTextColor(81, 38, 150)
            pdf.text(lines, MARGIN + 4, y + 6)
            y += titleHeight + 3
        }
    }

    const textLayout = (value, cellWidth, fontSize = 8.5) => {
        pdf.setFontSize(fontSize)
        const lines = pdf.splitTextToSize(String(value), Math.max(1, cellWidth))
        return { lines, height: Math.max(4.5, lines.length * fontSize * 0.42) }
    }

    const writeText = (value, x, top, cellWidth, { fontSize = 9, color = [55, 65, 81], bold = false } = {}) => {
        const layout = textLayout(value, cellWidth, fontSize)
        pdf.setFont('helvetica', bold ? 'bold' : 'normal')
        pdf.setFontSize(fontSize)
        pdf.setTextColor(...color)
        pdf.text(layout.lines, x, top + fontSize * 0.35)
        return layout.height
    }

    const sectionTitle = (title, extra = 2) => {
        ensureSpace(13)
        pdf.setFillColor(241, 237, 252)
        pdf.roundedRect(left, y, width, 9, 1.5, 1.5, 'F')
        writeText(title, left + 3, y + 1, width - 6, { fontSize: 10, color: [81, 38, 150], bold: true })
        y += 9 + extra
    }

    const drawRows = (rows) => {
        const paddingX = 3
        const paddingY = 2.5
        const scale = width / 182
        rows.forEach((row, rowIndex) => {
            const entries = row.filter((entry) => entry && hasValue(entry.value)).map((entry) => [entry.label, valueText(entry.value)])
            if (!entries.length) return
            const cells = entries.length > 1
                ? [entries[0][0], entries[0][1], entries[1][0], entries[1][1]]
                : [entries[0][0], entries[0][1]]
            const widths = entries.length > 1
                ? [34 * scale, 57 * scale, 34 * scale, 57 * scale]
                : [44 * scale, 138 * scale]
            const heights = cells.map((cell, index) => textLayout(cell, widths[index] - paddingX * 2, 8.5).height)
            const rowHeight = Math.max(7.5, ...heights.map((height) => height + paddingY * 2))
            ensureSpace(rowHeight + 2)
            let x = left
            cells.forEach((cell, index) => {
                const isLabel = entries.length > 1 ? index === 0 || index === 2 : index === 0
                pdf.setFillColor(...(isLabel ? [246, 243, 251] : (rowIndex % 2 ? [250, 251, 253] : [255, 255, 255])))
                pdf.setDrawColor(222, 226, 234)
                pdf.setLineWidth(0.2)
                pdf.rect(x, y, widths[index], rowHeight, 'FD')
                writeText(cell, x + paddingX, y + paddingY, widths[index] - paddingX * 2, {
                    fontSize: 8.5,
                    color: isLabel ? [83, 91, 107] : [38, 46, 61],
                    bold: isLabel,
                })
                x += widths[index]
            })
            y += rowHeight
        })
        y += 2
    }

    const keyValueRows = (entries) => {
        const present = entries.filter(({ label, value }) => hasValue(label) && hasValue(value))
        const rows = []
        for (let index = 0; index < present.length; index += 2) rows.push(present.slice(index, index + 2))
        drawRows(rows)
    }

    pdf.setFillColor(21, 28, 44)
    pdf.rect(0, 0, PAGE_WIDTH, 39, 'F')
    writeText('Accommodation Consolidated Report', MARGIN, 13, CONTENT_WIDTH, { fontSize: 18, color: [255, 255, 255], bold: true })
    writeText(`Date range: ${fromDate} to ${toDate}`, MARGIN, 23, CONTENT_WIDTH, { fontSize: 10, color: [212, 199, 244] })
    writeText(`Generated: ${new Date().toLocaleDateString('en-IN')}`, MARGIN, 31, CONTENT_WIDTH, { fontSize: 8.5, color: [190, 198, 212] })

    const dateGroups = Array.isArray(data) ? data : []
    dateGroups.forEach((group) => {
        const events = Array.isArray(group?.events) ? group.events : []
        ensureSpace(18)
        sectionTitle(`${valueText(group?.date, 'Date')} | ${valueText(group?.eventCount ?? events.length, '0')} event${Number(group?.eventCount ?? events.length) === 1 ? '' : 's'}`)

        events.forEach((event) => {
            const eventName = valueText(event?.eventName, 'Accommodation event')
            const titleLines = pdf.splitTextToSize(eventName, CONTENT_WIDTH - 24)
            const titleHeight = Math.max(10, titleLines.length * 4.6 + 8)
            ensureSpace(titleHeight + 22)
            activeEvent = { name: eventName, startY: y }
            left = MARGIN + 4
            width = CONTENT_WIDTH - 8

            pdf.setFillColor(246, 243, 251)
            pdf.roundedRect(left, y + 3, width, titleHeight, 1.5, 1.5, 'F')
            writeText(eventName, left + 3, y + 5, width - 6, { fontSize: 11, color: [55, 42, 86], bold: true })
            y += titleHeight + 7
            keyValueRows([
                { label: 'Event ID', value: event?.eventId },
                { label: 'Organizing department', value: event?.organizingDepartment },
                { label: 'Organizer', value: event?.organizer?.name },
                { label: 'Organizer email', value: event?.organizer?.email },
                { label: 'Organizer phone', value: event?.organizer?.phone },
            ])

            const details = Array.isArray(event?.accommodationDetails) ? event.accommodationDetails : []
            details.forEach((detail, detailIndex) => {
                sectionTitle(details.length > 1 ? `Accommodation details ${detailIndex + 1}` : 'Accommodation details', 5)
                keyValueRows([
                    { label: 'Check-in', value: formatDateTime(detail?.checkInDateTime) },
                    { label: 'Check-out', value: formatDateTime(detail?.checkOutDateTime) },
                    { label: 'Guest count', value: detail?.guestCount },
                    { label: 'Dine-in required', value: detail?.dineInRequired },
                    { label: 'Special requirements', value: detail?.specialRequirements },
                ])

                const guests = Array.isArray(detail?.guests) ? detail.guests : []
                if (guests.length) {
                    sectionTitle(`Guests (${guests.length})`, 5)
                    keyValueRows(guests.flatMap((guest, index) => [
                        { label: `Guest ${index + 1}`, value: guest?.name },
                        { label: 'Gender', value: guest?.gender },
                        { label: 'Mobile', value: guest?.mobile },
                    ]))
                }

                const rooms = Array.isArray(detail?.roomSelections) ? detail.roomSelections : []
                if (rooms.length) {
                    sectionTitle(`Room selections (${rooms.length})`, 5)
                    rooms.forEach((room, index) => {
                        keyValueRows([
                            { label: `Room ${index + 1}`, value: room?.roomNumber },
                            { label: 'Venue', value: room?.venue },
                            { label: 'Occupants', value: room?.occupantCount },
                            { label: 'Room ID', value: room?.roomId },
                            { label: 'Admin contacted', value: room?.adminContacted },
                            { label: 'Requires admin confirmation', value: room?.requiresAdminConfirmation },
                        ])
                    })
                }

                const dineInCounts = Array.isArray(detail?.dineInCounts) ? detail.dineInCounts : []
                if (dineInCounts.length) {
                    sectionTitle('Dine-in counts', 5)
                    keyValueRows(dineInCounts.map((item) => ({ label: valueText(item?.type, 'Type'), value: item?.count })))
                }

                const known = new Set(['checkInDateTime', 'checkOutDateTime', 'guestCount', 'dineInRequired', 'specialRequirements', 'guests', 'roomSelections', 'dineInCounts'])
                const extra = Object.entries(detail || {}).filter(([key, value]) => !known.has(key) && hasValue(value))
                if (extra.length) {
                    sectionTitle('Additional accommodation details', 5)
                    keyValueRows(extra.map(([key, value]) => ({ label: labelize(key), value: Array.isArray(value) ? value.map((item) => valueText(item)).join(', ') : value })))
                }
            })
            closeEventCard(y + 4)
            activeEvent = null
            left = MARGIN
            width = CONTENT_WIDTH
            y += 9
        })
    })

    if (dateGroups.length === 0) writeText('No accommodation events were found for the selected date range.', MARGIN, y, CONTENT_WIDTH, { fontSize: 9 })

    const pageCount = pdf.getNumberOfPages()
    for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page)
        pdf.setDrawColor(225, 228, 235)
        pdf.line(MARGIN, 287, PAGE_WIDTH - MARGIN, 287)
        writeText('Accommodation Consolidated Report', MARGIN, 290, 90, { fontSize: 7.5, color: [120, 128, 143] })
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7.5)
        pdf.setTextColor(120, 128, 143)
        pdf.text(`Page ${page} of ${pageCount}`, PAGE_WIDTH - MARGIN, 292, { align: 'right' })
    }

    pdf.save(`accommodation-consolidated-report-${fromDate}-to-${toDate}.pdf`)
}
