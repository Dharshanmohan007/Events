import React, { useState } from 'react'
import { Upload, Plus } from 'lucide-react'

const EXPENDITURE_CATEGORIES = [
  { key: 'food', label: 'Food' },
  { key: 'transport', label: 'Transport' },
  { key: 'accommodation', label: 'Accommodation' },
  { key: 'remuneration', label: 'Remuneration' },
  { key: 'gifts', label: 'Gifts' },
  { key: 'kits', label: 'Kits' },
  { key: 'miscellaneous', label: 'Miscellaneous' },
]

const createEmptyBill = () => ({
  billNo: '',
  billDate: '',
  vendorGuestName: '',
  amount: '',
  file: null,
  details: '',
})

const FloatingInput = ({ label, type = 'text', value, onChange, placeholder = '' }) => (
  <div className="relative">
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="peer w-full bg-transparent border border-gray-700 rounded-md px-3 pt-5 pb-2 text-sm text-white placeholder-transparent focus:border-[#8B5CF6]"
    />
    <label className="absolute top-[-8px] left-3 bg-[#151d31] px-1 text-[11px] text-white peer-focus:text-[#8B5CF6] transition-colors pointer-events-none">
      {label}
    </label>
  </div>
)

const FloatingTextarea = ({ label, value, onChange, placeholder = '', rows = 3 }) => (
  <div className="relative">
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="peer w-full bg-transparent border border-gray-700 rounded-md px-3 pt-5 pb-2 text-sm text-white placeholder-transparent resize-none focus:border-[#8B5CF6]"
    />
    <label className="absolute top-[-8px] left-3 bg-[#0b1326] px-1 text-[11px] text-white peer-focus:text-[#8B5CF6] transition-colors pointer-events-none">
      {label}
    </label>
  </div>
)

const ExpenditureDetailsForm = ({ expenditureData, setExpenditureData }) => {
  const [selectedCategories, setSelectedCategories] = useState([])

  const toggleCategory = (key) => {
    setSelectedCategories((prev) => {
      const isDeselecting = prev.includes(key)
      if (isDeselecting) {
        // Remove category and clear its entries
        setExpenditureData((edata) => ({ ...edata, [key]: [] }))
        return prev.filter((c) => c !== key)
      } else {
        // Add category with one empty bill entry only if none exist yet
        setExpenditureData((edata) => {
          if ((edata[key] || []).length === 0) {
            return { ...edata, [key]: [createEmptyBill()] }
          }
          return edata
        })
        return [...prev, key]
      }
    })
  }

  const handleBillChange = (categoryKey, index, field, value) => {
    setExpenditureData((prev) => {
      const bills = [...(prev[categoryKey] || [])]
      bills[index] = { ...bills[index], [field]: value }
      return { ...prev, [categoryKey]: bills }
    })
  }

  const handleFileChange = (categoryKey, index, file) => {
    setExpenditureData((prev) => {
      const bills = [...(prev[categoryKey] || [])]
      bills[index] = { ...bills[index], file }
      return { ...prev, [categoryKey]: bills }
    })
  }

  const addBill = (categoryKey) => {
    setExpenditureData((prev) => {
      const bills = [...(prev[categoryKey] || []), createEmptyBill()]
      return { ...prev, [categoryKey]: bills }
    })
  }

  const removeBill = (categoryKey, index) => {
    setExpenditureData((prev) => {
      const bills = (prev[categoryKey] || []).filter((_, i) => i !== index)
      // If no bills left, deselect the category
      if (bills.length === 0) {
        setSelectedCategories((prev) => prev.filter((c) => c !== categoryKey))
      }
      return { ...prev, [categoryKey]: bills }
    })
  }

  const handleRemarksChange = (value) => {
    setExpenditureData((prev) => ({ ...prev, remarks: value }))
  }

  return (
    <div className="px-7 pt-4 text-white poppins">
      <div className="mb-2">
        <h1 className="text-xl font-medium text-white">Expenditure Details</h1>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-3 custom-scrollbar">
        {/* Category Selector */}
        <div className="w-full">
          <label className="block text-[11px] text-[#CBC3D7]/60 mb-2">
            Select the Required Expenditure *
          </label>
          {/* Selected categories as chips */}
          <div className="flex flex-wrap gap-2">
            {EXPENDITURE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => toggleCategory(cat.key)}
                className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                  selectedCategories.includes(cat.key)
                    ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                    : 'bg-transparent border-gray-700 text-[#CBC3D7]/60 hover:border-[#8B5CF6]/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Forms */}
        {selectedCategories.map((categoryKey) => {
          const category = EXPENDITURE_CATEGORIES.find((c) => c.key === categoryKey)
          const bills = expenditureData[categoryKey] || []

          return (
            <div key={categoryKey} className="rounded-lg bg-[#151d31] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#8B5CF6] font-medium text-sm">
                  {category.label} Details
                </h3>
                <button
                  type="button"
                  onClick={() => addBill(categoryKey)}
                  className="flex items-center gap-1 px-3 py-2 rounded-md bg-[#8B5CF6] text-xs text-white hover:bg-[#7C3AED] transition-colors"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              {bills.length === 0 && (
                <p className="text-xs text-[#CBC3D7]/40 mb-2">No entries added yet. Click "+ Add" to add a bill.</p>
              )}

              {bills.map((bill, index) => (
                <div key={index} className="border border-gray-700 rounded-md p-4 mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#CBC3D7]/50">Entry {index + 1}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeBill(categoryKey, index); }}
                      className="relative z-20 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FloatingInput
                      label="Bill No *"
                      value={bill.billNo || ''}
                      onChange={(e) => handleBillChange(categoryKey, index, 'billNo', e.target.value)}
                    />
                    <div className="relative">
                      <FloatingInput
                        label="Bill Date *"
                        type="date"
                        value={bill.billDate || ''}
                        onChange={(e) => handleBillChange(categoryKey, index, 'billDate', e.target.value)}
                      />
                    </div>
                    <FloatingInput
                      label="Vendor / Guest name *"
                      value={bill.vendorGuestName || ''}
                      onChange={(e) => handleBillChange(categoryKey, index, 'vendorGuestName', e.target.value)}
                    />
                    <div className="relative">
                      <FloatingInput
                        label="Amount *"
                        type="number"
                        value={bill.amount || ''}
                        onChange={(e) => handleBillChange(categoryKey, index, 'amount', e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#CBC3D7]/50 pointer-events-none z-10">₹</span>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="mb-4">
                    <label className="block text-[11px] text-[#CBC3D7]/60 mb-2">
                      Upload ( if have any supporting document )
                    </label>
                    <div className="rounded-lg border border-dashed border-gray-700 bg-[#0b1326] px-5 py-5 relative flex flex-col items-center justify-center overflow-hidden">
                      <label className="flex items-center gap-2 text-sm text-[#CBC3D7]/70 hover:text-white cursor-pointer transition-colors">
                        <Upload size={20} className="text-[#CBC3D7]/70" />
                        <p>
                          Drag and drop the files here or{' '}
                          <span className="text-[#8B5CF6] hover:underline">choose file</span>
                        </p>
                      </label>
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleFileChange(categoryKey, index, e.target.files[0])}
                      />
                      {bill.file && (
                        <p className="mt-2 text-xs text-[#CBC3D7]/50 truncate max-w-md">{bill.file.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  {/* <FloatingTextarea
                    label="Details, If any ( 100 words ) *"
                    value={bill.details || ''}
                    onChange={(e) => handleBillChange(categoryKey, index, 'details', e.target.value)}
                  /> */}
                </div>
              ))}
            </div>
          )
        })}

        {/* Remarks */}
        <div>
          <FloatingTextarea
            label="Remarks if any *"
            value={expenditureData.remarks || ''}
            onChange={(e) => handleRemarksChange(e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}

export default ExpenditureDetailsForm
