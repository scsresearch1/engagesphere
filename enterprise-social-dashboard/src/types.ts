export type Role = "Student" | "Faculty" | "Admin";

/** Roles allowed on the public signup form (Admin is provisioned only by admins / seed). */
export type SelfServeRole = Exclude<Role, "Admin">;

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  bio: string;
  profileImage: string;
  joinedAt: string;
  /** When set to `"pending"`, the user cannot sign in until an Admin approves the account. */
  approvalStatus?: "pending";
};

export type Post = {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
};

export type Like = {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
};

export type NotificationType = "like" | "comment";

export type NotificationItem = {
  id: string;
  receiverUserId: string;
  senderUserId: string;
  type: NotificationType;
  postId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type AppData = {
  users: User[];
  posts: Post[];
  comments: Comment[];
  likes: Like[];
  notifications: NotificationItem[];
};
