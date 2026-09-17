import { Ambulance, Shield, Flame } from "lucide-react";
export const cx = (...c) => c.filter(Boolean).join(" ");
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
export const uid = (p = "") =>
  p + Math.random().toString(36).slice(2, 8).toUpperCase();

export const fmtDT = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
export const fmtD = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
export const timeAgo = (iso) => {
  const s = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (s < 60) return s + "s ago";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
};

export const ROLES = { USER: "USER", RESPONDER: "RESPONDER", ADMIN: "ADMIN" };

export const STATUS_FLOW = [
  "SUBMITTED",
  "AI_COMPLETED",
  "SERVICE_NOTIFIED",
  "ACCEPTED",
  "ON_THE_WAY",
  "ARRIVED",
  "COMPLETED",
];
export const STATUS = {
  SUBMITTED: { label: "Report Submitted", pill: "bg-slate-100 text-slate-700 border border-slate-200" },
  AI_COMPLETED: {
    label: "AI Analysis Completed",
    pill: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  SERVICE_NOTIFIED: {
    label: "Emergency Service Notified",
    pill: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  ACCEPTED: { label: "Responder Accepted", pill: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  ON_THE_WAY: {
    label: "Responder On The Way",
    pill: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  ARRIVED: {
    label: "Responder Arrived",
    pill: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  COMPLETED: {
    label: "Emergency Completed",
    pill: "bg-emerald-600 text-white border border-emerald-600",
  },
};
export const stepOf = (status) => STATUS_FLOW.indexOf(status);

export const SEVERITY = {
  HIGH: { label: "HIGH", pill: "bg-red-100 text-red-700 border border-red-200", dot: "bg-red-600" },
  MEDIUM: {
    label: "MEDIUM",
    pill: "bg-amber-100 text-amber-800 border border-amber-200",
    dot: "bg-amber-500",
  },
  LOW: {
    label: "LOW",
    pill: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export const SERVICES = {
  AMBULANCE: {
    label: "Ambulance",
    phone: "108",
    icon: Ambulance,
    pill: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    tint: "text-emerald-600",
    ring: "border-emerald-500",
    desc: "Medical emergencies, injuries, trauma response and hospital transport.",
  },
  POLICE: {
    label: "Police",
    phone: "112",
    icon: Shield,
    pill: "bg-slate-100 text-slate-700 border border-slate-200",
    tint: "text-slate-600",
    ring: "border-slate-400",
    desc: "Traffic control, accident investigation, law-and-order at the scene.",
  },
  FIRE_DEPARTMENT: {
    label: "Fire Department",
    phone: "101",
    icon: Flame,
    pill: "bg-amber-100 text-amber-800 border border-amber-200",
    tint: "text-amber-600",
    ring: "border-amber-400",
    desc: "Fire suppression, vehicle extrication and hazardous-material response.",
  },
};

export const ACCIDENT_TYPES = [
  "Road Accident",
  "Vehicle Collision",
  "Fire",
  "Other Emergency",
];

export const RESPONDER_INSTRUCTIONS = {
  AMBULANCE: [
    "Confirm scene safety before approaching the casualty.",
    "Check responsiveness, airway and breathing; control visible bleeding.",
    "Do not move casualties with suspected spinal injury unless in danger.",
    "Update status in the app at every stage so the reporter can track you.",
  ],
  POLICE: [
    "Secure the scene and divert traffic away from the accident zone.",
    "Record vehicle numbers and witness details for the report.",
    "Coordinate with medical / fire teams already dispatched.",
    "Update status in the app at every stage so the reporter can track you.",
  ],
  FIRE_DEPARTMENT: [
    "Assess fire spread and fuel-leak risk before committing crew.",
    "Establish a safety perimeter; cut vehicle power where possible.",
    "Coordinate extrication with the medical team on site.",
    "Update status in the app at every stage so the reporter can track you.",
  ],
};

// Neutral demo accident image (SVG data-URI) used for seeded reports.
export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400'>` +
      `<rect width='640' height='400' fill='#e2e8f0'/>` +
      `<rect y='260' width='640' height='140' fill='#cbd5e1'/>` +
      `<g fill='#94a3b8'><rect x='150' y='210' width='170' height='60' rx='12'/>` +
      `<rect x='190' y='180' width='95' height='45' rx='10'/>` +
      `<circle cx='185' cy='276' r='22'/><circle cx='295' cy='276' r='22'/>` +
      `<rect x='360' y='218' width='150' height='52' rx='10' transform='rotate(8 435 244)'/>` +
      `<circle cx='392' cy='288' r='20'/><circle cx='488' cy='300' r='20'/></g>` +
      `<text x='320' y='90' font-family='sans-serif' font-size='22' fill='#64748b' text-anchor='middle'>Accident image · demo placeholder</text>` +
      `<text x='320' y='120' font-family='sans-serif' font-size='14' fill='#94a3b8' text-anchor='middle'>Uploaded photos appear here in live reports</text>` +
      `</svg>`,
  );

export const haversineKm = (a, b) => {
  const R = 6371,
    toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat),
    dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
};
