import { useState } from "react";
import { useAppState } from "../context/AppStateContext";

type PostComposerProps = {
  initialContent?: string;
  initialImageUrl?: string;
  submitLabel: string;
  onSubmitSuccess?: () => void;
  onSubmit?: (payload: { content: string; imageUrl?: string }) => void;
};

export function PostComposer({
  initialContent = "",
  initialImageUrl = "",
  submitLabel,
  onSubmitSuccess,
  onSubmit,
}: PostComposerProps) {
  const { createPost } = useAppState();
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [error, setError] = useState("");

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      setError("Post content is required.");
      return;
    }
    const payload = {
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
    };
    if (onSubmit) onSubmit(payload);
    else createPost(payload);
    setError("");
    setContent("");
    setImageUrl("");
    onSubmitSuccess?.();
  };

  return (
    <form className="panel stack-sm" onSubmit={handleSubmit}>
      <h3>Create / Edit Post</h3>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        placeholder="Share an update..."
      />
      <label>
        Optional image URL
        <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
      </label>
      <label>
        Or upload image
        <input type="file" accept="image/*" onChange={handleFile} />
      </label>
      {imageUrl && <img src={imageUrl} alt="preview" className="post-image" />}
      {error && <p className="error-text">{error}</p>}
      <button type="submit" className="primary-btn">
        {submitLabel}
      </button>
    </form>
  );
}
