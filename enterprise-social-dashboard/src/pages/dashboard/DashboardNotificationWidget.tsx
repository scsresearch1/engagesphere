import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppState } from "../../context/AppStateContext";
import type { NotificationItem } from "../../types";
import { timeAgo } from "../../utils/date";

function iconFor(n: NotificationItem) {
  return n.type === "like" ? "♥" : "💬";
}

export function DashboardNotificationWidget({
  items,
  unreadCount,
}: {
  items: NotificationItem[];
  unreadCount: number;
}) {
  const { markAllNotificationsRead } = useAppState();
  return (
    <div className="dash-card dash-notify-widget">
      <div className="dash-card-head between">
        <div>
          <h3>Notification center</h3>
          <p className="dash-muted">{unreadCount} unread</p>
        </div>
        <button type="button" className="dash-btn-ghost-sm" onClick={markAllNotificationsRead}>
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>
      <ul className="dash-notify-list">
        {items.length === 0 && <li className="dash-muted">You are all caught up.</li>}
        {items.map((n) => (
          <li key={n.id} className={`dash-notify-item ${n.isRead ? "" : "unread"}`}>
            <span className="dash-notify-ico" aria-hidden>
              {iconFor(n)}
            </span>
            <div>
              <p>{n.message}</p>
              <span className="dash-muted">{timeAgo(n.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/notifications" className="dash-link-block">
        <Bell size={16} /> Open all notifications
      </Link>
    </div>
  );
}
