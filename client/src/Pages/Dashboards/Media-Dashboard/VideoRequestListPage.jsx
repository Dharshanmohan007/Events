import React from "react";
import { Link } from "react-router-dom";
import smallLogo from "../../../assets/small-logo.svg";
import LogoutButton from "../../../Components/LogoutButton";
import ModuleRequestListPage from "../../../Components/ModuleRequestListPage";

const VideoHeader = () => (
  <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-6 py-3">
    <div className="flex items-center gap-6">
      <img src={smallLogo} alt="Logo" className="h-11 w-11" />
      <nav className="flex items-center gap-8 text-sm">
        <Link to="/dashboard-video" className="pb-2 text-[#FFFFFF80] hover:text-white">
          Dashboard
        </Link>
        <Link
          to="/dashboard-video/requests"
          className="border-b border-[#8B3DFF] pb-2 font-semibold text-[#8B3DFF]"
        >
          Request List
        </Link>
        <Link to="/calendar" className="pb-2 text-[#FFFFFF80] hover:text-white">
          Calendar
        </Link>
      </nav>
    </div>

    <div className="flex items-center gap-6">
      <LogoutButton />
    </div>
  </header>
);

const VideoRequestListPage = () => (
  <section className="min-h-screen bg-[#0b1326] pt-16.25 poppins">
    <VideoHeader />
    <ModuleRequestListPage
      module="video"
      title="Video Request List"
      description="View and manage video event requests and individual video submissions."
      detailViewPath="/dashboard-video/detailView"
      individualDetailViewPath="/dashboard-video/individualDetailView"
      showIndividualTab={true}
      individualEndpoint="/api/individual-submissions/video"
    />
  </section>
);

export default VideoRequestListPage;
