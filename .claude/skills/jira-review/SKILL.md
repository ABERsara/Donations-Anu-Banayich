---
name: jira-review
description: Review a GitHub PR and validate its implementation against the requirements and acceptance criteria defined in a JIRA task (Prayers/Donations platform — FastAPI + Expo/TypeScript stack).
---

# JIRA-Aware Code Review

Review a GitHub PR and validate its implementation against the requirements and acceptance criteria defined in a JIRA task.

**Usage:** `/jira-review <JIRA-issue-URL> [--en]`

- Output is **Hebrew by default** (RTL). Pass `--en` for an English-only report.

**Input:** $ARGUMENTS

---

## Order of operations (read first — this ordering saves tokens)

No expensive work happens on a branch that can't be reviewed. The **conflict gate runs before the project context is loaded and before the full diff is read**. Steps run in this order:

1. Parse args & flags
2. Authenticate with JIRA
3. Fetch the JIRA issue
4. Extract requirements / acceptance criteria
5. Find the GitHub PR
6. Fetch **PR metadata only** → **Conflict gate** — STOP here if the branch conflicts with base (no context, no diff)
7. Load project context (tiered) — only if the gate passed
8. Fetch the full diff
9. Review: CHECKLIST ⭐ pass → substance checks → seven areas
10. Validate against acceptance criteria
11. Draft the report → ask → post (never auto-post)

There is **zero emoji** anywhere in the output. Severity and status use bracketed text keywords (see Step 9).

---

## Step 1 — Parse the JIRA URL and flags

From `$ARGUMENTS`:
- Extract the `--en` flag if present → set `$english = $true`, then remove it from the input. **Default (no flag): the report is Hebrew.**
- From the remaining text, extract:
  - **Base URL**: everything up to and including the domain (e.g. `https://mycompany.atlassian.net`)
  - **Issue key**: the `PROJ-123` segment (last path segment, or segment after `/browse/`)

If no valid JIRA URL remains after flag extraction, stop and ask the user to provide one.

---

## Step 2 — Authenticate with JIRA

Resolve credentials using this priority order:

**1. Claude global settings** — read from `$env:USERPROFILE\.claude\settings.json` via PowerShell:
```powershell
$settings = Get-Content "$env:USERPROFILE\.claude\settings.json" | ConvertFrom-Json
$email = $settings.mcpServers.jira.env.JIRA_EMAIL
$token = $settings.mcpServers.jira.env.JIRA_API_TOKEN
$jiraBaseUrl = $settings.mcpServers.jira.env.JIRA_URL
```

**2. Windows environment variables** — if not found in settings:
```powershell
if (-not $email) { $email = $env:JIRA_EMAIL }
if (-not $token) { $token = $env:JIRA_API_TOKEN }
```

**3. Project `.env` file fallback** — if still missing, parse the project root `.env` file:
```powershell
$envFile = Get-Content ".env" -ErrorAction SilentlyContinue
if (-not $email) { $email = ($envFile | Select-String '^JIRA_EMAIL=(.+)').Matches.Groups[1].Value -replace "^'|'$|^`"|`"$" }
if (-not $token) { $token = ($envFile | Select-String '^JIRA_API_TOKEN=(.+)').Matches.Groups[1].Value -replace "^'|'$|^`"|`"$" }
```

**4. Ask the user** — if still missing after all three checks:
> "JIRA credentials not found. Please add `JIRA_EMAIL` and `JIRA_API_TOKEN` to `$env:USERPROFILE\.claude\settings.json` under the `env` key, or to the project `.env` file.
> Generate an API token at: https://id.atlassian.com/manage-profile/security/api-tokens"

Once you have both values, construct the Basic Auth header:
```powershell
$b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${token}"))
$authHeader = "Basic $b64"
```

---

## Step 3 — Fetch the JIRA issue

Call the JIRA REST API v3:
```
GET <base-url>/rest/api/3/issue/<issue-key>?fields=summary,description,comment,status,assignee,priority,labels
```
Headers:
- `Authorization: Basic <base64-credentials>`
- `Accept: application/json`

Use WebFetch for this request. If you receive a 401, tell the user their credentials are invalid. If 404, tell them the issue key wasn't found.

From the response, extract and note:
- `fields.summary` — issue title
- `fields.description` — full description (may be Atlassian Document Format; extract all text nodes and list items)
- `fields.status.name` — current status
- `fields.assignee.displayName` — who is assigned
- `fields.comment.comments[]` — all comments (author, body, created date)

---

## Step 4 — Extract requirements and acceptance criteria

Parse the issue description carefully for:
- **Acceptance criteria** (often under a heading like "Acceptance Criteria", "AC:", or as checkboxes)
- **Out-of-scope** items explicitly mentioned
- **Edge cases** or specific behaviors required
- **API contracts** described (field names, types, route paths)

Also scan **all comments** for:
- Additional requirements added after the ticket was created
- Clarifications that change or narrow the original requirement
- QA notes or edge cases raised by reviewers
- Change requests or scope adjustments
- Any comment that explicitly mentions the PR (look for GitHub PR URLs)

---

## Step 5 — Find the GitHub PR

**First**, scan all comments and the issue description (data already fetched in Step 3) for a GitHub PR URL matching:
`https://github.com/<org>/<repo>/pull/<number>`

**If not found in JIRA comments**, search GitHub directly using the issue key as the branch-name prefix (this team names branches `<ISSUE-KEY>/description`, e.g. `DON-5/prayer-list`):
```powershell
$issueKey = "<ISSUE-KEY>"  # e.g. DON-5
$prs = gh pr list --search "head:$issueKey" --json number,title,headRefName,url | ConvertFrom-Json
```
If multiple PRs are found, prefer the most recent open one.

> **Note:** Because this team's branches are named with the JIRA issue key (e.g. `DON-5/...`), JIRA's development panel already auto-links the PR — no manual JIRA comment is needed and none will be posted by this skill.

If no PR link is found by either method, stop and tell the user:
> "No GitHub PR link was found in the JIRA comments or via branch search for [ISSUE-KEY]. Please paste the PR URL directly."

---

## Step 6 — Fetch PR metadata, then run the CONFLICT GATE (before any context or diff)

**6a. Fetch PR metadata only** (small payload — not the diff yet):
```powershell
$prJson = gh pr view <PR-URL-or-number> --json number,title,body,state,baseRefName,headRefName,author,reviews,comments,mergeable,mergeStateStatus,url | ConvertFrom-Json
$owner = ($prJson.url -split '/')[3]
$repo  = ($prJson.url -split '/')[4]
$base  = $prJson.baseRefName
$head  = $prJson.headRefName
```

**6b. Conflict gate — run the in-memory merge check:**
```powershell
git fetch origin $base $head 2>$null
$mergeBase = (git merge-base "origin/$base" "origin/$head").Trim()

# Preferred (Git >= 2.38): in-memory merge; exits non-zero on conflict
$mergeTree = git merge-tree --write-tree --name-only "origin/$base" "origin/$head" 2>&1
$conflictExit = $LASTEXITCODE

# Fallback (older Git): conflict markers appear in the output text
if ($mergeTree -match 'usage: git merge-tree') {
    $mergeTree = git merge-tree $mergeBase "origin/$base" "origin/$head"
    $hasConflict = ($mergeTree -match '^\+<<<<<<<')
} else {
    $hasConflict = ($conflictExit -ne 0)
}
```
Cross-check `$prJson.mergeable` (`MERGEABLE` / `CONFLICTING` / `UNKNOWN`) and `$prJson.mergeStateStatus` as a second signal. If `UNKNOWN`, GitHub is still computing — rely on the local `merge-tree` result.

**If conflicts are detected: STOP.** Do not load project context (Step 7), do not fetch the full diff (Step 8), do not run Steps 9–10. Emit only the conflict report and set Overall Assessment to `[חסום]` / `[BLOCKED] — resolve conflict with <base> before review`.

Conflict report (no emojis):
```
MERGE CONFLICT — this PR conflicts with `<base>` and cannot be reviewed yet.
Fix the conflict first, then re-run /jira-review.

Conflicting files:
  - path/to/file1.py
  - path/to/file2.ts
```
If the conflict is large (more than ~2 files, or a conflict in a shared cross-package file), add a short "why this happened" note: which side (`prayers-app/` or `backend/`) each file belongs to, what the overlapping region is, and which files to reconcile by hand (keeping both intents). Reference `CHECKLIST.md §0`: the most common cause is two people editing the same area in parallel, especially the front↔back contract (`services/api.ts` and `backend/app/schemas/schemas.py`).

**If no conflicts:** print one line — `No merge conflicts with <base>.` — and continue to Step 7.

> The conflict gate is a **hard stop**, distinct from a normal `[חסום]` verdict for bugs: a bug-blocked PR still gets a full review; a conflicted PR does not.

---

## Step 7 — Load project context (only after the gate passes — tiered, exact files, nothing else)

Load only the files below. **Do not create or load any other context document.** The project sources of truth are `CHECKLIST.md`, `CONTRIBUTING.md`, `SPEC.md`, the sprint plan (`.claude/sprint-plans/`), and the live code-fact files.

**Always load (cheap, authoritative):**
1. `CHECKLIST.md` (project root) — pitfalls and rules, especially all ⭐ items (used actively in Step 9a). Know the 9 sections.
2. `backend/app/models/models.py` — authoritative SQLAlchemy models: `Prayer`, `User`, `Donation`, `QuickButton`, `Category`, `RecurringDonation`. Note every field, type, and relationship.
3. `backend/app/schemas/schemas.py` — authoritative Pydantic schemas: `DonationCreate`, `DonationResponse`, `UserResponse`, `PrayerResponse`. These define the API contract between frontend and backend.
4. `CONTRIBUTING.md` — binding conventions: naming (`camelCase`/`PascalCase`/`UPPER_SNAKE_CASE` in TS; `snake_case`/`PascalCase` in Python), SRP layers (`app → hooks/services → store` frontend; `router → schema → service → model` backend), DRY, i18n via `t('key')`, RTL via `utils/rtl`. Style findings must cite it.

**Load scoped to the diff (the relevant section only — never the whole file):**
- `SPEC.md` (repo root) — source-of-truth product **behavior** per sprint and feature. Find the section for the feature the diff changes (use the sprint breakdown / feature list as ToC). Derive system-level acceptance criteria from the `Acceptance` blocks — this lets the review judge **completeness**, not just local correctness. Also note the "מה כבר קיים" table: features the skeleton already provides (don't flag missing work that the scaffold deliberately left as TODO for later sprints).
- **Sprint plan** — the current plan in `.claude/sprint-plans/` to confirm the task's intended **scope** (drives the AC-sanity check §9c and out-of-scope check).
- **PR screenshots** — if the PR body has before/after screenshots (the template asks for them), compare them against what `SPEC.md` describes the screen should look like. If a UI-touching PR has **no** screenshot, flag it.

If the diff touches a Zustand store or a service file, read that specific file lazily at that point. Keep all heavy reads scoped to the change.

---

## Step 8 — Fetch the full diff

```powershell
$rawDiff = gh pr diff <PR-URL-or-number>
$skipPattern = 'package-lock\.json|yarn\.lock|pnpm-lock\.yaml|poetry\.lock|\.lock$|__pycache__|\.pyc$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.ico$|\.woff|\.ttf$|\.eot$|\.pdf$|\.min\.js$|\.min\.css$|\.map$'
$sections = $rawDiff -split '(?=^diff --git )', 0, 'Multiline'
$filteredDiff = ($sections | Where-Object { $_ -notmatch "diff --git a/.*($skipPattern)" }) -join ''
```
Note: does the PR title or branch name reference the JIRA issue key? What is the base branch, are there existing reviews/approvals, and what is the PR state?

---

## Step 9 — Review

Run in this order: **(9a) CHECKLIST.md ⭐ pass → (9b) substance checks → (9c) AC-vs-architecture → (9d) the seven generic areas.** Project-specific landmines surface first.

### 9a — CHECKLIST.md ⭐ pass (active, against the diff)

For each section relevant to the diff, run the check and report any hit as a finding card with the right severity:

| CHECKLIST section | ⭐ check against the diff |
|---|---|
| §0 Impact mapping | Diff touched both `prayers-app/` and `backend/`? Front↔back contract (field names/types in JSON) verified to match on both sides? |
| §1 Naming & SRP | TS: variables/functions `camelCase`, components `PascalCase`, constants `UPPER_SNAKE_CASE`? Python: modules/functions `snake_case`, classes `PascalCase`? Frontend layers (`app → hooks/services → store`) respected? Backend layers (`router → schema → service → model`) respected? |
| §2 Frontend state/nav/i18n | Global state via Zustand store (`store/*Store.ts`)? Navigation via Expo Router file-based (`app/`), not manual? User-facing strings via `t('key')` with the key present in `i18n/he.json`? RTL via `utils/rtl` with logical properties (`paddingStart`/`marginEnd`) not hardcoded left/right? |
| §3 Frontend network | All network calls through `services/api.ts`, not bare `fetch` in screens? Loading and error states handled in UI? Edge cases checked: network failure, 4xx/5xx, empty list, expired token? |
| §4 Backend structure | FastAPI router registered in `app/main.py`? Business logic in service, not router? Input through Pydantic schema validation? Auth-required routes protected by the auth dependency? Response field names match what `services/api.ts` or `types/` expect? |
| §5 DB / migrations | SQLAlchemy model changed → Alembic migration present (`alembic revision --autogenerate`)? No manual `ALTER TABLE`? New field has a default/nullable for existing rows? Field that must be unique declared as `unique=True`? Breaking change (column rename/delete) split into two PRs? |
| §6 Payments / Stripe / Firebase | Stripe amount sent as **integer agorot** (cents), not float shekels? Stripe/Firebase keys from `EXPO_PUBLIC_*` (frontend) / env (backend), never hardcoded? Firebase error path covered (user cancels, token expires)? Stripe webhook (if touched) verifies signature server-side? |
| §7 Secrets / config | New secret not committed — in `.env` which is in `.gitignore`? `.env.example` updated with the key name (no value)? No hardcoded IP/URL in code? |
| §8 Quality / tooling | Frontend: `npm run lint` + `npm run format:check` + `npm run type-check` all pass? Backend: `python -m ruff check .` clean? Husky pre-commit not bypassed with `--no-verify`? Backend server boots (`uvicorn app.main:app`) and migrations run? |
| §9 Merge-readiness | No conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in the diff? No unrelated files in the PR? |

### 9b — Substance checks

- **Per-identifier source-of-truth verification.** For every model field, schema field, i18n key, route path, or constant in the diff, confirm it against the loaded source of truth (case-sensitive):
  - `backend/app/models/models.py` for SQLAlchemy model field names and types.
  - `backend/app/schemas/schemas.py` for API request/response field names and types.
  - `prayers-app/i18n/he.json` for i18n key existence.
  - `prayers-app/constants/` for `DONATION_TIERS`, `QUICK_BUTTONS`, `ROUTES`, `API`, etc.
  - A mismatch (e.g. diff sends `prayer_title` but schema defines `prayer_name`) is `[BLOCKING | Correctness]` — cite the source file and the correct name. It is a factual error, not style.
- **Contract verification.** If the diff adds or changes a backend endpoint, verify that the response field names match what the frontend (`services/api.ts` or `types/`) expects. A field name mismatch across the seam causes a silent `undefined` on the frontend — always `[BLOCKING | Correctness]`.
- **Parallel / wrong-location implementation.** If the ticket names a specific file to change (e.g. "fill the TODO in `prayer_service.py`") and the diff instead creates a new parallel file duplicating the mechanism, flag it `[BLOCKING | Correctness]` — which one is active, and is the old one now dead code?
- **Stripe amount check.** If the diff passes an amount to Stripe, verify it is an integer (agorot/cents), never a float or shekel value. If it isn't, this is `[BLOCKING | Correctness]`.

### 9c — AC vs architecture sanity check (report under "AC Spec Issues", before code findings)

After extracting the ACs, check each against the project architecture. Common issues for this project:
- If an AC references auth but there's no `auth dependency` in the route, flag it.
- If an AC requires a feature that `SPEC.md`'s "מה כבר קיים" table lists as not-yet-built (belonging to a later sprint), flag it as out-of-scope.
- If an AC implies a DB field that doesn't exist in `models/models.py` and no migration is included, flag it.

Each AC Spec Issue: `[בעיית מפרט] AC #N — <text> — <why it contradicts the architecture>. This is a ticket problem, not a code bug.`

### 9d — The seven generic areas

**Correctness** — logic matches the JIRA task; off-by-one, wrong conditionals, null/undefined/None gaps.
**Security** — no hardcoded secrets/tokens; boundary input validation (Pydantic on backend, type checks on frontend); no OWASP top-10 issue.
**Performance** — no N+1 DB queries; no needless loops in hot paths; limits on growable data.
**Error handling** — errors caught at boundaries; no swallowed `except: pass`; async errors awaited; meaningful error messages returned.
**Clean code** — clear naming (per `CONTRIBUTING.md`); DRY; single-responsibility functions; no magic numbers.
**Code quality** — no dead code / leftover debug prints/`console.log`; consistent with project patterns; no scope creep beyond the ticket.
**Test coverage** — new behaviors tested; edge cases from JIRA comments covered. (Note: this project is early-stage; absence of tests is less critical than correctness, but flag if a critical path has no test at all.)

---

## Step 10 — Validate implementation against JIRA requirements

Cross-check each acceptance criterion / requirement from Step 4 against the diff. Mark each `[COVERED]` / `[PARTIAL]` / `[MISSING]` / `[N/A]` (Hebrew: `[מולא]` / `[חלקי]` / `[חסר]` / `[לא רלוונטי]`). Also: does the PR do more than the ticket asked (out-of-scope)? Do JIRA comments add requirements not reflected in the PR?

---

## Step 11 — Draft the report, get approval, then post

The report is **authored in Hebrew by default** (English only with `--en`). It is published to GitHub **under the reviewer's account** as `CHANGES_REQUESTED` — an outward-facing action, hard to take back — so it must **never auto-post**.

> 1. Print the full report to the reviewer first as a **draft** — do not post it to GitHub yet.
> 2. Ask: `לפרסם את המשוב ל-PR #<n> כ-CHANGES_REQUESTED תחת החשבון שלך? (כן / לא / ערוך)`.
> 3. Only on explicit **כן** → post via `gh pr review`. On **ערוך** → apply the change and re-confirm. On **לא** → leave it as a draft.
> 4. Never post without that confirmation, even when the verdict is positive.
> 5. **Do not post a comment in JIRA** — because this team names branches with the issue key (e.g. `DON-5/...`), JIRA's development panel already auto-links the PR. A separate JIRA comment is redundant.

### Report skeleton (exact order, every run — even when a section is empty, write its empty-state line; never open in free-form prose)

1. **Header block** — Task / Assignee / PR (one line each).
2. **Requirements Coverage** — one line per AC, status-labelled.
3. **AC Spec Issues** — only if any (§9c), before code findings.
4. **Code Review Findings** — finding cards, grouped Blocking → Important → Minor.
5. **Out-of-scope Changes** — or "None".
6. **Overall Assessment** — one bracketed verdict line (see Step 12).

**Finding card format** (every finding, including the lead one — never a paragraph):
```
[BLOCKING | Security]
What: One sentence — exactly what the code does.
Why it's a problem: One sentence — the real risk/impact if left unfixed.
How to fix: One sentence — the approach, no code, just the idea.
file: `backend/app/routers/prayers.py:42`
```

**Severity labels** — `[BLOCKING]` / `[IMPORTANT]` / `[MINOR]` (Hebrew `[חסימה]` / `[חשוב]` / `[שיפור]`). The severity+category line is always bracketed and pipe-separated: `[BLOCKING | Correctness]` / `[חסימה | נכונות לוגית]`. No leading glyph.

**Severity calibration (mandatory):** if a problem **breaks functionality for any real user** — including a wrong field name that causes a silent `undefined` on every client, or a Stripe amount in float shekels that causes payment failures — it is `[חסימה]`, not `[חשוב]`. `[חשוב]` is for real problems that don't break the experience for anyone; `[שיפור]` is polish. When unsure: "does this break for any user in production?" If yes → blocking.

**`file:` line rule:** every card ends with a `file:` line — `` file: `path/to/file.py:NN` `` — path and line only, in backticks, nothing else, no Hebrew, no glyph. If the line number is approximate, still give the nearest number. If cross-file, write exactly `` file: `(cross-file — see diff)` ``. Never omit the line.

**Junior-clarity bar:** every card is three plain sentences (`מה קורה / למה זה בעיה / איך לתקן`), no jargon, no code. After writing a card, re-read it as a junior: is it clear **what** is wrong, **where** (the `file:` line), and **what to do**? If any is unclear, rewrite.

### Hebrew output rules (default path)
- Wrap the whole report in `<div dir="rtl"> ... </div>`.
- **No em dashes and no ` - ` separators in Hebrew prose.** Before printing, find-replace every `—` and every ` - ` used as a separator between Hebrew clauses → `:`. The em dash must not appear anywhere in the Hebrew output.
- **Bidi safety:** keep Hebrew prose lines pure Hebrew. Paths/identifiers/filenames go on their own line (the `file:` line). A short English technical term needed mid-sentence (`store`, `hook`, `schema`, `service`) is wrapped in backticks and kept to a single token — never an English phrase mid-sentence. If a clause needs more than one English word, restructure so the English sits on its own line. Re-read each Hebrew line as rendered RTL: if an English term changes the reading order or "jumps", move it to its own line.
- Status/coverage labels (Hebrew): `[מולא]` / `[חלקי]` / `[חסר]` / `[לא רלוונטי]`.
- Start the Hebrew report with: `### דוח סקירת קוד`

### Voice, tone & address (the review is the team lead's own voice, speaking to the developer)
- **First person for the reviewer, never third person.** Prior instructions/comments by the reviewer are `אמרתי` / `כתבתי` / `ציינתי` / `ביקשתי` / `הערה שלי`. Never write the reviewer's name in third person.
- **Feminine address to the developer** (the team is female): `כתבת`, `שמת לב`, `תתקני`, `ראי`, `בדקי`. (English report: neutral "you".)
- **Genuine, specific praise — when earned.** When the work is efficient, careful, or shows prior comments were taken in, say so specifically (name the thing done well, not empty "good job"). Praise is **separate** from the verdict — a `[חסימה]` PR can still open with real praise. One short line at the **start of the Overall Assessment**, before the must-fix list. No banner, no emoji. Do not praise by reflex — only when there is something real to point to.

### Final pass before printing
Scan and strip **any** emoji that slipped in (severity, status, decoration) — the report must contain **zero** emoji characters. Severity/status are bracketed text only. Confirm the section order matches the skeleton and no section degraded into prose.

---

## Step 12 — Merge-blocking verdict rules

The verdict is `[חסום]` / not ready to merge when **any** holds (state which one(s) triggered it):
- **Any unresolved `[חסימה]` finding** — including blocking code bugs, not only architecture/spec issues.
- **A merge conflict with base** — the conflict gate (Step 6) already stops the review; verdict is `[חסום]` until resolved.
- **A `[חסימה]` AC Spec Issue (§9c)** — an architecturally-impossible requirement blocks until the ticket is corrected.

English verdict labels: `[READY]` / `[NEEDS CHANGES]` / `[BLOCKED]`. Hebrew: `[מוכן למיזוג]` / `[דרושים תיקונים]` / `[חסום]`.
