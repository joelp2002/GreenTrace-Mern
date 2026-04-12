# GreenTrace (custodial chain & geospatial mapping for DENR seedling reconciliation) - DENR/PENRO Marinduque

GreenTrace is a full-stack MERN application for DENR seedling reconciliation with strict role-based access control (RBAC), JWT auth, permit tracking, seedling batch recording, and geospatial planting site management.

Group members:
Joel F. Pariño: - Leader
Justin Z. Chavez –  Programmer
Wendell P. Rosales – Analyst
Reymart C. Recaña – Researcher


## Tech Stack

- Frontend: React + Vite + React Router + Axios
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth/Security: JWT + bcryptjs

## Final RBAC Matrix

- ADMIN: Dashboard, Staff, Profile
- FRU: Dashboard, Permits, Profile
- NGP: Dashboard, Seedlings, Sites & map, Profile
- MES: Dashboard, Permits, Seedlings, Sites & map, Reports, Profile

## Backend Permission Rules

- Permits access/mutate: FRU, MES
- Seedlings access/mutate: NGP, MES
- Sites access/mutate: NGP, MES
- Reports: MES only
- Staff/user management: ADMIN only

## Project Structure

```text
greentrace(Mern)/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Data Model Summary

- users (`User`)
  - role enum: ADMIN, FRU, NGP, MES
  - password hashed with bcryptjs
- permits (`Permit`)
  - references issuedBy -> User
- seedlings (`Seedling`)
  - references permit -> Permit
  - references plantingSite -> PlantingSite
  - references recordedBy -> User
- plantingsites (`PlantingSite`)
  - GeoJSON point + 2dsphere index
  - embedded photos array

This satisfies distinct collections and reference/embedding requirements.

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB URI (Atlas or local)

### Backend

```bash
cd backend
npm install
```

Create `.env` in `backend` and set at least:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=7d
PORT=5001
FRONTEND_URL=http://localhost:5173
API_PUBLIC_URL=http://localhost:5001
```

Run backend:

```bash
npm run dev
```

Backend base URL: `http://localhost:5001/api/v1`

### Frontend

```bash
cd frontend
npm install
```

Create `.env` in `frontend`:

```env
VITE_API_URL=http://localhost:5001
```

Run frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## Safe ADMIN Bootstrap

Public registration cannot create ADMIN. To create the first ADMIN safely:

```bash
cd backend
npm run seed-admin
```

Default bootstrap credentials:

- email: admin@greentrace.com
- password: admin12345
- fullName: System Admin
- organizationUnit: System Administration

Optional env overrides:

- BOOTSTRAP_ADMIN_EMAIL
- BOOTSTRAP_ADMIN_PASSWORD
- BOOTSTRAP_ADMIN_FULL_NAME
- BOOTSTRAP_ADMIN_ORG_UNIT

## API Reference (`/api/v1`)

Public endpoints:

- POST `/auth/register` (always creates NGP)
- POST `/auth/login`
- GET `/health`

Authenticated user endpoints:

- GET `/auth/me`
- PATCH `/auth/me`

ADMIN-only endpoints:

- POST `/auth/staff`
- GET `/auth/users`
- PATCH `/auth/users/:id/role`

Permits (FRU, MES):

- GET `/permits`
- GET `/permits/:id`
- POST `/permits`
- PATCH `/permits/:id`
- DELETE `/permits/:id`

Seedlings (NGP, MES):

- GET `/seedlings/permit-options`
- GET `/seedlings`
- GET `/seedlings/:id`
- POST `/seedlings`
- PATCH `/seedlings/:id`
- DELETE `/seedlings/:id`

Sites (NGP, MES):

- GET `/planting-sites`
- GET `/planting-sites/:id`
- GET `/planting-sites/near?near=lng,lat&maxKm=50`
- POST `/planting-sites`
- PATCH `/planting-sites/:id`
- POST `/planting-sites/:id/photos`
- DELETE `/planting-sites/:id`

Reports (MES only):

- GET `/reports/summary`

Uploads (NGP, MES):

- POST `/upload` (multipart field: `photo`)

## Postman Demo Checklist

1. Public register -> POST `/auth/register` -> role becomes NGP
2. Login -> POST `/auth/login` -> receives JWT
3. Current user -> GET `/auth/me` with bearer token
4. ADMIN actions:
   - POST `/auth/staff`
   - GET `/auth/users`
   - PATCH `/auth/users/:id/role`
5. RBAC denials (403):
   - FRU denied from `/reports/summary`
   - NGP denied from `/permits`
   - MES denied from `/auth/users`
   - ADMIN denied from permits/seedlings/sites/reports modules (strict matrix)
6. Validation/error demo:
   - missing required fields -> 400
   - duplicate email -> 409
   - no/invalid token -> 401

## Frontend Behavior

- React Router route protection with `PrivateRoute` + `RoleGate`
- Navbar links are role-based and hidden when unauthorized
- Access Denied fallback remains active for blocked routes
- Dashboard behavior:
  - MES: expanded cards + `/reports/summary` call
  - ADMIN/FRU/NGP: simple dashboard, no report summary call

## Deployment (for final submission)

Add your live links once deployed:

- Frontend (Vercel): `https://green-trace-mern.vercel.app`
- Backend (Render): `https://greentrace-backend-eue1.onrender.com`
- Postman Documentation: `https://documenter.getpostman.com/view/53538797/2sBXirjo9h`

## Final Submission Checklist
- [x] Project Title and Team Members
- [x] Live frontend URL
- [x] Live backend URL
- [x] Postman collection/export 
- [ ] Proposal PDF

