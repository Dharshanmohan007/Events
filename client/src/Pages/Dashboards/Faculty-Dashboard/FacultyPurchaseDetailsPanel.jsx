import React, { useState } from 'react'
import { FileText } from 'lucide-react'

const displayValue = (value) => (value === null || value === undefined || value === '' ? '-' : String(value))

const SplitInfoRow = ({ items }) => (
  <div className="grid grid-cols-2 rounded-lg border border-[#374155]/70 bg-[#242B3D] px-4 py-5">
    {items.map(([label, value], index) => (
      <div key={label} className={`flex items-center justify-between gap-5 px-2 text-sm ${index === 0 ? 'border-r border-[#6b7280]/50 pr-9' : 'pl-5'}`}>
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className="font-semibold text-white">{displayValue(value)}</span>
      </div>
    ))}
  </div>
)

const SpecialRequirement = ({ text }) => (
  <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-5">
    <div className="mb-4 flex items-center gap-2 text-base font-medium text-[#E6E2F0]">
      <FileText size={16} />
      Special Requirement
    </div>
    <p className="text-sm font-medium leading-7 text-[#E6E2F0]">{displayValue(text)}</p>
  </section>
)

const GiftItemCard = ({ giftItem, title }) => {
  const trophies = giftItem.trophy || []
  const vouchers = giftItem.voucher || []
  const hasContent = giftItem.cashPrizeAmount > 0 || giftItem.glassCupQty > 0 || trophies.length > 0 || vouchers.length > 0

  if (!hasContent) return null

  return (
    <div className="rounded-lg border border-[#374155]/70 bg-[#242B3D] p-4">
      <h4 className="mb-3 text-sm font-semibold text-[#9F68FF]">{giftItem.giftType || title}</h4>
      <div className="space-y-3">
        {giftItem.cashPrizeAmount > 0 && (
          <SplitInfoRow items={[['Cash Prize Amount', `₹${giftItem.cashPrizeAmount}`]]} />
        )}
        {giftItem.glassCupQty > 0 && (
          <SplitInfoRow items={[['Glass Cup Quantity', giftItem.glassCupQty]]} />
        )}
        {trophies.map((trophy, i) => (
          <SplitInfoRow key={i} items={[[`Trophy - ${trophy.trophyType}`, trophy.quantity]]} />
        ))}
        {vouchers.filter((v) => Number(v.quantity) > 0).map((voucher, i) => (
          <SplitInfoRow key={i} items={[[`Voucher Worth (₹${voucher.voucherWorth})`, voucher.quantity]]} />
        ))}
      </div>
    </div>
  )
}

const RecipientSection = ({ title, data }) => {
  const giftItems = data.giftItems || []
  const filteredGifts = giftItems.filter(
    (item) => item.cashPrizeAmount > 0 || item.glassCupQty > 0 || (item.trophy || []).length > 0 || (item.voucher || []).length > 0
  )

  return (
    <section className="rounded-lg border border-[#465168] bg-[#1B2334] p-5">
      <h3 className="text-lg font-semibold text-[#8F5BFF]">{title}</h3>
      <div className="mt-5 space-y-4">
        {data.registrationKitNeeded && (
          <SplitInfoRow items={[['Registration Kit Required', 'Yes'], ['Registration Kit Quantity', data.registrationKitQty || 0]]} />
        )}
        {filteredGifts.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {filteredGifts.map((item, index) => (
              <GiftItemCard key={`${item.giftType}-${index}`} giftItem={item} title={`Gift ${index + 1}`} />
            ))}
          </div>
        )}
        {!data.registrationKitNeeded && filteredGifts.length === 0 && (
          <p className="py-2 text-center text-sm text-[#CBC3D7]/65">No items specified for {title.toLowerCase()}.</p>
        )}
        {data.specialRequirements && <SpecialRequirement text={data.specialRequirements} />}
      </div>
    </section>
  )
}

const FacultyPurchaseDetailsPanel = ({ purchaseDetails, eventSchedule = [] }) => {
  const [activeDay, setActiveDay] = useState(0)
  const purchases = purchaseDetails?.purchases || []
  const dayCount = Math.max(eventSchedule.length, purchases.length, 1)
  const selectedDay = Math.min(activeDay, dayCount - 1)
  const dayPurchase = purchases.find((p) => Number(p.dayIndex) === selectedDay)

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
          {/* Requirements Needed */}
          {(dayPurchase.requirementNeeded || []).length > 0 && (
            <section className="rounded-lg border border-[#465168] bg-[#1B2334] p-5">
              <h3 className="text-lg font-semibold text-[#8F5BFF]">Equipment Requirements</h3>
              <div className="mt-4 space-y-3">
                {dayPurchase.requirementNeeded.map((req, index) => (
                  <SplitInfoRow
                    key={`${req.type}-${index}`}
                    items={[
                      [`${req.type} - Hard Count`, req.hardCount || 0],
                      [`${req.type} - Soft Count`, req.softCount || 0],
                    ]}
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

export default FacultyPurchaseDetailsPanel
