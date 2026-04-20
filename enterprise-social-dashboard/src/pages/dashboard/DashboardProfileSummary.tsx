import { Calendar, MessageCircle, PenLine, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { User } from "../../types";
import { formatDateTime } from "../../utils/date";

type Props = {
  user: User;
  posts: number;
  comments: number;
  score: number;
};

export function DashboardProfileSummary({ user, posts, comments, score }: Props) {
  return (
    <div className="dash-card dash-profile-mini">
      <div className="dash-profile-mini-head">
        <img src={user.profileImage} alt="" />
        <div>
          <h3>{user.name}</h3>
          <span className="dash-role-pill dash-role-pill-sm">{user.role}</span>
        </div>
      </div>
      <p className="dash-muted dash-profile-bio">{user.bio.slice(0, 90)}{user.bio.length > 90 ? "…" : ""}</p>
      <ul className="dash-profile-stats">
        <li>
          <Calendar size={14} /> Joined {formatDateTime(user.joinedAt)}
        </li>
        <li>
          <PenLine size={14} /> {posts} posts
        </li>
        <li>
          <MessageCircle size={14} /> {comments} comments
        </li>
        <li>
          <Sparkles size={14} /> Engagement {score}
        </li>
      </ul>
      <Link to="/profile" className="dash-btn-primary-sm">
        Edit profile
      </Link>
    </div>
  );
}
