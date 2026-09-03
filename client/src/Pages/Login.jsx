import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ForgetPassword from "../Components/ForgetPassword";
import { useAuth } from "../Components/AuthContext";
import { MoveRight } from "lucide-react";
import { showSuccessToast } from "../Components/CustomToast";
import { decodeToken } from "../utils/tokenUtils";
import { getRouteForRole } from "../utils/roleRoutes";
import blurImg1 from "../assets/blur-img1.svg";
import Logo from "../assets/logo-black.svg";
import LoginBackground from "../assets/login_Background.svg";


async function loginApi(email, password) {
  // console.log("BASE URL:", import.meta.env.VITE_API_BASE_URL);
  // console.log(
  //   "LOGIN URL:",
  //   `${import.meta.env.VITE_API_BASE_URL}/api/auth/login/v1`
  // );
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login/v1`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  // console.log("RAW RESPONSE:", text);

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
    // console.log("data", data);
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Smart Scheduling",
    desc: "AI-driven conflict resolution for complex campus calendars.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Automated Ticketing",
    desc: "Integrated registration flows with departmental budget syncing.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Live Analytics",
    desc: "Real-time engagement metrics and attendance tracking dashboards.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Attendee Engagement",
    desc: "Interactive tools to keep your academic community connected.",
  },
];

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.4,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${p.opacity})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("login");
  const [otp, setOtp] = useState("");

  const { login } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "E-mail is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid e-mail address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await loginApi(email, password);

      // console.log("LOGIN RESPONSE:", data);

      if (data.otpRequired) {
        showSuccessToast(data.message || "OTP sent successfully");
        setStep("otp");
      } else {
        throw new Error("OTP was not generated");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, val) => {
    if (field === "email") setEmail(val);
    else setPassword(val);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const c = { ...prev };
        delete c[field];
        return c;
      });
    }
    if (error) setError("");
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");

    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    if (otp.length !== 6) {
      setError("Enter a valid OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-login-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const text = await res.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Invalid server response");
      }

      // console.log("VERIFY OTP RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      if (!data.token) {
        throw new Error("Token not received");
      }

      localStorage.setItem("token", data.token);

      const decoded = decodeToken(data.token);

      const role = decoded?.role || data.role;
      const department = decoded?.department || data.department;

      const userData = {
        _id: data._id || decoded?.id,
        name: data.name || decoded?.name,
        email: data.email || decoded?.email,
        role,
        department,
        isadmin: decoded?.isadmin ?? data.isadmin ?? false,
        hasAccess: decoded?.hasAccess ?? data.hasAccess ?? true,
        facultyId: decoded?.facultyId ?? data.facultyId,
        isFirstTimeLogin:
          decoded?.isFirstTimeLogin ?? data.isFirstTimeLogin ?? false,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      login(userData);

      showSuccessToast("Login Successful");

      navigate(getRouteForRole(role, department), {
        replace: true,
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // console.log("login")

  return (
    <div className="min-h-screen w-full flex bg-[#F3F3F3] font-sans">
      
      {/* ── LEFT PANEL (Form) ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-10 relative">
        <div className="w-full mx-auto border border-gray-200 shadow-md rounded-4xl bg-white/80 p-10">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <img src={Logo} alt="Logo" className="h-15" />
            {/* <span className="text-2xl font-bold text-[#1E293B]">Evomira</span> */}
          </div>

          {/* Heading */}
          <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Evomira👋
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              Kindly fill in your details below to {step === "login" ? "Login" : "verify your OTP"}
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-red-100 border border-red-200 px-4 py-3">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {mode === "login" ? (
            step === "login" ? (
              <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="Enter your E-mail"
                    className={`w-full rounded-sm px-4 py-3.5 text-sm text-gray-900 bg-slate-50 border outline-none transition-all duration-200 shadow-sm ${fieldErrors.email ? "border-red-300 focus:border-red-500" : "border-gray-100 focus:border-[#7C5CFF]"}`}
                  />
                  {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-sm font-medium">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => handleFieldChange("password", e.target.value)}
                      placeholder="Enter Your Password"
                      className={`w-full rounded-sm px-4 py-3.5 pr-12 text-sm text-gray-900 bg-slate-50 border outline-none transition-all duration-200 shadow-sm ${fieldErrors.password ? "border-red-300 focus:border-red-500" : "border-gray-100 focus:border-[#7C5CFF]"}`}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPass ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.584 10.587a2.25 2.25 0 003.182 3.182" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.878 5.098A10.477 10.477 0 0112 4.875c6 0 9.75 7.125 9.75 7.125a13.16 13.16 0 01-4.293 4.774" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.228 6.228A13.134 13.134 0 002.25 12s3.75 7.125 9.75 7.125a10.47 10.47 0 005.022-1.277" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                </div>

                <div className="flex justify-end">
                  {/* Hidden for exact visual match, but keep for functional mapping if needed later. */}
                  <button type="button" onClick={() => setMode("forgot")} className="text-red text-sm font-semibold text-[#7C5CFF] hover:underline transition-colors">
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 rounded-xl text-white font-medium text-sm bg-[#7C5CFF] hover:bg-[#684be3] disabled:opacity-70 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? "Loging..." : "Login"}
                </button>
                
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-sm font-medium">OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 bg-white border border-gray-100 outline-none transition-all duration-200 shadow-sm focus:border-[#7C5CFF]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 rounded-xl text-white font-medium text-sm bg-[#7C5CFF] hover:bg-[#684be3] disabled:opacity-70 transition-all duration-200"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("login");
                    setOtp("");
                    setError("");
                  }}
                  className="mt-2 text-sm text-[#7C5CFF] hover:underline"
                >
                  Back to Login
                </button>
              </form>
            )
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <ForgetPassword onBack={() => setMode("login")} embedded />
            </div>
          )}
        </div>
        <div className="absolute bottom-6 left-0 w-full flex justify-center items-center">
            <p className="text-gray-500 text-sm">@2026 Copyright : QuantumPulse Technologies Pvt Ltd, All Right Reserved</p>
          </div>
      </div>

      {/* ── RIGHT PANEL (Info) ── */}
      <div className="hidden lg:flex w-1/2 p-3">
        <div className="w-full h-full bg-[#121021] rounded-[2rem] relative overflow-hidden flex flex-col pt-16 px-12 xl:px-16 pb-12">
          {/* Background image & overlay */}
          <div className="absolute inset-0 z-0">
            <img src={LoginBackground} alt="Background" className="w-full h-full object-cover  mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#121021]/60 via-transparent to-[#121021]/90"></div>
          </div>

          {/* Heading content */}
          <div className="relative z-10 mb-auto">
            <h1 className="text-4xl xl:text-5xl font-normal text-white leading-tight mb-4 font-serif">
              Plan faster, host<br />better
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-md leading-relaxed opacity-80">
              The all-in-one platform for academic event management, combining institutional rigor with modern technological agility.
            </p>
          </div>

          {/* Features Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-4 mt-12">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
                <div className="w-10 h-10 rounded-xl bg-[#7C5CFF] flex items-center justify-center text-white mb-3 shadow-lg shadow-[#7C5CFF]/20">
                  {f.icon}
                </div>
                <h3 className="text-white font-medium text-sm mb-1">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
      </div>
      
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px white inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}