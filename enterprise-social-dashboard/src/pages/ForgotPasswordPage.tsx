import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAppState } from "../context/AppStateContext";

export function ForgotPasswordPage() {
  const { resetPassword } = useAppState();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void (async () => {
      const result = await resetPassword(email.trim());
      setMessage(result.message);
      setOk(result.ok);
    })();
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
        <h2>Password reset</h2>
        <p className="subtle">Simulated flow for the demo — no real email yet.</p>
        <label>
          Registered email
          <input value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        {message && <p className={ok ? "ok-text" : "error-text"}>{message}</p>}
        <button className="primary-btn" type="submit">
          Send reset link
        </button>
        <div className="row-links">
          <Link to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
}
