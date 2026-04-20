import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAppState } from "../context/AppStateContext";

const DEMO = {
  student: { email: "student@engage.test", password: "password123", label: "Student (Priya R)" },
  faculty: { email: "faculty@engage.test", password: "password123", label: "Faculty (Dr. Hari K)" },
  admin: { email: "admin@engage.test", password: "password123", label: "Admin (Admin Office)" },
} as const;

/** Three seeded demo roles (matches `src/data/seed.ts` primary accounts). */
const DEMO_ACCOUNTS = [
  { role: "Student", name: "Priya R", email: DEMO.student.email, password: DEMO.student.password },
  { role: "Faculty", name: "Dr. Hari K", email: DEMO.faculty.email, password: DEMO.faculty.password },
  { role: "Admin", name: "Admin Office", email: DEMO.admin.email, password: DEMO.admin.password },
] as const;

export function LoginPage() {
  const { login, resetDemoToSeed } = useAppState();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>(DEMO.student.email);
  const [password, setPassword] = useState<string>(DEMO.student.password);
  const [message, setMessage] = useState("");

  const tryLogin = async (e: string, p: string) => {
    const result = await login(e.trim(), p);
    if (!result.ok) {
      setMessage(
        `${result.message} If Faculty/Admin logins fail, use “Restore demo accounts” below (your saved data may have replaced them).`
      );
      return;
    }
    navigate("/dashboard");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    void tryLogin(email, password);
  };

  const fillDemo = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setMessage("");
  };

  return (
    <div className="auth-shell auth-shell--genz auth-shell-with-theme">
      <span className="auth-genz-float auth-genz-float--a" aria-hidden />
      <span className="auth-genz-float auth-genz-float--b" aria-hidden />
      <div className="auth-theme-corner">
        <ThemeToggle />
      </div>
      <form className="panel auth-card stack-sm" onSubmit={handleSubmit}>
        <span className="auth-genz-brand">EngageSphere</span>
        <h2>Sign in</h2>
        <p className="subtle">One vibe per session — log out to switch roles.</p>

        <details className="demo-users-details">
          <summary className="demo-users-summary">Demo users</summary>
          <div className="demo-users-panel">
            <p className="demo-users-lead">
              Seeded accounts (Firebase RTDB / local seed). Same password for all three.
            </p>
            <ul className="demo-users-list">
              {DEMO_ACCOUNTS.map((row) => (
                <li key={row.email}>
                  <div className="demo-users-row-head">
                    <strong>{row.role}</strong>
                    <span className="subtle">{row.name}</span>
                  </div>
                  <div className="demo-users-credentials">
                    <span>
                      Email <code>{row.email}</code>
                    </span>
                    <span>
                      Password <code>{row.password}</code>
                    </span>
                  </div>
                  <button type="button" className="demo-users-fill" onClick={() => fillDemo(row.email, row.password)}>
                    Copy into form
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </details>

        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {message && (
          <p className={message.includes("Demo data restored") ? "ok-text" : "error-text"}>{message}</p>
        )}
        <button className="primary-btn" type="submit">
          Let&apos;s go
        </button>

        <button
          type="button"
          className="ghost-btn full-btn"
          onClick={() => {
            void resetDemoToSeed().then(() =>
              setMessage("Demo data restored. Open “Demo users” for sign-in details.")
            );
          }}
        >
          Restore demo accounts & sample posts
        </button>

        <div className="row-links">
          <Link to="/signup">Create account</Link>
          <Link to="/forgot-password">Forgot password</Link>
        </div>
      </form>
    </div>
  );
}
