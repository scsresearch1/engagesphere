import { ArrowUpRight, Bell, CheckCheck, Heart, MessageCircle, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { useAppState } from "../context/AppStateContext";
import { timeAgo } from "../utils/date";
import "./notifications-inbox.css";

type Filter = "all" | "unread" | "like" | "comment";

export function NotificationsPage() {
  const { currentUser, data, getUserById, markAllNotificationsRead } = useAppState();
  const [filter, setFilter] = useState<Filter>("all");
  const userId = currentUser?.id ?? null;

  const items = useMemo(() => {
    if (!userId) return [];
    return data.notifications
      .filter((n) => n.receiverUserId === userId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [userId, data.notifications]);

  const stats = useMemo(() => {
    const unread = items.filter((n) => !n.isRead).length;
    const likes = items.filter((n) => n.type === "like").length;
    const comments = items.filter((n) => n.type === "comment").length;
    return { total: items.length, unread, likes, comments };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (filter === "unread") return !n.isRead;
      if (filter === "like") return n.type === "like";
      if (filter === "comment") return n.type === "comment";
      return true;
    });
  }, [items, filter]);

  if (!userId || !currentUser) return null;

  return (
    <section className="page-grid notify-hub">
      <PageHero
        icon={Bell}
        title="Notifications"
        subtitle="Likes and comments on your posts surface here. Filter by type or unread, then jump into the thread."
      />

      <div className="notify-stats">
        <article className="notify-stat notify-stat--total">
          <Bell size={22} />
          <div>
            <span className="notify-stat-val">{stats.total}</span>
            <span className="notify-stat-label">Inbox</span>
          </div>
        </article>
        <article className="notify-stat notify-stat--unread">
          <Sparkles size={22} />
          <div>
            <span className="notify-stat-val">{stats.unread}</span>
            <span className="notify-stat-label">Unread</span>
          </div>
        </article>
        <article className="notify-stat notify-stat--likes">
          <Heart size={22} />
          <div>
            <span className="notify-stat-val">{stats.likes}</span>
            <span className="notify-stat-label">Likes</span>
          </div>
        </article>
        <article className="notify-stat notify-stat--comments">
          <MessageCircle size={22} />
          <div>
            <span className="notify-stat-val">{stats.comments}</span>
            <span className="notify-stat-label">Comments</span>
          </div>
        </article>
      </div>

      <div className="panel notify-toolbar">
        <div className="notify-filters" role="tablist" aria-label="Filter notifications">
          {(
            [
              { id: "all" as const, label: "All" },
              { id: "unread" as const, label: "Unread" },
              { id: "like" as const, label: "Likes" },
              { id: "comment" as const, label: "Comments" },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={filter === chip.id}
              className={`notify-filter ${filter === chip.id ? "notify-filter--on" : ""}`}
              onClick={() => setFilter(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <button type="button" className="notify-btn-clear" onClick={markAllNotificationsRead}>
          <CheckCheck size={18} />
          Mark all read
        </button>
      </div>

      <div className="panel notify-panel">
        {filtered.length === 0 ? (
          <div className="notify-empty">
            <div className="notify-empty-icon">
              <Bell size={36} strokeWidth={1.5} />
            </div>
            <h4>Nothing here yet</h4>
            <p>
              {filter === "all"
                ? "When someone likes or comments on your posts, it will show up in this inbox."
                : `No ${filter === "unread" ? "unread" : filter} notifications right now.`}
            </p>
            <Link to="/feed" className="notify-empty-cta">
              Go to feed
            </Link>
          </div>
        ) : (
          <ul className="notify-list">
            {filtered.map((item) => {
              const sender = getUserById(item.senderUserId);
              const isLike = item.type === "like";
              const Icon = isLike ? Heart : MessageCircle;
              return (
                <li key={item.id}>
                  <article className={`notify-row ${item.isRead ? "notify-row--read" : "notify-row--unread"}`}>
                    <div className={`notify-type-ico ${isLike ? "notify-type-ico--like" : "notify-type-ico--cmt"}`}>
                      <Icon size={18} strokeWidth={2.2} />
                    </div>
                    <img src={sender?.profileImage} alt="" className="notify-av" />
                    <div className="notify-body">
                      <div className="notify-topline">
                        <strong>{sender?.name ?? "Someone"}</strong>
                        <span className="notify-time">{timeAgo(item.createdAt)}</span>
                      </div>
                      <p className="notify-msg">{item.message}</p>
                      {!item.isRead && <span className="notify-new-pill">New</span>}
                    </div>
                    <Link to={`/post/${item.postId}`} className="notify-open">
                      Open
                      <ArrowUpRight size={16} />
                    </Link>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
