import React from "react";
import { Siren, MapPin, User, Users, Activity, X, CheckCircle2, ChevronRight, ChevronLeft, Phone, Search, Eye, Navigation, Cpu, ShieldCheck, ListChecks, Hospital } from "lucide-react";
import { cx, fmtDT, fmtD, timeAgo, SERVICES, RESPONDER_INSTRUCTIONS, haversineKm } from "../../utils/constants";
import { Btn, Card, Pill, StatusPill, SeverityPill, ServicePill, StatCard, Skeleton, EmptyState } from "../../components/ui";
import { MapPreview, TimelineView, HospitalSummary } from "../../components/shared";

const respDistance = (responder, r) =>
  responder?.base ? haversineKm(responder.base, { lat: r.lat, lng: r.lng }).toFixed(1) : null;

const relevantToResponder = (responder, r) =>
  r.recommendedService === responder.department && !r.rejectedBy?.includes(responder.id);

const EmergencyAlertCard = ({ responder, r, onAccept, onReject, onView, busy }) => {
  const km = respDistance(responder, r);
  return (
    <Card className="p-5 border-l-4 border-l-red-600">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 font-extrabold text-red-600 text-sm tracking-wide">
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-red-500 animate-ping opacity-70" />
            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-red-600" />
          </span>
          🚨 NEW EMERGENCY
        </div>
        <span className="text-xs text-slate-400 font-semibold">{timeAgo(r.timeline.SERVICE_NOTIFIED || r.createdAt)}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-bold text-slate-900">{r.id}</span>
        <Pill className="bg-slate-100 text-slate-700">{r.aiDetectedType}</Pill>
        <SeverityPill sev={r.severity} />
        {km && <Pill className="bg-blue-50 text-blue-700"><Navigation size={11} /> {km} km</Pill>}
      </div>
      <div className="mt-2 text-sm text-slate-600 flex items-center gap-1.5"><MapPin size={13} className="text-red-500 shrink-0" /> {r.address}</div>
      <div className="mt-1 text-xs text-slate-500">Reported {fmtDT(r.createdAt)} · {r.peopleAffected} affected</div>
      {r.selectedHospital && (
        <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1"><Hospital size={12} /> Destination: {r.selectedHospital.name}</div>
      )}
      <div className="mt-4 flex gap-2 flex-wrap">
        <Btn variant="primary" disabled={busy} onClick={() => onAccept(r.id)}><CheckCircle2 size={15} /> ACCEPT</Btn>
        <Btn variant="danger" disabled={busy} onClick={() => onReject(r.id)}><X size={15} /> REJECT</Btn>
        <Btn variant="outline" onClick={() => onView(r.id)}><Eye size={15} /> VIEW DETAILS</Btn>
      </div>
    </Card>
  );
};

export const ResponderDashboard = ({ user, db, go, onAccept, onReject, busy }) => {
  const fresh = db.reports.filter((r) => r.status === "SERVICE_NOTIFIED" && relevantToResponder(user, r));
  const mine = db.reports.filter((r) => r.assignedResponderId === user.id);
  const accepted = mine.filter((r) => r.status === "ACCEPTED").length;
  const enroute = mine.filter((r) => ["ON_THE_WAY", "ARRIVED"].includes(r.status)).length;
  const completed = mine.filter((r) => r.status === "COMPLETED").length;


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Siren} label="New Emergencies" value={fresh.length} tone="red" />
        <StatCard icon={CheckCircle2} label="Accepted" value={accepted} tone="blue" />
        <StatCard icon={Navigation} label="On The Way / Arrived" value={enroute} tone="amber" />
        <StatCard icon={ShieldCheck} label="Completed" value={completed} tone="green" />
      </div>

      <Card className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={cx("w-10 h-10 rounded-xl flex items-center justify-center", SERVICES[user.department].pill)}>
            {React.createElement(SERVICES[user.department].icon, { size: 20 })}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{user.unit}</div>
            <div className="text-xs text-slate-500">{SERVICES[user.department].label} responder · status <b className="text-emerald-600">{user.availability}</b></div>
          </div>
        </div>
        <Pill className="bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> On duty</Pill>
      </Card>

      <div>
        <h3 className="font-extrabold text-slate-900 mb-3">Incoming emergency requests</h3>
        <div className="space-y-3">
          {fresh.length === 0 && (
            <Card><EmptyState icon={Siren} title="No new emergencies" note="New reports matching your service are pushed here instantly (FCM in production)." /></Card>
          )}
          {fresh.map((r) => (
            <EmergencyAlertCard key={r.id} responder={user} r={r} busy={busy}
              onAccept={onAccept} onReject={onReject} onView={(id) => go("r.detail", { id })} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ResponderRequestsPage = ({ user, db, go, onAccept, onReject, busy }) => {
  const fresh = db.reports
    .filter((r) => r.status === "SERVICE_NOTIFIED" && relevantToResponder(user, r))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <div className="space-y-3">
      {fresh.length === 0 && <Card><EmptyState icon={Siren} title="Queue is clear" note="No emergencies are currently waiting for your service." /></Card>}
      {fresh.map((r) => (
        <EmergencyAlertCard key={r.id} responder={user} r={r} busy={busy}
          onAccept={onAccept} onReject={onReject} onView={(id) => go("r.detail", { id })} />
      ))}
    </div>
  );
};

const NEXT_STATUS = { ACCEPTED: "ON_THE_WAY", ON_THE_WAY: "ARRIVED", ARRIVED: "COMPLETED" };
const NEXT_LABEL = { ACCEPTED: "Mark ON THE WAY", ON_THE_WAY: "Mark ARRIVED", ARRIVED: "Mark COMPLETED" };

export const ResponderActivePage = ({ user, db, go, onStatus, busy }) => {
  const active = db.reports
    .filter((r) => r.assignedResponderId === user.id && ["ACCEPTED", "ON_THE_WAY", "ARRIVED"].includes(r.status))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <div className="space-y-4">
      {active.length === 0 && <Card><EmptyState icon={Activity} title="No active emergencies" note="Accept a request to start responding — it will appear here with live status controls." /></Card>}
      {active.map((r) => (
        <Card key={r.id} className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-extrabold text-slate-900">{r.id}</span>
              <Pill className="bg-slate-100 text-slate-700">{r.aiDetectedType}</Pill>
              <SeverityPill sev={r.severity} />
            </div>
            <StatusPill status={r.status} />
          </div>
          <div className="mt-2 text-sm text-slate-600 flex items-center gap-1.5"><MapPin size={13} className="text-red-500" /> {r.address}</div>
          {r.selectedHospital && (
            <div className="mt-1.5 text-sm text-slate-600 flex items-center gap-1.5"><Hospital size={13} className="text-emerald-600 shrink-0" /> Destination: <b className="text-slate-800">{r.selectedHospital.name}</b> <span className="text-xs text-slate-400">({r.selectedHospital.availableBeds > 0 ? r.selectedHospital.availableBeds + " beds free" : "no beds free"})</span></div>
          )}
          <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
            <TimelineView report={r} compact />
            <div className="space-y-2.5">
              {/* PUT /api/emergencies/{id}/status */}
              <Btn className="w-full" size="lg" disabled={busy} onClick={() => onStatus(r.id, NEXT_STATUS[r.status])}>
                <Navigation size={17} /> {NEXT_LABEL[r.status]}
              </Btn>
              <Btn variant="outline" className="w-full" onClick={() => go("r.detail", { id: r.id })}><Eye size={15} /> Case details</Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export const ResponderCompletedPage = ({ user, db, go }) => {
  const done = db.reports
    .filter((r) => r.assignedResponderId === user.id && r.status === "COMPLETED")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <div className="space-y-3">
      {done.length === 0 && <Card><EmptyState icon={CheckCircle2} title="No completed cases yet" /></Card>}
      {done.map((r) => (
        <button key={r.id} onClick={() => go("r.detail", { id: r.id })} className="w-full text-left">
          <Card className="p-4 flex flex-wrap items-center justify-between gap-3 hover:border-emerald-300">
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm">{r.id} · {r.aiDetectedType}</div>
                <div className="text-xs text-slate-500 truncate">{r.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SeverityPill sev={r.severity} />
              <span className="text-xs text-slate-400">{fmtD(r.timeline.COMPLETED || r.createdAt)}</span>
              <ChevronRight size={15} className="text-slate-300" />
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
};

export const ResponderDetailPage = ({ user, db, params, go, onAccept, onReject, onStatus, busy }) => {
  const r = db.reports.find((x) => x.id === params?.id);
  if (!r) return <Card><EmptyState icon={Search} title="Emergency not found" /></Card>;
  const reporter = db.users.find((u) => u.id === r.userId) || db.admins.find((u) => u.id === r.userId);
  const isMine = r.assignedResponderId === user.id;
  const canAct = r.status === "SERVICE_NOTIFIED" && relevantToResponder(user, r);
  const km = respDistance(user, r);
  return (
    <div className="space-y-5">
      <button onClick={() => go("r.dashboard")} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"><ChevronLeft size={15} /> Back</button>
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-extrabold text-slate-900">{r.id}</h2>
            <StatusPill status={r.status} />
            <SeverityPill sev={r.severity} />
            {km && <Pill className="bg-blue-50 text-blue-700"><Navigation size={11} /> {km} km away</Pill>}
          </div>
          <div className="flex gap-2">
            {canAct && (
              <>
                <Btn variant="primary" disabled={busy} onClick={() => onAccept(r.id)}><CheckCircle2 size={15} /> ACCEPT</Btn>
                <Btn variant="danger" disabled={busy} onClick={() => onReject(r.id)}><X size={15} /> REJECT</Btn>
              </>
            )}
            {isMine && NEXT_STATUS[r.status] && (
              <Btn disabled={busy} onClick={() => onStatus(r.id, NEXT_STATUS[r.status])}><Navigation size={15} /> {NEXT_LABEL[r.status]}</Btn>
            )}
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <Card className="overflow-hidden">
            <img src={r.imageUrl} alt="Accident scene" className="w-full max-h-72 object-cover" />
            <div className="px-4 py-3 border-t border-slate-100 text-sm">
              <div className="font-semibold text-slate-900">Reporter's description</div>
              <p className="text-slate-600 mt-1">{r.description}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-slate-900 flex items-center gap-2"><Cpu size={16} className="text-red-600" /> AI analysis</div>
              <Pill className="bg-slate-100 text-slate-700 border border-slate-200">Mock YOLO</Pill>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Pill className="bg-slate-100 text-slate-700">{r.aiDetectedType}</Pill>
              <SeverityPill sev={r.severity} />
              <Pill className="bg-emerald-100 text-emerald-700">{Math.round(r.aiConfidence * 100)}% confidence</Pill>
              <ServicePill svc={r.recommendedService} />
            </div>
          </Card>
          <MapPreview lat={r.lat} lng={r.lng} label={r.address} />
        </div>
        <div className="lg:col-span-2 space-y-5">
          {r.selectedHospital && (
            <Card className="p-5">
              <div className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Hospital size={16} className="text-emerald-600" /> Destination hospital</div>
              <HospitalSummary hospital={r.selectedHospital} db={db} />
            </Card>
          )}
          <Card className="p-5">
            <div className="font-bold text-slate-900 mb-3">Reporter</div>
            <div className="text-sm space-y-1.5 text-slate-600">
              <div className="font-semibold text-slate-900">{reporter?.name || "User"}</div>
              <div className="flex items-center gap-1.5"><Phone size={13} /> {reporter?.phone || "—"}</div>
              <div className="flex items-center gap-1.5"><Users size={13} /> {r.peopleAffected} people affected</div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="font-bold text-slate-900 mb-3 flex items-center gap-2"><ListChecks size={16} className="text-red-600" /> Emergency instructions</div>
            <ol className="space-y-2.5">
              {RESPONDER_INSTRUCTIONS[r.recommendedService].map((t, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-md bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </Card>
          <Card className="p-5">
            <div className="font-bold text-slate-900 mb-3">Timeline</div>
            <TimelineView report={r} compact />
          </Card>
        </div>
      </div>
    </div>
  );
};
