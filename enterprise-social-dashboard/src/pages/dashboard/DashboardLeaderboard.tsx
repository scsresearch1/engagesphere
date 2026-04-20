import { Trophy } from "lucide-react";
import type { LeaderRow } from "./useDashboardDerived";

export function DashboardLeaderboard({ rows }: { rows: LeaderRow[] }) {
  return (
    <div className="dash-card">
      <div className="dash-card-head">
        <h3 className="dash-card-title-row">
          <Trophy size={20} aria-hidden />
          Engagement leaderboard
        </h3>
        <p className="dash-muted">Top contributors by weighted score</p>
      </div>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Posts</th>
              <th>Comments</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.userId}>
                <td>{r.rank}</td>
                <td>
                  <strong>{r.name}</strong>
                  <span className="dash-muted"> · {r.role}</span>
                </td>
                <td>{r.posts}</td>
                <td>{r.comments}</td>
                <td>
                  <span className="dash-pill-score">{r.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
