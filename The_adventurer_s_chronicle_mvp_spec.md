# The Adventurer's Chronicle — Project Brief & MVP Spec

## 1. Project Overview

### Product name (working title)
**The Adventurer's Chronicle**

### Product summary
The Adventurer's Chronicle is a **personal, self-hosted D&D campaign companion app** designed for a **player** in a long-running campaign.

The app is intended to replace or complement a Notion-based campaign workspace by offering a more purpose-built experience for:
- session notes
- NPC tracking
- location tracking
- organization/faction tracking
- character roleplay support
- character progression planning
- campaign quick access and dashboard workflows

The app is not intended to be a generic wiki platform, a public lore site, or a full collaborative DM campaign manager in MVP.

### Core product promise
> A premium, self-hosted fantasy campaign journal that helps a player track the campaign, stay in character, and quickly access what matters most.

---

## 2. Product Goals

### Primary goal
Build a **modern, premium-looking personal campaign app** that feels better suited than Notion for active play and campaign tracking.

### Secondary goals
- Provide a **dashboard / command center** for day-to-day campaign use
- Create a **light relational database** for campaign knowledge
- Support **rich notes with structured metadata**
- Support a **character hub** for RP, progression, and backstory
- Make the app feel immersive, polished, and enjoyable to use

### Non-goals for MVP
- No multiplayer collaboration
- No user accounts/authentication in v1
- No AI features in v1
- No Notion sync/import in v1
- No advanced attachment gallery system
- No public publishing mode
- No mobile-first or native app build
- No full “Notion clone” behaviors

---

## 3. Product Context

### Current user workflow
The current workflow lives in Notion and includes:
- a main campaign database for NPCs, locations, organizations, etc.
- a session notes database
- a dashboard page used as a command center
- pages for roleplay guidance, progression planning, and future build ideas
- external tools such as Roll20 and a Google Sheets loot tracker

### Migration strategy
**Manual fresh start.**
The app will be developed first and used alongside Notion until it is good enough to become the main tool. There is no requirement for Notion API integration or automated import in MVP.

---

## 4. Target User

### MVP target user
A **single player** using the app privately on a home server / private network.

### User profile
- Wants a personal campaign cockpit
- Plays in a grand, long-running campaign
- Tracks many named entities and recurring plot threads
- Wants a better experience than general-purpose note tools
- Wants a tool that helps during and between sessions
- Values visual polish and immersion

---

## 5. Product Scope

## 5.1 MVP feature focus
The app is a **hybrid companion**, but the **MVP focus is a campaign notebook upgraded**, with **character support as a close second**.

### V1 priorities
1. Campaign notebook / relational codex
2. Character companion hub
3. Dashboard / command center

### Later-phase priorities (not MVP)
- Session memory assistant
- AI recap cleanup / extraction
- unresolved thread detection
- automatic relation inference
- advanced mention/backlink intelligence

---

## 6. Core Information Architecture

### Main navigation sections in MVP
1. **Dashboard**
2. **Sessions**
3. **NPCs**
4. **Locations**
5. **Organizations / Factions**
6. **Character**

### Additional utility concept
- **Links / Tools** system (managed data, surfaced on dashboard)

### Explicitly deferred as top-level sections
These are intentionally **not** first-class sidebar sections in MVP:
- Items / Artifacts
- Quests / Objectives
- Loose Ends / Mysteries
- Timeline

These may later emerge from tags, notes, or future upgrades.

---

## 7. UX Philosophy

### Overall UX direction
The app should feel like a **light relational campaign database** wrapped in a **premium fantasy-modern codex UI**.

It should **not** feel like:
- a generic productivity SaaS clone
- a cluttered fantasy wiki
- a Notion copy

### Product design principles
- **Structured where useful, freeform where needed**
- **Fast to navigate and resume**
- **Beautiful but practical**
- **Immersive, not gimmicky**
- **Low friction for everyday use**
- **Manual control first, smart assistance later**

---

## 8. Visual Direction

### Visual identity
**Primary inspiration:** Adventurer’s campaign journal  
**Secondary accents:** Arcane archive + noble fantasy codex

### One-line visual brief
> A premium dark-mode campaign journal for a fantasy adventurer, blending practical field-note usability with subtle arcane and noble-codex accents.

### Style goals
- dark mode first
- premium modern feel
- fantasy-modern codex styling
- restrained ornamentation
- elegant typography
- rich but subtle accents
- no “old fantasy website” look

### Where the thematic styling should be strongest
- dashboard
- character hub
- page headers
- empty states
- imagery and icons
- subtle section framing

### Where restraint should dominate
- list views
- tables
- filters
- edit screens
- dense information layouts
- toolbars

### Suggested aesthetic traits
- charcoal / slate / near-black background
- layered surfaces and soft panel separation
- muted gold / bronze / arcane teal / deep blue accents
- decorative flavor through headers and accents, not clutter
- body text must remain very readable

---

## 9. Technical Stack

### Recommended stack
- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **UI primitives/components:** shadcn/ui
- **Rich text editor:** Tiptap
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Deployment:** Docker Compose

### Hosting approach
- self-hosted on home server
- private network in MVP
- no external SaaS dependency required for core product

### Authentication
- **No authentication in MVP**
- but architecture should not make future auth impossible

### Architecture direction
- web app + relational database
- single-campaign UX
- multi-campaign-ready data model under the hood

---

## 10. Content Model Philosophy

### Page model
All major entries should follow a **hybrid content model**:
- **structured fields** at the top
- **rich text body** below

This applies to:
- sessions
- NPCs
- locations
- organizations/factions
- character pages/subpages

### Rationale
The campaign data needs structure for sorting, filtering, and future smart features, but also needs flexible narrative notes that cannot be reduced to form fields.

---

## 11. Core Functional Requirements

## 11.1 Global behaviors
The app must support:
- dark-mode-first responsive desktop UI
- section list pages
- detail pages
- create/edit/delete flows
- search
- filters and sorting
- tags
- relation fields
- one optional main image per applicable entry
- global quick create
- global search
- local per-section search

### Relation model
Relations should be:
- **manual and explicit** as the source of truth
- supported by convenience features such as:
  - searchable relation pickers
  - easy add/remove relation controls
  - `@mention` support in rich text editor

### Mentions
Mentions are a desirable MVP feature if feasible in first implementation.
At minimum, the architecture should be designed with future mention support in mind.

If mention support is included in MVP, it should support:
- mention NPCs
- mention locations
- mention organizations
- clickable navigation to referenced entry

---

## 12. Dashboard Specification

### Purpose
The dashboard is a **command center**, not a general database overview.

It should help the user:
- get into character
- remember where the campaign stands
- access frequently used tools and references
- quickly resume usage before or during play

### MVP dashboard blocks
1. **Character hero card**
2. **Last session recap**
3. **Quick notes scratchpad**
4. **Party member cards**
5. **Pinned tools / shortcuts**

### Visual hierarchy
Most visually important:
- Character hero card
- Last session recap

### Functional behavior
#### Character hero card
Should display a concise at-a-glance view of the PC, such as:
- name
- class/subclass
- optional portrait
- short identity summary or RP anchor snippet

#### Last session recap
Should surface the latest session in a dashboard-friendly summary form.
Initially this may be a truncated preview from the latest session notes rather than a dedicated summary field.

#### Quick notes scratchpad
A simple persistent dashboard note area for temporary thoughts.
MVP behavior:
- single persistent scratchpad
- editable directly from dashboard
- no advanced note system yet

#### Party member cards
Party members are stored in NPCs and surfaced here via a dedicated `partyMember` flag.

#### Pinned tools / shortcuts
Surfaced from a reusable Links / Tools system.

---

## 13. Section Specifications

## 13.1 Sessions

### Purpose
Store session records and act as the primary ongoing campaign log.

### Required fields
- **sessionNumber**
- **realDatePlayed**
- **inGameDate** (optional)
- **notesBody** (rich text)
- **featuredNPCs** (relation list)
- **featuredLocations** (relation list)
- **featuredOrganizations** (relation list)
- **followUpActions** (text or rich text; implementation choice)

### Notes on design
- `notesBody` is the main source of truth
- dedicated summary fields are **not required** in MVP
- future versions may derive recap, key events, and decisions from notes

### Session list page should support
- search by session number/title/date
- sort by date or session number
- filter by linked entity presence if practical
- quick create button

### Session detail page should support
- viewing/editing all fields
- relation picker controls
- rich notes editing
- follow-up section

---

## 13.2 NPCs

### Purpose
Track recurring characters relevant to the campaign.

### Required structured fields
- **name**
- **aliasTitle**
- **gender**
- **classRole**
- **status**
- **organizationId** or relation to organizations
- **firstAppearanceSessionId**
- **lastAppearanceSessionId**
- **tags**
- **notesBody**
- **mainImage** (optional)
- **partyMember** (boolean)

### Design notes
- relationships to PC/party are tracked with tags and narrative notes
- secrets, suspicions, and unresolved questions stay in notes for MVP
- first/last appearance are manual in MVP, but architecture should allow later derivation from linked sessions

### NPC list page should support
- search by name/alias
- filters for tags, status, organization, party member
- sort by name or recent appearance
- card or list view

---

## 13.3 Locations

### Purpose
Track important places in the campaign.

### Required structured fields
- **name**
- **type**
- **parentLocationId** or region relation
- **firstAppearanceSessionId**
- **lastAppearanceSessionId**
- **tags**
- **associatedOrganizations** (relation list)
- **notesBody**
- **mainImage** (optional)

### Design notes
- no dedicated status field required in MVP
- campaign state such as dangerous, hidden, occupied, ruined can be handled through tags and notes

### Location list page should support
- search by name
- filter by type/tags
- sort by name or last appearance

---

## 13.4 Organizations / Factions

### Purpose
Track factions, institutions, noble houses, cults, governments, or other organized groups.

### Required structured fields
- **name**
- **type**
- **alignmentStance**
- **baseLocationId** or area-of-influence relation
- **firstAppearanceSessionId**
- **lastAppearanceSessionId**
- **tags**
- **knownMembers** (relation list to NPCs)
- **notesBody**
- **mainImage** (optional)

### Alignment / stance interpretation
Should represent the user’s current understanding of the organization’s stance, such as:
- allied
- friendly
- neutral
- suspicious
- hostile
- unknown

### Organization list page should support
- search by name
- filters by type, stance, tags
- sort by name or last appearance

---

## 13.5 Character

### Purpose
Act as a dedicated personal PC hub.

### Structure
The Character section should be a **hub with sub-sections**, not a single flat note.

### MVP sub-sections
1. **Overview / RP**
2. **Build / Progression**
3. **Backstory / Lore**

### Purpose of each sub-section
#### Overview / RP
- get into character quickly
- anchor tone, mindset, and identity

Suggested content:
- name
- class / subclass
- level
- optional portrait
- short summary
- RP anchor / tone notes
- current mindset snapshot

#### Build / Progression
- track build plans and future decisions
- support spells, downtime plans, level path, feat ideas, etc.

Suggested content:
- current build snapshot
- planned progression notes
- feat/spell plans
- downtime plans
- future decision notes

#### Backstory / Lore
- store full background material
- include goals, relationships, motivations, long-term context

Suggested content:
- full backstory notes
- goals
- relationship notes
- family/history context
- personal lore

---

## 14. Links / Tools System

### Purpose
Support reusable external tool links such as:
- Roll20
- Discord
- D&D Beyond
- Google Sheets loot tracker
- temporary Notion pages
- campaign-related resources

### Required fields
- **name**
- **url**
- **icon** (or icon identifier)
- **category**
- **pinnedToDashboard** (boolean)

### MVP behavior
- manageable via a simple CRUD UI or settings-style screen
- pinned links shown on dashboard

---

## 15. Search & Navigation

### MVP search model
**Global search + local section search**

### Global search should initially cover
- entry titles / names
- aliases where applicable
- tags if practical

### MVP global search does not need
- deep full-text body indexing on day one
- advanced search syntax

### Local search
Each major section should support local search and basic filters.

### Quick create
Global quick create menu should support:
- New Session
- New NPC
- New Location
- New Organization
- possibly New Tool Link

---

## 16. Data Model Requirements

### Multi-campaign readiness
Even though MVP UX is single-campaign-focused, the data model should support multiple campaigns.

### Therefore, most entities should include a campaign association:
- Campaign
- Session
- NPC
- Location
- Organization
- Character hub data
- Tool links
- Quick notes (if persisted)

### Suggested top-level entities
- Campaign
- Session
- NPC
- Location
- Organization
- CharacterProfile / CharacterSection
- ToolLink
- Tag

### Relations to consider
- Session ↔ NPC (many-to-many)
- Session ↔ Location (many-to-many)
- Session ↔ Organization (many-to-many)
- Organization ↔ NPC (many-to-many or one-to-many depending on design)
- Location ↔ Organization (many-to-many)
- Location ↔ Location (parent-child)
- NPC ↔ Organization
- all major entities ↔ Campaign

### Appearance fields
For NPCs, locations, and organizations:
- first/last appearance can start as manual fields
- design schema so future derivation from linked sessions is possible

---

## 17. Editor Requirements

### Editor choice
Use **Tiptap**.

### MVP formatting scope
Keep the editor intentionally modest but polished.

### Required formatting support
- headings
- bold
- italic
- bullet list
- numbered list
- checklist
- blockquote / callout
- links
- horizontal rule
- image insertion

### Mention support
Desirable in MVP if scope allows.
If included:
- support mentions of NPCs, locations, organizations
- clickable links to referenced records

### Image support
- one main image per entry
- no gallery system required in MVP

---

## 18. Deployment & Environment

### Deployment target
Self-hosted home server using Docker Compose.

### Suggested local services
- app container
- PostgreSQL container

### Optional later additions
- reverse proxy
- HTTPS / external access
- auth
- backups/automated dumps
- AI APIs

### Environment requirements
Provide `.env.example` and document required environment variables.

---

## 19. MVP Success Criteria

The MVP is successful if the user can:
- create and use a campaign in the app
- create sessions, NPCs, locations, and organizations
- link records together
- use a polished dashboard as a campaign command center
- maintain PC RP/progression/backstory notes in the Character hub
- search and navigate content quickly
- use the app comfortably on a desktop browser from the home network
- feel that the app is visually strong enough to be worth moving into from Notion

---

## 20. Suggested Build Phases

## Phase 1 — Foundation
- scaffold Next.js app
- setup Tailwind + shadcn/ui
- setup Prisma + PostgreSQL
- setup Docker Compose
- define base schema
- campaign model
- layout shell (sidebar + topbar + content area)
- theme foundation

## Phase 2 — Core data sections
- Sessions CRUD
- NPC CRUD
- Locations CRUD
- Organizations CRUD
- basic list/detail/edit flows
- search/filter basics
- image support (single image)

## Phase 3 — Dashboard + Character
- dashboard blocks
- Character hub
- links/tools system
- party member dashboard surfacing
- quick notes scratchpad

## Phase 4 — Richer UX
- global search
- global quick create
- improved relation pickers
- mentions if feasible
- polish and theming refinement

---

## 21. Guidance for Claude Code

### Development priority
Do **not** try to build everything at once.

Prioritize in this order:
1. strong app shell and data model
2. clean CRUD flows for core entities
3. dashboard and character hub
4. visual polish
5. richer editor/mention behaviors

### Important implementation guidance
- Favor maintainable, modular code
- Keep schema and UI simple where possible
- Avoid premature abstraction unless clearly useful
- Design with future auth and multi-campaign support in mind
- Avoid overbuilding the editor early
- Keep visual quality high from the beginning
- Prefer desktop-first responsive design for MVP

### UI expectations
The UI should feel:
- polished
- modern
- premium
- immersive
- fantasy-coded without being cheesy

### Avoid
- cluttered fantasy decorations
- overly bright high-saturation palettes
- generic admin-panel look
- overly plain corporate SaaS aesthetic

---

## 22. Open Questions / Later Decisions

These are intentionally left for later or implementation iteration:
- exact rich text storage format details
- exact mention implementation scope in MVP
- final tag system design
- whether follow-up actions are plain text or structured checklist items
- whether session recap card is derived automatically or separately editable
- whether list pages need both table and card views or just one at first
- final theming tokens and art direction specifics
- image storage implementation details
- backup strategy

---

## 23. Final MVP Summary

The Adventurer's Chronicle MVP is a **self-hosted, premium-looking campaign journal app for a single player**, built around:
- a command-center dashboard
- relational campaign records
- rich notes with structure
- a dedicated character hub
- a fantasy-modern codex aesthetic

It should feel like a **better home for a long-running campaign than Notion**, while remaining practical, elegant, and achievable for a first real build.

