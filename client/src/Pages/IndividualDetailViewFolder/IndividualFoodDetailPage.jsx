import {
  ChevronRight,
  CalendarDays,
  UserRound,
  Phone,
  FileText,
} from "lucide-react";
import React from "react";

const IndividualFoodDetailPage = ({ data }) => {
  console.log("food data : ", data);
  //  ===================== functions =============================

  // format date

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // food types
  const breakfast = data?.data?.foodTypes.find((item) => {
    console.log("food item : ", item.foodTypes);
  });

  //  ---------------------------- jsx -------------------------------------------------
  return (
    <main>
      <breadcrumb className="flex items-center gap-2">
        <h1 className="text-gray-500">Food Request List</h1>
        <ChevronRight size={16} className="" />
        {/* <h1 className="text-white font-medium">Event Name</h1>
        <ChevronRight size={16} className="" /> */}
        <button className="bg-green-200/10 px-3 py-2 rounded-full text-xs text-[#34D399]">
          {data?.employeeDetail?.department}
        </button>
      </breadcrumb>

      <div className="bg-[#232a3c]/30 mt-4  p-4 rounded-xl border border-gray-700 w-full">
        <h1 className="text-lg text-[#853FF9] font-medium">
          Food & Refreshment Details
        </h1>

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
                  {formatDate(data?.data?.date)}
                </span>
              </div>

              <div className="flex items-center justify-between px-7 py-5">
                <span className="text-sm text-[#c3c4d2]">
                  Type of resource Person
                </span>

                <span className="text-sm font-semibold flex flex-wrap items-center gap-1 text-white">
                  {data?.data?.resourcePersonType.map((item) => {
                    return (
                      <div>
                        <p> &nbsp; {item} / </p>
                      </div>
                    );
                  })}
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
                  {data?.data?.numberOfResourcePersons} Members
                </span>
              </div>

              <div className="flex items-center justify-between px-7 py-5">
                <span className="text-sm text-[#c3c4d2]">
                  Total number of Internal Accompanying Person
                </span>

                <span className="text-sm font-semibold text-white">
                  {data?.data?.numberOfInternalAccompanyingStaff} Members
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
                    {data?.data?.accompanyingStaff.map((item) => {
                      return (
                        <div className="flex items-center gap-1">
                          <p>{item.name}</p>
                        </div>
                      );
                    })}
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
                    {data?.data?.accompanyingStaff.map((item) => {
                      return (
                        <div className="flex items-center gap-1">
                          <p>{item.mobile}</p>
                        </div>
                      );
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* =========================== breakfast ======================================== */}
        {/* =========================== Food Types =========================== */}

        {data?.data?.foodTypes?.map((foodItem, index) => {
          const foodName =
            foodItem?.foodTypes?.[0]?.foodType ||
            foodItem?.foodTypes?.[0]?.type ||
            foodItem?.foodTypes?.[0]?.name ||
            ["Breakfast", "Lunch", "Dinner"][index] ||
            `Food ${index + 1}`;

          return (
            <div key={index} className="food-container mt-5">
              <div className="w-full rounded-lg border border-[#30394d] bg-[#232a3c]/30 p-4">
                {/* Food name */}
                <h3 className="mb-3 text-lg font-medium text-[#853FF9]">
                  {foodName}
                </h3>

                {/* Veg */}
                <div className="mb-2 grid h-11 grid-cols-2 overflow-hidden rounded-md border border-[#384155] bg-[#2b3447]">
                  {/* Participants */}
                  <div className="flex items-center justify-between border-r border-[#4a5365] px-3">
                    <span className="text-[14px] font-normal text-[#c1c4cf]">
                      No. of veg In Participants Menu
                    </span>

                    <span className="text-[14px] font-semibold text-white">
                      {foodItem?.participants?.vegCount ?? 0}
                    </span>
                  </div>

                  {/* VIP */}
                  <div className="flex items-center justify-between px-6">
                    <span className="text-[14px] font-normal text-[#c1c4cf]">
                      No. of veg In Guest/VIP Menu
                    </span>

                    <span className="text-[14px] font-medium text-white">
                      {foodItem?.vipGuests?.vegCount ?? 0}
                    </span>
                  </div>
                </div>

                {/* Non Veg */}
                <div className="grid h-11 grid-cols-2 overflow-hidden rounded-md border border-[#384155] bg-[#2b3447]">
                  {/* Participants */}
                  <div className="flex items-center justify-between border-r border-[#4a5365] px-3">
                    <span className="text-[14px] font-normal text-[#c1c4cf]">
                      No. of Non-veg In Participants Menu
                    </span>

                    <span className="text-[14px] font-medium text-white">
                      {foodItem?.participants?.nonVegCount ?? 0}
                    </span>
                  </div>

                  {/* VIP */}
                  <div className="flex items-center justify-between px-6">
                    <span className="text-[14px] font-normal text-[#c1c4cf]">
                      No. of Non-veg In Guest/VIP Menu
                    </span>

                    <span className="text-[14px] font-medium text-white">
                      {foodItem?.vipGuests?.nonVegCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* special requirement  */}
        <div className="w-full rounded-lg border mt-3 border-[#30394d] bg-[#1d2638] px-4 py-3">
          <div className="mb-3 flex items-center gap-1.5">
            <FileText size={18} strokeWidth={1.8} className="text-[#d7d9e2]" />

            <h3 className="text-[14px] font-medium text-[#ffffff]">
              Special Requirement
            </h3>
          </div>

          <p className="text-[14px] font-normal leading-[18px] text-[#c1c4cf]/80">
            {data?.data?.specialRequirements}
          </p>
        </div>
      </div>
    </main>
  );
};

export default IndividualFoodDetailPage;
