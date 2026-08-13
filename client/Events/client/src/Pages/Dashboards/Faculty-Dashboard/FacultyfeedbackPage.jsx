import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useParams } from 'react-router-dom'

const ratingOptions = [
  { value: 'poor', label: 'Poor', icon: '😫' },
  { value: 'minorIssues', label: 'Minor Issues', icon: '🙁' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
  { value: 'positive', label: 'Positive', icon: '😊' },
  { value: 'excellent', label: 'Excellent', icon: '🤩' },
]

const initialFeedback = {
  venue: { rating: '', reason: '' },
  icts: { rating: '', reason: '' },
  audio: { rating: '', reason: '' },
  transport: { rating: '', reason: '' },
  food: { rating: '', reason: '' },
  accommodation: { rating: '', reason: '' },
  mediaPoster: { rating: '', reason: '' },
  mediaVideo: { rating: '', reason: '' },
  purchase: { rating: '', reason: '' },
}

const FacultyfeedbackPage = () => {
  const { eventId } = useParams()
  const [feedback, setFeedback] = useState(initialFeedback)

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

  const handleSubmit = (event) => {
    event.preventDefault()

    const feedbackPayload = {
      eventId,
      feedback,
    }

    console.log('Faculty feedback payload:', feedbackPayload)
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

  return (
    <section className="min-h-screen bg-[#121126] px-6 pb-4 pt-8 text-white poppins">
      <div className="mx-auto max-w-[1310px]">
        <header>
          <h1 className="text-xl font-semibold">Give Your Valuable Feedback</h1>
          <p className="mt-2 max-w-[1050px] text-sm text-[#FFFFFF80]">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
          </p>

          <div className="mt-7 flex items-center gap-3">
            <Sparkles size={30} className="text-[#D8C8FF]" />
            <h2 className="text-2xl font-semibold text-[#DAD8F5]">Nexus Annual Tech Summit 2024</h2>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {/* Venue Feedback Form */}
          <section className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
            <h3 className="text-lg font-semibold text-[#8B3DFF]">Venue Feedback</h3>
            <p className="mt-2 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
            </p>
            {renderFeedbackFields('venue')}
          </section>

          {/* ICTS Feedback Form */}
          <section className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
            <h3 className="text-lg font-semibold text-[#8B3DFF]">ICTS Feedback</h3>
            <p className="mt-2 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
            </p>
            {renderFeedbackFields('icts')}
          </section>

          {/* Audio Feedback Form */}
          <section className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
            <h3 className="text-lg font-semibold text-[#8B3DFF]">Audio Feedback</h3>
            <p className="mt-2 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
            </p>
            {renderFeedbackFields('audio')}
          </section>

          {/* Transport Feedback Form */}
          <section className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
            <h3 className="text-lg font-semibold text-[#8B3DFF]">Transport Feedback</h3>
            <p className="mt-2 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
            </p>
            {renderFeedbackFields('transport')}
          </section>

          {/* Food & Refreshment Feedback Form */}
          <section className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
            <h3 className="text-lg font-semibold text-[#8B3DFF]">Food & Refreshment Feedback</h3>
            <p className="mt-2 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
            </p>
            {renderFeedbackFields('food')}
          </section>

          {/* Accommodation Feedback Form */}
          <section className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
            <h3 className="text-lg font-semibold text-[#8B3DFF]">Accomodation Feedback</h3>
            <p className="mt-2 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
            </p>
            {renderFeedbackFields('accommodation')}
          </section>

          {/* Media Feedback Poster Form */}
          <section className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
            <h3 className="text-lg font-semibold text-[#8B3DFF]">Media Feedback (Poster)</h3>
            <p className="mt-2 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
            </p>
            {renderFeedbackFields('mediaPoster')}
          </section>

          {/* Media Feedback Video Form */}
          <section className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
            <h3 className="text-lg font-semibold text-[#8B3DFF]">Media Feedback (Video)</h3>
            <p className="mt-2 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
            </p>
            {renderFeedbackFields('mediaVideo')}
          </section>

          {/* Purchase Feedback Form */}
          <section className="rounded-lg bg-[#222136] px-4 py-3 sm:px-5">
            <h3 className="text-lg font-semibold text-[#8B3DFF]">Purchase Feedback</h3>
            <p className="mt-2 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
            </p>
            {renderFeedbackFields('purchase')}
          </section>

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
