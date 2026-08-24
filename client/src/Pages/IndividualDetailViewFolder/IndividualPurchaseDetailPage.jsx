import React from 'react';
import {
  ChevronRight, CalendarDays,
  UserRound,
  Phone,
  FileText, ClipboardList
} from 'lucide-react';
const IndividualPurchaseDetailPage = ({ data }) => {
  console.log("purchase data : ", data)


  // function to get field data 
  const students = data?.data?.purchases?.[0]?.students;

  const trophyGift = students?.giftItems?.find(
    (item) => item.giftType === "Trophy"
  );

  const basicTrophy = trophyGift?.trophy?.find(
    (item) => item.trophyType === "Basic"
  );

  const eliteTrophy = trophyGift?.trophy?.find(
    (item) => item.trophyType === "Elite"
  );

  return (
    <main>
      <breadcrumb className="flex items-center gap-2">
        <h1 className="text-gray-500">Purchase Request List</h1>
        <ChevronRight size={16} className="" />
        <button className="bg-green-200/10 px-3 py-2 rounded-full text-xs text-[#34D399]">Department</button>
      </breadcrumb>

      <div className="bg-[#232a3c]/30 mt-4  p-4 rounded-xl border border-gray-700 w-full">
        <h1 className="text-lg text-[#853FF9] font-medium">Purchase Details</h1>


        {/* students  */}
        <div className="bg-[#141c30] mt-3">

          {/* Top Row */}
          <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#222b3e]">

            {/* Left */}
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-[14px] text-slate-300">
                Id Card&nbsp; Hard copy Quantity
              </span>

              <span className="text-[13px] font-semibold text-white">
                {data?.data?.purchases[0].requirementNeeded[0]?.hardCount}
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
              <span className="text-[14px] text-slate-300">
                Certificate Hard Copy Quantity
              </span>

              <span className="text-[13px] font-semibold text-white">
                {data?.data?.purchases[0].requirementNeeded[1]?.hardCount}
              </span>
            </div>
          </div>

          {/* Students Container */}
          <div className="rounded-lg border border-slate-600/40 bg-[#1d2639] p-3">

            {/* Title */}
            <h2 className="mb-3 text-[16px] font-medium text-[#853FF9]">
              Students
            </h2>

            {/* Row 1 */}
            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">

              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Basic Trophy Quantity
                </span>

                <span className="text-[13px] font-semibold text-white">
                  {/* {data?.data?.purchases[0]?.students?.giftItems[0].} */}
                  {basicTrophy?.quantity}
                </span>
              </div>

              <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Elite Trophy Quantity
                </span>

                <span className="text-[13px] font-semibold text-white">
                  02
                </span>
              </div>

            </div>

            {/* Row 2 */}
            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">

              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Cash Prize Amount
                </span>

                <span className="text-[13px] font-semibold text-white">
                  ₹ 5000
                </span>
              </div>

              <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Registration Kit Quantity
                </span>

                <span className="text-[13px] font-semibold text-white">
                  {data?.data?.purchases[0]?.students?.registrationKitQty}
                </span>
              </div>

            </div>

            {/* Row 3 */}
            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">

              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Voucher worth
                </span>

                <span className="text-[13px] font-semibold text-white">
                  ₹ 5000
                </span>
              </div>

              <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Voucher worth Quantity ( ₹ 5000 )
                </span>

                <span className="text-[13px] font-semibold text-white">
                  02
                </span>
              </div>

            </div>

            {/* Special Requirement */}
            <div className="rounded-xl border border-slate-500/40 bg-[#2c3548] px-4 py-4">

              {/* Header */}
              <div className="mb-3 flex items-center gap-1.5">

                <ClipboardList
                  size={14}
                  strokeWidth={1.8}
                  className="text-slate-200"
                />

                <span className="text-[13px] font-medium text-slate-200">
                  Special Requirement
                </span>

              </div>

              {/* Description */}
              <p className="text-[14px] leading-6 text-slate-300">
                {data?.data?.purchases[0]?.students?.specialRequirements || "--"}
              </p>

            </div>

          </div>
        </div>

        {/* guests  */}
        <div className="bg-[#141c30] mt-3">


          {/* Students Container */}
          <div className="rounded-lg border border-slate-600/40 bg-[#1d2639] p-3">

            {/* Title */}
            <h2 className="mb-3 text-[16px] font-medium text-[#853FF9]">
              Guests
            </h2>

            {/* Row 1 */}
            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">

              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Basic Trophy Quantity
                </span>

                <span className="text-[13px] font-semibold text-white">
                  01
                </span>
              </div>

              <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Elite Trophy Quantity
                </span>

                <span className="text-[13px] font-semibold text-white">
                  02
                </span>
              </div>

            </div>

            {/* Row 2 */}
            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">

              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Cash Prize Amount
                </span>

                <span className="text-[13px] font-semibold text-white">
                  ₹ 5000
                </span>
              </div>

              <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Registration Kit Quantity
                </span>

                <span className="text-[13px] font-semibold text-white">
                  50
                </span>
              </div>

            </div>

            {/* Row 3 */}
            <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-600/40 bg-[#2c3548]">

              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Voucher worth
                </span>

                <span className="text-[13px] font-semibold text-white">
                  ₹ 5000
                </span>
              </div>

              <div className="flex items-center justify-between border-l border-slate-500/50 px-4 py-4">
                <span className="text-[14px] text-slate-300">
                  Voucher worth Quantity ( ₹ 5000 )
                </span>

                <span className="text-[13px] font-semibold text-white">
                  02
                </span>
              </div>

            </div>

            {/* Special Requirement */}
            <div className="rounded-xl border border-slate-500/40 bg-[#2c3548] px-4 py-4">

              {/* Header */}
              <div className="mb-3 flex items-center gap-1.5">

                <ClipboardList
                  size={14}
                  strokeWidth={1.8}
                  className="text-slate-200"
                />

                <span className="text-[13px] font-medium text-slate-200">
                  Special Requirement
                </span>

              </div>

              {/* Description */}
              <p className="text-[14px] leading-6 text-slate-300">
                {data?.data?.purchases[0]?.guests?.specialRequirements || "--"}
              </p>

            </div>

          </div>
        </div>
      </div>

    </main>
  );
};

export default IndividualPurchaseDetailPage;
