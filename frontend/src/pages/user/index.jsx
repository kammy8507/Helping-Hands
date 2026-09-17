import React, { useState, useEffect, useRef } from "react";
import { Flame, Siren, AlertTriangle, MapPin, Bell, User, FileText, Activity, Camera, Upload, CheckCircle2, Clock, ChevronRight, ChevronLeft, Phone, Mail, Search, Trash2, Eye, Cpu, Car, RefreshCw, ImageIcon, Crosshair, ListChecks, Hospital, Navigation, Check, X } from "lucide-react";
import { cx, delay, fmtDT, timeAgo, STATUS_FLOW, STATUS, SERVICES, ACCIDENT_TYPES, haversineKm } from "../../utils/constants";
import { aiAnalyze, getBrowserLocation } from "../../services";
import { Btn, Card, Pill, StatusPill, SeverityPill, ServicePill, Eyebrow, StatCard, Field, TextInput, TextArea, Select, Spinner, Skeleton, EmptyState, Alert } from "../../components/ui";
import { MapPreview, TimelineView, HospitalSummary, bedTone } from "../../components/shared";
import GoogleLocationPicker from "../../components/GoogleLocationPicker";

const useFakeLoad = (ms = 500) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
};

export const ReportRow = ({ r, onOpen }) => (
  <button onClick={() => onOpen(r.id)} className="w-full text-left">
    <Card className="p-4 hover:border-red-300 transition-colors">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            {r.accidentType === "Fire" ? <Flame size={19} className="text-orange-500" /> : <Car size={19} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm">{r.id}</span>
              <span className="text-xs text-slate-400">{fmtDT(r.createdAt)}</span>
            </div>
            <div className="text-sm text-slate-600 truncate flex items-center gap-1.5">
              <MapPin size={12} className="text-red-500 shrink-0" /> {r.address}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Pill className="bg-slate-100 text-slate-700">{r.accidentType}</Pill>
          <SeverityPill sev={r.severity} />
          <ServicePill svc={r.recommendedService} />
          <StatusPill status={r.status} />
          <ChevronRight size={16} className="text-slate-300" />
        </div>
      </div>
    </Card>
  </button>
);

export const UserDashboard = ({ user, db, go }) => {
  const loading = useFakeLoad(450);
  const mine = db.reports.filter((r) => r.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const active = mine.filter((r) => !["COMPLETED"].includes(r.status));
  const done = mine.filter((r) => r.status === "COMPLETED");
  const pending = mine.filter((r) => ["SUBMITTED", "AI_COMPLETED", "SERVICE_NOTIFIED"].includes(r.status));

  if (loading)
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
        <Skeleton className="h-36" /><Skeleton className="h-24" /><Skeleton className="h-24" />
      </div>
    );

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden px-6 py-7 sm:px-10 sm:py-8" style={{ background: "linear-gradient(120deg,#E7F1EC,#ffffff 60%)" }}>
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Seconds count. Reports <span className="text-emerald-600">shouldn’t take minutes.</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Your account is ready. Report an accident quickly when help is needed.
          </p>
          <div className="mt-6">
            <button
              onClick={() => go("u.report")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold px-7 py-3.5 shadow-sm transition-colors"
            >
              <Siren size={19} /> Report an Accident
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Reports" value={mine.length} />
        <StatCard icon={Siren} label="Active Emergencies" value={active.length} tone="red" />
        <StatCard icon={CheckCircle2} label="Completed Reports" value={done.length} tone="green" />
        <StatCard icon={Clock} label="Pending Reports" value={pending.length} tone="amber" />
      </div>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Eyebrow>Emergency ready</Eyebrow>
            <h3 className="mt-1 text-lg font-extrabold text-slate-900">Need help right now?</h3>
            <p className="mt-1 text-sm text-slate-600">Your report can include a photo, GPS location and AI-assisted triage.</p>
          </div>
          <button onClick={() => go("u.report")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 transition-colors shrink-0 shadow-sm">
            <Siren size={18} /> Report accident
          </button>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-slate-900">Recent reports</h3>
          <button onClick={() => go("u.reports")} className="text-sm font-semibold text-red-600 hover:text-red-700">View all →</button>
        </div>
        <div className="space-y-3">
          {mine.length === 0 && (
            <Card><EmptyState icon={FileText} title="No reports yet" note="Your submitted accident reports will appear here." /></Card>
          )}
          {mine.slice(0, 4).map((r) => (
            <ReportRow key={r.id} r={r} onOpen={(id) => go("u.reportDetail", { id })} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const MyReportsPage = ({ user, db, go }) => {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const mine = db.reports.filter((r) => r.userId === user.id)
    .filter((r) => status === "ALL" || r.status === status)
    .filter((r) => (r.id + r.address + r.accidentType).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <TextInput className="pl-10" placeholder="Search by ID, location or type…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-64"
          options={[{ value: "ALL", label: "All statuses" }, ...STATUS_FLOW.map((s) => ({ value: s, label: STATUS[s].label }))]} />
      </div>
      <div className="space-y-3">
        {mine.length === 0 && <Card><EmptyState icon={Search} title="No matching reports" note="Try a different search or status filter." /></Card>}
        {mine.map((r) => <ReportRow key={r.id} r={r} onOpen={(id) => go("u.reportDetail", { id })} />)}
      </div>
    </div>
  );
};

/* ─── Report Accident wizard — the core module ─────────────────── */

const WIZ_STEPS = [
  { key: "image", label: "Photo", icon: Camera },
  { key: "location", label: "Location", icon: MapPin },
  { key: "hospital", label: "Hospital", icon: Hospital },
  { key: "review", label: "Review", icon: ListChecks },
];

// Optional destination-hospital picker shown when AI routes to an ambulance.
const HospitalPicker = ({ db, lat, lng, selected, onSelect }) => {
  const nearby = (db?.hospitals || [])
    .filter((h) => h.active)
    .map((h) => ({ ...h, km: lat != null && lng != null ? haversineKm({ lat, lng }, { lat: h.lat, lng: h.lng }) : null }))
    .sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9))
    .slice(0, 5);
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 font-bold text-slate-900"><Hospital size={17} className="text-emerald-600" /> Nearby hospitals <span className="text-xs font-semibold text-slate-400">optional</span></div>
        {selected && <Btn size="sm" variant="ghost" onClick={() => onSelect(null)}><X size={14} /> Clear</Btn>}
      </div>
      <p className="text-sm text-slate-500 mt-1">Pick a destination hospital for the ambulance, or continue without one — the responder can decide on scene.</p>
      <div className="mt-4 space-y-2.5">
        {nearby.length === 0 && <div className="text-sm text-slate-500">No registered hospitals are available right now.</div>}
        {nearby.map((h) => {
          const isSel = selected?.id === h.id;
          return (
            <button key={h.id} type="button"
              onClick={() => onSelect({ id: h.id, name: h.name, address: h.address, phone: h.phone, availableBeds: h.availableBeds, totalBeds: h.totalBeds })}
              className={cx("w-full text-left rounded-xl border-2 p-3.5 transition-colors flex items-start gap-3",
                isSel ? "border-emerald-500 bg-emerald-50/60" : "border-slate-200 hover:border-emerald-300 bg-white")}>
              <div className={cx("w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center", isSel ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300")}>{isSel && <Check size={12} />}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="font-bold text-slate-900 text-sm">{h.name}</div>
                  <span className={cx("text-[11px] font-bold px-2 py-0.5 rounded-full border", bedTone(h.availableBeds))}>
                    {h.availableBeds > 0 ? `${h.availableBeds} / ${h.totalBeds} beds` : "No beds free"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{h.type}</div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={11} className="text-emerald-600" /> {h.address}</span>
                  {h.km != null && <span className="flex items-center gap-1"><Navigation size={11} /> {h.km.toFixed(1)} km</span>}
                  <span className="flex items-center gap-1"><Phone size={11} /> {h.phone}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AI_PHASES = [
  "Sending accident details to the server…",
  "Running server-side accident analysis…",
  "Classifying accident type…",
  "Estimating severity and confidence…",
  "Matching the right emergency service…",
];

export const ReportWizard = ({ user, db, onSubmitReport, go }) => {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    accidentType: "Road Accident", description: "", peopleAffected: "1", remarks: "",
    image: null, imageName: "", lat: null, lng: null, address: "", selectedHospital: null,
  });
  const [stepErr, setStepErr] = useState(null);

  // image state
  const [imgErr, setImgErr] = useState(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // location state
  const [locBusy, setLocBusy] = useState(false);
  const [locErr, setLocErr] = useState(null);
  const [manual, setManual] = useState(false);

  // AI state
  const [ai, setAi] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState(null);
  const [aiPhase, setAiPhase] = useState(0);

  // submit state
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  const set = (k) => (ev) => setF((p) => ({ ...p, [k]: ev.target.value }));

  const handleFile = (file) => {
    setImgErr(null);
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImgErr("Unsupported file. Please upload a JPG, JPEG, PNG or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImgErr("Image too large. Maximum size is 5 MB.");
      return;
    }
    setUploading(true);
    setUploadPct(0);
    const reader = new FileReader();
    reader.onerror = () => { setUploading(false); setImgErr("Could not read this file. Please try another image."); };
    reader.onload = () => {
      // simulate upload progress to the Spring Boot file endpoint
      let pct = 0;
      const iv = setInterval(() => {
        pct = Math.min(100, pct + 9 + Math.random() * 14);
        setUploadPct(Math.round(pct));
        if (pct >= 100) {
          clearInterval(iv);
          setUploading(false);
          setF((p) => ({ ...p, image: reader.result, imageName: file.name }));
          setAi(null);
          setTimeout(() => runAIForImage(reader.result, file.name), 0);
        }
      }, 110);
    };
    reader.readAsDataURL(file);
  };

  const useGPS = async () => {
    setLocBusy(true); setLocErr(null);
    try {
      const loc = await getBrowserLocation();
      setF((p) => ({ ...p, ...loc }));
    } catch (e) {
      setLocErr(e.message + " You can enter the coordinates and address manually.");
    } finally {
      setLocBusy(false);
    }
  };

  const runAIForImage = async (imageData = f.image, imageName = f.imageName) => {
    setAiBusy(true); setAiErr(null); setAi(null); setAiPhase(0);
    const iv = setInterval(() => setAiPhase((p) => Math.min(AI_PHASES.length - 1, p + 1)), 560);
    try {
      // POST /api/ai/analyze — Spring Boot forwards the image to the YOLO service
      const res = await aiAnalyze({ accidentType: f.accidentType, peopleAffected: f.peopleAffected, imageData, imageName });
      setAi(res);
    } catch (e) {
      setAiErr("AI service unavailable right now. You can retry, or submit the report and analysis will run on the server.");
    } finally {
      clearInterval(iv);
      setAiBusy(false);
    }
  };

  const validateStep = () => {
    setStepErr(null);
    if (step === 0 && !f.image) return setStepErr("Please upload an accident image to continue."), false;
    if (step === 1 && (f.lat == null || f.lng == null)) return setStepErr("Please share your location or enter it manually."), false;
    if (step === 2 && !ai) return setStepErr("Please wait for the photo assessment to finish."), false;
    return true;
  };
  const next = () => { if (validateStep()) setStep((s) => Math.min(3, s + 1)); };
  const back = () => { setStepErr(null); setStep((s) => Math.max(0, s - 1)); };

  const submit = async () => {
    setSubmitting(true);
    try {
      const id = await onSubmitReport({
        ...f,
        accidentType: ai?.accidentType || f.accidentType,
        description: f.description.trim() || `${ai?.accidentType || "Accident"} detected from the uploaded image${ai?.severity ? ` (severity: ${ai.severity})` : ""}.`,
        selectedHospital: ai?.recommendedService === "AMBULANCE" ? f.selectedHospital : null,
      }); // POST /api/accidents
      setSubmittedId(id);
    } catch (e) {
      setStepErr("Report submission failed. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId)
    return (
      <Card className="max-w-xl mx-auto p-8 text-center">
        <div className="relative w-16 h-16 mx-auto">
          <span className="absolute inset-0 rounded-full bg-emerald-200 animate-ping opacity-60" />
          <span className="relative w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={34} /></span>
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-slate-900">Emergency report submitted</h2>
        <p className="mt-2 text-sm text-slate-600">
          Report <span className="font-bold text-slate-900">{submittedId}</span> was saved successfully.
          The backend has analysed the report and routed it to the <span className="font-semibold">{SERVICES[ai?.recommendedService]?.label || "emergency"}</span> service.
        </p>
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <Btn size="lg" onClick={() => go("u.reportDetail", { id: submittedId })}><Activity size={17} /> Track emergency</Btn>
          <Btn size="lg" variant="outline" onClick={() => go("u.dashboard")}>Back to dashboard</Btn>
        </div>
      </Card>
    );

  return (
    <div className="max-w-3xl space-y-5">
      {/* progress */}
      <div className="flex items-center">
        {WIZ_STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={cx("w-9 h-9 rounded-xl flex items-center justify-center border-2",
                i < step ? "bg-emerald-500 border-emerald-500 text-white" :
                i === step ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-300 text-slate-400")}>
                {i < step ? <CheckCircle2 size={17} /> : <s.icon size={16} />}
              </div>
              <span className={cx("text-[10px] sm:text-[11px] font-bold tracking-wide uppercase", i === step ? "text-emerald-700" : "text-slate-400")}>{s.label}</span>
            </div>
            {i < WIZ_STEPS.length - 1 && <div className={cx("flex-1 h-0.5 mx-1 sm:mx-2 mb-5", i < step ? "bg-emerald-500" : "bg-slate-200")} />}
          </React.Fragment>
        ))}
      </div>

      {stepErr && <Alert>{stepErr}</Alert>}

      {/* STEP 1 · IMAGE */}
      {step === 0 && (
        <Card className="p-6 space-y-5">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">Upload accident image</h2>
            <p className="text-sm text-slate-500">One clear photo of the scene. JPG, JPEG or PNG · up to 5 MB.</p>
          </div>
          {imgErr && <Alert>{imgErr}</Alert>}
          {!f.image && !uploading && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
              onClick={() => fileRef.current?.click()}
              className={cx("rounded-2xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors",
                dragOver ? "border-red-500 bg-red-50" : "border-slate-300 hover:border-red-400 hover:bg-slate-50")}>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])} />
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center"><Upload size={26} /></div>
              <div className="mt-4 font-bold text-slate-900">Choose an accident photo</div>
              <div className="mt-4 flex justify-center gap-3 flex-wrap"><Btn type="button" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}><Upload size={16}/> Upload photo</Btn><Btn type="button" variant="outline" onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}><Camera size={16}/> Take photo</Btn></div>
            </div>
          )}
          {uploading && (
            <div className="rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700"><Spinner className="text-red-600" /> Uploading image… {uploadPct}%</div>
              <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: uploadPct + "%" }} />
              </div>
            </div>
          )}
          {f.image && !uploading && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <img src={f.image} alt="Accident preview" className="w-full max-h-72 object-cover" />
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 min-w-0">
                  <ImageIcon size={16} className="text-emerald-500 shrink-0" /><span className="truncate">{f.imageName}</span>
                </div>
                <Btn size="sm" variant="danger" onClick={() => { setF((p) => ({ ...p, image: null, imageName: "" })); setAi(null); }}>
                  <Trash2 size={14} /> Remove
                </Btn>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* STEP 2 · LOCATION */}
      {step === 1 && (
        <Card className="p-6 space-y-5">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">Accident location</h2>
            <p className="text-sm text-slate-500">Use your current location, then adjust the pin on the map if needed.</p>
          </div>
          {locErr && <Alert>{locErr}</Alert>}
          <div className="flex flex-wrap gap-2.5">
            <Btn onClick={useGPS} disabled={locBusy}>
              {locBusy ? <><Spinner /> Detecting…</> : <><Crosshair size={16} /> Use my current location</>}
            </Btn>
            <Btn variant="ghost" onClick={() => setManual(!manual)}>Edit location</Btn>
          </div>
          {manual && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Latitude"><TextInput type="number" step="0.000001" value={f.lat ?? ""} onChange={(e) => setF((p) => ({ ...p, lat: e.target.value === "" ? null : +e.target.value }))} placeholder="26.8467" /></Field>
              <Field label="Longitude"><TextInput type="number" step="0.000001" value={f.lng ?? ""} onChange={(e) => setF((p) => ({ ...p, lng: e.target.value === "" ? null : +e.target.value }))} placeholder="80.9462" /></Field>
              <div className="sm:col-span-2"><Field label="Address / landmark"><TextInput value={f.address} onChange={set("address")} placeholder="e.g. Near Hazratganj Crossing, Lucknow" /></Field></div>
            </div>
          )}
          {f.lat != null && f.lng != null && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5"><div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Latitude</div><div className="font-bold text-slate-900">{Number(f.lat).toFixed(6)}</div></div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5"><div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Longitude</div><div className="font-bold text-slate-900">{Number(f.lng).toFixed(6)}</div></div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 sm:col-span-1"><div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Address</div><div className="font-semibold text-slate-700 text-xs leading-snug">{f.address || "Location selected"}</div></div>
              </div>
              <GoogleLocationPicker lat={f.lat} lng={f.lng} onChange={({lat,lng}) => setF((p) => ({...p, lat, lng}))} />
            </div>
          )}
        </Card>
      )}

      {/* STEP 3 · AI ANALYSIS */}
      {step === 2 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">Accident analysis</h2>
              <p className="text-sm text-slate-500">Your photo is assessed automatically after you choose it.</p>
            </div>
            <Pill className="bg-slate-100 text-slate-700 border border-slate-200 shrink-0">Assessment complete</Pill>
          </div>
          {aiErr && <Alert>{aiErr}</Alert>}

          {!ai && !aiBusy && (
            <div className="rounded-2xl border border-slate-200 p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Cpu size={26} /></div>
              <p className="mt-4 text-sm text-slate-600 max-w-md mx-auto">
                This calls <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">POST /api/accidents/analyze</span>.
                The backend is the source of truth for severity and emergency-service routing.
              </p>
              <Btn className="mt-5" size="lg" onClick={() => runAIForImage()}><Cpu size={17} /> {aiErr ? "Try again" : "Check photo"}</Btn>
            </div>
          )}

          {aiBusy && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="relative">
                <img src={f.image} alt="Analyzing" className="w-full max-h-64 object-cover opacity-70" />
                <div className="absolute inset-0 bg-slate-950/45" />
                <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500 animate-pulse" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <Spinner size={30} className="text-emerald-300" />
                  <div className="mt-3 font-bold">Analyzing accident image…</div>
                  <div className="text-xs text-slate-300 mt-1">{AI_PHASES[aiPhase]}</div>
                </div>
              </div>
              <div className="px-4 py-2.5 bg-slate-50 text-[11px] text-slate-500 border-t border-slate-200">
                Analysis is performed by the Spring Boot backend before the report is stored.
              </div>
            </div>
          )}

          {ai && (
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-extrabold text-slate-900"><CheckCircle2 size={19} className="text-emerald-500" /> Accident detected</div>
                <Pill className="bg-slate-100 text-slate-700 border border-slate-200">Server result</Pill>
              </div>
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-slate-200 p-3"><div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</div><div className="font-bold text-slate-900 text-sm mt-0.5">{ai.accidentType}</div></div>
                <div className="bg-white rounded-xl border border-slate-200 p-3"><div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Severity</div><div className="mt-1"><SeverityPill sev={ai.severity} /></div></div>
                                <div className="bg-white rounded-xl border border-slate-200 p-3"><div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recommended</div><div className="mt-1"><ServicePill svc={ai.recommendedService} /></div></div>
              </div>
              <p className="mt-3 text-sm text-slate-600">Recommended next step: contact the suggested emergency service if immediate help is required.</p>
              <Btn size="sm" variant="ghost" className="mt-2" onClick={() => runAIForImage()}><RefreshCw size={14} /> Check again</Btn>
            </div>
          )}

          {ai && ai.recommendedService === "AMBULANCE" && (
            <HospitalPicker db={db} lat={f.lat} lng={f.lng}
              selected={f.selectedHospital}
              onSelect={(h) => setF((p) => ({ ...p, selectedHospital: h }))} />
          )}
        </Card>
      )}

      {/* STEP 4 · REVIEW & SUBMIT */}
      {step === 3 && ai && (
        <Card className="p-6 space-y-5">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">Review &amp; submit</h2>
            <p className="text-sm text-slate-500">Confirm the details — the emergency service is notified on submit.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <img src={f.image} alt="Accident" className="rounded-xl border border-slate-200 object-cover w-full h-44" />
            <MapPreview lat={f.lat} lng={f.lng} label={f.address} className="h-full" />
          </div>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm">
            {[
              ["Detected type", ai.accidentType],
              ["Severity", ai.severity],
              ["Recommended service", SERVICES[ai.recommendedService].label],
              ["Location", f.address || `${Number(f.lat).toFixed(5)}, ${Number(f.lng).toFixed(5)}`],
              f.selectedHospital
                ? ["Destination hospital", `${f.selectedHospital.name} · ${f.selectedHospital.availableBeds > 0 ? f.selectedHospital.availableBeds + " beds free" : "no beds free"}`]
                : (ai.recommendedService === "AMBULANCE" ? ["Destination hospital", "Not selected — responder decides on scene"] : null),
              ["Reported by", user.name],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="flex gap-4 px-4 py-2.5">
                <div className="w-36 shrink-0 font-semibold text-slate-500">{k}</div>
                <div className="text-slate-900 font-medium">{v}</div>
              </div>
            ))}
          </div>
          <button onClick={submit} disabled={submitting}
            className="w-full rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-extrabold text-base py-4 flex items-center justify-center gap-2.5 shadow-lg shadow-red-200">
            {submitting ? <><Spinner size={20} /> Submitting emergency report…</> : <><Siren size={20} /> SUBMIT EMERGENCY REPORT</>}
          </button>
        </Card>
      )}

      <div className="flex justify-between">
        <Btn variant="outline" onClick={back} disabled={step === 0 || submitting}><ChevronLeft size={16} /> Back</Btn>
        {step < 3 && <Btn onClick={next}>Continue <ChevronRight size={16} /></Btn>}
      </div>
    </div>
  );
};

/* ─── Report detail & emergency tracking ───────────────────────── */

const findResponder = (db, id) => db.responders.find((r) => r.id === id);

export const ReportDetailPage = ({ db, params, go, backRoute = "u.reports" }) => {
  const r = db.reports.find((x) => x.id === params?.id);
  if (!r)
    return <Card><EmptyState icon={Search} title="Report not found" note="It may have been removed, or the link is stale." /></Card>;
  const responder = findResponder(db, r.assignedResponderId);
  const S = SERVICES[r.recommendedService];
  return (
    <div className="space-y-5">
      <button onClick={() => go(backRoute)} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"><ChevronLeft size={15} /> Back</button>
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900">{r.id}</h2>
              <StatusPill status={r.status} />
            </div>
            <div className="mt-1 text-sm text-slate-500">{fmtDT(r.createdAt)} · reported by {[...db.users, ...db.admins].find((u) => u.id === r.userId)?.name || "User"}</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Pill className="bg-slate-100 text-slate-700">{r.accidentType}</Pill>
            <SeverityPill sev={r.severity} />
            <ServicePill svc={r.recommendedService} />
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <Card className="overflow-hidden">
            <img src={r.imageUrl} alt="Accident scene" className="w-full max-h-72 object-cover" />
            <div className="px-4 py-3 border-t border-slate-100">
              <div className="text-sm font-semibold text-slate-900">Reporter's description</div>
              <p className="text-sm text-slate-600 mt-1">{r.description}</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span>People affected: <b className="text-slate-700">{r.peopleAffected}</b></span>
                {r.remarks && <span>Remarks: <b className="text-slate-700">{r.remarks}</b></span>}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-slate-900 flex items-center gap-2"><Cpu size={17} className="text-red-600" /> Photo assessment</div>
              <Pill className="bg-slate-100 text-slate-700 border border-slate-200">Server analysis</Pill>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><div className="text-[11px] font-bold text-slate-400 uppercase">Detected</div><div className="font-bold text-slate-900 mt-0.5">{r.aiDetectedType}</div></div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><div className="text-[11px] font-bold text-slate-400 uppercase">Severity</div><div className="mt-1"><SeverityPill sev={r.severity} /></div></div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><div className="text-[11px] font-bold text-slate-400 uppercase">Confidence</div><div className="font-bold text-slate-900 mt-0.5">{Math.round(r.aiConfidence * 100)}%</div></div>
            </div>
          </Card>

          <div>
            <div className="font-bold text-slate-900 mb-2 flex items-center gap-2"><MapPin size={17} className="text-red-600" /> Location</div>
            <MapPreview lat={r.lat} lng={r.lng} label={r.address} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <div className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity size={17} className="text-red-600" /> Response timeline</div>
            <TimelineView report={r} />
          </Card>
          <Card className="p-5">
            <div className="font-bold text-slate-900 mb-3">Assigned response</div>
            <div className="flex items-center gap-3">
              <div className={cx("w-11 h-11 rounded-xl flex items-center justify-center", S.pill)}><S.icon size={21} /></div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{S.label}</div>
                <div className="text-xs text-slate-500">Emergency line: {S.phone}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              {responder ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                    {responder.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{responder.name}</div>
                    <div className="text-xs text-slate-500 truncate">{responder.unit}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500"><Spinner size={15} className="text-amber-500" /> Waiting for a responder to accept…</div>
              )}
            </div>
          </Card>
          {r.selectedHospital && (
            <Card className="p-5">
              <div className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Hospital size={17} className="text-emerald-600" /> Destination hospital</div>
              <HospitalSummary hospital={r.selectedHospital} db={db} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export const EmergencyStatusPage = ({ user, db, go }) => {
  const active = db.reports
    .filter((r) => r.userId === user.id && r.status !== "COMPLETED")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <div className="space-y-4">
      {active.length === 0 && (
        <Card><EmptyState icon={Activity} title="No active emergencies" note="When you submit a report, its live response status appears here." /></Card>
      )}
      {active.map((r) => (
        <Card key={r.id} className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-extrabold text-slate-900">{r.id}</span>
              <SeverityPill sev={r.severity} />
              <ServicePill svc={r.recommendedService} />
            </div>
            <StatusPill status={r.status} />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <TimelineView report={r} compact />
            <div className="space-y-3">
              <MapPreview lat={r.lat} lng={r.lng} label={r.address} />
              {r.selectedHospital && (
                <div className="text-xs text-slate-600 flex items-center gap-1.5"><Hospital size={13} className="text-emerald-600 shrink-0" /> Destination: <b className="text-slate-800">{r.selectedHospital.name}</b></div>
              )}
              <Btn variant="outline" className="w-full" onClick={() => go("u.reportDetail", { id: r.id })}><Eye size={15} /> Full details</Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ─── Shared: notifications & profile ──────────────────────────── */

export const NotificationsPage = ({ items, onRead, onReadAll }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-500">{items.filter((n) => !n.isRead).length} unread of {items.length}</div>
      <Btn size="sm" variant="outline" onClick={onReadAll}><CheckCircle2 size={14} /> Mark all read</Btn>
    </div>
    <div className="space-y-2.5">
      {items.length === 0 && <Card><EmptyState icon={Bell} title="No notifications" note="Emergency events — assignments, acceptances, status changes — appear here (FCM push in production)." /></Card>}
      {items.map((n) => (
        <Card key={n.id} className={cx("p-4 flex items-start gap-3", !n.isRead && "border-red-200 bg-red-50/40")}>
          <div className={cx("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            n.notificationType === "NEW_EMERGENCY" ? "bg-red-100 text-red-600" :
            n.notificationType === "ACCEPTED" ? "bg-blue-100 text-blue-600" :
            n.notificationType === "COMPLETED" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500")}>
            {n.notificationType === "NEW_EMERGENCY" ? <Siren size={17} /> : n.notificationType === "COMPLETED" ? <CheckCircle2 size={17} /> : <Bell size={17} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-slate-900 truncate">{n.title}</div>
              <div className="text-[11px] text-slate-400 shrink-0">{timeAgo(n.createdAt)}</div>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
            {n.reportId && <div className="text-[11px] font-semibold text-slate-400 mt-1">Report {n.reportId}</div>}
          </div>
          {!n.isRead && <Btn size="sm" variant="ghost" onClick={() => onRead(n.id)}>Mark read</Btn>}
        </Card>
      ))}
    </div>
  </div>
);

export const ProfilePage = ({ user, onSave, toast }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    await delay(600); // PUT /api/users/me
    try {
      await onSave({ name: name.trim() || user.name, phone: phone.trim() || user.phone });
      toast("Profile updated", "success");
    } catch (err) {
      toast(err.message || "Unable to update profile", "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="max-w-xl space-y-5">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-lg font-extrabold">
            {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="font-extrabold text-slate-900">{user.name}</div>
            <div className="text-sm text-slate-500 flex items-center gap-1.5"><Mail size={13} /> {user.email}</div>
            <Pill className="bg-slate-100 text-slate-700 mt-1.5">{user.role}{user.department ? ` · ${SERVICES[user.department]?.label}` : ""}</Pill>
          </div>
        </div>
      </Card>
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-slate-900">Edit profile</h3>
        <Field label="Full name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Phone number"><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <Field label="Email" hint="Email changes require re-verification — disabled."><TextInput value={user.email} disabled className="opacity-60" /></Field>
        <Btn onClick={save} disabled={saving}>{saving ? <><Spinner /> Saving…</> : "Save changes"}</Btn>
      </Card>
    </div>
  );
};
