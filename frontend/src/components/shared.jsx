import React from "react";
import { MapPin, CheckCircle2, Circle, Navigation, Info, Phone } from "lucide-react";
import { cx, fmtDT, STATUS_FLOW, STATUS, stepOf } from "../utils/constants";

/* ── crest emblem (shield + medical cross) ─────────────────────────── */
const Emblem = ({ px = 22 }) => (
  <svg width={px} height={px} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3 L19 6 V11.2 C19 15.6 15.9 18.9 12 20.2 C8.1 18.9 5 15.6 5 11.2 V6 Z"
      stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="rgba(255,255,255,.14)" />
    <rect x="11" y="8" width="2" height="6" rx="0.7" fill="currentColor" />
    <rect x="9" y="10" width="6" height="2" rx="0.7" fill="currentColor" />
  </svg>
);

export const BrandMark = ({ dark = false, size = "md", danger = false }) => (
  <div className="flex items-center gap-2.5">
    <div className={cx("rounded-lg text-white flex items-center justify-center shadow-sm shrink-0",
      danger ? "bg-red-600" : "bg-emerald-500", size === "lg" ? "w-11 h-11" : "w-9 h-9")}>
      <Emblem px={size === "lg" ? 26 : 21} />
    </div>
    <div className="leading-tight">
      <div className={cx("font-extrabold tracking-tight", size === "lg" ? "text-xl" : "text-lg", dark ? "text-white" : "text-slate-900")}>
        HelpingHands
      </div>
      <div className={cx("text-[10px] font-semibold tracking-[0.16em] uppercase", dark ? "text-emerald-200/80" : "text-emerald-700")}>
        Emergency Response System
      </div>
    </div>
  </div>
);

/* ── schematic map (Google Maps renders here in production) ────────── */
export const MapPreview = ({ lat, lng, label, className = "" }) => (
  <div className={cx("rounded-xl overflow-hidden border border-slate-200", className)}>
    <div className="relative h-52 bg-slate-50 hh-mapgrid">
      {/* roads */}
      <div className="absolute left-0 right-0" style={{ top: "58%", height: 14, background: "#e3e8ec" }} />
      <div className="absolute top-0 bottom-0" style={{ left: "40%", width: 12, background: "#e3e8ec" }} />
      {/* pin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <MapPin size={30} className="drop-shadow" fill="#DC3545" color="#fff" strokeWidth={1.5} />
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 16, height: 16, background: "rgba(220,53,69,.18)" }} />
      {/* coords chip */}
      <div className="absolute bottom-2 left-2 bg-white/95 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-600 shadow-sm">
        {lat != null && lng != null ? `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` : "No coordinates yet"}
      </div>
      <div className="absolute right-2 top-2 bg-white/95 border border-slate-200 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-500 shadow-sm flex items-center gap-1.5">
        <span className="hh-livedot" style={{ width: 6, height: 6 }} /> Live GPS
      </div>
    </div>
    <div className="px-3 py-2 bg-white border-t border-slate-200 flex items-center gap-1.5 text-xs text-slate-500">
      <Navigation size={12} className="text-emerald-600 shrink-0" />
      <span className="truncate">{label || "Google Maps renders here once the API key is configured."}</span>
    </div>
  </div>
);

/* ── staged status timeline (signature) ────────────────────────────── */
export const TimelineView = ({ report, compact = false }) => {
  const current = stepOf(report.status);
  const isDone = report.status === "COMPLETED";
  return (
    <ol className="relative">
      {STATUS_FLOW.map((s, i) => {
        const reached = i < current || (i === current && isDone);
        const active = i === current && !isDone;
        const ts = report.timeline?.[s];
        return (
          <li key={s} className="relative pl-9 pb-5 last:pb-0">
            {i < STATUS_FLOW.length - 1 && (
              <span className={cx("absolute left-[11px] top-6 bottom-0 w-0.5", reached ? "bg-emerald-500" : "bg-slate-200")} />
            )}
            <span className="absolute left-0 top-0.5">
              {reached ? (
                <CheckCircle2 size={24} className="text-emerald-500" />
              ) : active ? (
                <span className="relative flex w-6 h-6 items-center justify-center">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-50 animate-ping" />
                  <span className="relative inline-flex w-6 h-6 rounded-full bg-white border-2 border-emerald-500 items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </span>
                </span>
              ) : (
                <Circle size={24} className="text-slate-300" />
              )}
            </span>
            <div className={cx("text-sm font-semibold", reached || active ? "text-slate-900" : "text-slate-400")}>
              {STATUS[s].label}
            </div>
            {!compact && (
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                {ts ? fmtDT(ts) : active ? "in progress" : "pending"}
              </div>
            )}
            {active && (
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-600 mt-1 inline-flex items-center gap-1.5">
                <span className="hh-livedot" style={{ width: 6, height: 6 }} /> Current stage
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
};

/* ── status banner (integration state) ─────────────────────────────── */
export const DemoBanner = () => null;

/* ── hospital destination (Ambulance) ──────────────────────────────── */
export const bedTone = (a) =>
  a === 0
    ? "bg-red-50 text-red-700 border-red-200"
    : a <= 10
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

export const HospitalSummary = ({ hospital, db }) => {
  const live = db?.hospitals?.find((h) => h.id === hospital.id);
  const beds = live ? live.availableBeds : hospital.availableBeds;
  const total = live ? live.totalBeds : hospital.totalBeds;
  return (
    <div className="text-sm space-y-2">
      <div className="font-bold text-slate-900">{hospital.name}</div>
      <div className="flex items-start gap-1.5 text-slate-600"><MapPin size={13} className="text-emerald-600 shrink-0 mt-0.5" /> {hospital.address}</div>
      <div className="flex items-center gap-1.5 text-slate-600"><Phone size={13} /> {hospital.phone}</div>
      <span className={cx("inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border", bedTone(beds))}>
        {beds > 0 ? `${beds} / ${total} beds available` : "No beds free"}
      </span>
    </div>
  );
};
