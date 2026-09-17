# HelpingHands — Prototype → Production Integration Guide

Production architecture (unchanged): **React.js → Spring Boot REST API → MySQL**, with Spring Boot calling the **YOLO** AI service and **FCM** for push notifications. The prototype (`helpinghands.jsx`) implements the full UI and workflow against clearly-labelled mock services so each mock can be swapped for the real integration without touching the pages.

## 1. What is mock vs. real in the prototype

| Layer | Prototype | Production swap |
|---|---|---|
| Auth / JWT | Mock token, 30-min expiry + auto-logout | `POST /api/auth/login` → real signed JWT from Spring Security |
| Data store | In-memory seeded DB (resets on reload) | MySQL via Spring Boot (`helpinghands_schema.sql`) |
| AI analysis | Deterministic mock labelled "Mock YOLO" | `POST /api/ai/analyze` → Spring Boot → YOLO microservice |
| Maps | Schematic `MapPreview` with exact lat/lng pin | Google Maps JS SDK + Geocoding API (`VITE_GOOGLE_MAPS_KEY`) |
| Notifications | In-app bell fed by mock events | FCM push + `GET /api/notifications` |
| GPS | Real browser Geolocation API (with demo-location fallback, since embedded previews often block GPS) | Same code, unchanged |

## 2. Mapping the single file to the real repo

Section banners in `helpinghands.jsx` (01–12) map 1:1 to the intended structure:

```
src/
  api/config.js          ← Section 01 (API_BASE_URL from VITE_API_BASE_URL)
  utils/constants.js     ← Section 02 (statuses, severities, services)
  mocks/seed.js          ← Section 03 (delete in production)
  services/              ← Section 04 (authService, aiService, geoService, …)
  components/ui/         ← Section 05
  components/            ← Section 06 (MapPreview, TimelineView, …)
  pages/public|user|responder|admin  ← Sections 07, 09, 10, 11
  layouts/ + context/AuthContext     ← Sections 08, 12
  App.jsx                ← Section 12 (router, RBAC guards, actions)
```

Every mutating action in Section 12 carries a comment naming its endpoint (e.g. `// POST /api/emergencies/{id}/accept`).

## 3. Environment variables (Vite)

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_MAPS_KEY=...        # optional until Maps is wired
```

## 4. Real API client (replaces the mock layer)

```js
// src/api/client.js
import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use((cfg) => {
  const token = getToken();                    // from AuthContext
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
api.interceptors.response.use(null, (err) => {
  if (err.response?.status === 401) logoutAndRedirect();   // token expired
  return Promise.reject(err);
});
export default api;
```

Then e.g. `authService.login = (email, password) => api.post("/auth/login", { email, password })`. Page components never call axios directly — only services.

## 5. REST contract (Spring Boot)

```
POST /api/auth/register            POST /api/auth/login
GET  /api/users/me                 PUT  /api/users/me
POST /api/accidents  (multipart: image + JSON)      GET /api/accidents
GET  /api/accidents/{id}           PUT  /api/accidents/{id}
POST /api/ai/analyze  (multipart image → YOLO JSON)
GET  /api/emergencies              GET  /api/emergencies/{id}
POST /api/emergencies/{id}/accept  POST /api/emergencies/{id}/reject
PUT  /api/emergencies/{id}/status  {"status":"ON_THE_WAY"}
GET  /api/notifications            PUT  /api/notifications/{id}/read
GET  /api/admin/users | /admin/responders | /admin/accidents
GET  /api/admin/analytics          GET  /api/admin/logs
```

AI response shape the frontend already consumes:

```json
{ "accidentDetected": true, "accidentType": "Vehicle Collision",
  "severity": "HIGH", "confidence": 0.94, "recommendedService": "AMBULANCE" }
```

Security notes baked into the prototype and expected of the backend: BCrypt password hashing, JWT filter on all `/api/**` except `/api/auth/**`, method-level `@PreAuthorize` per role — the frontend role guards are convenience only; Spring Boot is the final authority.

## 6. YOLO microservice contract

Small Flask/FastAPI service beside Spring Boot:

```
POST http://ai-service:5000/predict   (multipart image)
→ { "detected": true, "label": "vehicle_collision", "severity": "HIGH", "confidence": 0.94 }
```

Spring Boot's `AiService` maps the label to the enum, applies the service-recommendation rule (same rule mirrored in the prototype's `recommendService()`), persists the result on the report, and returns the combined JSON.

## 7. MySQL

Run `helpinghands_schema.sql` (MySQL 8.x), then point Spring Boot:

```
spring.datasource.url=jdbc:mysql://localhost:3306/helpinghands
spring.jpa.hibernate.ddl-auto=validate
```

## 8. FCM

On login the frontend requests a device token (`firebase/messaging`) and posts it to the backend; Spring Boot sends pushes via Firebase Admin SDK on: report submitted, service assigned, responder accepted/rejected, on-the-way, arrived, completed. The in-app bell stays as the persistent inbox (`notification` table).

## 9. Demo accounts (prototype)

```
user@helpinghands.demo · responder@helpinghands.demo · admin@helpinghands.demo
password: demo123   (mock credentials for presentation only)
```

Demo state is in-memory and shared across roles in one session — submit a report as the user, log out, log in as the responder, and the emergency appears in the queue; accept it and the user's timeline advances. Reloading resets the seed data.
