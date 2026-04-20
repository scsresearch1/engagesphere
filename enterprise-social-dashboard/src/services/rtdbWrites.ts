import { get, ref, set, update } from "firebase/database";
import type { Database } from "firebase/database";
import { RTDB_APP_ROOT, appDataToTree, omitUndefined } from "./rtdbAppTree";
import type { AppData, Comment, Like, NotificationItem, Post, User } from "../types";

const root = () => RTDB_APP_ROOT;

/** Same shape as seed / appDataToTree: Firebase rejects undefined property values. */
function recordForRtdb<T extends object>(row: T): Record<string, unknown> {
  return omitUndefined({ ...row } as Record<string, unknown>);
}

export async function rtdbSetFullTree(db: Database, data: AppData): Promise<void> {
  await set(ref(db, root()), appDataToTree(data));
}

export async function rtdbFindUserByEmail(db: Database, email: string): Promise<User | null> {
  const snap = await get(ref(db, `${root()}/users`));
  const val = snap.val() as Record<string, Omit<User, "id"> & { id?: string }> | null;
  if (!val) return null;
  for (const [id, row] of Object.entries(val)) {
    if (row && typeof row === "object" && row.email === email) {
      return { ...row, id: row.id ?? id } as User;
    }
  }
  return null;
}

export async function rtdbEmailTaken(db: Database, email: string): Promise<boolean> {
  const u = await rtdbFindUserByEmail(db, email);
  return u !== null;
}

export async function rtdbWriteUser(db: Database, user: User): Promise<void> {
  await set(ref(db, `${root()}/users/${user.id}`), recordForRtdb(user));
}

export async function rtdbApproveUser(db: Database, userId: string): Promise<void> {
  await update(ref(db), { [`${root()}/users/${userId}/approvalStatus`]: null });
}

export async function rtdbDeleteUser(db: Database, userId: string): Promise<void> {
  await update(ref(db), { [`${root()}/users/${userId}`]: null });
}

export async function rtdbWritePost(db: Database, post: Post): Promise<void> {
  await set(ref(db, `${root()}/posts/${post.id}`), recordForRtdb(post));
}

export async function rtdbUpdatePostFields(
  db: Database,
  postId: string,
  fields: { content: string; imageUrl?: string; updatedAt: string }
): Promise<void> {
  const patch: Record<string, unknown> = {
    [`${root()}/posts/${postId}/content`]: fields.content,
    [`${root()}/posts/${postId}/updatedAt`]: fields.updatedAt,
    [`${root()}/posts/${postId}/imageUrl`]: fields.imageUrl ?? null,
  };
  await update(ref(db), patch);
}

export async function rtdbDeletePostCascade(
  db: Database,
  postId: string,
  commentIds: string[],
  likeIds: string[],
  notificationIds: string[]
): Promise<void> {
  const patch: Record<string, null> = {};
  patch[`${root()}/posts/${postId}`] = null;
  for (const id of commentIds) patch[`${root()}/comments/${id}`] = null;
  for (const id of likeIds) patch[`${root()}/likes/${id}`] = null;
  for (const id of notificationIds) patch[`${root()}/notifications/${id}`] = null;
  await update(ref(db), patch);
}

export async function rtdbWriteComment(db: Database, comment: Comment): Promise<void> {
  await set(ref(db, `${root()}/comments/${comment.id}`), recordForRtdb(comment));
}

export async function rtdbWriteCommentAndNotification(
  db: Database,
  comment: Comment,
  notification: NotificationItem
): Promise<void> {
  await update(ref(db), {
    [`${root()}/comments/${comment.id}`]: recordForRtdb(comment),
    [`${root()}/notifications/${notification.id}`]: recordForRtdb(notification),
  });
}

export async function rtdbDeleteComment(db: Database, commentId: string): Promise<void> {
  await update(ref(db), { [`${root()}/comments/${commentId}`]: null });
}

export async function rtdbWriteLike(db: Database, like: Like): Promise<void> {
  await set(ref(db, `${root()}/likes/${like.id}`), recordForRtdb(like));
}

export async function rtdbWriteLikeAndNotification(db: Database, like: Like, notification: NotificationItem): Promise<void> {
  await update(ref(db), {
    [`${root()}/likes/${like.id}`]: recordForRtdb(like),
    [`${root()}/notifications/${notification.id}`]: recordForRtdb(notification),
  });
}

export async function rtdbDeleteLike(db: Database, likeId: string): Promise<void> {
  await update(ref(db), { [`${root()}/likes/${likeId}`]: null });
}
