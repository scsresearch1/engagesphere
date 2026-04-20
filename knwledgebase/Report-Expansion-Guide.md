# EngageSphere — Guide to Expanding a ~150-Page Academic Report

This document is a **master scaffold** for a long-form technical report (project report, dissertation chapter block, or capstone thesis). It does not duplicate every sentence you will write; it gives **chapter targets**, **what to extract from the codebase**, **figures/tables to build**, and **prompts for literature** so you can expand prose, screenshots, and analysis to approximately **150 pages** (assuming standard academic formatting: ~350–400 words/page, figures counted as equivalent pages per institution rules).

**Adjust totals** to your institution’s “page” definition (word count vs sheet with figures).

---

## Part A — Suggested page budget (flexible)

| Block | Chapters | Target pages (indicative) |
|-------|-----------|---------------------------|
| Front matter | Title, abstract, declaration, acknowledgements, TOC, lists of figures/tables | 8–12 |
| Introduction & problem | Motivation, objectives, scope | 12–18 |
| Literature & background | Social learning analytics, Firebase, RBAC, moderation | 22–30 |
| Requirements & methodology | SRS-style, Agile/waterfall note, test strategy | 15–22 |
| System analysis & design | Use cases, ERD, architecture, security threat model | 25–35 |
| Implementation | Stack, modules, RTDB, UI, charts, approval workflow | 28–40 |
| Testing & evaluation | Manual scripts, limitations, UAT questionnaire | 12–18 |
| Deployment & DevOps | Netlify, env vars, rules, seeding | 8–12 |
| Legal, ethics & future work | GDPR-style, passwords in demo, roadmap | 10–14 |
| Conclusion & references | Summary, bibliography, appendices | 10–15 |
| **Total** | | **~150** (tune ±20%) |

---

## Part B — Chapter-by-chapter content inventory

### Chapter 1 — Introduction (expand to ~12–15 pages)

**Write:** Campus need for moderated academic social feeds; problem statement; stakeholders (students, faculty, admins).  
**Pull from repo:** `README` (if any), `Project-Outline.txt`, `Features-by-Category.md`.  
**Figures:** High-level context diagram (institution → platform → users).  
**Tables:** Stakeholder matrix (interest, influence, requirements).

### Chapter 2 — Literature review (~20–25 pages)

**Themes to research and cite (examples — replace with your library sources):**

1. Learning analytics dashboards in higher education.  
2. Social presence & discussion quality in LMS vs standalone social apps.  
3. Role-based access control (RBAC) in web apps.  
4. Firebase: Realtime Database vs Firestore (justify RTDB choice for MVP).  
5. Content moderation workflows and human-in-the-loop approval.  
6. Usability heuristics (Nielsen) applied to dashboard-heavy UIs.  
7. Security: client-side trust boundaries, rule engines, Auth comparison.

**For each theme:** 3–5 pages = definition → prior work → gap → how EngageSphere relates.

### Chapter 3 — Requirements specification (~15–18 pages)

**Functional:** Map each module in `Features-by-Category.md` to numbered requirements (FR-01…).  
**Non-functional:** Performance (bundle size note), security, maintainability, portability.  
**Constraints:** Netlify-only hosting, browser-only MVP, demo passwords.  
**Tables:** Requirements traceability matrix (FR → component file → test case id).

### Chapter 4 — Analysis & modelling (~18–22 pages)

**UML-style (text or tool):** Actors, use case diagram, activity diagrams for: signup+approval, post+notify, admin reject.  
**Data model:** Document `User`, `Post`, `Comment`, `Like`, `NotificationItem` from `src/types.ts`; RTDB tree under `engageApp` from `src/services/rtdbAppTree.ts`.  
**ER-style narrative:** Even for document store, show entity relationships (User 1—* Post, Post 1—* Comment).

### Chapter 5 — System architecture (~15–20 pages)

**Describe:** React 19 + Vite 8 + TypeScript; React Router 7; Context global state; theme provider.  
**Diagrams:** Component hierarchy (App → Provider → Layout → Pages); data flow local vs RTDB.  
**Files to cite:** `App.tsx`, `AppStateContext.tsx`, `firebaseClient.ts`, `PrivateRoute.tsx`, `AuthRoute.tsx`.

### Chapter 6 — Design of subsystems (~20–28 pages)

**Subsystems (one section each, 3–5 pages):**

1. Authentication & session (including pending approval and `appReady`).  
2. Feed & post lifecycle.  
3. Notifications pipeline.  
4. Dashboard analytics pipeline (`useDashboardDerived.ts` + Recharts).  
5. Admin console (approvals + moderation).  
6. Theme & layout system.

**Each section:** purpose → inputs/outputs → key functions → edge cases → screenshots.

### Chapter 7 — Implementation details (~25–35 pages)

**Deep dives:**

- `seed.ts`: synthetic dataset rationale (10 users, 100 posts, hashtag coverage for dashboard).  
- `rtdbWrites.ts`: why granular updates vs full-tree writes.  
- `omitUndefined` and Firebase validation errors.  
- `DashboardPage.tsx` + `dashboard/*` widgets: how filters bind to `filterPosts`.  
- `SignupPage.tsx` vs `SelfServeRole` type.  
- `AdminPage.tsx` approval buttons → context methods.

**Include:** Code listings (appendix or inline, 10–30 lines each, **not** full files), with commentary.

### Chapter 8 — Security & privacy (~12–16 pages)

**Honest analysis:** Passwords in RTDB/local store for demo; open dev rules on `engageApp`; no Firebase Auth yet.  
**Threat model:** STRIDE table (Spoofing, Tampering, …) for current MVP.  
**Mitigation roadmap:** Firebase Auth, hashed credentials, tightened RTDB rules, audit log.

### Chapter 9 — Testing (~12–16 pages)

**Manual test cases:** Login, signup pending, admin approve, post CRUD, like, comment, notification read, RTDB seed, rules publish.  
**Optional:** Checklist table with pass/fail and screenshot ids.  
**Limitations:** No automated E2E in repo; document as future work.

### Chapter 10 — Deployment (~10–14 pages)

**Netlify:** `netlify.toml`, build command, SPA redirect behaviour.  
**Environment:** `env.example`, `VITE_*` variables, never commit service account.  
**Firebase:** Console steps for rules, database URL, seed script command.

### Chapter 11 — Results & discussion (~12–18 pages)

**Qualitative:** UX observations, role separation, dashboard usefulness for “engagement” narrative.  
**Quantitative (light):** Bundle size from `npm run build` output; entity counts from seed; chart interpretation samples.  
**Discussion:** What worked / what would change for production.

### Chapter 12 — Conclusion & future work (~8–12 pages)

Summarize objectives vs delivery; list Phase B (Auth, Firestore option, Storage, rule hardening, automated tests).

### References (~4–8 pages)

30–50 citations if expanded properly (institution-dependent).

### Appendices (~15–25 pages cumulative)

- A: Full route table + component map.  
- B: Glossary (50+ terms: RTDB, Context, RBAC, …).  
- C: Seed data statistics table.  
- D: Firebase rules JSON + explanation.  
- E: Sample `engageApp` JSON fragment (anonymized).  
- F: User questionnaire (Likert) for UAT.  
- G: Risk register.

---

## Part C — Figures and tables checklist (high page yield)

| ID | Type | Topic |
|----|------|--------|
| F1 | Architecture | Browser ↔ Netlify ↔ Firebase RTDB |
| F2 | ER / document map | engageApp children |
| F3 | Sequence | Signup → pending → admin approve → login |
| F4 | Screenshot set | Login, Signup, Dashboard, Feed, Admin, Notifications |
| F5 | Chart export | Export Recharts as PNG for report |
| T1 | Requirements | FR traceability |
| T2 | Test cases | Manual regression |
| T3 | Roles | Permission matrix |

---

## Part D — Weekly writing plan (example for 10 weeks)

1. Chapters 1–2 draft; collect references.  
2. Chapter 3–4 diagrams.  
3. Chapter 5–6 with screenshots.  
4. Chapter 7 implementation + code snippets.  
5. Chapter 8–9 security + testing.  
6. Chapter 10 deployment + reproduce build.  
7. Chapter 11 results + first full read-through.  
8. Conclusion, references, appendices.  
9. Formatting, TOC, figure numbers.  
10. Supervisor review buffer.

---

## Part E — Integrity note

If your institution requires **anti-plagiarism** or **AI-use disclosure**, add a short statement on how tools were used to draft outlines versus implementation code.

---

*This guide is intentionally dense. Expand each bullet into 1–3 pages of prose plus visuals to approach the target length.*
