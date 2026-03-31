# The Adventurer's Chronicle — Development Plan

> Single source of truth for building the MVP. Each phase can be executed step-by-step.
> For product requirements, refer to `The_adventurer_s_chronicle_mvp_spec.md`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Folder Structure](#2-project-folder-structure)
3. [Complete Prisma Schema](#3-complete-prisma-schema)
4. [Phase 1 — Foundation](#4-phase-1--foundation)
5. [Phase 2 — Core Data Sections](#5-phase-2--core-data-sections)
6. [Phase 3 — Dashboard & Character Hub](#6-phase-3--dashboard--character-hub)
7. [Phase 4 — Search, Navigation & Polish](#7-phase-4--search-navigation--polish)
8. [API Route Map](#8-api-route-map)
9. [Component Architecture](#9-component-architecture)
10. [Design Tokens & Theming](#10-design-tokens--theming)
11. [Docker Compose Configuration](#11-docker-compose-configuration)
12. [Resolved Open Decisions](#12-resolved-open-decisions)

---

## 1. Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Styling | Tailwind CSS 3 |
| UI Primitives | shadcn/ui |
| Rich Text Editor | Tiptap |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Deployment | Docker Compose |

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mutations | Server Actions | Less boilerplate than REST API routes for CRUD |
| API Routes | Only for image upload, global search, mention autocomplete | These need streaming/multipart or are better as GET endpoints |
| Rich text storage | Tiptap JSON stored as PostgreSQL `Json` column | Avoids HTML serialization; Tiptap natively works with JSON |
| Image storage | Local filesystem `/uploads` volume, served via API route | Simple for self-hosted Docker; survives container rebuilds |
| IDs | `cuid()` | URL-friendly, collision-safe, no sequential exposure |
| Schema strategy | Full schema in Phase 1 | No migration headaches in later phases |
| Tag system | Campaign-scoped, shared across entity types, inline creation | Simple and flexible |
| Campaign model | Multi-campaign data model, single-campaign UX | Future-proof without overbuilding UI |

---

## 2. Project Folder Structure

```
The-Adventurer-s-Chronicle/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── components.json                    # shadcn/ui config
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                        # Default campaign + sample data
├── public/
│   └── logo.png
├── uploads/                           # Docker volume mount (gitignored)
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (sidebar + topbar shell)
│   │   ├── page.tsx                   # Redirect to /dashboard
│   │   ├── globals.css                # Tailwind directives + CSS variables
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── sessions/
│   │   │   ├── page.tsx               # List page
│   │   │   ├── new/
│   │   │   │   └── page.tsx           # Create page
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # Detail page
│   │   │       └── edit/
│   │   │           └── page.tsx       # Edit page
│   │   │
│   │   ├── npcs/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── locations/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── organizations/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── character/
│   │   │   └── page.tsx               # Hub with tabbed sub-sections
│   │   │
│   │   ├── tools/
│   │   │   └── page.tsx               # Links/Tools management
│   │   │
│   │   └── api/
│   │       ├── upload/
│   │       │   └── route.ts           # Image upload handler
│   │       ├── search/
│   │       │   └── route.ts           # Global search endpoint
│   │       └── mentions/
│   │           └── route.ts           # Mention autocomplete endpoint
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components (auto-generated)
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── app-shell.tsx
│   │   │   └── nav-link.tsx
│   │   │
│   │   ├── shared/
│   │   │   ├── page-header.tsx        # Reusable page title + actions bar
│   │   │   ├── entity-list.tsx        # Generic list layout with search/filter/sort
│   │   │   ├── detail-layout.tsx      # Structured fields + rich text body layout
│   │   │   ├── entity-form.tsx        # Shared form shell (create/edit)
│   │   │   ├── relation-picker.tsx    # Searchable relation multi-select
│   │   │   ├── tag-input.tsx          # Tag selector with inline creation
│   │   │   ├── image-upload.tsx       # Single image upload with preview
│   │   │   ├── rich-text-editor.tsx   # Tiptap editor wrapper
│   │   │   ├── rich-text-display.tsx  # Tiptap read-only renderer
│   │   │   ├── confirm-dialog.tsx     # Delete confirmation dialog
│   │   │   ├── empty-state.tsx        # Themed empty state placeholder
│   │   │   └── search-input.tsx       # Reusable search bar
│   │   │
│   │   ├── dashboard/
│   │   │   ├── character-hero-card.tsx
│   │   │   ├── last-session-recap.tsx
│   │   │   ├── quick-notes.tsx
│   │   │   ├── party-members.tsx
│   │   │   └── pinned-tools.tsx
│   │   │
│   │   ├── sessions/
│   │   │   ├── session-card.tsx
│   │   │   └── session-form.tsx
│   │   │
│   │   ├── npcs/
│   │   │   ├── npc-card.tsx
│   │   │   └── npc-form.tsx
│   │   │
│   │   ├── locations/
│   │   │   ├── location-card.tsx
│   │   │   └── location-form.tsx
│   │   │
│   │   ├── organizations/
│   │   │   ├── organization-card.tsx
│   │   │   └── organization-form.tsx
│   │   │
│   │   ├── character/
│   │   │   ├── overview-tab.tsx
│   │   │   ├── build-tab.tsx
│   │   │   └── backstory-tab.tsx
│   │   │
│   │   └── search/
│   │       ├── global-search.tsx      # Command palette overlay
│   │       └── quick-create.tsx       # Quick create menu
│   │
│   ├── lib/
│   │   ├── prisma.ts                  # Prisma client singleton
│   │   ├── utils.ts                   # General utilities (cn helper, etc.)
│   │   ├── campaign.ts                # Get active campaign helper
│   │   │
│   │   └── actions/
│   │       ├── sessions.ts            # Session server actions
│   │       ├── npcs.ts                # NPC server actions
│   │       ├── locations.ts           # Location server actions
│   │       ├── organizations.ts       # Organization server actions
│   │       ├── character.ts           # Character profile/section actions
│   │       ├── tools.ts               # ToolLink server actions
│   │       ├── tags.ts                # Tag server actions
│   │       ├── quick-notes.ts         # QuickNote server actions
│   │       └── upload.ts              # Image upload utility
│   │
│   └── types/
│       └── index.ts                   # Shared TypeScript types/interfaces
```

---

## 3. Complete Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// ENUMS
// ============================================================

enum NpcStatus {
  ALIVE
  DEAD
  MISSING
  UNKNOWN
}

enum AlignmentStance {
  ALLIED
  FRIENDLY
  NEUTRAL
  SUSPICIOUS
  HOSTILE
  UNKNOWN
}

enum CharacterSectionType {
  OVERVIEW
  BUILD
  BACKSTORY
}

// ============================================================
// CORE MODELS
// ============================================================

model Campaign {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sessions          Session[]
  npcs              Npc[]
  locations         Location[]
  organizations     Organization[]
  characterProfile  CharacterProfile?
  toolLinks         ToolLink[]
  tags              Tag[]
  quickNotes        QuickNote[]
}

model Session {
  id            String    @id @default(cuid())
  sessionNumber Int
  title         String?
  realDatePlayed DateTime
  inGameDate    String?
  notesBody     Json?                    // Tiptap JSON
  followUpActions Json?                  // Tiptap JSON
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  campaignId    String
  campaign      Campaign  @relation(fields: [campaignId], references: [id])

  // Many-to-many relations
  npcs          SessionNpc[]
  locations     SessionLocation[]
  organizations SessionOrganization[]
  tags          SessionTag[]

  // Reverse relations for first/last appearance
  npcFirstAppearances  Npc[]          @relation("NpcFirstAppearance")
  npcLastAppearances   Npc[]          @relation("NpcLastAppearance")
  locationFirstAppearances Location[] @relation("LocationFirstAppearance")
  locationLastAppearances  Location[] @relation("LocationLastAppearance")
  orgFirstAppearances  Organization[] @relation("OrgFirstAppearance")
  orgLastAppearances   Organization[] @relation("OrgLastAppearance")

  @@unique([campaignId, sessionNumber])
}

model Npc {
  id          String    @id @default(cuid())
  name        String
  aliasTitle  String?
  gender      String?
  classRole   String?
  status      NpcStatus @default(ALIVE)
  partyMember Boolean   @default(false)
  notesBody   Json?                      // Tiptap JSON
  mainImage   String?                    // File path in /uploads
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  campaignId  String
  campaign    Campaign  @relation(fields: [campaignId], references: [id])

  // Organization relation (primary affiliation)
  organizationId String?
  organization   Organization? @relation("NpcPrimaryOrg", fields: [organizationId], references: [id])

  // Appearance tracking
  firstAppearanceSessionId String?
  firstAppearanceSession   Session? @relation("NpcFirstAppearance", fields: [firstAppearanceSessionId], references: [id])
  lastAppearanceSessionId  String?
  lastAppearanceSession    Session? @relation("NpcLastAppearance", fields: [lastAppearanceSessionId], references: [id])

  // Many-to-many relations
  sessions      SessionNpc[]
  organizations OrganizationNpc[]
  tags          NpcTag[]
}

model Location {
  id          String   @id @default(cuid())
  name        String
  type        String?                    // Free text: city, tavern, dungeon, region, etc.
  notesBody   Json?                      // Tiptap JSON
  mainImage   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id])

  // Self-referential parent location
  parentLocationId String?
  parentLocation   Location?  @relation("LocationHierarchy", fields: [parentLocationId], references: [id])
  childLocations   Location[] @relation("LocationHierarchy")

  // Appearance tracking
  firstAppearanceSessionId String?
  firstAppearanceSession   Session? @relation("LocationFirstAppearance", fields: [firstAppearanceSessionId], references: [id])
  lastAppearanceSessionId  String?
  lastAppearanceSession    Session? @relation("LocationLastAppearance", fields: [lastAppearanceSessionId], references: [id])

  // Many-to-many relations
  sessions      SessionLocation[]
  organizations LocationOrganization[]
  tags          LocationTag[]

  // Reverse relation for org base location
  basedOrganizations Organization[] @relation("OrgBaseLocation")
}

model Organization {
  id              String          @id @default(cuid())
  name            String
  type            String?                  // Free text: guild, cult, government, noble house, etc.
  alignmentStance AlignmentStance @default(UNKNOWN)
  notesBody       Json?                    // Tiptap JSON
  mainImage       String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  campaignId      String
  campaign        Campaign @relation(fields: [campaignId], references: [id])

  // Base location
  baseLocationId  String?
  baseLocation    Location? @relation("OrgBaseLocation", fields: [baseLocationId], references: [id])

  // Appearance tracking
  firstAppearanceSessionId String?
  firstAppearanceSession   Session? @relation("OrgFirstAppearance", fields: [firstAppearanceSessionId], references: [id])
  lastAppearanceSessionId  String?
  lastAppearanceSession    Session? @relation("OrgLastAppearance", fields: [lastAppearanceSessionId], references: [id])

  // Many-to-many relations
  sessions  SessionOrganization[]
  npcs      OrganizationNpc[]
  locations LocationOrganization[]
  tags      OrganizationTag[]

  // Reverse relation for NPC primary org
  primaryNpcs Npc[] @relation("NpcPrimaryOrg")
}

model CharacterProfile {
  id        String   @id @default(cuid())
  name      String
  classInfo String?                      // e.g. "Wizard / Bladesinger"
  level     Int?
  portrait  String?                      // File path in /uploads
  summary   String?                      // Short identity summary
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  campaignId String   @unique
  campaign   Campaign @relation(fields: [campaignId], references: [id])

  sections CharacterSection[]
}

model CharacterSection {
  id        String               @id @default(cuid())
  type      CharacterSectionType
  content   Json?                        // Tiptap JSON
  createdAt DateTime             @default(now())
  updatedAt DateTime             @updatedAt

  characterProfileId String
  characterProfile   CharacterProfile @relation(fields: [characterProfileId], references: [id])

  @@unique([characterProfileId, type])
}

model ToolLink {
  id                String   @id @default(cuid())
  name              String
  url               String
  icon              String?                // Icon identifier (e.g. lucide icon name)
  category          String?
  pinnedToDashboard Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  campaignId        String
  campaign          Campaign @relation(fields: [campaignId], references: [id])
}

model Tag {
  id         String   @id @default(cuid())
  name       String
  createdAt  DateTime @default(now())

  campaignId String
  campaign   Campaign @relation(fields: [campaignId], references: [id])

  npcs          NpcTag[]
  locations     LocationTag[]
  organizations OrganizationTag[]
  sessions      SessionTag[]

  @@unique([campaignId, name])
}

model QuickNote {
  id        String   @id @default(cuid())
  content   Json?                        // Tiptap JSON
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  campaignId String
  campaign   Campaign @relation(fields: [campaignId], references: [id])
}

// ============================================================
// JOIN TABLES
// ============================================================

model SessionNpc {
  sessionId String
  session   Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  npcId     String
  npc       Npc     @relation(fields: [npcId], references: [id], onDelete: Cascade)

  @@id([sessionId, npcId])
}

model SessionLocation {
  sessionId  String
  session    Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  locationId String
  location   Location @relation(fields: [locationId], references: [id], onDelete: Cascade)

  @@id([sessionId, locationId])
}

model SessionOrganization {
  sessionId      String
  session        Session      @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@id([sessionId, organizationId])
}

model OrganizationNpc {
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  npcId          String
  npc            Npc          @relation(fields: [npcId], references: [id], onDelete: Cascade)

  @@id([organizationId, npcId])
}

model LocationOrganization {
  locationId     String
  location       Location     @relation(fields: [locationId], references: [id], onDelete: Cascade)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@id([locationId, organizationId])
}

model NpcTag {
  npcId String
  npc   Npc    @relation(fields: [npcId], references: [id], onDelete: Cascade)
  tagId String
  tag   Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([npcId, tagId])
}

model LocationTag {
  locationId String
  location   Location @relation(fields: [locationId], references: [id], onDelete: Cascade)
  tagId      String
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([locationId, tagId])
}

model OrganizationTag {
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  tagId          String
  tag            Tag          @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([organizationId, tagId])
}

model SessionTag {
  sessionId String
  session   Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  tagId     String
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([sessionId, tagId])
}
```

---

## 4. Phase 1 — Foundation

**Goal:** Scaffold the project, set up all tooling, define the complete schema, build the app shell, and establish the visual theme. By the end of this phase, the app runs in Docker with a navigable sidebar and themed layout.

### Tasks

#### 1.1 Project Scaffolding

- [ ] Initialize Next.js project with TypeScript and App Router
  ```
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
  ```
- [ ] Install core dependencies:
  - `prisma` + `@prisma/client`
  - `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*` (Phase 2 detail)
  - `lucide-react` (icons)
  - `clsx`, `tailwind-merge` (utility)
- [ ] Initialize shadcn/ui:
  ```
  npx shadcn@latest init
  ```
- [ ] Install initial shadcn/ui components: `button`, `input`, `label`, `card`, `dialog`, `dropdown-menu`, `tabs`, `badge`, `separator`, `tooltip`, `textarea`, `select`, `command`, `popover`, `scroll-area`, `sheet`, `skeleton`

#### 1.2 Configuration Files

- [ ] Create `.env.example`:
  ```env
  DATABASE_URL=postgresql://postgres:postgres@db:5432/adventurers_chronicle
  UPLOAD_DIR=/app/uploads
  NEXT_PUBLIC_APP_NAME="The Adventurer's Chronicle"
  ```
- [ ] Create `.gitignore` (Node + Next.js + Prisma + uploads + env)
- [ ] Configure `tailwind.config.ts` with custom theme extending CSS variables
- [ ] Configure `next.config.ts` (enable standalone output for Docker)

#### 1.3 Docker Setup

- [ ] Create `Dockerfile` (multi-stage: deps → build → runner with standalone output)
- [ ] Create `docker-compose.yml` with:
  - `app` service (Next.js, port 3000, depends on db)
  - `db` service (PostgreSQL 16, persistent volume)
  - Named volume for `uploads/`
  - Named volume for `postgres-data`
- [ ] Create `.dockerignore`

#### 1.4 Database & Prisma

- [ ] Write full `prisma/schema.prisma` (see Section 3 above — complete schema from day one)
- [ ] Create `prisma/seed.ts`:
  - Create a default campaign ("My Campaign")
  - Create the CharacterProfile with 3 empty CharacterSections
  - Create a default QuickNote
- [ ] Configure seed script in `package.json`
- [ ] Create `src/lib/prisma.ts` — Prisma client singleton with global caching for dev
- [ ] Create `src/lib/campaign.ts` — helper to fetch the active campaign (first campaign for MVP)

#### 1.5 Layout Shell

- [ ] Build `src/app/layout.tsx` — root layout wrapping AppShell
- [ ] Build `src/components/layout/app-shell.tsx` — sidebar + topbar + content area
- [ ] Build `src/components/layout/sidebar.tsx`:
  - Navigation links: Dashboard, Sessions, NPCs, Locations, Organizations, Character
  - Tools link at bottom
  - App logo/title at top
  - Active state highlighting
  - Collapsible on narrow screens
- [ ] Build `src/components/layout/topbar.tsx`:
  - Page title (dynamic per route)
  - Placeholder for global search trigger (Phase 4)
  - Placeholder for quick create button (Phase 4)
- [ ] Build `src/components/layout/nav-link.tsx` — sidebar nav item with icon + label + active state
- [ ] Set up `src/app/page.tsx` to redirect to `/dashboard`

#### 1.6 Theme Foundation

- [ ] Define CSS custom properties in `src/app/globals.css`:
  - Surface colors (background, card, panel, elevated)
  - Text colors (primary, secondary, muted)
  - Accent colors (gold, teal, blue)
  - Status colors for NPC status and org stance
  - Border, ring, and shadow tokens
- [ ] Apply dark-mode-first theme as the default and only mode in MVP
- [ ] Set up base typography (body font, heading font if using a fantasy accent font)
- [ ] Style the sidebar and topbar with the charcoal/slate palette
- [ ] Create themed empty state component placeholder

### Files Created in Phase 1

```
.env.example, .gitignore, .dockerignore
docker-compose.yml, Dockerfile
tailwind.config.ts (modified), next.config.ts (modified)
prisma/schema.prisma, prisma/seed.ts
src/app/layout.tsx, src/app/page.tsx, src/app/globals.css
src/components/layout/app-shell.tsx, sidebar.tsx, topbar.tsx, nav-link.tsx
src/lib/prisma.ts, src/lib/utils.ts, src/lib/campaign.ts
src/types/index.ts
```

### Phase 1 Verification

- [ ] `docker compose up` starts both containers successfully
- [ ] `npx prisma db push` creates all tables
- [ ] `npx prisma db seed` creates default campaign + character profile
- [ ] App loads at `localhost:3000` and redirects to `/dashboard`
- [ ] Sidebar navigation is visible with all 6 sections
- [ ] Dark theme is applied correctly
- [ ] Clicking nav links changes the route (pages can show placeholder content)

---

## 5. Phase 2 — Core Data Sections

**Goal:** Build full CRUD for Sessions, NPCs, Locations, and Organizations. Integrate the Tiptap editor, relation pickers, tag system, and image upload. By the end of this phase, all four core entity types are fully functional.

### Tasks

#### 2.1 Shared Components

- [ ] **`page-header.tsx`** — title, subtitle, action buttons (New, Back, Edit, Delete)
- [ ] **`entity-list.tsx`** — reusable list layout with:
  - Search input
  - Filter controls (dropdowns, tag filter)
  - Sort controls
  - Grid/list of entity cards
  - Empty state when no results
- [ ] **`detail-layout.tsx`** — structured fields section + rich text body below
- [ ] **`entity-form.tsx`** — form shell with save/cancel, field grid layout
- [ ] **`relation-picker.tsx`** — searchable multi-select for linking entities:
  - Search input with debounce
  - Dropdown results
  - Selected items shown as badges with remove button
  - Props: entityType, campaignId, selected[], onChange
- [ ] **`tag-input.tsx`** — tag selector:
  - Search existing tags
  - Create new tags inline
  - Selected tags shown as badges
- [ ] **`image-upload.tsx`** — single image upload:
  - Drag-and-drop zone or click to browse
  - Preview thumbnail
  - Remove button
  - Uploads to `/api/upload` route
- [ ] **`confirm-dialog.tsx`** — delete confirmation using shadcn Dialog
- [ ] **`empty-state.tsx`** — themed placeholder with icon, message, and optional action button
- [ ] **`search-input.tsx`** — debounced search input with clear button

#### 2.2 Rich Text Editor

- [ ] Install Tiptap extensions:
  - `@tiptap/starter-kit` (bold, italic, headings, bullet/ordered list, blockquote, horizontal rule, code)
  - `@tiptap/extension-link`
  - `@tiptap/extension-image`
  - `@tiptap/extension-task-list` + `@tiptap/extension-task-item`
  - `@tiptap/extension-placeholder`
- [ ] Build **`rich-text-editor.tsx`**:
  - Toolbar with formatting buttons (headings, bold, italic, lists, checklist, blockquote, link, horizontal rule, image)
  - Tiptap `useEditor` hook
  - `content` prop (Tiptap JSON) + `onChange` callback
  - Styled to match dark theme
- [ ] Build **`rich-text-display.tsx`**:
  - Read-only Tiptap renderer
  - Same styling as editor but non-editable
  - Used on detail pages

#### 2.3 Image Upload API

- [ ] Build **`src/app/api/upload/route.ts`**:
  - POST handler accepting multipart form data
  - Save file to `UPLOAD_DIR` with unique filename (cuid + original extension)
  - Return file path
  - Basic validation: file size limit (5MB), allowed types (jpg, png, gif, webp)
- [ ] Build **`src/app/api/upload/[...path]/route.ts`** (or a rewrite rule):
  - GET handler to serve files from the uploads directory
  - Set appropriate content-type headers

#### 2.4 Server Actions

- [ ] **`src/lib/actions/sessions.ts`**:
  - `getSessions(campaignId, filters?)` — list with search/sort/filter
  - `getSession(id)` — detail with all relations loaded
  - `createSession(data)` — create with relation connections
  - `updateSession(id, data)` — update fields + sync relations
  - `deleteSession(id)` — cascade delete
- [ ] **`src/lib/actions/npcs.ts`**:
  - `getNpcs(campaignId, filters?)` — list with search/sort/filter
  - `getNpc(id)` — detail with relations
  - `createNpc(data)` — create with tags, org, appearance sessions
  - `updateNpc(id, data)` — update + sync relations
  - `deleteNpc(id)`
- [ ] **`src/lib/actions/locations.ts`**:
  - `getLocations(campaignId, filters?)`
  - `getLocation(id)`
  - `createLocation(data)`
  - `updateLocation(id, data)`
  - `deleteLocation(id)`
- [ ] **`src/lib/actions/organizations.ts`**:
  - `getOrganizations(campaignId, filters?)`
  - `getOrganization(id)`
  - `createOrganization(data)`
  - `updateOrganization(id, data)`
  - `deleteOrganization(id)`
- [ ] **`src/lib/actions/tags.ts`**:
  - `getTags(campaignId)`
  - `createTag(campaignId, name)`
  - `deleteTag(id)`

#### 2.5 Sessions Section

- [ ] **List page** (`/sessions`):
  - Uses `entity-list` with session cards
  - Search by session number, title, date
  - Sort by session number (default desc) or date
  - Each card shows: session number, title, date, NPC/location count badges
  - "New Session" button in page header
- [ ] **Session card** (`session-card.tsx`):
  - Session number + title
  - Date played
  - Relation count badges
- [ ] **Create page** (`/sessions/new`):
  - Session form with all fields
  - Relation pickers for NPCs, Locations, Organizations
  - Tag input
  - Rich text editor for notesBody
  - Rich text editor for followUpActions
- [ ] **Session form** (`session-form.tsx`):
  - Fields: sessionNumber, title, realDatePlayed (date picker), inGameDate (text), notesBody, followUpActions
  - Relation pickers: featuredNPCs, featuredLocations, featuredOrganizations
  - Tag input
  - Save/Cancel buttons
  - Shared between create and edit
- [ ] **Detail page** (`/sessions/[id]`):
  - Page header with Edit and Delete buttons
  - Structured fields display (number, dates, relations as linked badges)
  - Rich text body display
  - Follow-up actions display
- [ ] **Edit page** (`/sessions/[id]/edit`):
  - Pre-populated session form
  - Save updates via server action

#### 2.6 NPCs Section

- [ ] **List page** (`/npcs`):
  - Card-based grid layout (default)
  - Search by name, alias
  - Filter by: status, tags, organization, party member
  - Sort by name or last appearance
  - "New NPC" button
- [ ] **NPC card** (`npc-card.tsx`):
  - Portrait thumbnail (or placeholder icon)
  - Name + alias
  - Status badge (color-coded)
  - Class/role
  - Organization name
  - Party member indicator
- [ ] **Create page** (`/npcs/new`):
  - NPC form with all fields
- [ ] **NPC form** (`npc-form.tsx`):
  - Fields: name, aliasTitle, gender, classRole, status (select), partyMember (toggle)
  - Organization picker (single select)
  - First/last appearance session pickers
  - Tag input
  - Image upload
  - Rich text editor for notesBody
- [ ] **Detail page** (`/npcs/[id]`):
  - Hero section with portrait, name, alias, status, class
  - Structured fields
  - Linked sessions, organization, tags
  - Rich text body
- [ ] **Edit page** (`/npcs/[id]/edit`)

#### 2.7 Locations Section

- [ ] **List page** (`/locations`):
  - Card-based layout
  - Search by name
  - Filter by: type, tags
  - Sort by name or last appearance
- [ ] **Location card** (`location-card.tsx`):
  - Image thumbnail or placeholder
  - Name + type badge
  - Parent location shown if set
- [ ] **Create/Edit pages and form** (`location-form.tsx`):
  - Fields: name, type (text), parentLocation (single relation picker to other locations)
  - First/last appearance session pickers
  - Associated organizations (relation picker)
  - Tag input, image upload, rich text editor
- [ ] **Detail page** (`/locations/[id]`):
  - Image, name, type, parent location link
  - Child locations list (if any)
  - Associated organizations, sessions
  - Rich text body

#### 2.8 Organizations Section

- [ ] **List page** (`/organizations`):
  - Card-based layout
  - Search by name
  - Filter by: type, alignment/stance, tags
  - Sort by name or last appearance
- [ ] **Organization card** (`organization-card.tsx`):
  - Image or placeholder
  - Name + type
  - Stance badge (color-coded)
  - Known member count
- [ ] **Create/Edit pages and form** (`organization-form.tsx`):
  - Fields: name, type (text), alignmentStance (select)
  - Base location (single relation picker)
  - First/last appearance session pickers
  - Known members (NPC multi-relation picker)
  - Tag input, image upload, rich text editor
- [ ] **Detail page** (`/organizations/[id]`):
  - Image, name, type, stance
  - Base location link
  - Known members list with links
  - Linked sessions
  - Rich text body

### Files Created in Phase 2

```
src/components/shared/*.tsx (11 components)
src/components/sessions/session-card.tsx, session-form.tsx
src/components/npcs/npc-card.tsx, npc-form.tsx
src/components/locations/location-card.tsx, location-form.tsx
src/components/organizations/organization-card.tsx, organization-form.tsx
src/lib/actions/sessions.ts, npcs.ts, locations.ts, organizations.ts, tags.ts
src/app/api/upload/route.ts
src/app/sessions/page.tsx, new/page.tsx, [id]/page.tsx, [id]/edit/page.tsx
src/app/npcs/page.tsx, new/page.tsx, [id]/page.tsx, [id]/edit/page.tsx
src/app/locations/page.tsx, new/page.tsx, [id]/page.tsx, [id]/edit/page.tsx
src/app/organizations/page.tsx, new/page.tsx, [id]/page.tsx, [id]/edit/page.tsx
```

### Phase 2 Verification

- [ ] Can create, view, edit, and delete Sessions with all fields
- [ ] Can create, view, edit, and delete NPCs with portrait, relations, and tags
- [ ] Can create, view, edit, and delete Locations with parent location hierarchy
- [ ] Can create, view, edit, and delete Organizations with stance and member list
- [ ] Rich text editor saves and displays content correctly
- [ ] Relations are bidirectional (session shows linked NPCs; NPC shows linked sessions)
- [ ] Image upload works and images display correctly
- [ ] Search, filter, and sort work on all list pages
- [ ] Tags can be created inline and reused across entities
- [ ] Delete confirmation prevents accidental deletion

---

## 6. Phase 3 — Dashboard & Character Hub

**Goal:** Build the command-center dashboard with all 5 MVP blocks, the character hub with its 3 tabbed sub-sections, and the links/tools management screen.

### Tasks

#### 3.1 Dashboard Page

- [ ] Build **`/dashboard` page** with responsive grid layout:
  - Top row: Character Hero Card (wide) + Last Session Recap (wide)
  - Middle row: Quick Notes (medium) + Party Members (medium)
  - Bottom row: Pinned Tools (full width)
- [ ] **`character-hero-card.tsx`**:
  - Fetches CharacterProfile for active campaign
  - Displays: portrait, name, class/subclass, level, short summary
  - Links to `/character`
  - Fantasy-themed card styling (this is a showcase component)
  - Empty state if no character profile data yet
- [ ] **`last-session-recap.tsx`**:
  - Fetches latest session (highest sessionNumber)
  - Displays: session number, title, date, truncated notes preview
  - "View Full Session" link
  - Empty state for no sessions
- [ ] **`quick-notes.tsx`**:
  - Fetches QuickNote for active campaign
  - Inline Tiptap editor (auto-saves on blur or with debounce)
  - Persistent scratchpad, always editable from dashboard
  - Server action: `updateQuickNote(id, content)`
- [ ] **`party-members.tsx`**:
  - Fetches NPCs where `partyMember = true`
  - Grid of mini NPC cards (portrait, name, class/role)
  - Each links to NPC detail page
  - Empty state with "Mark NPCs as party members" guidance
- [ ] **`pinned-tools.tsx`**:
  - Fetches ToolLinks where `pinnedToDashboard = true`
  - Row of icon buttons/cards, each opening URL in new tab
  - "Manage Tools" link to `/tools`
  - Empty state

#### 3.2 Character Hub

- [ ] Build **`/character` page** with tabbed layout:
  - Three tabs: Overview / RP, Build / Progression, Backstory / Lore
  - Each tab backed by a CharacterSection (type: OVERVIEW, BUILD, BACKSTORY)
  - Profile header above tabs showing name, class, level, portrait
- [ ] **`overview-tab.tsx`**:
  - Editable fields: name, classInfo, level, portrait (via CharacterProfile)
  - Rich text content for: RP anchor, tone notes, current mindset snapshot
  - Save button updates both CharacterProfile fields and the OVERVIEW section content
- [ ] **`build-tab.tsx`**:
  - Rich text editor for build/progression content
  - Suggested structure shown in placeholder text
  - Auto-saves or explicit save
- [ ] **`backstory-tab.tsx`**:
  - Rich text editor for backstory/lore content
  - Suggested structure in placeholder
- [ ] Server actions **`src/lib/actions/character.ts`**:
  - `getCharacterProfile(campaignId)`
  - `updateCharacterProfile(id, data)` — name, classInfo, level, portrait
  - `getCharacterSection(profileId, type)`
  - `updateCharacterSection(id, content)`

#### 3.3 Links / Tools System

- [ ] Build **`/tools` page** — settings-style management:
  - List of all tool links for the campaign
  - Add new link button
  - Inline edit or modal for each link
  - Delete with confirmation
  - Toggle pinnedToDashboard per link
- [ ] Server actions **`src/lib/actions/tools.ts`**:
  - `getToolLinks(campaignId)`
  - `createToolLink(data)`
  - `updateToolLink(id, data)`
  - `deleteToolLink(id)`

#### 3.4 Quick Notes Server Actions

- [ ] **`src/lib/actions/quick-notes.ts`**:
  - `getQuickNote(campaignId)`
  - `updateQuickNote(id, content)`

### Files Created in Phase 3

```
src/app/dashboard/page.tsx
src/components/dashboard/character-hero-card.tsx
src/components/dashboard/last-session-recap.tsx
src/components/dashboard/quick-notes.tsx
src/components/dashboard/party-members.tsx
src/components/dashboard/pinned-tools.tsx
src/app/character/page.tsx
src/components/character/overview-tab.tsx
src/components/character/build-tab.tsx
src/components/character/backstory-tab.tsx
src/app/tools/page.tsx
src/lib/actions/character.ts
src/lib/actions/tools.ts
src/lib/actions/quick-notes.ts
```

### Phase 3 Verification

- [ ] Dashboard loads with all 5 blocks populated (or showing empty states)
- [ ] Character hero card displays profile info and links to character hub
- [ ] Last session recap shows latest session content
- [ ] Quick notes are editable and persist across page reloads
- [ ] Party members display correctly (after marking NPCs as party members in Phase 2)
- [ ] Pinned tools display and open in new tabs
- [ ] Character hub tabs switch between Overview, Build, and Backstory
- [ ] Character profile fields save correctly
- [ ] Character section rich text content saves correctly
- [ ] Tools management CRUD works fully
- [ ] Dashboard feels like a command center, not a plain admin page

---

## 7. Phase 4 — Search, Navigation & Polish

**Goal:** Add global search, quick create, @mentions in the editor, and do a visual polish pass to achieve the premium fantasy-modern codex aesthetic.

### Tasks

#### 4.1 Global Search

- [ ] Build **`src/app/api/search/route.ts`**:
  - GET endpoint with `?q=` query parameter
  - Searches across: Session titles/numbers, NPC names/aliases, Location names, Organization names
  - Returns typed results: `{ type, id, name, subtitle? }[]`
  - Scoped to active campaign
- [ ] Build **`global-search.tsx`** — command palette overlay:
  - Uses shadcn `Command` component (`cmdk`)
  - Triggered by Ctrl+K or clicking search in topbar
  - Debounced search input
  - Results grouped by entity type with icons
  - Keyboard navigation (arrow keys + enter)
  - Click/enter navigates to entity detail page
- [ ] Integrate global search trigger into topbar

#### 4.2 Quick Create

- [ ] Build **`quick-create.tsx`** — dropdown menu:
  - Triggered by "+" button in topbar
  - Options: New Session, New NPC, New Location, New Organization, New Tool Link
  - Each navigates to the respective `/new` page
- [ ] Integrate quick create button into topbar

#### 4.3 @Mentions in Editor

- [ ] Install `@tiptap/extension-mention`
- [ ] Build **`src/app/api/mentions/route.ts`**:
  - GET endpoint with `?q=` query and `?type=` optional filter
  - Searches NPCs, Locations, Organizations by name
  - Returns `{ id, name, type, label }[]`
- [ ] Configure Tiptap mention extension:
  - Triggered by `@` character
  - Fetches suggestions from mention API
  - Renders mention nodes with entity-type-specific styling
  - Click on mention navigates to entity detail page
- [ ] Update `rich-text-display.tsx` to render mention nodes as clickable links

#### 4.4 Visual Polish Pass

- [ ] **Dashboard theming:**
  - Character hero card: subtle border glow, fantasy-styled name rendering
  - Session recap: parchment-inspired card accent
  - Overall grid spacing and visual hierarchy
- [ ] **Page headers:**
  - Subtle decorative underline or accent on section titles
  - Consistent spacing and typography scale
- [ ] **Empty states:**
  - Custom illustrations or themed icons per section
  - Helpful guidance text
  - Styled call-to-action buttons
- [ ] **Entity cards:**
  - Hover effects (subtle glow or border transition)
  - Status/stance badges with theme-appropriate colors
  - Consistent image aspect ratios
- [ ] **Sidebar refinement:**
  - Active link accent (gold/teal left border or background)
  - Subtle hover states
  - Section dividers
- [ ] **Typography review:**
  - Heading hierarchy consistency
  - Body text readability on dark backgrounds
  - Accent font for key headings if appropriate (e.g., section titles)
- [ ] **Form polish:**
  - Consistent field styling
  - Focus ring colors matching theme
  - Smooth transitions
- [ ] **Rich text editor styling:**
  - Toolbar matches dark theme
  - Editor content area feels integrated, not like a generic text box
- [ ] **Responsive desktop refinement:**
  - Ensure sidebar collapses gracefully on narrower screens
  - Dashboard grid reflows sensibly
  - Detail pages remain readable at various widths

### Files Created in Phase 4

```
src/app/api/search/route.ts
src/app/api/mentions/route.ts
src/components/search/global-search.tsx
src/components/search/quick-create.tsx
(Plus modifications to existing components for polish)
```

### Phase 4 Verification

- [ ] Ctrl+K opens global search; results are accurate and navigable
- [ ] Quick create menu works for all entity types
- [ ] @mentions work in the editor: typing `@` shows suggestions, selecting inserts a mention
- [ ] Mention nodes are clickable and navigate to the correct entity
- [ ] Dashboard has clear visual hierarchy and themed feel
- [ ] Empty states look polished, not broken
- [ ] Cards have hover effects and consistent styling
- [ ] Sidebar active state is visible and attractive
- [ ] Overall app feels premium, dark, and fantasy-modern — not like a generic admin panel
- [ ] No visual glitches at common desktop resolutions (1280px–1920px+)

---

## 8. API Route Map

### Server Actions (Primary Mutation Pattern)

| Action File | Functions |
|-------------|-----------|
| `actions/sessions.ts` | getSessions, getSession, createSession, updateSession, deleteSession |
| `actions/npcs.ts` | getNpcs, getNpc, createNpc, updateNpc, deleteNpc |
| `actions/locations.ts` | getLocations, getLocation, createLocation, updateLocation, deleteLocation |
| `actions/organizations.ts` | getOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization |
| `actions/character.ts` | getCharacterProfile, updateCharacterProfile, getCharacterSection, updateCharacterSection |
| `actions/tools.ts` | getToolLinks, createToolLink, updateToolLink, deleteToolLink |
| `actions/tags.ts` | getTags, createTag, deleteTag |
| `actions/quick-notes.ts` | getQuickNote, updateQuickNote |

### API Route Handlers (GET Endpoints & File Handling)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/upload` | POST | Image upload (multipart form data) |
| `/api/upload/[...path]` | GET | Serve uploaded images |
| `/api/search` | GET | Global search across all entity types |
| `/api/mentions` | GET | Mention autocomplete suggestions |

---

## 9. Component Architecture

### Layer 1 — UI Primitives (shadcn/ui)
Auto-generated in `src/components/ui/`. Not modified directly.

### Layer 2 — Shared Components
Reusable across all entity types. Located in `src/components/shared/`.

| Component | Purpose |
|-----------|---------|
| `page-header` | Title bar with action buttons |
| `entity-list` | List layout with search, filter, sort, grid |
| `detail-layout` | Structured fields + rich text body |
| `entity-form` | Form shell with field layout |
| `relation-picker` | Searchable multi-select for entity relations |
| `tag-input` | Tag selector with inline creation |
| `image-upload` | Single image upload with preview |
| `rich-text-editor` | Tiptap editor with toolbar |
| `rich-text-display` | Tiptap read-only renderer |
| `confirm-dialog` | Delete confirmation |
| `empty-state` | Themed empty state |
| `search-input` | Debounced search bar |

### Layer 3 — Domain Components
Entity-specific components. Located in `src/components/{entity}/`.

Each entity section has:
- A **card** component (for list views)
- A **form** component (shared between create and edit pages)

### Layer 4 — Page Components
Located in `src/app/{section}/`. These are thin wrappers that compose shared and domain components, fetch data via server actions, and handle route parameters.

---

## 10. Design Tokens & Theming

All tokens defined as CSS custom properties in `globals.css`, consumed via Tailwind.

### Surface Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0a0a0f` | Page background |
| `--surface` | `#12121a` | Card/panel background |
| `--surface-elevated` | `#1a1a25` | Elevated panels, dropdowns |
| `--surface-hover` | `#22222f` | Hover state for interactive surfaces |
| `--border` | `#2a2a3a` | Default borders |
| `--border-subtle` | `#1e1e2e` | Subtle separators |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#e8e6e3` | Primary text |
| `--text-secondary` | `#9a9aaa` | Secondary/muted text |
| `--text-muted` | `#5a5a6a` | Placeholder, disabled text |

### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-gold` | `#c9a a55` | Primary accent, headings, highlights |
| `--accent-gold-muted` | `#8a7a45` | Subtle gold accents |
| `--accent-teal` | `#4a9a8a` | Arcane/magical accents |
| `--accent-blue` | `#4a6a9a` | Links, interactive elements |
| `--accent-purple` | `#7a5a9a` | Rare/special accents |

### Status Colors (NPC)

| Status | Color |
|--------|-------|
| Alive | `#4a9a5a` (green) |
| Dead | `#9a4a4a` (red) |
| Missing | `#9a8a4a` (amber) |
| Unknown | `#6a6a7a` (gray) |

### Stance Colors (Organization)

| Stance | Color |
|--------|-------|
| Allied | `#4a9a5a` (green) |
| Friendly | `#5a9a8a` (teal) |
| Neutral | `#6a6a7a` (gray) |
| Suspicious | `#9a8a4a` (amber) |
| Hostile | `#9a4a4a` (red) |
| Unknown | `#5a5a6a` (dim gray) |

---

## 11. Docker Compose Configuration

```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/adventurers_chronicle
      - UPLOAD_DIR=/app/uploads
    volumes:
      - uploads:/app/uploads
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=adventurers_chronicle
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  uploads:
  postgres-data:
```

### Dockerfile (Multi-Stage)

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 12. Resolved Open Decisions

These were listed as open questions in the MVP spec (Section 22). Here are the chosen approaches:

| Question | Decision | Rationale |
|----------|----------|-----------|
| Rich text storage format | Tiptap JSON stored in PostgreSQL `Json` columns | Native Tiptap format, no conversion needed, queryable if needed |
| Mention implementation scope | Include in MVP (Phase 4) | High value for connecting the codex; Tiptap has first-party support |
| Tag system design | Campaign-scoped tags shared across entity types, with inline creation | Simple, flexible, avoids tag-per-entity-type fragmentation |
| Follow-up actions format | Tiptap rich text (same as notesBody) | Allows checklists via Tiptap task lists, consistent editor experience |
| Session recap on dashboard | Truncated preview from latest session's notesBody | No separate summary field needed in MVP; keeps the model simple |
| List page views | Card view as default (and only view in MVP) | Cards suit the visual direction better; table view can come later |
| Theming tokens | CSS custom properties consumed via Tailwind | Flexible, easy to adjust, works with shadcn/ui theming |
| Image storage | Local filesystem with Docker volume, served via API route | Simplest self-hosted approach; no external service dependency |
| Backup strategy | Out of scope for MVP; PostgreSQL volume can be backed up with `pg_dump` | Document the command; don't build backup UI in MVP |

---

## Quick Reference: Build Order Summary

| Phase | Focus | Key Deliverables |
|-------|-------|-----------------|
| **1** | Foundation | Scaffold, schema, Docker, layout shell, theme |
| **2** | Core CRUD | Sessions, NPCs, Locations, Organizations + editor + relations + tags + images |
| **3** | Dashboard & Character | 5 dashboard blocks, 3-tab character hub, tools management |
| **4** | Search & Polish | Global search, quick create, @mentions, visual polish pass |

Each phase builds on the previous and produces a usable increment of the app.
