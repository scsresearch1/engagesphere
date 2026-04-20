import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onValue, ref, update } from "firebase/database";
import { initialData } from "../data/seed";
import { getFirebaseDatabase, isFirebaseRtdbConfigured } from "../lib/firebaseClient";
import { RTDB_APP_ROOT, appDataToTree, treeToAppData } from "../services/rtdbAppTree";
import {
  rtdbApproveUser,
  rtdbDeleteComment,
  rtdbDeleteLike,
  rtdbDeletePostCascade,
  rtdbDeleteUser,
  rtdbEmailTaken,
  rtdbFindUserByEmail,
  rtdbSetFullTree,
  rtdbUpdatePostFields,
  rtdbWriteComment,
  rtdbWriteCommentAndNotification,
  rtdbWriteLike,
  rtdbWriteLikeAndNotification,
  rtdbWritePost,
  rtdbWriteUser,
} from "../services/rtdbWrites";
import type { AppData, Comment, NotificationItem, Post, SelfServeRole, User } from "../types";

type AppStateContextType = {
  data: AppData;
  currentUser: User | null;
  unreadCount: number;
  /** False until first RTDB snapshot (or immediately in local mode). Used to avoid login redirect flash. */
  appReady: boolean;
  backend: "local" | "rtdb";
  rtdbError: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: SelfServeRole;
  }) => Promise<{ ok: boolean; message: string; pending?: boolean }>;
  /** Admin only: approve a Student/Faculty signup so they can sign in. */
  approvePendingUser: (userId: string) => void;
  /** Admin only: reject a pending signup (removes the user record). */
  rejectPendingUser: (userId: string) => void;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ ok: boolean; message: string }>;
  updateProfile: (payload: { name: string; bio: string; profileImage: string }) => void;
  createPost: (payload: { content: string; imageUrl?: string }) => void;
  updatePost: (postId: string, payload: { content: string; imageUrl?: string }) => void;
  deletePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  deleteComment: (commentId: string) => void;
  toggleLike: (postId: string) => void;
  markAllNotificationsRead: () => void;
  getUserById: (userId: string) => User | undefined;
  getPostById: (postId: string) => Post | undefined;
  getCommentsByPostId: (postId: string) => Comment[];
  likeCount: (postId: string) => number;
  commentCount: (postId: string) => number;
  isLikedByCurrentUser: (postId: string) => boolean;
  /** Restore bundled demo data. Local: immediate. RTDB: overwrites remote `engageApp` tree. */
  resetDemoToSeed: () => Promise<void>;
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const STORAGE_KEY = "engagesphere-static-state-v1";
const SESSION_KEY = "engagesphere-current-user-v1";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function pushNotification(
  notifications: NotificationItem[],
  receiverUserId: string,
  senderUserId: string,
  type: "like" | "comment",
  postId: string,
  message: string
) {
  notifications.unshift({
    id: makeId("n"),
    receiverUserId,
    senderUserId,
    type,
    postId,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
}

function emptyAppData(): AppData {
  return { users: [], posts: [], comments: [], likes: [], notifications: [] };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const useRtdb = isFirebaseRtdbConfigured();

  const [data, setData] = useState<AppData>(() => {
    if (useRtdb) return emptyAppData();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return treeToAppData(appDataToTree(initialData));
    try {
      const parsed = JSON.parse(raw) as AppData;
      return treeToAppData(appDataToTree(parsed));
    } catch {
      return treeToAppData(appDataToTree(initialData));
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));

  const [appReady, setAppReady] = useState(!useRtdb);
  const [rtdbError, setRtdbError] = useState<string | null>(null);

  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    if (!useRtdb) {
      setAppReady(true);
      return;
    }
    const database = getFirebaseDatabase();
    if (!database) {
      setAppReady(true);
      return;
    }
    const r = ref(database, RTDB_APP_ROOT);
    const unsub = onValue(
      r,
      (snap) => {
        setData(treeToAppData(snap.val()));
        setRtdbError(null);
        setAppReady(true);
      },
      (err) => {
        setRtdbError(err.message);
        setAppReady(true);
      }
    );
    return () => unsub();
  }, [useRtdb]);

  const currentUser = useMemo(
    () => data.users.find((user) => user.id === currentUserId) ?? null,
    [data.users, currentUserId]
  );

  useEffect(() => {
    if (!appReady || !currentUserId) return;
    const row = data.users.find((u) => u.id === currentUserId);
    if (!row || row.approvalStatus === "pending") {
      setCurrentUserId(null);
      localStorage.removeItem(SESSION_KEY);
    }
  }, [appReady, data.users, currentUserId]);

  /** Same canonical shape as RTDB seed writes: strip undefined optional fields on every entity. */
  const persistLocal = (next: AppData) => {
    const canonical = treeToAppData(appDataToTree(next));
    setData(canonical);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
  };

  const login = useCallback(
    async (email: string, password: string) => {
      const trimmed = email.trim();
      if (useRtdb) {
        const db = getFirebaseDatabase();
        if (!db) return { ok: false, message: "Firebase Realtime Database is not configured." };
        try {
          const user = await rtdbFindUserByEmail(db, trimmed);
          if (!user || user.password !== password) {
            return {
              ok: false,
              message: "Invalid credentials.",
            };
          }
          if (user.approvalStatus === "pending") {
            return {
              ok: false,
              message:
                "This account is waiting for administrator approval. You cannot sign in until an Admin approves your registration.",
            };
          }
          setCurrentUserId(user.id);
          localStorage.setItem(SESSION_KEY, user.id);
          return { ok: true, message: "Login successful." };
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Network error.";
          return { ok: false, message: msg };
        }
      }
      const user = dataRef.current.users.find((item) => item.email === trimmed && item.password === password);
      if (!user) return { ok: false, message: "Invalid credentials." };
      if (user.approvalStatus === "pending") {
        return {
          ok: false,
          message:
            "This account is waiting for administrator approval. You cannot sign in until an Admin approves your registration.",
        };
      }
      setCurrentUserId(user.id);
      localStorage.setItem(SESSION_KEY, user.id);
      return { ok: true, message: "Login successful." };
    },
    [useRtdb]
  );

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; role: SelfServeRole }) => {
      const email = payload.email.trim();
      if (useRtdb) {
        const db = getFirebaseDatabase();
        if (!db) return { ok: false, message: "Firebase Realtime Database is not configured." };
        try {
          if (await rtdbEmailTaken(db, email)) {
            return { ok: false, message: "Email already exists." };
          }
          const user: User = {
            id: makeId("u"),
            name: payload.name.trim(),
            email,
            password: payload.password,
            role: payload.role,
            bio: "New user profile. Update your bio from profile page.",
            profileImage: "https://i.pravatar.cc/100",
            joinedAt: new Date().toISOString(),
            approvalStatus: "pending",
          };
          await rtdbWriteUser(db, user);
          return {
            ok: true,
            pending: true,
            message:
              "Your account was created and is pending administrator approval. You can sign in after an Admin approves it.",
          };
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Could not register.";
          return { ok: false, message: msg };
        }
      }
      const d = dataRef.current;
      if (d.users.some((item) => item.email === email)) {
        return { ok: false, message: "Email already exists." };
      }
      const user: User = {
        id: makeId("u"),
        name: payload.name.trim(),
        email,
        password: payload.password,
        role: payload.role,
        bio: "New user profile. Update your bio from profile page.",
        profileImage: "https://i.pravatar.cc/100",
        joinedAt: new Date().toISOString(),
        approvalStatus: "pending",
      };
      persistLocal({ ...d, users: [user, ...d.users] });
      return {
        ok: true,
        pending: true,
        message:
          "Your account was created and is pending administrator approval. You can sign in after an Admin approves it.",
      };
    },
    [useRtdb]
  );

  const approvePendingUser = useCallback(
    (userId: string) => {
      const admin = dataRef.current.users.find((u) => u.id === currentUserId);
      if (!admin || admin.role !== "Admin") return;
      const target = dataRef.current.users.find((u) => u.id === userId);
      if (!target || target.approvalStatus !== "pending") return;
      if (useRtdb) {
        const db = getFirebaseDatabase();
        if (!db) return;
        void rtdbApproveUser(db, userId).catch((e) =>
          setRtdbError(e instanceof Error ? e.message : "Approve user failed.")
        );
        return;
      }
      const d = dataRef.current;
      persistLocal({
        ...d,
        users: d.users.map((u) => {
          if (u.id !== userId) return u;
          const { approvalStatus: _pending, ...approved } = u;
          return approved as User;
        }),
      });
    },
    [useRtdb, currentUserId]
  );

  const rejectPendingUser = useCallback(
    (userId: string) => {
      const admin = dataRef.current.users.find((u) => u.id === currentUserId);
      if (!admin || admin.role !== "Admin") return;
      const target = dataRef.current.users.find((u) => u.id === userId);
      if (!target || target.approvalStatus !== "pending") return;
      if (useRtdb) {
        const db = getFirebaseDatabase();
        if (!db) return;
        void rtdbDeleteUser(db, userId).catch((e) =>
          setRtdbError(e instanceof Error ? e.message : "Reject user failed.")
        );
        return;
      }
      const d = dataRef.current;
      persistLocal({
        ...d,
        users: d.users.filter((u) => u.id !== userId),
      });
    },
    [useRtdb, currentUserId]
  );

  const logout = useCallback(() => {
    setCurrentUserId(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const resetDemoToSeed = useCallback(async () => {
    const fresh = JSON.parse(JSON.stringify(initialData)) as AppData;
    if (useRtdb) {
      const db = getFirebaseDatabase();
      if (db) {
        try {
          await rtdbSetFullTree(db, fresh);
        } catch (e) {
          setRtdbError(e instanceof Error ? e.message : "Reset failed.");
        }
      }
    } else {
      persistLocal(fresh);
    }
    setCurrentUserId(null);
    localStorage.removeItem(SESSION_KEY);
  }, [useRtdb]);

  const resetPassword = useCallback(
    async (email: string) => {
      const trimmed = email.trim();
      if (useRtdb) {
        const db = getFirebaseDatabase();
        if (!db) return { ok: false, message: "Firebase not configured." };
        try {
          const exists = (await rtdbFindUserByEmail(db, trimmed)) !== null;
          if (!exists) return { ok: false, message: "No account found for this email." };
          return { ok: true, message: "Password reset link simulated successfully." };
        } catch (e) {
          return { ok: false, message: e instanceof Error ? e.message : "Request failed." };
        }
      }
      const exists = dataRef.current.users.some((item) => item.email === trimmed);
      if (!exists) return { ok: false, message: "No account found for this email." };
      return { ok: true, message: "Password reset link simulated successfully." };
    },
    [useRtdb]
  );

  const updateProfile: AppStateContextType["updateProfile"] = ({ name, bio, profileImage }) => {
    if (!currentUser) return;
    if (useRtdb) {
      const db = getFirebaseDatabase();
      if (!db) return;
      void update(ref(db), {
        [`${RTDB_APP_ROOT}/users/${currentUser.id}/name`]: name,
        [`${RTDB_APP_ROOT}/users/${currentUser.id}/bio`]: bio,
        [`${RTDB_APP_ROOT}/users/${currentUser.id}/profileImage`]: profileImage,
      }).catch((e) => setRtdbError(e instanceof Error ? e.message : "Profile update failed."));
      return;
    }
    const d = dataRef.current;
    persistLocal({
      ...d,
      users: d.users.map((user) =>
        user.id === currentUser.id ? { ...user, name, bio, profileImage } : user
      ),
    });
  };

  const createPost: AppStateContextType["createPost"] = ({ content, imageUrl }) => {
    if (!currentUser) return;
    const post: Post = {
      id: makeId("p"),
      userId: currentUser.id,
      content,
      imageUrl,
      createdAt: new Date().toISOString(),
    };
    if (useRtdb) {
      const db = getFirebaseDatabase();
      if (!db) return;
      void rtdbWritePost(db, post).catch((e) => setRtdbError(e instanceof Error ? e.message : "Post failed."));
      return;
    }
    persistLocal({ ...dataRef.current, posts: [post, ...dataRef.current.posts] });
  };

  const updatePost: AppStateContextType["updatePost"] = (postId, payload) => {
    if (!currentUser) return;
    const d = dataRef.current;
    const target = d.posts.find((post) => post.id === postId);
    if (!target) return;
    const canEdit = target.userId === currentUser.id || currentUser.role === "Admin";
    if (!canEdit) return;
    if (useRtdb) {
      const db = getFirebaseDatabase();
      if (!db) return;
      void rtdbUpdatePostFields(db, postId, {
        content: payload.content,
        imageUrl: payload.imageUrl,
        updatedAt: new Date().toISOString(),
      }).catch((e) => setRtdbError(e instanceof Error ? e.message : "Update failed."));
      return;
    }
    persistLocal({
      ...d,
      posts: d.posts.map((post) =>
        post.id === postId
          ? { ...post, content: payload.content, imageUrl: payload.imageUrl, updatedAt: new Date().toISOString() }
          : post
      ),
    });
  };

  const deletePost: AppStateContextType["deletePost"] = (postId) => {
    if (!currentUser) return;
    const d = dataRef.current;
    const target = d.posts.find((post) => post.id === postId);
    if (!target) return;
    const canDelete = target.userId === currentUser.id || currentUser.role === "Admin";
    if (!canDelete) return;
    if (useRtdb) {
      const db = getFirebaseDatabase();
      if (!db) return;
      const commentIds = d.comments.filter((c) => c.postId === postId).map((c) => c.id);
      const likeIds = d.likes.filter((l) => l.postId === postId).map((l) => l.id);
      const notificationIds = d.notifications.filter((n) => n.postId === postId).map((n) => n.id);
      void rtdbDeletePostCascade(db, postId, commentIds, likeIds, notificationIds).catch((e) =>
        setRtdbError(e instanceof Error ? e.message : "Delete failed.")
      );
      return;
    }
    persistLocal({
      ...d,
      posts: d.posts.filter((post) => post.id !== postId),
      comments: d.comments.filter((comment) => comment.postId !== postId),
      likes: d.likes.filter((like) => like.postId !== postId),
      notifications: d.notifications.filter((notice) => notice.postId !== postId),
    });
  };

  const addComment: AppStateContextType["addComment"] = (postId, text) => {
    if (!currentUser) return;
    const d = dataRef.current;
    const post = d.posts.find((item) => item.id === postId);
    if (!post) return;
    const comment: Comment = {
      id: makeId("c"),
      postId,
      userId: currentUser.id,
      text,
      createdAt: new Date().toISOString(),
    };
    if (useRtdb) {
      const db = getFirebaseDatabase();
      if (!db) return;
      if (post.userId !== currentUser.id) {
        const notification: NotificationItem = {
          id: makeId("n"),
          receiverUserId: post.userId,
          senderUserId: currentUser.id,
          type: "comment",
          postId,
          message: `${currentUser.name} commented on your post.`,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        void rtdbWriteCommentAndNotification(db, comment, notification).catch((e) =>
          setRtdbError(e instanceof Error ? e.message : "Comment failed.")
        );
      } else {
        void rtdbWriteComment(db, comment).catch((e) =>
          setRtdbError(e instanceof Error ? e.message : "Comment failed.")
        );
      }
      return;
    }
    const notifications = [...d.notifications];
    if (post.userId !== currentUser.id) {
      pushNotification(notifications, post.userId, currentUser.id, "comment", postId, `${currentUser.name} commented on your post.`);
    }
    persistLocal({ ...d, comments: [...d.comments, comment], notifications });
  };

  const deleteComment: AppStateContextType["deleteComment"] = (commentId) => {
    if (!currentUser) return;
    const d = dataRef.current;
    const target = d.comments.find((item) => item.id === commentId);
    if (!target) return;
    const post = d.posts.find((item) => item.id === target.postId);
    const canDelete =
      target.userId === currentUser.id || currentUser.role === "Admin" || post?.userId === currentUser.id;
    if (!canDelete) return;
    if (useRtdb) {
      const db = getFirebaseDatabase();
      if (!db) return;
      void rtdbDeleteComment(db, commentId).catch((e) =>
        setRtdbError(e instanceof Error ? e.message : "Delete comment failed.")
      );
      return;
    }
    persistLocal({ ...d, comments: d.comments.filter((item) => item.id !== commentId) });
  };

  const toggleLike: AppStateContextType["toggleLike"] = (postId) => {
    if (!currentUser) return;
    const d = dataRef.current;
    const existing = d.likes.find((like) => like.postId === postId && like.userId === currentUser.id);
    const post = d.posts.find((item) => item.id === postId);
    if (!post) return;
    if (useRtdb) {
      const db = getFirebaseDatabase();
      if (!db) return;
      if (existing) {
        void rtdbDeleteLike(db, existing.id).catch((e) =>
          setRtdbError(e instanceof Error ? e.message : "Unlike failed.")
        );
        return;
      }
      const like = {
        id: makeId("l"),
        postId,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      if (post.userId !== currentUser.id) {
        const notification: NotificationItem = {
          id: makeId("n"),
          receiverUserId: post.userId,
          senderUserId: currentUser.id,
          type: "like",
          postId,
          message: `${currentUser.name} liked your post.`,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        void rtdbWriteLikeAndNotification(db, like, notification).catch((e) =>
          setRtdbError(e instanceof Error ? e.message : "Like failed.")
        );
      } else {
        void rtdbWriteLike(db, like).catch((e) => setRtdbError(e instanceof Error ? e.message : "Like failed."));
      }
      return;
    }
    if (existing) {
      persistLocal({ ...d, likes: d.likes.filter((like) => like.id !== existing.id) });
      return;
    }
    const like = {
      id: makeId("l"),
      postId,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    const notifications = [...d.notifications];
    if (post.userId !== currentUser.id) {
      pushNotification(notifications, post.userId, currentUser.id, "like", postId, `${currentUser.name} liked your post.`);
    }
    persistLocal({ ...d, likes: [...d.likes, like], notifications });
  };

  const markAllNotificationsRead: AppStateContextType["markAllNotificationsRead"] = () => {
    if (!currentUser) return;
    const d = dataRef.current;
    if (useRtdb) {
      const db = getFirebaseDatabase();
      if (!db) return;
      const patch: Record<string, boolean> = {};
      for (const item of d.notifications) {
        if (item.receiverUserId === currentUser.id && !item.isRead) {
          patch[`${RTDB_APP_ROOT}/notifications/${item.id}/isRead`] = true;
        }
      }
      if (Object.keys(patch).length === 0) return;
      void update(ref(db), patch).catch((e) =>
        setRtdbError(e instanceof Error ? e.message : "Notifications update failed.")
      );
      return;
    }
    persistLocal({
      ...d,
      notifications: d.notifications.map((item) =>
        item.receiverUserId === currentUser.id ? { ...item, isRead: true } : item
      ),
    });
  };

  const getUserById = (userId: string) => data.users.find((user) => user.id === userId);
  const getPostById = (postId: string) => data.posts.find((post) => post.id === postId);
  const getCommentsByPostId = (postId: string) =>
    data.comments
      .filter((item) => item.postId === postId)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const likeCount = (postId: string) => data.likes.filter((item) => item.postId === postId).length;
  const commentCount = (postId: string) => data.comments.filter((item) => item.postId === postId).length;
  const isLikedByCurrentUser = (postId: string) =>
    !!currentUser && data.likes.some((item) => item.postId === postId && item.userId === currentUser.id);

  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return data.notifications.filter((item) => item.receiverUserId === currentUser.id && !item.isRead).length;
  }, [data.notifications, currentUser]);

  return (
    <AppStateContext.Provider
      value={{
        data,
        currentUser,
        unreadCount,
        appReady,
        backend: useRtdb ? "rtdb" : "local",
        rtdbError,
        login,
        register,
        approvePendingUser,
        rejectPendingUser,
        logout,
        resetPassword,
        updateProfile,
        createPost,
        updatePost,
        deletePost,
        addComment,
        deleteComment,
        toggleLike,
        markAllNotificationsRead,
        getUserById,
        getPostById,
        getCommentsByPostId,
        likeCount,
        commentCount,
        isLikedByCurrentUser,
        resetDemoToSeed,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
