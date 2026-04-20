import { Activity, Bell, CalendarClock, Radio, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "../../types";

type Props = {
  currentUser: User;
  onlineUsers: number;
  postsToday: number;
  myUnread: number;
  engagementScore: number;
  streakDays: number;
};

export function DashboardHero({
  currentUser,
  onlineUsers,
  postsToday,
  myUnread,
  engagementScore,
  streakDays,
}: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const formatted = now.toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <section className="dash-hero">
      <div className="dash-hero-main">
        <p className="dash-hero-kicker">
          <Sparkles size={16} aria-hidden /> Good to see you
        </p>
        <h1 className="dash-hero-title">Welcome back, {currentUser.name.split(" ")[0]}</h1>
        <p className="dash-hero-sub">{formatted}</p>
        <div className="dash-hero-badges">
          <span className="dash-role-pill">{currentUser.role}</span>
          <span className="dash-chip">
            <Activity size={14} /> Score {engagementScore}
          </span>
          <span className="dash-chip dash-chip-streak">
            <CalendarClock size={14} /> {streakDays}d streak
          </span>
        </div>
      </div>
      <div className="dash-hero-side">
        <div className="dash-hero-avatar-wrap">
          <img src={currentUser.profileImage} alt="" className="dash-hero-avatar" />
          <div className="dash-hero-avatar-meta">
            <strong>{currentUser.name}</strong>
            <span className="dash-muted">Activity score reflects posts, comments, and reactions</span>
          </div>
        </div>
        <div className="dash-status-grid">
          <div className="dash-status-tile">
            <Users size={18} className="dash-status-icon" />
            <span className="dash-status-val">{onlineUsers}</span>
            <span className="dash-status-label">Active (7d)</span>
          </div>
          <div className="dash-status-tile">
            <Radio size={18} className="dash-status-icon" />
            <span className="dash-status-val">{postsToday}</span>
            <span className="dash-status-label">New posts today</span>
          </div>
          <div className="dash-status-tile dash-status-tile-pulse">
            <Bell size={18} className="dash-status-icon" />
            <span className="dash-status-val">{myUnread}</span>
            <span className="dash-status-label">Unread for you</span>
          </div>
        </div>
      </div>
    </section>
  );
}
