import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react'
import Modal from './Modal'
import { showSuccessToast, showErrorToast } from './CustomToast'
import { useAuth } from './AuthContext'
import { API_BASE } from '../utils/apiConfig'

const getStoredEmail = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    return stored?.email || "";
  } catch {
    return "";
  }
};

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showFields, setShowFields] = useState({ old: false, new: false, confirm: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the form every time the modal opens (state adjusted during render —
  // the recommended pattern for resetting state when a prop changes)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowFields({ old: false, new: false, confirm: false });
      setFieldErrors({});
      setIsSubmitting(false);
    }
  }

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onClose();
  }, [isSubmitting, onClose]);

  // Allow closing via Escape (but not while a request is in flight, and only
  // while the modal is actually open)
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) handleClose();
    },
    [isOpen, isSubmitting, handleClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const validate = () => {
    const errs = {};

    if (!oldPassword) errs.old = "Old password is required";

    if (!newPassword) errs.new = "New password is required";
    else if (newPassword.length < 6)
      errs.new = "New password must be at least 6 characters";
    else if (newPassword === oldPassword)
      errs.new = "New password must be different from the old password";

    if (!confirmPassword) errs.confirm = "Please confirm your new password";
    else if (confirmPassword !== newPassword)
      errs.confirm = "Passwords do not match";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFieldChange = (field, value) => {
    if (field === "old") setOldPassword(value);
    else if (field === "new") setNewPassword(value);
    else setConfirmPassword(value);

    // Clear a field's error as soon as the user edits it
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const toggleVisibility = (field) =>
    setShowFields((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    const email = user?.email || getStoredEmail();

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      showSuccessToast(
        "Password Changed",
        "Your password has been updated successfully. Please log in again."
      );

      // Clear the session and send the user back to the login page
      logout();
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFieldErrors({});
      onClose();
      navigate("/", { replace: true });
    } catch (err) {
      showErrorToast(
        "Change Password Failed",
        err.message || "Unable to change password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPasswordField = ({ field, label, value, placeholder }) => {
    const show = showFields[field];
    return (
      <div>
        <label className="mb-1.5 block text-sm text-[#CBC3D7]/80">
          {label} <span className="text-[#FF4F91]">*</span>
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={placeholder}
            disabled={isSubmitting}
            className={`w-full rounded-lg border bg-[#1B2334] py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-[#CBC3D7]/35 outline-none transition focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${
              fieldErrors[field]
                ? "border-[#FF4F91] focus:border-[#FF4F91] focus:ring-[#FF4F91]/40"
                : "border-[#374155] focus:border-[#8B3DFF] focus:ring-[#8B3DFF]/40"
            }`}
          />
          <Lock
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#CBC3D7]/40"
          />
          <button
            type="button"
            onClick={() => toggleVisibility(field)}
            disabled={isSubmitting}
            tabIndex={-1}
            aria-label={show ? `Hide ${label}` : `Show ${label}`}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CBC3D7]/50 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {fieldErrors[field] && (
          <p className="mt-1.5 text-xs text-[#FF4F91]">{fieldErrors[field]}</p>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-sm leading-relaxed text-[#CBC3D7]/60">
          To keep your account secure, please enter your current password and
          choose a new one.
        </p>

        {renderPasswordField({
          field: "old",
          label: "Old Password",
          value: oldPassword,
          placeholder: "Enter your current password",
        })}

        {renderPasswordField({
          field: "new",
          label: "New Password",
          value: newPassword,
          placeholder: "Enter a new password (min 6 characters)",
        })}

        {renderPasswordField({
          field: "confirm",
          label: "Confirm New Password",
          value: confirmPassword,
          placeholder: "Re-enter your new password",
        })}

        <div className="flex items-start gap-2.5 rounded-lg border border-[#374155]/60 bg-[#1B2334] px-3.5 py-2.5">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#8B3DFF]" />
          <p className="text-xs leading-relaxed text-[#CBC3D7]/55">
            Your new password must be at least 6 characters long and different
            from your old password.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-[#374155] bg-transparent px-5 py-2 text-sm font-medium text-[#CBC3D7]/70 transition hover:bg-[#283247] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-[#8B3DFF] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#7a2de8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
