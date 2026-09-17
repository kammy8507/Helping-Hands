import React, { useState, useMemo } from "react";
import { Ambulance, Siren, AlertTriangle, MapPin, Bell, Users, FileText, Activity, CheckCircle2, Clock, Phone, Trash2, Cpu, Building2, Hospital, BedDouble, Plus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { cx, fmtDT, fmtD, timeAgo, STATUS_FLOW, STATUS, stepOf, SERVICES, ACCIDENT_TYPES } from "../../utils/constants";
import { Btn, Card, Pill, StatusPill, SeverityPill, ServicePill, StatCard, Skeleton, EmptyState, Modal, Field, TextInput, Select } from "../../components/ui";
import { ReportRow } from "../user";

const CHART_COLORS = { red: "#DC3545", navy: "#0F5132", amber: "#E0A100", green: "#198754", blue: "#64748B", orange: "#E0A100", slate: "#94a3b8" };

// Find the responder assigned to an emergency report.
const findResponder = (db, id) => db.responders.find((r) => r.id === id);

const Th = ({ children, className = "" }) => (
  <th className={cx("px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap", className)}>{children}</th>
);
const Td = ({ children, className = "" }) => (
  <td className={cx("px-4 py-3 text-sm text-slate-700 whitespace-nowrap align-middle", className)}>{children}</td>
);
const TableCard = ({ head, children }) => (
  <Card className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead className="bg-slate-50 border-b border-slate-200"><tr>{head}</tr></thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  </Card>
);

const useAnalytics = (db) => useMemo(() => {
  const reports = db.reports;
  const bySev = ["HIGH", "MEDIUM", "LOW"].map((s) => ({ name: s, value: reports.filter((r) => r.severity === s).length }));
  const byType = ACCIDENT_TYPES.map((t) => ({ name: t.replace(" Emergency", ""), value: reports.filter((r) => r.accidentType === t).length }));
  const bySvc = Object.keys(SERVICES).map((k) => ({ name: SERVICES[k].label, value: reports.filter((r) => r.recommendedService === k).length }));
  const byStatus = STATUS_FLOW.map((s) => ({ name: STATUS[s].label.replace("Responder ", "").replace("Emergency ", ""), value: reports.filter((r) => r.status === s).length }));
  const days = [...Array(14)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toDateString();
    return { name: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), value: reports.filter((r) => new Date(r.createdAt).toDateString() === key).length };
  });
  const acceptedTimes = reports.filter((r) => r.timeline.ACCEPTED)
    .map((r) => (new Date(r.timeline.ACCEPTED) - new Date(r.createdAt)) / 60000);
  const avgResponse = acceptedTimes.length ? Math.round(acceptedTimes.reduce((a, b) => a + b, 0) / acceptedTimes.length) : 0;
  return { bySev, byType, bySvc, byStatus, days, avgResponse };
}, [db.reports]);

const ChartCard = ({ title, children, h = 220 }) => (
  <Card className="p-4">
    <div className="font-bold text-slate-900 text-sm mb-3">{title}</div>
    <div style={{ height: h }}>{children}</div>
  </Card>
);

export const AdminOverview = ({ db, go }) => {
  const A = useAnalytics(db);
  const activeCount = db.reports.filter((r) => !["COMPLETED"].includes(r.status)).length;
  const doneCount = db.reports.filter((r) => r.status === "COMPLETED").length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Users" value={db.users.length} />
        <StatCard icon={Ambulance} label="Total Responders" value={db.responders.length} tone="blue" />
        <StatCard icon={FileText} label="Accident Reports" value={db.reports.length} tone="amber" />
        <StatCard icon={Siren} label="Active Emergencies" value={activeCount} tone="red" />
        <StatCard icon={CheckCircle2} label="Completed" value={doneCount} tone="green" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Accidents by date (last 14 days)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={A.days} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={2} /><YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip /><Bar dataKey="value" name="Reports" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Emergency response status">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={A.byStatus} layout="vertical" margin={{ top: 4, right: 8, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
              <Tooltip /><Bar dataKey="value" name="Reports" fill={CHART_COLORS.navy} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-slate-900">Latest reports</h3>
          <button onClick={() => go("a.reports")} className="text-sm font-semibold text-red-600 hover:text-red-700">All reports →</button>
        </div>
        <div className="space-y-3">
          {db.reports.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3).map((r) => (
            <ReportRow key={r.id} r={r} onOpen={() => go("a.monitoring")} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminUsersPage = ({ db, onToggleUser, onDeleteUser }) => {
  const [confirm, setConfirm] = useState(null);
  return (
    <div className="space-y-4">
      <TableCard head={<><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Joined</Th><Th>Status</Th><Th className="text-right">Actions</Th></>}>
        {db.users.map((u) => (
          <tr key={u.id} className="hover:bg-slate-50">
            <Td className="font-semibold text-slate-900">{u.name}</Td>
            <Td>{u.email}</Td><Td>{u.phone}</Td><Td>{fmtD(u.createdAt)}</Td>
            <Td>{u.active ? <Pill className="bg-emerald-100 text-emerald-700">Active</Pill> : <Pill className="bg-slate-200 text-slate-600">Deactivated</Pill>}</Td>
            <Td className="text-right">
              <div className="inline-flex gap-2">
                <Btn size="sm" variant="outline" onClick={() => onToggleUser(u.id)}>{u.active ? "Deactivate" : "Activate"}</Btn>
                <Btn size="sm" variant="danger" onClick={() => setConfirm(u)}><Trash2 size={13} /></Btn>
              </div>
            </Td>
          </tr>
        ))}
      </TableCard>
      <Modal open={!!confirm} title="Delete user?" onClose={() => setConfirm(null)}>
        <p className="text-sm text-slate-600">
          Permanently remove <b>{confirm?.name}</b>? Their accident reports remain in the system for records.
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <Btn variant="outline" onClick={() => setConfirm(null)}>Cancel</Btn>
          <Btn onClick={() => { onDeleteUser(confirm.id); setConfirm(null); }}><Trash2 size={15} /> Delete user</Btn>
        </div>
      </Modal>
    </div>
  );
};

export const AdminRespondersPage = ({ db, onCreateResponder, onToggleResponder }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", department: "AMBULANCE", unitName: "", availabilityStatus: "AVAILABLE" });
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const submit = async () => {
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      setError("Please complete all required fields."); return;
    }
    setSaving(true);
    try {
      await onCreateResponder({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), unitName: form.unitName.trim() || null });
      setOpen(false);
      setForm({ name: "", email: "", phone: "", password: "", department: "AMBULANCE", unitName: "", availabilityStatus: "AVAILABLE" });
    } catch (err) { setError(err.message || "Unable to create responder."); }
    finally { setSaving(false); }
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Btn onClick={() => { setError(""); setOpen(true); }}><Plus size={16} /> Add responder</Btn>
      </div>
      <TableCard head={<><Th>Responder</Th><Th>Department</Th><Th>Unit</Th><Th>Contact</Th><Th>Status</Th><Th className="text-right">Actions</Th></>}>
        {db.responders.map((r) => (
          <tr key={r.id} className="hover:bg-slate-50">
            <Td className="font-semibold text-slate-900">{r.name}</Td>
            <Td><ServicePill svc={r.department} /></Td>
            <Td>{r.unit || "—"}</Td><Td>{r.phone}</Td>
            <Td>{r.active !== false ? <Pill className="bg-emerald-100 text-emerald-700">Active</Pill> : <Pill className="bg-slate-200 text-slate-600">Disabled</Pill>}</Td>
            <Td className="text-right"><Btn size="sm" variant="outline" onClick={() => onToggleResponder(r.id)}>{r.active !== false ? "Disable" : "Enable"}</Btn></Td>
          </tr>
        ))}
      </TableCard>
      <Modal open={open} title="Add responder" onClose={() => !saving && setOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Create a responder account and assign their service details.</p>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
          <Field label="Full name"><TextInput value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
          <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
          <Field label="Phone number"><TextInput value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
          <Field label="Temporary password"><TextInput type="password" value={form.password} onChange={(e) => update("password", e.target.value)} /></Field>
          <Field label="Emergency service"><Select value={form.department} onChange={(e) => update("department", e.target.value)}>{Object.keys(SERVICES).map((key) => <option key={key} value={key}>{SERVICES[key].label}</option>)}</Select></Field>
          <Field label="Unit name"><TextInput value={form.unitName} placeholder="Optional" onChange={(e) => update("unitName", e.target.value)} /></Field>
          <div className="flex justify-end gap-2 pt-2"><Btn variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Btn><Btn onClick={submit} disabled={saving}>{saving ? "Creating…" : "Create responder"}</Btn></div>
        </div>
      </Modal>
    </div>
  );
};

export const AdminReportsPage = ({ db }) => (
  <TableCard head={<><Th>Report</Th><Th>Reporter</Th><Th>Type</Th><Th>Severity</Th><Th>Service</Th><Th>Status</Th><Th>Created</Th></>}>
    {db.reports.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((r) => (
      <tr key={r.id} className="hover:bg-slate-50">
        <Td className="font-semibold text-slate-900">{r.id}</Td>
        <Td>{db.users.find((u) => u.id === r.userId)?.name || "—"}</Td>
        <Td>{r.accidentType}</Td>
        <Td><SeverityPill sev={r.severity} /></Td>
        <Td><ServicePill svc={r.recommendedService} /></Td>
        <Td><StatusPill status={r.status} /></Td>
        <Td className="text-slate-500">{fmtDT(r.createdAt)}</Td>
      </tr>
    ))}
  </TableCard>
);

export const AdminMonitoringPage = ({ db }) => {
  const active = db.reports.filter((r) => r.status !== "COMPLETED")
    .sort((a, b) => stepOf(a.status) - stepOf(b.status));
  return (
    <div className="space-y-4">
      {active.length === 0 && <Card><EmptyState icon={Activity} title="No active emergencies" note="All reported emergencies are resolved." /></Card>}
      {active.map((r) => {
        const resp = findResponder(db, r.assignedResponderId);
        return (
          <Card key={r.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-extrabold text-slate-900">{r.id}</span>
                <Pill className="bg-slate-100 text-slate-700">{r.aiDetectedType}</Pill>
                <SeverityPill sev={r.severity} />
                <ServicePill svc={r.recommendedService} />
              </div>
              <StatusPill status={r.status} />
            </div>
            <div className="mt-2 text-sm text-slate-600 flex items-center gap-1.5"><MapPin size={13} className="text-red-500" /> {r.address}</div>
            <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5"><div className="text-[11px] font-bold text-slate-400 uppercase">Reporter</div><div className="font-semibold text-slate-800">{db.users.find((u) => u.id === r.userId)?.name || "—"}</div></div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5"><div className="text-[11px] font-bold text-slate-400 uppercase">Responder</div><div className="font-semibold text-slate-800">{resp ? resp.name : "Awaiting acceptance"}</div></div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5"><div className="text-[11px] font-bold text-slate-400 uppercase">Reported</div><div className="font-semibold text-slate-800">{timeAgo(r.createdAt)}</div></div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export const AdminServicesPage = ({ db }) => (
  <div className="grid sm:grid-cols-3 gap-5">
    {Object.entries(SERVICES).map(([k, S]) => {
      const count = db.reports.filter((r) => r.recommendedService === k).length;
      const units = db.responders.filter((r) => r.department === k).length;
      return (
        <Card key={k} className={cx("p-5 border-t-4", S.ring)}>
          <div className={cx("w-11 h-11 rounded-xl flex items-center justify-center mb-3", S.pill)}><S.icon size={22} /></div>
          <div className="font-bold text-slate-900">{S.label}</div>
          <div className="text-xs text-slate-500 mt-0.5">Helpline {S.phone}</div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2"><div className="text-[10px] font-bold text-slate-400 uppercase">Cases</div><div className="font-extrabold text-slate-900">{count}</div></div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2"><div className="text-[10px] font-bold text-slate-400 uppercase">Units</div><div className="font-extrabold text-slate-900">{units}</div></div>
          </div>
        </Card>
      );
    })}
  </div>
);

const PIE_SEV = [CHART_COLORS.red, CHART_COLORS.amber, CHART_COLORS.green];
const PIE_SVC = [CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.orange];

export const AdminAnalyticsPage = ({ db }) => {
  const A = useAnalytics(db);
  const high = db.reports.filter((r) => r.severity === "HIGH").length;
  const med = db.reports.filter((r) => r.severity === "MEDIUM").length;
  const low = db.reports.filter((r) => r.severity === "LOW").length;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={FileText} label="Total Accidents" value={db.reports.length} />
        <StatCard icon={AlertTriangle} label="High Severity" value={high} tone="red" />
        <StatCard icon={AlertTriangle} label="Medium Severity" value={med} tone="amber" />
        <StatCard icon={AlertTriangle} label="Low Severity" value={low} tone="green" />
        <StatCard icon={Clock} label="Avg. Acceptance Time" value={A.avgResponse + " min"} tone="blue" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Accidents by date">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={A.days} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={2} /><YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip /><Line type="monotone" dataKey="value" name="Reports" stroke={CHART_COLORS.green} strokeWidth={2.5} dot={{ r: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Accidents by type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={A.byType} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip /><Bar dataKey="value" name="Reports" fill={CHART_COLORS.navy} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Accidents by severity">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={A.bySev} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                {A.bySev.map((_, i) => <Cell key={i} fill={PIE_SEV[i]} />)}
              </Pie>
              <Tooltip /><Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Emergency service distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={A.bySvc} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                {A.bySvc.map((_, i) => <Cell key={i} fill={PIE_SVC[i]} />)}
              </Pie>
              <Tooltip /><Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export const AdminLogsPage = ({ db }) => (
  <TableCard head={<><Th>Time</Th><Th>Actor</Th><Th>Action</Th><Th>Description</Th></>}>
    {db.logs.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((l) => (
      <tr key={l.id} className="hover:bg-slate-50">
        <Td className="text-slate-500">{fmtDT(l.timestamp)}</Td>
        <Td className="font-semibold text-slate-900">{l.actor}</Td>
        <Td><Pill className="bg-slate-100 text-slate-700">{l.action}</Pill></Td>
        <Td className="whitespace-normal">{l.description}</Td>
      </tr>
    ))}
  </TableCard>
);

export const AdminSettingsPage = () => (
  <div className="max-w-xl space-y-4">
    {[
      { icon: Cpu, title: "YOLO AI service", note: "Endpoint the Spring Boot backend calls for image inference.", value: "http://ai-service:5000/predict", state: "Mock" },
      { icon: Bell, title: "Firebase Cloud Messaging", note: "Server key used for push notifications to users and responders.", value: "FCM server key ····", state: "Mock" },
      { icon: MapPin, title: "Google Maps API", note: "Geocoding + map rendering for accident locations.", value: "VITE_GOOGLE_MAPS_KEY", state: "Mock" },
      { icon: Building2, title: "MySQL database", note: "Primary datastore behind the Spring Boot API.", value: "jdbc:mysql://localhost:3306/helpinghands", state: "Mock" },
    ].map((s) => (
      <Card key={s.title} className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><s.icon size={19} /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="font-bold text-slate-900 text-sm">{s.title}</div>
            <Pill className="bg-amber-100 text-amber-800">{s.state}</Pill>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{s.note}</p>
          <div className="mt-2 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 truncate">{s.value}</div>
        </div>
      </Card>
    ))}
    <p className="text-xs text-slate-400">Integration endpoints are placeholders — configured via environment variables once the production services are connected.</p>
  </div>
);

/* ─── Hospital management (Ambulance destinations) ─────────────── */

const HOSPITAL_TYPES = [
  "Government · Level-1 Trauma",
  "Government · Tertiary care",
  "Government · Multi-speciality",
  "Private · Multi-speciality",
  "Community Health Centre",
];

const BedBar = ({ available, total }) => {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const tone = available === 0 ? "bg-red-500" : available <= 10 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="min-w-[128px]">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>{available} / {total}</span><span className="text-slate-400">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={cx("h-full rounded-full", tone)} style={{ width: pct + "%" }} /></div>
    </div>
  );
};

const emptyHospital = { name: "", type: HOSPITAL_TYPES[0], address: "", phone: "", lat: "", lng: "", totalBeds: "", availableBeds: "" };

export const AdminHospitalsPage = ({ db, onRegister, onUpdateBeds, onToggleActive }) => {
  const hospitals = db.hospitals || [];
  const [reg, setReg] = useState(false);
  const [form, setForm] = useState(emptyHospital);
  const [beds, setBeds] = useState(null);
  const [bedForm, setBedForm] = useState({ availableBeds: 0, totalBeds: 0 });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const totalBeds = hospitals.reduce((a, h) => a + (h.totalBeds || 0), 0);
  const availBeds = hospitals.reduce((a, h) => a + (h.availableBeds || 0), 0);
  const fullCount = hospitals.filter((h) => h.active && h.availableBeds === 0).length;
  const canRegister = form.name.trim() && form.address.trim() && form.phone.trim() && form.lat !== "" && form.lng !== "" && Number(form.totalBeds) > 0;

  const submitReg = () => { onRegister(form); setReg(false); setForm(emptyHospital); };
  const openBeds = (h) => { setBeds(h); setBedForm({ availableBeds: h.availableBeds, totalBeds: h.totalBeds }); };
  const submitBeds = () => { onUpdateBeds(beds.id, Number(bedForm.availableBeds), Number(bedForm.totalBeds)); setBeds(null); };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Hospital} label="Hospitals" value={hospitals.length} />
        <StatCard icon={BedDouble} label="Total Beds" value={totalBeds} tone="blue" />
        <StatCard icon={CheckCircle2} label="Beds Available" value={availBeds} tone="green" />
        <StatCard icon={AlertTriangle} label="At Capacity" value={fullCount} tone="red" />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-slate-500">Registered hospitals appear to reporters as ambulance destinations. Keep bed availability current.</p>
        <Btn onClick={() => { setForm(emptyHospital); setReg(true); }}><Plus size={16} /> Register hospital</Btn>
      </div>

      <TableCard head={<><Th>Hospital</Th><Th>Type</Th><Th>Contact</Th><Th>Beds available</Th><Th>Status</Th><Th className="text-right">Actions</Th></>}>
        {hospitals.length === 0 && (
          <tr><Td className="text-slate-500">No hospitals registered yet.</Td><Td /><Td /><Td /><Td /><Td /></tr>
        )}
        {hospitals.map((h) => (
          <tr key={h.id} className="hover:bg-slate-50">
            <Td className="align-top">
              <div className="font-semibold text-slate-900">{h.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={11} className="text-emerald-600" /> {h.address}</div>
            </Td>
            <Td className="whitespace-normal max-w-[190px] text-slate-600">{h.type}</Td>
            <Td><span className="flex items-center gap-1.5"><Phone size={12} /> {h.phone}</span></Td>
            <Td><BedBar available={h.availableBeds} total={h.totalBeds} /></Td>
            <Td>{h.active ? <Pill className="bg-emerald-100 text-emerald-700">Active</Pill> : <Pill className="bg-slate-200 text-slate-600">Inactive</Pill>}</Td>
            <Td className="text-right">
              <div className="inline-flex gap-2">
                <Btn size="sm" variant="outline" onClick={() => openBeds(h)}><BedDouble size={13} /> Update beds</Btn>
                <Btn size="sm" variant="ghost" onClick={() => onToggleActive(h.id)}>{h.active ? "Deactivate" : "Activate"}</Btn>
              </div>
            </Td>
          </tr>
        ))}
      </TableCard>

      <Modal open={reg} title="Register a hospital" onClose={() => setReg(false)}>
        <div className="space-y-3">
          <Field label="Hospital name"><TextInput value={form.name} onChange={set("name")} placeholder="e.g. City Care Hospital" /></Field>
          <Field label="Type"><Select value={form.type} onChange={set("type")} options={HOSPITAL_TYPES.map((t) => ({ value: t, label: t }))} /></Field>
          <Field label="Address"><TextInput value={form.address} onChange={set("address")} placeholder="Street, area, city" /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Phone"><TextInput value={form.phone} onChange={set("phone")} placeholder="0522 …" /></Field>
            <Field label="Latitude"><TextInput type="number" step="0.0001" value={form.lat} onChange={set("lat")} placeholder="26.85" /></Field>
            <Field label="Longitude"><TextInput type="number" step="0.0001" value={form.lng} onChange={set("lng")} placeholder="80.94" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total beds"><TextInput type="number" min="0" value={form.totalBeds} onChange={set("totalBeds")} placeholder="120" /></Field>
            <Field label="Available now"><TextInput type="number" min="0" value={form.availableBeds} onChange={set("availableBeds")} placeholder="20" /></Field>
          </div>
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <Btn variant="outline" onClick={() => setReg(false)}>Cancel</Btn>
          <Btn disabled={!canRegister} onClick={submitReg}><Plus size={15} /> Register</Btn>
        </div>
      </Modal>

      <Modal open={!!beds} title={beds ? `Update beds — ${beds.name}` : ""} onClose={() => setBeds(null)}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Available beds"><TextInput type="number" min="0" value={bedForm.availableBeds} onChange={(e) => setBedForm((p) => ({ ...p, availableBeds: e.target.value }))} /></Field>
          <Field label="Total beds"><TextInput type="number" min="0" value={bedForm.totalBeds} onChange={(e) => setBedForm((p) => ({ ...p, totalBeds: e.target.value }))} /></Field>
        </div>
        <p className="text-xs text-slate-400 mt-2">Available is capped at total. Reporters see this the moment they pick an ambulance destination.</p>
        <div className="mt-5 flex gap-2 justify-end">
          <Btn variant="outline" onClick={() => setBeds(null)}>Cancel</Btn>
          <Btn onClick={submitBeds}><CheckCircle2 size={15} /> Save</Btn>
        </div>
      </Modal>
    </div>
  );
};
