import { Plus } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import DeleteConfirmationPopup from './DeleteConfirmationPopup'
import FacultyFormPopup from './FacultyFormPopup'
import FacultyManagementTable from './FacultyManagementTable'
import FacultyViewOffCanvas from './FacultyViewOffCanvas'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sece-events.onrender.com'

const normalizeFaculty = (faculty) => ({
    ...faculty,
    _id: faculty._id,
    salutation: faculty.salutation || '',
    firstName: faculty.firstName || '',
    lastName: faculty.lastName || '',
    role: faculty.role || 'Faculty',
    empId: faculty.empId || '-',
    email: faculty.email || '-',
    phone: faculty.phone || '-',
    department: faculty.department || '-',
    originalDepartment: faculty.originalDepartment || '-',
    designation: faculty.designation || '-',
    employeeCategory: faculty.employeeCategory || '-',
    employmentStatus: faculty.employmentStatus ?? true,
    location: faculty.location || '-',
})

const FacultyManagementPage = () => {
    const [faculties, setFaculties] = useState([])
    const [popupMode, setPopupMode] = useState(null)
    const [editingFaculty, setEditingFaculty] = useState(null)
    const [deletingFaculty, setDeletingFaculty] = useState(null)
    const [viewingFacultyId, setViewingFacultyId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [apiError, setApiError] = useState('')

    const fetchFaculty = async () => {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/api/faculty`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!response.ok) {
            throw new Error('Failed to fetch faculty')
        }

        const responseData = await response.json()
        setFaculties((Array.isArray(responseData) ? responseData : []).map(normalizeFaculty))
    }

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')

        fetch(`${API_BASE_URL}/api/faculty`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch faculty')
                }
                return response.json()
            })
            .then((responseData) => {
                if (isMounted) {
                    setFaculties((Array.isArray(responseData) ? responseData : []).map(normalizeFaculty))
                }
            })
            .catch((error) => {
                if (isMounted) console.warn(error.message)
            })

        return () => {
            isMounted = false
        }
    }, [])

    const departmentOptions = useMemo(
        () => [...new Set(faculties.map((faculty) => faculty.department).filter(Boolean).filter((value) => value !== '-'))],
        [faculties]
    )

    const designationOptions = useMemo(
        () => [...new Set(faculties.map((faculty) => faculty.designation).filter(Boolean).filter((value) => value !== '-'))],
        [faculties]
    )

    const closePopup = () => {
        setPopupMode(null)
        setEditingFaculty(null)
        setApiError('')
    }

    const handleAddClick = () => {
        setEditingFaculty(null)
        setPopupMode('add')
        setApiError('')
    }

    const handleEditClick = (faculty) => {
        setEditingFaculty(faculty)
        setPopupMode('edit')
        setApiError('')
    }

    const handleSubmitFaculty = async (payload) => {
        setSaving(true)
        setApiError('')
        const token = localStorage.getItem('token')
        const isEdit = popupMode === 'edit'
        const url = isEdit
            ? `${API_BASE_URL}/api/faculty/${editingFaculty._id}`
            : `${API_BASE_URL}/api/faculty`

        try {
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const errorMessage = errorData?.message || (isEdit ? 'Failed to update faculty' : 'Failed to add faculty')
                throw new Error(errorMessage)
            }

            await fetchFaculty()
            closePopup()
        } catch (error) {
            setApiError(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteFaculty = async () => {
        if (!deletingFaculty) return

        setDeleting(true)
        const token = localStorage.getItem('token')

        try {
            const response = await fetch(`${API_BASE_URL}/api/faculty/${deletingFaculty._id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })

            if (!response.ok) {
                throw new Error('Failed to delete faculty')
            }

            await fetchFaculty()
            setDeletingFaculty(null)
        } catch (error) {
            console.warn(error.message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <main className='px-6'>
                <div className="heading mt-2 flex items-center justify-between">
                    <div>
                        <h1 className='text-white text-lg font-medium'>Faculty Management</h1>
                        <p className='text-[#FFFFFF80] text-sm'>View and manage faculty members.</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddClick}
                        className='flex items-center gap-2 cursor-pointer hover:bg-gradient-to-r hover:from-[#7c3ae7d2] hover:to-[#3f1e79] px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-[#7C3AE7] to-[#4E2593]'
                    >
                        <Plus size={17} />
                        Add Faculty
                    </button>
                </div>

                <FacultyManagementTable
                    faculties={faculties}
                    onEdit={handleEditClick}
                    onDelete={setDeletingFaculty}
                    onView={(faculty) => setViewingFacultyId(faculty._id)}
                />
            </main>

            {popupMode && (
                <FacultyFormPopup
                    mode={popupMode}
                    faculty={editingFaculty}
                    onClose={closePopup}
                    onSubmit={handleSubmitFaculty}
                    saving={saving}
                    departmentOptions={departmentOptions}
                    designationOptions={designationOptions}
                    apiError={apiError}
                />
            )}

            {deletingFaculty && (
                <DeleteConfirmationPopup
                    title="Delete Entry"
                    message="Are you sure you want to delete this entry? This action cannot be undone."
                    deleting={deleting}
                    onCancel={() => setDeletingFaculty(null)}
                    onDelete={handleDeleteFaculty}
                />
            )}

            {viewingFacultyId && (
                <FacultyViewOffCanvas
                    facultyId={viewingFacultyId}
                    onClose={() => setViewingFacultyId(null)}
                />
            )}
        </>
    )
}

export default FacultyManagementPage
