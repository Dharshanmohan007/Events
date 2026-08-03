import React, { useEffect, useState } from 'react'
import { Sparkles, CheckCircle2, Send } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Numeric rating options (1–5). Same visual design language as the Event
// feedback form, but this page is fully isolated from Event feedback state.
const ratingOptions = [
  { value: 1, label: 'Poor', icon: '😫' },
  { value: 2, label: 'Minor Issues', icon: '🙁' },
  { value: 3, label: 'Neutral', icon: '😐' },
  { value: 4, label: 'Positive', icon: '😊' },
  { value: 5, label: 'Excellent', icon: '🤩' },
]

// The only modules that have individual-request flows. Exactly one section is
// rendered for the resolved module – never all departments together.
const MODULE_META = {
  purchase: {
    title: 'Purchase Feedback',
    description: 'Feedback about the purchase and procurement process.',
  },
  transport: {
    title: 'Transport Feedback',
    description: 'Feedback about the transportation arrangements.',
  },
  food: {
    title: 'Food & Refreshment Feedback',
    description: 'Feedback about the food and refreshments provided.',
  },
  media: {
    title: 'Media Feedback',
    description: 'Feedback about the media materials and production.',
  },
}

// Mirrors the form-type resolution used by the individual detail view so the
// same request maps to the same module section here.
const resolveFormType = (formType) => {
  if (!formType) return null
  const key = formType.toLowerCase().replace(/[^a-z]/g, '')
  if (key.includes('purchase')) return 'purchase'
  if (key.includes('transport')) return 'transport'
  if (key.includes('food') || key.includes('refreshment')) return 'food'
  if (key.includes('media')) return 'media'
  return null
}

const FacultyIndividualFeedbackPage = () => {
  const { requestId } = useParams()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchSubmission = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(
          `${API_BASE_URL}/api/individual-submissions/getrequest/${requestId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        )
        if (!res.ok) throw new Error('Failed to fetch submission')
        const response = await res.json()
        if (!response.success)
          throw new Error(response.message || 'Failed to fetch submission')
        if (isMounted) {
          const submissionData = Array.isArray(response.data)
            ? response.data[0]
            : response.data
          setSubmission(submissionData)
        }
      } catch (err) {
        console.error('Failed to fetch individual submission:', err)
        if (isMounted) setError(err.message || 'Failed to load submission details')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchSubmission()
    return () => {
      isMounted = false
    }
  }, [requestId])

  const formTypeKey = resolveFormType(submission?.formType)
  const moduleMeta = MODULE_META[formTypeKey]

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting || submitted) return

    if (!rating) {
      toast.error('Please select a rating before submitting')
      return
    }
    if (!feedbackText.trim()) {
      toast.error('Please enter your feedback before submitting')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/feedback/individual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          requestId,
          rating,
          feedback: feedbackText.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit feedback')
      }
      toast.success('Feedback submitted successfully')
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit individual feedback:', err)
      toast.error(err.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#121126] px-6 pb-4 pt-8 text-white poppins">
        <div className="mx-auto flex min-h-[50vh] max-w-[1310px] items-center justify-center">
          <p className="text-sm text-[#FFFFFF80]">Loading feedback form...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="min-h-screen bg-[#121126] px-6 pb-4 pt-8 text-white poppins">
        <div className="mx-auto flex min-h-[50vh] max-w-[1310px] items-center justify-center">
          <p className="text-sm text-[#FF4F91]">{error}</p>
        </div>
      </section>
    )
  }

  if (!moduleMeta) {
    return (
      <section className="min-h-screen bg-[#121126] px-6 pb-4 pt-8 text-white poppins">
        <div className="mx-auto flex min-h-[50vh] max-w-[1310px] items-center justify-center">
          <p className="text-sm text-[#FFFFFF80]">
            No feedback form is available for this individual request.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#121126] px-6 pb-4 pt-8 text-white poppins">
      <div className="mx-auto max-w-[1310px]">
        <header>
          <h1 className="text-xl font-semibold">Give Your Valuable Feedback</h1>
          <p className="mt-2 max-w-[1050px] text-sm text-[#FFFFFF80]">
            Please provide your feedback for the module used in this individual request.
          </p>

          <div className="mt-7 flex items-center gap-3">
            <Sparkles size={30} className="text-[#D8C8FF]" />
            <div>
              <h2 className="text-2xl font-semibold text-[#DAD8F5]">{moduleMeta.title}</h2>
              <p className="mt-1 text-xs text-[#FFFFFF66]">
                Request ID: {requestId}
              </p>
            </div>
          </div>
        </header>

        {submitted ? (
          <section className="mt-10 flex flex-col items-center justify-center rounded-lg bg-[#222136] px-4 py-14 text-center sm:px-5">
            <CheckCircle2 size={44} className="text-[#20D18C]" />
            <h3 className="mt-4 text-lg font-semibold text-white">Feedback Submitted</h3>
            <p className="mt-2 max-w-md text-sm text-[#FFFFFF80]">
              Thank you for your feedback. This individual request is now closed and no
              further changes are needed.
            </p>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <section className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
              <h3 className="text-lg font-semibold text-[#8B3DFF]">{moduleMeta.title}</h3>
              <p className="mt-2 text-sm text-[#FFFFFF80]">{moduleMeta.description}</p>

              <div className="mt-5 flex flex-wrap gap-3 sm:gap-4">
                {ratingOptions.map((option) => {
                  const isSelected = rating === option.value
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setRating(option.value)}
                      disabled={submitting}
                      className={`flex h-[67px] w-[67px] cursor-pointer flex-col items-center justify-center rounded-lg border text-center transition-all duration-200 sm:w-[80px] ${
                        isSelected
                          ? 'bg-[#853FF9] border-none text-white shadow-[0_0_0_1px_rgba(139,61,255,0.35)]'
                          : 'border-white/5 bg-[#2b2b3f] hover:border-[#8B3DFF]/60 hover:bg-[#302f47]'
                      } ${submitting ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <span className="text-xl leading-none">{option.icon}</span>
                      <span className="mt-2 text-[11px] text-[#FFFFFF99]">{option.label}</span>
                    </button>
                  )
                })}
              </div>

              <fieldset className="mt-5 rounded border border-[#FFFFFF24] px-3 pb-3 pt-0">
                <legend className="px-2 text-xs font-medium text-white">
                  Your Feedback*
                </legend>
                <textarea
                  value={feedbackText}
                  onChange={(event) => setFeedbackText(event.target.value)}
                  placeholder="Share your experience with this request..."
                  disabled={submitting}
                  className="min-h-[80px] w-full resize-none bg-transparent p-2 text-xs text-white outline-none placeholder:text-[#FFFFFF66] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </fieldset>
            </section>

            <div className="-mx-6 flex justify-end px-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-md bg-[#8B3DFF] px-9 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#7830e5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={16} />
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export default FacultyIndividualFeedbackPage
