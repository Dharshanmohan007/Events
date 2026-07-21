import React, { useState, Fragment } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  FileText,
  CheckCircle2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date) {
  if (!date) return "--/--/----";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "--/--/----";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(date) {
  if (!date) return "--:-- --";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "--:-- --";
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

function chunkPairs(arr, size = 2) {
  const rows = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

// ─── Small building blocks ─────────────────────────────────────────────────────

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-[#1c1c34] border border-[#2a2a45] rounded-xl px-5 py-4 ${className}`}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div className="hidden sm:block w-px bg-[#2e2e4d] self-stretch mx-2" />;
}

function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      {Icon && (
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-600/15 flex-shrink-0">
          <Icon size={16} className="text-purple-400" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] tracking-wide uppercase text-gray-400 mb-0.5 truncate">
          {label}
        </p>
        <p className="text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function LocationStop({ label, name, isLast }) {
  return (
    <div className="flex items-center flex-1 min-w-[160px]">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600/20 flex-shrink-0 mt-0.5">
          <MapPin size={14} className="text-purple-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] tracking-wide uppercase text-gray-400 mb-0.5">
            {label}
          </p>
          <p className="text-sm font-semibold text-white truncate">
            {name?.trim() ? name : "—"}
          </p>
        </div>
      </div>
      {!isLast && (
        <div className="flex-1 mx-3 border-t border-dashed border-[#4b4b74] min-w-[24px] self-start mt-4" />
      )}
    </div>
  );
}

function PreviewHeader() {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 className="text-lg font-bold text-purple-400 playfair">
          Transport Details
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          Lorem ipsum is simply dummy text of the printing and typesetting
        </p>
      </div>
      {/* <span className="flex items-center gap-1.5 bg-teal-500/15 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0">
        <CheckCircle2 size={13} />
        Completed
      </span> */}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TransportPreview({ transportData = [] }) {
  const [activeTab, setActiveTab] = useState(0);

  const forms = Array.isArray(transportData) ? transportData : [];

  if (forms.length === 0) {
    return (
      <div>
        <PreviewHeader />
        <Card>
          <p className="text-sm text-gray-400 text-center py-6">
            No transport details added.
          </p>
        </Card>
      </div>
    );
  }

  const safeIndex = Math.min(activeTab, forms.length - 1);
  const form = forms[safeIndex] || {};

  const checkpoints = (form.checkpoints || []).filter((cp) =>
    cp?.name?.trim(),
  );
  const vehicleTypes = Array.isArray(form.vistaTransport)
    ? form.vistaTransport
    : [];
  const staffMembers = Array.isArray(form.staffMembers)
    ? form.staffMembers.filter((s) => s?.name?.trim() || s?.mobile)
    : [];

  const locations = [
    { label: "Pickup Location", name: form.pickupLocation },
    ...checkpoints.map((cp) => ({ label: "Checkpoint", name: cp.name })),
    { label: "Drop Location", name: form.dropLocation },
  ];

  return (
    <div className="flex flex-col gap-6 bg-[#161B2D] rounded-xl border border-[#2E3652] p-6 text-white">
      <PreviewHeader />

      {/* ── Day / entry tabs — mirrors the Venue & ICTS preview tab pattern ── */}
      {forms.length > 1 && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar">
          {forms.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                safeIndex === i
                  ? "bg-purple-600 text-white"
                  : "bg-[#1c1c34] text-gray-400 border border-[#2a2a45] hover:text-white"
              }`}
            >
              Day {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {/* Row 1: Pickup / Drop date & time */}
        <Card>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

    {/* Pickup Card */}
    <div className="bg-[#252C3F] border border-[#343C59] rounded-xl px-6 py-5">
      <div className="flex items-center">

        <InfoBlock
          icon={Calendar}
          label="Pickup Date"
          value={formatDate(form.pickupDate)}
        />

        <div className="mx-6 h-14 w-px bg-[#454D67]" />

        <InfoBlock
          icon={Clock}
          label="Pickup Time"
          value={formatTime(form.pickupDate)}
        />

      </div>
    </div>

    {/* Drop Card */}
    <div className="bg-[#252C3F] border border-[#343C59] rounded-xl px-6 py-5">
      <div className="flex items-center">

        <InfoBlock
          icon={Calendar}
          label="Drop Date"
          value={formatDate(form.dropDate)}
        />

        <div className="mx-6 h-14 w-px bg-[#454D67]" />

        <InfoBlock
          icon={Clock}
          label="Drop Time"
          value={formatTime(form.dropDate)}
        />

      </div>
    </div>

  </div>
</Card>

        {/* Row 2: Location flow — Pickup → Checkpoint(s) → Drop */}
        <Card>
          <div className="flex items-start flex-wrap sm:flex-nowrap gap-y-4">
            {locations.map((loc, idx) => (
              <LocationStop
                key={idx}
                label={loc.label}
                name={loc.name}
                isLast={idx === locations.length - 1}
              />
            ))}
          </div>
        </Card>

        {/* Row 3: Total members / Vehicle types needed */}
        <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <InfoBlock
              label="Total Number of Members"
              value={
                form.totalPassengers ? `${form.totalPassengers} Members` : "—"
              }
            />
          </div>
          <Divider />
          <div className="flex-1">
            <InfoBlock
              label="Types of Vehicle needed"
              value={
                vehicleTypes.length > 0 ? vehicleTypes.join(" / ") : "—"
              }
            />
          </div>
        </Card>

        {/* Row 4: Vehicle counts, 2 per row */}
        {vehicleTypes.length > 0 && (
          <Card>
            <div className="space-y-4">
              {chunkPairs(vehicleTypes).map((row, ri) => (
                <div
                  key={ri}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 ${
                    ri > 0 ? "pt-4 border-t border-[#2a2a45]" : ""
                  }`}
                >
                  {row.map((type, i) => (
                    <Fragment key={type}>
                      <div className="flex-1">
                        <InfoBlock
                          label={`Total ${type} needed`}
                          value={form.vehicleCounts?.[type] ?? "0"}
                        />
                      </div>
                      {i === 0 && row.length === 2 && <Divider />}
                    </Fragment>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Row 5: Accompanying staff */}
        {staffMembers.length > 0 ? (
          staffMembers.map((staff, idx) => (
            <Card
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <InfoBlock
                  icon={User}
                  label="Accompanying Staff Name"
                  value={staff.name?.trim() ? staff.name : "—"}
                />
              </div>
              <Divider />
              <div className="flex-1">
                <InfoBlock
                  icon={Phone}
                  label="Accompanying Mobile Number"
                  value={staff.mobile ? String(staff.mobile) : "—"}
                />
              </div>
            </Card>
          ))
        ) : (
          <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <InfoBlock icon={User} label="Accompanying Staff Name" value="—" />
            </div>
            <Divider />
            <div className="flex-1">
              <InfoBlock
                icon={Phone}
                label="Accompanying Mobile Number"
                value="—"
              />
            </div>
          </Card>
        )}

        {/* Row 6: Special requirements */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <FileText size={15} className="text-purple-400" />
            <p className="text-sm font-semibold text-white">
              Special Requirement
            </p>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {form.specialRequirements?.trim() ||
              "No special requirements specified."}
          </p>
        </Card>
      </div>
    </div>
  );
}