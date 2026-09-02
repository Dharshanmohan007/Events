import React from "react";
import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import smallLogo from "../../../assets/small-logo.svg";

const TicketingNavbar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/ticketing-dashboard" },
    {
      label: "Request List",
      href: "/dashboard-ticketing-request-list",
    },
    {
      label: "Reports",
      href: "/dashboard-ticketing/reports",
    },
    { label: "Calendar", href: "/calendar" },
  ];

  return (
    <nav className="w-full border-y border-[#1e293b] bg-[#0d121f] px-4">
      <div className="flex h-[55px] items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex h-10 w-10 items-center justify-center">
            <img src={smallLogo} alt="Small Logo" className="h-10 w-10" />
          </div>

          {/* Navigation Links */}
          <div className="flex h-full items-center gap-5">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.href);

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative flex h-full items-center text-[15px] font-medium transition-colors ${
                    isActive
                      ? "text-[#a78bfa]"
                      : "text-[#a1a1aa] hover:text-white"
                  }`}
                >
                  {item.label}

                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#8b5cf6]" />
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <button className="flex items-center gap-2 rounded-md bg-gradient-to-r from-[#7c3aed] to-[#4f2b93] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90">
          <LogOut size={16} strokeWidth={2} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default TicketingNavbar;
