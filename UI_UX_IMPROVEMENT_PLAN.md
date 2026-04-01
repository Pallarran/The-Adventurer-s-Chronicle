# UI/UX Improvement Roadmap

## Context
A comprehensive UI/UX audit of The Adventurer's Chronicle revealed ~30 issues across consistency, feedback, accessibility, navigation, and polish. This plan organizes them into 5 independently shippable phases, prioritized by impact-to-effort ratio — quick wins first, complex features last.

---

## Phase 1 — Consistency & Quick Wins ✅ COMPLETE
*All small effort (1-5 line changes per file). Zero risk. Instant visual improvement.*

### 1A. Edit button styling ✅
**Problem**: Detail page Edit buttons use raw inline HTML styling. Delete buttons use proper `Button` component. They look different on focus/hover.
**Fix**: Replace inline styling with `buttonVariants({ variant: "outline", size: "sm" })` on the `<Link>`, matching the Delete button pattern.
**Files**: `sessions/[id]/page.tsx`, `npcs/[id]/page.tsx`, `locations/[id]/page.tsx`, `organizations/[id]/page.tsx`

### 1B. Notes section — consistent empty state ✅
**Problem**: Sessions/NPCs/Locations hide notes when empty. Organizations always shows it. User can't tell notes exist if hidden.
**Fix**: Always show the Notes section with a "No notes yet." fallback inside the card, matching the "None" pattern in relation cards.
**Files**: All 4 detail pages

### 1C. Required field indicator on Organization form ✅
**Problem**: Session/NPC/Location forms show `*` on required Name field. Organization form doesn't.
**Fix**: Change `Label` text from "Name" to "Name *" in organization-form.tsx.
**Files**: `components/organizations/organization-form.tsx`

### 1D. Tools grid — match 4-column layout ✅
**Problem**: Tools page uses `lg:grid-cols-3`. All other sections use `lg:grid-cols-4`.
**Fix**: Change to `sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
**Files**: `components/tools/tools-manager.tsx`

### 1E. Richer empty relation text ✅
**Problem**: Empty relation cards just show plain gray "None" text. It's easy to miss.
**Fix**: Change to `<p className="text-sm italic text-muted-foreground/60">None</p>` — italic + lower opacity makes "None" visually distinct as a placeholder rather than content.
**Files**: All 4 detail pages (search-replace pattern)

---

## Phase 2 — Form Feedback & Accessibility ✅ COMPLETE
*Small to medium effort. High-impact UX improvements.*

### 2A. Toast notifications on form save/error ✅
**Problem**: CRUD forms redirect on success with no feedback. If save fails, user gets nothing.
**Fix**: Install `sonner` (shadcn toast), add `<Toaster>` to root layout, add `toast.success()` on save and `toast.error()` in catch blocks across all forms.
**Files**: `app/layout.tsx`, all 4 form components, `components/tools/tools-manager.tsx`

### 2B. Disable form inputs during save ✅
**Problem**: User can keep editing while async save is in progress.
**Fix**: Wrap form content in `<fieldset disabled={saving}>` — native HTML disables all child inputs/buttons at once.
**Files**: All 4 form components

### 2C. RelationPicker & TagInput accessibility ✅
**Problem**: Labels are visual-only spans, not associated with the interactive trigger. Screen readers can't link them.
**Fix**: Add `useId()` to generate unique IDs, set `aria-labelledby` on the popover trigger button, and `id` on the label span.
**Files**: `components/shared/relation-picker.tsx`, `components/shared/tag-input.tsx`

### 2D. Icon button aria-labels ✅
**Problem**: Some icon-only buttons (Quick Create `+`, sort toggle, filter clear) lack screen reader text.
**Fix**: Add `aria-label` attributes to all icon-only buttons.
**Files**: `components/layout/topbar.tsx`, `components/layout/quick-create.tsx`, all 4 list-client files

### 2E. Back links on edit pages ✅
**Problem**: Edit pages have no navigation back to the detail or list page — only a Cancel button using `router.back()` which is unpredictable.
**Fix**: Add `backHref` and `backLabel` to PageHeader on all edit pages (e.g., `backHref={/sessions/${id}}`, `backLabel="Session detail"`).
**Files**: `sessions/[id]/edit/page.tsx`, `npcs/[id]/edit/page.tsx`, `locations/[id]/edit/page.tsx`, `organizations/[id]/edit/page.tsx`

---

## Phase 3 — Responsive Layout & Visual Polish ✅ COMPLETE
*Medium effort. Makes the app feel professional and mobile-usable.*

### 3A. Responsive sidebar (mobile drawer) ✅
**Problem**: Sidebar is fixed at w-60 with `pl-60` on content. No mobile support — sidebar overlaps or pushes content off-screen on small viewports.
**Fix**: Use the existing `Sheet` component as a slide-out drawer on mobile. Add a hamburger button to the topbar (visible on `md:hidden`). Hide the fixed sidebar below `md` breakpoint. Remove `pl-60` on mobile.
**Files**: `components/layout/app-shell.tsx`, `components/layout/sidebar.tsx`, `components/layout/topbar.tsx`, `components/layout/mobile-sidebar.tsx` (new)

### 3B. Mobile search access ✅
**Problem**: Search button has `hidden sm:flex` — invisible on mobile.
**Fix**: Show a search icon button on mobile (no "Search..." text, just the icon) that opens the same CommandDialog.
**Files**: `components/layout/topbar.tsx`

### 3C. Richer card hover states ✅
**Problem**: Cards only change border color on hover. Feels flat.
**Fix**: Add `hover:shadow-md hover:shadow-gold/5` for a subtle gold glow on hover alongside the existing border change.
**Files**: All 4 card components + `session-card.tsx`

### 3D. Page transition animation ✅
**Problem**: Content appears instantly on navigation. No sense of flow.
**Fix**: Apply `animate-in fade-in-0 duration-200` to the main content wrapper in `app-shell.tsx` (using tw-animate-css).
**Files**: `components/layout/app-shell.tsx`

### 3E. Image fallback on detail pages ✅
**Problem**: Location and Organization detail pages show nothing when there's no image (the section is just hidden). NPCs show a placeholder icon.
**Fix**: Show a placeholder card with the entity icon (MapPin/Shield) when no image exists, matching the card component pattern.
**Files**: `locations/[id]/page.tsx`, `organizations/[id]/page.tsx`

---

## Phase 4 — Enhanced Functionality
*Medium effort. Adds meaningful features users will notice.*

### 4A. Loading skeletons for detail pages ✅
**Problem**: No visual feedback while detail pages load server-side data.
**Fix**: Add `loading.tsx` files with skeleton UI (pulsing rectangles matching the page layout) for each `[id]` route.
**Files**: New files: `sessions/[id]/loading.tsx`, `npcs/[id]/loading.tsx`, `locations/[id]/loading.tsx`, `organizations/[id]/loading.tsx`

### 4B. Search within rich text content — SKIPPED
**Reason**: Would flood search results — an NPC mentioned in 30 session notes returns 30+ results. Needs dedicated full-text search UI, deferred.

### 4C. Quick Create keyboard shortcuts — SKIPPED
**Reason**: `Ctrl+Shift+N/S/L/O` conflicts with browser shortcuts (e.g. Ctrl+Shift+N opens private browsing). Not worth fighting browser defaults.

### 4D. Dashboard — recent sessions mini-timeline ✅
**Problem**: Dashboard only shows the single latest session. No sense of campaign progression.
**Fix**: Replaced `LastSessionRecap` with `RecentSessions` — a vertical timeline showing the last 5 sessions (number, title, date, one-line excerpt) with gold dots and connecting lines.
**Files**: `app/dashboard/page.tsx`, new `components/dashboard/recent-sessions.tsx`, `lib/actions/sessions.ts` (added `getRecentSessions`)

### 4E. RelationPicker keyboard hints ✅
**Problem**: Users don't know how to interact with the popover options.
**Fix**: Added a subtle "Click to select" hint at the bottom of the popover when results are visible.
**Files**: `components/shared/relation-picker.tsx`

---

## Phase 5 — Advanced Features
*Larger effort. Each item is a mini-project. Can be cherry-picked independently.*

### 5A. Soft delete with undo toast ✅
**Problem**: Delete is permanent. Confirmation dialog helps but mistakes still happen.
**Fix**: Add a `deletedAt` column to entities. On delete, soft-delete and show a toast with "Undo" button (5-second window). After timeout, hard-delete via a cleanup job or on next page load.
**Files**: Prisma schema, all delete actions, all list queries (filter `deletedAt: null`)
**Effort**: Large

### 5B. Duplicate entity action
**Problem**: No way to clone a session/NPC/location/organization as a template.
**Fix**: Add a "Duplicate" button on detail pages. Server action copies all fields (except unique constraints) and redirects to the new entity's edit page.
**Files**: All 4 detail pages, all 4 server action files (new `duplicateX` functions)
**Effort**: Medium

### 5C. Image lightbox ✅
**Problem**: Images on detail pages are small and can't be expanded.
**Fix**: Created `ImageLightbox` component wrapping a Dialog. Applied to NPC, Location, Organization detail pages and the dashboard Character Hero Card. Also switched detail page images from rigid containers with `object-cover` to flexible aspect ratios with `object-contain` for better display of non-standard image ratios. Added gold accent styling to character card (name, badges, RP anchors).
**Files**: New `components/shared/image-lightbox.tsx`, all 4 detail pages, `components/dashboard/character-hero-card.tsx`, `components/character/character-hub-client.tsx`
**Effort**: Small-Medium

### 5D. Print/export session notes
**Problem**: No way to print or share session notes outside the app.
**Fix**: Add a "Print" button on session detail that opens `window.print()` with a print-optimized CSS stylesheet. Optionally add Markdown export.
**Files**: `sessions/[id]/page.tsx`, `app/globals.css` (print media query)
**Effort**: Medium

### 5E. Auto-save drafts to localStorage
**Problem**: Long session notes can be lost if the browser closes before save.
**Fix**: Periodically save form state to `localStorage` (debounced, keyed by entity type + ID or "new"). On form mount, check for a draft and offer to restore it via a dismissible banner.
**Files**: All 4 form components (or a shared `useDraftSave` hook)
**Effort**: Medium

### 5F. Bulk actions on list views
**Problem**: Can't select and act on multiple items at once (e.g., tag 5 NPCs, delete old sessions).
**Fix**: Add checkbox selection mode to list views with a floating action bar (delete, add tag, remove tag).
**Files**: All 4 list-client components, all 4 card components, server actions for bulk operations
**Effort**: Large

---

## Deferred (Future Consideration)
These items are either minor preferences or major features that warrant their own dedicated planning:
- **Favorites / recently viewed** — needs data model + UI design decisions
- **Dashboard avatar inconsistency** (circular vs 4:3) — minor visual preference
- **Drag-and-drop tool reordering** — needs sortOrder field in schema
- **Session summary/recap field** — needs schema migration + form/card/detail updates
- **Relationship visualization graph** — major feature, likely a dedicated page with a graph library

---

## Verification
After each phase:
1. `npx next build` passes with no errors
2. Visual check on desktop and mobile (if responsive changes)
3. Keyboard navigation test (if accessibility changes)
4. Test create/edit/delete flows (if form changes)
