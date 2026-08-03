import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

const emptyForm = {
    name: '',
    empId: '',
    email: '',
    phone: '',
    department: '',
    dob: '',
    gender: '',
    doj: '',
    designation: '',
    employeeCategory: '',
    employmentStatus: 'true',
    location: '',
}

const DEFAULT_DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'AIDS', 'CCE', 'Placement']
const DEFAULT_DESIGNATIONS = ['HOD', 'Professor', 'Professor & HOD', 'Assistant Professor', 'Full Stack Developer']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const formatDateForInput = (dateValue) => {
    if (!dateValue) return ''

    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return dateValue

    return date.toISOString().slice(0, 10)
}

const createInitialForm = (faculty) => {
    if (!faculty) return emptyForm

    return {
        name: faculty.name || '',
        empId: faculty.empId || '',
        email: faculty.email || '',
        phone: faculty.phone ? String(faculty.phone) : '',
        department: faculty.department || '',
        dob: formatDateForInput(faculty.dob),
        gender: faculty.gender || '',
        doj: formatDateForInput(faculty.doj),
        designation: faculty.designation || '',
        employeeCategory: faculty.employeeCategory || '',
        employmentStatus: String(faculty.employmentStatus ?? true),
        location: faculty.location || '',
    }
}

const buildPayload = (form) => ({
    name: form.name.trim(),
    empId: form.empId.trim(),
    email: form.email.trim(),
    phone: Number(form.phone),
    department: form.department,
    dob: form.dob,
    gender: form.gender,
    doj: form.doj,
    designation: form.designation.trim(),
    employeeCategory: form.employeeCategory,
    employmentStatus: form.employmentStatus === 'true',
    location: form.location.trim(),
})

const validateForm = (form) => {
    const errors = {}
    const requiredFields = [
        'name',
        'empId',
        'email',
        'phone',
        'department',
        'dob',
        'gender',
        'doj',
        'designation',
        'employeeCategory',
        'location',
    ]

    requiredFields.forEach((field) => {
        if (!String(form[field] || '').trim()) {
            errors[field] = 'Required'
        }
    })

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Invalid email'
    }

    if (form.phone && !/^\d{10}$/.test(String(form.phone))) {
        errors.phone = 'Enter 10 digits'
    }

    return errors
}

const FieldError = ({ message }) => (
    message ? <p className="mt-1 text-[10px] text-[#ff5470]">{message}</p> : null
)

const getDateKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const formatDisplayDate = (dateKey) => {
    if (!dateKey) return ''

    const [year, month, day] = dateKey.split('-')
    return `${day}/${month}/${year}`
}

const Field = ({ label, value, onChange, error, type = 'text', required = false, icon }) => (
    <label className="relative block pt-2">
        <span className="absolute left-3 top-0 z-10 bg-[#111a2d] px-1 text-xs font-semibold text-white">
            {label}{required && ' *'}
        </span>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`h-10 w-full rounded-lg border bg-transparent px-3 pt-1 text-xs text-white outline-none placeholder:text-[#8b93a7] ${error ? 'border-[#ff5470]' : 'border-[#4b5568] focus:border-[#853FF9]'
                    } ${icon ? 'pr-9' : ''}`}
            />
            {icon}
        </div>
        <FieldError message={error} />
    </label>
)

const SelectField = ({ label, value, onChange, options, error, required = false }) => (
    <label className="relative block pt-2">
        <span className="absolute left-3 top-0 z-10 bg-[#111a2d] px-1 text-xs font-semibold text-white">
            {label}{required && ' *'}
        </span>
        <div className="relative">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`h-10 w-full appearance-none rounded-lg bg-[#111a2d] px-3 pr-9 pt-1 text-xs text-white outline-none ${error ? 'border border-[#ff5470]' : 'border border-[#4b5568] focus:border-[#853FF9]'
                    }`}
            >
                <option value="" className="bg-[#111a2d] text-white">Select</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#111a2d] text-white">
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" />
        </div>
        <FieldError message={error} />
    </label>
)

const DateField = ({ label, value, onChange, error, required = false }) => {
    const selectedDate = useMemo(() => {
        if (!value) return null

        const [year, month, day] = value.split('-').map(Number)
        return new Date(year, month - 1, day)
    }, [value])

    const [open, setOpen] = useState(false)
    const [displayMonth, setDisplayMonth] = useState(() => selectedDate?.getMonth() ?? new Date().getMonth())
    const [displayYear, setDisplayYear] = useState(() => selectedDate?.getFullYear() ?? new Date().getFullYear())
    const pickerRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const firstDay = new Date(displayYear, displayMonth, 1).getDay()
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate()

    const goToPreviousMonth = () => {
        if (displayMonth === 0) {
            setDisplayMonth(11)
            setDisplayYear((year) => year - 1)
            return
        }

        setDisplayMonth((month) => month - 1)
    }

    const goToNextMonth = () => {
        if (displayMonth === 11) {
            setDisplayMonth(0)
            setDisplayYear((year) => year + 1)
            return
        }

        setDisplayMonth((month) => month + 1)
    }

    const handleSelectDate = (day) => {
        onChange(getDateKey(new Date(displayYear, displayMonth, day)))
        setOpen(false)
    }

    return (
        <div ref={pickerRef} className="relative block pt-2">
            <span className="absolute left-3 top-0 z-10 bg-[#111a2d] px-1 text-xs font-semibold text-white">
                {label}{required && ' *'}
            </span>
            <button
                type="button"
                onClick={() => {
                    if (selectedDate) {
                        setDisplayMonth(selectedDate.getMonth())
                        setDisplayYear(selectedDate.getFullYear())
                    }
                    setOpen((current) => !current)
                }}
                className={`flex h-10 w-full items-center justify-between rounded-lg border bg-transparent px-3 pt-1 text-left text-xs outline-none ${error ? 'border-[#ff5470]' : open ? 'border-[#853FF9]' : 'border-[#4b5568]'
                    }`}
            >
                <span className={value ? 'text-white' : 'text-[#8b93a7]'}>
                    {value ? formatDisplayDate(value) : '__/__/____'}
                </span>
                <CalendarDays size={14} className="text-gray-400" />
            </button>
            <FieldError message={error} />

            {open && (
                <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-[#303b52] bg-[#171F31] p-3 shadow-2xl">
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={goToPreviousMonth}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#232A3C] hover:text-white"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-semibold text-white">
                            {MONTHS[displayMonth]} {displayYear}
                        </span>
                        <button
                            type="button"
                            onClick={goToNextMonth}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#232A3C] hover:text-white"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="mb-1 grid grid-cols-7">
                        {WEEK_DAYS.map((day) => (
                            <div key={day} className="py-1 text-center text-xs text-[#7f8799]">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, index) => (
                            <div key={`empty-${index}`} />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, index) => {
                            const day = index + 1
                            const dateKey = getDateKey(new Date(displayYear, displayMonth, day))
                            const isSelected = value === dateKey

                            return (
                                <button
                                    key={dateKey}
                                    type="button"
                                    onClick={() => handleSelectDate(day)}
                                    className={`h-8 rounded-lg text-xs transition-colors ${isSelected ? 'bg-[#8B3DFF] text-white' : 'text-gray-300 hover:bg-[#232A3C] hover:text-white'
                                        }`}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

const FacultyFormPopup = ({
    mode = 'add',
    faculty,
    onClose,
    onSubmit,
    saving,
    departmentOptions = [],
    designationOptions = [],
    apiError = '',
}) => {
    const [form, setForm] = useState(() => createInitialForm(faculty))
    const [errors, setErrors] = useState({})

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }))
        setErrors((current) => ({ ...current, [field]: '' }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const nextErrors = validateForm(form)
        setErrors(nextErrors)

        if (Object.keys(nextErrors).length > 0) return

        onSubmit(buildPayload(form))
    }

    const departments = [...new Set([form.department, ...departmentOptions, ...DEFAULT_DEPARTMENTS].filter(Boolean))]
    const designations = [...new Set([form.designation, ...designationOptions, ...DEFAULT_DESIGNATIONS].filter(Boolean))]

    return (
        <div className="fixed inset-0 z-50  bg-black/40 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex h-[100vh] w-[45%] absolute top-0 right-0 flex-col rounded-lg border border-[#1e2a44] bg-[#111a2d] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#26344f] px-4 py-3">
                    <h2 className="text-sm font-semibold text-white">
                        {mode === 'edit' ? 'Edit Faculty' : 'Add Faculty'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#232A3C] text-gray-400 hover:text-white"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 table-custom-scrollbar">
                    {apiError && (
                        <div className="mb-4 rounded-lg border border-[#ff5470] bg-[#ff547020] p-3">
                            <p className="text-xs font-semibold text-[#ff5470]">{apiError}</p>
                        </div>
                    )}
                    <Field label="Name" value={form.name} onChange={(value) => updateField('name', value)} error={errors.name} required />

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <Field label="EmpId" value={form.empId} onChange={(value) => updateField('empId', value)} error={errors.empId} required />
                        <Field label="Phone" value={form.phone} onChange={(value) => updateField('phone', value)} error={errors.phone} type="tel" required />
                    </div>

                    <div className="mt-3">
                        <Field label="Email" value={form.email} onChange={(value) => updateField('email', value)} error={errors.email} type="email" required />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <DateField
                            label="DOB"
                            value={form.dob}
                            onChange={(value) => updateField('dob', value)}
                            error={errors.dob}
                            required
                        />
                        <DateField
                            label="DOJ"
                            value={form.doj}
                            onChange={(value) => updateField('doj', value)}
                            error={errors.doj}
                            required
                        />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <SelectField
                            label="Gender"
                            value={form.gender}
                            onChange={(value) => updateField('gender', value)}
                            error={errors.gender}
                            required
                            options={[
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' },
                            ]}
                        />
                        <SelectField
                            label="Department"
                            value={form.department}
                            onChange={(value) => updateField('department', value)}
                            error={errors.department}
                            required
                            options={departments.map((department) => ({ value: department, label: department }))}
                        />
                    </div>

                    <div className="mt-3">
                        <Field label="Designation" value={form.designation} onChange={(value) => updateField('designation', value)} error={errors.designation} required />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <SelectField
                            label="Employment Category"
                            value={form.employeeCategory}
                            onChange={(value) => updateField('employeeCategory', value)}
                            error={errors.employeeCategory}
                            required
                            options={[
                                { value: 'Teaching', label: 'Teaching' },
                                { value: 'Non-Teaching', label: 'Non-Teaching' },
                            ]}
                        />
                        <SelectField
                            label="Employment Status"
                            value={form.employmentStatus}
                            onChange={(value) => updateField('employmentStatus', value)}
                            required
                            options={[
                                { value: 'true', label: 'Active' },
                                { value: 'false', label: 'Inactive' },
                            ]}
                        />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <Field label="Location" value={form.location} onChange={(value) => updateField('location', value)} error={errors.location} required />
                        <SelectField
                            label="Role"
                            value={form.designation}
                            onChange={(value) => updateField('designation', value)}
                            options={designations.map((designation) => ({ value: designation, label: designation }))}
                        />
                    </div>
                </div>

                <div className="px-4 pb-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-11 w-full rounded bg-gradient-to-r from-[#8B3DFF] to-[#5927a8] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default FacultyFormPopup
