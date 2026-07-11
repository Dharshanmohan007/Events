import { Trash2 } from 'lucide-react'

const DeleteConfirmationPopup = ({
    title = 'Delete Entry',
    message = 'Are you sure you want to delete this entry? This action cannot be undone.',
    onCancel,
    onDelete,
    deleting = false,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-[430px] rounded-2xl border border-[#30304f] bg-[#211f3d] px-7 py-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ff3150]/15 text-[#ff3150]">
                <Trash2 size={24} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
            <p className="mx-auto mt-2 max-w-[320px] text-sm leading-5 text-[#9ca3b8]">
                {message}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={deleting}
                    className="h-11 rounded-xl border border-[#383653] text-sm font-semibold text-gray-300 hover:bg-[#2a2848] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting}
                    className="h-11 rounded-xl bg-[#ff3045] text-sm font-semibold text-white hover:bg-[#ff4256] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
)

export default DeleteConfirmationPopup
