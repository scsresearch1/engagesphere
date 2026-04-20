import { useMemo } from "react";
import { useAppState } from "../../context/AppStateContext";
import type { NotificationItem } from "../../types";

function startOfLocalDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA");
}

const DAY_MS = 86400000;

function activityByDay(
  data: ReturnType<typeof useAppState>["data"],
  daysBack: number
) {
  const map = new Map<string, number>();
  const today = startOfLocalDay(new Date());
  for (let i = 0; i < daysBack; i++) {
    const t = new Date(today - i * DAY_MS);
    map.set(t.toLocaleDateString("en-CA"), 0);
  }
  const bump = (iso: string) => {
    const k = dayKey(iso);
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
  };
  data.posts.forEach((p) => bump(p.createdAt));
  data.comments.forEach((c) => bump(c.createdAt));
  data.likes.forEach((l) => bump(l.createdAt));
  return Array.from({ length: daysBack }, (_, i) => {
    const t = new Date(today - (daysBack - 1 - i) * DAY_MS);
    const k = t.toLocaleDateString("en-CA");
    return { label: t.toLocaleDateString("en", { weekday: "short" }), key: k, count: map.get(k) ?? 0 };
  });
}

function countInRange(isoList: string[], start: number, end: number) {
  return isoList.filter((iso) => {
    const t = new Date(iso).getTime();
    return t >= start && t < end;
  }).length;
}

function trendPercent(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "+0%";
  const raw = Math.round(((current - previous) / previous) * 100);
  return `${raw >= 0 ? "+" : ""}${raw}%`;
}

export type TimelineEntry = {
  id: string;
  type: "post" | "comment" | "notification" | "join" | "announcement";
  message: string;
  createdAt: string;
};

export type LeaderRow = {
  rank: number;
  userId: string;
  name: string;
  role: string;
  posts: number;
  comments: number;
  score: number;
};

export function useDashboardDerived() {
  const { data, currentUser, likeCount, commentCount, getUserById, getPostById } = useAppState();

  const kpis = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * DAY_MS;
    const twoWeeksAgo = now - 14 * DAY_MS;

    const activeUserIds = new Set([
      ...data.posts.map((p) => p.userId),
      ...data.comments.map((c) => c.userId),
      ...data.likes.map((l) => l.userId),
    ]);

    const activeLast7d = new Set<string>();
    data.posts.forEach((p) => {
      if (new Date(p.createdAt).getTime() >= weekAgo) activeLast7d.add(p.userId);
    });
    data.comments.forEach((c) => {
      if (new Date(c.createdAt).getTime() >= weekAgo) activeLast7d.add(c.userId);
    });
    data.likes.forEach((l) => {
      if (new Date(l.createdAt).getTime() >= weekAgo) activeLast7d.add(l.userId);
    });

    const startToday = startOfLocalDay(new Date());
    const postsToday = data.posts.filter((p) => new Date(p.createdAt).getTime() >= startToday).length;

    const myUnread =
      currentUser == null
        ? 0
        : data.notifications.filter((n) => !n.isRead && n.receiverUserId === currentUser.id).length;

    const postDates = data.posts.map((p) => p.createdAt);
    const cmtDates = data.comments.map((c) => c.createdAt);

    const postsWeek = countInRange(postDates, weekAgo, now);
    const postsPrev = countInRange(postDates, twoWeeksAgo, weekAgo);
    const cmtWeek = countInRange(cmtDates, weekAgo, now);
    const cmtPrev = countInRange(cmtDates, twoWeeksAgo, weekAgo);
    const usersWeek = data.users.filter((u) => new Date(u.joinedAt).getTime() >= weekAgo).length;
    const usersPrev = data.users.filter((u) => {
      const t = new Date(u.joinedAt).getTime();
      return t >= twoWeeksAgo && t < weekAgo;
    }).length;

    const activeWeek = new Set([
      ...data.posts.filter((p) => new Date(p.createdAt).getTime() >= weekAgo).map((p) => p.userId),
      ...data.comments.filter((c) => new Date(c.createdAt).getTime() >= weekAgo).map((c) => c.userId),
      ...data.likes.filter((l) => new Date(l.createdAt).getTime() >= weekAgo).map((l) => l.userId),
    ]).size;
    const activePrev = new Set([
      ...data.posts
        .filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return t >= twoWeeksAgo && t < weekAgo;
        })
        .map((p) => p.userId),
      ...data.comments
        .filter((c) => {
          const t = new Date(c.createdAt).getTime();
          return t >= twoWeeksAgo && t < weekAgo;
        })
        .map((c) => c.userId),
      ...data.likes
        .filter((l) => {
          const t = new Date(l.createdAt).getTime();
          return t >= twoWeeksAgo && t < weekAgo;
        })
        .map((l) => l.userId),
    ]).size;

    const lineWeekly = activityByDay(data, 7);

    return {
      totalPosts: data.posts.length,
      totalComments: data.comments.length,
      totalUsers: data.users.length,
      activeUsers: activeUserIds.size,
      onlineUsers: Math.max(activeLast7d.size, 1),
      postsToday,
      unread: data.notifications.filter((n) => !n.isRead).length,
      myUnread,
      trends: {
        posts: trendPercent(postsWeek, postsPrev),
        comments: trendPercent(cmtWeek, cmtPrev),
        users: trendPercent(usersWeek, usersPrev),
        active: trendPercent(activeWeek, activePrev),
      },
      sparkPosts: lineWeekly.map((d) => ({ name: d.label, v: d.count })),
    };
  }, [currentUser, data]);

  const barTriple = useMemo(
    () => [
      { name: "Posts", value: data.posts.length },
      { name: "Comments", value: data.comments.length },
      { name: "Likes", value: data.likes.length },
    ],
    [data.comments.length, data.likes.length, data.posts.length]
  );

  const lineWeekly = useMemo(() => activityByDay(data, 7), [data]);

  const areaEngagement = useMemo(() => {
    return lineWeekly.map((d) => ({
      name: d.label,
      engagement: d.count * 3 + Math.round(d.count * 0.5),
    }));
  }, [lineWeekly]);

  const rolePie = useMemo(() => {
    const roles = { Student: 0, Faculty: 0, Admin: 0 };
    data.posts.forEach((post) => {
      const r = getUserById(post.userId)?.role;
      if (r) roles[r] += 1;
    });
    return [
      { name: "Student", value: roles.Student },
      { name: "Faculty", value: roles.Faculty },
      { name: "Admin", value: roles.Admin },
    ].filter((x) => x.value > 0);
  }, [data.posts, getUserById]);

  const notificationDonut = useMemo(() => {
    const read = data.notifications.filter((n) => n.isRead).length;
    const unread = data.notifications.filter((n) => !n.isRead).length;
    return [
      { name: "Read", value: read },
      { name: "Unread", value: unread },
    ];
  }, [data.notifications]);

  const timeline = useMemo((): TimelineEntry[] => {
    const items: TimelineEntry[] = [];
    data.posts.forEach((p) => {
      const u = getUserById(p.userId);
      const isAnnounce = u?.role === "Admin";
      items.push({
        id: `p-${p.id}`,
        type: isAnnounce ? "announcement" : "post",
        message: isAnnounce
          ? `${u?.name ?? "Admin"} updated announcement: ${p.content.slice(0, 48)}${p.content.length > 48 ? "..." : ""}`
          : `${u?.name ?? "User"} posted an update`,
        createdAt: p.createdAt,
      });
    });
    data.comments.forEach((c) => {
      const u = getUserById(c.userId);
      const post = getPostById(c.postId);
      const owner = post ? getUserById(post.userId) : undefined;
      items.push({
        id: `c-${c.id}`,
        type: "comment",
        message: `${u?.name ?? "Someone"} commented${owner ? ` on ${owner.name}'s post` : ""}`,
        createdAt: c.createdAt,
      });
    });
    data.notifications.slice(0, 10).forEach((n: NotificationItem) => {
      items.push({
        id: `n-${n.id}`,
        type: "notification",
        message: n.message,
        createdAt: n.createdAt,
      });
    });
    data.users.forEach((u) => {
      items.push({
        id: `j-${u.id}`,
        type: "join",
        message: `${u.name} joined the platform`,
        createdAt: u.joinedAt,
      });
    });
    return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 12);
  }, [data, getPostById, getUserById]);

  const leaderboard = useMemo((): LeaderRow[] => {
    const scores = data.users.map((user) => {
      const posts = data.posts.filter((p) => p.userId === user.id).length;
      const comments = data.comments.filter((c) => c.userId === user.id).length;
      const ownPostIds = new Set(data.posts.filter((p) => p.userId === user.id).map((p) => p.id));
      const likesReceived = data.likes.filter((l) => ownPostIds.has(l.postId)).length;
      const score = posts * 5 + comments * 2 + likesReceived;
      return { userId: user.id, name: user.name, role: user.role, posts, comments, score };
    });
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((row, i) => ({ ...row, rank: i + 1 }));
  }, [data]);

  const topEngaged = useMemo(() => {
    return [...data.posts]
      .map((post) => ({
        post,
        score: likeCount(post.id) + commentCount(post.id),
        author: getUserById(post.userId),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [commentCount, data.posts, getUserById, likeCount]);

  const latestPosts = useMemo(() => {
    return [...data.posts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 3);
  }, [data.posts]);

  const recentNotifications = useMemo(() => {
    if (!currentUser) return [];
    return data.notifications
      .filter((n) => n.receiverUserId === currentUser.id)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 3);
  }, [currentUser, data.notifications]);

  const userEngagementScore = useMemo(() => {
    if (!currentUser) return 0;
    const posts = data.posts.filter((p) => p.userId === currentUser.id).length;
    const comments = data.comments.filter((c) => c.userId === currentUser.id).length;
    const ownIds = new Set(data.posts.filter((p) => p.userId === currentUser.id).map((p) => p.id));
    const likesRx = data.likes.filter((l) => ownIds.has(l.postId)).length;
    return posts * 5 + comments * 2 + likesRx + data.likes.filter((l) => l.userId === currentUser.id).length;
  }, [currentUser, data]);

  const streakDays = useMemo(() => {
    if (!currentUser) return 0;
    const days = new Set(
      data.posts
        .filter((p) => p.userId === currentUser.id)
        .map((p) => new Date(p.createdAt).toLocaleDateString("en-CA"))
    );
    let streak = 0;
    const t = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(t);
      d.setDate(d.getDate() - i);
      const k = d.toLocaleDateString("en-CA");
      if (days.has(k)) streak += 1;
      else if (i > 0) break;
    }
    return streak;
  }, [currentUser, data.posts]);

  const heatWeek = useMemo(() => {
    return activityByDay(data, 7).map((d) => ({
      label: d.label,
      count: d.count,
      intensity: Math.min(4, d.count),
    }));
  }, [data]);

  return {
    kpis,
    barTriple,
    lineWeekly,
    areaEngagement,
    rolePie,
    notificationDonut,
    timeline,
    leaderboard,
    topEngaged,
    latestPosts,
    recentNotifications,
    userEngagementScore,
    streakDays,
    heatWeek,
  };
}
