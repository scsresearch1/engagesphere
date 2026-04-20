# EngageSphere — Features by Category

This document maps product capabilities to **functional categories** as implemented in `enterprise-social-dashboard/`. It is suitable for SRS sections, user manuals, and report feature matrices.

---

## 1. Authentication & session

| Feature | Explanation |
|--------|-------------|
| Email + password login | Validates credentials against stored user records (localStorage or Firebase RTDB under `engageApp/users`). |
| Session persistence | Active user id stored in `localStorage` (`engagesphere-current-user-v1`); restored on reload. |
| Logout | Clears session key and in-memory current user. |
| Forgot password (simulated) | Confirms email exists; message only (no outbound email until Firebase Auth is wired). |
| `appReady` gate | Prevents redirect flash: on RTDB mode, waits for first snapshot before treating session as valid. |
| Pending-account block | Users with `approvalStatus: "pending"` cannot sign in until an Admin approves (see Governance). |
| Demo users disclosure | Login page collapsible “Demo users” lists three seeded accounts (Student, Faculty, Admin) and optional “Copy into form”. |
| Restore demo data | Resets `engageApp` (RTDB) or local bundle to synthetic seed (10 users, 100 posts, comments, likes, notifications). |

---

## 2. Registration & governance

| Feature | Explanation |
|--------|-------------|
| Self-serve signup | Student or Faculty only; **Admin role cannot be self-created**. |
| Pending approval | New accounts are stored with `approvalStatus: "pending"`; no automatic login after signup. |
| Success UX | Signup shows confirmation and routes user to sign in only after admin approval. |
| Admin approve | Removes pending flag (local) or clears `approvalStatus` in RTDB (`rtdbApproveUser`). |
| Admin reject | Deletes pending user record (`rejectPendingUser` / `rtdbDeleteUser`). |
| Directory visibility | Admin console lists all users; pending users show a “Pending approval” chip. |

---

## 3. Routing & layout

| Feature | Explanation |
|--------|-------------|
| Public routes | `/login`, `/signup`, `/forgot-password` wrapped in `AuthRoute` (redirects to dashboard if already logged in). |
| Private shell | Authenticated area uses `AppLayout` (sidebar, stats footer, theme toggle). |
| Role-gated admin | `/admin` nested in `PrivateRoute allowRoles={["Admin"]}`; non-admins redirected to dashboard. |
| Default route | `/` and unknown paths → `/dashboard`. |
| Theme | Light/dark via `ThemeContext` + `data-theme` on `html`; toggle in layout and auth screens. |

---

## 4. Social feed & posts

| Feature | Explanation |
|--------|-------------|
| Feed stream | `FeedPage` lists posts with author, content, optional image, timestamps. |
| Composer | Create posts with text and optional image URL (`PostComposer`). |
| Post card | Likes, comments, edit/delete where permitted (`PostCard`). |
| Post detail | `/post/:postId` deep link for single post with same interactions. |
| Edit / delete | Owner or Admin may edit/delete; cascade delete removes related comments, likes, notifications (local + RTDB). |

---

## 5. Engagement (comments & likes)

| Feature | Explanation |
|--------|-------------|
| Comments | Add threaded-style comments per post; delete rules: author, post owner, or Admin. |
| Likes | Toggle per user per post; duplicate like prevented. |
| Notifications on engagement | Liking or commenting on someone else’s post enqueues a notification for the post owner. |

---

## 6. Notifications

| Feature | Explanation |
|--------|-------------|
| Inbox UI | Filters (All / Unread / Likes / Comments), stat strip, avatars, type icons, mark all read. |
| Unread badge | Sidebar count for current user’s unread notifications. |
| Mark all read | Batch-updates `isRead` for current user’s notifications (RTDB multi-path `update`). |

---

## 7. Profile

| Feature | Explanation |
|--------|-------------|
| View / edit profile | Name, bio, profile image URL; email shown read-only in typical flows. |
| Activity context | Uses global counts derived from posts/comments for the signed-in user. |

---

## 8. Dashboard & analytics (Recharts)

| Feature | Explanation |
|--------|-------------|
| Global search strip | Query text, role filter, sort (latest / popular), date range (all / 7d / 30d). |
| Hero & KPIs | Totals, trends vs prior week, sparkline from last 7 days’ activity (posts + comments + likes by day). |
| KPI cards | Posts today, active users, unread (global + “my” unread). |
| Charts | Bar (posts / comments / likes), line (weekly activity), area (scaled engagement), pie (posts by author role), donut (read vs unread notifications). |
| Timeline | Merged events: posts, comments, notifications (sample), joins; Admin posts surfaced as “announcement” style. |
| Heatmap | Seven-day activity intensity from same daily buckets as charts. |
| Feed preview | Top three posts after dashboard filters applied. |
| Trending tags | Fixed hashtag set (`#AI`, `#ProjectReview`, etc.) filters preview content by substring match in post body. |
| Engaged posts & leaderboard | Top posts by likes+comments; leaderboard scores users by posts, comments, likes received. |
| Profile summary & notification widget | Current user mini-stats and recent notifications. |
| Quick actions | Shortcut-style controls (navigation helpers). |
| Drafts card | Static placeholder rows (not persisted to backend). |
| Firebase status card | Read-only display of `VITE_FIREBASE_*` project id and database URL when configured. |

---

## 9. Administration

| Feature | Explanation |
|--------|-------------|
| Stats row | Users, posts, comments, **pending sign-ups** count. |
| Registration approvals | List pending users with Approve / Reject. |
| User directory | Grid of all users with role pills and post counts. |
| Content moderation | Remove posts and recent comments from lists. |

---

## 10. Data & persistence

| Feature | Explanation |
|--------|-------------|
| Dual backend | **Local mode**: full `AppData` JSON in `localStorage`. **RTDB mode**: when `VITE_FIREBASE_*` is complete, `onValue` on `engageApp` syncs state. |
| Data tree | `engageApp/users`, `posts`, `comments`, `likes`, `notifications` — maps keyed by entity id. |
| Seed script | `npm run seed:rtdb` uses Admin SDK + `FIREBASE_SERVICE_ACCOUNT_PATH` to write `engageApp` from `src/data/seed.ts`. |
| RTDB writes | Granular `set`/`update` for mutations; `omitUndefined` avoids invalid Firebase payloads. |
| Security rules (dev) | `database.rules.json` opens read/write only under `engageApp` (must be published in console). |

---

## 11. Non-functional & quality

| Feature | Explanation |
|--------|-------------|
| TypeScript models | Central `types.ts` aligned with persisted user/post/comment/like/notification shapes. |
| Responsive shell | CSS grid layout with breakpoints for sidebar stacking. |
| Error surfacing | RTDB listener errors shown in layout / dashboard status card. |

---

## 12. Explicit non-features (current build)

- No Firebase **Authentication** yet (passwords remain on user documents for demo — not production-safe).
- No **Firestore** in app path (Realtime Database is the connected backend).
- No **Cloud Storage** upload pipeline (image URLs are external links).
- Draft rows on dashboard are **not** synced to RTDB/local `AppData`.

---

*Last aligned to repository layout: `enterprise-social-dashboard/src`.*
