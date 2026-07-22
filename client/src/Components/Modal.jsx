import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center poppins">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-md  rounded-xl border border-[#283247] bg-[#151d2e]/30 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#283247] px-6 py-4">
                    <h3 className="text-base font-medium text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#FFFFFF80] transition hover:bg-[#283247] hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
