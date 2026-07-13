import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";
import { MoveRight } from 'lucide-react';

import Logo from "../assets/logo.svg";
import LoginBackground from "../assets/login_Background.svg";


async function signupApi(name, email, password) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");
  return data;
}

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
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("🔥 SIGNUP BUTTON CLICKED");

    setError("");
    if (!validate()) {
      console.log("❌ Validation failed");
      return;
    }

    console.log("✅ Validation passed");
    setLoading(true);

    try {
      console.log("📡 Calling Signup API...");
      const data = await signupApi(name, email, password);
      console.log("✅ SIGNUP RESPONSE:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("💾 Token stored");
      }

      const userData = {
        _id: data._id || data.id,
        name: data.name,
        email: data.email,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      login(userData);
      console.log("👤 User set in context:", userData);
      navigate("/forms");
    } catch (err) {
      console.error("❌ SIGNUP ERROR:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, val) => {
    if (field === "name") setName(val);
    else if (field === "email") setEmail(val);
    else if (field === "password") setPassword(val);
    else if (field === "confirmPassword") setConfirmPassword(val);
    
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
    <div className="min-h-screen w-full bg-[#0f0d1a] flex items-center justify-center p-3 sm:p-4 font-poppins">
      <div className="absolute top-0 right-0 left-0 bottom-0 tint z-10"></div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <img className="absolute pointer-events-none" src={LoginBackground} alt="Background" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl overflow-hidden bg-[#1a1625] border border-purple-900/30 p-6 sm:p-8 z-20">
        <div className="mb-6">
          <img src={Logo} alt="Logo" className="w-40" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-white/50 text-sm mb-6">Join our academic events platform</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className={`w-full px-4 py-2 bg-purple-900/20 border rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 ${
                fieldErrors.name ? "border-red-500" : "border-purple-900/50"
              }`}
              placeholder="John Doe"
            />
            {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className={`w-full px-4 py-2 bg-purple-900/20 border rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 ${
                fieldErrors.email ? "border-red-500" : "border-purple-900/50"
              }`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                className={`w-full px-4 py-2 bg-purple-900/20 border rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 ${
                  fieldErrors.password ? "border-red-500" : "border-purple-900/50"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Confirm Password</label>
            <input
              type={showPass ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
              className={`w-full px-4 py-2 bg-purple-900/20 border rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 ${
                fieldErrors.confirmPassword ? "border-red-500" : "border-purple-900/50"
              }`}
              placeholder="••••••••"
            />
            {fieldErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {loading ? "Creating Account..." : "Create Account"}
            {!loading && <MoveRight size={18} />}
          </button>
        </form>

        <p className="text-center text-white/60 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
