import {
  CheckCircle2,
  FileText,
  MessageSquare,
  Shield,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { PageHero } from "../components/PageHero";
import { useAppState } from "../context/AppStateContext";
import { timeAgo } from "../utils/date";
import "./admin-hub.css";

export function AdminPage() {
  const { data, getUserById, deletePost, deleteComment, likeCount, commentCount, approvePendingUser, rejectPendingUser } =
    useAppState();

  const latestComments = useMemo(
    () => [...data.comments].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 12),
    [data.comments]
  );

  const pendingUsers = useMemo(
    () => data.users.filter((u) => u.approvalStatus === "pending"),
    [data.users]
  );

  return (
    <section className="page-grid admin-hub">
      <PageHero
        icon={Shield}
        title="Administration"
        subtitle="Approve new Student and Faculty registrations, then moderate posts and comments. Changes sync to your data store (local or Realtime Database)."
      />

      <div className="admin-stats">
        <article className="admin-stat admin-stat--users">
          <Users size={22} />
          <div>
            <span className="admin-stat-val">{data.users.length}</span>
            <span className="admin-stat-label">Registered users</span>
          </div>
        </article>
        <article className="admin-stat admin-stat--posts">
          <FileText size={22} />
          <div>
            <span className="admin-stat-val">{data.posts.length}</span>
            <span className="admin-stat-label">Total posts</span>
          </div>
        </article>
        <article className="admin-stat admin-stat--comments">
          <MessageSquare size={22} />
          <div>
            <span className="admin-stat-val">{data.comments.length}</span>
            <span className="admin-stat-label">Total comments</span>
          </div>
        </article>
        <article className="admin-stat admin-stat--pending">
          <UserPlus size={22} />
          <div>
            <span className="admin-stat-val">{pendingUsers.length}</span>
            <span className="admin-stat-label">Pending sign-ups</span>
          </div>
        </article>
      </div>

      <div className="admin-alert">
        <Shield size={20} />
        <div>
          <strong>Moderation mode</strong>
          <p>
            Approve or reject pending accounts first. Removing a post deletes its comments and likes for that post.
          </p>
        </div>
      </div>

      <div className="panel admin-panel">
        <div className="admin-panel-head">
          <h3>Registration approvals</h3>
          <span className="admin-panel-tag admin-panel-tag--warn">{pendingUsers.length} pending</span>
        </div>
        {pendingUsers.length === 0 ? (
          <p className="admin-pending-empty subtle">No accounts waiting for approval.</p>
        ) : (
          <ul className="admin-pending-list">
            {pendingUsers.map((user) => (
              <li className="admin-pending-row" key={user.id}>
                <img src={user.profileImage} alt="" className="admin-user-av admin-user-av--sm" />
                <div className="admin-pending-info">
                  <strong>{user.name}</strong>
                  <span
                    className={`admin-role-pill ${user.role === "Faculty" ? "admin-role-pill--faculty" : "admin-role-pill--student"}`}
                  >
                    {user.role}
                  </span>
                  <p className="admin-user-email">{user.email}</p>
                  <p className="subtle">Requested {new Date(user.joinedAt).toLocaleString()}</p>
                </div>
                <div className="admin-pending-actions">
                  <button type="button" className="admin-btn-approve" onClick={() => approvePendingUser(user.id)}>
                    <CheckCircle2 size={16} />
                    Approve
                  </button>
                  <button type="button" className="admin-btn-reject" onClick={() => rejectPendingUser(user.id)}>
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel admin-panel">
        <div className="admin-panel-head">
          <h3>Directory</h3>
          <span className="admin-panel-tag">Live</span>
        </div>
        <div className="admin-user-grid">
          {data.users.map((user) => {
            const posts = data.posts.filter((p) => p.userId === user.id).length;
            const roleClass =
              user.role === "Admin"
                ? "admin-role-pill--admin"
                : user.role === "Faculty"
                  ? "admin-role-pill--faculty"
                  : "admin-role-pill--student";
            return (
              <article className="admin-user-card" key={user.id}>
                <img src={user.profileImage} alt="" className="admin-user-av" />
                <div className="admin-user-body">
                  <strong>{user.name}</strong>
                  <span className={`admin-role-pill ${roleClass}`}>{user.role}</span>
                  {user.approvalStatus === "pending" && (
                    <span className="admin-chip admin-chip--warn">Pending approval</span>
                  )}
                  <p className="admin-user-email">{user.email}</p>
                </div>
                <div className="admin-user-meta">
                  <span className="admin-chip">{posts} posts</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="panel admin-panel">
        <div className="admin-panel-head">
          <h3>Content — posts</h3>
          <span className="admin-panel-tag admin-panel-tag--warn">{data.posts.length} items</span>
        </div>
        <div className="admin-mod-list">
          {data.posts.map((post) => {
            const author = getUserById(post.userId);
            return (
              <article className="admin-mod-card" key={post.id}>
                <div className="admin-mod-top">
                  <img src={author?.profileImage} alt="" className="admin-mod-av" />
                  <div className="admin-mod-headtext">
                    <strong>{author?.name ?? "Unknown"}</strong>
                    <span className="admin-mod-time">{timeAgo(post.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-remove"
                    onClick={() => deletePost(post.id)}
                  >
                    <Trash2 size={16} />
                    Remove post
                  </button>
                </div>
                <p className="admin-mod-body">{post.content}</p>
                <div className="admin-mod-foot">
                  <span>{likeCount(post.id)} likes</span>
                  <span>{commentCount(post.id)} comments</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="panel admin-panel">
        <div className="admin-panel-head">
          <h3>Content — comments</h3>
          <span className="admin-panel-tag">{latestComments.length} recent</span>
        </div>
        <div className="admin-mod-list admin-mod-list--compact">
          {latestComments.map((comment) => {
            const who = getUserById(comment.userId);
            const post = data.posts.find((p) => p.id === comment.postId);
            return (
              <article className="admin-comment-card" key={comment.id}>
                <img src={who?.profileImage} alt="" className="admin-mod-av admin-mod-av--sm" />
                <div className="admin-comment-main">
                  <div className="admin-comment-top">
                    <strong>{who?.name ?? "User"}</strong>
                    <span className="admin-mod-time">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="admin-comment-text">{comment.text}</p>
                  {post && (
                    <p className="admin-comment-ctx">
                      On post: {post.content.slice(0, 56)}
                      {post.content.length > 56 ? "…" : ""}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="admin-btn-remove admin-btn-remove--sm"
                  onClick={() => deleteComment(comment.id)}
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
