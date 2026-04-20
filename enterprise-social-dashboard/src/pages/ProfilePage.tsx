import { User as UserIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHero } from "../components/PageHero";
import { useAppState } from "../context/AppStateContext";
import { formatDateTime } from "../utils/date";

export function ProfilePage() {
  const { currentUser, data, updateProfile } = useAppState();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage ?? "");
  const [saved, setSaved] = useState("");

  const stats = useMemo(() => {
    if (!currentUser) return { posts: 0, comments: 0 };
    return {
      posts: data.posts.filter((post) => post.userId === currentUser.id).length,
      comments: data.comments.filter((comment) => comment.userId === currentUser.id).length,
    };
  }, [currentUser, data.comments, data.posts]);

  if (!currentUser) return null;

  return (
    <section className="page-grid">
      <PageHero
        icon={UserIcon}
        title="Your profile"
        subtitle="Identity, bio, and activity at a glance. Changes sync across the app via local storage until Firebase is connected."
      />
      <div className="panel profile-banner">
        <img src={profileImage} alt={name} className="avatar-lg" />
        <div>
          <h3>{currentUser.name}</h3>
          <p className="subtle">
            {currentUser.role} | Joined {formatDateTime(currentUser.joinedAt)}
          </p>
          <p>{currentUser.bio}</p>
        </div>
      </div>

      <div className="kpi-grid">
        <article className="kpi-card">
          <p className="subtle">Posts</p>
          <h3>{stats.posts}</h3>
        </article>
        <article className="kpi-card">
          <p className="subtle">Comments</p>
          <h3>{stats.comments}</h3>
        </article>
      </div>

      <form
        className="panel stack-sm"
        onSubmit={(event) => {
          event.preventDefault();
          updateProfile({ name, bio, profileImage });
          setSaved("Profile updated.");
        }}
      >
        <h3>Edit Profile</h3>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Email
          <input value={currentUser.email} disabled />
        </label>
        <label>
          Bio
          <textarea value={bio} rows={3} onChange={(event) => setBio(event.target.value)} />
        </label>
        <label>
          Profile image URL
          <input value={profileImage} onChange={(event) => setProfileImage(event.target.value)} />
        </label>
        <label>
          Upload profile image
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setProfileImage(URL.createObjectURL(file));
            }}
          />
        </label>
        {saved && <p className="ok-text">{saved}</p>}
        <button type="submit" className="primary-btn">
          Save changes
        </button>
      </form>

      <div className="panel stack-sm">
        <h3>Try another role (demo)</h3>
        <p className="subtle">
          One account = one role. Log out from the sidebar, then on the login page use{" "}
          <strong>Faculty</strong> or <strong>Admin</strong> quick sign-in (password{" "}
          <strong>password123</strong>). If those fail, click <strong>Restore demo accounts</strong> on
          the login page first.
        </p>
      </div>
    </section>
  );
}
