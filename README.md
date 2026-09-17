# HelpingHands — AI-Powered Smart Accident Emergency Response System

HelpingHands is a full-stack emergency-response application with a React/Vite frontend and a Spring Boot REST API backed by MySQL.

## Project structure

```text
helpinghands-ready/
├── frontend/          React + Vite application
└── backend/           Spring Boot REST API
    ├── src/
    ├── pom.xml
    └── .env.example
```

There is only **one backend folder**. No separate SQL/database folder is required.

## Technology stack

- Frontend: React 18, Vite, Tailwind CSS, Recharts, Lucide React
- Backend: Java 17, Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security
- Authentication: JWT + BCrypt
- Database: MySQL 8
- AI integration: YOLO service configuration is supported; a mock AI service is available when the AI service is unavailable
- Notifications: Firebase Cloud Messaging configuration is supported

## Database — automatic setup

You do **not** need to manually run a `helpinghands_schema.sql` file.

When the backend starts, it connects using the configured MySQL credentials. The JDBC URL contains `createDatabaseIfNotExist=true`, so the `helpinghands` database is created automatically when it does not exist. If it already exists, the application simply uses the existing database.

Hibernate is configured with:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

Therefore, during development Hibernate creates missing tables and updates the schema to match the JPA entities without dropping the existing database. Existing data is preserved by normal `update` behavior.

> For production, use a proper migration tool such as Flyway/Liquibase and a controlled database user.

## Prerequisites

Install:

- JDK 17 or newer
- Maven 3.9+
- MySQL 8.x
- Node.js 18+ and npm

Make sure MySQL Server is running before starting the backend.

## Configure the backend

Open:

```text
backend/.env.example
```

Set your MySQL password through the environment/IDE configuration. The default local connection is equivalent to:

```text
Host: localhost
Port: 3306
Database: helpinghands
Username: root
```

The application can also be configured with `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JPA_DDL_AUTO`, `JWT_SECRET`, and other environment variables shown in `backend/.env.example`.

## Run backend using Windows CMD

From the project root:

```cmd
cd backend
mvn clean package
mvn spring-boot:run
```

The API runs on:

```text
http://localhost:8080
```

On first startup, the database and required tables are created automatically. The demo-account seeder also creates the demo accounts if they do not already exist. Restarting the backend does not create duplicate accounts.

## Demo accounts

Password for all demo accounts: `demo123`

| Email | Role |
|---|---|
| `user@helpinghands.demo` | USER |
| `responder@helpinghands.demo` | RESPONDER — Ambulance |
| `admin@helpinghands.demo` | ADMIN |
| `arjun.mehra@police.example` | RESPONDER — Police |
| `kavita.rao@fire.example` | RESPONDER — Fire Dept |

The Admin account is seeded automatically and cannot be self-registered through the public registration endpoint.

## Run frontend using Windows CMD

Open a second CMD window from the project root:

```cmd
cd frontend
npm install
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

## Run the complete application

Start MySQL, then use two CMD windows.

**CMD 1 — backend:**

```cmd
cd backend
mvn spring-boot:run
```

**CMD 2 — frontend:**

```cmd
cd frontend
npm install
npm run dev
```

Then open the frontend URL shown by Vite.

## Main backend API

Authentication:

- `POST /api/auth/register` — register a user/responder
- `POST /api/auth/login` — login and receive a JWT

User/profile:

- `GET /api/users/me` — get the logged-in user
- `PUT /api/users/me` — update the logged-in user's profile

Accident reporting, responder/dispatch, notifications, administration, and related services are implemented in the backend packages under `com.helpinghands`.

## Security

- Passwords are stored as BCrypt hashes.
- JWT authentication protects API routes.
- Role-based access control is enabled.
- Admin accounts are not publicly self-registerable.
- Do not use the development JWT secret or demo passwords in production.

## Useful folders

```text
backend/src/main/java/com/helpinghands/
├── controller/      REST endpoints
├── service/         business logic
├── repository/      Spring Data repositories
├── entity/          JPA entities and enums
├── dto/             API request/response objects
├── mapper/          entity-to-DTO mapping
├── security/        JWT and security configuration
├── exception/       API exception handling
├── config/          application configuration
└── bootstrap/       automatic demo-account seeding

frontend/src/
├── api/             API configuration
├── services/        frontend service layer
├── components/      reusable UI components
├── layouts/         application layouts
├── pages/           user/responder/admin pages
├── mocks/            demo/mock data where used
└── utils/            shared constants and utilities
```

## Important

The project intentionally does not contain a separate `database/` folder or SQL schema file. Database creation and table creation are handled automatically by the Spring Boot configuration for local development.
