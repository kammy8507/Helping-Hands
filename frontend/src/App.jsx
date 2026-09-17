import React, { useState, useEffect, useMemo, useCallback } from "react";
import { User, Settings, Search } from "lucide-react";
import { delay, uid, ROLES, STATUS, SERVICES } from "./utils/constants";
import { seedDB } from "./mocks/seed";
import { authLogin, authRegister, getCurrentUser, updateCurrentUser, getStoredToken, clearStoredSession, createAccidentReport, getMyAccidentReports, getAccidentReport, getAdminUsers, setAdminUserActive, deleteAdminUser, getAdminResponders, createAdminResponder, setAdminResponderActive } from "./services";
import { Card, EmptyState, Toasts } from "./components/ui";
import { DemoBanner } from "./components/shared";
import { LandingPage, LoginPage, RegisterPage } from "./pages/public";
import { AppShell, UnauthorizedPage, routeRole } from "./layouts/AppShell";
import { UserDashboard, MyReportsPage, ReportWizard, ReportDetailPage, EmergencyStatusPage, NotificationsPage, ProfilePage } from "./pages/user";
import { ResponderDashboard, ResponderRequestsPage, ResponderActivePage, ResponderCompletedPage, ResponderDetailPage } from "./pages/responder";
import { AdminOverview, AdminUsersPage, AdminRespondersPage, AdminReportsPage, AdminMonitoringPage, AdminServicesPage, AdminAnalyticsPage, AdminLogsPage, AdminSettingsPage, AdminHospitalsPage } from "./pages/admin";

const TITLES = {
  "u.dashboard": "Dashboard", "u.report": "Report Accident", "u.reports": "My Reports",
  "u.reportDetail": "Report Details", "u.status": "Emergency Status",
  "u.notifications": "Notifications", "u.profile": "Profile",
  "r.dashboard": "Responder Dashboard", "r.requests": "Emergency Requests",
  "r.active": "Active Emergencies", "r.completed": "Completed Cases",
  "r.detail": "Emergency Details", "r.notifications": "Notifications", "r.profile": "Profile",
  "a.overview": "Admin Overview", "a.users": "User Management", "a.responders": "Responder Management", "a.hospitals": "Hospital Management",
  "a.reports": "Accident Reports", "a.monitoring": "Emergency Monitoring", "a.services": "Emergency Services",
  "a.analytics": "Analytics", "a.logs": "System Logs", "a.settings": "Settings", "a.profile": "Profile",
};
const HOME_ROUTE = { [ROLES.USER]: "u.dashboard", [ROLES.RESPONDER]: "r.dashboard", [ROLES.ADMIN]: "a.overview" };

export default function HelpingHands() {
  // Seeded data powers the Responder/Admin dashboards (which have no backend
  // report endpoint yet). For a USER, the effect below replaces reports with
  // their real reports from Spring Boot; seeded reports (other users) are
  // filtered out of their view by userId regardless.
  const [db, setDb] = useState(() => seedDB());
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem("helpinghands_session");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }); // { token, tokenExp, user }
  const [route, setRoute] = useState({ name: "landing", params: {} });
  const [toasts, setToasts] = useState([]);
  const [busy, setBusy] = useState(false);

  const toast = useCallback((msg, tone = "info") => {
    const id = uid("t");
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const go = useCallback((name, params = {}) => {
    setRoute({ name, params });
    window.scrollTo({ top: 0 });
  }, []);

  // Authenticated user comes from Spring Boot. Accident reports are loaded from MySQL.
  const me = useMemo(() => session?.user || null, [session]);

  // Restore/refresh the authenticated profile after a browser reload.
  useEffect(() => {
    if (!getStoredToken()) return;
    getCurrentUser()
      .then((user) => {
        setSession((s) => s ? { ...s, user } : s);
        setRoute((r) => r.name === "landing" ? { name: HOME_ROUTE[user.role], params: {} } : r);
      })
      .catch(() => { clearStoredSession(); setSession(null); });
  }, []);

  // Load real accident reports for the authenticated user.
  useEffect(() => {
    if (me?.role !== ROLES.USER) return;
    getMyAccidentReports()
      .then((reports) => setDb((d) => ({ ...d, reports })))
      .catch((e) => toast(e.message || "Unable to load reports.", "error"));
  }, [me?.id, me?.role, toast]);

  // Load real USER accounts for Admin -> User Management.
  useEffect(() => {
    if (me?.role !== ROLES.ADMIN) return;
    getAdminUsers()
      .then((users) => setDb((d) => ({ ...d, users })))
      .catch((e) => toast(e.message || "Unable to load users.", "error"));
  }, [me?.id, me?.role, toast]);

  // Load responder accounts for Admin -> Responder Management.
  useEffect(() => {
    if (me?.role !== ROLES.ADMIN) return;
    getAdminResponders()
      .then((responders) => setDb((d) => ({ ...d, responders })))
      .catch((e) => toast(e.message || "Unable to load responders.", "error"));
  }, [me?.id, me?.role, toast]);

  // ── JWT expiry watchdog (spec §18: automatic logout on token expiry) ──
  useEffect(() => {
    if (!session) return;
    const iv = setInterval(() => {
      if (Date.now() > session.tokenExp) {
        setSession(null);
        setRoute({ name: "login", params: {} });
        toast("Session expired. Please sign in again.", "error");
      }
    }, 20000);
    return () => clearInterval(iv);
  }, [session, toast]);

  /* ── local UI state helpers; accident persistence is handled by Spring Boot/MySQL ── */

  const addLog = (d, actor, action, description) => ({
    ...d, logs: [{ id: uid("LG"), actor, action, description, timestamp: new Date().toISOString() }, ...d.logs],
  });
  const addNotif = (d, toRole, toId, reportId, title, message, type) => ({
    ...d, notifications: [
      { id: uid("N"), toRole, toId, reportId, title, message, notificationType: type, isRead: false, createdAt: new Date().toISOString() },
      ...d.notifications,
    ],
  });
  const patchReport = (d, id, patch) => ({
    ...d,
    reports: d.reports.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r)),
  });

  /* ── auth actions ── */

  const handleLogin = async (email, password, role, intent) => {
    const res = await authLogin(db, email, password, role); // POST /api/auth/login
    setSession(res);
    toast(`Welcome back, ${res.user.name.split(" ")[0]}`, "success");
    go(intent === "report" && res.user.role === ROLES.USER ? "u.report" : HOME_ROUTE[res.user.role]);
  };

  const handleRegister = async (f) => {
    const res = await authRegister(db, f); // POST /api/auth/register
    setSession(res);
    go(HOME_ROUTE[res.user.role]);
    toast("Account created — you're signed in.", "success");
  };

  const handleLogout = () => {
    clearStoredSession();
    setSession(null);
    go("landing");
  };

  /* ── real accident report submission ── */

  const handleSubmitReport = async ({ accidentType, description, peopleAffected, remarks, image, lat, lng, address, selectedHospital }) => {
    const saved = await createAccidentReport({
      accidentType, description, peopleAffected: Number(peopleAffected), remarks,
      imageData: image, lat, lng, address, hospitalId: selectedHospital?.id || null,
    });
    // Destination hospital is a client-side field until the backend persists it,
    // so attach the chosen snapshot to the saved report locally.
    const withHospital = { ...saved, selectedHospital: selectedHospital || null };
    setDb((d) => ({ ...d, reports: [withHospital, ...d.reports.filter((r) => r.id !== saved.id)] }));
    toast(`Report ${saved.publicCode} saved to MySQL.`, "success");
    return saved.publicCode;
  };

  const addResponder = async (payload) => {
    const responder = await createAdminResponder(payload);
    setDb((d) => ({ ...d, responders: [...d.responders, responder] }));
    toast("Responder account created.", "success");
  };

  const toggleResponderAccount = async (id) => {
    const current = db.responders.find((r) => String(r.id) === String(id));
    if (!current) return;
    const updated = await setAdminResponderActive(id, current.active === false);
    setDb((d) => ({ ...d, responders: d.responders.map((r) => String(r.id) === String(id) ? updated : r) }));
    toast(updated.active ? "Responder account enabled." : "Responder account disabled.", "success");
  };

  /* ── responder actions ── */

  const handleAccept = async (reportId) => {
    setBusy(true);
    await delay(600); // POST /api/emergencies/{id}/accept
    const now = new Date().toISOString();
    setDb((d) => {
      const rep = d.reports.find((r) => r.id === reportId);
      if (!rep || rep.status !== "SERVICE_NOTIFIED") return d;
      let n = patchReport(d, reportId, {
        status: "ACCEPTED", assignedResponderId: me.id,
        timeline: { ...rep.timeline, ACCEPTED: now },
      });
      n = {
        ...n,
        assignments: [
          { id: uid("AS-"), reportId, responderId: me.id, serviceType: rep.recommendedService, assignedAt: rep.timeline.SERVICE_NOTIFIED || rep.createdAt, acceptedAt: now, completedAt: null, status: "ACCEPTED" },
          ...n.assignments,
        ],
      };
      n = addNotif(n, ROLES.USER, rep.userId, reportId, "Responder accepted", `${me.name} (${me.unit}) accepted your emergency ${reportId}.`, "ACCEPTED");
      n = addNotif(n, ROLES.ADMIN, null, reportId, "Emergency accepted", `${me.name} accepted ${reportId}.`, "STATUS");
      return addLog(n, me.id, "EMERGENCY_ACCEPTED", `Responder ${me.name} accepted ${reportId}.`);
    });
    setBusy(false);
    toast("Emergency accepted — you're assigned.", "success");
    go("r.active");
  };

  const handleReject = async (reportId) => {
    setBusy(true);
    await delay(500); // POST /api/emergencies/{id}/reject
    setDb((d) => {
      const rep = d.reports.find((r) => r.id === reportId);
      if (!rep) return d;
      let n = patchReport(d, reportId, { rejectedBy: [...(rep.rejectedBy || []), me.id] });
      n = addNotif(n, ROLES.USER, rep.userId, reportId, "Searching for another responder", `A responder was unavailable for ${reportId} — the next nearest unit is being alerted.`, "STATUS");
      return addLog(n, me.id, "EMERGENCY_REJECTED", `Responder ${me.name} rejected ${reportId}; re-dispatching.`);
    });
    setBusy(false);
    toast("Request rejected — re-dispatching to other units.");
  };

  const handleStatus = async (reportId, status) => {
    setBusy(true);
    await delay(600); // PUT /api/emergencies/{id}/status
    const now = new Date().toISOString();
    setDb((d) => {
      const rep = d.reports.find((r) => r.id === reportId);
      if (!rep) return d;
      let n = patchReport(d, reportId, { status, timeline: { ...rep.timeline, [status]: now } });
      n = {
        ...n,
        assignments: n.assignments.map((a) =>
          a.reportId === reportId ? { ...a, status, completedAt: status === "COMPLETED" ? now : a.completedAt } : a
        ),
      };
      const msgs = {
        ON_THE_WAY: "Your responder is on the way.",
        ARRIVED: "Your responder has arrived at the scene.",
        COMPLETED: "Your emergency has been marked completed. Stay safe.",
      };
      n = addNotif(n, ROLES.USER, rep.userId, reportId, STATUS[status].label, msgs[status] || STATUS[status].label, status === "COMPLETED" ? "COMPLETED" : "STATUS");
      return addLog(n, me.id, "STATUS_UPDATE", `${reportId} status changed to ${status}.`);
    });
    setBusy(false);
    toast(status === "COMPLETED" ? "Case completed. Well done." : "Status updated — reporter notified.", "success");
  };

  /* ── notifications ── */
  const myNotifications = useMemo(() => {
    if (!me) return [];
    return db.notifications
      .filter((n) => n.toRole === me.role && (!n.toId || n.toId === me.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [db.notifications, me]);

  const readNotif = (id) => // PUT /api/notifications/{id}/read
    setDb((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)) }));
  const readAllNotifs = () =>
    setDb((d) => ({
      ...d,
      notifications: d.notifications.map((n) =>
        n.toRole === me.role && (!n.toId || n.toId === me.id) ? { ...n, isRead: true } : n
      ),
    }));

  /* ── profile + admin actions ── */
  const saveProfile = async (patch) => { // PUT /api/users/me
    const updated = await updateCurrentUser(patch);
    setSession((s) => s ? { ...s, user: updated } : s);
  };

  const toggleUser = async (id) => {
    const current = db.users.find((u) => u.id === id);
    if (!current) return;
    try {
      const updated = await setAdminUserActive(id, !current.active);
      setDb((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? updated : u)) }));
      toast(updated.active ? "User activated." : "User deactivated.", "success");
    } catch (e) {
      toast(e.message || "Unable to update user.", "error");
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteAdminUser(id);
      setDb((d) => ({ ...d, users: d.users.filter((u) => u.id !== id) }));
      toast("User deleted.", "success");
    } catch (e) {
      toast(e.message || "Unable to delete user. Users with existing reports may need to be deactivated instead.", "error");
    }
  };
  const toggleAvail = (id) =>
    setDb((d) => ({
      ...d,
      responders: d.responders.map((r) => (r.id === id ? { ...r, availability: r.availability === "AVAILABLE" ? "ON_CALL" : "AVAILABLE" } : r)),
    }));

  /* ── hospital registry (Ambulance destinations) ── */
  const registerHospital = (h) => {
    setDb((d) => ({
      ...d,
      hospitals: [
        {
          id: uid("H-"), active: true, createdAt: new Date().toISOString(),
          name: h.name.trim(), type: h.type, address: h.address.trim(), phone: h.phone.trim(),
          lat: Number(h.lat), lng: Number(h.lng),
          totalBeds: Math.max(0, Number(h.totalBeds) || 0),
          availableBeds: Math.max(0, Math.min(Number(h.totalBeds) || 0, Number(h.availableBeds) || 0)),
        },
        ...d.hospitals,
      ],
    }));
    toast("Hospital registered.", "success");
  };
  const updateHospitalBeds = (id, availableBeds, totalBeds) => {
    setDb((d) => ({
      ...d,
      hospitals: d.hospitals.map((h) =>
        h.id === id
          ? {
              ...h,
              totalBeds: totalBeds != null ? Math.max(0, Number(totalBeds)) : h.totalBeds,
              availableBeds: Math.max(0, Math.min(totalBeds != null ? Number(totalBeds) : h.totalBeds, Number(availableBeds))),
            }
          : h
      ),
    }));
    toast("Bed availability updated.", "success");
  };
  const toggleHospital = (id) =>
    setDb((d) => ({ ...d, hospitals: d.hospitals.map((h) => (h.id === id ? { ...h, active: !h.active } : h)) }));

  // Logged-in responder toggles their own availability (client-side reflection).
  const toggleMyAvailability = () =>
    setSession((s) => s && s.user.role === ROLES.RESPONDER
      ? { ...s, user: { ...s.user, availability: s.user.availability === "AVAILABLE" ? "ON_CALL" : "AVAILABLE" } }
      : s);

  /* ── render ── */

  if (!session || !me) {
    if (route.name === "login") return <><LoginPage go={go} onLogin={handleLogin} params={route.params} /><Toasts toasts={toasts} /></>;
    if (route.name === "register") return <><RegisterPage go={go} onRegister={handleRegister} /><Toasts toasts={toasts} /></>;
    return <><div><DemoBanner /><LandingPage go={go} /></div><Toasts toasts={toasts} /></>;
  }

  // Authenticated: role guard first (backend re-checks every call in prod).
  const needed = routeRole(route.name);
  const authorized = needed === null || needed === me.role;
  const activeRoute = authorized && needed ? route.name : HOME_ROUTE[me.role];
  const activeParams = authorized ? route.params : {};

  let page = null;
  if (!authorized) page = <UnauthorizedPage go={go} homeRoute={HOME_ROUTE[me.role]} />;
  else
    switch (activeRoute) {
      case "u.dashboard": page = <UserDashboard user={me} db={db} go={go} />; break;
      case "u.report": page = <ReportWizard user={me} db={db} onSubmitReport={handleSubmitReport} go={go} />; break;
      case "u.reports": page = <MyReportsPage user={me} db={db} go={go} />; break;
      case "u.reportDetail": page = <ReportDetailPage db={db} params={activeParams} go={go} backRoute="u.reports" />; break;
      case "u.status": page = <EmergencyStatusPage user={me} db={db} go={go} />; break;
      case "u.notifications":
      case "r.notifications": page = <NotificationsPage items={myNotifications} onRead={readNotif} onReadAll={readAllNotifs} />; break;
      case "u.profile":
      case "r.profile":
      case "a.profile": page = <ProfilePage user={me} onSave={saveProfile} toast={toast} />; break;
      case "r.dashboard": page = <ResponderDashboard user={me} db={db} go={go} onAccept={handleAccept} onReject={handleReject} busy={busy} />; break;
      case "r.requests": page = <ResponderRequestsPage user={me} db={db} go={go} onAccept={handleAccept} onReject={handleReject} busy={busy} />; break;
      case "r.active": page = <ResponderActivePage user={me} db={db} go={go} onStatus={handleStatus} busy={busy} />; break;
      case "r.completed": page = <ResponderCompletedPage user={me} db={db} go={go} />; break;
      case "r.detail": page = <ResponderDetailPage user={me} db={db} params={activeParams} go={go} onAccept={handleAccept} onReject={handleReject} onStatus={handleStatus} busy={busy} />; break;
      case "a.overview": page = <AdminOverview db={db} go={go} />; break;
      case "a.users": page = <AdminUsersPage db={db} onToggleUser={toggleUser} onDeleteUser={deleteUser} />; break;
      case "a.responders": page = <AdminRespondersPage db={db} onCreateResponder={addResponder} onToggleResponder={toggleResponderAccount} />; break;
      case "a.hospitals": page = <AdminHospitalsPage db={db} onRegister={registerHospital} onUpdateBeds={updateHospitalBeds} onToggleActive={toggleHospital} />; break;
      case "a.reports": page = <AdminReportsPage db={db} />; break;
      case "a.monitoring": page = <AdminMonitoringPage db={db} />; break;
      case "a.services": page = <AdminServicesPage db={db} />; break;
      case "a.analytics": page = <AdminAnalyticsPage db={db} />; break;
      case "a.logs": page = <AdminLogsPage db={db} />; break;
      case "a.settings": page = <AdminSettingsPage />; break;
      default: page = <Card><EmptyState icon={Search} title="Page not found" /></Card>;
    }

  return (
    <>
      <AppShell
        user={me} route={activeRoute} go={go} onLogout={handleLogout}
        myNotifications={myNotifications} onReadNotif={readNotif}
        onToggleAvailability={toggleMyAvailability}
        title={!authorized ? "Access Denied" : TITLES[activeRoute] || "HelpingHands"}
      >
        {page}
      </AppShell>
      <Toasts toasts={toasts} />
    </>
  );
}
