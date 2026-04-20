import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post, User } from "../../types";
import { timeAgo } from "../../utils/date";

type Props = {
  posts: Post[];
  getUserById: (id: string) => User | undefined;
  likeCount: (id: string) => number;
  commentCount: (id: string) => number;
};

export function DashboardFeedPreview({ posts, getUserById, likeCount, commentCount }: Props) {
  return (
    <div className="dash-card dash-feed-preview">
      <div className="dash-card-head between">
        <div>
          <h3>Recent feed preview</h3>
          <p className="dash-muted">Latest updates from the platform</p>
        </div>
        <Link to="/feed" className="dash-btn-outline">
          View full feed
        </Link>
      </div>
      <div className="dash-feed-list">
        {posts.length === 0 && <p className="dash-muted">No posts yet.</p>}
        {posts.map((post) => {
          const author = getUserById(post.userId);
          return (
            <article key={post.id} className="dash-feed-preview-item">
              <img src={author?.profileImage} alt="" className="dash-feed-av" />
              <div className="dash-feed-body">
                <div className="dash-feed-meta">
                  <strong>{author?.name ?? "User"}</strong>
                  <span className="dash-muted">{timeAgo(post.createdAt)}</span>
                </div>
                <p className="dash-feed-snippet">{post.content.slice(0, 120)}{post.content.length > 120 ? "…" : ""}</p>
                <div className="dash-feed-stats">
                  <span>
                    <Heart size={14} /> {likeCount(post.id)}
                  </span>
                  <span>
                    <MessageCircle size={14} /> {commentCount(post.id)}
                  </span>
                </div>
              </div>
              <Link to={`/post/${post.id}`} className="dash-link-sm">
                Open
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
