import { uid, ROLES, STATUS_FLOW, STATUS, stepOf, PLACEHOLDER_IMG } from "../utils/constants";

const D = (daysAgo, h = 10, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const plusMin = (iso, min) => new Date(new Date(iso).getTime() + min * 60000).toISOString();

// Builds a consistent timeline object up to the report's current status.
const mkTimeline = (createdAt, status) => {
  const idx = stepOf(status);
  const gaps = [0, 2, 3, 6, 4, 9, 14]; // minutes between stages
  const t = {};
  let cur = createdAt;
  STATUS_FLOW.forEach((s, i) => {
    if (i <= idx) {
      cur = i === 0 ? createdAt : plusMin(cur, gaps[i]);
      t[s] = cur;
    }
  });
  return t;
};

const seedUsers = [
  { id: "u1", name: "Demo User",   email: "user@helpinghands.demo", phone: "+91 98765 10001", role: ROLES.USER, active: true, createdAt: D(40) },
  { id: "u2", name: "Aarav Sharma", email: "aarav.sharma@example.com", phone: "+91 98765 10002", role: ROLES.USER, active: true, createdAt: D(35) },
  { id: "u3", name: "Priya Verma",  email: "priya.verma@example.com",  phone: "+91 98765 10003", role: ROLES.USER, active: true, createdAt: D(28) },
  { id: "u4", name: "Rohan Gupta",  email: "rohan.gupta@example.com",  phone: "+91 98765 10004", role: ROLES.USER, active: true, createdAt: D(21) },
  { id: "u5", name: "Neha Singh",   email: "neha.singh@example.com",   phone: "+91 98765 10005", role: ROLES.USER, active: false, createdAt: D(14) },
];

const seedResponders = [
  {
    id: "r1", name: "Demo Responder", email: "responder@helpinghands.demo",
    phone: "+91 98765 20001", role: ROLES.RESPONDER, department: "AMBULANCE",
    unit: "City Hospital EMS · Unit 12", base: { lat: 26.8560, lng: 80.9430 },
    availability: "AVAILABLE", active: true, createdAt: D(60),
  },
  {
    id: "r2", name: "Insp. Arjun Mehra", email: "arjun.mehra@police.example",
    phone: "+91 98765 20002", role: ROLES.RESPONDER, department: "POLICE",
    unit: "Traffic Police · Zone 7", base: { lat: 26.8380, lng: 80.9210 },
    availability: "AVAILABLE", active: true, createdAt: D(55),
  },
  {
    id: "r3", name: "Stn. Officer Kavita Rao", email: "kavita.rao@fire.example",
    phone: "+91 98765 20003", role: ROLES.RESPONDER, department: "FIRE_DEPARTMENT",
    unit: "Fire Station 3 · Alambagh", base: { lat: 26.8090, lng: 80.9020 },
    availability: "ON_CALL", active: true, createdAt: D(50),
  },
];

const seedAdmins = [
  { id: "a1", name: "System Admin", email: "admin@helpinghands.demo", phone: "+91 98765 30001", role: ROLES.ADMIN, active: true, createdAt: D(90) },
];

const mkAI = (type, severity, conf) => ({
  accidentDetected: true, accidentType: type, severity, confidence: conf,
  recommendedService:
    type === "Fire" ? "FIRE_DEPARTMENT" :
    type === "Other Emergency" || type === "Unclassified Incident" ? "POLICE" : "AMBULANCE",
});

const R = (n, userId, type, sev, conf, status, daysAgo, h, loc, desc, people, responderId, hospital) => {
  const createdAt = D(daysAgo, h);
  const ai = mkAI(type, sev, conf);
  return {
    id: "HH-10" + String(n).padStart(2, "0"),
    userId, imageUrl: PLACEHOLDER_IMG,
    accidentType: type, aiDetectedType: ai.accidentType,
    severity: sev, aiConfidence: conf,
    description: desc, peopleAffected: people,
    lat: loc.lat, lng: loc.lng, address: loc.address,
    recommendedService: ai.recommendedService,
    status, createdAt, updatedAt: createdAt,
    timeline: mkTimeline(createdAt, status),
    assignedResponderId: responderId || null,
    selectedHospital: hospital || null,
    rejectedBy: [],
  };
};

const LOCS = [
  { lat: 26.8467, lng: 80.9462, address: "Hazratganj Crossing, Lucknow, UP" },
  { lat: 26.8620, lng: 81.0010, address: "Gomti Nagar, Vibhuti Khand, Lucknow, UP" },
  { lat: 26.8125, lng: 80.9020, address: "Alambagh Bus Stand Rd, Lucknow, UP" },
  { lat: 26.8310, lng: 80.9230, address: "Charbagh, Station Rd, Lucknow, UP" },
  { lat: 26.8710, lng: 80.9910, address: "Indira Nagar, Sector 14, Lucknow, UP" },
  { lat: 26.8410, lng: 80.9340, address: "Aminabad Market Rd, Lucknow, UP" },
  { lat: 26.7850, lng: 80.8790, address: "NH-27, Kanpur Rd, near Scooter India, UP" },
  { lat: 26.7990, lng: 80.9770, address: "Shaheed Path, Gomti Nagar Ext., Lucknow, UP" },
  { lat: 26.8890, lng: 80.9950, address: "Faizabad Rd, near Polytechnic, Lucknow, UP" },
  { lat: 26.8930, lng: 80.9440, address: "Aliganj, Sector B, Lucknow, UP" },
];

// Registered hospitals (Ambulance service surfaces these as destinations).
// availableBeds is what hospitals keep updated; totalBeds is capacity.
const seedHospitals = [
  { id: "h1", name: "King George's Medical University (KGMU)", type: "Government · Level-1 Trauma", address: "Shah Mina Rd, Chowk, Lucknow, UP", phone: "0522 225 7540", lat: 26.8690, lng: 80.9120, totalBeds: 220, availableBeds: 34, active: true, createdAt: D(120) },
  { id: "h2", name: "SGPGIMS", type: "Government · Tertiary care", address: "Raebareli Rd, Lucknow, UP", phone: "0522 249 5000", lat: 26.7460, lng: 80.9490, totalBeds: 180, availableBeds: 9, active: true, createdAt: D(110) },
  { id: "h3", name: "Medanta Hospital", type: "Private · Multi-speciality", address: "Amar Shaheed Path, Sector A, Lucknow, UP", phone: "0522 450 5050", lat: 26.7790, lng: 80.9760, totalBeds: 140, availableBeds: 26, active: true, createdAt: D(100) },
  { id: "h4", name: "Dr. RML Institute (Lohia)", type: "Government · Multi-speciality", address: "Vibhuti Khand, Gomti Nagar, Lucknow, UP", phone: "0522 407 7777", lat: 26.8600, lng: 81.0000, totalBeds: 160, availableBeds: 41, active: true, createdAt: D(95) },
  { id: "h5", name: "Sahara Hospital", type: "Private · Multi-speciality", address: "Viraj Khand, Gomti Nagar, Lucknow, UP", phone: "0522 398 8888", lat: 26.8520, lng: 81.0080, totalBeds: 120, availableBeds: 0, active: true, createdAt: D(90) },
];
// Frozen snapshot attached to a report when a reporter picks a destination.
const HOSP = (h) => ({ id: h.id, name: h.name, address: h.address, phone: h.phone, availableBeds: h.availableBeds, totalBeds: h.totalBeds });

const seedReports = [
  R(1, "u2", "Vehicle Collision", "HIGH", 0.94, "COMPLETED", 12, 9,  LOCS[6], "Two-car head-on collision, both drivers injured.", 2, "r1"),
  R(2, "u3", "Fire",              "HIGH", 0.92, "COMPLETED", 9, 18,  LOCS[5], "Shop fire spreading to parked vehicles.", 0, "r3"),
  R(3, "u4", "Road Accident",     "MEDIUM", 0.88, "ARRIVED", 0, 7,  LOCS[3], "Bike skidded near the station exit, rider conscious.", 1, "r1", HOSP(seedHospitals[3])),
  R(4, "u1", "Vehicle Collision", "HIGH", 0.95, "ON_THE_WAY", 0, 8, LOCS[1], "Car hit a divider at speed, airbags deployed.", 1, "r1", HOSP(seedHospitals[0])),
  R(5, "u5", "Other Emergency",   "MEDIUM", 0.71, "ACCEPTED", 0, 6, LOCS[9], "Vehicle broke through a barricade, road blocked.", 0, "r2"),
  R(6, "u3", "Road Accident",     "HIGH", 0.90, "SERVICE_NOTIFIED", 0, 9, LOCS[0], "Auto-rickshaw overturned at the crossing, passengers trapped.", 3, null),
  R(7, "u2", "Fire",              "HIGH", 0.91, "SERVICE_NOTIFIED", 0, 9, LOCS[8], "Car caught fire after breakdown, smoke visible.", 0, null),
  R(8, "u4", "Vehicle Collision", "MEDIUM", 0.86, "AI_COMPLETED", 0, 10, LOCS[4], "Low-speed rear-end collision, minor injuries.", 1, null),
  R(9, "u1", "Road Accident",     "LOW", 0.78, "SUBMITTED", 0, 10, LOCS[7], "Cyclist clipped by a car mirror, minor scrapes.", 1, null),
  R(10, "u3", "Vehicle Collision", "HIGH", 0.93, "COMPLETED", 4, 20, LOCS[2], "Truck-bike collision near the bus stand.", 1, "r1"),
];

const seedAssignments = seedReports
  .filter((r) => r.assignedResponderId)
  .map((r) => ({
    id: uid("AS-"), reportId: r.id, responderId: r.assignedResponderId,
    serviceType: r.recommendedService,
    assignedAt: r.timeline.SERVICE_NOTIFIED || r.createdAt,
    acceptedAt: r.timeline.ACCEPTED || null,
    completedAt: r.timeline.COMPLETED || null,
    status: r.status,
  }));

let NSEQ = 1;
const N = (toRole, toId, reportId, title, message, type, iso, read = false) => ({
  id: "N" + NSEQ++, toRole, toId, reportId, title, message,
  notificationType: type, isRead: read, createdAt: iso,
});

const seedNotifications = [
  N(ROLES.USER, "u1", "HH-1004", "Responder on the way", "Unit 12 (Ambulance) is en route to your reported location.", "STATUS", D(0, 8, 20)),
  N(ROLES.USER, "u1", "HH-1004", "Emergency accepted", "Demo Responder accepted your emergency HH-1004.", "ACCEPTED", D(0, 8, 12), true),
  N(ROLES.USER, "u1", "HH-1009", "Report submitted", "Your report HH-1009 was submitted and queued for AI analysis.", "REPORT", D(0, 10, 2), true),
  N(ROLES.RESPONDER, "r1", "HH-1006", "New emergency assigned", "HIGH severity Road Accident at Hazratganj Crossing needs an ambulance.", "NEW_EMERGENCY", D(0, 9, 6)),
  N(ROLES.RESPONDER, "r1", "HH-1004", "Status updated", "You marked HH-1004 as ON THE WAY.", "STATUS", D(0, 8, 20), true),
  N(ROLES.RESPONDER, "r3", "HH-1007", "New emergency assigned", "Vehicle fire reported on Faizabad Rd — Fire Department recommended.", "NEW_EMERGENCY", D(0, 9, 10)),
  N(ROLES.ADMIN, "a1", "HH-1006", "Unassigned emergency", "HH-1006 has been waiting for responder acceptance for 20+ min.", "ALERT", D(0, 9, 30)),
  N(ROLES.ADMIN, "a1", null, "Daily summary", "4 new reports in the last 24 hours · 3 active emergencies.", "SUMMARY", D(0, 7, 0), true),
];

let LSEQ = 1;
const L = (actor, action, description, iso) => ({
  id: "LG" + LSEQ++, actor, action, description, timestamp: iso,
});
const seedLogs = [
  L("u3", "REPORT_CREATED", "Report HH-1006 created (Road Accident, Hazratganj).", D(0, 9, 0)),
  L("SYSTEM", "AI_ANALYSIS", "HH-1006 analysed — Road Accident, HIGH, 0.90 (mock YOLO).", D(0, 9, 2)),
  L("SYSTEM", "SERVICE_NOTIFIED", "Ambulance service notified for HH-1006.", D(0, 9, 5)),
  L("u2", "REPORT_CREATED", "Report HH-1007 created (Fire, Faizabad Rd).", D(0, 9, 4)),
  L("SYSTEM", "SERVICE_NOTIFIED", "Fire Department notified for HH-1007.", D(0, 9, 9)),
  L("r1", "STATUS_UPDATE", "HH-1004 status changed to ON_THE_WAY.", D(0, 8, 20)),
  L("r1", "EMERGENCY_ACCEPTED", "Responder r1 accepted HH-1003.", D(0, 7, 10)),
  L("a1", "LOGIN", "Administrator signed in.", D(0, 7, 0)),
  L("u1", "REPORT_CREATED", "Report HH-1009 created (Road Accident, Shaheed Path).", D(0, 10, 0)),
  L("SYSTEM", "AI_ANALYSIS", "HH-1010 analysed — Vehicle Collision, HIGH, 0.93 (mock YOLO).", D(4, 20, 4)),
];

export const seedDB = () => ({
  users: seedUsers, responders: seedResponders, admins: seedAdmins,
  reports: seedReports, assignments: seedAssignments, hospitals: seedHospitals,
  notifications: seedNotifications, logs: seedLogs,
});
