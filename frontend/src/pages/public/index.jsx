import React, { useState } from "react";
import { Ambulance, Shield, Flame, Siren, MapPin, Bell, User, FileText, Activity, Menu, X, Camera, ChevronLeft, Phone, Lock, ArrowRight, Cpu, Radio, Car, ShieldCheck, Crosshair, ListChecks, Navigation, LifeBuoy, Stethoscope, MapPinned, Users, CheckCircle2 } from "lucide-react";
import { cx, ROLES, SERVICES } from "../../utils/constants";
import { Btn, Card, Pill, Eyebrow, Field, TextInput, Select, Spinner, Alert, Modal, StatusPill, SeverityPill, ServicePill } from "../../components/ui";
import { BrandMark, MapPreview, TimelineView } from "../../components/shared";

const iso = (minAgo) => new Date(Date.now() - minAgo * 60000).toISOString();

const NAV_LINKS = [
  { label: "Home", anchor: "top" },
  { label: "How it works", anchor: "how" },
  { label: "Services", anchor: "services" },
  { label: "About", anchor: "about" },
  { label: "Contact", anchor: "contact" },
];

/* ── shared landing building blocks ──────────────────────────────────
   One card system + one icon-container treatment so every informational
   section (features, services, steps, trust) reads as the same family. */
const ICON_BADGE = "w-12 h-12 rounded-xl flex items-center justify-center shrink-0";

const SectionIntro = ({ eyebrow, title, children }) => (
  <div className="max-w-2xl">
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{title}</h2>
    {children && <p className="mt-3 text-base leading-relaxed text-slate-600">{children}</p>}
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <Card className="p-6">
    <div className={cx(ICON_BADGE, "bg-emerald-50 text-emerald-700")}><Icon size={22} /></div>
    <h3 className="mt-4 font-bold text-slate-900 text-lg">{title}</h3>
    <p className="mt-2 text-base leading-relaxed text-slate-600">{desc}</p>
  </Card>
);

const StepCard = ({ n, title, desc }) => (
  <Card className="p-6">
    <div className={cx(ICON_BADGE, "bg-emerald-500 text-white font-mono text-lg font-bold")}>{n}</div>
    <h3 className="mt-4 font-bold text-slate-900 text-lg">{title}</h3>
    <p className="mt-2 text-base leading-relaxed text-slate-600">{desc}</p>
  </Card>
);

/* Service card — icon, name, emergency number and description stacked in a
   clear top-to-bottom hierarchy so the number stays tied to its service. */
const ServiceCard = ({ svc }) => {
  const S = SERVICES[svc];
  const Icon = S.icon;
  return (
    <Card className="p-6">
      <div className={cx(ICON_BADGE, "bg-emerald-50", S.tint)}><Icon size={23} /></div>
      <h3 className="mt-4 font-bold text-slate-900 text-lg">{S.label}</h3>
      <div className="mt-2 font-mono text-3xl font-extrabold text-slate-900 leading-none">{S.phone}</div>
      <div className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Emergency helpline</div>
      <p className="mt-3 text-base leading-relaxed text-slate-600">{S.desc}</p>
    </Card>
  );
};

/* ── official utility strip ─────────────────────────────────────────── */
const GovBar = () => (
  <div className="bg-emerald-700 text-emerald-50">
    <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center gap-4 text-xs flex-wrap">
      <span className="hh-livedot" style={{ width: 6, height: 6, background: "#8FD3AC" }} />
      <b className="text-white font-semibold">Official emergency response system</b>
      <span className="w-1 h-1 rounded-full bg-emerald-400/70 hidden sm:inline" />
      <span className="hidden sm:inline">Life-threatening emergency? Call <b className="font-mono text-white">112</b> immediately.</span>
      <span className="ml-auto hidden md:flex items-center gap-4 font-mono">
        <span>Ambulance 108</span><span>Police 112</span><span>Fire 101</span>
      </span>
    </div>
  </div>
);

const PublicNavbar = ({ go, scrollTo }) => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white/90 border-b border-slate-200 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button onClick={() => scrollTo("top")} className="shrink-0" aria-label="HelpingHands home"><BrandMark /></button>
        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <button key={l.label} onClick={() => scrollTo(l.anchor)} className="text-sm font-medium text-slate-600 hover:text-emerald-700 px-3 py-2">
              {l.label}
            </button>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <Btn variant="outline" size="sm" onClick={() => go("login")}><Lock size={15} /> Sign in</Btn>
          <Btn variant="danger" size="sm" onClick={() => go("login", { intent: "report" })}><Siren size={15} /> Report emergency</Btn>
        </div>
        <button className="lg:hidden text-slate-500 p-1" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((l) => (
            <button key={l.label} onClick={() => { setOpen(false); scrollTo(l.anchor); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              {l.label}
            </button>
          ))}
          <div className="pt-2 flex gap-2">
            <Btn variant="outline" className="flex-1" onClick={() => go("login")}>Sign in</Btn>
            <Btn variant="danger" className="flex-1" onClick={() => go("login", { intent: "report" })}><Siren size={15} /> Report</Btn>
          </div>
        </div>
      )}
    </header>
  );
};

const FEATURES = [
  { icon: CheckCircle2, title: "Smart emergency assessment", desc: "Your report is assessed automatically so the right type of emergency help can be notified." },
  { icon: Radio, title: "Automatic dispatch", desc: "A rules engine routes each case to ambulance, police or fire and alerts the nearest available unit." },
  { icon: Navigation, title: "Live status tracking", desc: "Reporters follow every stage — accepted, on the way, arrived, completed — with timestamps." },
  { icon: Ambulance, title: "Multi-service network", desc: "One platform coordinates medical, police and fire responders, each with their own dashboard." },
  { icon: ShieldCheck, title: "Role-based access", desc: "Separate, secured portals for citizens, responders and administrators, re-checked on the server." },
  { icon: Bell, title: "Instant notifications", desc: "Push and in-app alerts keep reporters, responders and control-room staff informed in real time." },
];

const HOW_STEPS = [
  { title: "Report the accident", desc: "Capture or upload a photo, share your location with one tap, and note how many people are affected." },
  { title: "Emergency assessment", desc: "Your photo is assessed automatically and the result is shown in clear, simple language." },
  { title: "Nearest unit dispatched", desc: "The recommended service is notified and the closest available responder accepts the case." },
  { title: "Track help arriving", desc: "Watch the responder move through each stage in real time until the emergency is completed." },
];

const HeroCard = () => {
  const demo = {
    status: "ON_THE_WAY", severity: "HIGH", recommendedService: "AMBULANCE",
    lat: 26.8467, lng: 80.9462, address: "Hazratganj Crossing, Lucknow",
    timeline: { SUBMITTED: iso(9), AI_COMPLETED: iso(8), SERVICE_NOTIFIED: iso(6), ACCEPTED: iso(4), ON_THE_WAY: iso(2) },
  };
  return (
    <Card className="overflow-hidden shadow-pop">
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="hh-livedot" /><span className="font-bold text-sm text-slate-900">Live emergency</span><span className="font-mono text-xs text-slate-500">HH-1042</span></div>
        <StatusPill status={demo.status} />
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityPill sev={demo.severity} /><ServicePill svc={demo.recommendedService} />
          <Pill className="bg-slate-100 text-slate-700 border border-slate-200"><Users size={12} /> 1 affected</Pill>
        </div>
        <MapPreview lat={demo.lat} lng={demo.lng} label={demo.address} />
        <div className="pt-1 border-t border-slate-200"><TimelineView report={demo} compact /></div>
      </div>
    </Card>
  );
};

export const LandingPage = ({ go }) => {
  const scrollTo = (id) => {
    if (id === "top") return window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("lp-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div id="lp-top" className="min-h-screen bg-white">
      <GovBar />
      <PublicNavbar go={go} scrollTo={scrollTo} />

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "radial-gradient(1100px 420px at 82% -10%, #E7F1EC, transparent 70%), #ffffff" }}>
        <div className="max-w-6xl mx-auto px-4 py-14 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <Eyebrow><LifeBuoy size={13} /> Smart Accident Emergency Response</Eyebrow>
            <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] text-slate-900">
              Get the right help to the scene, <span className="text-emerald-600">faster</span>.
            </h1>
            <p className="mt-5 text-slate-600 text-base lg:text-lg max-w-xl">
              Report an accident in seconds, confirm the location, and request emergency assistance when help is needed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn size="lg" variant="danger" onClick={() => go("login", { intent: "report" })}><Siren size={18} /> Report an emergency</Btn>
              <Btn size="lg" variant="outline" onClick={() => go("login")}><ShieldCheck size={17} /> Responder / admin sign in</Btn>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Pill className="bg-emerald-100 text-emerald-700 border border-emerald-200"><Cpu size={12} /> Smart assistance</Pill>
              <Pill className="bg-emerald-100 text-emerald-700 border border-emerald-200"><MapPinned size={12} /> Nearest-unit dispatch</Pill>
              <Pill className="bg-emerald-100 text-emerald-700 border border-emerald-200"><Navigation size={12} /> Live tracking</Pill>
            </div>
          </div>
          <div className="max-w-md w-full mx-auto lg:ml-auto"><HeroCard /></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="lp-how" className="bg-canvas border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-20">
          <SectionIntro eyebrow="How it works" title="From report to responder in four steps">
            The same staged workflow runs behind every emergency, so reporters, responders and control-room staff always see the same status.
          </SectionIntro>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_STEPS.map((s, i) => (
              <StepCard key={s.title} n={i + 1} title={s.title} desc={s.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 py-16 lg:py-20">
        <SectionIntro eyebrow="Platform" title="Built for real emergency operations" />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="lp-services" className="bg-canvas border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-20">
          <SectionIntro eyebrow="Emergency services" title="One number reaches the whole network">
            Every accident routes to the right service. Save these national emergency numbers — they connect you to help anywhere in India.
          </SectionIntro>
          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            {Object.keys(SERVICES).map((k) => (
              <ServiceCard key={k} svc={k} />
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / TRUST */}
      <section id="lp-about" className="max-w-6xl mx-auto px-4 py-16 lg:py-20">
        <div className="rounded-2xl p-8 lg:p-10" style={{ background: "linear-gradient(160deg,#0F5132,#0b3d26)" }}>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs font-bold tracking-[0.18em] uppercase text-emerald-300">Why HelpingHands</div>
              <h2 className="mt-2.5 text-2xl lg:text-3xl font-extrabold tracking-tight text-white">Safety, trust and healthcare, coordinated in one system.</h2>
              <p className="mt-3 text-base leading-relaxed text-emerald-100/80 max-w-xl">
                HelpingHands connects citizens directly to the emergency response network. Automatic assessment removes guesswork, automatic dispatch removes delay, and a shared status timeline keeps everyone — from the person at the scene to the control room — working from the same information.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[["Safety", Shield], ["Trust", ShieldCheck], ["Healthcare", Stethoscope], ["Emergency response", Siren]].map(([t, Ic]) => (
                <div key={t} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}>
                  <div className={cx(ICON_BADGE, "bg-white/10 text-emerald-300")}><Ic size={22} /></div>
                  <div className="mt-3 font-bold text-white">{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter go={go} />
    </div>
  );
};

const PublicFooter = ({ go }) => (
  <footer id="lp-contact" style={{ background: "#0F5132" }}>
    <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
      <div className="md:col-span-2 space-y-3">
        <BrandMark dark />
        <p className="text-base leading-relaxed text-emerald-100/80 max-w-sm">
          Smart Accident Emergency Response System — report an accident, share your location and get the right help to the scene, faster.
        </p>
        <p className="text-xs text-emerald-200/60">© 2026 HelpingHands</p>
      </div>
      <div>
        <div className="text-xs font-bold tracking-[0.16em] uppercase text-emerald-300 mb-3">Platform</div>
        <ul className="space-y-2 text-sm text-emerald-100/80">
          <li><button onClick={() => go("login")} className="hover:text-white">Sign in</button></li>
          <li><button onClick={() => go("register")} className="hover:text-white">Create account</button></li>
          <li><button onClick={() => go("login", { intent: "report" })} className="hover:text-white">Report an emergency</button></li>
        </ul>
      </div>
      <div>
        <div className="text-xs font-bold tracking-[0.16em] uppercase text-emerald-300 mb-3">Emergency numbers</div>
        <ul className="space-y-2 text-sm text-emerald-100/80">
          <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><Ambulance size={15} /> Ambulance</span> <span className="font-mono font-bold text-white">108</span></li>
          <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><Shield size={15} /> Police</span> <span className="font-mono font-bold text-white">112</span></li>
          <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><Flame size={15} /> Fire</span> <span className="font-mono font-bold text-white">101</span></li>
        </ul>
        <p className="text-xs text-emerald-200/60 mt-3">In a real emergency, always call these numbers first.</p>
      </div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-xs text-emerald-200/60">
      For a life-threatening emergency, call 112 immediately.
    </div>
  </footer>
);

/* ─── Auth ──────────────────────────────────────────────────────────── */

const AuthShell = ({ children, go }) => (
  <div className="min-h-screen grid lg:grid-cols-2">
    <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0F5132,#0b3d26)" }}>
      <button onClick={() => go("landing")} className="text-left"><BrandMark size="lg" dark /></button>
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight max-w-sm">Coordinated emergency response, from the first report to the scene.</h2>
        <div className="mt-6 space-y-3 max-w-sm">
          {[["Every accident is assessed in seconds", Cpu], ["The nearest available unit is dispatched automatically", Radio], ["Everyone tracks the same live status timeline", Navigation]].map(([t, Ic]) => (
            <div key={t} className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,.1)" }}><Ic size={16} className="text-emerald-300" /></span>
              <span className="text-sm text-emerald-100/80 pt-1.5">{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-sm text-emerald-200/60">Life-threatening emergency? Call <b className="font-mono text-white">112</b> right away.</div>
    </div>
    <div className="bg-white flex flex-col">
      <div className="border-b border-slate-200 h-14 px-4 flex items-center justify-between">
        <button onClick={() => go("landing")} className="lg:hidden"><BrandMark /></button>
        <span className="hidden lg:block" />
        <button onClick={() => go("landing")} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
          <ChevronLeft size={16} /> Back to home
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto">{children}</div>
    </div>
  </div>
);

const AuthTabs = ({ active, go }) => (
  <div className="flex gap-1 p-1 bg-canvas rounded-lg mb-6">
    <button className={cx("flex-1 text-center py-2 text-sm font-semibold rounded-md", active === "login" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500")} onClick={() => go("login")}>Sign in</button>
    <button className={cx("flex-1 text-center py-2 text-sm font-semibold rounded-md", active === "register" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500")} onClick={() => go("register")}>Create account</button>
  </div>
);

export const LoginPage = ({ go, onLogin, params }) => {
  const [role, setRole] = useState(params?.role || ROLES.USER);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [forgot, setForgot] = useState(false);

  const submit = async () => {
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    setErrors(errs); setApiError(null);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try { await onLogin(email, password, role, params?.intent); }
    catch (err) { setApiError(err.message || "Unable to sign in. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell go={go}>
      <div className="w-full max-w-md">
        <AuthTabs active="login" go={go} />
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Sign in</h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">Choose your role and access your dashboard.</p>

        {params?.intent === "report" && <div className="mb-4"><Alert tone="red"><b>Sign in to file your emergency report.</b> In immediate danger, call <b className="font-mono">112</b> now.</Alert></div>}
        {apiError && <div className="mb-4"><Alert tone="red">{apiError}</Alert></div>}

        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-700 mb-2">Sign in as</div>
          <div className="grid grid-cols-3 gap-2">
            {[{ value: ROLES.USER, label: "User", icon: User }, { value: ROLES.RESPONDER, label: "Responder", icon: Siren }, { value: ROLES.ADMIN, label: "Admin", icon: Shield }].map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" onClick={() => { setRole(value); setApiError(null); }}
                className={cx("flex flex-col items-center justify-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-semibold transition-colors",
                  role === value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-white text-slate-500 hover:border-slate-400")}>
                <Icon size={17} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Email" error={errors.email}>
            <TextInput type="email" value={email} placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </Field>
          <Field label="Password" error={errors.password}>
            <TextInput type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </Field>
          <Btn className="w-full" size="lg" disabled={loading} onClick={submit}>
            {loading ? <><Spinner /> Signing in…</> : <>Sign in <ArrowRight size={16} /></>}
          </Btn>
          <div className="text-center">
            <button onClick={() => setForgot(true)} className="text-sm font-medium text-slate-500 hover:text-emerald-700">Forgot password?</button>
          </div>
        </div>

        <p className="text-sm text-center text-slate-500 mt-6">
          New here? <button onClick={() => go("register")} className="font-semibold text-emerald-700 hover:text-emerald-800">Create an account</button>
        </p>
      </div>

      <Modal open={forgot} title="Reset password" onClose={() => setForgot(false)}>
        <p className="text-sm text-slate-600 leading-relaxed">
          In production this sends a reset link through the Spring Boot backend. Contact your administrator if you can't access your account.
        </p>
        <Btn className="w-full mt-5" onClick={() => setForgot(false)}>Got it</Btn>
      </Modal>
    </AuthShell>
  );
};

export const RegisterPage = ({ go, onRegister }) => {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "", role: ROLES.USER, department: "AMBULANCE", unitName: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [done, setDone] = useState(false);
  const set = (k) => (ev) => setF((p) => ({ ...p, [k]: ev.target.value }));

  const submit = async () => {
    const e = {};
    if (f.name.trim().length < 3) e.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
    if (!/^[+\d][\d\s-]{8,}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number.";
    if (f.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (f.confirm !== f.password) e.confirm = "Passwords do not match.";
    setErrors(e); setApiError(null);
    if (Object.keys(e).length) return;
    setLoading(true);
    try { await onRegister(f); setDone(true); }
    catch (err) { setApiError(err.message || "Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  if (done)
    return (
      <AuthShell go={go}>
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto"><CheckCircle2 size={28} /></div>
          <h2 className="mt-4 text-xl font-extrabold text-slate-900">Account created</h2>
          <p className="mt-2 text-sm text-slate-500">You're signed in and ready to go. Redirecting to your dashboard…</p>
          <Spinner className="mx-auto mt-4 text-emerald-600" size={22} />
        </Card>
      </AuthShell>
    );

  return (
    <AuthShell go={go}>
      <div className="w-full max-w-lg">
        <AuthTabs active="register" go={go} />
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">Create an account to report emergencies and track updates.</p>
        <div className="space-y-4">
          {apiError && <Alert tone="red">{apiError}</Alert>}
          <Field label="Full name" error={errors.name}>
            <TextInput value={f.name} placeholder="e.g. Aarav Sharma" onChange={set("name")} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email" error={errors.email}><TextInput type="email" value={f.email} placeholder="you@example.com" onChange={set("email")} /></Field>
            <Field label="Phone number" error={errors.phone}><TextInput value={f.phone} placeholder="+91 98765 43210" onChange={set("phone")} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Password" error={errors.password}><TextInput type="password" value={f.password} placeholder="Min. 6 characters" onChange={set("password")} /></Field>
            <Field label="Confirm password" error={errors.confirm}><TextInput type="password" value={f.confirm} placeholder="Repeat password" onChange={set("confirm")} /></Field>
          </div>
          <p className="text-sm text-slate-500">Responder accounts are created and managed by the administrator.</p>
          <Btn className="w-full" size="lg" disabled={loading} onClick={submit}>
            {loading ? <><Spinner /> Creating account…</> : <>Create account <ArrowRight size={16} /></>}
          </Btn>
          <p className="text-sm text-center text-slate-500">
            Already registered? <button onClick={() => go("login")} className="font-semibold text-emerald-700 hover:text-emerald-800">Sign in</button>
          </p>
        </div>
      </div>
    </AuthShell>
  );
};
