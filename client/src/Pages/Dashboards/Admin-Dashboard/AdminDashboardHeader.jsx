import React, { useState } from "react";
import smallLogo from "../../../assets/small-logo.svg";
import { NavLink } from "react-router-dom";
import LogoutButton from "../../../Components/LogoutButton";
import ChangePasswordModal from "../../../Components/ChangePasswordModal";
import { Lock } from "lucide-react";

const adminRoutes = {
  dashboard: "/dashboard-admin",
  requests: "/dashboard-admin/AdminEventsRequests",
  venues: "/dashboard-admin/VenueManagement",
  rooms: "/dashboard-admin/RoomManagement",
  eventtype: "/dashboard-admin/EventTypeManagement",
  faculty: "/dashboard-admin/FacultyManagement",
  admins: "/dashboard-admin/AdminManagement",
  reports: "/dashboard-admin/reports",
  expenditure: "/dashboard-admin/expenditures",
  // othermanagements: '/dashboard-admin/other-managements',
  calendar: "/calendar",
};

const getNavLinkClassName = ({ isActive }) =>
  `font-medium ${isActive ? "border-b border-[#8B5CF6] text-[#8B5CF6]" : "text-[#FFFFFF80]"}`;

const AdminDashboardHeader = () => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <>
      <section className="dashboard-header bg-[#0a0e18] flex items-center justify-between py-4 px-4 poppins sticky top-0 z-50 ">
        <div className="first-container flex items-center gap-6 ">
          <img src={smallLogo} alt="Small Logo" className="w-10 h-10" />

          <div className="navlins text-white flex items-center gap-4 text-[13px] whitespace-nowrap 2xl:text-sm">
            <NavLink
              to={adminRoutes.dashboard}
              end
              className={getNavLinkClassName}
            >
              Dashboard
            </NavLink>
            <NavLink to={adminRoutes.requests} className={getNavLinkClassName}>
              Requests List
            </NavLink>
            {/* <NavLink to={adminRoutes.reports} className={getNavLinkClassName}>Reports</NavLink> */}
            <NavLink to={adminRoutes.calendar} className={getNavLinkClassName}>
              Calendar
            </NavLink>

            <NavLink to={adminRoutes.venues} className={getNavLinkClassName}>
              Venue Management
            </NavLink>
            <NavLink to={adminRoutes.rooms} className={getNavLinkClassName}>
              Room Management
            </NavLink>
            <NavLink to={adminRoutes.eventtype} className={getNavLinkClassName}>
              Event Type Management
            </NavLink>
            <NavLink to={adminRoutes.faculty} className={getNavLinkClassName}>
              Faculty Management
            </NavLink>

            <NavLink
              to={adminRoutes.expenditure}
              className={getNavLinkClassName}
            >
              Expenditures
            </NavLink>
            <NavLink to={adminRoutes.reports} className={getNavLinkClassName}>
              Reports
            </NavLink>
            {/* <NavLink to={adminRoutes.othermanagements} className={getNavLinkClassName}>Other Managements</NavLink> */}
          </div>
        </div>
        <div className="second-container flex items-center gap-6 ">
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="relative group flex items-center justify-center rounded-full p-2 transition hover:bg-[#1d2638]"
            aria-label="Change password"
          >
            <Lock className="text-white cursor-pointer" />
            <span className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
              Change password
            </span>
          </button>
          <LogoutButton />
        </div>
      </section>
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};

export default AdminDashboardHeader;
