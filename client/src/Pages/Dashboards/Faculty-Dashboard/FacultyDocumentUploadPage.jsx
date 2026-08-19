import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import fileImg from '../../../assets/file-img.png'
import { Upload, ArrowLeft, FileText, Loader2, CheckCircle } from 'lucide-react'
import axios from 'axios'
import FacultyDahsboardHeader from './FacultyDahsboardHeader'

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

const FacultyDocumentUploadPage = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [documents, setDocuments] = useState([])
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState({})       // { fileRef: File }
  const [submitted, setSubmitted] = useState(false)

  // Fetch required documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
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

  const handleFileChange = (fileRef, file) => {
    setFiles((prev) => ({ ...prev, [fileRef]: file }))
  }

  const handleSubmit = async () => {
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

      const res = await axios.post(`${API_BASE_URL}/api/event-closingdocuments`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (res.status === 200 || res.status === 201) {
        toast.success('Documents uploaded successfully!')
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Failed to upload documents:', err)
      toast.error(err.response?.data?.message || 'Failed to upload documents')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="bg-[#0b1326] h-[100vh]">
        <FacultyDahsboardHeader />
        <section className="bg-[#0b1326] px-7  w-6xl m-auto pt-6 text-center text-white poppins">
          {/* Back button */}
          {/* <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#CBC3D7]/65 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Event Details
          </button> */}

          {/* Page header */}
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-[#D0BCFF]">Upload Event Closing Documents</h1>
            {eventName && (
              <p className="mt-1 text-sm text-[#CBC3D7]/55">{eventName}</p>
            )}
          </div>

          {/* Content */}
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
            ) : submitted ? (
              <div className="flex flex-col items-center justify-center py-20">
                <CheckCircle size={48} className="text-[#10B981] mb-4" />
                <h2 className="text-lg font-medium text-white mb-2">Documents Submitted Successfully</h2>
                <p className="text-sm text-[#CBC3D7]/65 mb-6">Your event closing documents have been uploaded.</p>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard-faculty/events')}
                  className="rounded-md bg-[#8B5CF6] px-6 py-2 text-sm font-medium text-white hover:bg-[#7C3AED] transition-colors"
                >
                  Back to Events
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-7 max-h-[calc(100vh-230px)] mt-8  overflow-y-auto pr-3 custom-scrollbar relative ">
                  {documents.map((doc) => {
                    const fileRef = toFileRef(doc.name)
                    const selectedFile = files[fileRef]

                    return (
                      <div
                        key={doc.name}
                        className=""
                      >
                        <label className="block text-sm  font-medium  text-[#CBC3D7] mb-3">
                          <span className="flex items-center justify-center gap-2">
                            <FileText size={16} className="text-[#8B5CF6]" />
                            {doc.name}
                          </span>
                        </label>

                        <div className="rounded-lg custom-dashed bg-[#151d31] px-5 py-3 relative">
                          <label
                            htmlFor={fileRef}
                            className="w-fit m-auto   rounded-md px-4 py-2 text-sm text-[#CBC3D7]/70 hover:border-[#8B5CF6]/50 hover:text-white cursor-pointer transition-colors"
                          >
                            <div className="text-center ">
                              <img src={fileImg} className="w-16 h-16 m-auto mb-2" />
                              {selectedFile ? <div>
                                <p>Change File / Drag and drop file here</p>
                              </div> : <div>
                                <p>Choose File / Drag and drop file here</p>
                                <p className="text-blue-400">Only JPEG, PNG, PDF formats are allowed.</p>
                              </div>}
                            </div>
                          </label>
                          <input
                            id={fileRef}
                            type="file"
                            className="opacity-0 absolute top-0 left-0 right-0 bottom-0 cursor-pointer"
                            onChange={(e) => handleFileChange(fileRef, e.target.files[0])}
                          />
                          {selectedFile ? (
                            <div className="border border-gray-600 rounded-sm bg-gray-200 min-w-[300px] text-left  w-fit m-auto px-3 py-2">
                              <span className="text-sm text-[#000000] truncate max-w-xs">
                                {selectedFile.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-[#CBC3D7]/40">No file selected</span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Submit button */}
                  <div className=" fixed bottom-4 right-38">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center gap-2 rounded-md bg-[#8B5CF6] px-8 py-3 text-sm font-medium text-white hover:bg-[#7C3AED] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Submit Documents
                        </>
                      )}
                    </button>
                  </div>
                </div>


              </>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default FacultyDocumentUploadPage
