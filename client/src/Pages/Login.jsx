import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ForgetPassword from "../Components/ForgetPassword";
import { useAuth } from "../Components/AuthContext";
import { MoveRight } from "lucide-react";
import { showSuccessToast } from "../Components/CustomToast";
import { decodeToken } from "../utils/tokenUtils";
import { getRouteForRole } from "../utils/roleRoutes";
import blurImg1 from "../assets/blur-img1.svg";
import Logo from "../assets/logo.svg";
import LoginBackground from "../assets/login_Background.svg";

const API_BASE = "https://sece-events.onrender.com";

async function loginApi(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
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

      // ── DEBUG: remove after confirming role field name ──────────────
      console.log("RAW API DATA:", JSON.stringify(data));
      const decodedDebug = decodeToken(data.token);
      console.log("DECODED TOKEN:", JSON.stringify(decodedDebug));
      // ────────────────────────────────────────────────────────────────

      if (!data.token) throw new Error("No token received from server");

      // Save token first
      localStorage.setItem("token", data.token);

      // Decode to get role — token is the source of truth
      const decoded = decodeToken(data.token);

      // ⚠️ Check console to confirm the exact field name your backend uses
      // It might be: decoded.role / decoded.department / decoded.userType / data.role
      const role =
        decoded?.role ||
        decoded?.department ||
        decoded?.userType ||
        data.role ||
        data.department;

      console.log("👤 Final role resolved:", role);

      if (!role) {
        throw new Error("Role not found in token. Check console for DECODED TOKEN fields.");
      }

      const userData = {
        _id:   data._id   || decoded?._id   || decoded?.id,
        name:  data.name  || decoded?.name,
        email: data.email || decoded?.email,
        role,
      };

      // Save to localStorage BEFORE calling login()
      localStorage.setItem("user", JSON.stringify(userData));

      // ── KEY FIX: navigate FIRST, then update context ──────────────
      // This prevents PublicRoute from seeing user=null and bouncing back
      const destination = getRouteForRole(role);
      console.log(`🚀 Navigating to: ${destination} (role: ${role})`);

      showSuccessToast("Login Successful");
      navigate(destination, { replace: true });

      // Update context after navigation is already queued
      login(userData);

    } catch (err) {
      console.error("❌ LOGIN ERROR:", err.message);
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

  return (
    <div className="min-h-screen w-full bg-[#0f0d1a] flex items-center justify-center py-0 px-2 sm:py-1 sm:px-3 font-poppins">
      <div className="absolute top-0 right-0 left-0 bottom-0 tint z-10 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <img className="absolute pointer-events-none" src={LoginBackground} alt="Login Background" />
      </div>

      <div className="relative w-full max-w-[1380px] rounded-lg overflow-hidden h-screen">
        <div className="relative flex flex-col justify-between lg:min-h-0">
          <div className="flex items-stretch h-screen gap-0 overflow-hidden">

            {/* ── LEFT PANEL ── */}
            <div className="relative w-1/2 overflow-hidden h-screen bg-gradient-to-br flex flex-col justify-between py-5 px-4 sm:py-5 sm:px-5 lg:py-6 lg:px-6">
              <ParticleCanvas />
              <div className="relative z-10">
                <div className="mb-6">
                  <img src={Logo} alt="Logo" className="w-50" />
                </div>
                <div className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  <h1 className="playfair text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                    Plan faster host,
                    <br />
                    <span className="playfair bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                      better
                    </span>
                  </h1>
                  <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                    The all-in-one platform for academic event management,
                    combining institutional rigor with modern technological agility.
                  </p>
                </div>
              </div>
              <div className={`relative z-10 grid grid-cols-2 gap-3 mt-8 lg:mt-0 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                {FEATURES.map((f, i) => (
                  <div key={i} className="rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm p-3 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-2 group-hover:bg-purple-600/50 transition-colors">
                      {f.icon}
                    </div>
                    <p className="text-white text-xs font-semibold mb-0.5" style={{ fontFamily: "'Sora', sans-serif" }}>
                      {f.title}
                    </p>
                    <p className="text-white/40 text-[10px] leading-tight">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="form-container h-screen flex items-center justify-center w-1/2">
              <div className="glassmorphism-container h-[90%] relative border border-gray-700/60 shadow-md shadow-gray-900 rounded-2xl w-full overflow-hidden">
                <div className="absolute pointer-events-none" style={{ top: "-80px", left: "-80px", width: "340px", height: "340px", borderRadius: "50%", background: "radial-gradient(circle, rgba(88,28,220,0.55) 0%, rgba(67,20,180,0.25) 45%, transparent 70%)", filter: "blur(40px)" }} />
                <div className="absolute pointer-events-none" style={{ bottom: "-80px", right: "-80px", width: "340px", height: "340px", borderRadius: "50%", background: "radial-gradient(circle, rgba(88,28,220,0.55) 0%, rgba(67,20,180,0.25) 45%, transparent 70%)", filter: "blur(40px)" }} />
                <div className="absolute pointer-events-none" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "500px", height: "300px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(72,20,160,0.18) 0%, transparent 70%)", filter: "blur(30px)" }} />

                <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full px-8">
                  {mode === "login" ? (
                    <>
                      <div className="mb-10">
                        <h2 className="playfair text-2xl sm:text-3xl font-extrabold text-white mb-2">
                          Welcome Back!
                        </h2>
                        <p className="text-white/40 text-xs leading-relaxed">
                          The all-in-one platform for academic event management,
                          combining institutional rigor with modern technological agility.
                        </p>
                      </div>

                      {error && (
                        <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3">
                          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <p className="text-red-400 text-xs">{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleLogin} noValidate className="flex flex-col gap-0">
                        <div className="flex flex-col gap-2 mb-1">
                          <label className="text-white text-xs font-medium">
                            E-mail <span className="text-purple-400">*</span>
                          </label>
                          <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => handleFieldChange("email", e.target.value)}
                            placeholder="Enter Your E-mail id here"
                            className={`w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 bg-[#0d0b1e]/60 border ${fieldErrors.email ? "border-red-500/60 focus:border-red-500" : "border-[#3a2a6e]/70 focus:border-[#6d3fc7]/80 hover:border-[#5530a8]/70"}`}
                          />
                          {fieldErrors.email && <p className="text-red-400 text-xs ml-1">{fieldErrors.email}</p>}
                        </div>

                        <div className="h-4" />

                        <div className="flex flex-col gap-2 mb-1">
                          <label className="text-white text-xs font-medium">
                            Password <span className="text-purple-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPass ? "text" : "password"}
                              value={password}
                              onChange={(e) => handleFieldChange("password", e.target.value)}
                              placeholder="Enter Your Password here"
                              className={`w-full rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 bg-[#0d0b1e]/60 border ${fieldErrors.password ? "border-red-500/60 focus:border-red-500" : "border-[#3a2a6e]/70 focus:border-[#6d3fc7]/80 hover:border-[#5530a8]/70"}`}
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors">
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
                          {fieldErrors.password && <p className="text-red-400 text-xs ml-1">{fieldErrors.password}</p>}
                        </div>

                        <div className="flex justify-end mt-3 mb-8">
                          <button type="button" onClick={() => setMode("forgot")} className="text-purple-400 text-xs hover:text-purple-300 hover:underline transition-colors">
                            Forgot Password?
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-[#4F2593] to-[#853FF9] hover:from-[#5a2ba8] hover:to-[#9550ff] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              Signing in...
                            </>
                          ) : (
                            <>
                              Login to your Account
                              <MoveRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </>
                  ) : (
                    <ForgetPassword onBack={() => setMode("login")} embedded />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px #0d0b1e inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}