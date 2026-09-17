# HelpingHands Frontend

React + Vite frontend for the HelpingHands emergency-response application.

## Run

From this folder in Windows CMD:

```cmd
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Backend

The real backend is located at the sibling folder:

```text
../backend
```

There is no duplicate `frontend/backend` folder and no SQL database file in the frontend. The Spring Boot backend creates/updates the MySQL database automatically for local development.

## Demo login

- Admin: `admin@helpinghands.demo`
- User: `user@helpinghands.demo`
- Responder: `responder@helpinghands.demo`
- Password: `demo123`

## Build

```cmd
npm run build
```
