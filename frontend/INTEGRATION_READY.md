# HelpingHands — Frontend/Backend Integration

Connected to the supplied Spring Boot backend for:

- POST /api/auth/login
- POST /api/auth/register
- GET /api/users/me
- PUT /api/users/me
- JWT storage and authenticated requests
- profile refresh after reload
- JWT expiry logout

Run `npm install` and `npm run dev` in this frontend. Default backend: http://localhost:8080.

The supplied backend currently exposes authentication and current-user profile controllers. Accident, emergency, notification, AI and admin screens remain prototype/mock until those backend controllers are added.
