import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post, User } from "../../types";

type Row = { post: Post; score: number; author: User | undefined };

export function DashboardEngagedPosts({ rows }: { rows: Row[] }) {
  const max = Math.max(...rows.map((r) => r.score), 1);
  return (
    <div className="dash-card">
      <div className="dash-card-head">
        <h3>Most engaged posts</h3>
        <p className="dash-muted">Top three by interactions</p>
      </div>
      <div className="dash-engaged-stack">
        {rows.length === 0 && <p className="dash-muted">No engagement data yet.</p>}
        {rows.map((row, idx) => (
          <article key={row.post.id} className="dash-engaged-card" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="dash-engaged-head">
              <img src={row.author?.profileImage} alt="" className="dash-feed-av" />
              <div>
                <strong>{row.author?.name ?? "User"}</strong>
                <p className="dash-muted">{row.score} interactions</p>
              </div>
              <Link to={`/post/${row.post.id}`} className="dash-btn-outline dash-btn-sm">
                <ExternalLink size={14} /> Open
              </Link>
            </div>
            <p className="dash-engaged-snippet">{row.post.content}</p>
            <div className="dash-engaged-bar-wrap">
              <div className="dash-engaged-bar" style={{ width: `${(row.score / max) * 100}%` }} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
