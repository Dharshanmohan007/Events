import { Trash2, X } from 'lucide-react'

const DeleteConfirmationPopup = ({
    title = 'Delete Entry',
    message = 'Are you sure you want to delete this entry? This action cannot be undone.',
    onCancel,
    onDelete,
    reason,
     onReasonChange,
    deleting = false,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="w-[430px] rounded-2xl border border-[#30304f] bg-[#211f3d] px-7 py-6 shadow-2xl">

            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ff3150]/15 text-[#ff3150]">
                <Trash2 size={24} />
            </div>

            {/* Title */}
            <h2 className="mt-4 text-center text-lg font-semibold text-white">
                {title}
            </h2>

            {/* Message */}
            <p className="mx-auto mt-2 max-w-[340px] text-center text-sm leading-5 text-[#9ca3b8]">
                {message}
            </p>

            {/* Reason */}
            <div className="mt-5 text-left">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                    Reason for deletion
                    <span className="ml-1 text-[#ff3150]">*</span>
                </label>

                <textarea
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="Enter the reason for deleting this event..."
                    rows={4}
                    disabled={deleting}
                    className="w-full resize-none rounded-xl border border-[#383653] bg-[#18172f] px-3 py-3 text-sm text-white outline-none placeholder:text-[#6f7185] focus:border-[#8B3DFF] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-1 text-xs text-[#6f7185]">
                    Please provide a reason before deleting the event.
                </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={deleting}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#383653] text-sm font-semibold text-gray-300 hover:bg-[#2a2848] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <X size={16} />
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting || !reason.trim()}
                    className="h-11 rounded-xl bg-[#ff3045b9]/80 text-sm font-semibold text-white hover:bg-[#ff4256]/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {deleting ? 'Deleting...' : 'Delete Event'}
                </button>
            </div>
        </div>
    </div>
)

export default DeleteConfirmationPopup
