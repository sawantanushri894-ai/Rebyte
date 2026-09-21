# ReByte

> **Corporate-Minimal Electronics Component Management, Rental, E-Waste Recycling & Mini-Project Mentorship Platform**  
> *Developed for engineering students in Mumbai University / VIVA Institute of Technology (ECE Department).*

---

## Table of Contents
1. [Overview](#overview)
2. [Target Tech Stack](#target-tech-stack)
3. [Architecture & Lifecycle State Machine](#architecture--lifecycle-state-machine)
4. [Admin Control Center (7 Pillars + Login Audit)](#admin-control-center-7-pillars--login-audit)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Running Locally](#running-locally)
   - [Testing the API](#testing-the-api)
   - [Single-Server Production Deployment](#single-server-production-deployment)
7. [Pre-Seeded Accounts](#pre-seeded-accounts)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Interactive Visual API Console](#interactive-visual-api-console)

---

## Overview

**ReByte** is an end-to-end full-stack platform designed to solve hardware scarcity, reduce e-waste, and streamline mini-project capstone mentorship for engineering students. Students can borrow tested microcontrollers (ESP32, Arduino, Raspberry Pi, STM32), sensors, and actuators with refundable security deposits, buy components outright, donate salvaged e-waste for circular lab restoration, and submit capstone proposals for faculty guidance.

### Highlights:
- **7-Step Lifecycle State Machine**: From college ID registration and OTP simulation to offline lab counter pickups and automated deposit settlement upon return.
- **Corporate Slate & Obsidian Dark Theme**: Gentle on the eyes, styled with clean Plus Jakarta Sans typography, tabular-nums for numbers, and zero-bounce micro-interactions.
- **Dual-Mode Supabase / Local Fallback**: Connects to live Supabase PostgreSQL or seamlessly switches to a local in-memory store pre-seeded with Mumbai University ECE syllabus hardware.
- **Strict Role-Based Access Control (RBAC)**: Enforced via JWT with automated `403 Forbidden Barrier Card` protecting administrative resources.

---

## Target Tech Stack

### Frontend (`client/`)
- **Core**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Corporate Slate/Obsidian Design System
- **Icons**: Lucide React
- **Animations**: Framer Motion (slide-overs, tab switches, zero-bouncy easing)
- **Typography**: Plus Jakarta Sans, Inter & JetBrains Mono

### Backend (`server/`)
- **Runtime**: Node.js + Express (Port 5000)
- **Authentication**: JWT Bearer Tokens + Bcrypt
- **Database**: Supabase PostgreSQL with automated Dual-Mode In-Memory Fallback (`server/config/supabase.js`)
- **Serving**: Single-Server Unified Serving (Express serves static Vite `client/dist` and `/api/*` simultaneously)

---

## Architecture & Lifecycle State Machine

The platform implements the complete 7-step hardware lifecycle:

| Step | Stage | Description | Key Endpoint |
| :--- | :--- | :--- | :--- |
| **Step 1** | **Register** | Student registers with college domain (`@viva.edu.in`/`@mu.ac.in`) and college ID. Receives simulated 6-digit OTP. Profile flagged as `pending_verification`. | `POST /api/auth/register` |
| **Step 2** | **Verify** | Lab faculty inspects college ID card scan and marks student as `verified`, unlocking borrowing privileges. | `POST /api/admin/users/:id/verify` |
| **Step 3** | **Browse** | Catalog search with real-time category filtering (Microcontrollers, Sensors, Actuators, Displays, Tools, E-Waste). | `GET /api/inventory` |
| **Step 4** | **Request** | Mixed cart basket allowing combination of rentals (with daily rates * duration) and outright purchases. | `POST /api/rentals` |
| **Step 5** | **Payment** | Multi-channel payment recording: UPI QR reference, Card metadata, and Offline College Store cash pickup token generation (`RNT-YYYYMMDD-###`). | `POST /api/rentals` & `POST /api/payments` |
| **Step 6** | **Collect & Track** | Lab counter officer verifies pickup token, hands over hardware, transitions rental to `COLLECTED`, and activates live countdown/due-date tracker in Student Account. | `PATCH /api/rentals/:id/collect` |
| **Step 7** | **Return & Settle** | Counter condition inspection (`GOOD`, `MINOR_DAMAGE`, `DAMAGED_UNUSABLE`), damage/late fine calculation, automated stock restock (`+1`), and deposit refund ledger entry. | `PATCH /api/rentals/:id/return` |

---

## Admin Control Center (7 Pillars + Login Audit)

The administrative control center provides full oversight across 8 operational domains:

1. **User Management**: Review student registrations, inspect college ID cards, approve or reject applications.
2. **Inventory Management**: Real-time stock CRUD, daily rental rates, purchase replacement values, and security deposits.
3. **Rental & Return Management**: Track active, collected, and overdue rentals with direct triggers for Step 6 collection and Step 7 inspection & refund.
4. **Payment Management**: Unified financial ledger recording UPI transactions, Card payments, and Counter Cash tokens.
5. **Donation Verification**: E-waste triage with **1-Click Restock** (`POST /api/admin/donations/:id/restock`) that automatically converts verified e-waste salvage into active catalog inventory.
6. **Mini Project Management**: Review technical capstone proposals, domain tags (`IoT`, `Robotics`, `AI`), and assign faculty guides (e.g. `Prof. K. Venkatesh`).
7. **Reports & Analytics**: Real-time KPIs (hardware utilization rate %, e-waste recycled kg, student savings ₹) + dynamic Revenue Sharing calculator slider (College % vs Service Provider %).
8. **Login Audit History**: Queryable security audit trail tracking `user_id`, `email`, `role`, `ip_address`, `user_agent`, `status` (`SUCCESS`/`FAILED`), and `failure_reason`.

---

## Project Structure

```
REBYTE/
├── .gitignore                   # Git ignore definitions (node_modules, dist, envs, logs)
├── package.json                 # Root orchestrator scripts
├── README.md                    # Project documentation
├── server/
│   ├── package.json             # Express, JWT, Supabase, CORS, UUID
│   ├── server.js                # Express app (port 5000), API router, visual console & static dist serving
│   ├── config/
│   │   └── supabase.js          # Dual-mode Supabase client & pre-seeded local fallback store
│   ├── middleware/
│   │   └── auth.js              # authenticate, requireAdmin (standard 403 Forbidden payload)
│   ├── controllers/
│   │   ├── authController.js    # Register (domain check & OTP), login (audit log), verify OTP
│   │   ├── adminController.js   # User verify, inventory CRUD, 1-click restock, mentor assign, analytics, audit log
│   │   ├── inventoryController.js# List, search, category filter, stock updates
│   │   ├── rentalController.js  # Rental checkout, Step 6 collect, Step 7 return with deposit refund
│   │   ├── paymentController.js # Offline cash token generator, UPI QR, card ledger
│   │   ├── donationController.js# E-waste donation submissions
│   │   └── projectController.js # Mini-project capstone proposals & mentor assignments
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── rentalRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── donationRoutes.js
│   │   └── projectRoutes.js
│   └── tests/
│       └── api.test.js          # Automated verification test suite (51/51 assertions)
└── client/
    ├── package.json             # React 18, Vite, Tailwind CSS, Lucide React, Framer Motion
    ├── vite.config.js           # Vite dev server + proxy to localhost:5000
    ├── tailwind.config.js       # Corporate obsidian & slate color palette
    ├── postcss.config.js
    ├── index.html               # Plus Jakarta Sans, Inter typography & metadata
    └── src/
        ├── index.css            # Corporate design system tokens, hairlines, semantic pills
        ├── main.jsx             # React entry point
        ├── App.jsx              # Main shell, lifecycle tracker, role switcher, modals
        └── components/
            ├── admin/
            │   ├── AdminControlCenter.jsx  # 7 pillars + Login Audit
            │   └── ForbiddenBarrier.jsx   # Corporate glassmorphic 403 barrier card
            ├── student/
            │   ├── RentalCheckoutDrawer.jsx # Slide-over basket, duration stepper, token generation
            │   ├── StudentAccountDrawer.jsx # Live countdowns, active rentals, due-dates
            │   ├── CatalogGrid.jsx          # Component cards, search, category filter
            │   ├── DonationModal.jsx        # E-waste donation modal
            │   └── ProjectMentorshipModal.jsx # Capstone submission modal
            └── shared/
                ├── Navbar.jsx               # Header, cart count, role toggle, account trigger
                ├── LifecycleBanner.jsx      # Interactive 7-step workflow banner
                └── AuthModal.jsx            # Register with college ID, OTP simulation, login
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher)
- `npm` (version 9.0.0 or higher)

### Installation

Clone the repository and install all dependencies:
```bash
# Install root, server, and client dependencies
npm run install:all
```

Alternatively, install step-by-step:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### Environment Configuration (Optional)
To connect a live Supabase PostgreSQL instance, create `server/.env`:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
> *Note: If no Supabase credentials are provided, ReByte automatically runs in **Dual-Mode Local Fallback**, using an in-memory database pre-seeded with realistic data.*

---

### Running Locally

You can run ReByte in two ways:

#### Option 1: Dual-Process Development Mode (Recommended for Development)
```bash
# Starts Express on Port 5000 and Vite Dev Server on Port 5173
npm run dev
```
- **Frontend URL**: [http://localhost:5173/](http://localhost:5173/) *(Hot-Reloading enabled, automatically proxies `/api` calls to port 5000)*
- **Backend API URL**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

#### Option 2: Single-Server Production Unified Serving
```bash
# Build the client bundle and start the unified Express process
npm run build
npm start
```
- **Unified Frontend & Backend URL**: [http://localhost:5000/](http://localhost:5000/)

---

### Testing the API

ReByte includes a comprehensive automated test suite testing all 7 lifecycle steps, the 7 admin pillars, login audits, and RBAC 403 checks:

```bash
npm run test:api
```

**Expected Test Output**:
```text
======================================================
  REBYTE SYSTEM API VERIFICATION TEST RUNNER
======================================================

--- TEST 1: Healthcheck & Dual-Mode Config ---
  ✅ PASS: GET /api/health returned 200 OK
  ✅ PASS: Platform status is ONLINE
  ✅ PASS: Dual-mode database reported

--- TEST 2: Admin Login & JWT Audit ---
  ✅ PASS: POST /api/auth/login (Admin) returned 200 OK
  ✅ PASS: Admin JWT token received
  ✅ PASS: Admin role authenticated

--- TEST 3: Student Login & JWT Audit ---
  ✅ PASS: POST /api/auth/login (Student) returned 200 OK
  ✅ PASS: Student JWT token received
  ✅ PASS: Student role authenticated

--- TEST 4: RBAC 403 Forbidden Barrier Check ---
  ✅ PASS: Unauthenticated request to /api/admin/users returns 401
  ✅ PASS: Student accessing /api/admin/users returns 403 Forbidden
  ✅ PASS: Response payload has success: false
  ✅ PASS: Standardized 403 message returned

--- TEST 5: Step 1 (Student Registration & OTP Simulation) ---
  ✅ PASS: Registration rejects non-college domain with 400
  ✅ PASS: POST /api/auth/register returned 201 Created
  ✅ PASS: New user status is pending_verification
  ✅ PASS: Mock 6-digit OTP generated

--- TEST 6: Step 2 (Admin Verifies Student Account) ---
  ✅ PASS: POST /api/admin/users/:id/verify returned 200
  ✅ PASS: Student status updated to verified

--- TEST 7: Step 3 (Catalog Search & Category Filter) ---
  ✅ PASS: GET /api/inventory?category=Microcontrollers returned 200
  ✅ PASS: Returned items for Microcontrollers
  ✅ PASS: All returned items match category
  ✅ PASS: GET /api/inventory?search=esp32 returned 200
  ✅ PASS: ESP32 found by search query

--- TEST 8: Step 4 & 5 (Rental Request, Deposit & Offline Token) ---
  ✅ PASS: POST /api/rentals returned 201 Created
  ✅ PASS: Unique offline token generated (RNT-*-###)
  ✅ PASS: 2 rental items processed in mixed basket
  ✅ PASS: Security deposit correctly computed

--- TEST 9: Student Rentals List & Tracker ---
  ✅ PASS: GET /api/rentals/my returned 200
  ✅ PASS: Created rental found in student account

--- TEST 10: Step 6 (Explicit COLLECTED State Handler) ---
  ✅ PASS: PATCH /api/rentals/:id/collect returned 200
  ✅ PASS: Rental transitioned to explicit COLLECTED state
  ✅ PASS: collected_at timestamp recorded
  ✅ PASS: due_date timestamp generated for countdown tracker

--- TEST 11: Step 7 (Return Condition Inspection & Deposit Refund) ---
  ✅ PASS: PATCH /api/rentals/:id/return returned 200
  ✅ PASS: Rental status updated to RETURNED
  ✅ PASS: Security deposit refunded
  ✅ PASS: Automated refund logged in payment ledger

--- TEST 12: Admin Pillar 5 (Donations 1-Click Restock) ---
  ✅ PASS: POST /api/admin/donations/don-01/restock returned 200
  ✅ PASS: Donation status updated to RESTOCKED
  ✅ PASS: Refurbished item active in catalog stock

--- TEST 13: Admin Pillar 6 (Assign Faculty Mentor) ---
  ✅ PASS: PATCH /api/admin/projects/proj-02/mentor returned 200
  ✅ PASS: Prof. K. Venkatesh assigned as faculty mentor
  ✅ PASS: Project status updated to APPROVED

--- TEST 14: Admin Pillar 7 (Reports & Dynamic Revenue Sharing Slider) ---
  ✅ PASS: GET /api/admin/analytics returned 200
  ✅ PASS: KPI utilization rate calculated
  ✅ PASS: College share set to 75%
  ✅ PASS: Provider share set to 25%

--- TEST 15: Admin Pillar 8 (Login Audit History) ---
  ✅ PASS: GET /api/admin/audits/logins returned 200
  ✅ PASS: Audit history contains records
  ✅ PASS: Admin login captured in audit

======================================================
  ALL API TESTS PASSED! (51/51 assertions)
======================================================
```

---

## Pre-Seeded Accounts

The application includes pre-seeded accounts for testing:

| Role | Email | Password | Name | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Faculty Admin** | `admin@viva.edu.in` | `admin123` | **Prof. K. Venkatesh** | Full admin privileges: ID approvals, inventory CRUD, 1-click restock, login audits. |
| **Verified Student** | `anushka.ece@viva.edu.in` | `student123` | **Anushka Sharma** | 2nd Year ECE student. Active rentals, live due-date tracker, checkout privileges. |
| **Pending Student** | `rahul.ece@viva.edu.in` | `student123` | **Rahul Patil** | Simulates Step 1 OTP and Step 2 pending admin verification. |

> *Tip: Use the **Student / Faculty Admin** toggle in the top-right corner of the website navbar to switch roles instantly without logging in manually.*

---

## API Endpoints Reference

### Public Endpoints
- `GET /api/health` — System status, port, and database mode.
- `GET /api` — Interactive Visual API Explorer & Console.
- `GET /api/inventory` — Catalog listing (supports `?category=...` and `?search=...`).
- `GET /api/inventory/categories` — List of unique inventory categories.
- `GET /api/inventory/:id` — Single component details.
- `POST /api/auth/register` — Student registration with domain validation & OTP simulation.
- `POST /api/auth/verify-otp` — Student OTP verification.
- `POST /api/auth/login` — Account login, JWT issuance, and login audit log entry.

### Authenticated Student Endpoints (`Authorization: Bearer <token>`)
- `GET /api/auth/me` — Current authenticated user profile.
- `POST /api/rentals` — Mixed basket checkout & offline pickup token generation (`RNT-*-###`).
- `GET /api/rentals/my` — Student rental history with live countdown tracker.
- `POST /api/donations` — Log e-waste donation.
- `GET /api/donations/my` — Student e-waste donation history.
- `POST /api/projects` — Submit capstone mini-project proposal.
- `GET /api/projects/my` — Student capstone proposals and assigned mentor status.

### Authenticated Admin Endpoints (`requireAdmin` Protected)
- `GET /api/admin/users` — List users (filter by `?role=...` or `?status=...`).
- `POST /api/admin/users/:id/verify` — Approve & verify student account (Step 2).
- `POST /api/admin/users/:id/reject` — Reject student registration with reason.
- `POST /api/admin/inventory` — Add new component to catalog.
- `PUT /api/admin/inventory/:id` — Update stock, daily rates, purchase price, or deposit.
- `DELETE /api/admin/inventory/:id` — Remove component from catalog.
- `GET /api/admin/rentals` — Track all student rentals.
- `PATCH /api/rentals/:id/collect` — Step 6: Counter handover sign-off (transitions to `COLLECTED`).
- `PATCH /api/rentals/:id/return` — Step 7: Condition inspection, fine calculation, restock & deposit refund.
- `GET /api/admin/payments` — Unified financial ledger.
- `GET /api/admin/donations` — List all student e-waste donations.
- `POST /api/admin/donations/:id/restock` — 1-Click convert e-waste into active catalog stock.
- `GET /api/admin/projects` — List capstone project proposals.
- `PATCH /api/admin/projects/:id/mentor` — Assign faculty mentor & approve proposal.
- `GET /api/admin/analytics` — KPI metrics & dynamic revenue sharing calculator (`?college_pct=...`).
- `GET /api/admin/audits/logins` — Queryable security login audit history.

---

## Interactive Visual API Console

If you want to inspect and test the backend visually without writing terminal commands:

👉 Open **[http://localhost:5000/api](http://localhost:5000/api)** in your browser.

Features:
- Live **"Execute Test"** buttons for `/api/health`, `/api/inventory`, and `/api/admin/analytics`.
- **One-click Faculty Login test** generating live JWT bearer tokens.
- **Direct Link** to open the graphical frontend.

---

## Academic Context & Attribution
- **Institution**: VIVA Institute of Technology, Shirgaon, Virar (East), Mumbai.
- **Affiliation**: University of Mumbai.
- **Department**: Electronics & Computer Engineering (ECE).
- **Target Audience**: Second-Year (SE) and Third-Year (TE) ECE Students for BMD, Microprocessors, Embedded Systems & IoT syllabus lab coursework.

---

## License
MIT License. Created by the ReByte Architectural Engineering Team.
