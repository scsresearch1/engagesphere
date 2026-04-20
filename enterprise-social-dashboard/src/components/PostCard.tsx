import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import type { Post } from "../types";
import { timeAgo } from "../utils/date";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const {
    currentUser,
    getUserById,
    getCommentsByPostId,
    addComment,
    deleteComment,
    toggleLike,
    likeCount,
    commentCount,
    isLikedByCurrentUser,
    updatePost,
    deletePost,
  } = useAppState();
  const author = getUserById(post.userId);
  const comments = getCommentsByPostId(post.id);
  const isOwner = currentUser?.id === post.userId || currentUser?.role === "Admin";
  const liked = isLikedByCurrentUser(post.id);

  return (
    <article className="post-card stack-sm">
      <div className="post-header">
        <div className="inline-user">
          <img src={author?.profileImage} alt={author?.name} />
          <div>
            <strong>{author?.name ?? "Unknown User"}</strong>
            <p className="subtle">
              {author?.role ?? "User"} | {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <Link to={`/post/${post.id}`} className="ghost-link">
          Open
        </Link>
      </div>
      <p>{post.content}</p>
      {post.imageUrl && <img className="post-image" src={post.imageUrl} alt="post attachment" />}

      <div className="post-actions">
        <button type="button" className="ghost-btn" onClick={() => toggleLike(post.id)}>
          {liked ? "Unlike" : "Like"} ({likeCount(post.id)})
        </button>
        <span className="pill">{commentCount(post.id)} comments</span>
        {isOwner && (
          <>
            <button
              type="button"
              className="ghost-btn"
              onClick={() =>
                updatePost(post.id, {
                  content: `${post.content} (edited)`,
                  imageUrl: post.imageUrl,
                })
              }
            >
              Quick Edit
            </button>
            <button type="button" className="ghost-btn danger" onClick={() => deletePost(post.id)}>
              Delete
            </button>
          </>
        )}
      </div>

      <div className="comments-box">
        {comments.map((comment) => {
          const commentUser = getUserById(comment.userId);
          const canDelete =
            currentUser?.id === comment.userId ||
            currentUser?.id === post.userId ||
            currentUser?.role === "Admin";
          return (
            <div className="comment-row" key={comment.id}>
              <p>
                <strong>{commentUser?.name ?? "User"}:</strong> {comment.text}
              </p>
              {canDelete && (
                <button type="button" className="link-btn" onClick={() => deleteComment(comment.id)}>
                  remove
                </button>
              )}
            </div>
          );
        })}
        <CommentInput postId={post.id} onAdd={addComment} />
      </div>
    </article>
  );
}

function CommentInput({
  postId,
  onAdd,
}: {
  postId: string;
  onAdd: (postId: string, text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <form
      className="comment-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        onAdd(postId, text.trim());
        setText("");
      }}
    >
      <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Add comment" />
      <button type="submit" className="ghost-btn">
        Comment
      </button>
    </form>
  );
}
