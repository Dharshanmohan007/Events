import React from "react";
import { toast } from "react-toastify";

export const CustomToastContent = ({
  title,
  message,
  type = "success",
}) => {

  const isError = type === "error";

  const gradientBg = isError
    ? "bg-[linear-gradient(90deg,rgba(255,45,85,0.14)_0%,#242c32_25%,#303746_100%)]"
    : "bg-[linear-gradient(90deg,rgba(1,241,123,0.14)_0%,#242c32_25%,#303746_100%)]";

  const radialGlow = isError
    ? "bg-[radial-gradient(circle_at_left_center,rgba(255,45,85,0.18),transparent_70%)]"
    : "bg-[radial-gradient(circle_at_left_center,rgba(0,255,128,0.18),transparent_70%)]";

  const outerCircle = isError
    ? "bg-[rgba(255,45,85,0.10)]"
    : "bg-[rgba(0,255,128,0.10)]";

  const innerCircle = isError
    ? "bg-[#ff2d55] shadow-[0_0_12px_rgba(255,45,85,0.45)]"
    : "bg-[#00df80] shadow-[0_0_12px_rgba(0,255,128,0.45)]";

  const progressBar = isError
    ? `
      !h-[4px]
      bg-[linear-gradient(90deg,#ff4d4d_0%,#ff2d55_100%)]
      shadow-[0_0_12px_rgba(255,45,85,0.45)]
    `
    : `
      !h-[4px]
      bg-[linear-gradient(90deg,#01F17B_0%,#00DF80_100%)]
      shadow-[0_0_10px_rgba(1,241,123,0.5)]
    `;

  return (
    <div className="relative flex items-center w-full overflow-hidden rounded-[12px] px-5 py-3 font-poppins">

      {/* BACKGROUND */}
      <div className={`absolute inset-0 ${gradientBg}`} />

      {/* RADIAL GLOW */}
      <div
        className={`absolute left-0 top-0 h-full w-[140px] ${radialGlow}`}
      />

      {/* CONTENT */}
      <div className="relative z-10 flex items-center w-full">

        {/* OUTER ICON */}
        <div
          className={`mr-4 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${outerCircle} backdrop-blur-xl`}
        >

          {/* INNER ICON */}
          <div
            className={`flex h-[24px] w-[24px] items-center justify-center rounded-full ${innerCircle}`}
          >

            {/* SUCCESS ICON */}
            {!isError ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5L5 9L13 1"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              /* ERROR ICON */
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 7V13"
                  stroke="#ffffff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />

                <circle
                  cx="12"
                  cy="17"
                  r="1.4"
                  fill="#ffffff"
                />
              </svg>
            )}
          </div>
        </div>

        {/* TEXT */}
        <div className="flex flex-col">
          <strong className="text-[16px] font-bold leading-[1.1] tracking-[-0.02em] text-white">
            {title}
          </strong>

          {message && (
            <span className="mt-1 text-[12px] leading-[1.35] text-[#c8c5c5]">
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const showSuccessToast = (title, message) => {
  toast(
    <CustomToastContent
      title={title}
      message={message}
      type="success"
    />,
    {
      className: `
        !p-0
        !m-0
        !rounded-[18px]
        !overflow-hidden
        !bg-transparent
        !shadow-none
        border-none
      `,

      bodyClassName: `
        !p-0
        !m-0
      `,

      progressClassName: `
      !h-[4px]
      !bg-[#00df80]
    `,

      style: {
        width: "420px",
        background: "transparent",

        boxShadow: `
          0 20px 45px rgba(0,0,0,0.65),
          0 0 25px rgba(0,255,128,0.05)
        `,
      },

      closeButton: false,
      autoClose: 3000,
      hideProgressBar: false,
      pauseOnHover: false,
      draggable: false,
      position: "top-right",
    }
  );
};

export const showErrorToast = (title, message) => {
  toast(
    <CustomToastContent
      title={title}
      message={message}
      type="error"
    />,
    {
      className: `
        !p-0
        !m-0
        !rounded-[18px]
        !overflow-hidden
        !bg-transparent
        !shadow-none
        border-none
      `,

      bodyClassName: `
        !p-0
        !m-0
      `,

      progressClassName: `
  !h-[4px]
  !bg-red-500
`,

      style: {
        width: "420px",
        background: "transparent",

        boxShadow: `
          0 20px 45px rgba(0,0,0,0.65),
          0 0 25px rgba(255,45,85,0.08)
        `,
      },

      closeButton: false,
      autoClose: 3000,
      hideProgressBar: false,
      pauseOnHover: false,
      draggable: false,
      position: "top-right",
    }
  );
};