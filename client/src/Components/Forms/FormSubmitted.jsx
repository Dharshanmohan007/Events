import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRouteForRole } from "../../utils/roleRoutes";

export default function FormSubmitted({ onSubmitAnother }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmitAnother = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const destination = getRouteForRole(user.role, user.department);
    navigate(destination);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-[#16162A]">

      {/* Subtle radial glow — dark mode only */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[600px] h-[600px] rounded-full pointer-events-none hidden dark:block"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className={`
          relative flex flex-col items-center gap-6 px-12 py-16 rounded-[20px]
          w-full max-w-[480px]
          bg-white dark:bg-[#1E1E35]
          border border-slate-200 dark:border-[#2A2A45]
          shadow-xl dark:shadow-none
          transition-[opacity,transform] duration-500 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >

        {/* Check icon */}
        <div
          className="flex items-center justify-center w-20 h-20 rounded-full bg-violet-600 shadow-lg shadow-violet-500/30"
          style={{
            transition:
              "opacity 0.5s ease 0.15s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Heading + subtext */}
        <div className="text-center">
          <h1
            className={`
              text-slate-900 dark:text-white text-[28px] font-extrabold mb-3 tracking-tight
              transition-[opacity,transform] duration-500 ease-out delay-[250ms]
              ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
            `}
          >
            Form Submitted!
          </h1>
          <p
            className={`
              text-slate-500 dark:text-white/50 text-sm leading-relaxed max-w-[340px] mx-auto
              transition-[opacity,transform] duration-500 ease-out delay-[350ms]
              ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
            `}
          >
            Your Event Requisition has been submitted successfully. The
            administration will review and get back to you shortly.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handleSubmitAnother}
          className={`
            mt-2 px-8 py-3 rounded-[10px] border-0 cursor-pointer
            bg-violet-600 hover:bg-violet-700
            text-white text-[15px] font-semibold tracking-wide
            transition-colors duration-200
            transition-[opacity,transform] duration-500 ease-out delay-[450ms]
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
        >
          Go to Dashboard
        </button>

      </div>
    </div>
  );
}