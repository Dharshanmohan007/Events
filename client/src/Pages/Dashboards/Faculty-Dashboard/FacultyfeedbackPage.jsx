import React, { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const ratingOptions = [
  { value: 'poor', label: 'Poor', icon: '😫' },
  { value: 'minorIssues', label: 'Minor Issues', icon: '🙁' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
  { value: 'positive', label: 'Positive', icon: '😊' },
  { value: 'excellent', label: 'Excellent', icon: '🤩' },
]

const SECTION_META = {
  venue: { apiKey: 'venue', title: 'Venue Feedback', description: 'Feedback about the venue arrangements and facilities.' },
  icts: { apiKey: 'icts', title: 'ICTS Feedback', description: 'Feedback about the ICTS infrastructure and support.' },
  audio: { apiKey: 'audio', title: 'Audio Feedback', description: 'Feedback about the audio systems and setup.' },
  transport: { apiKey: 'transport', title: 'Transport Feedback', description: 'Feedback about the transportation arrangements.' },
  food: { apiKey: 'refreshment', title: 'Food & Refreshment Feedback', description: 'Feedback about the food and refreshments provided.' },
  accommodation: { apiKey: 'accommodation', title: 'Accommodation Feedback', description: 'Feedback about the accommodation arrangements.' },
  mediaPoster: { apiKey: 'poster', title: 'Media Feedback (Poster)', description: 'Feedback about the poster media materials.' },
  mediaVideo: { apiKey: 'video', title: 'Media Feedback (Video)', description: 'Feedback about the video media production.' },
  purchase: { apiKey: 'purchase', title: 'Purchase Feedback', description: 'Feedback about the purchase and procurement process.' },
}

const FacultyfeedbackPage = () => {
  const { eventId } = useParams()
  const [feedback, setFeedback] = useState({})
  const [requiredSections, setRequiredSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await fetch(`${API_BASE_URL}/api/events/requirements/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (data.success) {
          const departments = data.departments
          const available = Object.keys(SECTION_META).filter(
            (key) => departments[SECTION_META[key].apiKey]?.required === true
          )
          setRequiredSections(available)

          const initial = {}
          available.forEach((key) => {
            initial[key] = { rating: '', reason: '' }
          })
          setFeedback(initial)
        }
      } catch (err) {
        console.error('Failed to fetch requirements:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequirements()
  }, [eventId])

  const updateRating = (section, rating) => {
    setFeedback((currentFeedback) => ({
      ...currentFeedback,
      [section]: {
        ...currentFeedback[section],
        rating,
      },
    }))
  }

  const updateReason = (section, reason) => {
    setFeedback((currentFeedback) => ({
      ...currentFeedback,
      [section]: {
        ...currentFeedback[section],
        reason,
      },
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const decoded = jwtDecode(token)
      const organizerId = decoded.facultyId

      const sections = Object.entries(feedback)
        .filter(([, val]) => val.rating !== '')
        .map(([key, val]) => ({
          sectionKey: SECTION_META[key].apiKey,
          sectionTitle: SECTION_META[key].title.replace(' Feedback', ''),
          rating: ratingOptions.findIndex((o) => o.value === val.rating) + 1,
          ratingLabel: ratingOptions.find((o) => o.value === val.rating)?.label || '',
          comment: val.reason,
        }))

      const payload = {
        eventId,
        organizerId,
        sections,
      }

      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        // console.log('Feedback submitted successfully')
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    }
  }

  const renderFeedbackFields = (section) => (
    <>
      <div className="mt-5 flex flex-wrap gap-3 sm:gap-4">
        {ratingOptions.map((option) => {
          const isSelected = feedback[section].rating === option.value

          return (
            <button
              type="button"
              key={option.value}
              onClick={() => updateRating(section, option.value)}
              className={`flex h-[67px] w-[67px] cursor-pointer flex-col items-center justify-center rounded-lg border text-center transition-all duration-200 sm:w-[80px] ${
                isSelected
                  ? 'bg-[#853FF9] border-none text-white shadow-[0_0_0_1px_rgba(139,61,255,0.35)]'
                  : 'border-white/5 bg-[#2b2b3f] hover:border-[#8B3DFF]/60 hover:bg-[#302f47]'
              }`}
            >
              <span className="text-xl leading-none">{option.icon}</span>
              <span className="mt-2 text-[11px] text-[#FFFFFF99]">{option.label}</span>
            </button>
          )
        })}
      </div>

      <fieldset className="mt-5 rounded border border-[#FFFFFF24] px-3 pb-3 pt-0">
        <legend className="px-2 text-xs font-medium text-white">
          Special Requirements, If any*
        </legend>
        <textarea
          value={feedback[section].reason}
          onChange={(event) => updateReason(section, event.target.value)}
          placeholder="reason"
          className="min-h-[50px] p-2 w-full resize-none bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]"
        />
      </fieldset>
    </>
  )

  if (loading) {
    return (
      <section className="min-h-screen bg-[#121126] px-6 pb-4 pt-8 text-white poppins">
        <div className="mx-auto max-w-[1310px] flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-[#FFFFFF80]">Loading feedback form...</p>
        </div>
      </section>
    )
  }

  if (requiredSections.length === 0) {
    return (
      <section className="min-h-screen bg-[#121126] px-6 pb-4 pt-8 text-white poppins">
        <div className="mx-auto max-w-[1310px] flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-[#FFFFFF80]">No feedback sections required for this event.</p>
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
            Please provide your feedback for the departments listed below.
          </p>

          <div className="mt-7 flex items-center gap-3">
            <Sparkles size={30} className="text-[#D8C8FF]" />
            <h2 className="text-2xl font-semibold text-[#DAD8F5]">Nexus Annual Tech Summit 2024</h2>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {requiredSections.map((key) => (
            <section key={key} className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
              <h3 className="text-lg font-semibold text-[#8B3DFF]">{SECTION_META[key].title}</h3>
              <p className="mt-2 text-sm text-[#FFFFFF80]">{SECTION_META[key].description}</p>
              {renderFeedbackFields(key)}
            </section>
          ))}

          <div className="-mx-6 flex justify-end px-6 ">
            <button
              type="submit"
              className="rounded-md bg-[#8B3DFF] px-9 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#7830e5]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default FacultyfeedbackPage
