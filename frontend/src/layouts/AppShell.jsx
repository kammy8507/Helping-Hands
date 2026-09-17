import React, { useState, useEffect, useRef } from "react";
import { Ambulance, Siren, Bell, User, Users, LayoutDashboard, FileText, Activity, LogOut, Menu, X, CheckCircle2, Lock, Settings, BarChart3, ScrollText, Radio, Navigation, Clock, ChevronDown, Hospital } from "lucide-react";
import { cx, timeAgo, ROLES, SERVICES } from "../utils/constants";
import { Btn, Card, EmptyState } from "../components/ui";
import { DemoBanner, BrandMark } from "../components/shared";

const SIDEBARS = {
  [ROLES.USER]: [
    { section: "Emergency" },
    { route: "u.dashboard", label: "Dashboard", icon: LayoutDashboard },
    { route: "u.report", label: "Report Accident", icon: Siren, hot: true },
    { route: "u.status", label: "Emergency Status", icon: Activity },
    { section: "Records" },
    { route: "u.reports", label: "My Reports", icon: FileText },
    { route: "u.notifications", label: "Notifications", icon: Bell, notif: true },
    { section: "Account" },
    { route: "u.profile", label: "Profile & Settings", icon: Settings },
  ],
  [ROLES.RESPONDER]: [
    { section: "Response" },
    { route: "r.dashboard", label: "Dashboard", icon: LayoutDashboard },
    { route: "r.requests", label: "Emergency Requests", icon: Siren, hot: true },
    { route: "r.active", label: "Active Emergencies", icon: Navigation },
    { route: "r.completed", label: "Completed Cases", icon: CheckCircle2 },
    { section: "Account" },
    { route: "r.notifications", label: "Notifications", icon: Bell, notif: true },
    { route: "r.profile", label: "Profile & Settings", icon: Settings },
  ],
  [ROLES.ADMIN]: [
    { section: "Control room" },
    { route: "a.overview", label: "Overview", icon: LayoutDashboard },
    { route: "a.monitoring", label: "Emergency Monitoring", icon: Activity },
    { route: "a.reports", label: "Accident Reports", icon: FileText },
    { section: "Network" },
    { route: "a.users", label: "Users", icon: Users },
    { route: "a.responders", label: "Responders", icon: Ambulance },
    { route: "a.hospitals", label: "Hospitals", icon: Hospital },
    { route: "a.services", label: "Emergency Services", icon: Radio },
    { section: "Insights" },
    { route: "a.analytics", label: "Analytics & Reports", icon: BarChart3 },
    { route: "a.logs", label: "System Logs", icon: ScrollText },
    { route: "a.settings", label: "Settings", icon: Settings },
  ],
};

export const routeRole = (route) =>
  route.startsWith("u.") ? ROLES.USER : route.startsWith("r.") ? ROLES.RESPONDER : route.startsWith("a.") ? ROLES.ADMIN : null;

const roleLabel = (role) => (role === ROLES.USER ? "Citizen" : role === ROLES.RESPONDER ? "Responder" : "Administrator");
const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("");

export const NotificationBell = ({ items, onOpenAll, onRead }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = items.filter((n) => !n.isRead).length;
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600" aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 z-40 bg-white border border-slate-200 rounded-xl shadow-pop overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Notifications</span>
            {unread > 0 && <span className="text-xs text-slate-500">{unread} unread</span>}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {items.length === 0 && <EmptyState icon={Bell} title="No notifications yet" />}
            {items.slice(0, 6).map((n) => (
              <button key={n.id} onClick={() => onRead(n.id)} className={cx("w-full text-left px-4 py-3 hover:bg-slate-50", !n.isRead && "bg-emerald-50/70")}>
                <div className="flex items-start gap-2">
                  {!n.isRead && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{n.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-2">{n.message}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { setOpen(false); onOpenAll(); }} className="w-full px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-slate-50 border-t border-slate-200">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export const AppShell = ({ user, route, go, onLogout, myNotifications, onReadNotif, onToggleAvailability, title, children }) => {
  const [drawer, setDrawer] = useState(false);
  const items = SIDEBARS[user.role] || [];
  const notifRoute = user.role === ROLES.USER ? "u.notifications" : user.role === ROLES.RESPONDER ? "r.notifications" : "a.logs";
  const available = user.availability === "AVAILABLE";

  const SideNav = ({ onNav }) => (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-4 border-b border-slate-200">
        <BrandMark />
      </div>
      {user.role === ROLES.USER && (
        <div className="px-4 pt-4">
          <button onClick={() => onNav("u.report")}
            className="w-full rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 flex items-center justify-center gap-2 shadow-sm">
            <Siren size={17} /> REPORT ACCIDENT
          </button>
        </div>
      )}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {items.map((it, i) => it.section ? (
          <div key={"s" + i} className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-slate-400 px-3 pt-4 pb-1.5">{it.section}</div>
        ) : (
          (() => {
            const active = route === it.route || (it.route === "u.reports" && route === "u.reportDetail") ||
              (it.route === "r.requests" && route === "r.detail") || (it.route === "r.active" && route === "r.detail");
            const unread = myNotifications.filter((n) => !n.isRead).length;
            return (
              <button key={it.route} onClick={() => onNav(it.route)}
                className={cx("relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5",
                  active
                    ? (it.hot ? "bg-red-50 text-red-700 font-semibold" : "bg-emerald-50 text-emerald-700 font-semibold")
                    : it.hot ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}>
                {active && <span className={cx("absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r", it.hot ? "bg-red-600" : "bg-emerald-500")} />}
                <it.icon size={18} className={cx(active ? (it.hot ? "text-red-600" : "text-emerald-600") : "text-slate-400")} /> {it.label}
                {it.notif && unread > 0 && <span className="ml-auto min-w-[19px] h-[19px] px-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>}
              </button>
            );
          })()
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-slate-200">
        <div className="px-2 pb-2.5 flex items-center gap-3">
          <div className={cx("w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0 uppercase", user.role === ROLES.ADMIN ? "bg-slate-600" : "bg-emerald-500")}>
            {initials(user.name)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">{roleLabel(user.role)}</div>
          </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
          <LogOut size={18} className="text-slate-400" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <DemoBanner />
      <div className="flex">
        <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-200 min-h-[calc(100vh-33px)] sticky top-0 flex-col bg-white">
          <SideNav onNav={go} />
        </aside>

        {drawer && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawer(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-pop">
              <button onClick={() => setDrawer(false)} className="absolute right-3 top-4 z-10 text-slate-400 hover:text-slate-700"><X size={20} /></button>
              <SideNav onNav={(r) => { setDrawer(false); go(r); }} />
            </aside>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 bg-white/90 border-b border-slate-200 backdrop-blur">
            <div className="px-4 lg:px-8 h-16 flex items-center gap-3">
              <button className="lg:hidden text-slate-500 -ml-1 p-1" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu size={22} /></button>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 truncate flex-1">{title}</h1>

              {user.role === ROLES.RESPONDER && (
                <button onClick={() => onToggleAvailability && onToggleAvailability()}
                  className={cx("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors",
                    available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200")}>
                  <span className={cx("relative w-8 h-[18px] rounded-full transition-colors", available ? "bg-emerald-500" : "bg-slate-300")}>
                    <span className={cx("absolute top-0.5 w-[14px] h-[14px] rounded-full bg-white shadow transition-all", available ? "left-[16px]" : "left-0.5")} />
                  </span>
                  <span className="hidden sm:inline">{available ? "Available" : "On call"}</span>
                </button>
              )}
              {user.role === ROLES.USER && (
                <Btn size="sm" variant="danger" className="hidden sm:inline-flex" onClick={() => go("u.report")}><Siren size={14} /> SOS</Btn>
              )}
              <NotificationBell items={myNotifications} onRead={onReadNotif} onOpenAll={() => go(notifRoute)} />
            </div>
          </header>
          <main className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">{children}</main>
        </div>
      </div>

      {user.role === ROLES.USER && route !== "u.report" && (
        <button onClick={() => go("u.report")}
          className="lg:hidden fixed bottom-5 right-5 z-40 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm pl-4 pr-5 py-4 shadow-pop flex items-center gap-2">
          <Siren size={19} /> REPORT
        </button>
      )}
    </div>
  );
};

export const UnauthorizedPage = ({ go, homeRoute }) => (
  <div className="py-16">
    <Card className="max-w-md mx-auto p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto"><Lock size={26} /></div>
      <h2 className="mt-4 text-xl font-extrabold text-slate-900">Access denied</h2>
      <p className="mt-2 text-sm text-slate-600">
        Your role isn't authorised for this section. The server re-checks every request, so pages outside your access level stay out of reach.
      </p>
      <Btn className="mt-6" onClick={() => go(homeRoute)}>Go to my dashboard</Btn>
    </Card>
  </div>
);
