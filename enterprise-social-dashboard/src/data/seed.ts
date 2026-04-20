import type { AppData, Comment, Like, NotificationItem, Post, User } from "../types";

const DAY_MS = 86400000;
const nowMs = Date.now();

function isoFromMs(ms: number) {
  return new Date(ms).toISOString();
}

/** Deterministic pseudo-random 0..n-1 from index (stable across runs). */
function rnd(i: number, mod: number) {
  return ((i * 9301 + 49297) % 233280) % mod;
}

const TAG_PHRASES = [
  "#AI ethics and guardrails in campus research.",
  "#ProjectReview checkpoint — feedback welcome.",
  "#ClassDiscussion prompts for week 12.",
  "#CampusUpdate shuttle and library hours.",
  "#Research methods memo on sampling bias.",
  "#Lab instrumentation calibration checklist.",
];

const SNIPPETS = [
  "Cross-posting highlights for the analytics dashboard.",
  "Sharing metrics that should move the engagement KPIs.",
  "Thread for moderation examples and edge cases.",
  "Reminder: cite sources when linking datasets.",
  "Optional reading: interpretability vs performance tradeoffs.",
];

function buildUsers(): User[] {
  const joined = (daysAgo: number) => isoFromMs(nowMs - daysAgo * DAY_MS - rnd(daysAgo * 11, 3600) * 1000);
  return [
    {
      id: "u-student-1",
      name: "Priya R",
      email: "student@engage.test",
      password: "password123",
      role: "Student",
      bio: "B.Tech student focused on AI and social computing.",
      profileImage: "https://i.pravatar.cc/100?img=32",
      joinedAt: joined(88),
    },
    {
      id: "u-faculty-1",
      name: "Dr. Hari K",
      email: "faculty@engage.test",
      password: "password123",
      role: "Faculty",
      bio: "Faculty mentor for distributed systems and analytics.",
      profileImage: "https://i.pravatar.cc/100?img=12",
      joinedAt: joined(92),
    },
    {
      id: "u-admin-1",
      name: "Admin Office",
      email: "admin@engage.test",
      password: "password123",
      role: "Admin",
      bio: "Platform governance and moderation team.",
      profileImage: "https://i.pravatar.cc/100?img=5",
      joinedAt: joined(120),
    },
    {
      id: "u-004",
      name: "Amit Verma",
      email: "amit.v@engage.test",
      password: "password123",
      role: "Student",
      bio: "HCI + visualization; running A/B tests on cohort engagement.",
      profileImage: "https://i.pravatar.cc/100?img=15",
      joinedAt: joined(9),
    },
    {
      id: "u-005",
      name: "Sana Khan",
      email: "sana.k@engage.test",
      password: "password123",
      role: "Student",
      bio: "Distributed systems TA; posting weekly recaps.",
      profileImage: "https://i.pravatar.cc/100?img=45",
      joinedAt: joined(11),
    },
    {
      id: "u-006",
      name: "Dr. Lee Chen",
      email: "dr.lee@engage.test",
      password: "password123",
      role: "Faculty",
      bio: "Database internals and streaming analytics.",
      profileImage: "https://i.pravatar.cc/100?img=60",
      joinedAt: joined(45),
    },
    {
      id: "u-007",
      name: "Rohit Mehta",
      email: "rohit.m@engage.test",
      password: "password123",
      role: "Student",
      bio: "Competitive programming + fairness audits.",
      profileImage: "https://i.pravatar.cc/100?img=22",
      joinedAt: joined(3),
    },
    {
      id: "u-008",
      name: "Elena Torres",
      email: "elena.t@engage.test",
      password: "password123",
      role: "Student",
      bio: "Product design studio; prototyping social dashboards.",
      profileImage: "https://i.pravatar.cc/100?img=38",
      joinedAt: joined(8),
    },
    {
      id: "u-009",
      name: "Prof. Nguyen",
      email: "prof.nguyen@engage.test",
      password: "password123",
      role: "Faculty",
      bio: "Machine learning systems and MLOps literacy.",
      profileImage: "https://i.pravatar.cc/100?img=52",
      joinedAt: joined(60),
    },
    {
      id: "u-010",
      name: "Kavya Desai",
      email: "kavya.d@engage.test",
      password: "password123",
      role: "Student",
      bio: "Data journalism club; scraping + ethics.",
      profileImage: "https://i.pravatar.cc/100?img=27",
      joinedAt: joined(6),
    },
  ];
}

const USER_IDS = [
  "u-student-1",
  "u-faculty-1",
  "u-admin-1",
  "u-004",
  "u-005",
  "u-006",
  "u-007",
  "u-008",
  "u-009",
  "u-010",
];

function buildPosts(): Post[] {
  const posts: Post[] = [];
  for (let i = 1; i <= 100; i++) {
    const id = `p-${i}`;
    let userId = USER_IDS[i % USER_IDS.length];
    let daySpread = (i * 17) % 28;
    let intraDay = (i * 7919) % DAY_MS;
    let createdAt = isoFromMs(nowMs - daySpread * DAY_MS - intraDay);
    if (i >= 96 && i <= 100) {
      userId = "u-student-1";
      const day = new Date(nowMs);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (i - 96));
      day.setHours(9, 15, 0, 0);
      createdAt = day.toISOString();
    }
    const tagLine = TAG_PHRASES[i % TAG_PHRASES.length];
    const extra = SNIPPETS[i % SNIPPETS.length];
    const isAdminAnnounce = userId === "u-admin-1" && rnd(i, 3) === 0;
    const content = isAdminAnnounce
      ? `Platform announcement: ${tagLine} ${extra} (ref #${i}).`
      : `${tagLine} ${extra} Post #${i}.`;
    const imageUrl = rnd(i, 5) === 0 ? `https://picsum.photos/seed/engage${i}/640/360` : undefined;
    const updatedAt = rnd(i, 7) === 0 ? isoFromMs(nowMs - rnd(i, 500) * 60 * 1000) : undefined;
    posts.push({ id, userId, content, createdAt, imageUrl, updatedAt });
  }
  return posts;
}

function buildComments(posts: Post[]): Comment[] {
  const comments: Comment[] = [];
  let cid = 1;
  for (const post of posts) {
    const n = 1 + rnd(parseInt(post.id.replace("p-", ""), 10), 4);
    for (let j = 0; j < n; j++) {
      const userId = USER_IDS[(cid + j) % USER_IDS.length];
      const offsetMin = 5 + rnd(cid, 2000);
      const createdAt = isoFromMs(new Date(post.createdAt).getTime() + offsetMin * 60 * 1000);
      comments.push({
        id: `c-${cid}`,
        postId: post.id,
        userId,
        text:
          j % 2 === 0
            ? "Solid point — could we add one chart slice for cohort comparison?"
            : "Agree; linking my notes in the next thread.",
        createdAt,
      });
      cid += 1;
    }
  }
  return comments;
}

function buildLikes(posts: Post[]): Like[] {
  const likes: Like[] = [];
  let lid = 1;
  for (const post of posts) {
    const want = rnd(parseInt(post.id.replace("p-", ""), 10), 12) + 1;
    const used = new Set<string>();
    for (let k = 0; k < want; k++) {
      const userId = USER_IDS[(lid + k * 3) % USER_IDS.length];
      if (userId === post.userId) continue;
      const key = `${post.id}:${userId}`;
      if (used.has(key)) continue;
      used.add(key);
      const createdAt = isoFromMs(new Date(post.createdAt).getTime() + (10 + k * 7) * 60 * 1000);
      likes.push({ id: `l-${lid}`, postId: post.id, userId, createdAt });
      lid += 1;
    }
  }
  return likes;
}

function buildNotifications(posts: Post[], users: User[]): NotificationItem[] {
  const notifications: NotificationItem[] = [];
  let nid = 1;
  const faculty = users.find((u) => u.id === "u-faculty-1")!;
  const student = users.find((u) => u.id === "u-student-1")!;

  for (let i = 0; i < 40; i++) {
    const post = posts[rnd(i * 13, posts.length)];
    const isRead = rnd(i, 3) !== 0;
    const isLike = rnd(i, 2) === 0;
    const sender = users[rnd(i + 2, users.length)];
    const receiverId = post.userId === sender.id ? student.id : post.userId;
    if (receiverId === sender.id) continue;
    notifications.push({
      id: `n-${nid}`,
      receiverUserId: receiverId,
      senderUserId: sender.id,
      type: isLike ? "like" : "comment",
      postId: post.id,
      message: isLike ? `${sender.name} liked your post.` : `${sender.name} commented on your post.`,
      isRead,
      createdAt: isoFromMs(new Date(post.createdAt).getTime() + (30 + i * 17) * 60 * 1000),
    });
    nid += 1;
  }

  notifications.unshift(
    {
      id: "n-unread-1",
      receiverUserId: student.id,
      senderUserId: faculty.id,
      type: "comment",
      postId: "p-1",
      message: `${faculty.name} commented on your post.`,
      isRead: false,
      createdAt: isoFromMs(nowMs - 2 * 60 * 60 * 1000),
    },
    {
      id: "n-unread-2",
      receiverUserId: student.id,
      senderUserId: "u-006",
      type: "like",
      postId: "p-3",
      message: "Dr. Lee Chen liked your post.",
      isRead: false,
      createdAt: isoFromMs(nowMs - 5 * 60 * 60 * 1000),
    }
  );

  return notifications;
}

function buildAppData(): AppData {
  const users = buildUsers();
  const posts = buildPosts();
  const comments = buildComments(posts);
  const likes = buildLikes(posts);
  const notifications = buildNotifications(posts, users);
  return { users, posts, comments, likes, notifications };
}

export const initialData: AppData = buildAppData();
