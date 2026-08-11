import React from 'react'
import { FileText, Video } from 'lucide-react'

const contentText =
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s'

const posterRequirements = [
  { title: 'Content for Poster', text: contentText },
  { referenceLabel: 'Reference poster', file: 'Previous Event Completion Document.pdf', icon: FileText },
  { title: 'Content for Certificate', text: contentText },
  { referenceLabel: 'Reference Certificate', file: 'Previous Event Completion Document.pdf', icon: FileText },
  { title: 'Content for Trophy', text: contentText },
]

const videoSections = [
  { title: 'Pre-Event Videos Needed', items: ['Coming soon video', 'Promotional Video', 'Invitation Video'] },
  { title: 'Post-Event Videos Needed', items: ['Event Glimpse', 'Post Event Video'] },
  { title: 'Special Videos Needed', items: ['Chief Guest Even', 'Testimonials'] },
]

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

const FileReference = ({ label, file, icon = FileText }) => {
  const IconComponent = icon

  return (
    <div className="grid grid-cols-2 rounded-lg border border-[#374155]/70 bg-[#242B3D] px-4 py-4">
      <div className="border-r border-[#6b7280]/50 pr-8 text-sm text-[#CBC3D7]/75">{label}</div>
      <div className="flex items-center gap-3 pl-8 text-sm font-semibold text-[#CBC3D7]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0e5149]/55 text-[#20D18C]">
          <IconComponent size={16} />
        </span>
        {file}
      </div>
    </div>
  )
}

const SplitInfoRow = ({ items }) => (
  <div className="grid grid-cols-2 rounded-lg border border-[#374155]/70 bg-[#242B3D] px-4 py-4">
    {items.map(([label, value, valueClassName], index) => (
      <div key={label} className={`flex items-center justify-between gap-5 px-2 text-sm ${index === 0 ? 'border-r border-[#6b7280]/50 pr-9' : 'pl-5'}`}>
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className={`font-semibold text-white ${valueClassName || ''}`}>{value}</span>
      </div>
    ))}
  </div>
)

const VideoList = ({ title, items }) => (
  <Card title={title}>
    <div>
      {items.map((item) => (
        <p key={item} className="border-b border-[#30384d]/60 py-3 text-sm font-semibold text-[#DDE3F2] last:border-b-0">
          {item}
        </p>
      ))}
    </div>
  </Card>
)

const PosterDetails = () => (
  <section className="rounded-lg border border-[#465168] bg-[#1B2334] p-4">
    <h3 className="text-lg font-semibold text-[#8F5BFF]">Poster</h3>
    <div className="mt-4 space-y-4">
      {posterRequirements.map((item) =>
        item.title ? (
          <Card key={item.title} title={item.title}>
            <p className="text-sm font-medium leading-7 text-[#E6E2F0]">{item.text}</p>
          </Card>
        ) : (
          <FileReference key={item.referenceLabel} label={item.referenceLabel} file={item.file} icon={item.icon} />
        )
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card title="Display Requirement">
          <p className="border-b border-[#30384d]/60 py-3 text-sm font-semibold text-[#DDE3F2]">Flex</p>
          <p className="py-3 text-sm font-semibold text-[#DDE3F2]">Glass Sticker</p>
        </Card>
        <Card title="Size Requirement">
          <SplitInfoRow items={[['Size for Flex', '1200cm'], ['Size for Glass Sticker', '10cm', 'text-[#C9B6FF]']]} />
        </Card>
      </div>

      <SplitInfoRow items={[['Delivery Date', '12/05/2026'], ['Priority', 'HIGH', 'text-[#FF0063]']]} />
      <Card title="Special Requirement">
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">{contentText}</p>
      </Card>
    </div>
  </section>
)

const VideoDetails = () => (
  <section className="rounded-lg border border-[#465168] bg-[#1B2334] p-4">
    <h3 className="text-lg font-semibold text-[#8F5BFF]">Video</h3>
    <div className="mt-4 space-y-4">
      <Card title="Content for Poster">
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">{contentText}</p>
      </Card>
      <FileReference label="Reference poster" file="Previous Event Completion Document.mp4" icon={Video} />
      {videoSections.map((section) => (
        <VideoList key={section.title} {...section} />
      ))}
      <SplitInfoRow items={[['Delivery Date', '12/05/2026'], ['Priority', 'Low', 'text-[#20D18C]']]} />
      <Card title="Special Requirement">
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">{contentText}</p>
      </Card>
    </div>
  </section>
)

const FacultyMediaDetailsPanel = () => {
  return (
    <div className="space-y-6">
      <PosterDetails />
      <VideoDetails />
    </div>
  )
}

export default FacultyMediaDetailsPanel
