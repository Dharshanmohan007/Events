import { ChevronDown, X } from 'lucide-react'
import { useState } from 'react'

const emptyForm = {
    block: '',
    floor: '',
    venue: '',
    capacity: '',
    audio: {
        wiredMic: '',
        handMic: '',
        collarMic: '',
        handSpeaker: '',
        speakerWithMixer: '',
        paSystem: '',
        podiumWithMic: '',
    },
    seating: {
        withoutProctoring: '',
        withProctoring: '',
    },
    remarks: '',
}

const toNumber = (value) => Number(value) || 0

const createInitialForm = (venue) => {
    if (!venue) return emptyForm

    return {
        block: venue.block || '',
        floor: venue.floor || '',
        venue: venue.venue || '',
        capacity: venue.capacity ?? '',
        audio: {
            wiredMic: venue.audio?.wiredMic ?? '',
            handMic: venue.audio?.handMic ?? '',
            collarMic: venue.audio?.collarMic ?? '',
            handSpeaker: venue.audio?.handSpeaker ?? '',
            speakerWithMixer: venue.audio?.speakerWithMixer ?? '',
            paSystem: venue.audio?.paSystem ?? '',
            podiumWithMic: venue.audio?.podiumWithMic ?? '',
        },
        seating: {
            withoutProctoring: venue.seating?.withoutProctoring ?? '',
            withProctoring: venue.seating?.withProctoring ?? '',
        },
        remarks: venue.remarks || '',
    }
}

const buildPayload = (form) => ({
    block: form.block,
    floor: form.floor,
    venue: form.venue,
    capacity: toNumber(form.capacity),
    audio: {
        wiredMic: toNumber(form.audio.wiredMic),
        handMic: toNumber(form.audio.handMic),
        collarMic: toNumber(form.audio.collarMic),
        handSpeaker: toNumber(form.audio.handSpeaker),
        speakerWithMixer: toNumber(form.audio.speakerWithMixer),
        paSystem: toNumber(form.audio.paSystem),
        podiumWithMic: toNumber(form.audio.podiumWithMic),
    },
    seating: {
        withoutProctoring: toNumber(form.seating.withoutProctoring),
        withProctoring: toNumber(form.seating.withProctoring),
    },
    remarks: form.remarks,
})

const Field = ({ label, value, onChange, type = 'text', required = false, textarea = false, labelBgClass = 'bg-[#111a2d]' }) => (
    <label className="relative block pt-2">
        <span className={`absolute left-3 top-0 z-10 px-1 text-[11px] font-semibold text-white ${labelBgClass}`}>
            {label}{required && ' *'}
        </span>
        {textarea ? (
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-[#4b5568] bg-transparent px-3 pb-2 pt-3 text-xs text-white outline-none placeholder:text-[#8b93a7] focus:border-[#853FF9]"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-9 w-full rounded-lg border border-[#4b5568] bg-transparent px-3 pt-1 text-xs text-white outline-none placeholder:text-[#8b93a7] focus:border-[#853FF9]"
            />
        )}
    </label>
)

const SelectField = ({ label, value, onChange, options, required = false }) => (
    <label className="relative block pt-2">
        <span className="absolute left-3 top-0 z-10 bg-[#111a2d] px-1 text-[11px] font-semibold text-white">
            {label}{required && ' *'}
        </span>
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-full appearance-none rounded-lg border border-[#4b5568] bg-[#111a2d] px-3 pr-9 pt-1 text-xs text-white outline-none focus:border-[#853FF9]"
        >
            <option value="" className="bg-[#111a2d] text-white">Select {label}</option>
            {[...new Set([value, ...options].filter(Boolean))].map((option) => (
                <option key={option} value={option} className="bg-[#111a2d] text-white">
                    {option}
                </option>
            ))}
        </select>
        <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 translate-y-[-20%] text-white"
        />
    </label>
)

const NumberField = (props) => <Field {...props} type="number" />

const VenuFormPopup = ({ mode = 'add', venue, onClose, onSubmit, saving, blockOptions = [], floorOptions = [] }) => {
    const [form, setForm] = useState(() => createInitialForm(venue))

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }))
    }

    const updateNestedField = (section, field, value) => {
        setForm((current) => ({
            ...current,
            [section]: {
                ...current[section],
                [field]: value,
            },
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        onSubmit(buildPayload(form))
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
            <aside className="fixed right-0 top-0 h-[98vh] w-[90%] sm:w-[60%]  md:w-[35%]  overflow-y-auto  p-6 shadow-2xl table-custom-scrollbar">
                <form onSubmit={handleSubmit} className="rounded-xl h-full  border border-[#1e2a44] bg-[#111a2d]">
                    <div className="flex items-center justify-between py-2 px-4 border-b border-gray-600">
                        <h2 className="text-base font-semibold text-white">
                            {mode === 'edit' ? 'Edit Venue' : 'Add Venue'}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#232A3C] text-gray-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="form-container px-4 h-[78%] overflow-y-auto table-custom-scrollbar mt-2">
                        <div className="grid grid-cols-2 gap-3 ">
                            <SelectField label="Block" value={form.block} onChange={(value) => updateField('block', value)} options={blockOptions} required />
                            <SelectField label="Floor" value={form.floor} onChange={(value) => updateField('floor', value)} options={floorOptions} required />
                        </div>

                        <div className="mt-3">
                            <Field label="Venue" value={form.venue} onChange={(value) => updateField('venue', value)} required />
                        </div>

                        <div className="mt-3">
                            <NumberField label="Capacity" value={form.capacity} onChange={(value) => updateField('capacity', value)} required />
                        </div>

                        <section className="mt-4 rounded-xl border border-[#252f49] bg-[#171735] p-4">
                            <h3 className="mb-3 text-sm font-medium text-[#853FF9]">Audio</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <NumberField label="Wired Mic" value={form.audio.wiredMic} onChange={(value) => updateNestedField('audio', 'wiredMic', value)} required labelBgClass="bg-[#171735]" />
                                <NumberField label="Hand Mic" value={form.audio.handMic} onChange={(value) => updateNestedField('audio', 'handMic', value)} required labelBgClass="bg-[#171735]" />
                                <NumberField label="Collar Mic" value={form.audio.collarMic} onChange={(value) => updateNestedField('audio', 'collarMic', value)} required labelBgClass="bg-[#171735]" />
                                <NumberField label="Hand Speaker" value={form.audio.handSpeaker} onChange={(value) => updateNestedField('audio', 'handSpeaker', value)} required labelBgClass="bg-[#171735]" />
                                <NumberField label="Speaker With Mixer" value={form.audio.speakerWithMixer} onChange={(value) => updateNestedField('audio', 'speakerWithMixer', value)} required labelBgClass="bg-[#171735]" />
                                <NumberField label="PA System" value={form.audio.paSystem} onChange={(value) => updateNestedField('audio', 'paSystem', value)} required labelBgClass="bg-[#171735]" />
                            </div>
                            <div className="mt-3">
                                <NumberField label="Podium With Mic" value={form.audio.podiumWithMic} onChange={(value) => updateNestedField('audio', 'podiumWithMic', value)} required labelBgClass="bg-[#171735]" />
                            </div>
                        </section>

                        <section className="mt-4 rounded-xl border border-[#252f49] bg-[#171735] p-4">
                            <h3 className="mb-3 text-sm font-medium text-[#853FF9]">Seating</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <NumberField label="Without Proctoring" value={form.seating.withoutProctoring} onChange={(value) => updateNestedField('seating', 'withoutProctoring', value)} required labelBgClass="bg-[#171735]" />
                                <NumberField label="With Proctoring" value={form.seating.withProctoring} onChange={(value) => updateNestedField('seating', 'withProctoring', value)} required labelBgClass="bg-[#171735]" />
                            </div>
                        </section>

                        <div className="mt-4">
                            <Field label="Remarks" value={form.remarks} onChange={(value) => updateField('remarks', value)} required textarea />
                        </div>

                    </div>

                    <div className="btn-container mt-4 px-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className=" w-full rounded-lg bg-linear-to-r from-[#4F2593] to-[#853FF9] hover:bg-linear-to-l hover:from-[#4F2593] hover:to-[#853FF9] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    )
}

export default VenuFormPopup
