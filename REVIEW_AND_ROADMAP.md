# The Adventurer's Chronicle — State Review & Future Roadmap

## Part 1: Current State vs. Original Plan

### Phases Delivered (All 4 Original Phases Complete)

| Phase | Goal | Status |
|-------|------|--------|
| **Phase 1 — Foundation** | Scaffold, schema, Docker, app shell, dark theme | **Complete** |
| **Phase 2 — Core Data Sections** | Full CRUD for Sessions, NPCs, Locations, Organizations + Tiptap, relations, images | **Complete** |
| **Phase 3 — Dashboard & Character Hub** | 5-block dashboard, 3-tab character hub, tools management | **Complete** |
| **Phase 4 — Search, Navigation & Polish** | Global search (Ctrl+K), quick create, @mentions in Tiptap, visual polish | **Complete** |

### Features Added Beyond the Original Plan

These were not in the original DEVELOPMENT_PLAN.md but were implemented during or after the 4 phases:

| Feature | Description |
|---------|-------------|
| **Items Entity (Phase 5)** | Full CRUD with type, rarity, aura, attunement, sold/inventory toggle, acquisition session link |
| **Quests Entity** | Full CRUD with status tracking (LEAD → ACTIVE → COMPLETED/FAILED), session linking, status counts on dashboard |
| **Character Progression Table** | Drag-and-drop 20-level grid with DOWNTIME/THEME custom rows, @dnd-kit, auto-sync from level changes |
| **Sidebar Display Modes** | 3 modes (full/icon/hidden) with Settings page, localStorage persistence, mobile-aware |
| **Location aliasTitle** | Mirrors NPC alias pattern — form, card, detail header, search |
| **Session Export** | Export all sessions to Markdown with entity links |
| **Image Cropping** | Y-axis positioning for entity card portraits |
| **Image Lightbox** | Click-to-zoom for all entity images |
| **Inline Entity Creation from Mentions** | Create NPCs/locations/orgs/items directly from the @mention dropdown |
| **Form Options System** | Per-campaign customizable dropdown options (NPC race/class, location type, org type, item rarity, etc.) |
| **Form Guard System** | Prevents navigation with unsaved changes — modal dialog with keep/discard |
| **Soft Delete + Restore** | All entities support soft delete with restoration (and hard purge) |
| **Campaign Stats in Sidebar** | Live entity counts next to each nav link |
| **Container Queries** | Party members grid uses Tailwind v4 @container for true responsive sizing |
| **Combobox Input** | Searchable dropdowns with inline option creation |
| **First/Last Appearance Tracking** | Auto-computed when sessions are linked/unlinked to entities |
| **Session Auto-Save** | 1.5s debounced auto-save on session edit form with save status indicator and "Save & Close" button |
| **Dark/Light Theme Toggle** | Warm parchment light theme via next-themes, toggle on Settings page, persisted to localStorage |
| **Campaign Export** | Full campaign Markdown export (character, NPCs, locations, orgs, items, quests, sessions) on Settings page |
| **AI Foundation (Ollama)** | Local AI via Ollama — `lib/ai.ts` fetch wrapper, `OLLAMA_URL`/`OLLAMA_MODEL` env vars, connection status on Settings page. No API key or subscription needed |
| **Session Summary Generator** | "Generate Summary" button on session detail page. 3-5 bullet points using session-scoped context (character profile + linked entities only). Saved to `summary` field, shown on dashboard |
| **Tiptap Toolbar Styling Fixes** | Custom ProseMirror CSS for headings, blockquotes (gold callout), task lists, horizontal rules — Tailwind preflight strips defaults without typography plugin |

### Planned Feature That Was Removed

| Feature | Notes |
|---------|-------|
| **Tag System** | Was built in Phase 2, later removed entirely (commit `3168f4e`). Schema join tables may still exist but all UI is gone. |

### Original Non-Goals Still Holding

- No multiplayer/collaboration
- No user authentication
- ~~No AI features~~ — AI implemented via Ollama (local, free, opt-in)
- No Notion sync/import
- No mobile-first or native app
- No public publishing mode

---

## Part 2: Current Feature Inventory (Summary)

### 6 Core Entities with Full CRUD
Sessions, NPCs, Locations, Organizations, Items, Quests — each with: list view, detail page, create/edit forms, soft delete/restore, image upload, rich text notes

### Dashboard (5 Blocks)
1. Character Hero Card — portrait, name, stats, RP summary
2. Recent Sessions — timeline with quest badges
3. Party Members — responsive grid (container queries)
4. Quick Notes — auto-saving Tiptap scratchpad
5. Pinned Tools — external tool shortcuts

### Character Hub (3 Sections)
- Profile + Backstory tab (portrait, traits, backstory rich text, RP fields)
- Build/Progression tab (drag-and-drop level table)
- Edit form with all personality fields

### Rich Text (Tiptap)
- Full toolbar (headings, bold/italic, lists, checklists, blockquote, links, images, HR)
- @Mentions with type persistence (npc/location/organization/item)
- Click-to-navigate mentions in display mode
- Inline entity creation from mention popup
- Deep-clone fix for React Flight Protocol

### Search & Navigation
- Global search (Ctrl+K) across all 6 entity types
- Quick create dropdown for all entity types
- Client-side list filtering per entity (name, alias, type, status, etc.)
- Server-side search in getEntities actions

### Infrastructure
- Multi-campaign support (cookie-based active campaign, switcher in sidebar)
- Docker Compose deployment (app + PostgreSQL 16)
- Prisma v7 with driver adapter pattern
- force-dynamic on all routes (Docker build compatibility)

---

## Part 3: Future Improvements & Feature Ideas

### A. Quality of Life Enhancements

1. **Session Recap / "Previously On..."** — Revisit with AI features (see AI section).

2. **Recent Activity Feed** — A "recently modified" widget on the dashboard or a dedicated page showing cross-entity recent changes sorted by updatedAt.

3. **Favorites / Quick Access** — Pin frequently referenced entities (beyond tools) to the dashboard or sidebar. A boolean `pinned` field on any entity.

4. **Keyboard Shortcuts** — Beyond Ctrl+K: shortcuts for save (Ctrl+S), new entity (Ctrl+N), navigation between sections.

5. **Print / PDF Export** — Styled, printable versions of session notes, character sheets, or the entire campaign. Could use `@media print` CSS or a library like react-pdf.

6. **Entity Relationship Map** — Interactive graph visualization (e.g., with D3 or react-force-graph) showing connections between NPCs, locations, and organizations. Clicking a node navigates to the entity. Data already exists in the junction tables.

7. **Campaign Timeline / Calendar** — Visual timeline of sessions plotted by in-game date (or real date). Could show key events, NPC introductions, location discoveries. The `inGameDate` and `realDatePlayed` fields on Session already support this.

8. **Bulk Operations** — Multi-select on list pages for bulk delete, bulk status change. Useful when managing large NPC/location lists.

9. **Markdown Import** — Import existing campaign notes from Notion exports, Obsidian vaults, or plain Markdown files. Parse headings/structure into sessions or entity notes.

10. **World Map** — Upload a campaign map image and pin locations on it with clickable markers. Could use a simple canvas overlay or a library like Leaflet with custom tiles.

11. **NPC Relationship Visualization** — Explicit relationship fields between NPCs (e.g., "rival of", "mentor to", "sibling of") with a visual tree.

12. **Encounter / Combat Notes** — Structured combat tracking linked to sessions: initiative order, enemy lists, loot drops. Could be a sub-section of session notes.

13. **Gold / Inventory Tracking** — Track party gold, consumables, and item quantities. Currently Items are binary (have/sold); adding quantity, value, and a running total would be useful.

14. ~~**Dark/Light Theme Toggle**~~ — **Complete** (commit `20bd3b6`). Warm parchment light theme + toggle on Settings page.

15. **Campaign Templates** — Pre-built campaign seeds with sample sessions, NPCs, locations for new users or testing.

---

### B. AI Feature Ideas

These assume a local LLM (e.g., Ollama) or API integration (Claude, OpenAI) configured by the user. All AI features should be **opt-in** and clearly marked as AI-generated.

#### Tier 1 — High Value, Low Complexity

16. ~~**Session Summary Generator**~~ — **Complete**. "Generate Summary" button on session detail page. Produces 3-5 bullet points using session-scoped context (character profile + linked NPCs/locations/orgs/quests). Saved to `summary` field on Session, shown on dashboard.

17. **Campaign Recap Generator** — "Previously on The Adventurer's Chronicle..." — Takes the last N sessions and generates a narrative recap paragraph. Could be shown on the dashboard or triggered on-demand. Useful before each game night.

18. **Name Generator** — Generate fantasy NPC names, location names, or organization names that match the campaign's existing naming conventions. Feed it existing names as context. Simple UI: a button on the create form that suggests names.

19. **Note Enhancement / Expansion** — Take brief, shorthand session notes ("fought goblins at bridge, Thorn betrayed us, found map") and expand them into fuller prose. Useful for players who take quick notes during sessions and want to flesh them out later.

#### Tier 2 — Medium Complexity, High Value

20. **NPC Generator** — Generate a complete NPC profile (name, race, class, personality, motivation, appearance) given a brief prompt or role description. Could pre-fill the NPC form. Context: existing NPCs and campaign setting.

21. **Location Description Generator** — Generate atmospheric, evocative descriptions for locations. Input: name, type, parent location, any existing notes. Output: rich text description.

22. **Quest Thread Detector** — Analyze recent session notes and identify unresolved plot threads, unanswered questions, or mentioned-but-not-created entities. Suggest new quests or entity records. "It looks like 'The Crimson Seal' was mentioned in sessions 12, 15, and 18 but doesn't have an entity page yet."

23. **Entity Connection Finder** — Analyze session notes to discover implicit connections between entities. "Thorn and the Shadow Guild are mentioned together in 4 sessions — should they be linked?" Suggests relation updates.

24. **Session Prep Assistant** — Before a game night: review recent sessions, active quests, and last-seen NPCs/locations. Generate a "prep sheet" with reminders, loose ends, and potential plot hooks.

#### Tier 3 — Higher Complexity, Premium Features

25. **Character Voice Coach** — Given the character's personality traits, ideals, bonds, flaws, and voice/mannerisms, help the player write in-character dialogue or journal entries. Could be a chat interface within the Character Hub.

26. **World-Building Assistant** — Help flesh out the campaign world: generate history for locations, political dynamics between organizations, cultural details. Respects existing lore from session notes.

27. **Smart Search** — Natural language queries across the campaign: "When did we first meet Thorn?" or "What happened at the Crimson Bridge?" searches session notes semantically rather than by keyword.

28. **Auto-Linking** — After writing session notes, AI suggests entities to link (NPCs, locations, organizations mentioned in the text) and auto-creates @mention tags or relation picks.

#### AI Architecture (Current Implementation)

- **Provider**: Ollama only (local, free, private). No API key or subscription needed
- **Model**: Configurable via `OLLAMA_MODEL` env var (default: `gemma3:12b`)
- **System prompts**: Managed in app code (`src/lib/ai.ts`), not baked into custom Ollama models
- **Context strategy**: Session-scoped — only character profile + entities linked to the specific session (not full campaign dump). Keeps prompts small and relevant
- **Key files**: `src/lib/ai.ts` (Ollama wrapper), `src/lib/actions/ai.ts` (server actions + context builder)
- **Privacy**: All data stays on the user's server; Ollama runs locally
- **UX pattern**: AI actions triggered by explicit buttons, never automatic. Results shown before saving
- **Future**: Could add provider-agnostic layer (Claude API, OpenAI) if needed later

---

## Part 4: Confirmed Roadmap (Reviewed 2026-04-20)

| Priority | Feature | Type | Notes |
|----------|---------|------|-------|
| ~~**1**~~ | ~~Session edit auto-save~~ | ~~QoL~~ | **Complete** (commit `93e610b`). Full form auto-save with 1.5s debounce, "Save & Close" button, save status indicator. |
| ~~**2**~~ | ~~Dark / Light theme toggle~~ | ~~QoL~~ | **Complete** (commit `20bd3b6`). Warm parchment light theme + toggle on Settings page. Powered by next-themes, persisted to localStorage. |
| ~~**3**~~ | ~~Enhanced campaign export~~ | ~~QoL~~ | **Complete** (commit `b0e7e89`). Full campaign export (character, NPCs, locations, orgs, items, quests, sessions) to single Markdown file on Settings page. Replaces old session-only export. |
| ~~**4**~~ | ~~AI foundation~~ | ~~AI infra~~ | **Complete** (commit `ae2ad78`). Ollama (not Anthropic SDK — free, local, no API key). `lib/ai.ts` wrapper, `OLLAMA_URL`/`OLLAMA_MODEL` env vars, Settings page status card. |
| ~~**5**~~ | ~~Session Summary Generator~~ | ~~AI Tier 1~~ | **Complete** (commit `e4234dc`). Session-scoped context (character + linked entities only), `summary` field on Session, dashboard integration. |
| **6** | Note Enhancement | AI Tier 1 | "Polish Notes" button on session edit. Expands rough shorthand into fuller prose. Preview/diff before accepting. |
| **7** | Quest Thread Detector | AI Tier 2 | Analyze all session notes to find: unresolved plot threads, entities mentioned but not created, quests needing status updates. |
| **8** | Auto-Linking | AI Tier 2 | After writing session notes, AI suggests entity links ("Link Thorn to this session?"). Complements auto-save. |
| **9** | Character Voice Coach | AI Tier 2 | Chat interface in Character Hub. Given personality/ideals/bonds/flaws/voice, helps write in-character dialogue and journal entries. |

### Reviewed & Skipped

| Feature | Reason |
|---------|--------|
| Recent Activity Feed | Single user — you know what you changed |
| Favorites / Quick Access | Ctrl+K is fast enough |
| Campaign Timeline | No precise date tracking |
| Entity Relationship Map | Detail pages show connections |
| Bulk Operations | Scale is manageable |
| Gold / Inventory | Google Sheet handles this |
| NPC Relationships | @mentions in notes cover it |
| Markdown Import | No legacy data to import |
| Name Generator | Names come from the DM |
| Campaign Recap Generator | Session summaries (#4) are sufficient |
| NPC / Location Generators | Player journal, not world-builder |
| Session Prep Assistant | Covered by #5 + #7 |
| Smart Search (embeddings) | Claude Desktop covers this workflow |
| Campaign Templates | Not needed |
