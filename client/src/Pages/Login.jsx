import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ForgetPassword from "../Components/ForgetPassword";
import { useAuth } from "../Components/AuthContext";
import { MoveRight } from "lucide-react";
import {
  showSuccessToast,
  showErrorToast,
} from "../Components/CustomToast";

// ─── Assets (update paths as needed) ─────────────────────────────────────────
import Logo from "../assets/logo.svg";
import LoginBackground from "../assets/login_Background.svg";
import LoginContainerBg from "../assets/login_ConBg.svg";

// ─── API Config ───────────────────────────────────────────────────────────────
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

// ─── Feature Cards data ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Smart Scheduling",
    desc: "AI-driven conflict resolution for complex campus calendars.",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
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
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Live Analytics",
    desc: "Real-time engagement metrics and attendance tracking dashboards.",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
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

// ─── Particle background ──────────────────────────────────────────────────────
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
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "forgot"

  const { login } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
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

    console.log("🔥 LOGIN BUTTON CLICKED");

    setError("");
    if (!validate()) {
      console.log("❌ Validation failed");
      return;
    }

    console.log("✅ Validation passed");

    setLoading(true);

    try {
      console.log("📡 Calling API...");

      const data = await loginApi(email, password);

      console.log("✅ API RESPONSE:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("💾 Token stored");
      }

      // ✅ FIX: your API returns user fields directly, not inside "user"
      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      login(userData);
      showSuccessToast(
        "Login Successful"
      );
      console.log("👤 User set in context:", userData);
      navigate("/forms");
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
    <div className="min-h-screen w-full bg-[#0f0d1a] flex items-center justify-center p-3 sm:p-4  font-poppins">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 left-0 bottom-0 tint z-10"></div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Background image */}
        <img
          className="absolute pointer-events-none"
          src={LoginBackground}
          alt="Login Background"
        />
        {/* Fallback gradient background */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/15 blur-[120px]" />
      </div>

      {/* Main card */}
      <div className="relative w-full rounded-2xl overflow-hidden">
        <div className="relative flex flex-col justify-between lg:min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* ── LEFT PANEL: Branding + Features ── */}
            <div className="relative overflow-hidden bg-gradient-to-br flex flex-col justify-between p-6 sm:p-8 lg:p-10 min-h-[340px] lg:min-h-[560px]">
              <ParticleCanvas />
              <div className="relative z-10">
                <div className="mb-6">
                  <img src={Logo} alt="Logo" className="w-50" />
                </div>

                {/* Headline */}
                <div
                  className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Plan faster,
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                      host better
                    </span>
                  </h1>
                  <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                    The all-in-one platform for academic event management,
                    combining institutional rigor with modern technological
                    agility.
                  </p>
                </div>
              </div>

              {/* Feature cards grid */}
              <div
                className={`relative z-10 grid grid-cols-2 gap-3 mt-8 lg:mt-0 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                {FEATURES.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm p-3 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-2 group-hover:bg-purple-600/50 transition-colors">
                      {f.icon}
                    </div>
                    <p
                      className="text-white text-xs font-semibold mb-0.5"
                      style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                      {f.title}
                    </p>
                    <p className="text-white/40 text-[10px] leading-tight">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL: Login form OR Forgot Password ── */}
            <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-10 overflow-hidden">
              {/* Top border glow */}
              <div className="absolute z-20 top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/90 to-transparent" />

              {/* Background image overlay */}
              <img
                src={LoginContainerBg}
                alt=""
                className="absolute z-30 inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(145deg, #13111f 0%, #0f0d1a 60%, #110f1e 100%)",
                }}
              />

              <div
                className={`relative z-10 w-full max-w-sm mx-auto transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                {mode === "login" ? (
                  <>
                    {/* Heading */}
                    <div className="mb-7">
                      <h2
                        className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        Welcome Back!
                      </h2>
                      <p className="text-white/40 text-xs leading-relaxed">
                        The all-in-one platform for academic event management,
                        combining institutional rigor with modern technological
                        agility.
                      </p>
                    </div>

                    {/* Global error banner */}
                    {error && (
                      <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3">
                        <svg
                          className="w-4 h-4 text-red-400 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p className="text-red-400 text-xs">{error}</p>
                      </div>
                    )}

                    {/* Login Form */}
                    <form
                      onSubmit={handleLogin}
                      noValidate
                      className="flex flex-col gap-5"
                    >
                      {/* E-mail field */}
                      <div>
                        <div className="relative group ">
                          <span
                            className="absolute left-3.5 -top-[9px] text-xs text-white/70 px-1 z-10 pointer-events-none"
                            style={{ backgroundColor: "#13111f" }}
                          >
                            E-mail <span className="text-purple-400">*</span>
                          </span>
                          <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) =>
                              handleFieldChange("email", e.target.value)
                            }
                            placeholder="Enter Your E-mail id here"
                            className={`w-full bg-[#853FF926] rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none border ${
                              fieldErrors.email
                                ? "border-red-400/70"
                                : "border-[#3A3A5A]"
                            }`}
                          />
                        </div>
                        {fieldErrors.email && (
                          <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      {/* Password field */}
                      <div>
                        <div className="relative group">
                          <span
                            className="absolute left-3.5 -top-[9px] text-xs text-white/70 px-1 z-10 pointer-events-none"
                            style={{ backgroundColor: "#13111f" }}
                          >
                            Password <span className="text-purple-400">*</span>
                          </span>
                          <input
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={(e) =>
                              handleFieldChange("password", e.target.value)
                            }
                            placeholder="Enter Your Password here"
                            className={`w-full bg-[#853FF926] rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none border ${
                              fieldErrors.password
                                ? "border-red-400/70"
                                : "border-[#3A3A5A]"
                            }`}
                          />
                        </div>
                        {fieldErrors.password && (
                          <p className="text-red-400 text-xs mt-1.5 ml-1">
                            {fieldErrors.password}
                          </p>
                        )}
                      </div>

                      {/* Forgot Password — now uses setMode("forgot") instead of navigate */}
                      <div className="flex justify-end -mt-2">
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-purple-400 text-xs hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl text-white bg-gradient-to-l from-[#4F2593] to-[#853FF9]"
                      >
                        {loading ? "Signing in..." : "Login to your Account"}
                      </button>
                    </form>
                  </>
                ) : (
                  /* ── Forgot Password inline inside same right panel ── */
                  <ForgetPassword onBack={() => setMode("login")} embedded />
                )}
              </div>

              {/* Bottom glow line */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
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
          -webkit-box-shadow: 0 0 0px 1000px #13111f inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
