# Office Portal — Setup Guide

Production-oriented **Employee Management & Attendance** stack:

- **Backend:** Node.js + Express (MVC-style folders), JWT auth, MongoDB via Mongoose  
- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS  
- **Configuration:** Office location, working hours, salary/leave rules live in **`SystemSettings`** (MongoDB), not in `.env`

---

## 1. Prerequisites

- Node.js **18+** (20 LTS recommended)  
- MongoDB Atlas cluster (or any MongoDB 6+)

---

## 2. MongoDB

1. Create a database user in Atlas.  
2. Whitelist your IP (or `0.0.0.0/0` for quick tests — tighten for production).  
3. Build a URI with a **database name**, for example:

`mongodb+srv://USER:PASSWORD@cluster.mongodb.net/office_portal?retryWrites=true&w=majority`

> **Security:** Never commit real credentials. Use `server/.env` locally (it is gitignored).

---

## 3. Backend (`server/`)

```bash
cd server
copy .env.example .env   # Windows — or: cp .env.example .env
```

Edit **`server/.env`**:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Full Mongo connection string (includes DB name) |
| `JWT_SECRET` | Long random string for signing tokens |
| `JWT_EXPIRES_IN` | Optional, default `7d` |
| `PORT` | API port, default `7895` |
| `CLIENT_ORIGIN` | Next.js origin for CORS, e.g. `http://localhost:3000` |

Install and run:

```bash
npm install
npm run dev
```

Health check: `http://localhost:7895/api/health`

---

## 4. Frontend (`web/`)

```bash
cd web
copy .env.example .env.local
```

Set:

`NEXT_PUBLIC_API_URL=http://localhost:7895`

```bash
npm install
npm run dev
```

Open **`http://localhost:3000`**.

---

## 5. First-time bootstrap

1. Open **`/setup`** and create the **first admin** account (only works when the database has **zero** users).  
2. Sign in at **`/login`**.  
3. As admin: **`/admin/settings`** — set real **office latitude/longitude**, **radius**, **timezone**, **working hours**, **leave allowance**, **deductions**, etc.  
4. **`/admin/employees`** — create employee accounts and **base salary**.  
5. Employees sign in and use **`/employee/attendance`** (browser will ask for location).  
6. **`/admin/salary`** — run **payroll** for a year/month to create **`MonthlySalaryRecord`** documents and PDF payslips.

---

## 6. API overview (high level)

| Area | Method | Path | Role |
|------|--------|------|------|
| Auth | POST | `/api/auth/login` | Public |
| Bootstrap | POST | `/api/auth/setup-admin` | Public (only if no users) |
| Me | GET | `/api/users/me` | Any logged-in |
| Employees | GET/POST/PATCH | `/api/users`, `/api/users/:id` | Admin |
| Settings (full) | GET/PUT | `/api/settings` | Admin |
| Settings (subset) | GET | `/api/settings/public` | Employee |
| Attendance | POST | `/api/attendance/check-in`, `/check-out` | Employee |
| Attendance | GET | `/api/attendance/today`, `/me` | Employee |
| Attendance report | GET | `/api/attendance/report` | Admin |
| Leaves | POST | `/api/leaves` | Employee |
| Leaves | GET | `/api/leaves/me` | Employee |
| Leaves | GET | `/api/leaves/pending` | Admin |
| Leaves | PATCH | `/api/leaves/:id/decision` | Admin |
| Notifications | GET/PATCH/POST | `/api/notifications/...` | Any |
| Salary preview | GET | `/api/salary/me/preview` | Employee |
| Salary records | GET | `/api/salary/me/records` | Employee |
| Payroll | POST | `/api/salary/generate` | Admin |
| Payslip | GET | `/api/payslips/:id`, `/api/payslips/:id/pdf` | Owner or Admin |
| Dashboard | GET | `/api/dashboard/employee`, `/api/dashboard/admin` | Role-specific |

---

## 7. Database schema (collections)

- **`users`** — email, password hash, name, `role` (`employee` \| `admin`), `baseSalary`, `isActive`  
- **`systemsettings`** — singleton document: office geo, work start, late rules, leave allowance, extra leave deduction rate, salary proration days, timezone  
- **`attendances`** — per user per `dateKey` (YYYY-MM-DD in company TZ): check-in/out timestamps, coordinates, `isLate`, `latePenaltyAmount`  
- **`leaverequests`** — user, range, `totalDays`, reason, `adminTag`, `status`, decided metadata  
- **`monthlysalaryrecords`** — unique `(userId, year, month)`: base, deduction lines, totals, `finalized`  
- **`notifications`** — per user inbox rows for leave events, etc.

---

## 8. Business logic notes

- **Geolocation:** Server computes distance (Haversine) vs DB office coordinates; outside radius → **403**.  
- **Late:** Compared to `workdayStartTime` + `lateGraceMinutes` in `companyTimeZone`. Penalty amount is stored on the attendance row at check-in using current settings and employee base salary.  
- **Leave balance:** Approved leave **calendar days** overlapping the month vs `monthlyLeaveAllowanceDays`; extra days × `extraLeaveDeductionPerDay`.  
- **Payroll:** Sums stored late penalties for the month + leave deduction; writes/updates **`MonthlySalaryRecord`**.

---

## 9. Production checklist

- Strong `JWT_SECRET`, HTTPS, secure cookie strategy if you move token off `localStorage`  
- Restrict MongoDB Atlas IP allowlist  
- Rotate any credentials that were shared in chat or tickets  
- Tune CORS `CLIENT_ORIGIN` to your real web origin  
- Consider rate limiting and audit logging on auth and attendance endpoints  

---

## 10. Project layout

```
office/
  server/
    src/
      config/      # DB
      controllers/
      middleware/  # JWT + roles
      models/
      routes/
      services/    # geo, dates, salary, notifications
      index.js
  web/
    app/           # Next.js routes (employee + admin UIs)
    components/
    lib/           # api client, auth helpers
```

This matches a clean **MVC-style** separation on the server and **route-based** UI on the client.
