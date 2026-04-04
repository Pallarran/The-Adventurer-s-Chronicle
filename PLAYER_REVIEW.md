# The Adventurer's Chronicle — Player Review

*Reviewed as a D&D 5e player running a long-form campaign, using Roll20 for VTT and a shared Google Sheet for loot/gold/inspiration.*

---

## What Works Brilliantly

**Session logging is the star feature.** The @mention system in the rich text editor is genuinely excellent — typing `@` and linking NPCs, locations, and organizations inline while writing notes feels natural and creates real data connections. The auto-detection of first/last appearances from these mentions is clever and removes busywork.

**The Quest drawer system is great.** Collapsing Active/Leads open and Completed/Failed closed matches exactly how I think about quests mid-campaign. Same for Items with Inventory vs Sold.

**Entity cross-linking is thorough.** NPCs have organizations, locations have parent/child hierarchies, organizations have base locations and members. When I'm mid-session and the DM drops a name, I can Ctrl+K search and instantly see who that NPC is, who they work for, and when we last saw them.

**Character Hub roleplay tab.** Having personality, ideals, bonds, flaws, voice/mannerisms, goals, and fears all in one place is perfect for pre-session character prep. Most VTTs bury this behind the combat sheet.

**Visual polish.** The dark theme with gold accents, gem color palette, and card hover effects feel thematic. Rarity-colored item badges, status-colored NPC badges — it all reads at a glance.

---

## What's Missing (The Google Sheet Still Exists Because...)

### 1. No Gold/Currency Tracking — `WONT FIX` (tracked in shared Google Sheet)
This is the #1 reason the Google Sheet survives. There's no way to track party gold, individual character wealth, or transaction history. Every session where we buy/sell something, I'm alt-tabbing to the sheet.

**Suggestion:** Add a simple **Party Ledger** — a running log of transactions (gold gained/spent, per session). Doesn't need to be a full accounting system. A table with columns: `Session #`, `Description`, `Amount (+/-)`, `Running Balance` would replace the sheet entirely.

### 2. No Inspiration Point Tracking — `WONT FIX` (tracked in shared Google Sheet)
DnDBeyond tracks this mechanically, but the campaign narrative reason for earning inspiration ("great RP moment in Session 12") is lost. The sheet tracks "why" alongside "how many."

**Suggestion:** This could be a simple counter on the Character Hub profile tab, or even better, a field on the Session form ("Inspiration earned this session: reason").

### 3. Items Have No Session Link — `DONE`
When I look at an item, I can't see *which session we found it in*. The item just exists in the inventory. "Where did we get the Cloak of Elvenkind?" is a question I ask constantly and currently have to grep through session notes for.

**Suggestion:** Add a `Session` relation to Items (like NPCs/Locations have for first/last appearance). Even a single "Acquired in Session" link would be huge.

**Resolution:** Added `acquiredInSessionId` FK on Item model. Session picker on item create/edit form, clickable "Acquired in Session #N" link on item detail page.

### 4. Items Have No Owner — `WONT FIX` (tracked in shared Google Sheet)
The current system treats items as a flat party inventory. In practice, the Cloak of Elvenkind is *on Kaelen*, the Healing Potions are split between three people, and the party fund holds communal items.

**Suggestion:** Add an optional `heldBy` field on Items — either a freetext name or an NPC/Character reference. The item list could then group or filter by holder.

### 5. No Session-to-Session "Previously On..." View — `TODO`
Before each session, I want a quick recap: what happened last time, what quests are active, what NPCs are in play. The dashboard's "Recent Sessions" block only shows the last couple of sessions as cards — I need to click through to read the actual notes.

**Suggestion:** Keep the current Recent Sessions box height, but reduce to 3 sessions and have the most recent one display a longer preview of the notes body text. This gives a quick "previously on..." feel without needing a separate view.

---

## UX Friction Points

### 6. Quest Creation Flow Is Indirect — `TODO`
Quests can only be created via the session notes form (the "New Quest" button was removed from the quests page). But sometimes I learn about a quest *between sessions* — from recap, from the DM's Discord, from reviewing notes. Having to go create a dummy session or edit an existing one just to log a new quest is friction.

**Suggestion:** Re-add a "New Quest" link/button to the Quests page, or make it available via the Quick Create menu (Ctrl+K `+`). Session-linked creation should remain the primary path, but not the *only* path.

### 7. No Relationship Indicators Between NPCs — `BACKLOG`
I know Captain Varis works for The Silver Order (organization affiliation), but I can't see that Varis is Thorne's mentor, or that the innkeeper is actually a spy for the BBEG. NPC-to-NPC relationships don't exist.

**Suggestion:** This is a bigger feature, but even a simple "Related NPCs" freetext field or a lightweight relationship type (ally/rival/family/mentor) would add a lot. For now, the notes field can capture this — but it's not queryable or visible from the card.

### 8. Location Type Is Freetext — Inconsistent Over Time — `TODO`
Location types are freetext strings, which means I've entered "Tavern", "tavern", and "Inn/Tavern" across different locations. Same issue with Organization types.

**Suggestion:** Either provide a dropdown of common types (like Items have) with a freetext fallback, or normalize on save (trim + title case). A pre-populated list like `City, Town, Village, Tavern, Temple, Dungeon, Wilderness, Castle, Shop, Other` would cover 90% of cases.

### 9. Tags Are Powerful but Underutilized — `BACKLOG`
Tags exist on every entity, but there's no "Tag Management" page to see all tags, merge duplicates, or batch-assign. If I typo a tag ("Waterdeep" vs "waterdeep"), they become separate tags forever.

**Suggestion:** Add a Tags management page under Tools, showing all tags with usage counts, rename, merge, and delete capabilities.

### 10. The Dashboard Quick Notes Is a Scratchpad Without Context — `BACKLOG`
Quick Notes saves a single rich text blob per campaign. It's useful mid-session for jotting things down, but after the session, I have to manually move that content into the session notes. There's no connection between quick notes and sessions.

**Suggestion:** Consider adding a "Move to Session" action that copies the quick notes content into a session's notes body (or appends it). Alternatively, make quick notes session-aware (a sticky note per session).

### 11. Session Form — Relation Pickers Are Manual Despite Mentions — `WONT FIX`
The @mention auto-sync for featured entities is excellent, but only works one-way: mention → relation. If I add an NPC to the "Featured NPCs" picker manually (without mentioning them in notes), there's no visual indication in the notes that they were involved. The two systems feel slightly disconnected.

**Suggestion:** This is minor — the current behavior is correct. But a small "Also featured but not mentioned in notes" indicator on the detail page would help.

---

## What DnDBeyond/Roll20 Handles That This App Shouldn't Try To

These are NOT suggestions — just clarifying the boundary:
- **Combat mechanics** (HP, AC, saves, initiative) — leave to VTT
- **Spell slot tracking** — leave to VTT
- **Dice rolling** — leave to VTT
- **Battle maps** — leave to VTT
- **Character sheet mechanics** — leave to DnDBeyond

The Adventurer's Chronicle is the **narrative companion** to those mechanical tools. It should own the story, relationships, and lore — not the math.

---

## Priority Ranking (If I Had to Pick 5)

| # | Feature | Effort | Impact | Status |
|---|---------|--------|--------|--------|
| 1 | Party Ledger (gold tracking) | Medium | Kills the Google Sheet | WONT FIX |
| 2 | Item → Session link ("acquired in") | Small | Huge QoL | DONE |
| 3 | Item → Owner/Holder field | Small | Huge QoL | WONT FIX |
| 4 | Re-add Quest creation outside sessions | Trivial | Removes friction | TODO |
| 5 | Location/Org type presets | Small | Consistency | TODO |

---

*Overall: The Adventurer's Chronicle is already the best place to track the story of a campaign. The remaining gap is mostly about the "stuff" layer — gold, item provenance, ownership — which is exactly what the Google Sheet still handles. Close that gap and the sheet dies.*
