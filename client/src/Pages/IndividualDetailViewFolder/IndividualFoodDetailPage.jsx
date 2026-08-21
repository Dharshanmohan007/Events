import {
  ChevronRight, CalendarDays,
  UserRound,
  Phone,
  FileText,
} from 'lucide-react';
import React from 'react';

const IndividualFoodDetailPage = () => {
  return (
    <main>
      <breadcrumb className="flex items-center gap-2">
        <h1 className="text-gray-500">Food Request List</h1>
        <ChevronRight size={16} className="" />
        <h1 className="text-white font-medium">Event Name</h1>
        <ChevronRight size={16} className="" />
        <button className="bg-green-200/10 px-3 py-2 rounded-full text-xs text-[#34D399]">Department</button>
      </breadcrumb>


      <div className="bg-[#232a3c]/30 mt-4  p-4 rounded-xl border border-gray-700 w-full">
        <h1 className="text-lg text-[#853FF9] font-medium">Food & Refreshment Details</h1>

        {/* ---------------------------- first section --------------------------------------------------------- */}
        <div className="w-full mt-2">
          <div className="space-y-4">
            {/* Date / Resource Type */}
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#30394d] bg-[#20293b]">
              <div className="flex items-center justify-between border-r border-[#4a5365] px-4 py-5">
                <div className="flex items-center gap-2 text-[#c3c4d2]">
                  <CalendarDays
                    size={18}
                    strokeWidth={1.7}
                    className="text-[#c5b0ff]"
                  />
                  <span className="text-sm">Date</span>
                </div>

                <span className="text-sm font-semibold text-white">
                  12/05/2026
                </span>
              </div>

              <div className="flex items-center justify-between px-7 py-5">
                <span className="text-sm text-[#c3c4d2]">
                  Type of resource Person
                </span>

                <span className="text-sm font-semibold text-white">
                  VIP&nbsp; / &nbsp;Trainer&nbsp; / &nbsp;Placement
                </span>
              </div>
            </div>

            {/* Resource Counts */}
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#30394d] bg-[#20293b]">
              <div className="flex items-center justify-between border-r border-[#4a5365] px-4 py-5">
                <span className="text-sm text-[#c3c4d2]">
                  Total number of resource Person
                </span>

                <span className="text-sm font-semibold text-white">
                  5 Members
                </span>
              </div>

              <div className="flex items-center justify-between px-7 py-5">
                <span className="text-sm text-[#c3c4d2]">
                  Total number of Internal Accompanying Person
                </span>

                <span className="text-sm font-semibold text-white">
                  2 Members
                </span>
              </div>
            </div>

            {/* Accompanying Staff */}
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#30394d] bg-[#20293b]">
              {/* Staff Name */}
              <div className="flex items-center gap-4 border-r border-[#4a5365] px-5 py-4">
                <UserRound
                  size={22}
                  strokeWidth={1.8}
                  className="self-start text-[#c5b0ff]"
                />

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#858b9a]">
                    Accompanying Staff Name
                  </p>

                  <p className="text-sm font-semibold text-white">
                    Surya Chandran
                  </p>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="flex items-center gap-4 px-7 py-4">
                <Phone
                  size={22}
                  strokeWidth={1.8}
                  className="self-start text-[#c5b0ff]"
                />

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#858b9a]">
                    Accompanying Mobile Number
                  </p>

                  <p className="text-sm font-semibold text-white">
                    1234567890
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* =========================== breakfast ======================================== */}
        <div className="breakfast-container mt-5">
          <div className="w-full rounded-lg border border-[#30394d] bg-[#232a3c]/30 p-4">
            <h3 className="mb-3 text-lg font-medium text-[#853FF9]">
              Breakfast
            </h3>

            <div className="mb-2 grid h-11 grid-cols-2 overflow-hidden rounded-md border border-[#384155] bg-[#2b3447]">
              <div className="flex items-center justify-between border-r border-[#4a5365] px-3">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of veg In Participants Menu
                </span>
                <span className="text-[14px] font-semibold text-white">
                  01
                </span>
              </div>

              <div className="flex items-center justify-between px-6">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of veg In Guest/VIP Menu
                </span>
                <span className="text-[14px] font-medium text-white">
                  02
                </span>
              </div>
            </div>

            <div className="grid h-11 grid-cols-2 overflow-hidden rounded-md border border-[#384155] bg-[#2b3447]">
              <div className="flex items-center justify-between border-r border-[#4a5365] px-3">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of Non-veg In Participants Menu
                </span>
                <span className="text-[14px] font-medium text-white">
                  01
                </span>
              </div>

              <div className="flex items-center justify-between px-6">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of Non-veg In Guest/VIP Menu
                </span>
                <span className="text-[14px] font-medium text-white">
                  02
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* Lunch section */}
        <div className="lunch-container mt-5">
          <div className="w-full rounded-lg border border-[#30394d] bg-[#232a3c]/30 p-4">
            <h3 className="mb-3 text-lg font-medium text-[#853FF9]">
              Lunch
            </h3>

            <div className="mb-2 grid h-11 grid-cols-2 overflow-hidden rounded-md border border-[#384155] bg-[#2b3447]">
              <div className="flex items-center justify-between border-r border-[#4a5365] px-3">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of veg In Participants Menu
                </span>
                <span className="text-[14px] font-semibold text-white">
                  01
                </span>
              </div>

              <div className="flex items-center justify-between px-6">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of veg In Guest/VIP Menu
                </span>
                <span className="text-[14px] font-medium text-white">
                  02
                </span>
              </div>
            </div>

            <div className="grid h-11 grid-cols-2 overflow-hidden rounded-md border border-[#384155] bg-[#2b3447]">
              <div className="flex items-center justify-between border-r border-[#4a5365] px-3">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of Non-veg In Participants Menu
                </span>
                <span className="text-[14px] font-medium text-white">
                  01
                </span>
              </div>

              <div className="flex items-center justify-between px-6">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of Non-veg In Guest/VIP Menu
                </span>
                <span className="text-[14px] font-medium text-white">
                  02
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dinner section */}

        <div className="dinner-container mt-5">
          <div className="w-full rounded-lg border border-[#30394d] bg-[#232a3c]/30 p-4">
            <h3 className="mb-3 text-lg font-medium text-[#853FF9]">
              Dinner
            </h3>

            <div className="mb-2 grid h-11 grid-cols-2 overflow-hidden rounded-md border border-[#384155] bg-[#2b3447]">
              <div className="flex items-center justify-between border-r border-[#4a5365] px-3 ">
                <span className="text-[14px] font-normal py-2 text-[#c1c4cf]">
                  No. of veg In Participants Menu
                </span>
                <span className="text-[14px] font-semibold text-white">
                  01
                </span>
              </div>

              <div className="flex items-center justify-between px-6">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of veg In Guest/VIP Menu
                </span>
                <span className="text-[14px] font-medium text-white">
                  02
                </span>
              </div>
            </div>

            <div className="grid h-11 grid-cols-2 overflow-hidden rounded-md border border-[#384155] bg-[#2b3447]">
              <div className="flex items-center justify-between border-r border-[#4a5365] px-3">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of Non-veg In Participants Menu
                </span>
                <span className="text-[14px] font-medium text-white">
                  01
                </span>
              </div>

              <div className="flex items-center justify-between px-6">
                <span className="text-[14px] font-normal text-[#c1c4cf]">
                  No. of Non-veg In Guest/VIP Menu
                </span>
                <span className="text-[14px] font-medium text-white">
                  02
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* special requirement  */}
        <div className="w-full rounded-lg border mt-3 border-[#30394d] bg-[#1d2638] px-4 py-3">
          <div className="mb-3 flex items-center gap-1.5">
            <FileText
              size={18}
              strokeWidth={1.8}
              className="text-[#d7d9e2]"
            />

            <h3 className="text-[14px] font-medium text-[#ffffff]">
              Special Requirement
            </h3>
          </div>

          <p className="text-[14px] font-normal leading-[18px] text-[#c1c4cf]/80">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text ever
            since the 1500s Lorem Ipsum is simply dummy text of the printing and
            typesetting industry. Lorem Ipsum has been the industry's standard
            dummy text ever since the 1500s
          </p>
        </div>



      </div>


    </main>
  );
};

export default IndividualFoodDetailPage;
