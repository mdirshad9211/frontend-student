# Government Exam Tracker Platform (MVP)

Production-grade **MERN (JavaScript-only)** modular monolith MVP for tracking government exams:

- Discover **eligible exams**
- See **active application forms**
- Track **interested / applied / preparing**
- Receive **email reminders** (cron) when deadlines are within 2 days
- Admin panel to manage exams, cycles, and users

> Note: Users **cannot apply on the platform**. All actions redirect to official portals.

## Tech

- **Frontend**: Vite + React + Tailwind CSS (no blue palette) + React Router + Axios + Framer Motion + React Hook Form + Zod + Lucide + react-hot-toast
- **Backend**: Node.js + Express + MongoDB + Mongoose + JWT + bcrypt + Nodemailer + node-cron + helmet + cors + morgan + rate limiting

## Project structure

- `client/` React frontend
- `server/` Express backend (modular monolith)

## Environment variables

### Backend

Copy:

- `server/.env.example` → `server/.env`

Required:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL` (default `http://localhost:5173`)

Optional (for real email sending):

- `EMAIL_USER`
- `EMAIL_PASS`

Optional (to seed an admin):

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Frontend

Copy:

- `client/.env.example` → `client/.env`

Set:

- `VITE_API_URL=http://localhost:5000`

## Run locally

### 1) Start MongoDB

Make sure MongoDB is running locally (or use a cloud MongoDB URI in `MONGO_URI`).

### 2) Start backend

```bash
cd server
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3) (Optional) Seed an admin user

```bash
cd server
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='yourStrongPassword' ADMIN_NAME='Admin' npm run seed:admin
```

### 4) Start frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Cleaning scraped exam data

If exam list or detail pages show raw HTML/script snippets from scraping:

- **Sanitize in place** (keeps exams, cleans text):
  ```bash
  cd server && npm run clean:exams
  ```
- **Delete all exams and cycles** (fresh start, then re-run scraper or admin sync):
  ```bash
  cd server && DROP_EXAMS=1 npm run clean:exams
  ```

## Admin panel

- UI login: `/admin/login`
- After login:
  - `/admin/dashboard`
  - `/admin/exams`
  - `/admin/exam-cycles`
  - `/admin/users`

## API (main)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `GET /api/exams`
- `GET /api/exams/:id`
- `GET /api/exams/eligible` (protected)
- `POST /api/user-exams` (protected)
- `GET /api/user-exams` (protected)
- `POST /api/admin/exam` (admin)
- `PUT /api/admin/exam/:id` (admin)
- `DELETE /api/admin/exam/:id` (admin)
- `POST /api/admin/exam-cycle` (admin)

