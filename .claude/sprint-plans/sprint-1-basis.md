# Sprint 1 Basis — פונדמנט + תפילות

Generated: 2026-06-24 | Sprint window: weeks 1–2

---

## Sprint 1 Goal

Working foundation: PostgreSQL up, 5 prayers seeded, Prayers API returning real data, Expo app displaying the prayer list with navigation to the full prayer page. DonationWidget shows tier buttons (static, no payment — that's Sprint 2).

---

## Features in Scope

| # | Feature | Acceptance Summary |
|---|---|---|
| Prereq | Dev Environment Setup | Both devs: `GET /health` → 200, `/docs` shows all 4 routers, Expo opens in browser/simulator |
| F2 | DB Migration + Seed | `alembic upgrade head` clean; 5 prayers + 5 categories in DB |
| F3 | Prayers API Backend | `/api/prayers` → 5 Hebrew prayers; slug lookup increments view_count; search works |
| F4 | App Foundation | App opens; Firebase anon user created; no crashes |
| F5 | Home Screen — Prayer List | 5 PrayerCard items; LoadingSpinner; tap → navigates to prayer page |
| F6 | Prayer Page + DonationWidget Shell | Full prayer text; ₪18/₪36/₪72/₪180/₪360 buttons; tap highlights a tier |

---

## Code Reality-Check Table (Sprint 1 topics only)

| Feature / Topic | Classification | Files + What Exists Now |
|---|---|---|
| `main.py` / `/health` / CORS / 4 routers | **already-done** | `backend/app/main.py` — complete, no changes needed |
| `docker-compose.yml` + `.env.example` | **already-done** | Both present; no changes needed |
| `Donation.prayer_name` column | **net-new change** | `backend/app/models/models.py` — `donor_name` present at line ~75; `prayer_name` is MISSING. Must add before autogenerate. |
| `DonationCreate.prayer_name` field | **net-new change** | `backend/app/schemas/schemas.py` — `DonationCreate` has no `prayer_name`; must add `prayer_name: str \| None = None` |
| Alembic migration | **net-new** | `backend/alembic/versions/` is EMPTY — no migrations exist |
| `backend/scripts/seed.py` | **net-new** | File does NOT exist — write from scratch |
| `prayer_service.py` (4 fns) | **skeleton-partial** | All 4 fns are `raise NotImplementedError`; sync `def`, not async |
| `prayers.py` router (4 routes) | **skeleton-partial** | Routes defined; bodies return `[]` or `{"slug": slug}` stubs |
| `PrayerResponse` schema | **skeleton-partial** | Has `id, slug, title, body`; missing `seo_description, seo_keywords, lang, category_id` — expand in F3 |
| `prayers-app/services/api.ts` | **already-done** | COMPLETE — `getPrayers/getPrayer/searchPrayers/initiateDonation/...` all exist. Do NOT touch. |
| `prayers-app/services/firebase.ts` | **already-done** | `initializeApp, signInAnon, getIdToken` complete |
| `prayers-app/app/_layout.tsx` | **skeleton-partial** | i18n + stripe in Promise.all; missing: `signInAnon()`, `StripeProvider` wrapper, `useAuth()` call |
| `usePrayers()` list hook | **net-new** | NOT in `hooks/usePrayer.ts` — only `usePrayer(slug)` stub exists |
| `usePrayer(slug)` hook | **skeleton-partial** | Stub in `hooks/usePrayer.ts` always returns `{prayer: null, isLoading: true}` — fill body |
| `PrayerCard` component | **already-done** | `components/PrayerCard/PrayerCard.tsx` COMPLETE — do NOT rebuild |
| `app/(tabs)/index.tsx` | **skeleton-partial** | Imports QuickButtons + AppDownloadBanner; TODO comment for prayer FlatList |
| `app/prayer/[slug].tsx` | **skeleton-partial** | Structure: calls usePrayer, shows title+body+LoadingSpinner+DonationWidget; DonationWidget is TODO |
| `DonationWidget.tsx` | **skeleton-partial** | Returns `<Text>DonationWidget — TODO</Text>` — implement tier buttons |
| `DonationBottomSheet.tsx` | **skeleton-partial** | Returns `null` — NOT needed in Sprint 1 |
| `donationStore.ts` | **already-done** | COMPLETE — `selectedTier`, `selectFinalAmount`, `selectTier`. No `isBottomSheetOpen`. |
| `authStore.ts` | **already-done** | COMPLETE — `selectIsLoggedIn`, `selectHasSavedCard` available |
| `constants/*` all | **already-done** | DONATION_TIERS, QUICK_BUTTONS, ROUTES, API, STORAGE_KEYS, THEME all complete |
| `types/*` all | **already-done** | All complete — including `LocalizedPrayer` (see Sync Point) |
| `i18n/he.json` | **already-done** | Complete key source of truth — add missing keys only, never remove |

---

## Sprint 1 Sync Point — the critical front↔back contract

**`PrayerResponse` (backend) must match `LocalizedPrayer` (frontend `types/prayer.types.ts`)**

Frontend type (ALREADY DEFINED — do not change):
```typescript
interface LocalizedPrayer {
  id: string;
  slug: string;
  title: string;          // ← backend maps from title_{lang}
  body: string;           // ← backend maps from body_{lang}
  seoDescription: string; // ← backend maps from seo_description_{lang}
  seoKeywords: string[];  // ← backend maps from seo_keywords_{lang}
  lang: SupportedLang;    // ← backend echoes the requested lang
  categoryId: string;     // ← backend maps from category_id UUID as string
}
```

Backend `PrayerResponse` (expand in F3 to cover all these fields). The mapping happens in a `_localize(prayer, lang)` helper in `prayer_service.py`.

**Both devs align on this contract verbally before F3 and F5/F6 are built in parallel.**

---

## Capacity

| | |
|---|---|
| Developers | 2 juniors, end-to-end ownership |
| Sprint window | 10 working days each = 20 dev-days |
| Estimated total effort | ~11 dev-days (Prereq S×2 + F2 M + F3 M + F4 S + F5 M + F6 M) |
| Load | ~55% — appropriate for first sprint (onboarding + env setup overhead) |

Natural self-selection split: one dev takes Prereq + F2 + F3 (backend foundation path, ~5–6d); other dev takes Prereq + F4 + F5 + F6 (frontend path, ~5–6d).

---

## Memory Notes / Constraints

- **`prayer_name` MUST be in `Donation` model BEFORE `alembic revision --autogenerate`** — this is the one-time initial migration; missing it means an ALTER TABLE migration later.
- **`api.ts` is a reference example — do not modify.** Use `getPrayers()` and `getPrayer(slug)` as-is.
- **`PrayerCard` is a reference example — do not rebuild.** Use directly.
- **Backend services are SYNC** `def` (not async) — except `stripe_service.py` which is async. Match the existing signature style.
- **Stripe amounts in integer agorot** — ₪72 = `7200`, not `72.0`.
- **No hardcoded user-visible Hebrew strings in JSX** — always `t('key')`, add key to `he.json` first.
- **Sprint 1 DonationWidget = static** — tier buttons shown + highlight on tap; "Donate" button is a no-op placeholder. Payment is Sprint 2.
- **`donationStore` has no `isBottomSheetOpen`** — the SPEC pseudocode was wrong. Code wins.
