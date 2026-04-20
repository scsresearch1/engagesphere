import { useMemo, useState } from "react";
import { getFirebaseWebDisplayInfo } from "../lib/firebaseClient";
import { useAppState } from "../context/AppStateContext";
import type { Post, Role } from "../types";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { DashboardDrafts, type DraftRow } from "./dashboard/DashboardDrafts";
import { DashboardEngagedPosts } from "./dashboard/DashboardEngagedPosts";
import { DashboardFeedPreview } from "./dashboard/DashboardFeedPreview";
import { DashboardGlobalSearch } from "./dashboard/DashboardGlobalSearch";
import { DashboardHeatmap } from "./dashboard/DashboardHeatmap";
import { DashboardHero } from "./dashboard/DashboardHero";
import { DashboardKpiCards } from "./dashboard/DashboardKpiCards";
import { DashboardLeaderboard } from "./dashboard/DashboardLeaderboard";
import { DashboardNotificationWidget } from "./dashboard/DashboardNotificationWidget";
import { DashboardProfileSummary } from "./dashboard/DashboardProfileSummary";
import { DashboardQuickActions } from "./dashboard/DashboardQuickActions";
import { DashboardTimeline } from "./dashboard/DashboardTimeline";
import { DashboardTrendingTags } from "./dashboard/DashboardTrendingTags";
import { useDashboardDerived } from "./dashboard/useDashboardDerived";
import "./dashboard/dashboard.css";

const initialDrafts: DraftRow[] = [
  {
    id: "dr-1",
    title: "Draft: Literature review outline",
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "dr-2",
    title: "Scheduled: Week 12 recap (simulated)",
    updatedAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
];

function DashboardFirebaseStatus() {
  const { backend, rtdbError } = useAppState();
  const { projectId, databaseURL: databaseUrl } = getFirebaseWebDisplayInfo();
  return (
    <div className="dash-card dash-firebase-card">
      <div className="dash-card-head">
        <h3>Firebase backend</h3>
        <p className="dash-muted">
          {backend === "rtdb"
            ? "App state syncs to Realtime Database under the engageApp node."
            : "Fill in Firebase Web values in src/config/firebaseWeb.ts (from the Firebase Console), or set VITE_FIREBASE_* in .env.local for local overrides."}
        </p>
      </div>
      <label className="dash-label">
        Project ID
        <input readOnly value={projectId} />
      </label>
      <label className="dash-label">
        Database URL
        <input readOnly value={databaseUrl} />
      </label>
      {rtdbError ? <p className="error-text" style={{ marginTop: "0.5rem" }}>{rtdbError}</p> : null}
    </div>
  );
}

export function DashboardPage() {
  const { data, currentUser, getUserById, likeCount, commentCount } = useAppState();
  const derived = useDashboardDerived();

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [sortPreview, setSortPreview] = useState<"latest" | "popular">("latest");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d">("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [drafts] = useState<DraftRow[]>(initialDrafts);

  const filterPosts = useMemo(() => {
    return (list: Post[]) => {
      let out = [...list];
      const q = query.trim().toLowerCase();
      if (q) {
        out = out.filter((p) => {
          const author = getUserById(p.userId);
          return (
            p.content.toLowerCase().includes(q) ||
            (author?.name.toLowerCase().includes(q) ?? false)
          );
        });
      }
      if (roleFilter !== "all") {
        out = out.filter((p) => getUserById(p.userId)?.role === roleFilter);
      }
      if (selectedTag) {
        const needle = selectedTag.toLowerCase();
        out = out.filter((p) => p.content.toLowerCase().includes(needle));
      }
      if (dateRange !== "all") {
        const days = dateRange === "7d" ? 7 : 30;
        const cutoff = Date.now() - days * 86400000;
        out = out.filter((p) => new Date(p.createdAt).getTime() >= cutoff);
      }
      if (sortPreview === "popular") {
        out.sort(
          (a, b) =>
            likeCount(b.id) + commentCount(b.id) - (likeCount(a.id) + commentCount(a.id))
        );
      } else {
        out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      }
      return out;
    };
  }, [commentCount, dateRange, getUserById, likeCount, query, roleFilter, selectedTag, sortPreview]);

  const previewPosts = useMemo(
    () => filterPosts(data.posts).slice(0, 3),
    [data.posts, filterPosts]
  );

  const filteredTopEngaged = useMemo(() => {
    const scored = filterPosts(data.posts).map((post) => ({
      post,
      score: likeCount(post.id) + commentCount(post.id),
      author: getUserById(post.userId),
    }));
    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [commentCount, data.posts, filterPosts, getUserById, likeCount]);

  const myPosts = currentUser
    ? data.posts.filter((p) => p.userId === currentUser.id).length
    : 0;
  const myComments = currentUser
    ? data.comments.filter((c) => c.userId === currentUser.id).length
    : 0;

  if (!currentUser) return null;

  return (
    <div className="dash-page">
      <DashboardGlobalSearch
        query={query}
        onQuery={setQuery}
        roleFilter={roleFilter}
        onRole={setRoleFilter}
        sort={sortPreview}
        onSort={setSortPreview}
        dateRange={dateRange}
        onDateRange={setDateRange}
      />

      <div className="dash-row-hero">
        <DashboardHero
          currentUser={currentUser}
          onlineUsers={derived.kpis.onlineUsers}
          postsToday={derived.kpis.postsToday}
          myUnread={derived.kpis.myUnread}
          engagementScore={derived.userEngagementScore}
          streakDays={derived.streakDays}
        />
        <DashboardProfileSummary
          user={currentUser}
          posts={myPosts}
          comments={myComments}
          score={derived.userEngagementScore}
        />
        <DashboardNotificationWidget
          items={derived.recentNotifications}
          unreadCount={derived.kpis.myUnread}
        />
      </div>

      <DashboardQuickActions />
      <DashboardKpiCards kpis={derived.kpis} />

      <DashboardCharts
        barTriple={derived.barTriple}
        lineWeekly={derived.lineWeekly}
        areaEngagement={derived.areaEngagement}
        rolePie={derived.rolePie}
        notificationDonut={derived.notificationDonut}
      />

      <div className="dash-row-split">
        <DashboardTimeline items={derived.timeline} />
        <DashboardHeatmap days={derived.heatWeek} />
      </div>

      <div className="dash-row-split">
        <DashboardFeedPreview
          posts={previewPosts}
          getUserById={getUserById}
          likeCount={likeCount}
          commentCount={commentCount}
        />
        <DashboardTrendingTags selected={selectedTag} onSelect={setSelectedTag} />
      </div>

      <div className="dash-row-split">
        <DashboardEngagedPosts rows={filteredTopEngaged} />
        <DashboardLeaderboard rows={derived.leaderboard} />
      </div>

      <div className="dash-row-split">
        <DashboardDrafts drafts={drafts} />
        <DashboardFirebaseStatus />
      </div>
    </div>
  );
}
