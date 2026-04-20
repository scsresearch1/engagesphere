import type { AppData, Comment, Like, NotificationItem, Post, User } from "../types";

export const RTDB_APP_ROOT = "engageApp";

type TreeBlock<T> = Record<string, T> | null | undefined;

function blockToList<T extends { id: string }>(block: TreeBlock<Record<string, unknown>>): T[] {
  if (!block || typeof block !== "object") return [];
  return Object.entries(block)
    .map(([id, val]) => {
      if (!val || typeof val !== "object") return null;
      const row = val as Record<string, unknown>;
      return { ...row, id: (row.id as string) ?? id } as T;
    })
    .filter(Boolean) as T[];
}

export function treeToAppData(raw: unknown): AppData {
  if (!raw || typeof raw !== "object") {
    return { users: [], posts: [], comments: [], likes: [], notifications: [] };
  }
  const t = raw as Record<string, TreeBlock<Record<string, unknown>>>;
  return {
    users: blockToList<User>(t.users),
    posts: blockToList<Post>(t.posts),
    comments: blockToList<Comment>(t.comments),
    likes: blockToList<Like>(t.likes),
    notifications: blockToList<NotificationItem>(t.notifications),
  };
}

export function omitUndefined<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export function appDataToTree(data: AppData): Record<string, Record<string, unknown>> {
  const toRec = <T extends { id: string }>(rows: T[]) =>
    Object.fromEntries(rows.map((row) => [row.id, omitUndefined({ ...row } as Record<string, unknown>)]));
  return {
    users: toRec(data.users),
    posts: toRec(data.posts),
    comments: toRec(data.comments),
    likes: toRec(data.likes),
    notifications: toRec(data.notifications),
  };
}
