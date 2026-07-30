import React from "react";
import { Bell, CircleQuestionMark, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import smallLogo from "../../../assets/small-logo.svg";
import profileAvatar from "../../../assets/profile-avatar.svg";
import ModuleRequestListPage from "../../../Components/ModuleRequestListPage";

const PosterHeader = () => (
  <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-6 py-3">
    <div className="flex items-center gap-8">
      <img src={smallLogo} alt="Logo" className="h-11 w-11" />
      <nav className="flex items-center gap-8 text-sm font-medium">
        <Link to="/dashboard-poster" className="pb-2 text-[#FFFFFF80] hover:text-white">
          Dashboard
        </Link>
        <Link
          to="/dashboard-poster/requests"
          className="border-b border-[#8B3DFF] pb-2 text-[#8B3DFF]"
        >
          Request List
        </Link>
        <span className="pb-2 text-[#FFFFFF80]">Calendar</span>
        <Link to="/dashboard-poster/reports" className="pb-2 text-[#FFFFFF80] hover:text-white">
          Reports
        </Link>
        <Link to="/dashboard-poster/feedback" className="pb-2 text-[#FFFFFF80] hover:text-white">
          Feedback
        </Link>
      </nav>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex h-9 w-[290px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#161a23] px-3">
        <Search size={15} className="text-[#8b93a4]" />
        <input
          className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]"
          placeholder="Search events, venues, or faculty..."
        />
      </div>
      <div className="flex items-center gap-5 text-[#b7bdc8]">
        <Bell size={16} />
        <CircleQuestionMark size={16} />
        <Settings size={16} />
        <img src={profileAvatar} alt="Profile Avatar" className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </header>
);

const PosterRequestListPage = () => (
  <section className="min-h-screen bg-[#0b1326] pt-16.25 poppins">
    <PosterHeader />
    <ModuleRequestListPage
      module="poster"
      title="Poster Request List"
      description="View and manage poster event requests and individual poster submissions."
      detailViewPath="/dashboard-poster/detailView"
      individualDetailViewPath="/dashboard-poster/individualDetailView"
      showIndividualTab={true}
      individualEndpoint="/api/individual-submissions/poster"
    />
  </section>
);

export default PosterRequestListPage;
