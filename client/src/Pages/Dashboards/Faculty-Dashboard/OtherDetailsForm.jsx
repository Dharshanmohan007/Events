import React from 'react'

const SDG_OPTIONS = [
  'SDG 1', 'SDG 2', 'SDG 3', 'SDG 4', 'SDG 5',
  'SDG 6', 'SDG 7', 'SDG 8', 'SDG 9', 'SDG 10',
  'SDG 11', 'SDG 12', 'SDG 13', 'SDG 14', 'SDG 15',
  'SDG 16', 'SDG 17',
]

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

const FloatingSelect = ({ label, value, onChange, children }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="peer w-full bg-transparent border border-gray-700 rounded-md px-3 pt-5 pb-2 text-sm text-white appearance-none cursor-pointer focus:border-[#8B5CF6]"
    >
      {children}
    </select>
    <label className="absolute top-[-8px] left-3 bg-[#151d31] px-1 text-[11px] text-white peer-focus:text-[#8B5CF6] transition-colors pointer-events-none">
      {label}
    </label>
    {/* Dropdown arrow */}
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#CBC3D7]/40">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
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

const OtherDetailsForm = ({ otherData, setOtherData }) => {

  const handleParticipantChange = (gender, field, value) => {
    setOtherData((prev) => ({
      ...prev,
      participants: {
        ...prev.participants,
        [gender]: {
          ...(prev.participants?.[gender] || {}),
          [field]: value,
        },
      },
    }))
  }

  const handleSdgChange = (field, value) => {
    setOtherData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSecondarySdgToggle = (sdg) => {
    setOtherData((prev) => {
      const current = prev.secondarySdg || []
      const updated = current.includes(sdg)
        ? current.filter((s) => s !== sdg)
        : [...current, sdg]
      return { ...prev, secondarySdg: updated }
    })
  }

  const handleAboutProgramChange = (value) => {
    setOtherData((prev) => ({
      ...prev,
      aboutProgram: value,
    }))
  }

  const male = otherData.participants?.male || {}
  const female = otherData.participants?.female || {}

  return (
    <div className="px-7 pt-4 text-white poppins">
      <div className="mb-2">
        <h1 className="text-xl font-medium text-white">Other Details</h1>
      </div>

      <div className="space-y-6 overflow-y-auto pr-3 custom-scrollbar">
        {/* Participants Details */}
        <div className="rounded-lg bg-[#151d31] p-5">
          <h3 className="text-[#8B5CF6] font-medium text-sm mb-4">Participants Details</h3>

          {/* Male Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FloatingInput
              label="Total Male Participants Count *"
              type="number"
              value={male.total || ''}
              onChange={(e) => handleParticipantChange('male', 'total', e.target.value)}
            />
            <FloatingInput
              label="Total Male Participants Count Within State *"
              type="number"
              value={male.withinState || ''}
              onChange={(e) => handleParticipantChange('male', 'withinState', e.target.value)}
            />
            <FloatingInput
              label="Total Male Participants Count other State *"
              type="number"
              value={male.outsideState || ''}
              onChange={(e) => handleParticipantChange('male', 'outsideState', e.target.value)}
            />
          </div>

          {/* Female Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FloatingInput
              label="Total Fe-Male Participants Count *"
              type="number"
              value={female.total || ''}
              onChange={(e) => handleParticipantChange('female', 'total', e.target.value)}
            />
            <FloatingInput
              label="Total Fe-Male Participants Count Within State *"
              type="number"
              value={female.withinState || ''}
              onChange={(e) => handleParticipantChange('female', 'withinState', e.target.value)}
            />
            <FloatingInput
              label="Total Fe-Male Participants Count other State *"
              type="number"
              value={female.outsideState || ''}
              onChange={(e) => handleParticipantChange('female', 'outsideState', e.target.value)}
            />
          </div>
        </div>

        {/* SDG Details */}
        <div className="rounded-lg bg-[#151d31] p-5">
          <h3 className="text-[#8B5CF6] font-medium text-sm mb-4">SDG Details</h3>

          <div className="space-y-4">
            <FloatingSelect
              label="Primary SDG *"
              value={otherData.primarySdg || ''}
              onChange={(e) => handleSdgChange('primarySdg', e.target.value)}
            >
              <option value="" className="bg-[#151d31]">Select</option>
              {SDG_OPTIONS.map((sdg) => (
                <option key={sdg} value={sdg} className="bg-[#151d31]">{sdg}</option>
              ))}
            </FloatingSelect>

            <div>
              <label className="block text-[11px] text-[#CBC3D7]/60 mb-2">Secondary SDG *</label>
              <div className="flex flex-wrap gap-2">
                {SDG_OPTIONS.map((sdg) => (
                  <button
                    key={sdg}
                    type="button"
                    onClick={() => handleSecondarySdgToggle(sdg)}
                    className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                      (otherData.secondarySdg || []).includes(sdg)
                        ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                        : 'bg-transparent border-gray-700 text-[#CBC3D7]/60 hover:border-[#8B5CF6]/50'
                    }`}
                  >
                    {sdg}
                  </button>
                ))}
              </div>
              {(otherData.secondarySdg || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(otherData.secondarySdg || []).map((sdg) => (
                    <span key={sdg} className="flex items-center gap-1 px-2 py-0.5 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded text-xs">
                      {sdg}
                      <button
                        type="button"
                        onClick={() => handleSecondarySdgToggle(sdg)}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About Program */}
        <div>
          <FloatingTextarea
            label="About Program *"
            value={otherData.aboutProgram || ''}
            onChange={(e) => handleAboutProgramChange(e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}

export default OtherDetailsForm
