import { API_BASE_URL, DEMO_MODE } from "../api/config";
import { delay, uid, ROLES } from "../utils/constants";

const TOKEN_KEY = "helpinghands_token";
const SESSION_KEY = "helpinghands_session";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
};

const apiRequest = async (path, options = {}) => {
  const token = getStoredToken();
  const headers = { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  let body = null;
  try { body = await response.json(); } catch { /* empty response */ }

  if (response.status === 401) {
    clearStoredSession();
    throw new Error(body?.message || "Your session has expired. Please sign in again.");
  }
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed (${response.status}).`);
  }
  return body?.data ?? body;
};

const normalizeUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    department: u.department || null,
    unit: u.unitName || u.unit || null,
    availability: u.availabilityStatus || u.availability || null,
    base: u.baseLatitude != null && u.baseLongitude != null
      ? { lat: Number(u.baseLatitude), lng: Number(u.baseLongitude) }
      : u.base || null,
  };
};

// Real backend: POST /api/auth/login
export const authLogin = async (_db, email, password, role) => {
  if (DEMO_MODE) await delay(250);
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password, role }),
  });
  const user = normalizeUser(data.user);
  const tokenExp = data.expiresAt ? new Date(data.expiresAt).getTime() : Date.now() + (data.expiresInMs || 1800000);
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token: data.token, tokenExp, user }));
  return { token: data.token, tokenExp, user };
};

// Real backend: POST /api/auth/register
export const authRegister = async (_db, payload) => {
  const role = payload.role === ROLES.RESPONDER ? ROLES.RESPONDER : ROLES.USER;
  const body = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    password: payload.password,
    role,
  };
  if (role === ROLES.RESPONDER) {
    body.department = payload.department || "AMBULANCE";
    body.unitName = payload.unitName || "Unassigned unit";
    body.availabilityStatus = payload.availabilityStatus || "AVAILABLE";
  }
  const data = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(body) });
  const user = normalizeUser(data.user);
  const token = data.token;
  const tokenExp = data.expiresAt ? new Date(data.expiresAt).getTime() : Date.now() + (data.expiresInMs || 1800000);
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, tokenExp, user }));
  }
  return { token, tokenExp, user };
};

// Real backend: GET /api/users/me
export const getCurrentUser = async () => normalizeUser(await apiRequest("/users/me"));

// Real backend: PUT /api/users/me
export const updateCurrentUser = async (patch) => normalizeUser(await apiRequest("/users/me", {
  method: "PUT",
  body: JSON.stringify(patch),
}));


// Admin: real database-backed User Management.
export const getAdminUsers = async () => {
  const users = await apiRequest("/admin/users");
  return Array.isArray(users) ? users.map(normalizeUser) : [];
};

export const setAdminUserActive = async (userId, active) =>
  normalizeUser(await apiRequest(`/admin/users/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  }));

export const deleteAdminUser = async (userId) =>
  apiRequest(`/admin/users/${encodeURIComponent(userId)}`, { method: "DELETE" });

export const getAdminResponders = async () => {
  const responders = await apiRequest("/admin/responders");
  return Array.isArray(responders) ? responders.map(normalizeUser) : [];
};

export const createAdminResponder = async (payload) =>
  normalizeUser(await apiRequest("/admin/responders", {
    method: "POST",
    body: JSON.stringify(payload),
  }));

export const setAdminResponderActive = async (userId, active) =>
  normalizeUser(await apiRequest(`/admin/responders/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  }));

// Real backend: accident analysis and report persistence.
export const aiAnalyze = async ({ accidentType, peopleAffected, imageData, imageName }) =>
  apiRequest("/accidents/analyze", {
    method: "POST",
    body: JSON.stringify({ accidentType, peopleAffected: Number(peopleAffected) || 0, imageData, imageName }),
  });

export const createAccidentReport = async (payload) =>
  apiRequest("/accidents", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMyAccidentReports = async () => apiRequest("/accidents/me");

export const getAccidentReport = async (publicCode) =>
  apiRequest(`/accidents/${encodeURIComponent(publicCode)}`);

export function recommendService(detectedType, severity) {
  if (detectedType === "Fire") return "FIRE_DEPARTMENT";
  if (detectedType === "Unclassified Incident") return "POLICE";
  if (severity === "LOW") return "POLICE";
  return "AMBULANCE";
}

// src/services/geoService.js — browser Geolocation API wrapper.
export const getBrowserLocation = () =>
  new Promise((resolve, reject) => {
    if (!("geolocation" in navigator))
      return reject(new Error("Geolocation is not supported by this browser."));
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: +pos.coords.latitude.toFixed(6),
          lng: +pos.coords.longitude.toFixed(6),
          address: "Detected via GPS — exact address resolves through the Google Geocoding API on the backend.",
        }),
      (err) => {
        const msgs = {
          1: "Unable to access your location. Please enable location permission or select your location manually.",
          2: "Your location is currently unavailable. Please try again or use the demo location.",
          3: "Location request timed out. Please retry or use the demo location.",
        };
        reject(new Error(msgs[err.code] || "Unable to detect location."));
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
    );
  });

