# NCMS-CAFM Project Estimation & Timeline

This document provides a detailed code status assessment, UI design strategy, and a day-by-day implementation schedule to complete the **NCMS CAFM** project for both the Backend API (`ncms-cafm`) and the Next.js Frontend (`ncms-fe`).

---

## 1. Project Tech Stack & Design System

To ensure a premium, modern, and high-performance user experience, the system will adhere to the following design aesthetics and technical protocols:

- **Frontend Core:** Next.js 16+ (using turbopack dev, React 19, TypeScript 5.x)
- **UI Components & Layout:** Materialize MUI NextJS Admin Template (React 19 compatible components, TailwindCSS 4.x + PostCSS for layouts, Iconify for dynamic icons)
- **Aesthetic Direction:**
  - **Color Palette:** harmonious slate & deep blue backgrounds, glassmorphism card panels with low opacity border glows, vivid teal/emerald accent indicators for statuses, and clean crimson/amber alerts.
  - **Typography:** Outfit & Inter fonts mapped via Google Fonts.
  - **Interactivity:** Micro-animations on dashboard KPI hover, skeleton loaders for tab navigation, slide-in sidebar overlays, and custom React-toastify alerts for validation feedback.

---

## 2. Current Code Status Summary

Based on a detailed check of both workspaces, here is the current codebase integration matrix:

| Workflow Phase | Feature / Component | Backend status (`ncms-cafm`) | Frontend status (`ncms-fe`) |
| :--- | :--- | :--- | :--- |
| **Phase 1: Foundation & Auth** | User Login & Signup | ✅ Completed (`/api/auth/login`) | ✅ Completed (`/login`, NextAuth) |
| | Forgot & Reset Password | ✅ Completed | ✅ Completed (`/forgot-password`, `/reset-password`) |
| | Permissions Catalog | ✅ Completed (`/api/permissions`) | ✅ Completed (`/permission` table, router-guards) |
| | Roles & Role-Permissions | ✅ Completed (`/api/roles`, `/api/role-permissions`) | ✅ Completed (`/roles` page, add/edit checkbox matrix) |
| | User Profiles & CRUD | 🟡 Partial (needs `manager_id`) | ✅ Completed (`/users` list + dialog form) |
| | Business Context | ✅ Completed (`/api/businesses`) | ✅ Completed (`/organization/business`) |
| | Client Management | ✅ Completed (`/api/clients`) | ✅ Completed (`/organization/client` table & dialog) |
| | Approval Workflow Masters | ✅ Completed (`/api/approvals/workflows`) | 🟡 Partial (`/organization/approvals` table only) |
| | Notifications Scaffold | 🟡 In-App CRUD API completed | ⬜ Not started (no layout bell or notifications center) |
| **Phase 2: Facility Management** | Facility CRUD & Details | ✅ Completed (`/api/facilities`) | ⬜ Not started |
| | Space Hierarchy | ✅ Completed (`/buildings`, `/floors`, `/zones`, `/units`) | ⬜ Not started (layout files mapped but no pages/views) |
| | Space Assignment | ⬜ Not started | ⬜ Not started |
| | Facility Documents | 🟡 Metadata only (no upload logic) | ⬜ Not started |
| **Phase 3: Asset Management** | Asset Categories Tree | ✅ Completed (`/api/asset-categories`) | ⬜ Not started (no tree select or category admin UI) |
| | Asset Status Master | ✅ Completed (`/api/asset-statuses`) | 🟡 List page exists, no forms |
| | Asset Registration | ⬜ Not started | ⬜ Not started |
| | QR & Barcode Generator | ⬜ Not started | ⬜ Not started |
| | Asset History & Transfers | ⬜ Not started | ⬜ Not started |
| | Custodians & Warranties | ⬜ Not started | ⬜ Not started |
| **Phase 4: Work Orders** | Complaints / Service Requests | ⬜ Not started | ⬜ Not started |
| | Work Order Lifecycle | ⬜ Not started | ⬜ Not started |
| | Technician Actions & App | ⬜ Not started | ⬜ Not started (technician mobile view is missing) |
| | SLA Timer & Tracking | 🟡 SLA rules exist, no active trackers | ⬜ Not started |
| **Phase 5: PPM** | PPM Checklists & Frequency | ⬜ Not started | ⬜ Not started |
| | PPM Scheduler & Cron | ⬜ Not started | ⬜ Not started |
| **Phase 6: Inventory** | Inventory Stock / Material reqs | ⬜ Not started | ⬜ Not started |
| **Phase 7: Vendors** | Vendor profile & contracts | ⬜ Not started | ⬜ Not started |
| **Phase 8: Property** | Unit Leasing & occupancy | ⬜ Not started | ⬜ Not started |
| **Phase 9: Utilities** | Meters & Consumption Logs | ⬜ Not started | ⬜ Not started |
| **Phase 10: Financial** | Cost rollup & Depreciation | ⬜ Not started | ⬜ Not started |
| **Phase 11: Reports** | Analytics & KPI Dashboard | ⬜ Not started | ⬜ Not started |
| **Phase 12: Mobile & API** | Mobile endpoints & ERP bridges | ⬜ Not started | ⬜ Not started |

---

## 3. Project Estimates & Schedule

### Resource Assumptions
- **Estimate Model:** 1 Senior Full-Stack Developer (with AI assistance) working continuously.
- **Estimated Development Duration:** **50 Working Days** (excluding weekends).
- **If split between 2 developers:** **~26-28 Calendar Days** (parallel execution).

---

## 4. Day-by-Day Task Schedule

### Week 1: Approvals Engine, Notifications & Master Configuration
*Focus: Complete remaining foundational platforms to unlock domain flows.*

- **Day 1 (Backend):** Implement `manager_id` reporting relationships in `User` schema and update user controllers. Scaffold backend `ApprovalRequest` collection and action endpoints (`submit`, `approve`, `reject`, `reassign`).
- **Day 2 (Backend):** Build state machine routing for Approvals. Wire up automatic triggers: when a resource (e.g. material request, invoice) requires approval, create request & call `notifyUser()` service.
- **Day 3 (Frontend):** Build custom approval flow creation screen (`/organization/approvals/add`) with dynamic level creation cards (add approval stages, assign manager roles).
- **Day 4 (Frontend):** Build "My Pending Approvals" action table dashboard with quick toggle filters (Received, Sent, Approved, Rejected) and responsive action modals.
- **Day 5 (Frontend & Backend):** Complete real-time notifications engine. Set up dynamic system triggers (SSE or long-polling/FCM socket stub) and design the floating sliding Notification panel in Next.js header layout.

### Week 2: Facility Documents Upload & Space Hierarchy UI
*Focus: Complete physical structure views with file attachment support.*

- **Day 6 (Backend):** Implement storage handler utility `src/utils/fileUpload.js` supporting local folder uploads with mime-type safety, hash verification, and dynamic filename generation.
- **Day 7 (Backend):** Update facility routes to allow file attachments on `FacilityDocument` and `FacilityPhoto`. Wire up static image asset caching and deletion scripts.
- **Day 8 (Frontend):** Design Facility Management main view. Implement dynamic tabs: Facility Settings, Building Configuration, SLA parameters, and Third-Party Certificates.
- **Day 9 (Frontend):** Add drag-and-drop file uploaders with progress feedback on facility documents page. Include inline PDF viewer and photo gallery previewers.
- **Day 10 (Frontend):** Build Space Hierarchy Sidebar (Accordion tree displaying: Facility ➔ Building ➔ Floor ➔ Zone ➔ Unit) with live occupancy badges and editing dialogs.

### Week 3: Asset Structure & Registration Form
*Focus: Bring Asset configuration and creation processes online.*

- **Day 11 (Frontend):** Design interactive Asset Category management tree page with parent-child nesting controls (expand/collapse tree nodes, move parent categories).
- **Day 12 (Backend):** Build `Asset` schema, incorporating categories, clients, location reference, and custom serial identifiers. Add validation middlewares.
- **Day 13 (Backend):** Create unique code generator service (`AssetCodeGenerator`) compiling QR code and barcode metadata strings upon registration.
- **Day 14 (Frontend):** Build multi-step Asset Registration wizard (Step 1: Category & Details, Step 2: Location & Custodian, Step 3: Purchase & Warranty details).
- **Day 15 (Frontend):** Implement Asset search filters dashboard. Configure fast key-value searches matching serials, categories, status tags, and facilities.

### Week 4: Asset Operations, Warranty & Transfer
*Focus: Active asset lifecycle tools and tracking features.*

- **Day 16 (Backend):** Build `AssetHistory` audit tracker schema. Automatically capture changes when assets are updated, relocated, or change statuses.
- **Day 17 (Backend):** Build Asset Transfer API (`POST /api/assets/:id/transfer`) handling internal, department, and site relocations. Include approval requirements when transfers cross departments.
- **Day 18 (Frontend):** Develop Asset Detail View containing visual timeline tracker (history logs: date, change type, technician, previous value ➔ new value).
- **Day 19 (Frontend):** Build Asset Transfer request panel, and Custodians assignment table.
- **Day 20 (Frontend & Backend):** Implement Warranty alerts dashboard. Setup cron checks on backend for warranty expiries and trigger email/in-app alert alerts.

### Week 5: Service Requests (Complaints Portal)
*Focus: Portal creation for end-users to raise and log facility issues.*

- **Day 21 (Backend):** Scaffold `ServiceRequest` (Complaint) schema with fields: subject, category, priority, reporter details, facility unit, and workflow status.
- **Day 22 (Backend):** Implement Service Request actions: Create, update status, cancel, and associate/convert into a Work Order.
- **Day 23 (Frontend):** Design a public/tenant friendly Complaint Request form wizard (simple description field, image capture upload, unit locator).
- **Day 24 (Frontend):** Design Operator SR Dashboard: A card-based board (New, Triaged, Scheduled, Closed) with detail modals to view complaints and assign technicians.
- **Day 25 (Frontend & Backend):** Connect SR actions to notification hub (send confirmation to client, alert supervisor of incoming urgent tickets).

### Week 6: Work Order Management Core
*Focus: Work Order models, transitions, and task assignments.*

- **Day 26 (Backend):** Define `WorkOrder` schema with type enums (Preventive, Corrective, Emergency) and status flows. Add technician reference keys.
- **Day 27 (Backend):** Implement Work Order creation and manual assignment controller. Track assignment history log inside work order model.
- **Day 28 (Frontend):** Design Supervisor Work Order Center: Detailed grid lists with bulk assignment buttons, priority indicators, and SLA timers.
- **Day 29 (Frontend):** Create Work Order Generation drawer popup, allowing supervisors to link requests, assets, and select technician checklist instructions.
- **Day 30 (Backend & Frontend):** Build SLA breach tracking. Implement automated calculation comparing facility SLA deadlines against work order start/completion dates.

### Week 7: Technician Mobile Flow & WO Closure
*Focus: Optimized workflows for field engineers completing tasks.*

- **Day 31 (Frontend):** Design mobile-responsive Technician view: "My Work Orders Today" listing assignments prioritized by urgency.
- **Day 32 (Frontend):** Implement technician action page: single button toggles for "Accept", "Start Work" (updating backend status to in-progress), and "Pause".
- **Day 33 (Frontend & Backend):** Build Work Order Checklist runner. Allow technicians to tick off checklist tasks and submit readings, verifying answers before submission.
- **Day 34 (Backend):** Implement Work Order Submission and Closure workflows. Supervisor approval required: if rejected, return to technician; if approved, lock and transition status to `closed`.
- **Day 35 (Backend):** Wire WO Close hooks: on closure, update corresponding `AssetHistory` timeline automatically.

### Week 8: Preventive Maintenance (PPM) Scheduler
*Focus: Master checklists and calendar schedules for PPM jobs.*

- **Day 36 (Backend):** Create Maintenance Checklist and Frequencies masters. Define schedules linking asset groups to technicians, checklists, and frequency rules.
- **Day 37 (Backend):** Implement the Daily Cron scheduler script `src/features/ppm/scripts/ppmScheduler.js` calculating due dates and auto-generating Preventive Work Orders.
- **Day 38 (Frontend):** Design checklist template builder form (add task fields, expected value ranges, upload photo requirements).
- **Day 39 (Frontend):** Design PPM Scheduling wizard. Enable supervisors to select assets, link them to checklists, assign recurrence rules, and select technicians.
- **Day 40 (Frontend):** Develop Interactive Scheduler Calendar: drag-and-drop calendar display showing upcoming, scheduled, and completed PPM tasks.

### Week 9: Inventory, Procurement & Vendor Portals
*Focus: Stock levels, purchase orders, and vendor databases.*

- **Day 41 (Backend):** Build `InventoryStock` & `InventoryTransaction` schemas. Implement stock levels table with adjustments API.
- **Day 42 (Backend):** Build Material Request routes: allow technicians to request parts from Work Orders, sending authorization demands to stock room managers.
- **Day 43 (Frontend):** Develop Inventory Directory page: table of spare parts, stock levels, storage bins, and dynamic alert flags for low-stock items.
- **Day 44 (Frontend & Backend):** Implement Purchase Requisition flows (auto-generated draft order if stock falls below threshold) and connect with vendor profile lists.
- **Day 45 (Frontend & Backend):** Build Vendor registration directory and Contracts repository panel (metadata, SLA limits, and PDF links).

### Week 10: Property, Utilities & Financial Allocations
*Focus: Tenant management, utility meter readings, and asset depreciation calculations.*

- **Day 46 (Backend & Frontend):** Build Property Lease and Occupancy charts. Track active tenant lists, units move-in/out calendars, and status grids (Vacant, Leased).
- **Day 47 (Backend & Frontend):** Create Utilities Meter Reading dashboard. Build mobile logger forms for utilities inspectors to input electricity, water, and gas values.
- **Day 48 (Backend & Frontend):** Build Financial Cost Centers allocations. Aggregate work order costs (materials + labor hours) against cost centers.
- **Day 49 (Backend):** Create depreciation calculation service using linear/declining balance methods. Track asset rollups.
- **Day 50 (Frontend & Backend):** Build Reports & Dashboards interface. Set up high-performance KPI aggregates, visual pie/bar charts, and export PDF/Excel generators.

---

## 5. Risk Assessment & Mitigations

1. **ERP / External Stock Bridge:**
   - *Risk:* Material requisitions depend on external ERP integration.
   - *Mitigation:* Scaffold a local mock fallback schema inside the CAFM DB so features work standalone if ERP integrations are delayed.
2. **Technician Mobile Usability:**
   - *Risk:* Screen layouts may fail on low-resolution smartphones.
   - *Mitigation:* Apply strict Mobile-First responsive CSS utilities on the Next.js routes under `/work-orders/technician`.
3. **Database Performance with Scheduled PPMs:**
   - *Risk:* Millions of cron queries calculating next due date can degrade DB response times.
   - *Mitigation:* Implement indexes on `next_due_date`, `b_id`, and `is_active` fields.
