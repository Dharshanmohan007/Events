import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

const emptyForm = {
    salutation: '',
    firstName: '',
    lastName: '',
    empId: '',
    email: '',
    phone: '',
    department: '',
    originalDepartment: '',
    dob: '',
    gender: '',
    doj: '',
    designation: '',
    employeeCategory: '',
    employmentStatus: 'true',
    location: '',
    role: 'Faculty',
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
        salutation: faculty.salutation || '',
        firstName: faculty.firstName || '',
        lastName: faculty.lastName || '',
        empId: faculty.empId || '',
        email: faculty.email || '',
        phone: faculty.phone ? String(faculty.phone) : '',
        department: faculty.department || '',
        originalDepartment: faculty.originalDepartment || '',
        dob: formatDateForInput(faculty.dob),
        gender: faculty.gender || '',
        doj: formatDateForInput(faculty.doj),
        designation: faculty.designation || '',
        employeeCategory: faculty.employeeCategory || '',
        employmentStatus: String(faculty.employmentStatus ?? true),
        location: faculty.location || '',
        role: faculty.role || 'Faculty',
    }
}

const buildPayload = (form) => ({
    salutation: form.salutation,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    empId: form.empId.trim(),
    email: form.email.trim(),
    phone: Number(form.phone),
    department: form.department,
    originalDepartment: form.originalDepartment,
    dob: form.dob,
    gender: form.gender,
    doj: form.doj,
    designation: form.designation.trim(),
    employeeCategory: form.employeeCategory,
    employmentStatus: form.employmentStatus === 'true',
    location: form.location.trim(),
    role: form.role,
})

const validateForm = (form) => {
    const errors = {}
    const requiredFields = [
        'salutation',
        'firstName',
        'lastName',
        'empId',
        'email',
        'phone',
        'department',
        'originalDepartment',
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

        if (Object.keys(nextErrors).length > 0) {
            console.log("Validation Errors:", nextErrors);
            return
        }

        onSubmit(buildPayload(form))
    }

    const SALUTATION_OPTIONS = [
        { value: 'Mr', label: 'Mr' },
        { value: 'Mrs', label: 'Mrs' },
        { value: 'Ms', label: 'Ms' },
        { value: 'Dr', label: 'Dr' },
        { value: 'Prof', label: 'Prof' },
        { value: 'Lt', label: 'Lt' },
    ];
    const DEPARTMENT_OPTIONS = [
        "CCE", "MECH", "AIML", "CSE", "ECE", "EEE", "AI&DS", "CFRD", "IQAC", 
        "MATHS", "S&H", "IR", "CSBS", "IT", "CYS", "PLACEMENT", "PD", 
        "INNOVATION", "COE", "HR"
    ].map(dep => ({ value: dep, label: dep }));

    const ROLE_OPTIONS = [
        { value: 'Faculty', label: 'Faculty' },
        { value: 'HOD', label: 'HOD' },
    ];

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
                    <div className="grid grid-cols-[1fr_2fr_2fr] gap-3">
                        <SelectField
                            label="Salutation"
                            value={form.salutation}
                            onChange={(value) => updateField('salutation', value)}
                            error={errors.salutation}
                            options={SALUTATION_OPTIONS}
                            required
                        />
                        <Field label="First Name" value={form.firstName} onChange={(value) => updateField('firstName', value)} error={errors.firstName} required />
                        <Field label="Last Name" value={form.lastName} onChange={(value) => updateField('lastName', value)} error={errors.lastName} required />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <Field label="EmpId" value={form.empId} onChange={(value) => updateField('empId', value)} error={errors.empId} required />
                        <Field label="Phone" value={form.phone} onChange={(value) => updateField('phone', value)} error={errors.phone} type="tel" required />
                    </div>

                    <div className="mt-3">
                        <Field label="Email" value={form.email} onChange={(value) => updateField('email', value)} error={errors.email} type="email" required />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <Field
                            label="DOB"
                            value={form.dob}
                            onChange={(value) => updateField('dob', value)}
                            error={errors.dob}
                            type="date"
                            required
                        />
                        <Field
                            label="DOJ"
                            value={form.doj}
                            onChange={(value) => updateField('doj', value)}
                            error={errors.doj}
                            type="date"
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
                            options={DEPARTMENT_OPTIONS}
                        />
                    </div>
                    
                    <div className="mt-3">
                        <SelectField
                            label="Original Department"
                            value={form.originalDepartment}
                            onChange={(value) => updateField('originalDepartment', value)}
                            error={errors.originalDepartment}
                            required
                            options={DEPARTMENT_OPTIONS}
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
                            value={form.role}
                            onChange={(value) => updateField('role', value)}
                            options={ROLE_OPTIONS}
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
