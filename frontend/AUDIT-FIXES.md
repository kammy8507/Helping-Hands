# HelpingHands — Floto Usability Audit Fixes

All fixes are confined to the frontend UI/structure of the **public landing
page** and the shared design-system components. No business logic, API
contracts, auth, routing, or dashboard workflows were changed. The project
builds successfully (`npm run build`).

## Files changed

- `src/components/ui/index.jsx` — button design system + Eyebrow size.
- `src/pages/public/index.jsx` — landing page structure, cards, typography,
  colors, accessibility.
- `src/components/shared.jsx` — removed sub-12px text on components shown on the
  landing (map preview, timeline, hospital summary).
- `src/index.css` — anchor scroll-offset for the sticky navbar.
- `src/pages/responder/index.jsx` — migrated 2 buttons off a removed variant
  (`success` → `primary`); no visual change.

## How each audit issue was fixed

1. **Too many button styles (7 → 3+1).** `Btn` now exposes only `primary`,
   `outline` (aliased `secondary`) and `danger`, plus an optional `ghost`. Dead
   `subtle`/`dark` variants were removed and `success` (identical to primary)
   was migrated away. All buttons already share one height/padding/radius/font/
   icon-alignment/hover/focus/disabled/transition definition, and an unknown
   variant now falls back to `primary`.

2. **Too many text colors (~15 → small token set).** Consolidated to role-based
   tokens: primary `slate-900`, secondary `slate-600`, muted `slate-500`,
   accent/link `emerald-700`/`emerald-600`; and on dark surfaces `white`,
   body `emerald-100/80`, muted `emerald-200/60`, accent `emerald-300`. Scattered
   one-off opacity variants were removed.

3. **Inconsistent card styling.** Added one card system: every informational
   card (Features, Services, How-it-works steps, Trust tiles) now uses the shared
   `Card` component with a single icon-container treatment (`ICON_BADGE`,
   `w-12 h-12 rounded-xl`), consistent `p-6` padding, heading and description
   styles. Sections remain distinct in content but clearly share one system.

4. **Primary navigation at the top.** The main navigation renders immediately
   after the utility bar and before the hero (`GovBar → PublicNavbar → Hero`).
   Desktop shows logo + Home/How it works/Services/About/Contact + Sign in + one
   emergency CTA; mobile uses a hamburger menu containing the links plus Sign in
   and Report. Added `scroll-margin-top` so the sticky navbar never covers
   anchored section headings.

5. **Duplicate “Report an emergency” CTA.** The utility bar carries only
   emergency information (“Official emergency response system” / “Life-threatening
   emergency? Call 112 immediately.”) with no CTA. Exactly one prominent CTA
   remains in the hero (largest, red) and one in the navigation.

6. **Body text too small (11px).** Removed 11px body/label text on the landing.
   Base body and card descriptions are 16px (`text-base`) with comfortable line
   height; small supporting labels are 12–14px. Buttons are 14–16px, navigation
   14px.

7. **Small body text across sections.** How-it-works, Features, Services and
   Trust descriptions are all 16px with `leading-relaxed` (~1.6).

8. **Emergency numbers poorly aligned.** Service cards now stack in a clear
   hierarchy — icon → service name → large emergency number → “Emergency
   helpline” caption → description — so each number (108 / 112 / 101) sits
   directly beneath its service, never in a disconnected top-right position.

9. **High density in How-it-works.** The four steps are now cards with a clear
   numbered badge, heading, 16px description and consistent spacing; a clean
   4-column layout on desktop that stacks to 2 columns / 1 column on smaller
   screens.

## Accessibility

- Icon-only controls have `aria-label`s (logo, mobile menu); the menu toggle
  exposes `aria-expanded`; the primary `<nav>` is labelled.
- Keyboard focus is visible globally and on every button.
- Emergency information is never conveyed by colour alone (icon + label + number
  + caption).
- Contrast meets AA for text on both light and dark surfaces; button text ≥14px.

## Responsiveness

- All sections use a max-width container with responsive grids; no fixed widths
  that cause horizontal scrolling. Verified layouts for mobile → desktop across
  navbar, hero, cards, emergency numbers and footer.

## Preserved

- Green emergency/safety theme, branding and overall professional appearance.
- All functionality: login, registration, reporting, photo/camera, location,
  assessment, responder/admin workflows, notifications, hospital management,
  role-based access, routing and backend integration.

## Remaining / intentional

- The brand logotype sub-label (“Emergency Response System” under the wordmark)
  is intentionally kept at its small logotype size to preserve the brand lockup;
  it is a logo element, not body/label text.
- Copy that is not a Floto finding (e.g. the login “forgot password” helper text)
  was left unchanged to avoid out-of-scope edits.
