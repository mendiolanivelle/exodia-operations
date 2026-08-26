# Exodia Operations Portal — System Pipeline Documentation

> Generated: 2026-Aug-26
> Purpose: Complete reference for AI agents and developers working on this codebase

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [End-to-End Data Flow](#2-end-to-end-data-flow)
3. [Supabase Tables](#3-supabase-tables)
4. [Supabase Queries by Action](#4-supabase-queries-by-action)
5. [UI Status Labels](#5-ui-status-labels)
6. [Component Tree](#6-component-tree)
7. [Cross-Component Events](#7-cross-component-events)
8. [State Management](#8-state-management)
9. [Gmail Integration](#9-gmail-integration)
10. [Internal Readiness Form Status](#10-internal-readiness-form-status)
11. [Marketing Pipeline](#11-marketing-pipeline)
12. [Decision Modal Flow](#12-decision-modal-flow)

---

## 1. Architecture Overview

**Stack**: React 19 + Vite 6 + Tailwind CSS + Supabase (PostgreSQL)
**Deployment**: Docker on Coolify (operations.exodiagamedev.com)
**Auth**: Supabase Auth (email/password)
**Integrations**: Google Gmail API, Google Calendar API

### Codebase Layout

```
src/
├── App.jsx                          # Router: /login and /
├── lib/
│   ├── supabase.js                  # Supabase client singleton
│   └── AuthContext.jsx              # Auth provider + token management
├── pages/
│   ├── Login.jsx                    # Login page
│   └── Dashboard.jsx                # Main layout with sidebar tabs
├── components/
│   ├── ProjectList.jsx              # Operations project list (~2650 lines)
│   ├── MarketingProjectList.jsx     # Marketing view
│   ├── ProjectReviewTicket.jsx      # Ticket review + proceed
│   ├── ManpowerPricing.jsx          # Pricing CRUD
│   ├── Players.jsx                  # Player roster
│   ├── RoleInventory.jsx            # Role inventory
│   ├── Projects.jsx                 # Project dashboard
│   ├── MeetingNotesModal.jsx        # (inline in ProjectList)
│   └── modals/
│       ├── ScheduleMeetingModal     # (inline in MarketingProjectList)
│       ├── EmailComposeModal        # (inline in ProjectReviewTicket)
│       └── FeasibilityDecisionModal # (inline in ProjectList)
├── data/
│   └── manpowerPricingSeed.js       # Seed data for pricing
└── index.css                        # Tailwind + custom styles
```

---

## 2. End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 0: TICKET ENTRY (External System)                       │
│  External system inserts into project_review_tickets            │
│  status = 'Sent'                                               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 1: TICKET REVIEW (ProjectReviewTicket.jsx)               │
│  Operations views ticket, clicks "Proceed to Feasibility check" │
│                                                                 │
│  WHAT HAPPENS:                                                  │
│  1. EmailComposeModal opens (pre-filled HTML email to Marketing) │
│  2. User fills recipient, clicks "Send email to Marketing"      │
│  3. POST to Gmail API → sends email                             │
│  4. handleProceed() runs:                                       │
│     a. Check duplicates in potential_projects by tracking_id    │
│     b. INSERT into potential_projects:                          │
│        - project_name, client_name, tracking_id, sent_at        │
│        - status = 'leads', phase = 'initiation', pillar = ''    │
│     c. UPDATE project_review_tickets status = 'proceeded'       │
│     d. Dispatch 'prt-projects-updated' event                    │
│     e. Show Toast with "Go to Project List" button              │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 2: MARKETING SCHEDULES DISCOVERY (MarketingProjectList)   │
│  Marketing sees project in their list, clicks to schedule       │
│                                                                 │
│  WHAT HAPPENS:                                                  │
│  1. ScheduleMeetingModal opens                                  │
│  2. User enters date/time + attendee emails                     │
│  3. POST to Google Calendar API → creates event + Google Meet   │
│  4. handleScheduled() runs:                                     │
│     a. UPDATE potential_projects:                               │
│        status = 'discovery_scheduled'                           │
│        meet_link = Google Meet URL                              │
│        event_id = Calendar event ID                             │
│        discovery_scheduled_at = now                             │
│     b. Dispatch 'prt-projects-updated' event                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 3: DISCOVERY MEETING (ProjectList — Leads tab)           │
│  Operations sees "Discovery Call - Scheduled" status            │
│                                                                 │
│  WHAT HAPPENS:                                                  │
│  1. Click project row → detail modal with Google Meet link      │
│  2. Options:                                                    │
│     a. "Discovery Meeting Documentation" → MeetingNotesModal    │
│        - Enter notes (textarea) + video recording link          │
│        - Saves to additional_attachments (JSONB array)          │
│        - Also updates local notes/videoLink fields              │
│     b. "Proceed to Feasibility Decision" → FeasibilityDecisionModal│
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 4: FEASIBILITY DECISION (FeasibilityDecisionModal)       │
│  Operations selects ACCEPTED or DECLINED                        │
│                                                                 │
│  WHAT HAPPENS:                                                  │
│  1. Decision radio: Go / Decline                                │
│  2. Email auto-generates subject + body                         │
│  3. User enters recipient email, optional reasons               │
│  4. Clicks "Submit Decision"                                    │
│  5. Sends email via Gmail API (POST)                            │
│  6. On success:                                                 │
│                                                                 │
│  IF ACCEPTED (decision === 'go'):                               │
│    handleFeasibilityApprove(project):                           │
│      UPDATE potential_projects SET                              │
│        status = 'feasibility_accepted',                         │
│        phase = 'initiation',                                    │
│        decision = 'accepted',                                   │
│        feasibility_decision_at = now,                           │
│        pillar = 'Discovery'                                     │
│      WHERE id = project.id                                      │
│    Then refetch projects table for approved count               │
│                                                                 │
│  IF DECLINED (decision === 'decline'):                          │
│    handleDecline(project):                                      │
│      UPDATE potential_projects SET                              │
│        status = 'feasibility_declined',                         │
│        decision = 'declined',                                   │
│        feasibility_decision_at = now,                           │
│        feasibility_status = 'declined'                          │
│      WHERE id = project.id                                      │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 5: QUALIFIED LEAD (ProjectList — Qualified tab)          │
│  decision === 'accepted' → appears in Qualified Leads tab       │
│                                                                 │
│  WHAT'S DISPLAYED:                                              │
│  - Pillar column: "Internal Planning & Readiness" (hardcoded)   │
│  - Status: mock IR status from getIRStatus()                    │
│    (deterministic hash of tracking_id, NOT stored in DB)        │
│  - Click row → detail modal with "Start Internal Readiness      │
│    Review" button                                               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 6: INTERNAL READINESS REVIEW (InternalPlanningReadiness) │
│  5-section form inside modal                                    │
│                                                                 │
│  SECTIONS:                                                      │
│  0. Resource Readiness (roles, headcounts, manpower gaps)       │
│  1. Timeline Readiness (duration, confidence, risks)            │
│  2. Risks & Constraints (add risks with category/severity)      │
│  3. Technical & Equipment Readiness (equipment, software, infra)│
│  4. Internal Readiness Decision (Go/No-Go with conditions)      │
│                                                                 │
│  CURRENT STATUS: NOT PERSISTED TO SUPABASE                      │
│  handlePlanningSubmit() does console.log only                   │
│  See Section 10 for details                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Supabase Tables

### `potential_projects` — Main Pipeline Table

| Column | Type | Set When / Notes |
|--------|------|------------------|
| `id` | int8 (PK) | Auto-generated |
| `tracking_id` | text | From external ticket, unique identifier |
| `project_name` | text | From ticket |
| `client_name` | text | From ticket |
| `status` | text | `'leads'` → `'discovery_scheduled'` → `'feasibility_accepted'` / `'feasibility_declined'` |
| `phase` | text | Always `'initiation'` currently |
| `pillar` | text | `''` → `'Discovery'` → UI shows `'Internal Planning & Readiness'` |
| `decision` | text? | `'accepted'` or `'declined'` or null |
| `feasibility_status` | text? | `'declined'` when declined |
| `feasibility_decision_at` | timestamptz? | When ops made decision |
| `sent_at` | timestamptz? | From ticket |
| `created_at` | timestamptz | Auto |
| `meet_link` | text? | Google Meet URL |
| `event_id` | text? | Google Calendar event ID |
| `discovery_scheduled_at` | timestamptz? | When discovery was scheduled |
| `notes` | text? | Meeting notes |
| `videoLink` | text? | Recording link |
| `additional_attachments` | jsonb? | `[{ _type: 'meeting_notes', notes, videoLink }]` |

### `projects` — Active Approved Projects

| Column | Notes |
|--------|-------|
| Queried with `.eq('status', 'approved')` | Shown in "Projects" tab |

### `employee_master` — Operation Team Roster

| Column | Type | Notes |
|--------|------|-------|
| `employee_id` | text | Unique employee code |
| `full_name` | text | Display name |
| `work_email` | text | Email |
| `department_text` | text | Filtered to `'Operation'` |
| `position_title` | text | Job title (maps to roles) |
| `employment_type` | text | e.g. 'Full-Time', 'Part-Time', 'Project-Based' |
| `employment_status` | text | 'Active', 'Floating', 'Resigned' |
| `date_hired_text` | text | Date hired as string |

### `manpower_pricing` — Role Catalog with Rates

| Column | Type | Notes |
|--------|------|-------|
| `id` | int8 (PK) | Auto |
| `category` | text | e.g. 'Specialist', 'Engineering', 'Audio' |
| `sub_category` | text | Often same as role name |
| `role` | text | e.g. '2D Generalist Artist', 'Unity Programmer' |
| `level` | text | 'Director', 'Senior', 'Mid', 'Junior' |
| `price_per_day` | text? | USD rate |
| `description` | text? | Role description |
| `sort_order` | int4 | Drag-reorder order |

### `project_review_tickets` — Incoming Tickets

| Column | Type | Notes |
|--------|------|-------|
| `id` | int8 (PK) | Auto |
| `tracking_id` | text | Unique |
| `project_name` | text | Project title |
| `client_name` | text | Client |
| `email_to` | text | Recipient |
| `email_subject` | text | Subject line |
| `email_body` | text | HTML body |
| `attachment_pdf` | text? | PDF |
| `additional_attachments` | jsonb? | Attachments |
| `status` | text | `'Sent'` or `'proceeded'` |
| `sent_at` | timestamptz | When received |

---

## 4. Supabase Queries by Action

### potential_projects

| Action | Query | Location |
|--------|-------|----------|
| Fetch all (for ProjectList) | `.from('potential_projects').select('*').order('created_at', { ascending: false })` | `ProjectList.jsx:1989` |
| Fetch all (for MarketingProjectList) | `.from('potential_projects').select('*').order('created_at', { ascending: false })` | `MarketingProjectList.jsx:189` |
| Insert new lead | `.from('potential_projects').insert({ project_name, client_name, tracking_id, status: 'leads', phase: 'initiation', pillar: '', sent_at })` | `ProjectReviewTicket.jsx:253` |
| Schedule discovery | `.from('potential_projects').update({ status: 'discovery_scheduled', meet_link, event_id, discovery_scheduled_at }).eq('id', id)` | `MarketingProjectList.jsx:212` |
| Accept feasibility | `.from('potential_projects').update({ status: 'feasibility_accepted', phase: 'initiation', decision: 'accepted', feasibility_decision_at, pillar: 'Discovery' }).eq('id', id)` | `ProjectList.jsx:1955` |
| Decline feasibility | `.from('potential_projects').update({ status: 'feasibility_declined', decision: 'declined', feasibility_decision_at, feasibility_status: 'declined' }).eq('id', id)` | `ProjectList.jsx:2060` |
| Save meeting notes | `.from('potential_projects').update({ additional_attachments }).eq('tracking_id', tracking_id)` | `ProjectList.jsx:1936` |
| Fix missing pillars | `.from('potential_projects').update({ pillar: 'Discovery' }).in('id', ids)` | `ProjectList.jsx:1967` |
| Check duplicate | `.from('potential_projects').select('id').eq('tracking_id', ticket.tracking_id).limit(1)` | `ProjectReviewTicket.jsx:242` |
| Fetch raw notes (via REST) | `GET /rest/v1/potential_projects?tracking_id=eq.{id}&select=additional_attachments` | `ProjectList.jsx:38` |

### projects

| Action | Query | Location |
|--------|-------|----------|
| Fetch approved | `.from('projects').select('*').eq('status', 'approved').order('created_at', { ascending: false })` | `ProjectList.jsx:1956` |
| Fetch all | `.from('projects').select('*')` | `ProjectList.jsx:2002` |
| Count approved | `.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'approved')` | `Dashboard.jsx:99` |

### employee_master

| Action | Query | Location |
|--------|-------|----------|
| Fetch operation team | `.from('employee_master').select('position_title, full_name').eq('department_text', 'Operation')` | `ProjectList.jsx:481` |
| Count operation team | `.from('employee_master').select('employee_id').eq('department_text', 'Operation')` | `Dashboard.jsx:82` |
| Fetch all (players) | `.from('employee_master').select('employee_id, full_name, work_email, department_text, position_title, employment_type, employment_status, date_hired_text').eq('department_text', 'Operation')` | `Players.jsx:11` |

### manpower_pricing

| Action | Query | Location |
|--------|-------|----------|
| Fetch roles/levels | `.from('manpower_pricing').select('role, level')` | `ProjectList.jsx:480` |
| Fetch all (pricing) | `.from('manpower_pricing').select('*').order('sort_order', { ascending: true })` | `ManpowerPricing.jsx:18` |
| CRUD operations | Various insert/update/delete by id | `ManpowerPricing.jsx` |

---

## 5. UI Status Labels

These statuses are **calculated in frontend code**, NOT stored in the database.

### Discovery Feasibility (Leads tab)

| Label | When | Code Location |
|-------|------|---------------|
| `Feasibility Review - Day 1` | Day 0 of `createdAt` vs now | `getFeasibilityDay()` |
| `Feasibility Review - Final Day` | Day 1 | same |
| `Feasibility Review - Pending` | Day 2 | same |
| `Overdue: Feasibility Decision` | Day 3+ | same |
| `Discovery Call - Scheduled` | `status === 'discovery_scheduled'` | inline |
| `Discovery Call - Not Scheduled` | default for leaads | inline |
| `Discovery Call - Overdue (Not Scheduled)` | Day 2+ without schedule | inline |
| `Feasibility - Decline` | `decision === 'declined'` | inline (red badge) |

### Internal Readiness (Qualified tab) — Mock Statuses

| Label | Color Class | Badge Style |
|-------|-------------|-------------|
| `Internal Readiness - Draft` | `bg-gray-100 text-gray-600` | Gray |
| `Internal Readiness - In Progress` | `bg-blue-100 text-blue-700` | Blue |
| `Internal Readiness - Submitted` | `bg-yellow-100 text-yellow-700` | Yellow |
| `HR Review` | `bg-purple-100 text-purple-700` | Purple |
| `IT Review` | `bg-cyan-100 text-cyan-700` | Cyan |
| `Internal Readiness Approved` | `bg-green-100 text-green-700` | Green |
| `Ready for SOW Creation` | `bg-[#FF5900] text-white` | Orange |

The status is determined by `getIRStatus(p)` — a deterministic hash of the `tracking_id`:
```javascript
const getIRStatus = (p) => {
  const idx = p.tracking_id
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0) % irStatuses.length
  return irStatuses[idx]
}
```

---

## 6. Component Tree

```
App.jsx
└── AuthProvider
    └── BrowserRouter
        ├── /login → Login.jsx
        └── / → ProtectedRoute → Dashboard.jsx
            │
            ├── [tab = 'dashboard'] → Stats cards
            │   (totalTickets, teamMemberCount, projectCount)
            │
            ├── [tab = 'project-list'] → ProjectList.jsx
            │   ├── Table: Leads tab (activeLeads)
            │   │   ├── Row click → detailProject modal (discovery)
            │   │   └── Row click (decided) → detailDecidedProject modal
            │   │       ├── MeetingNotesModal (inline)
            │   │       └── FeasibilityDecisionModal (inline)
            │   │
            │   ├── Table: Qualified tab (qualifiedLeads)
            │   │   └── Row click → detailDecidedProject modal
            │   │       └── "Start Internal Readiness Review" button
            │   │           └── InternalPlanningReadinessModal
            │   │
            │   ├── Table: Projects tab (approvedProjects)
            │   │
            │   └── Table: Archived tab (archivedLeads)
            │       └── Row click → detailDecidedProject modal
            │
            ├── [tab = 'project-review'] → ProjectReviewTicket.jsx
            │   ├── Ticket cards
            │   │   └── Click → ticket detail
            │   │       └── "Proceed to Feasibility check" button
            │   │           └── EmailComposeModal (inline)
            │   │               └── Toast notification
            │
            └── [tab = 'marketing-view'] → MarketingProjectList.jsx
                ├── Table: projects with status 'leads' or 'discovery_scheduled'
                │   └── Row click → ScheduleMeetingModal (inline)
                └── Success confirmation modal
```

---

## 7. Cross-Component Events

| Event | Dispatched By | When | Listened By | Effect |
|-------|---------------|------|-------------|--------|
| `prt-projects-updated` | `ProjectReviewTicket.jsx` | After proceed + insert to potential_projects | `MarketingProjectList.jsx`, `ProjectList.jsx` | Refetch project data |
| `prt-projects-updated` | `MarketingProjectList.jsx` | After scheduling discovery | `ProjectList.jsx` | Refetch project data |
| `prt-viewed` | `ProjectReviewTicket.jsx` | On ticket click | `Dashboard.jsx` | Update unread badge + localstorage |

---

## 8. State Management

### ProjectList.jsx

```javascript
// Core data (all populated from Supabase)
const [potentialProjects, setPotentialProjects] = useState([])
const [approvedProjects, setApprovedProjects] = useState([])
const [allProjects, setAllProjects] = useState([])
const [loading, setLoading] = useState(true)

// Tab navigation
const [tab, setTab] = useState('leads')   // 'leads' | 'qualified' | 'projects' | 'archived'

// Modal triggers (null = closed, project object = open)
const [detailProject, setDetailProject] = useState(null)          // Discovery detail modal
const [detailDecidedProject, setDetailDecidedProject] = useState(null)  // Decided project detail modal
const [notesProject, setNotesProject] = useState(null)            // MeetingNotesModal
const [decisionProject, setDecisionProject] = useState(null)      // FeasibilityDecisionModal
const [planningProject, setPlanningProject] = useState(null)      // InternalPlanningReadinessModal

// LocalStorage-backed state
const [discoveryViewedIds, setDiscoveryViewedIds] = useState([])  // Unread badge tracking

// Derived state (computed, not stored)
const qualifiedLeads = potentialProjects.filter(p => p.decision === 'accepted')
const archivedLeads  = potentialProjects.filter(p => p.decision === 'declined')
const activeLeads    = potentialProjects.filter(p => p.decision !== 'accepted' && p.decision !== 'declined')
```

### InternalPlanningReadinessModal State

```
form (useState object) → ~40+ fields covering all 5 sections
sectionsExpanded → [true, true, true, true, true] (accordion toggles)
submitting, error, submitted, submissionStage → form submission flow
roleOptions, roleCounts, roleEmployees → fetched from manpower_pricing + employee_master
```

### MarketingProjectList.jsx

```javascript
const [projects, setProjects] = useState([])           // Filtered to leads/discovery_scheduled
const [selectedProject, setSelectedProject] = useState(null)  // ScheduleMeetingModal
const [detailDecidedProject, setDetailDecidedProject] = useState(null)
const [successProject, setSuccessProject] = useState(null)
```

### ProjectReviewTicket.jsx

```javascript
const [tickets, setTickets] = useState([])             // All project_review_tickets
const [selectedTicket, setSelectedTicket] = useState(null)
const [viewedIds, setViewedIds] = useState([])         // localStorage: prt_viewed_ids
const [toastTracking, setToastTracking] = useState(null)
const [showEmailCompose, setShowEmailCompose] = useState(false)
```

---

## 9. Gmail Integration

### Authentication Flow

1. User logs in via Supabase Auth
2. Dashboard checks localStorage for Gmail tokens: `gmail_access_token`, `gmail_refresh_token`, `gmail_expiry_date`
3. If expired (or missing), opens OAuth2 popup to `https://accounts.google.com/o/oauth2/v2/auth`
4. Callback receives auth code, exchanges for tokens via `https://oauth2.googleapis.com/token`
5. Tokens stored in localStorage

### Sending Email

```javascript
// POST to Gmail API
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
Authorization: Bearer {access_token}
Content-Type: application/json
Body: {
  "raw": base64EncodedRFC2822Message
}
```

### Token Refresh

When API returns 401:
```javascript
POST https://oauth2.googleapis.com/token
Body: {
  client_id: ...,
  client_secret: ...,
  refresh_token: localStorage.gmail_refresh_token,
  grant_type: 'refresh_token'
}
```

### Used In

| Component | Purpose | Recipient |
|-----------|---------|-----------|
| `FeasibilityDecisionModal` | Notify stakeholder of accept/decline decision | Stakeholder email entered by user |
| `EmailComposeModal` (in ProjectReviewTicket) | Send feasibility check request to Marketing | Marketing email entered by user |

---

## 10. Internal Readiness Form Status

The Internal Readiness Review form (`InternalPlanningReadinessModal`) is **fully built in the UI** but **NOT persisted to Supabase**.

### What's working

- All 5 sections render with full UI/UX
- Section 0: Role selection from manpower_pricing, headcount from employee_master, gap analysis
- Section 1: Timeline inputs with confidence/risks
- Section 2: Risk/constraint CRUD
- Section 3: Equipment, software, infrastructure, access management
- Section 4: Readiness summary, department reviews, final decision, conditions, remarks
- Workflow timeline visualization
- Outstanding items with clickable navigation
- Operations Decision Remarks
- Submission banner with mock status advancement

### What's NOT working (to-do)

```javascript
// ProjectList.jsx line ~2063
const handlePlanningSubmit = async (project, form) => {
  console.log('Internal Readiness Review submitted', { project, form })
  // TODO: Persist to Supabase
  // TODO: Update project status/phase/pillar
  // TODO: Trigger next workflow step
}
```

### Future Implementation Needed

1. Create a new Supabase table (e.g., `internal_readiness_reviews`) or add JSONB column to `potential_projects`
2. Write handlePlanningSubmit to insert/update the form data
3. Update `sectionValid(4)` (currently always returns `true`) to actually validate required fields
4. Connect the qualified tab status to real data instead of mock `getIRStatus()`

---

## 11. Marketing Pipeline

Marketing uses `MarketingProjectList.jsx` with its own tab in `Dashboard.jsx`.

### Data Source

Same `potential_projects` table, but only rows where `status === 'leads'` or `status === 'discovery_scheduled'`.

### Flow

1. Marketing sees new leads (unread = dark background, `discovery_viewed_ids` in localStorage)
2. Clicks project → `ScheduleMeetingModal` opens
3. Creates Google Calendar event + Google Meet link
4. Updates `status = 'discovery_scheduled'`

### Statuses

| Status | Meaning | Marketing Action |
|--------|---------|-----------------|
| `'leads'` | New project, not yet scheduled | Click to schedule discovery call |
| `'discovery_scheduled'` | Discovery call has been scheduled | Awaiting ops to complete discovery |

---

## 12. Decision Modal Flow

`FeasibilityDecisionModal` (inline in ProjectList.jsx)

### Opening

- User clicks "Proceed to Feasibility Decision" button in the discovery detail modal
- `setDecisionProject(project)` opens the modal

### Decision Process

1. User selects `Go` or `Decline` radio button
2. Email body auto-generates HTML:
   - Accepted: "Operations has reviewed the project and the decision is **ACCEPTED**."
   - Declined: "Operations has decided to **decline** the project."
3. User enters: recipient email, subject (auto-filled), reasons (optional textarea)
4. Clicks "Submit Decision"
5. System sends email via Gmail API
6. On success:
   - `Go` → `handleFeasibilityApprove(project)`
   - `Decline` → `handleDecline(project)`
7. Success confirmation modal shown
8. `setDecisionProject(null)` closes modal

### Error Handling

- Gmail API failure → error message displayed
- Supabase update failure → error message displayed
- Missing recipient email → inline validation error
- Missing Gmail tokens → triggers OAuth2 re-auth