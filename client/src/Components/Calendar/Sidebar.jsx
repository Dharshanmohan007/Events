import { useNavigate } from "react-router-dom";
import MiniCalendar from "./MiniCalendar.jsx";
import { DEPARTMENTS } from "../../utils/departmentColors.js";
import { MoveLeft } from "lucide-react";

export default function Sidebar({ selectedDate, onSelectDate }) {
  const navigate = useNavigate();
  return (
    <aside className="flex w-[280px] shrink-0 flex-col gap-6 border-r border-white/5  px-5 py-6">
      <div 
      onClick={() => navigate(-1)}
      className="flex items-center w-fit gap-2.5 bg-violet-500 px-3 py-2 rounded-md cursor-pointer">
        <MoveLeft />
        <p className="text-white font-semibold">Go Back</p>
      </div>
      <MiniCalendar selectedDate={selectedDate} onSelect={onSelectDate} />

      <div className="table-custom-scrollbar  overflow-auto">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Departments
        </h3>
        <ul className="space-y-2.5">
          {DEPARTMENTS.map((dept) => (
            <li
              key={dept.name}
              className="flex items-center gap-2.5 text-sm text-slate-300"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${dept.dot}`} />
              {dept.name}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
