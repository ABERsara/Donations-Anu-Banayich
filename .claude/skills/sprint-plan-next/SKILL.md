---
name: sprint-plan-next
description: Plan the next sprint for the Prayers/Donations platform (2 junior developers who self-select their tasks, end-to-end feature ownership). Loads the whole project picture — the full sprint roadmap + spec (SPEC.md), the conventions (CONTRIBUTING.md / CHECKLIST.md), the actual code, and persistent memory — then emits a feature-organized, self-selectable task pool (no owner assignment), every task code-checked first, blocking work flagged. Planning only (Markdown); never creates Jira tickets and never writes code.
---

# Sprint Planner — Next Sprint

Plan the **next** sprint for the team. This skill loads the **whole project picture** — the full sprint roadmap + app spec (`SPEC.md`), the conventions (`CONTRIBUTING.md` / `CHECKLIST.md`), the **actual code**, and persistent memory — then emits a feature-organized, **self-selectable task pool** (the developers pick their own tasks — no owner assignment), every task **code-checked first**, with blocking/sync work flagged.

This skill **never** creates Jira tickets — it produces Markdown plans only, in the `**Field:**` format a future Jira skill could parse. It **never** writes code. Its writes are the plan files under `.claude\sprint-plans\` plus light memory maintenance (Step 9).

**Why the whole picture:** planning sprint-by-sprint in isolation is how build gaps accumulate to the last sprint. Holding the full roadmap + spec + code lets this skill catch cross-sprint dependencies early, ensure this sprint's foundations support what's coming, and notice when an entire topic is silently missing.

**Usage:** `/sprint-plan-next [--sprint N] [--he]`

- `--sprint N` — the sprint to **plan**. Default: auto-detect — highest sprint with a closing `sprint-<N>-plan-team.md` under `.claude\sprint-plans\`, **+1**. If none exists yet, plan **Sprint 1**.
- `--he` — also emit the plan translated to Hebrew. RTL rules: wrap in `<div dir="rtl">`, **no em dashes**, **never mix Hebrew + English/paths on the same line** (put paths/code on their own line).

**Input:** $ARGUMENTS

---

## Team context (this project)

- **Two junior developers**, both working **end-to-end** on whole features — server (FastAPI/Python) through client (Expo/TypeScript), **including verifying it runs**. Do **not** split work backend-vs-frontend; scope each feature so **one developer can own it front to back**. (The `A=Backend / B=Frontend` table in `SPEC.md` is superseded by this.)
- **Developers self-select their tasks — there is NO owner assignment.** The TL does not hand out work; the two developers each choose which whole feature to take. This skill therefore produces an **unassigned, self-selectable task pool**, and does not need their names. (The team roster — names, emails, Jira accounts — and the Jira space are owned by the future **Jira-assignment skill**, the source of truth as people join or leave.)
- **Sara is the Team Lead / scrum master and takes NO development tasks.** She plans and manages only. There is **no private/TL task plan**, no hour cap, no TL-task tracking — those parts of the generic planner do not apply here.
- **PR review gate:** the two developers **review each other's PRs**, and **Sara is the final gate before any merge to `main`**. Every task's acceptance criteria must reflect this (PR reviewed by the other dev + approved by Sara before merge).
- This is an **early-stage project**. For the **first** sprint there is no carryover, no prior `/sprint-status`, no deferred backlog, and no known bugs. *(Once later sprints close, carryover + a status pass + a bug/backlog fold-in become relevant — see the parenthesised notes in Steps 1 and 4.)*

---

## Operating principle — plan from fresh evidence, never from assumption

Re-read every source fresh on each run; never trust stale context. The **roadmap + spec** (`SPEC.md`) define the *goal* and *intended behavior*, the **code** defines *what already exists*, `CONTRIBUTING.md` / `CHECKLIST.md` define *the conventions*, and memory defines *constraints you must respect*. Where they disagree, the **code wins** — note the gap.

**Two rules that kill most plan churn:**

1. **Never write "build X" without checking X doesn't already exist.** This repo ships with a real skeleton (see `SPEC.md` → "מה כבר קיים — לא נוגעים": models, schemas, router/service skeletons, Zustand stores, constants, i18n keys, common components). The largest source of mis-scoping is sizing work the skeleton already provides. Every task must be classified against the real code first (Step 2).
2. **Context is king.** A missing fact (a convention, an existing helper, a contract field) is what produces a wrong route, a duplicated helper, or a broken front↔back contract. Load the full code + spec + conventions + memory up front so the plan starts from reality, not a guess.

---

## Step 1 — Load ALL planning context (read in parallel)

Resolve `$prevSprint` (the last closed one, if any) and `$targetSprint`. Then read, **in parallel**, the whole picture (not just `$targetSprint`):

1. **Roadmap + spec (source of truth)** — `SPEC.md` at the repo root. It contains **both** the sprint breakdown (`סיכום ספרינטים` + per-sprint feature lists with `מה בונים` / `Acceptance`) **and** the "already exists — don't touch" inventory **and** the weekly **Sync points** table between the two developers. Read **all** sprints, not just `$targetSprint`: pull `$targetSprint`'s features + acceptance criteria, **and** scan later sprints to catch cross-sprint dependencies and foundations this sprint must lay.
2. **Conventions** — `CONTRIBUTING.md` (binding: ESLint + Prettier + Husky on frontend, Ruff on backend; **frontend is TypeScript**, backend is Python; layering `app → hooks/services → store` and `router → schema → service → model`; i18n via `t('key')` with `he.json` as the key source of truth; RTL via `utils/rtl`; Stripe amounts in integer agorot/cents; Alembic for all schema changes) and `CHECKLIST.md` (the pre-PR self-review, incl. the front↔back contract check) — so every task is written to the team's actual standards and its acceptance criteria can cite them.
3. **Persistent memory** — read `C:\Users\User\.claude\projects\c--Users-User-Desktop---------------Donations\memory\MEMORY.md` (the index) and open **every entry relevant to `$targetSprint`** — especially **code-discovery constraints** captured by prior runs (the facts whose absence caused a mis-scope) and the current-state entry. (Team-member names/emails/Jira accounts and the Jira space are **not** here — they live in the Jira-assignment skill.) If `MEMORY.md` does not exist yet, that's fine (early project) — you'll create entries in Step 9.
4. *(Later sprints only)* **Previous plan + status** — `.claude\sprint-plans\sprint-<prev>-plan-team.md` and any `/sprint-status` output, to derive **carryover** and refresh which areas each developer handled well. Skip for Sprint 1.

> There is no Figma, no team-analysis file, no gap-closure file, and (for the first sprint) no project-status, deferred, or bug list. Do not look for them.

---

## Step 2 — Code reality-check (do this BEFORE sizing any task)

This is the single highest-leverage step. For **every** feature/topic you're about to turn into a task, grep/read the actual repo (`backend/app/**`, `prayers-app/**`) and classify it as exactly one of:

- **already-done** — the code already implements it. → Do **not** write a "build it" task; drop it or scope only the genuine remainder.
- **exists-skeleton/partial** — a stub or signature exists but the body is `TODO` / `NotImplementedError` (this is the common case here — see `SPEC.md`'s "כבר קיים" inventory: routers/services are skeletons, components are skeletons, stores/constants/types/i18n keys are filled). → Write the task around **filling the gap**, and record *what exists now* + *what's missing*.
- **net-new build** — nothing exists yet. → Normal build task.

For **every** task, put the **verified file path(s) + "what exists now"** into the task body. Never write "build X" without first confirming X doesn't already exist.

Capture every non-trivial code fact you uncover here as a memory entry in Step 9, so the *next* plan starts from it instead of rediscovering it.

*(Later sprints: also reconcile each topic against merged PRs / git — done vs. carryover vs. new. Skip for Sprint 1.)*

---

## Step 3 — Emit the intermediate "basis" file

Before the full plan, write a short consolidation file the plan is built *from*:

**Path:** `.claude\sprint-plans\sprint-<N>-basis.md`

Contents (concise):
- `$targetSprint` **goal** + the **features** in scope (from `SPEC.md`), each with its acceptance criteria summarised.
- **Code reality-check table** (Step 2) — feature/topic · classification (already-done / skeleton-partial / net-new) · file path(s) + what exists now.
- **Sync points** between the two developers for this sprint (from `SPEC.md`'s Sync table — e.g. shared types / response contracts).
- **Capacity** — two developers, end-to-end; the rough feature count each can own in the sprint window.
- **Memory notes / constraints** that affect this sprint (code-discovery facts, conventions to watch).
- *(Later sprints: carryover items — task · state · remaining-effort size. Still unassigned — whoever has capacity picks it up.)*

---

## Step 4 — Build the detailed sprint plan (organized BY FEATURE)

For **each feature**: state what is being built, then break it into **small, focused, clearly-scoped tasks** — small enough that whoever picks it knows exactly when it's done, but **not** micro-tasks.

**Emit the `**Field:**` format** so a future Jira skill could parse it. Every task is a `####` heading `#### F1 — <title>` under its `### Feature — <name>` section, followed by these labelled lines (keep the literal `**Field:**` markers, do not rename them):

- **`**Goal:**`** — plain-language description (see §4·1 for the required depth).
- **`**Context:**`** — how it connects (see §4·1). **Required on every task.**
- *(No owner field — every task is created **unassigned**; developers self-select. Your job is to make each task independently pickable, not to name who takes it.)*
- **`**Effort:**`** — `S` (≈1d) / `M` (≈2–3d) / `L` (≈4–5d) / `XL`. (For Sprint 1, calibrate by judgment; later sprints calibrate from observed velocity.)
- **`**Dependencies:**`** — task IDs it depends on, or `none`.
- **`**Out of scope:**`** — what this task explicitly does NOT cover.
- **`**Acceptance criteria:**`** followed by a `- [ ]` checklist — **always present.** Derive from the spec's `Acceptance` block **and** the relevant `CHECKLIST.md` items, and **always include the review gate**: PR reviewed by the other developer + approved by Sara before merge to `main`.

A blocker also carries `🚨 BLOCKER` in its `####` heading.

### 4·1 — ALWAYS write full detail (every task)

These are two juniors — **junior-readiness in every ticket is what removes the back-and-forth.** Err on the side of MORE written, not less. Each task's `**Goal:**` + `**Context:**` + supporting lines must contain **all** of:

- **What (plain language)** — the situation, the goal, and **why it matters** this sprint. Professional but simple, so a junior understands it cold.
- **Context / how it connects** *(the `**Context:**` field — required)* — what feature/flow it belongs to, **where it plugs into the system** end-to-end (the screen + route + service + model it touches, since each dev owns the whole vertical), the upstream tasks it depends on and downstream tasks it unblocks, the **front↔back contract** it must honor (field names/types — this is the recurring Sync point), and relevant conventions/memory facts.
- **Where to work** — exact file path(s) + which function/component, and **what exists now** (verified in Step 2 — already-done / skeleton-with-the-gap / net-new). For this repo, name the skeleton being filled (e.g. `backend/app/services/prayer_service.py` TODOs, `prayers-app/hooks/usePrayer.ts` TODOs).
- **Steps** — numbered, with concrete pointers: which file to open, the existing pattern/store/constant/i18n key to reuse (e.g. "route all network calls through `services/api.ts`", "read amounts from `DONATION_TIERS`", "add the key to `i18n/he.json`").
- **Pitfalls** — known traps from the conventions/checklist (Stripe amount must be integer agorot not float shekels; no hardcoded user-facing strings — use `t('key')`; RTL via `utils/rtl` and logical `paddingStart`/`marginEnd`; schema changes go through `alembic revision --autogenerate`, never manual `ALTER TABLE`; secrets via `.env` / `EXPO_PUBLIC_*`, never committed).
- **Proof of done** — for any visible UI change, require a **before/after screenshot in the PR**; for backend, the exact request/response (or the relevant `SPEC.md` Acceptance line) that proves it. Since devs verify end-to-end, require the running check (e.g. "`GET /api/prayers` returns 5", "card tap → success animation").
- **Setup steps when needed** — if the task needs a migration, seed data, a test file, or a token/secret, spell out the exact steps (`alembic upgrade head`, `python scripts/seed.py`, which `.env` key to add to `.env.example`).
- **Out of scope** + the `- [ ]` **acceptance criteria** (spec-level "done" + checklist + the review gate).

This HOW/reuse detail is produced **here** — if you don't write it now, the ticket can't contain it.

### 4·2 — Split long / multi-deliverable tasks into sub-tasks

If a single task bundles **more than ~2 distinct deliverables** (e.g. a screen that needs the API call + data states + a sub-flow), **split it into sub-tasks** (`F3a`, `F3b`, …), each with its own description + acceptance criteria. Prefer splitting over a single `L`/`XL` task.

**Sequencing & parallelism:** order tasks so the two developers don't block each other; maximize parallel work. Where a feature has a shared **contract** (a response type, a field name — see the Sync table), schedule that contract to be agreed **first** so both sides build against the same shape.

### 4·3 — Self-selection & review

- **Do not assign owners.** The developers choose their own tasks. Your job is to make the pool **self-selectable**: each task scoped as a whole feature one person can own front to back, sized, and with dependencies explicit so two people picking in parallel don't collide or both grab dependent work.
- Size the **total** pool to roughly two developers' capacity for the sprint (Step 5), but leave who-takes-what to them.
- **Review gate on every task:** PR reviewed by the other developer, then **Sara approves before merge to `main`**. State this in acceptance criteria. Sara writes no code — she only plans, reviews, and gates.

### 4·4 — BLOCKER prioritization

Any task that **gates other tasks** (≥1 downstream depends on it) is **top priority**:

- Tag it `🚨 BLOCKER` in the title and place blockers **first** in their feature and in the dependency graph.
- For each, add a callout: what it unblocks and the dependency chain. (E.g. in Sprint 1 the working environment + migration + seed gate the Prayers API, which gates the Home screen.)
- Because work is self-selected, **flag blockers loudly** (in the title and the dependency graph) so they're picked up **first**; ensure there's enough unblocked parallel work for the second developer to start immediately.

---

## Step 5 — Feasibility check (surface during planning; the USER decides cuts)

Run a **capacity-vs-scope** check *now*, not after the plan exists. Sum the sized effort against two developers over the sprint window. If scope exceeds capacity:

1. **Surface it precisely** — e.g. "this is ~3 weeks of work for a 2-week sprint" — with the specific candidate features to cut.
2. **Ask the user** via `AskUserQuestion`: *"Scope is over capacity — should we cut X / Y / Z?"* with the concrete items as options. **Never cut unilaterally.**
3. **Only on the user's answer**, route accepted cuts to the plan's **Backlog section**, tagged `backlog` + `sprint-<N+1>` with a one-line reason, so nothing is silently dropped.

---

## Step 6 — Gap audit (spec ↔ code ↔ plan)

Before finalizing, reconcile so we don't reach the last sprint missing core pieces:

- For each major capability `SPEC.md` requires → mark what's **already built** (code, from Step 2) → what's **ticketed** (in this plan) → the **gap**.
- Anything required-but-unbuilt-and-unplanned is a gap. Resolve **every** gap into exactly one of: **fold into `$targetSprint`**, or **route to the Backlog section** (tagged `backlog` + `sprint-<N+1>` with a one-line reason). **Never leave a required gap only as prose.**
- Record the audit (each capability → built / planned / folded-in / backlog) in the plan's **Risk register**.

---

## Step 7 — Write the plan & summarize

**Write:** `.claude\sprint-plans\sprint-<N>-plan-team.md` (team-facing). Structure: header + goal callout, per-feature task breakdown (each task in the §4·1 full-detail format), **Task pool table** (task · feature · effort · dependencies · status `available` — **no owner column**), **Dependency graph** (blockers first), **Sync points** (the shared contracts for this sprint), **Backlog section** (cuts from Step 5 + gaps from Step 6, tagged `backlog`/`sprint-<N+1>`), and **Risk register** (the Step 6 gap-audit result + any capacity risk). *(Later sprints also add a carryover table at the top.)*

If `--he`, also write `sprint-<N>-plan-team-he.md` applying the Hebrew RTL rules above.

> There is **no** private/TL plan file — Sara takes no dev tasks.

**Then print** (inline, concise):
- `$targetSprint` **goal**.
- **Feature list** with **per-feature task count**.
- **Task pool** — task · effort · dependencies (unassigned; self-select).
- **🚨 BLOCKERS / RISKS** — every blocking task + its chain, the gap-audit result, any capacity risk.
- The written file paths.

---

## Step 8 — Definition-of-Ready gate

Finalize the plan **first**. A task is **not ready** until it passes ALL of:

- [ ] **Code-checked** (Step 2) — classified, with file path + "what exists now" written in.
- [ ] **Full detail present** (§4·1) — What + Context + Where + Steps + Pitfalls + proof-of-done, for every task.
- [ ] **Acceptance criteria** present (`- [ ]`, spec-level + checklist + the review gate).
- [ ] **Front↔back contract** named for any task that crosses the seam (the Sync point).
- [ ] **Format valid** — the literal `**Goal:** / **Context:** / **Effort:** / **Dependencies:** / **Out of scope:** / **Acceptance criteria:**` markers (no owner field — tasks are unassigned).
- [ ] **Split** if it bundles >~2 deliverables (§4·2).

Print the readiness checklist result. If any task fails, fix it before declaring the plan ready.

---

## Step 9 — Memory maintenance (light)

After the code-check, refresh memory so the *next* plan starts from reality:

1. **Update / create `project-current-state-en.md`** — the true built-vs-remaining picture (what the skeleton provides, what this plan adds, what remains).
2. **Capture every non-trivial code discovery** from Step 2 as a memory entry — the kind of fact whose absence caused a mis-scope (what the skeleton already implements vs. what's still `TODO`). Add a one-line pointer in `MEMORY.md`.

(Do **not** store team-member details or the Jira space here — those belong to the Jira-assignment skill.)

Write to `C:\Users\User\.claude\projects\c--Users-User-Desktop---------------Donations\memory\` using the standard memory frontmatter, and keep `MEMORY.md` as the one-line index. *(No team-performance entry yet — there are no PRs to evaluate on the first sprint; add one once sprints close and reviews exist.)*

---

## Out of scope

- **No Jira.** Never create, assign, or update tickets — Markdown plans only (in the `**Field:**` format a future Jira skill could parse).
- **No code.** Reads only; writes the basis + plan files under `.claude\sprint-plans\` and the light memory maintenance (Step 9).
- **No unilateral cuts.** Feasibility surfaces scope problems; the user decides what to cut (Step 5).
- **No Figma, no team-analysis, no private/TL plan, no carryover/bugs/deferred for the first sprint** — these parts of the generic planner do not apply to this project.

---

## Notes

- Re-read `SPEC.md`, `CONTRIBUTING.md`, `CHECKLIST.md`, the code, and memory **fresh** each run — project state changes between runs.
- Keep it concise *per task* but **complete** — small, focused, end-to-end-ownable tasks, each with full HOW; not a wall of micro-tasks and not thin one-liners.
- Where the code and `SPEC.md` disagree, trust the code and note the gap (Step 6).
