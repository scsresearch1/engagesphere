import { Bell, ImagePlus, PenSquare, Rss, User } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { to: "/feed#post-composer", label: "Create post", icon: PenSquare },
  { to: "/feed", label: "View feed", icon: Rss },
  { to: "/feed#post-composer", label: "Upload image", icon: ImagePlus },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Edit profile", icon: User },
] as const;

export function DashboardQuickActions() {
  return (
    <div className="dash-quick-actions">
      {actions.map(({ to, label, icon: Icon }) => (
        <Link key={label} to={to} className="dash-quick-btn">
          <Icon size={18} strokeWidth={2} />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
}
