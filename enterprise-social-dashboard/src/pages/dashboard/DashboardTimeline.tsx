import {
  Bell,
  Megaphone,
  MessageCircle,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { timeAgo } from "../../utils/date";
import type { TimelineEntry } from "./useDashboardDerived";

const iconMap: Record<TimelineEntry["type"], LucideIcon> = {
  post: MessageCircle,
  comment: MessageCircle,
  notification: Bell,
  join: UserPlus,
  announcement: Megaphone,
};

export function DashboardTimeline({ items }: { items: TimelineEntry[] }) {
  return (
    <div className="dash-card dash-timeline-card">
      <div className="dash-card-head">
        <h3>Recent activity</h3>
        <p className="dash-muted">Live-style event stream</p>
      </div>
      <ul className="dash-timeline">
        {items.map((item) => {
          const Icon = iconMap[item.type];
          return (
            <li key={item.id} className="dash-timeline-item">
              <span className="dash-timeline-dot" aria-hidden />
              <span className="dash-timeline-icon">
                <Icon size={16} />
              </span>
              <div>
                <p className="dash-timeline-msg">{item.message}</p>
                <p className="dash-timeline-time">{timeAgo(item.createdAt)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
