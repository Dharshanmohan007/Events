import React, { useState } from 'react'
import { FileText } from 'lucide-react'

const displayValue = (value) => (value === null || value === undefined || value === '' ? '-' : String(value))

const formatDate = (dateValue) => {
  if (!dateValue) return '-'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return dateValue
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const SplitInfoRow = ({ items }) => {
  const single = items.length === 1
  return (
    <div className={`${single ? 'grid-cols-1' : 'grid-cols-2'} grid rounded-lg border border-[#374155]/70 bg-[#242B3D] px-4 py-5`}>
      {items.map(([label, value], index) => (
        <div key={label} className={`flex items-center justify-between gap-5 px-2 text-sm ${!single && index === 0 ? 'border-r border-[#6b7280]/50 pr-9' : !single ? 'pl-5' : ''}`}>
          <span className="text-[#CBC3D7]/75">{label}</span>
          <span className="font-semibold text-white">{displayValue(value)}</span>
        </div>
      ))}
    </div>
  )
}

const SpecialRequirement = ({ text }) => (
  <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-5">
    <div className="mb-4 flex items-center gap-2 text-base font-medium text-[#E6E2F0]">
      <FileText size={16} />
      Special Requirement
    </div>
    <p className="text-sm font-medium leading-7 text-[#E6E2F0]">{displayValue(text)}</p>
  </section>
)

const buildGiftRows = (data) => {
  const giftItems = data.giftItems || []
  const trophies = giftItems.flatMap((g) => g.trophy || [])
  const cashPrize = giftItems.reduce((sum, g) => sum + (Number(g.cashPrizeAmount) || 0), 0)
  const giftsCount = giftItems.reduce((sum, g) => sum + (Number(g.giftsQty ?? g.glassCupQty) || 0), 0)
  const vouchers = giftItems.flatMap((g) => (g.voucher || []).filter((v) => Number(v.quantity) > 0))

  const rows = []

  for (let i = 0; i < trophies.length; i += 2) {
    rows.push(trophies.slice(i, i + 2).map((t) => [`${t.trophyType} Trophy Quantity`, displayValue(t.quantity)]))
  }

  const prizeItems = []
  if (cashPrize > 0) prizeItems.push(['Cash Prize Amount', `₹${cashPrize}`])
  if (giftsCount > 0) prizeItems.push(['Gift Count', displayValue(giftsCount)])
  if (data.registrationKitNeeded) prizeItems.push(['Registration Kit Quantity', displayValue(data.registrationKitQty)])
  for (let i = 0; i < prizeItems.length; i += 2) {
    rows.push(prizeItems.slice(i, i + 2))
  }

  vouchers.forEach((v) => {
    rows.push([
      ['Voucher Worth', displayValue(v.voucherWorth)],
      [`Voucher Worth Quantity (${v.voucherWorth})`, displayValue(v.quantity)],
    ])
  })

  return rows
}

const RecipientSection = ({ title, data }) => {
  const rows = buildGiftRows(data)

  return (
    <section className="rounded-lg border border-[#465168] bg-[#1B2334] p-5">
      <h3 className="text-lg font-semibold text-[#8F5BFF]">{title}</h3>
      <div className="mt-5 space-y-4">
        {rows.length > 0 ? (
          rows.map((row, i) => (
            <SplitInfoRow key={i} items={row} />
          ))
        ) : (
          <p className="py-2 text-center text-sm text-[#CBC3D7]/65">No items specified for {title.toLowerCase()}.</p>
        )}
        {data.specialRequirements && <SpecialRequirement text={data.specialRequirements} />}
      </div>
    </section>
  )
}

const PurchaseDetailsPanel = ({ purchaseDetails, eventSchedule = [] }) => {
  const [activeDay, setActiveDay] = useState(0)
  const purchases = purchaseDetails?.purchases || []
  const dayCount = Math.max(eventSchedule.length, purchases.length, 1)
  const selectedDay = Math.min(activeDay, dayCount - 1)
  const dayPurchase = purchases[selectedDay]
  const requirementReqs = dayPurchase?.requirementNeeded || []
  const requirementRows = []
  for (let i = 0; i < requirementReqs.length; i += 2) {
    requirementRows.push(requirementReqs.slice(i, i + 2))
  }

  if (!purchaseDetails) return <p className="py-10 text-center text-sm text-[#CBC3D7]/65">No purchase details are available.</p>

  return (
    <div className="space-y-5">
      {dayCount > 1 && (
        <nav className="flex border-b border-[#374155]" aria-label="Purchase event days">
          {Array.from({ length: dayCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`border-b-2 px-5 py-2 text-[10px] font-medium transition ${
                selectedDay === index
                  ? 'border-[#8B3DFF] text-[#9F68FF]'
                  : 'border-transparent text-[#CBC3D7]/75 hover:text-white'
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </nav>
      )}

      {dayPurchase ? (
        <>
          {/* Day Index & Delivery Date */}
          <SplitInfoRow
            items={[
              ['Day', `Day ${dayPurchase.dayIndex || selectedDay + 1}`],
              ['Delivery Date', formatDate(dayPurchase.deliveryDate)],
            ]}
          />

          {/* Requirements Needed */}
          {requirementRows.length > 0 && (
            <section className="rounded-lg border border-[#465168] bg-[#1B2334] p-5">
              <h3 className="text-lg font-semibold text-[#8F5BFF]">Equipment Requirements</h3>
              <div className="mt-4 space-y-3">
                {requirementRows.map((row, index) => (
                  <SplitInfoRow
                    key={index}
                    items={row.map((req) => [`${req.type} Hard Copy Quantity`, displayValue(req.hardCount)])}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Required For */}
          {(dayPurchase.requiredFor || []).length > 0 && (
            <SplitInfoRow items={[['Required For', dayPurchase.requiredFor.join(', ')]]} />
          )}

          {/* Students Section */}
          <RecipientSection title="Students" data={dayPurchase.students || { giftItems: [] }} />

          {/* Guests Section */}
          <RecipientSection title="Guests" data={dayPurchase.guests || { giftItems: [] }} />
        </>
      ) : (
        <p className="py-8 text-center text-sm text-[#CBC3D7]/65">No purchase details were submitted for Day {selectedDay + 1}.</p>
      )}
    </div>
  )
}

export default PurchaseDetailsPanel
