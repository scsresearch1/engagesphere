import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAppState } from "../context/AppStateContext";
import type { SelfServeRole } from "../types";

export function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAppState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SelfServeRole>("Student");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void (async () => {
      const result = await register({ name: name.trim(), email: email.trim(), password, role });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setSubmitted(true);
      setMessage("");
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
        <h2>Join the feed</h2>
        {submitted ? (
          <>
            <p className="ok-text">
              You are in the queue. An admin has to green-light{" "}
              {role === "Student" ? "Student" : "Faculty"} accounts before you can sign in.
            </p>
            <p className="subtle">Same email + password once you are approved.</p>
            <button type="button" className="primary-btn" onClick={() => navigate("/login")}>
              Back to sign in
            </button>
          </>
        ) : (
          <>
        <p className="subtle">
          No self-serve Admin here — Student &amp; Faculty only. Your request sits pending until someone
          with Admin powers hits approve in the console.
        </p>
        <label>
          Full name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as SelfServeRole)}>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
          </select>
        </label>
        {message && <p className="error-text">{message}</p>}
        <button className="primary-btn" type="submit">
          Send it ✦
        </button>
        <div className="row-links">
          <Link to="/login">Back to login</Link>
        </div>
          </>
        )}
      </form>
    </div>
  );
}
