---
name: sprint-to-jira
description: Mirror an existing sprint plan (from /sprint-plan-next) into Jira as an open, self-selectable task pool. Creates one Story per task in proper RTL Hebrew, with the branch name in the summary and the full "exactly what to do" detail in the description; sized, labeled, added to the target sprint; backlog items created in the backlog. Developers pick their own tasks, so tickets are created unassigned. Writes no code.
---

# Sprint → Jira (open, self-selectable pool)

Take a sprint plan that **already exists** (produced by `/sprint-plan-next`) and create every task in Jira: one **Story per task**, written in **proper Hebrew**, sized, labeled, and added to the target sprint — as an **open pool the two developers self-select from**.

This skill is the Jira-creation counterpart to `/sprint-plan-next`. It only **mirrors an existing plan into Jira** — it does not plan, break down work, estimate, or read the spec/Figma (that already happened in the planner), and it writes no code.

**The ticket carries the work in full — this is the point of the skill:**
- **Summary** = the **branch name only**, in the standard issue-key form `<ISSUE-KEY>-<english-slug>` (e.g. `DON-12-prayers-api`). Short, stable, ASCII, and auto-linked to Jira (branch-from-issue / smart commits). Because the issue key exists only after creation, the summary is finalized in a follow-up update (Step 5). The Hebrew title and all human-readable text live in the **description**, not the summary.
- **Description** = **exactly what to do** — opens with the task's Hebrew title, then the planner's complete §4·1 detail (What, Context, Where + what exists now, Steps, Reuse pointers, the front↔back contract, Pitfalls, Proof-of-done, Setup, Out-of-scope, Acceptance criteria), written out in proper Hebrew. Do not thin it down; the description is the most important part of the ticket.

Two things also shape every ticket:
- **Self-selection.** The developers choose what to take, so each task is created as a standalone, openly-pickable Story. Cross-references (dependencies, "see also") point to the **related task** (its id / SCRUM key) so whoever picked it can be found and asked.
- **Hebrew.** The description (and its opening title) is written in **proper, natural RTL Hebrew** (Step 7); the summary stays ASCII because it is a branch name.

**Usage:** `/sprint-to-jira [--sprint N] [--plan <path>] [--dry-run]`

- `--sprint N` — which sprint's plan to load from `.claude\sprint-plans\`. Default: the **highest-numbered** `sprint-<N>-plan-team.md`.
- `--plan <path>` — explicit plan-file override.
- `--dry-run` — parse the plan and print exactly what **would** be created, but never POST anything.

**Input:** $ARGUMENTS

---

## Step 1 — Load and parse the sprint plan

Resolve the plan file:

1. If `--plan <path>` is given, use it.
2. Else if `--sprint N` is given, use `.claude\sprint-plans\sprint-<N>-plan-team.md`.
3. Else auto-detect: list `.claude\sprint-plans\sprint-*-plan-team.md`, pick the **highest** `N`.

```powershell
$plans = Get-ChildItem ".claude\sprint-plans\sprint-*-plan-team.md" -ErrorAction SilentlyContinue |
  Sort-Object { [int]([regex]::Match($_.Name, 'sprint-(\d+)-plan').Groups[1].Value) } -Descending
```

If the resolved file does not exist, **stop** and list what *is* in the folder:

```powershell
Get-ChildItem ".claude\sprint-plans\" | Select-Object Name
```

**Parse the plan into an in-memory task list.** The plan uses `####`-level task headings like `#### F1 — HomeScreen (prayers list)` grouped under `### Feature — <name>` sections. The planner writes **full §4·1 detail** in each block — capture **all** of it, because it becomes the Jira description verbatim. For each task block extract:

| Field | Source in the plan | Goes into the Jira ticket as |
|-------|--------------------|------------------------------|
| **Task ID** | leading token of the `####` heading (e.g. `F1`, `F3a`) | slug source + traceability |
| **Title** | the rest of the `####` heading after the `—` | slug source + the Hebrew title that opens the description |
| **Feature** | the enclosing `### Feature — <name>` heading | label + branch slug |
| **What / Goal** | the `**Goal:**` line | description: *מה בונים* |
| **Context** | the `**Context:**` line (end-to-end wiring, the contract, what it unblocks) | description: *הקשר וחיבור למערכת* |
| **Where + what exists now** | the file path(s) + "what exists now" written in the block (already-done / skeleton-gap / net-new) | description: *היכן לעבוד* |
| **Steps** | the numbered steps + reuse pointers (file + what to take, pattern/store/constant/i18n key, the pattern/file to mirror) | description: *שלבי ביצוע* |
| **Pitfalls** | the pitfalls / conventions notes in the block | description: *מלכודות* |
| **Proof of done** | the screenshot / request-response / running-check requirement | description: *הוכחת ביצוע* |
| **Setup** | any migration / seed / token / test-file steps | description: *הכנות* (only if present) |
| **Out of scope** | the `**Out of scope:**` line | description: *מחוץ לטווח* |
| **Dependencies** | the `**Dependencies:**` line — kept as task IDs | description: *תלויות* (related task ids) |
| **Acceptance criteria** | the `- [ ]` items under `**Acceptance criteria:**` | description: *קריטריונים לקבלה* |
| **Effort** | `**Effort:**` — first of `S` / `M` / `L` / `XL` | story points |
| **Blocker flag** | `🚨 BLOCKER` anywhere in the heading/block | `blocker` label + High priority |
| **Backlog flag** | the task sits under the plan's **Backlog section**, or is tagged `backlog` / `sprint-<N+1>` | `backlog` bucket |
| **Existing JIRA key** | any `SCRUM-\d+` mentioned in the block | carryover → add-to-sprint (Step 4) |

If a block is missing some of these sections it is a **plan gap** — note it in the preview (Step 4); do not invent detail the plan (which read the code) did not provide.

**Derive the slug** for each task now (the full branch name needs the Jira issue key, which only exists after creation — see Step 5). The slug is a short kebab-case English slug of the title (3–4 words, ASCII), e.g. `#### F1 — HomeScreen (prayers list)` → `home-screen`, `#### A2 — Prayers API` → `prayers-api`. The final **branch name = summary = `<ISSUE-KEY>-<slug>`** (e.g. `DON-12-prayers-api`) — the project key + the number Jira assigns + the slug. Keep it ASCII/LTR; it is a git branch, not Hebrew.

Skip non-task `####` sections that aren't real deliverables. Build the task list `$tasks`.

---

## Step 2 — Authenticate with Jira

Reuse the **exact** auth pattern from `jira-review.md` Step 2.

```powershell
$settings = Get-Content "$env:USERPROFILE\.claude\settings.json" -Raw | ConvertFrom-Json
$email       = $settings.mcpServers.jira.env.JIRA_EMAIL
$token       = $settings.mcpServers.jira.env.JIRA_API_TOKEN
$jiraBaseUrl = $settings.mcpServers.jira.env.JIRA_URL   # e.g. https://saraaber675.atlassian.net

# Fallbacks (same order as jira-review.md)
if (-not $email) { $email = $env:JIRA_EMAIL }
if (-not $token) { $token = $env:JIRA_API_TOKEN }
```

If `$email`, `$token`, or `$jiraBaseUrl` is missing, **stop** with:

> "Jira credentials not found. Add `JIRA_EMAIL`, `JIRA_API_TOKEN`, and `JIRA_URL` to `$env:USERPROFILE\.claude\settings.json` under `mcpServers.jira.env`.
> Generate an API token at: https://id.atlassian.com/manage-profile/security/api-tokens"

Build the Basic Auth header and a reusable headers map:

```powershell
$b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${token}"))
$headers = @{ Authorization = "Basic $b64"; Accept = "application/json"; "Content-Type" = "application/json" }
```

Use `Invoke-RestMethod` for all Jira calls. Wrap each call in `try { ... } catch { ... }` and inspect `$_.Exception.Response.StatusCode`:
- **401** → "Jira token invalid or expired — regenerate it at the token page above." Stop.
- **403** → permissions issue on that resource — note it and continue where possible.
- **404** → resource not found (handled per-step below).

---

## Step 3 — Resolve project and the target sprint

**a) Determine the project key.** Derive it from existing `SCRUM-\d+` keys in the plan (→ `SCRUM`). If none can be found, ask the user for the project key once.

**b) Find the target sprint id.** Get the board for the project, then its sprints, and match the one named `Sprint N`:

```powershell
$boards = Invoke-RestMethod -Method Get -Headers $headers `
  -Uri "$jiraBaseUrl/rest/agile/1.0/board?projectKeyOrId=$projectKey"
$boardId = $boards.values[0].id
$sprints = Invoke-RestMethod -Method Get -Headers $headers `
  -Uri "$jiraBaseUrl/rest/agile/1.0/board/$boardId/sprint?state=active,future"
$targetSprint = $sprints.values | Where-Object { $_.name -match "Sprint\s*$N\b" } | Select-Object -First 1
$sprintId = $targetSprint.id
```

If the board or sprint lookup fails (404 / empty), **do not abort** — set `$sprintId = $null` and note "tickets will be created without sprint assignment" in the report.

**c) Check story-points field.** Story points usually live in a custom field (commonly `customfield_10016`). Try to resolve it from the create-meta / field list; if it can't be resolved, skip setting points (still put effort in labels) and note it.

---

## Step 4 — Preview and confirm (always)

Before creating anything, **idempotency check**: the summary is now a branch name `<KEY>-<slug>`, so match on the **slug** (which is stable across runs) plus the `sprint-<N>` label, so re-runs don't duplicate:

```powershell
$jql = "project=$projectKey AND labels='sprint-$N' AND summary~'\"$slug\"'"
$existing = Invoke-RestMethod -Method Get -Headers $headers `
  -Uri "$jiraBaseUrl/rest/api/3/search?jql=$([uri]::EscapeDataString($jql))&fields=summary,labels"
```

**Carryover tickets (already carry a `SCRUM-\d+` key) are NOT recreated — they are added to the target sprint.** For each task with an existing key: do **not** POST a new issue, but **do** add the existing key to `$sprintId` in Step 5. Mark it `↪️ existing → add to sprint` in the preview.

**Categorize every task into exactly one bucket:**

- **create** — new task, will be POSTed.
- **skip** — a same-summary + `sprint-<N>` duplicate already exists.
- **add-to-sprint** — carryover with an existing SCRUM key (add to sprint, don't recreate).
- **backlog** — a deferred/cut item from the plan's Backlog section. Still **created** as a ticket, in the backlog (not added to the active sprint).

Print a concise preview table. State up front: **"Summary = branch name (`<KEY>-<slug>`, key assigned on creation); full how-to detail in the description, in Hebrew (RTL)."**

| Task | Bucket | Branch (summary) | Hebrew title (→ description) | Effort → Points | Labels | Sprint | Note |
|------|--------|------------------|------------------------------|-----------------|--------|--------|------|

- **Branch (summary)** column: the provisional branch with the number still unknown, e.g. `DON-?-prayers-api` (the `?` is filled with the issue number Jira assigns in Step 5).
- **Hebrew title (→ description)** column: the Hebrew title that will open the description, so the user can confirm the Hebrew rendered correctly (real letters, not `?`).
- **Note** is one of: `new` · `⚠️ duplicate exists (KEY)` · `↪️ existing → add to sprint` · `backlog (sprint-<N+1>)` · `⚠️ plan gap (missing <section>)`.

Then:

- If `--dry-run` → **stop here.** Print "Dry run — nothing was created." Never POST.
- Otherwise ask:
  > "Create these N issues in Jira? Reply **yes** to create all · **edit \<task\>** to adjust one first · **no** to abort."

**WAIT for the user's reply.** Do not proceed to Step 5 until they confirm. On `edit <task>`, apply the change to that task in `$tasks`, reprint the affected row, and re-ask.

---

## Step 5 — Create the Jira issues (on approval only)

Process each approved task **by bucket**:

- **skip** — duplicate already exists → do nothing.
- **add-to-sprint** — carryover with an existing SCRUM key → **do not POST**; just run the sprint-add call (step 6) on the existing key so it lands in `$sprintId`.
- **create** — POST a new issue and **add it to `$sprintId`**.
- **backlog** — POST a new issue with the `backlog` + `sprint-<N+1>` labels, but **do NOT add it to the active sprint** — it belongs in the product backlog, ready to be pulled into a future sprint. (If a `Sprint <N+1>` already exists in Jira, you may add it *there* instead.)

For each task to be POSTed:

**1. The summary is the branch name `<ISSUE-KEY>-<slug>`** (e.g. `DON-12-prayers-api`) — pure ASCII, no Hebrew. The issue key only exists after the POST, so create with a **provisional summary = the slug** (e.g. `prayers-api`), then finalize it to `<created.key>-<slug>` in the follow-up update in step 5.

**2. Map effort → story points:** `S=1`, `M=3`, `L=5`, `XL=8`.

**3. Build labels:** `sprint-<N>`, the feature slug (e.g. `home-screen`, `i18n`, `backend`). Add `blocker` if flagged `🚨 BLOCKER`. Add `backlog` + `sprint-<N+1>` for a backlog item. Labels stay in **English/ASCII** for board filtering — only the description is Hebrew (the summary is the ASCII branch name).

**4. Compose the description — this is the core of the ticket: EXACTLY what to do, in Hebrew ADF.** Build it as a sequence of ADF sections, each a Hebrew heading followed by the content carried from the plan (Step 1 fields). Include **every** section the plan provides; omit only a section the plan genuinely doesn't have. Follow the Step 7 Hebrew rules throughout (RTL, no em dashes, every file path / endpoint / task id on its **own LTR line**).

Required section order:

1. **Hebrew title** — the task's Hebrew title as the opening heading of the description (this is where the human-readable title lives, since the summary is just the branch name).
2. **`שם הבראנץ'`** — the branch name `<KEY>-<slug>` on its own LTR line (matches the summary, so the developer can copy it to create the branch).
3. **`מה בונים`** — the *What*: the situation, the deliverable, and **why it matters this sprint**, in clear Hebrew prose.
4. **`הקשר וחיבור למערכת`** — the *Context*: which feature/flow it belongs to, where it plugs in end-to-end (the screen + route + service + model it touches), what it depends on and what it unblocks, and the **front↔back contract** (field names/types) it must honor. Put any field/endpoint name on its own LTR line.
5. **`היכן לעבוד`** — exact file path(s) + the function/component, and **what exists now** (already-done / skeleton-with-the-gap / net-new, from the plan). Paths on their own LTR lines.
6. **`שלבי ביצוע`** — the numbered steps, with the concrete reuse pointers (which file to open, which existing pattern/store/constant/i18n key to reuse) **and the existing pattern/file to mirror** (the similar implementation to copy from).
7. **`מלכודות`** — the pitfalls from the plan/conventions (e.g. Stripe amounts in integer agorot not float shekels; no hardcoded strings, use `t('key')`; RTL via `utils/rtl`; schema changes via `alembic revision --autogenerate`, never manual `ALTER TABLE`; secrets via `.env` / `EXPO_PUBLIC_*`).
8. **`הכנות`** *(only if the plan lists setup)* — the exact migration / seed / token / test-file steps (`alembic upgrade head`, `python scripts/seed.py`, which `.env` key to add).
9. **`הוכחת ביצוע`** — the proof-of-done: a **before/after screenshot in the PR** for any visible UI change; the exact request/response or running check for backend (e.g. `GET /api/prayers` returns 5).
10. **`מחוץ לטווח`** — what this task explicitly does NOT cover.
11. **`תלויות`** — the related task ids / SCRUM keys, each on its own LTR line (e.g. `F2`), so whoever picked that task can be found and asked. Never a person.
12. **`קריטריונים לקבלה`** — the acceptance criteria as a Hebrew checklist, **including the review gate**: PR reviewed by the other developer, then approved by Sara before merge to `main`.

A **short** starter snippet / function signature for these juniors is allowed — put it in a fenced **LTR** block on its own line inside the relevant section, separated from the Hebrew prose (a signature or a few-line starter, not a full implementation).

**5. POST the issue, then finalize the summary to `<KEY>-<slug>` (UTF-8 bytes — mandatory for Hebrew):**

```powershell
$body = @{
  fields = @{
    project   = @{ key = $projectKey }
    issuetype = @{ name = "Story" }
    summary   = $slug                        # provisional (e.g. "prayers-api"); finalized below once the key exists
    description = $adfDescription            # ADF object, Hebrew RTL, all sections above
    priority  = @{ name = $(if ($t.Blocker) { "High" } else { "Medium" }) }
    labels    = $labels
  }
}
if ($spField -and $points) { $body.fields[$spField] = $points }

# CRITICAL — send the body as UTF-8 bytes so Hebrew is not mangled into "?" placeholders.
# Do NOT pass a plain -Body string in Windows PowerShell 5.1: it re-encodes and corrupts Hebrew.
$json  = $body | ConvertTo-Json -Depth 20
$bytes = [Text.Encoding]::UTF8.GetBytes($json)
$created = Invoke-RestMethod -Method Post -Uri "$jiraBaseUrl/rest/api/3/issue" `
  -Headers $headers -ContentType "application/json; charset=utf-8" -Body $bytes

# Now the key exists — set the summary to the standard branch name "<KEY>-<slug>".
$branch = "$($created.key)-$slug"            # e.g. "DON-12-prayers-api"
$upd    = @{ fields = @{ summary = $branch } } | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Put -Uri "$jiraBaseUrl/rest/api/3/issue/$($created.key)" `
  -Headers $headers -ContentType "application/json; charset=utf-8" `
  -Body ([Text.Encoding]::UTF8.GetBytes($upd))
```

> The summary is ASCII, so it never needs the Hebrew encoding check — but keep using the UTF-8 byte body for the **description** (the Hebrew lives there).

**6. Add to the sprint** — **only for `create` and `add-to-sprint` tasks.** **Skip this for `backlog` tasks.** Use the **newly created** key for `create`, or the **existing carryover** key for `add-to-sprint`:

```powershell
if ($t.Bucket -ne 'backlog' -and $sprintId) {
  $key = if ($created) { $created.key } else { $t.ExistingKey }   # carryover uses the existing SCRUM key
  $moveBody = @{ issues = @($key) } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Headers $headers `
    -Uri "$jiraBaseUrl/rest/agile/1.0/sprint/$sprintId/issue" -Body $moveBody
}
```

**Error handling per task:** retry a failed create **once**; if it still fails, **skip that task and continue** — never abort the whole run on one failure. Record the error. If sprint-add fails but the issue was created, keep the issue (note "created, not added to sprint").

---

## Step 6 — Report results and update memory

Print a results table:

| Task | Branch | Jira Key | URL | Status |
|------|--------|----------|-----|--------|

Status ∈ `✅ created` · `📋 created in backlog` (intentionally not in the active sprint) · `↪️ existing → added to sprint` (carryover) · `⚠️ created, not in sprint` (sprint-add failed) · `⚠️ encoding` (Hebrew came back corrupted) · `⏭️ skipped (duplicate)` · `❌ failed`.

URL form: `$jiraBaseUrl/browse/<KEY>`. List every failure with its error message, then offer:
> "Retry the N failed task(s)? (yes / no)"

**Encoding verification (mandatory — Hebrew always).** Immediately after creation, read each created issue back and confirm the Hebrew survived the round-trip — that it was **not** stored as `?` / `???` placeholders or mojibake:

```powershell
$check = Invoke-RestMethod -Method Get -Headers $headers `
  -Uri "$jiraBaseUrl/rest/api/3/issue/$($created.key)?fields=summary,description"
```

For each issue, verify the stored **description** contains real Hebrew characters (Unicode range `֐-׿`) and **no** runs of `?` where Hebrew should be. (The summary is the ASCII branch name and is expected to be ASCII — confirm it is `<KEY>-<slug>`, not that it contains Hebrew.) If a description comes back with `?`-corruption or no Hebrew, mark it `⚠️ encoding`, **stop creating further issues**, and report it — the UTF-8 byte body in Step 5 is the fix; do not keep posting corrupted tickets.

**Write the created keys back into the plan file (traceability).** For each created/added task, write its `SCRUM-\d+` key into the matching `####` task block in `sprint-<N>-plan-team.md` — e.g. append a `**Jira:** SCRUM-153` line. On a re-run the idempotency check (Step 4) will then see the key and bucket the task as `add-to-sprint`/`skip` instead of duplicating.

**Update persistent memory** (`C:\Users\User\.claude\projects\c--Users-User-Desktop---------------Donations\memory\`): add/update a `project`-type memory noting **Sprint N tickets were created in Jira** (absolute date, count, project key, sprint id, the SCRUM key range), with a one-line pointer in `MEMORY.md`.

---

## Step 7 — Hebrew rules

The **description** written into Jira must be **proper, natural Hebrew**. (The summary is a pure-ASCII branch name `<KEY>-<slug>` and is exempt from these rules.) Follow every rule:

**RTL.** Write the description so it reads right-to-left. Open the ADF description with an explicit direction so Jira renders it RTL, and keep each Hebrew sentence on its own line. Never let a line start with a Latin word that flips the visual order.

**No em dashes — ever** (inside Hebrew text). Use a colon `:` or a comma instead.
- ❌ `המשימה: לבנות מסך — כולל ולידציה`
- ✅ `המשימה: לבנות מסך, כולל ולידציה`

**No Hebrew + Latin mixing on one line.** Put any English identifier (branch name, endpoint, field name, file path, JIRA key, task id) on its **own separate LTR line**, never inline inside a Hebrew sentence — bidi reordering makes mixed lines unreadable.

**Grammatical voice.** Address the developer in **feminine** voice (`עלייך לפתח...`, `את אחראית על...`) or **impersonal third person** (`המשימה מפתחת...`, `נדרש לפתח...`). Describe **what is built**, not who asked for it.

**The description must say exactly what to do.** Every planner section (Step 5·4 list) is rendered in full Hebrew. Technical names (endpoints, fields, file paths, task ids) appear as plain ASCII on their **own LTR line**. A short starter snippet / signature is allowed in a fenced LTR block on its own.

**Translate the content, not the keys.** Labels (`sprint-<N>`, `home-screen`, `backlog`) and the branch name stay in English/ASCII — only the human-readable Hebrew prose is translated.

**Verify the result.** Use the encoding verification in Step 6 to confirm the Hebrew round-tripped as real characters and not `?` placeholders (UTF-8 byte bodies are the fix).

---

## Quality bar

- Reuse the auth pattern from `jira-review.md` exactly; keep this skill self-contained and concise.
- **Summary carries the branch name; description carries the full "exactly what to do" detail** (Step 5·4) — never thinned down.
- **Idempotent-friendly:** warn in the preview when a same-summary + `sprint-<N>` task (or an existing `SCRUM-` carryover key) appears to exist, so re-runs don't duplicate.
- **Errors:** missing creds → stop with instructions · 401 → invalid-token message · 404 on board/sprint → create without sprint and note it · per-task failure → retry once, then skip and continue.
- **Mandatory dry-run review:** before any real run, present the **create / skip / add-to-sprint / backlog** list (Step 4) and confirm; `--dry-run` never POSTs.
- **Carryover** (existing SCRUM key) is added to the sprint, never recreated. **Backlog/deferred items are created** in the backlog. **Created keys written back into the plan file.**
- **Hebrew:** RTL, no em dashes in prose, no Hebrew+Latin on one line, feminine/impersonal voice, dependencies reference the related task, keep any code snippet in its own LTR block, and verify the round-trip is real Hebrew via UTF-8 byte bodies.

## Out of scope

- Planning, task breakdown, effort estimation, carryover detection, design/Figma reading — those belong to `/sprint-plan-next`.
- Any code changes.
