import { MessageSquareText } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { PostCard } from "../components/PostCard";
import { useAppState } from "../context/AppStateContext";

export function PostDetailsPage() {
  const { postId } = useParams<{ postId: string }>();
  const { getPostById } = useAppState();
  if (!postId) return <Navigate to="/feed" replace />;
  const post = getPostById(postId);
  if (!post) {
    return (
      <section className="page-grid">
        <PageHero
          icon={MessageSquareText}
          title="Post"
          subtitle="This link may be stale or the post was removed."
        />
        <div className="panel">
          <h3>Post not found</h3>
        </div>
      </section>
    );
  }
  return (
    <section className="page-grid">
      <PageHero
        icon={MessageSquareText}
        title="Post thread"
        subtitle="Full thread view with comments and reactions. Return to the feed anytime."
      />
      <PostCard post={post} />
    </section>
  );
}
