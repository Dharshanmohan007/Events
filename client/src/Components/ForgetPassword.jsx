import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Step indicators ──────────────────────────────────────────────────────────
function StepDots({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-500 ${
            i === current
              ? "w-6 bg-purple-500"
              : i < current
              ? "w-3 bg-purple-500/40"
              : "w-3 bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Floating label input ─────────────────────────────────────────────────────
function FloatingInput({ label, required, error, ...props }) {
  return (
    <div>
      <div className="relative group">
        <span
          className="absolute left-3.5 -top-[9px] text-xs text-white/70 px-1 z-10 pointer-events-none"
          style={{ backgroundColor: "#13111f" }}
        >
          {label} {required && <span className="text-purple-400">*</span>}
        </span>
        <input
          {...props}
          className={`w-full bg-transparent rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none border transition-all duration-200 ${
            error
              ? "border-red-400/70 focus:border-red-400"
              : "border-[#3A3A5A] focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
          }`}
        />
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1.5 ml-1">{error}</p>
      )}
    </div>
  );
}

// ─── OTP input boxes ──────────────────────────────────────────────────────────
function OtpInput({ value, onChange, error }) {
  const digits = 6;
  const arr = Array.from({ length: digits }, (_, i) => value[i] || "");

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      if (arr[idx]) {
        const next = arr.map((d, i) => (i === idx ? "" : d)).join("");
        onChange(next);
      } else if (idx > 0) {
        document.getElementById(`otp-${idx - 1}`)?.focus();
      }
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = arr.map((d, i) => (i === idx ? e.key : d)).join("");
    onChange(next);
    if (idx < digits - 1) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits);
    onChange(paste.padEnd(digits, "").slice(0, digits));
    document.getElementById(`otp-${Math.min(paste.length, digits - 1)}`)?.focus();
    e.preventDefault();
  };

  return (
    <div>
      <div className="flex gap-2.5 justify-center">
        {arr.map((d, idx) => (
          <input
            key={idx}
            id={`otp-${idx}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={() => {}}
            onKeyDown={(e) => handleKey(e, idx)}
            onPaste={handlePaste}
            className={`w-11 h-12 text-center text-lg font-semibold text-white bg-transparent rounded-xl border outline-none transition-all duration-200 ${
              d
                ? "border-purple-500 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
                : error
                ? "border-red-400/70"
                : "border-[#3A3A5A] focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
            }`}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}

// ─── Submit button ────────────────────────────────────────────────────────────
function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="relative w-full py-3.5 rounded-xl text-white font-semibold text-sm overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-purple-700/30 active:scale-[0.98]"
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
      }}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Please wait...
          </>
        ) : (
          <>
            {label}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </span>
    </button>
  );
}

// ─── Alert banner ─────────────────────────────────────────────────────────────
function AlertBanner({ message, type = "error" }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div className={`mb-5 flex items-center gap-2.5 rounded-lg px-4 py-3 border ${
      isError ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"
    }`}>
      <svg className={`w-4 h-4 flex-shrink-0 ${isError ? "text-red-400" : "text-emerald-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isError ? (
          <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
        ) : (
          <><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></>
        )}
      </svg>
      <p className={`text-xs ${isError ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
    </div>
  );
}

// ─── Step 1: Email ────────────────────────────────────────────────────────────
function StepEmail({ onNext, mounted }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!email.trim()) return setError("E-mail is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid e-mail address");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      onNext(email);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <StepDots current={0} />
      <div className="mb-7">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
          Forgot Password?
        </h2>
        <p className="text-white/40 text-xs leading-relaxed">
          No worries! Enter the e-mail address linked to your account and we'll send you a verification code.
        </p>
      </div>

      <AlertBanner message={apiError} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FloatingInput
          label="E-mail Address"
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); setApiError(""); }}
          placeholder="Enter your registered e-mail"
          error={error}
        />
        <SubmitButton loading={loading} label="Send Verification Code" />
      </form>
    </div>
  );
}

// ─── Step 2: OTP ──────────────────────────────────────────────────────────────
function StepOtp({ email, onNext, onBack, mounted }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (otp.length < 6) return setError("Please enter the complete 6-digit code");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      onNext(otp);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setApiError("");
    try {
      await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendCooldown(60);
    } catch {
      setApiError("Failed to resend code. Try again.");
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c);

  return (
    <div className={`transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <StepDots current={1} />
      <div className="mb-7">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
          Verify Your Identity
        </h2>
        <p className="text-white/40 text-xs leading-relaxed">
          We've sent a 6-digit code to{" "}
          <span className="text-purple-400 font-medium">{maskedEmail}</span>. Enter it below to proceed.
        </p>
      </div>

      <AlertBanner message={apiError} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); setApiError(""); }} error={error} />

        <SubmitButton loading={loading} label="Verify Code" />

        <div className="text-center">
          <p className="text-white/40 text-xs">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={`font-semibold transition-colors ${
                resendCooldown > 0
                  ? "text-white/20 cursor-not-allowed"
                  : "text-purple-400 hover:text-purple-300 hover:underline"
              }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
            </button>
          </p>
        </div>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-5 flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors mx-auto"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to email
      </button>
    </div>
  );
}

// ─── Step 3: New Password ─────────────────────────────────────────────────────
function StepNewPassword({ email, otp, mounted }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getStrength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"][strength];

  const validate = () => {
    const errs = {};
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "Must be at least 8 characters";
    if (!confirm) errs.confirm = "Please confirm your password";
    else if (password !== confirm) errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`flex flex-col items-center text-center transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6 animate-[bounce_1s_ease_1]">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
          Password Reset!
        </h2>
        <p className="text-white/40 text-xs leading-relaxed mb-4">
          Your password has been changed successfully. Redirecting you to login…
        </p>
        <div className="w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 animate-[progress_2.5s_linear_forwards]" style={{ animationName: "width-grow" }} />
        </div>
        <style>{`
          @keyframes width-grow {
            from { width: 0% }
            to   { width: 100% }
          }
          .animate-\\[progress_2\\.5s_linear_forwards\\] {
            animation: width-grow 2.5s linear forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <StepDots current={2} />
      <div className="mb-7">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
          Set New Password
        </h2>
        <p className="text-white/40 text-xs leading-relaxed">
          Choose a strong password you haven't used before. Make it at least 8 characters long.
        </p>
      </div>

      <AlertBanner message={apiError} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* New password */}
        <div>
          <div className="relative group">
            <span
              className="absolute left-3.5 -top-[9px] text-xs text-white/70 px-1 z-10 pointer-events-none"
              style={{ backgroundColor: "#13111f" }}
            >
              New Password <span className="text-purple-400">*</span>
            </span>
            <input
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => { const c = {...p}; delete c.password; return c; }); setApiError(""); }}
              placeholder="Enter new password"
              className={`w-full bg-transparent rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-white/20 outline-none border transition-all duration-200 ${
                errors.password ? "border-red-400/70" : "border-[#3A3A5A] focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
              }`}
            />
            <button type="button" onClick={() => setShowPass((v) => !v)} tabIndex={-1} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1">
              {showPass ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>}
          {/* Strength meter */}
          {password.length > 0 && (
            <div className="mt-2.5 px-1">
              <div className="flex gap-1 mb-1">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-white/10"}`} />
                ))}
              </div>
              <p className={`text-[10px] ${["","text-red-400","text-yellow-400","text-blue-400","text-emerald-400"][strength]}`}>
                {strengthLabel} password
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <div className="relative group">
            <span
              className="absolute left-3.5 -top-[9px] text-xs text-white/70 px-1 z-10 pointer-events-none"
              style={{ backgroundColor: "#13111f" }}
            >
              Confirm Password <span className="text-purple-400">*</span>
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((p) => { const c = {...p}; delete c.confirm; return c; }); setApiError(""); }}
              placeholder="Re-enter new password"
              className={`w-full bg-transparent rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-white/20 outline-none border transition-all duration-200 ${
                errors.confirm ? "border-red-400/70" : confirm && confirm === password ? "border-emerald-500/50" : "border-[#3A3A5A] focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
              }`}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1">
              {showConfirm ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
          {errors.confirm && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.confirm}</p>}
          {!errors.confirm && confirm && confirm === password && (
            <p className="text-emerald-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
              Passwords match
            </p>
          )}
        </div>

        <SubmitButton loading={loading} label="Reset Password" />
      </form>
    </div>
  );
}

// ─── Main ForgetPassword component ───────────────────────────────────────────
export default function ForgetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const goToStep = (nextStep, data = {}) => {
    setAnimating(true);
    setTimeout(() => {
      if (data.email) setEmail(data.email);
      if (data.otp) setOtp(data.otp);
      setStep(nextStep);
      setAnimating(false);
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0d1a] flex items-center justify-center p-4 sm:p-6 font-poppins">
      {/* Background glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-900/15 blur-[100px]" />
      </div>

      {/* Card */}
      <div
        className={`relative w-full max-w-md transition-all duration-500 ${
          animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Top glow border */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/80 to-transparent z-10" />

        <div
          className="relative rounded-2xl overflow-hidden border border-white/[0.06] p-7 sm:p-10"
          style={{
            background: "linear-gradient(145deg, #13111f 0%, #0f0d1a 60%, #110f1e 100%)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)",
          }}
        >
          {/* Back to login */}
          {step === 0 && (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mb-6 flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Login
            </button>
          )}

          {step === 0 && (
            <StepEmail
              mounted={mounted}
              onNext={(e) => goToStep(1, { email: e })}
            />
          )}
          {step === 1 && (
            <StepOtp
              email={email}
              mounted={mounted}
              onNext={(o) => goToStep(2, { otp: o })}
              onBack={() => goToStep(0)}
            />
          )}
          {step === 2 && (
            <StepNewPassword
              email={email}
              otp={otp}
              mounted={mounted}
            />
          )}
        </div>

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px #13111f inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}