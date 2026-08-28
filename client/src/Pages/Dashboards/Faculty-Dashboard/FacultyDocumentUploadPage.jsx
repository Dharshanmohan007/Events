import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Upload, ArrowLeft, FileText, Loader2, CheckCircle, ChevronRight, File, X } from 'lucide-react'
import axios from 'axios'
import FacultyDahsboardHeader from './FacultyDahsboardHeader'
import IncomeSourceForm from './IncomeSourceForm'
import ExpenditureDetailsForm from './ExpenditureDetailsForm'
import OtherDetailsForm from './OtherDetailsForm'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * Converts a document name like "Attendance Sheet" into a safe key "attendance_sheet"
 * and a fileRef like "doc_attendance_sheet_file"
 */
const toKey = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

const toFileRef = (name) => `doc_${toKey(name)}_file`

// Initial states for each form section
const initialIncomeData = {
  registrationFees: { requirements: '', calculations: '', amount: '', details: '' },
  scholarship: { requirements: '', calculations: '', amount: '', details: '' },
  institutionalAmount: { selectRequired: '', amount: '', details: '' },
  departmentFund: { details: '', amount: '' },
  others: { requirements: '', calculations: '', amount: '', details: '' },
}

const initialExpenditureData = {
  food: [],
  transport: [],
  accommodation: [],
  remuneration: [],
  gifts: [],
  kits: [],
  miscellaneous: [],
  remarks: '',
}

const initialOtherData = {
  participants: {
    male: { total: '', withinState: '', outsideState: '' },
    female: { total: '', withinState: '', outsideState: '' },
  },
  primarySdg: '',
  secondarySdg: [],
  aboutProgram: '',
}

// ─── Validation helpers ──────────────────────────────────────────────────────
const validateIncome = (incomeData) => {
  const errors = []
  const { registrationFees, scholarship, institutionalAmount, departmentFund, others } = incomeData

  // Registration Fees
  if (registrationFees.amount || registrationFees.requirements || registrationFees.calculations || registrationFees.details) {
    if (!registrationFees.amount) errors.push('Registration Fees: Amount is required')
    if (!registrationFees.requirements) errors.push('Registration Fees: Requirements is required')
    if (!registrationFees.calculations) errors.push('Registration Fees: Calculations is required')
    if (!registrationFees.details) errors.push('Registration Fees: Details is required')
  }

  // Scholarship
  if (scholarship.amount || scholarship.requirements || scholarship.calculations || scholarship.details) {
    if (!scholarship.amount) errors.push('Scholarship: Amount is required')
    if (!scholarship.requirements) errors.push('Scholarship: Requirements is required')
    if (!scholarship.calculations) errors.push('Scholarship: Calculations is required')
    if (!scholarship.details) errors.push('Scholarship: Details is required')
  }

  // Institutional Amount
  if (institutionalAmount.amount || institutionalAmount.selectRequired || institutionalAmount.details) {
    if (!institutionalAmount.amount) errors.push('Institutional Amount: Amount is required')
    if (!institutionalAmount.selectRequired) errors.push('Institutional Amount: Select Required is required')
    if (!institutionalAmount.details) errors.push('Institutional Amount: Details is required')
  }

  // Department Fund
  if (departmentFund.amount || departmentFund.details) {
    if (!departmentFund.amount) errors.push('Department Fund: Amount is required')
    if (!departmentFund.details) errors.push('Department Fund: Details is required')
  }

  // Others
  if (others.amount || others.requirements || others.calculations || others.details) {
    if (!others.amount) errors.push('Others: Amount is required')
    if (!others.requirements) errors.push('Others: Requirements is required')
    if (!others.calculations) errors.push('Others: Calculations is required')
    if (!others.details) errors.push('Others: Details is required')
  }

  // At least one income source should be filled
  const hasAny = registrationFees.amount || scholarship.amount || institutionalAmount.amount || departmentFund.amount || others.amount
  if (!hasAny) {
    errors.push('Please fill at least one income source')
  }

  return errors
}

const validateExpenditure = (expenditureData) => {
  const errors = []
  const categories = ['food', 'transport', 'accommodation', 'remuneration', 'gifts', 'kits', 'miscellaneous']

  let hasAny = false
  categories.forEach((cat) => {
    const bills = expenditureData[cat] || []
    if (bills.length > 0) {
      hasAny = true
      bills.forEach((bill, idx) => {
        if (!bill.expenseName) errors.push(`${cat} bill ${idx + 1}: Expense Name is required`)
        if (!bill.billNo) errors.push(`${cat} bill ${idx + 1}: Bill No is required`)
        if (!bill.billDate) errors.push(`${cat} bill ${idx + 1}: Bill Date is required`)
        if (!bill.vendorGuestName && cat !== 'kits' && cat !== 'miscellaneous') {
          errors.push(`${cat} bill ${idx + 1}: Vendor/Guest name is required`)
        }
        if (!bill.amount) errors.push(`${cat} bill ${idx + 1}: Amount is required`)
      })
    }
  })

  if (!hasAny) {
    errors.push('Please add at least one expenditure entry')
  }

  return errors
}

const validateOtherDetails = (otherData) => {
  const errors = []
  const { participants, primarySdg, secondarySdg, aboutProgram } = otherData

  if (!participants?.male?.total) errors.push('Total Male Participants Count is required')
  if (!participants?.male?.withinState) errors.push('Male Participants Within State is required')
  if (!participants?.male?.outsideState) errors.push('Male Participants Other State is required')
  if (!participants?.female?.total) errors.push('Total Female Participants Count is required')
  if (!participants?.female?.withinState) errors.push('Female Participants Within State is required')
  if (!participants?.female?.outsideState) errors.push('Female Participants Other State is required')

  if (!primarySdg) errors.push('Primary SDG is required')
  if (!secondarySdg) errors.push('Secondary SDG is required')
  if (!aboutProgram) errors.push('About Program is required')

  return errors
}

const FacultyDocumentUploadPage = () => {


  const token = localStorage.getItem('token')

  const { eventId } = useParams()
  const navigate = useNavigate()

  const [step, setStep] = useState('documentUpload')
  const [documents, setDocuments] = useState([])
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [basicDetails, setBasicDetails] = useState(null)
  const [navigationDetails, setnavigationDetails] = useState(null)


  // Form data for each step
  const [incomeData, setIncomeData] = useState(initialIncomeData)
  const [expenditureData, setExpenditureData] = useState(initialExpenditureData)
  const [otherData, setOtherData] = useState(initialOtherData)

  // Fetch required documents on mount

  // fetch event details 
  async function fetchEventDetails() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("events response : ", res.data?.data)
      setnavigationDetails(res?.data?.data)
    } catch (error) {
      console.error("error occured while fetching the events data : ", error.message)
    }
  }



  useEffect(() => {
    fetchEventDetails()
    const fetchDocuments = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/documents/${eventId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch documents')

        const data = payload.data || payload
        const sorted = [...(data.requiredDocuments || [])].sort((a, b) => a.order - b.order)
        setDocuments(sorted)
        setEventName(data.eventName || '')
      } catch (err) {
        console.error('Failed to fetch documents:', err)
        setError(err.message || 'Failed to fetch required documents')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [eventId])

  // Fetch basic details when entering income source step
  useEffect(() => {
    if (step === 'incomeSource' && !basicDetails) {
      const fetchBasicDetails = async () => {
        try {
          const token = localStorage.getItem('token')
          const res = await fetch(`${API_BASE_URL}/api/events/basic/${eventId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          const payload = await res.json()
          if (!res.ok) throw new Error(payload.message || 'Failed to fetch basic details')

          setBasicDetails(payload.data || payload)
        } catch (err) {
          console.error('Failed to fetch basic details:', err)
          toast.error('Failed to fetch basic details')
        }
      }

      fetchBasicDetails()
    }
  }, [step, eventId, basicDetails])

  console.log("updated code is here")


  useEffect(() => {
    if (navigationDetails?.isDocumentsCompleted == false) {
      setStep('documentUpload')
      return
    } else if (navigationDetails?.isExpenditureCompleted == false) {
      setStep('incomeSource')
      return
    }
    else if (navigationDetails?.isFeedbackCompleted == false) {
     window.open(`/dashboard-faculty/feedback/${eventId}`, "_blank")
      return
    }
  }, [navigationDetails])

  const handleFileChange = (fileRef, file) => {
    setFiles((prev) => ({ ...prev, [fileRef]: file }))
  }

  const handleDocumentSubmit = async () => {
    // Validate all files selected
    const missing = documents.filter((doc) => !files[toFileRef(doc.name)])
    if (missing.length > 0) {
      toast.error(`Please upload all required documents. Missing: ${missing.map((d) => d.name).join(', ')}`)
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')

      // Build the documents metadata array
      const docsMeta = documents.map((doc) => ({
        key: toKey(doc.name),
        label: doc.name,
        fileRef: toFileRef(doc.name),
      }))

      // Build FormData
      const formData = new FormData()
      formData.append('data', JSON.stringify({ eventId, documents: docsMeta }))

      // Append each file using its fileRef as the field name
      docsMeta.forEach((doc) => {
        if (files[doc.fileRef]) {
          formData.append(doc.fileRef, files[doc.fileRef])
        }
      })

      const res = await axios.post(`${API_BASE_URL}/api/event-closing-documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (res.status === 200 || res.status === 201) {
        toast.success('Documents uploaded successfully!')
        setStep('incomeSource')
      }
    } catch (err) {
      console.error('Failed to upload documents:', err)
      toast.error(err.response?.data?.message || 'Failed to upload documents')
    } finally {
      setSubmitting(false)
    }
  }

  // Final submit - combines all form data with FormData for file uploads
  const handleFinalSubmit = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')

      // Build income array from incomeData
      const income = []
      const { registrationFees, scholarship, institutionalAmount, departmentFund, others } = incomeData

      // Helper to build income details by concatenating details, calculations, requirements
      const buildIncomeDetails = (data) => {
        const parts = []
        if (data.details) parts.push(data.details)
        if (data.calculations) parts.push(data.calculations)
        if (data.requirements) parts.push(data.requirements)
        return parts.join(', ')
      }

      if (registrationFees.amount) {
        income.push({
          type: 'Registration Fees',
          amount: Number(registrationFees.amount) || 0,
          details: buildIncomeDetails(registrationFees),
        })
      }
      if (scholarship.amount) {
        income.push({
          type: 'Scholarship',
          amount: Number(scholarship.amount) || 0,
          details: buildIncomeDetails(scholarship),
        })
      }
      if (institutionalAmount.amount) {
        income.push({
          type: 'Institutional Amount',
          amount: Number(institutionalAmount.amount) || 0,
          details: buildIncomeDetails(institutionalAmount),
        })
      }
      if (departmentFund.amount) {
        income.push({
          type: 'Department Fund',
          amount: Number(departmentFund.amount) || 0,
          details: buildIncomeDetails(departmentFund),
        })
      }
      if (others.amount) {
        income.push({
          type: 'Others',
          amount: Number(others.amount) || 0,
          details: buildIncomeDetails(others),
        })
      }

      // Build expenditure object from expenditureData with file refs
      const fileRefs = [] // collect all files to append
      let fileCounter = 0

      const buildExpenditureItems = (items) =>
        (items || []).map((b) => {
          const entry = {
            name: b.expenseName || '',
            billNo: b.billNo || '',
            date: b.billDate || '',
            guestName: b.vendorGuestName || '',
            billAmount: Number(b.amount) || 0,
          }
          if (b.file) {
            const ref = `expenditure_file_${fileCounter++}`
            entry.supportingDocuments = [{ fileRef: ref }]
            fileRefs.push({ ref, file: b.file })
          }
          return entry
        })

      const expenditure = {
        food: buildExpenditureItems(expenditureData.food),
        accommodation: buildExpenditureItems(expenditureData.accommodation),
        transport: buildExpenditureItems(expenditureData.transport),
        remuneration: buildExpenditureItems(expenditureData.remuneration),
        gifts: buildExpenditureItems(expenditureData.gifts),
        kits: buildExpenditureItems(expenditureData.kits),
        miscellaneous: buildExpenditureItems(expenditureData.miscellaneous),
        remarks: expenditureData.remarks || '',
      }

      // Build participants
      const participants = {
        male: {
          withinState: Number(otherData.participants?.male?.withinState) || 0,
          outsideState: Number(otherData.participants?.male?.outsideState) || 0,
        },
        female: {
          withinState: Number(otherData.participants?.female?.withinState) || 0,
          outsideState: Number(otherData.participants?.female?.outsideState) || 0,
        },
      }

      // Build basicDetails - only send organizerId from organizerDetails
      const builtBasicDetails = basicDetails
        ? {
          eventName: basicDetails.eventName || eventName,
          organizerId: basicDetails.organizerDetails?.facultyId || '',
          iqacNumber: basicDetails.iqacNumber || '',
          advanceAmount: basicDetails.advanceAmount || 0,
          dateOfAdvanceTaken: basicDetails.dateAdvanceTaken || '',
          purposeOfAdvanceTaken: basicDetails.purposeOfAdvance || '',
          guestDetails: basicDetails.guestNames || [],
        }
        : {
          eventName,
          organizerId: '',
          iqacNumber: '',
          advanceAmount: 0,
          dateOfAdvanceTaken: '',
          purposeOfAdvanceTaken: '',
          guestDetails: [],
        }

      // Build final payload
      const payload = {
        eventId,
        basicDetails: builtBasicDetails,
        income,
        expenditure,
        primarySdg: otherData.primarySdg || '',
        secondarySdg: otherData.secondarySdg || [],
        aboutProgram: otherData.aboutProgram || '',
        participants,
      }

      // Use FormData to support file uploads
      const formData = new FormData()
      formData.append('data', JSON.stringify(payload))

      // Append all expenditure files
      fileRefs.forEach(({ ref, file }) => {
        formData.append(ref, file)
      })

      const res = await axios.post(`${API_BASE_URL}/api/event-expenditures`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (res.status === 200 || res.status === 201) {
        toast.success('All details submitted successfully!')
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Failed to submit expenditure details:', err)
      toast.error(err.response?.data?.message || 'Failed to submit details')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step === 'incomeSource') setStep('documentUpload')
    else if (step === 'expenditureDetails') setStep('incomeSource')
    else if (step === 'otherDetails') setStep('expenditureDetails')
  }

  const handleContinue = () => {
    if (step === 'documentUpload') {
      handleDocumentSubmit()
    } else if (step === 'incomeSource') {
      const errors = validateIncome(incomeData)
      if (errors.length > 0) {
        toast.error(errors[0])
        return
      }
      setStep('expenditureDetails')
    } else if (step === 'expenditureDetails') {
      const errors = validateExpenditure(expenditureData)
      if (errors.length > 0) {
        toast.error(errors[0])
        return
      }
      setStep('otherDetails')
    } else if (step === 'otherDetails') {
      handleFinalSubmit()
    }
  }

  return (
    <div className="bg-[#0b1326] h-[100vh]">
      <FacultyDahsboardHeader />

      {/* ─── Document Upload ─── */}
      {step === 'documentUpload' && (
        <section className="bg-[#0b1326] px-7 pt-6 text-white poppins">
          <div className="breadcrumbs-container flex items-center gap-2">
            {eventName && <p className="text-[#CBC3D7]/55">{eventName}</p>}
            <span><ChevronRight size={16} /></span>
            <p className="text-[#D0BCFF]">Document Upload</p>
          </div>

          <div className="mb-4 mt-2 flex items-center">
            <h1 className="text-xl font-medium text-white">Upload Required Documents</h1>
          </div>

          <div className="w-full">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-[#8B5CF6]" />
                <span className="ml-3 text-sm text-[#CBC3D7]/65">Loading required documents...</span>
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-sm text-[#FF4F91]">{error}</p>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mt-4 text-sm text-[#8B5CF6] hover:underline"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div className="space-y-7 max-h-[calc(100vh-190px)] mt-4 overflow-y-auto pr-3 custom-scrollbar relative">
                {documents.map((doc) => {
                  const fileRef = toFileRef(doc.name)
                  const selectedFile = files[fileRef]

                  return (
                    <div key={doc.name} className="text-left">
                      <label className="block text-sm font-medium text-[#CBC3D7] mb-3">
                        <span className="flex items-center gap-2">
                          {doc.order}. {doc.name}
                        </span>
                      </label>

                      <div className="rounded-lg border border-dashed border-gray-700 bg-[#151d31] px-5 py-6 relative flex flex-col items-center justify-center">
                        <label
                          htmlFor={fileRef}
                          className="flex items-center gap-2 text-sm text-[#CBC3D7]/70 hover:text-white cursor-pointer transition-colors"
                        >
                          {selectedFile ? "" : <><Upload size={20} className="text-[#CBC3D7]/70" />
                            <p>
                              Drag and drop the files here or{' '}
                              <span className="text-[#8B5CF6] hover:underline">choose file</span>
                            </p>
                            <input
                              id={fileRef}
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => handleFileChange(fileRef, e.target.files[0])}
                            />
                          </>}
                        </label>

                        {selectedFile && (
                          <div className="flex mt-2 items-center gap-3">
                            <div className="flex items-center gap-1">
                              <File size={16} className="text-purple-500" />
                              <p className="text-purple-300 truncate max-w-md">{selectedFile.name}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFileChange(fileRef, null)
                                // Reset the file input so the same file can be re-selected
                                const inputEl = document.getElementById(fileRef)
                                if (inputEl) inputEl.value = ''
                              }}
                              className="flex items-center gap-2 text-red-600 border rounded-lg px-2 py-1"
                            >
                              <X size={16} className="text-red-500" />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Back & Continue */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 rounded-md px-5 py-3 border border-purple-600 text-sm font-medium text-white cursor-pointer hover:bg-[#7c3aed13] transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-md px-8 py-3 bg-[#7C3AED] text-sm font-medium text-white hover:bg-[#7c3aedee] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>Continue →</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Income Source ─── */}
      {step === 'incomeSource' && (
        <div className="bg-[#0b1326]">
          <section className="bg-[#29294680 px-7 pt-6 text-white poppins">
            <div className="breadcrumbs-container flex items-center gap-2">
              {eventName && <p className="text-[#CBC3D7]/55">{eventName}</p>}
              <span><ChevronRight size={16} /></span>
              <p className="text-[#CBC3D7]/55">Document Upload</p>
              <span><ChevronRight size={16} /></span>
              <p className="text-[#D0BCFF]">Income Source</p>
            </div>
          </section>

          <IncomeSourceForm incomeData={incomeData} setIncomeData={setIncomeData} />

          {/* Back & Continue */}
          <div className="px-7 py-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-md px-5 py-3 border border-purple-600 text-sm font-medium text-white cursor-pointer hover:bg-[#7c3aed13] transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex items-center gap-2 rounded-md px-8 py-3 bg-[#7C3AED] text-sm font-medium text-white hover:bg-[#7c3aedee] transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ─── Expenditure Details ─── */}
      {step === 'expenditureDetails' && (
        <div className="bg-[#0b1326]">
          <section className="bg-[#0b1326] px-7 pt-6 text-white poppins">
            <div className="breadcrumbs-container flex items-center gap-2">
              {eventName && <p className="text-[#CBC3D7]/55">{eventName}</p>}
              <span><ChevronRight size={16} /></span>
              <p className="text-[#CBC3D7]/55">Document Upload</p>
              <span><ChevronRight size={16} /></span>
              <p className="text-[#CBC3D7]/55">Income Source</p>
              <span><ChevronRight size={16} /></span>
              <p className="text-[#D0BCFF]">Expenditure Details</p>
            </div>
          </section>

          <ExpenditureDetailsForm expenditureData={expenditureData} setExpenditureData={setExpenditureData} />

          {/* Back & Continue */}
          <div className="px-7 py-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-md px-5 py-3 border border-purple-600 text-sm font-medium text-white cursor-pointer hover:bg-[#7c3aed13] transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex items-center gap-2 rounded-md px-8 py-3 bg-[#7C3AED] text-sm font-medium text-white hover:bg-[#7c3aedee] transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ─── Other Details ─── */}
      {step === 'otherDetails' && (
        <div className="bg-[#0b1326]">
          <section className="bg-[#0b1326] px-7 pt-6 text-white poppins">
            <div className="breadcrumbs-container flex items-center gap-2">
              {eventName && <p className="text-[#CBC3D7]/55">{eventName}</p>}
              <span><ChevronRight size={16} /></span>
              <p className="text-[#CBC3D7]/55">Document Upload</p>
              <span><ChevronRight size={16} /></span>
              <p className="text-[#CBC3D7]/55">Income Source</p>
              <span><ChevronRight size={16} /></span>
              <p className="text-[#CBC3D7]/55">Expenditure Details</p>
              <span><ChevronRight size={16} /></span>
              <p className="text-[#D0BCFF]">Other Details</p>
            </div>
          </section>

          <OtherDetailsForm otherData={otherData} setOtherData={setOtherData} />

          {/* Back & Submit */}
          <div className="px-7 py-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-md px-5 py-3 border border-purple-600 text-sm font-medium text-white cursor-pointer hover:bg-[#7c3aed13] transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={submitting}
              className="flex items-center gap-2 rounded-md px-8 py-3 bg-[#7C3AED] text-sm font-medium text-white hover:bg-[#7c3aedee] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Submit →</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Success State ─── */}
      {submitted && (
        <section className="bg-[#0b1326] px-7 pt-6 text-white poppins">
          <div className="flex flex-col items-center justify-center py-20">
            <CheckCircle size={48} className="text-[#10B981] mb-4" />
            <h2 className="text-lg font-medium text-white mb-2">Details Submitted Successfully</h2>
            <p className="text-sm text-[#CBC3D7]/65 mb-6">All your event expenditure details have been uploaded.</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard-faculty/events')}
              className="rounded-md bg-[#8B5CF6] px-6 py-2 text-sm font-medium text-white hover:bg-[#7C3AED] transition-colors"
            >
              Back to Events
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default FacultyDocumentUploadPage
