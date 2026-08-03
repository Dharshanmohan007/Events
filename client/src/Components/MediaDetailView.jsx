import React from 'react'
import { FileText, Video } from 'lucide-react'

// ── Shared helpers ──────────────────────────────────────────────────────
const displayValue = (value) =>
  value === null || value === undefined || value === '' ? '-' : String(value)

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(value))
    : '-'

const fileName = (file) =>
  file?.originalName ||
  file?.name ||
  file?.filename ||
  (typeof file === 'string' ? file.split('/').pop() : '-')

// ── Subcomponents ───────────────────────────────────────────────────────
const Card = ({ title, children }) => (
  <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-5">
    {title && (
      <div className="mb-4 flex items-center gap-2 text-base font-medium text-[#E6E2F0]">
        <FileText size={16} />
        {title}
      </div>
    )}
    {children}
  </section>
)

const FileReference = ({ label, files = [], icon: Icon = FileText }) => {
  const names = files.map(fileName).join(', ') || '-'
  return (
    <div className="grid grid-cols-2 rounded-lg border border-[#374155]/70 bg-[#242B3D] px-4 py-4">
      <div className="border-r border-[#6b7280]/50 pr-8 text-sm text-[#CBC3D7]/75">
        {label}
      </div>
      <div className="flex items-center gap-3 pl-8 text-sm font-semibold text-[#CBC3D7]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0e5149]/55 text-[#20D18C]">
          <Icon size={16} />
        </span>
        {names}
      </div>
    </div>
  )
}

const SplitInfoRow = ({ items }) => (
  <div className="grid grid-cols-2 rounded-lg border border-[#374155]/70 bg-[#242B3D] px-4 py-4">
    {items.map(([label, value, valueClassName], index) => (
      <div
        key={label}
        className={`flex items-center justify-between gap-5 px-2 text-sm ${
          index === 0
            ? 'border-r border-[#6b7280]/50 pr-9'
            : 'pl-5'
        }`}
      >
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className={`font-semibold text-white ${valueClassName || ''}`}>
          {value}
        </span>
      </div>
    ))}
  </div>
)

const ListCard = ({ title, items = [] }) => (
  <Card title={title}>
    <div>
      {items.length > 0
        ? items.map((item, idx) => (
            <p
              key={`${item}-${idx}`}
              className="border-b border-[#30384d]/60 py-3 text-sm font-semibold text-[#DDE3F2] last:border-b-0"
            >
              {item}
            </p>
          ))
        : (
          <p className="py-3 text-sm font-semibold text-[#DDE3F2]">-</p>
        )}
    </div>
  </Card>
)

// ── Poster detail section ───────────────────────────────────────────────
const PosterDetails = ({ poster }) => (
  <section className="rounded-lg border border-[#465168] bg-[#1B2334] p-4">
    <h3 className="text-lg font-semibold text-[#8F5BFF]">Poster</h3>
    <div className="mt-4 space-y-4">
      <Card title="Content for Poster">
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
          {displayValue(poster.posterContent)}
        </p>
      </Card>

      <FileReference label="Reference poster" files={poster.referencePosterFiles} />

      <Card title="Content for Certificate">
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
          {displayValue(poster.certificateContent)}
        </p>
      </Card>

      <FileReference label="Reference Certificate" files={poster.referenceCertificateFiles} />

      <Card title="Content for Trophy">
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
          {displayValue(poster.trophyContent)}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Display Requirement">
          {poster.displayNeeded && poster.displayNeeded.length > 0
            ? poster.displayNeeded.map((item) => (
                <p
                  key={item}
                  className="border-b border-[#30384d]/60 py-3 text-sm font-semibold text-[#DDE3F2] last:border-b-0"
                >
                  {item}
                </p>
              ))
            : (
              <p className="py-3 text-sm font-semibold text-[#DDE3F2]">-</p>
            )}
        </Card>
        <Card title="Size Requirement">
          <div>
            {poster.sizes && poster.sizes.length > 0
              ? poster.sizes.map((size) => (
                  <div
                    key={size.type || size}
                    className="flex items-center justify-between border-b border-[#30384d]/60 py-3 text-sm last:border-b-0"
                  >
                    <span className="text-[#CBC3D7]/75">
                      {size.type || '-'}
                    </span>
                    <span className="font-semibold text-white">
                      {displayValue(size.value)}
                    </span>
                  </div>
                ))
              : (
                <p className="py-3 text-sm font-semibold text-[#DDE3F2]">-</p>
              )}
          </div>
        </Card>
      </div>

      <SplitInfoRow
        items={[
          ['Delivery Date', formatDate(poster.deliveryDate)],
          ['Priority', displayValue(poster.priority), 'text-[#FF0063]'],
        ]}
      />

      <Card title="Special Requirement">
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
          {displayValue(poster.specialRequirements)}
        </p>
      </Card>

      {poster.assignedStaff && (
        <Card title="Assigned Staff">
          <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
            {displayValue(poster.assignedStaff)}
          </p>
        </Card>
      )}

      {poster.status && (
        <SplitInfoRow items={[['Status', displayValue(poster.status)]]} />
      )}
    </div>
  </section>
)

// ── Video detail section ────────────────────────────────────────────────
const VideoDetails = ({ video }) => (
  <section className="rounded-lg border border-[#465168] bg-[#1B2334] p-4">
    <h3 className="text-lg font-semibold text-[#8F5BFF]">Video</h3>
    <div className="mt-4 space-y-4">
      <Card title="Content for Video">
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
          {displayValue(video.videoContent)}
        </p>
      </Card>

      <FileReference label="Reference video" files={video.referenceFiles} icon={Video} />

      <ListCard title="Pre-Event Videos Needed" items={video.preEventVideos} />
      <ListCard title="Event Coverage Needed" items={video.eventCoverage} />
      <ListCard title="Post-Event Videos Needed" items={video.postEventVideos} />
      <ListCard title="Special Videos Needed" items={video.specialVideos} />

      <SplitInfoRow
        items={[
          ['Delivery Date', formatDate(video.deliveryDate)],
          ['Priority', displayValue(video.priority), 'text-[#20D18C]'],
        ]}
      />

      <Card title="Special Requirement">
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
          {displayValue(video.specialRequirements)}
        </p>
      </Card>

      {video.assignedStaff && (
        <Card title="Assigned Staff">
          <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
            {displayValue(video.assignedStaff)}
          </p>
        </Card>
      )}

      {video.status && (
        <SplitInfoRow items={[['Status', displayValue(video.status)]]} />
      )}
    </div>
  </section>
)

// ── Main component ──────────────────────────────────────────────────────
/**
 * Reusable media detail view component.
 *
 * Accepts media details via props and renders poster/video requirements.
 *
 * @param {object}  props.mediaDetails - The media requirement details object.
 *   Expected shape: { mediaRequirements: [ { typeOfMedia: [], poster: {}, video: {} }, ... ] }
 */
const MediaDetailView = ({ mediaDetails }) => {
  const requirements = mediaDetails?.mediaRequirements || []

  if (!mediaDetails) {
    return (
      <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
        No media details are available.
      </p>
    )
  }

  if (requirements.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
        No media requirements found for this event.
      </p>
    )
  }

  // For each requirement/day, render only the requested media types
  const renderedSections = requirements.flatMap((requirement, index) =>
    (requirement.typeOfMedia || []).map((type) => {
      if (type === 'poster' && requirement.poster) {
        return (
          <PosterDetails key={`poster-${index}`} poster={requirement.poster} />
        )
      }
      if (type === 'video' && requirement.video) {
        return (
          <VideoDetails key={`video-${index}`} video={requirement.video} />
        )
      }
      return null
    })
  )

  return <div className="space-y-6">{renderedSections}</div>
}

export default MediaDetailView
