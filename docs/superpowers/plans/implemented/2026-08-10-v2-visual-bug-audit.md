# v2 Visual Bug Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Find every visual/layout bug on the v2 catalog, product, and checkout pages (mobile + desktop) using chrome-devtools MCP against real seeded data, and produce a findings report for user review.

**Architecture:** Two local dev servers (backend Express+Prisma on :3001, frontend Next.js v2 on :3000) driven by chrome-devtools MCP for navigation, viewport resize, screenshots, and DOM/computed-style inspection. Findings are appended to a single markdown report as they're found — no code is modified in this plan. Fixing is a separate follow-up plan written after the user reviews the findings report (per the spec's find-all-then-fix workflow).

**Tech Stack:** Next.js 16 (App Router), Mantine UI 8.3, Express + Prisma backend, chrome-devtools MCP.

**Spec:** `docs/superpowers/specs/2026-08-10-v2-visual-bug-audit-design.md`

## Global Constraints

- Viewports: mobile 375×812, desktop 1440×900 (from spec)
- Routes in scope: `/catalog`, `/catalog/[slug]`, `/cart` → `/checkout` (from spec)
- Only visual/layout defects count as findings — not functional bugs (from spec)
- No code changes in this plan — audit and reporting only (from spec's find-all-then-fix workflow)
- Findings report location: `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md`

---

### Task 1: Environment setup and verification

**Files:**

- Modify (only if port mismatch found): `.env.local` (`NEXT_PUBLIC_API_URL`)
- Create: `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md` (empty template)

**Interfaces:**

- Produces: two running dev servers (`http://localhost:3000` frontend, backend on the port recorded in `NEXT_PUBLIC_API_URL`) and a confirmed-working chrome-devtools MCP connection, both of which Tasks 2–4 depend on.

- [ ] **Step 1: Start the backend dev server in the background**

Run in a background shell, cwd `F:\Progect\2025\shop_bogdan\backend`:

```bash
npm run dev
```

Watch the output for the port it binds to (e.g. `Server running on port 3001`) and for any startup errors (missing env var, DB connection failure). Note the actual port for Step 3.

- [ ] **Step 2: Confirm the database has product data, seed if empty**

With the backend running, hit its own health/products endpoint, e.g.:

```bash
curl -s http://localhost:3001/api/v1/products?limit=1
```

If the response is an empty array or 404s with "not found", seed the DB:

```bash
npm run db:seed
```

cwd `F:\Progect\2025\shop_bogdan\backend`. Re-run the `curl` check above and confirm it now returns at least one product with a name, price, and image.

- [ ] **Step 3: Reconcile `NEXT_PUBLIC_API_URL` with the backend's actual port**

Read `.env.local` in the frontend repo root. If the port in `NEXT_PUBLIC_API_URL` doesn't match the port the backend actually bound to in Step 1, edit `.env.local` so it does, e.g.:

```
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

- [ ] **Step 4: Start the frontend dev server in the background**

Run in a background shell, cwd `F:\Progect\2025\shop_bogdan\frontend` (this repo):

```bash
npm run dev
```

Confirm it binds to `http://localhost:3000` with no startup errors.

- [ ] **Step 5: Verify chrome-devtools MCP tools are loaded**

Call `ToolSearch` with query `chrome-devtools` (or `navigate resize screenshot`). Confirm tools such as navigate/resize/screenshot/evaluate are returned. If the server is still connecting, wait and retry — do not proceed to Task 2 until the tools resolve.

- [ ] **Step 6: Smoke-test the stack end to end**

Using the chrome-devtools MCP navigate tool, open `http://localhost:3000/catalog`. Take a screenshot. Confirm real product cards render (name, price, image) — not an empty state, not an error boundary, not a loading spinner stuck mid-load.

- [ ] **Step 7: Create the findings report template**

Create `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md`:

```markdown
# v2 Visual Bug Audit — Findings

**Date:** 2026-08-10
**Spec:** docs/superpowers/specs/2026-08-10-v2-visual-bug-audit-design.md

Each finding: page, viewport, component/file (if identified), description, likely cause.

## Catalog (/catalog)

### Mobile (375×812)

(none found yet)

### Desktop (1440×900)

(none found yet)

## Product page (/catalog/[slug])

### Mobile (375×812)

(none found yet)

### Desktop (1440×900)

(none found yet)

## Cart → Checkout (/cart, /checkout)

### Mobile (375×812)

(none found yet)

### Desktop (1440×900)

(none found yet)

## Summary

Total findings: 0
```

No commit for this task — it's environment setup with no durable code change (`.env.local` is gitignored; the findings template is scaffolding that Task 5 will finalize and commit).

---

### Task 2: Audit — Catalog page

**Files:**

- Modify: `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md` (Catalog sections)

**Interfaces:**

- Consumes: running servers and working chrome-devtools MCP connection from Task 1.
- Produces: completed Catalog findings (used by Task 5's consolidation, no other task depends on the content).

- [ ] **Step 1: Audit catalog at mobile viewport (375×812)**

Using chrome-devtools MCP: resize the page to 375×812, navigate to `http://localhost:3000/catalog`, take a full-page screenshot. Look specifically for: product cards overlapping or overflowing their grid cell, product titles/prices clipped or wrapping badly, filter/sort controls overflowing the viewport width, category chips wrapping into a broken layout, footer/header overlapping content.

- [ ] **Step 2: Inspect any anomaly found in Step 1**

For each suspicious element, use the DOM/computed-style inspection tool (e.g. evaluate a script that reads `getComputedStyle` on the element, or take a DOM snapshot) to find the actual cause — a hardcoded width, a missing `flex-wrap`, a missing breakpoint override, an image without `object-fit`, etc. Identify the source file: search `src/app/catalog/` and `src/widgets/` for the component rendering that element.

- [ ] **Step 3: Record each finding**

Append each finding to the "Catalog → Mobile (375×812)" section of the findings report with: description, screenshot region/element description, component/file path (if found), likely cause. If nothing is found, leave "(none found yet)" but change it to "No issues found." once the full pass is done.

- [ ] **Step 4: Repeat Steps 1–3 at desktop viewport (1440×900)**

Same catalog page, same anomaly categories (grid layout, overflow, clipping, alignment), recorded under "Catalog → Desktop (1440×900)".

- [ ] **Step 5: Commit the findings update**

```bash
git add docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md
git commit -m "docs(v2): catalog visual audit findings"
```

---

### Task 3: Audit — Product page

**Files:**

- Modify: `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md` (Product page sections)

**Interfaces:**

- Consumes: running servers and chrome-devtools MCP connection from Task 1; a real product slug (grab one from the Task 1 Step 6 catalog screenshot or the `curl` response from Task 1 Step 2).
- Produces: completed Product page findings (used by Task 5's consolidation).

- [ ] **Step 1: Audit product page at mobile viewport (375×812)**

Resize to 375×812, navigate to `http://localhost:3000/catalog/<real-slug>`, take a full-page screenshot. Look specifically for: image gallery/carousel overflow or broken aspect ratio, size/variant selector wrapping or overlapping, price/title overlapping the gallery, add-to-cart button overflowing or overlapped by other elements, description text overflowing its container, related-products slider breaking layout.

- [ ] **Step 2: Inspect any anomaly found in Step 1**

Same method as Task 2 Step 2 — computed styles + DOM snapshot to find the cause, then locate the source file under `src/features/catalog/` (or wherever the product page components live — search for the component that renders the anomalous element).

- [ ] **Step 3: Record each finding**

Append to "Product page → Mobile (375×812)" with description, element, file (if found), likely cause.

- [ ] **Step 4: Repeat Steps 1–3 at desktop viewport (1440×900)**

Same product page, recorded under "Product page → Desktop (1440×900)".

- [ ] **Step 5: Commit the findings update**

```bash
git add docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md
git commit -m "docs(v2): product page visual audit findings"
```

---

### Task 4: Audit — Cart → Checkout flow

**Files:**

- Modify: `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md` (Cart → Checkout sections)

**Interfaces:**

- Consumes: running servers and chrome-devtools MCP connection from Task 1; the same product slug used in Task 3.
- Produces: completed Cart → Checkout findings (used by Task 5's consolidation).

- [ ] **Step 1: Add a product to cart via the real UI flow, mobile viewport**

Resize to 375×812. Navigate to the product page used in Task 3, use the chrome-devtools MCP click tool to select a variant/size (if required) and click "add to cart". Navigate to `http://localhost:3000/cart`, take a screenshot. Look for: cart item row overflow, quantity stepper overlapping price, remove button off-screen, summary/total block breaking layout, sticky checkout button overlapping content.

- [ ] **Step 2: Proceed to checkout, mobile viewport**

From the cart, click through to `http://localhost:3000/checkout`, take a screenshot at each distinct step of the checkout form if it's multi-step. Look for: form fields overflowing, labels overlapping inputs, payment method selector (LiqPay/MonoPay) breaking layout, order summary sidebar collapsing incorrectly, submit button unreachable or overlapped.

- [ ] **Step 3: Inspect any anomaly found in Steps 1–2**

Same method as Task 2 Step 2 — computed styles + DOM snapshot, then locate the source file under `src/features/cart/` or `src/features/checkout/`.

- [ ] **Step 4: Record each finding**

Append to "Cart → Checkout → Mobile (375×812)" with description, element, file (if found), likely cause.

- [ ] **Step 5: Repeat Steps 1–4 at desktop viewport (1440×900)**

Same cart-to-checkout flow, recorded under "Cart → Checkout → Desktop (1440×900)".

- [ ] **Step 6: Commit the findings update**

```bash
git add docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md
git commit -m "docs(v2): cart/checkout visual audit findings"
```

---

### Task 5: Consolidate findings and present to user

**Files:**

- Modify: `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md` (Summary section)

**Interfaces:**

- Consumes: completed Catalog, Product page, and Cart → Checkout sections from Tasks 2–4.
- Produces: final findings report — the input the follow-up fix plan will be written against.

- [ ] **Step 1: Fill in the Summary section**

Count total findings across all sections. Replace "Total findings: 0" with the real count, and add a one-line list of each finding (page, viewport, one-sentence description) so the whole report is skimmable from the bottom.

- [ ] **Step 2: Commit the final report**

```bash
git add docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md
git commit -m "docs(v2): consolidate visual audit findings summary"
```

- [ ] **Step 3: Present the findings to the user**

Show the user the full findings list (or a summary if it's long) and stop. Do not start fixing anything — per the spec's find-all-then-fix workflow, fixes are planned separately once the user has reviewed and confirmed the findings.

---

## Note on scope

This plan intentionally stops at the findings report. Fix tasks aren't included here because their content (which files, which CSS rules, which values) can't be known until the audit finds the actual bugs — writing them now would mean placeholder tasks like "fix the bug found in Task 2," which this format explicitly disallows. Once the user reviews `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md`, a second plan will be written to fix the confirmed findings.
