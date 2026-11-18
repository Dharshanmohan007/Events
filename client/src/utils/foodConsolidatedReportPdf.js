import { jsPDF } from 'jspdf'

const MARGIN = 14
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const isInvalidValue = (value) => {
    if (value === undefined || value === null) return true
    if (typeof value === 'number') return !Number.isFinite(value) || value === 0
    if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed === '' || /^-+$/.test(trimmed) || (Number.isFinite(Number(trimmed)) && Number(trimmed) === 0)
    }
    return false
}
const hasRenderableValue = (value) => {
    if (isInvalidValue(value)) return false
    if (Array.isArray(value)) return value.some(hasRenderableValue)
    if (typeof value === 'object') return Object.values(value).some(hasRenderableValue)
    return true
}
const textValue = (value, fallback = '') => {
    if (isInvalidValue(value)) return fallback
    if (Array.isArray(value)) return value.filter(hasRenderableValue).map((item) => textValue(item, '')).filter(Boolean).join(', ') || fallback
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
}
const labelize = (value) => String(value).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase())

const getCountPair = (group = {}) => ({
    veg: group.vegCount ?? group.veg ?? group.Veg ?? group.vegetarian,
    nonVeg: group.nonVegCount ?? group.nonVeg ?? group.non_veg ?? group.NonVeg ?? group.nonVegetarian,
})

const flattenLines = (value, prefix = '') => {
    if (isInvalidValue(value)) return []
    if (Array.isArray(value)) {
        if (!value.length) return []
        return value.flatMap((item, index) => flattenLines(item, `${prefix || 'Item'} ${index + 1}`))
    }
    if (typeof value !== 'object') return [{ label: prefix || 'Value', value: String(value) }]
    return Object.entries(value).flatMap(([key, child]) => {
        const label = prefix ? `${prefix} / ${labelize(key)}` : labelize(key)
        return child && typeof child === 'object'
            ? flattenLines(child, label)
            : [{ label, value: textValue(child, '-') }]
    })
}

export const generateFoodConsolidatedReportPdf = ({ data, fromDate, toDate }) => {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    let y = 18
    const bottom = 282
    let contentLeft = MARGIN
    let contentWidth = CONTENT_WIDTH
    let activeEventCard = null

    const closeEventCardSegment = (endY) => {
        if (!activeEventCard) return
        const height = Math.max(5, Math.min(bottom, endY) - activeEventCard.startY)
        pdf.setDrawColor(207, 214, 225)
        pdf.setLineWidth(0.35)
        pdf.roundedRect(MARGIN, activeEventCard.startY, CONTENT_WIDTH, height, 1.8, 1.8, 'S')
    }

    const ensureSpace = (height) => {
        if (y + height > bottom) {
            if (activeEventCard) closeEventCardSegment(bottom)
            pdf.addPage()
            y = 18
            if (activeEventCard) {
                activeEventCard.startY = y
                const continuation = activeEventCard.name
                    ? `${activeEventCard.name} (continued)`
                    : 'Event details (continued)'
                const continuationLines = pdf.splitTextToSize(continuation, CONTENT_WIDTH - 10)
                const continuationHeight = Math.max(10, continuationLines.length * 4 + 5)
                pdf.setFillColor(246, 243, 251)
                pdf.setDrawColor(226, 221, 236)
                pdf.roundedRect(MARGIN + 0.5, y + 0.5, CONTENT_WIDTH - 1, continuationHeight, 1.5, 1.5, 'FD')
                pdf.setFont('helvetica', 'bold')
                pdf.setFontSize(8.5)
                pdf.setTextColor(81, 38, 150)
                pdf.text(continuationLines, MARGIN + 4, y + 6)
                y += continuationHeight + 3
            }
        }
    }
    const wrappedHeight = (value, width, fontSize = 9) => {
        pdf.setFontSize(fontSize)
        const lines = pdf.splitTextToSize(String(value), width)
        return { lines, height: Math.max(4.5, lines.length * (fontSize * 0.42)) }
    }
    const writeText = (value, x, top, width, options = {}) => {
        const { fontSize = 9, color = [55, 65, 81], bold = false, align = 'left' } = options
        const wrapped = wrappedHeight(value, width, fontSize)
        pdf.setFont('helvetica', bold ? 'bold' : 'normal')
        pdf.setFontSize(fontSize)
        pdf.setTextColor(...color)
        pdf.text(wrapped.lines, align === 'center' ? x + width / 2 : x, top + fontSize * 0.35, align === 'center' ? { align: 'center' } : undefined)
        return wrapped.height
    }
    const sectionTitle = (title, top = 7) => {
        ensureSpace(13)
        pdf.setFillColor(241, 237, 252)
        pdf.roundedRect(contentLeft, y, contentWidth, 9, 1.5, 1.5, 'F')
        writeText(title, contentLeft + 3, y + 1, contentWidth - 6, { fontSize: 10, color: [81, 38, 150], bold: true })
        y += top + 2
    }
    const drawGridTable = (headers, rows, widths, { labelColumns = [], centerColumns = [], fontSize = 8.5 } = {}) => {
        const paddingX = 3
        const paddingY = 2.5
        const headerHeight = headers
            ? Math.max(8, ...headers.map((header, index) => wrappedHeight(header, widths[index] - paddingX * 2, 8).height + paddingY * 2))
            : 0
        const drawHeader = () => {
            if (!headers) return
            let x = contentLeft
            headers.forEach((header, index) => {
                pdf.setFillColor(232, 226, 246)
                pdf.setDrawColor(215, 208, 229)
                pdf.rect(x, y, widths[index], headerHeight, 'FD')
                writeText(header, x + paddingX, y + paddingY, widths[index] - paddingX * 2, { fontSize: 8, color: [76, 52, 119], bold: true })
                x += widths[index]
            })
            y += headerHeight
        }
        if (headers) {
            ensureSpace(headerHeight + 6)
            drawHeader()
        }
        rows.forEach((row, rowIndex) => {
            const cells = row.map((cell) => isInvalidValue(cell) ? '' : textValue(cell, ''))
            const cellLayouts = cells.map((cell, index) => wrappedHeight(cell, widths[index] - paddingX * 2, fontSize))
            const rowHeight = Math.max(7.5, ...cellLayouts.map((layout) => layout.height + paddingY * 2))
            const previousPage = pdf.getNumberOfPages()
            ensureSpace(rowHeight + (headers ? headerHeight : 0) + 2)
            if (headers && pdf.getNumberOfPages() > previousPage) drawHeader()
            let x = contentLeft
            cells.forEach((cell, index) => {
                const isLabel = labelColumns.includes(index)
                const background = isLabel ? [246, 243, 251] : (rowIndex % 2 ? [250, 251, 253] : [255, 255, 255])
                pdf.setFillColor(...background)
                pdf.setDrawColor(222, 226, 234)
                pdf.setLineWidth(0.2)
                pdf.rect(x, y, widths[index], rowHeight, 'FD')
                writeText(cell, x + (centerColumns.includes(index) ? 0 : paddingX), y + paddingY, widths[index] - paddingX * 2, {
                    fontSize,
                    color: isLabel ? [83, 91, 107] : [38, 46, 61],
                    bold: isLabel,
                    align: centerColumns.includes(index) ? 'center' : 'left',
                })
                x += widths[index]
            })
            y += rowHeight
        })
        y += 2
    }
    const keyValueRows = (rows) => {
        const values = rows.map(({ label, value }) => {
            if (isInvalidValue(label) || isInvalidValue(value)) return null
            return [textValue(label), textValue(value)]
        })
        for (let index = 0; index < values.length; index += 2) {
            const fields = [values[index], values[index + 1]].filter(Boolean)
            if (fields.length === 2) {
                const scale = contentWidth / 182
                drawGridTable(null, [[fields[0][0], fields[0][1], fields[1][0], fields[1][1]]], [34 * scale, 57 * scale, 34 * scale, 57 * scale], { labelColumns: [0, 2] })
            } else if (fields.length === 1) {
                const scale = contentWidth / 182
                drawGridTable(null, [fields[0]], [44 * scale, 138 * scale], { labelColumns: [0] })
            }
        }
    }
    const foodTypes = (details) => {
        const source = Array.isArray(details?.foodTypes)
            ? details.foodTypes
            : details?.foodTypes && typeof details.foodTypes === 'object'
                ? Object.entries(details.foodTypes).map(([type, value]) => ({ type, ...(value || {}) }))
                : []
        const list = source.filter(hasRenderableValue)
        if (!list.length) {
            return false
        }

        sectionTitle('Food types', 5)
        list.forEach((item) => {
            if (hasRenderableValue(item?.type)) {
                ensureSpace(12)
                const typeLabel = textValue(item.type)
                pdf.setFillColor(248, 249, 252)
                pdf.roundedRect(contentLeft, y, contentWidth, 7, 1, 1, 'F')
                writeText(typeLabel, contentLeft + 2, y + 1, contentWidth - 4, { fontSize: 9, color: [35, 45, 65], bold: true })
                y += 9
            }
            const groups = [
                ['Participants', item?.participants],
                ['VIP Guests', item?.vipGuests ?? item?.vip],
                ['Trainer', item?.trainer],
                ['Placement', item?.placement],
            ]
            groups.forEach(([label, group]) => {
                const pair = getCountPair(group || {})
                keyValueRows([
                    { label: `${label} - Veg`, value: pair.veg },
                    { label: `${label} - Non-Veg`, value: pair.nonVeg },
                ])
            })
            const venues = item?.venueWiseDetails
            const venueLines = flattenLines(venues).filter(({ label, value }) => hasRenderableValue(label) && hasRenderableValue(value))
            if (venueLines.length) {
                sectionTitle('Venue-wise details', 5)
                keyValueRows(venueLines)
            }
            const known = new Set(['type', 'participants', 'vipGuests', 'vip', 'trainer', 'placement', 'venueWiseDetails'])
            const extra = Object.entries(item || {}).filter(([key, value]) => !known.has(key) && hasRenderableValue(value))
            const extraRows = flattenLines(Object.fromEntries(extra))
            if (extraRows.length) keyValueRows(extraRows)
            y += 3
        })
        return true
    }

    pdf.setFillColor(21, 28, 44)
    pdf.rect(0, 0, PAGE_WIDTH, 39, 'F')
    writeText('Food Consolidated Report', MARGIN, 13, CONTENT_WIDTH, { fontSize: 18, color: [255, 255, 255], bold: true })
    const validRange = [fromDate, toDate].filter(hasRenderableValue).map((date) => textValue(date))
    if (validRange.length === 2) writeText(`Date range: ${validRange[0]} to ${validRange[1]}`, MARGIN, 23, CONTENT_WIDTH, { fontSize: 10, color: [212, 199, 244] })
    else if (validRange.length === 1) writeText(`Date: ${validRange[0]}`, MARGIN, 23, CONTENT_WIDTH, { fontSize: 10, color: [212, 199, 244] })
    writeText(`Generated: ${new Date().toLocaleDateString('en-IN')}`, MARGIN, 31, CONTENT_WIDTH, { fontSize: 8.5, color: [190, 198, 212] })
    y = 48

    const dates = Array.isArray(data) ? data : []

    dates.forEach((dateGroup) => {
        ensureSpace(18)
        const date = hasRenderableValue(dateGroup?.date) ? textValue(dateGroup.date) : ''
        const eventCount = dateGroup?.eventCount
        const eventCountLabel = hasRenderableValue(eventCount)
            ? `${textValue(eventCount)} event${Number(eventCount) === 1 ? '' : 's'}`
            : ''
        const dateHeading = [date, eventCountLabel].filter(Boolean).join(' | ')
        if (dateHeading) sectionTitle(dateHeading)
        const events = (Array.isArray(dateGroup?.events) ? dateGroup.events : []).filter((event) =>
            hasRenderableValue(event?.eventName)
            || hasRenderableValue(event?.organizer?.name)
            || hasRenderableValue(event?.organizingDepartment)
            || hasRenderableValue(event?.foodDetails)
        )

        events.forEach((event, index) => {
            const eventName = hasRenderableValue(event?.eventName) ? textValue(event.eventName) : ''
            const eventNameHeight = eventName ? wrappedHeight(eventName, CONTENT_WIDTH - 24, 11).height + 8 : 4
            ensureSpace(eventNameHeight + 22)
            activeEventCard = { name: eventName, startY: y }
            contentLeft = MARGIN + 4
            contentWidth = CONTENT_WIDTH - 8
            if (eventName) {
                pdf.setFillColor(246, 243, 251)
                pdf.roundedRect(contentLeft, y + 3, contentWidth, eventNameHeight, 1.5, 1.5, 'F')
                writeText(eventName, contentLeft + 3, y + 5, contentWidth - 6, { fontSize: 11, color: [55, 42, 86], bold: true })
                y += eventNameHeight + 7
            } else {
                y += 7
            }
            keyValueRows([
                { label: 'Organizer Name', value: event?.organizer?.name },
                { label: 'Organizing Department', value: event?.organizingDepartment },
            ])

            const details = event?.foodDetails
            const detailList = (Array.isArray(details) ? details : [details]).filter(hasRenderableValue)
            detailList.forEach((food, detailIndex) => {
                sectionTitle(detailList.length > 1 ? `Food details ${detailIndex + 1}` : 'Food details', 5)
                keyValueRows([
                    { label: 'Resource Person Type', value: food?.resourcePersonType },
                    { label: 'Number of Resource Persons', value: food?.numberOfResourcePersons },
                    { label: 'Internal Accompanying Staff', value: food?.numberOfInternalAccompanyingStaff },
                    { label: 'Total Veg Count', value: food?.vegCount },
                    { label: 'Total Non-Veg Count', value: food?.nonVegCount },
                ])
                const mealRows = [
                    { label: 'Breakfast', value: food?.breakfastCount },
                    { label: 'Lunch', value: food?.lunchCount },
                    { label: 'Dinner', value: food?.dinnerCount },
                ]
                if (mealRows.some(({ value }) => hasRenderableValue(value))) {
                    sectionTitle('Meal summary', 5)
                    keyValueRows(mealRows)
                }
                foodTypes(food)
                const known = new Set(['resourcePersonType', 'numberOfResourcePersons', 'numberOfInternalAccompanyingStaff', 'breakfastCount', 'lunchCount', 'dinnerCount', 'vegCount', 'nonVegCount', 'foodTypes'])
                const extras = Object.entries(food || {}).filter(([key, value]) => !known.has(key) && hasRenderableValue(value))
                const extraRows = flattenLines(Object.fromEntries(extras))
                if (extraRows.length) {
                    sectionTitle('Additional food details', 5)
                    keyValueRows(extraRows)
                }
            })
            closeEventCardSegment(y + 4)
            activeEventCard = null
            contentLeft = MARGIN
            contentWidth = CONTENT_WIDTH
            y += 9
        })
    })

    const pageCount = pdf.getNumberOfPages()
    for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page)
        pdf.setDrawColor(225, 228, 235)
        pdf.line(MARGIN, 287, PAGE_WIDTH - MARGIN, 287)
        writeText('Food Consolidated Report', MARGIN, 290, 80, { fontSize: 7.5, color: [120, 128, 143] })
        const pageText = `Page ${page} of ${pageCount}`
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7.5)
        pdf.setTextColor(120, 128, 143)
        pdf.text(pageText, PAGE_WIDTH - MARGIN, 292, { align: 'right' })
    }
    const safeFrom = String(fromDate).replace(/[^0-9-]/g, '')
    const safeTo = String(toDate).replace(/[^0-9-]/g, '')
    pdf.save(`food-consolidated-report-${safeFrom}-to-${safeTo}.pdf`)
}
