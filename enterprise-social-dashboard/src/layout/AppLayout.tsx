import {
  Bell,
  LayoutDashboard,
  LogOut,
  Rss,
  Shield,
  User,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAppState } from "../context/AppStateContext";

type AppLayoutProps = {
  children: React.ReactNode;
};

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean };

const baseNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/feed", label: "Feed", icon: Rss },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/feed": "Feed",
  "/profile": "Profile",
  "/notifications": "Notifications",
  "/admin": "Admin",
};

export function AppLayout({ children }: AppLayoutProps) {
  const { currentUser, unreadCount, logout, data, backend, rtdbError } = useAppState();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pageTitle =
    pageTitles[pathname] ?? (pathname.startsWith("/post/") ? "Post" : "EngageSphere");

  const navItems = baseNav.filter(
    (item) => !item.adminOnly || currentUser?.role === "Admin"
  );

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  const isDashboard = pathname === "/dashboard";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo" aria-hidden>
            ES
          </span>
          <div>
            <h1>EngageSphere</h1>
            <p className="subtle">Social dashboard</p>
          </div>
        </div>
        {currentUser && (
          <div className="user-chip">
            <img src={currentUser.profileImage} alt={currentUser.name} />
            <div>
              <strong>{currentUser.name}</strong>
              <p className="subtle">
                {currentUser.role} | {currentUser.email}
              </p>
            </div>
          </div>
        )}
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              end
            >
              <span className="nav-item-inner">
                <item.icon size={18} className="sidebar-nav-icon" strokeWidth={2} />
                {item.label}
              </span>
              {item.to === "/notifications" && unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-stats subtle">
          <div>
            <strong>{data.posts.length}</strong> posts
          </div>
          <div>
            <strong>{data.users.length}</strong> users
          </div>
        </div>
        <p className="sidebar-hint subtle">
          Switch role: log out, then pick Student / Faculty / Admin on the login screen.
        </p>
        <button className="ghost-btn full-btn" onClick={onLogout} type="button">
          <LogOut size={16} style={{ marginRight: 6, verticalAlign: "text-bottom" }} />
          Logout
        </button>
      </aside>

      <main className={`content-area ${isDashboard ? "content-area--dash" : "content-area--pages"}`}>
        {isDashboard ? (
          <>
            <header className="topbar topbar-dashboard">
              <span className="subtle">Overview</span>
              <ThemeToggle />
            </header>
            {children}
          </>
        ) : (
          <div className="app-page-wrap">
            <header className="topbar">
              <div>
                <h2>{pageTitle}</h2>
                <p className="subtle">
                  {backend === "rtdb"
                    ? "Live data: Firebase Realtime Database (engageApp)."
                    : "Local demo: data in this browser only."}
                </p>
                {rtdbError && <p className="error-text" style={{ marginTop: "0.35rem" }}>{rtdbError}</p>}
              </div>
              <ThemeToggle />
            </header>
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
