import React from "react";
import TicketingNavbar from "./TicketingNavbar";
import {
  ChevronRight,
  UserRound,
  Phone,
  BriefcaseBusiness,
  Building2,
  MapPin,
  VenusAndMars,
  ClipboardList,
} from "lucide-react";
import EventHeaderData from "../EventHeaderData";

const TicketingEventDetailView = () => {
  return (
    <>
      <main className="bg-[#0b1326] ">
        <TicketingNavbar />
        <div className="header px-4 mt-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1>Event Details</h1>
            <ChevronRight />
            <h1 className="text-[#d0bcff]">Static Event Name</h1>
            <h1>--</h1>
            <button className="text-amber-300 bg-amber-200/20 text-xs py-2 px-2 rounded-full">
              static Department
            </button>
            <h1>--</h1>
            <button className="text-green-300 bg-green-200/20 text-xs py-2 px-2 rounded-full">
              static -- Acknowledged
            </button>
          </div>
          <button className="bg-linear-to-r from-emerald-800 to-emerald-900 text-white px-3 py-1 rounded-lg">
            Acknowledge
          </button>
        </div>

        {/* main content  */}

        <div className="main-content border border-[#202739] rounded-lg bg-[#182032] mx-5 p-4 mt-4">
          <h1 className="mb-4 font-medium text-violet-700">
            Transportation Details
          </h1>
          <EventHeaderData />

          {/* organizer details  */}
          <div class="flex w-full mt-2 items-center rounded-lg border border-[#374151] bg-[#2d37489d] px-5 py-3">
            <div class="flex flex-1 items-center gap-4 border-r border-[#4b5563] pr-6">
              <i data-lucide="user" class="h-5 w-5 text-[#c4b5fd]"></i>

              <div>
                <p class="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                  Organizer Name
                </p>

                <p class="mt-1 text-[15px] font-semibold text-white">
                  Dr ARUN J
                </p>
              </div>
            </div>

            <div class="flex flex-1 items-center gap-4 border-r border-[#4b5563] px-6">
              <i data-lucide="mail" class="h-5 w-5 text-[#c4b5fd]"></i>

              <div>
                <p class="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                  Organizer Email
                </p>

                <p class="mt-1 text-[15px] font-semibold text-white">
                  arun.j@sece.ac.in
                </p>
              </div>
            </div>

            <div class="flex flex-1 items-center gap-4 border-r border-[#4b5563] px-6">
              <i data-lucide="phone" class="h-5 w-5 text-[#c4b5fd]"></i>

              <div>
                <p class="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                  Organizer Phone Number
                </p>

                <p class="mt-1 text-[15px] font-semibold text-white">
                  8428797979
                </p>
              </div>
            </div>

            {/* Organizer Department  */}
            <div class="flex flex-1 items-center gap-4 pl-6">
              <i data-lucide="network" class="h-5 w-5 text-[#c4b5fd]"></i>

              <div>
                <p class="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                  Organizer Department
                </p>

                <p class="mt-1 text-[15px] font-semibold text-white">
                  PLACEMENT
                </p>
              </div>
            </div>
          </div>

          {/* Guest details  */}
          <div className="guest-detail-container mt-4 border border-gray-700 rounded-lg p-2">
            <h1 className="text-[#6508e7] mb-2 font-medium ">Guest Details</h1>
            <div className="w-full ">
              <div className="flex min-h-[100px] items-center rounded-xl bg-[#2d37489d] px-5">
                {/* Guest Name */}
                <div className="flex flex-1 items-center gap-4 px-4 border-r border-[#536078]">
                  <UserRound
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />

                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                      GUEST NAME
                    </p>

                    <p className="text-[15px] font-bold text-[#f4ede8]">
                      priyanka
                    </p>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex flex-1 items-center gap-4 px-4 border-r border-[#536078]">
                  <Phone
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />

                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                      MOBILE NUMBER
                    </p>

                    <p className="text-[15px] font-bold text-[#f4ede8]">
                      977903441715
                    </p>
                  </div>
                </div>

                {/* Designation */}
                <div className="flex flex-1 items-center gap-4 px-4 border-r border-[#536078]">
                  <BriefcaseBusiness
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />

                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                      DESIGNATION
                    </p>

                    <p className="text-[15px] font-bold text-[#f4ede8]">
                      Student
                    </p>
                  </div>
                </div>

                {/* Organization */}
                <div className="flex flex-1 items-center gap-4 px-4 border-r border-[#536078]">
                  <Building2
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />

                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                      ORGANIZATION
                    </p>

                    <p className="text-[15px] font-bold leading-5 text-[#f4ede8]">
                      SECE (International
                      <br />
                      Students)
                    </p>
                  </div>
                </div>

                {/* Gender */}
                <div className="flex flex-1 items-center gap-4 px-4">
                  <VenusAndMars
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />

                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                      GENDER
                    </p>

                    <p className="text-[15px] font-bold text-[#f4ede8]">
                      Female
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup  ---  drop  */}
          <div className="w-full border border-gray-700 rounded-lg mt-3 px-3 py-3">
            <div className="flex items-center">
              {/* Pickup Location */}
              <div className="flex w-[290px] items-center gap-3 rounded-lg bg-[#344057] px-4 py-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <MapPin size={14} className="text-white" />
                </div>

                <div>
                  <p className="text-sm font-medium uppercase text-[#aab3c5]">
                    Pickup Location
                  </p>
                  <p className="text-sm font-semibold text-white">Sece</p>
                </div>
              </div>

              {/* Route Line */}
              <div className="h-0 flex-1 border-t border-dashed border-[#536078]" />

              {/* Intermediate Location - Render only when available */}

              <div className="flex w-[220px] items-center gap-3 rounded-lg bg-[#344057] px-4 py-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <MapPin size={14} className="text-white" />
                </div>

                <div>
                  <p className="text-sm font-medium uppercase text-[#aab3c5]">
                    Stop 1
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Chennai Airport
                  </p>
                </div>
              </div>

              <div className="h-0 flex-1 border-t border-dashed border-[#536078]" />

              {/* Drop Location */}
              <div className="flex w-[290px] items-center gap-3 rounded-lg bg-[#344057] px-4 py-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <MapPin size={14} className="text-white" />
                </div>

                <div>
                  <p className="text-sm font-medium uppercase text-[#aab3c5]">
                    Drop Location
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Brook fields (CBE)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* count section  */}

          <div className="w-full rounded-lg  border border-gray-700 mt-3 p-2">
            {/* First Row */}
            <div className="grid grid-cols-2 rounded-md border border-[#3d4a61] bg-[#2d37489d]">
              {/* Total Number of Members */}
              <div className="flex items-center justify-between border-r border-[#46536a] px-3 py-3">
                <span className="text-[15px] font-medium text-[#c3c9d5]">
                  Total Number of Members
                </span>

                <span className="text-[15px] font-bold text-[#f1eee9]">3</span>
              </div>

              {/* Types of Vehicle Needed */}
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[15px] font-medium text-[#c3c9d5]">
                  Types of Vehicle needed
                </span>

                <span className="text-[15px] font-bold text-[#f1eee9]">
                  Car
                </span>
              </div>
            </div>

            {/* Second Row */}
            <div className="mt-1 grid grid-cols-2 rounded-md border border-[#3d4a61] bg-[#2d37489d]">
              {/* Total Bus Needed */}
              <div className="flex items-center justify-between border-r border-[#46536a] px-3 py-3">
                <span className="text-[15px] font-medium text-[#c3c9d5]">
                  Total bus needed
                </span>

                <span className="text-[15px] font-bold text-[#f1eee9]">0</span>
              </div>

              {/* Total Car Needed */}
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[15px] font-medium text-[#c3c9d5]">
                  Total car needed
                </span>

                <span className="text-[15px] font-bold text-[#f1eee9]">1</span>
              </div>
            </div>
          </div>

          {/* special requirements  */}
          <div className="w-full rounded-lg border border-[#46536a] mt-3 px-4 py-3">
            {/* Heading */}
            <div className="flex items-center gap-2">
              <ClipboardList
                size={15}
                strokeWidth={1.8}
                className="text-[#c3c9d5]"
              />

              <h3 className="text-[15px] font-semibold text-[#f1eee9]">
                Special Requirement
              </h3>
            </div>

            {/* Requirement Content */}
            <p className="mt-3 text-[15px] font-medium leading-relaxed text-[#c3c9d5]">
              Three Nepal girls student || Issue in time format the pickup time
              is 6-sep-2026 morning 9.30 AM drop time 6-sep-2026 3.30 PM
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default TicketingEventDetailView;
