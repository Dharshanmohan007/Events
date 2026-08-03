import { X, User, Briefcase, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sece-events.onrender.com'

const FacultyViewOffCanvas = ({ facultyId, onClose }) => {
    const [faculty, setFaculty] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isMounted = true

        const fetchFacultyDetails = async () => {
            setLoading(true)
            setError('')
            const token = localStorage.getItem('token')

            try {
                const response = await fetch(`${API_BASE_URL}/api/faculty/${facultyId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch faculty details')
                }

                const data = await response.json()
                if (isMounted) {
                    setFaculty(data)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        if (facultyId) {
            fetchFacultyDetails()
        }

        return () => {
            isMounted = false
        }
    }, [facultyId])

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '-'
        return date.toLocaleDateString('en-GB')
    }

    if (!facultyId) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="absolute right-0 top-0 h-full w-[400px] border-l border-[#1e2a44] bg-[#111a2d] shadow-2xl transition-transform duration-300">
                <div className="flex items-center justify-between border-b border-[#26344f] px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">Faculty Details</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#232A3C] text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="h-[calc(100vh-73px)] overflow-y-auto p-6 table-custom-scrollbar">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B3DFF] border-t-transparent"></div>
                        </div>
                    ) : error ? (
                        <div className="rounded-lg border border-[#ff5470] bg-[#ff547020] p-4 text-center text-sm font-medium text-[#ff5470]">
                            {error}
                        </div>
                    ) : faculty ? (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center pb-6 border-b border-[#26344f]">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#8B3DFF] to-[#4E2593] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                                    {faculty.firstName?.charAt(0) || 'F'}
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    {faculty.salutation} {faculty.firstName} {faculty.lastName}
                                </h3>
                                <p className="text-[#8b93a7] font-medium mt-1">{faculty.designation}</p>
                                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-[#232A3C] text-gray-300">
                                    <Briefcase size={14} />
                                    {faculty.department} (Org: {faculty.originalDepartment})
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8b93a7]">Contact Info</h4>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 rounded-lg border border-[#26344f] bg-[#171F31] p-3">
                                        <Mail size={18} className="text-[#8B3DFF]" />
                                        <div>
                                            <p className="text-[10px] uppercase text-[#8b93a7]">Email Address</p>
                                            <p className="text-sm font-medium text-white">{faculty.email || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg border border-[#26344f] bg-[#171F31] p-3">
                                        <Phone size={18} className="text-[#8B3DFF]" />
                                        <div>
                                            <p className="text-[10px] uppercase text-[#8b93a7]">Phone Number</p>
                                            <p className="text-sm font-medium text-white">{faculty.phone || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg border border-[#26344f] bg-[#171F31] p-3">
                                        <MapPin size={18} className="text-[#8B3DFF]" />
                                        <div>
                                            <p className="text-[10px] uppercase text-[#8b93a7]">Location</p>
                                            <p className="text-sm font-medium text-white">{faculty.location || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8b93a7]">Employment Info</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-[#26344f] bg-[#171F31] p-3">
                                        <p className="text-[10px] uppercase text-[#8b93a7]">Employee ID</p>
                                        <p className="text-sm font-medium text-white">{faculty.empId || '-'}</p>
                                    </div>
                                    <div className="rounded-lg border border-[#26344f] bg-[#171F31] p-3">
                                        <p className="text-[10px] uppercase text-[#8b93a7]">Category</p>
                                        <p className="text-sm font-medium text-white">{faculty.employeeCategory || '-'}</p>
                                    </div>
                                    <div className="rounded-lg border border-[#26344f] bg-[#171F31] p-3">
                                        <p className="text-[10px] uppercase text-[#8b93a7]">Date of Joining</p>
                                        <p className="text-sm font-medium text-white flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(faculty.doj)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-[#26344f] bg-[#171F31] p-3">
                                        <p className="text-[10px] uppercase text-[#8b93a7]">Status</p>
                                        <p className="text-sm font-medium flex items-center gap-1.5 mt-0.5">
                                            {faculty.employmentStatus ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                                    <CheckCircle size={14} /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[#ff5470]">
                                                    <XCircle size={14} /> Inactive
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8b93a7]">Personal Info</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-[#26344f] bg-[#171F31] p-3">
                                        <p className="text-[10px] uppercase text-[#8b93a7]">Gender</p>
                                        <p className="text-sm font-medium text-white">{faculty.gender || '-'}</p>
                                    </div>
                                    <div className="rounded-lg border border-[#26344f] bg-[#171F31] p-3">
                                        <p className="text-[10px] uppercase text-[#8b93a7]">Date of Birth</p>
                                        <p className="text-sm font-medium text-white flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(faculty.dob)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default FacultyViewOffCanvas
