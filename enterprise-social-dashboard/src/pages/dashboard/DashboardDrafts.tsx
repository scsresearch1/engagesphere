import { Clock, FileEdit } from "lucide-react";
import { Link } from "react-router-dom";

export type DraftRow = { id: string; title: string; updatedAt: string };

export function DashboardDrafts({ drafts }: { drafts: DraftRow[] }) {
  return (
    <div className="dash-card dash-drafts">
      <div className="dash-card-head">
        <h3>Drafts & scheduled</h3>
        <p className="dash-muted">Simulated workspace items</p>
      </div>
      <ul className="dash-draft-list">
        {drafts.map((d) => (
          <li key={d.id} className="dash-draft-item">
            <FileEdit size={18} className="dash-draft-icon" />
            <div>
              <strong>{d.title}</strong>
              <p className="dash-muted">
                <Clock size={12} /> Last edited {new Date(d.updatedAt).toLocaleString()}
              </p>
            </div>
            <Link to="/feed#post-composer" className="dash-link-sm">
              Continue
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
