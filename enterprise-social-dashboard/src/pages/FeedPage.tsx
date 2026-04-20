import { Rss } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHero } from "../components/PageHero";
import { PostCard } from "../components/PostCard";
import { PostComposer } from "../components/PostComposer";
import { useAppState } from "../context/AppStateContext";

type SortOption = "newest" | "mostLiked" | "mostCommented";

export function FeedPage() {
  const { data, getUserById, likeCount, commentCount } = useAppState();
  const [search, setSearch] = useState("");
  const [filterUserId, setFilterUserId] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    if (window.location.hash === "#post-composer") {
      document.getElementById("post-composer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const feed = useMemo(() => {
    const filtered = data.posts.filter((post) => {
      const author = getUserById(post.userId);
      const matchText = post.content.toLowerCase().includes(search.toLowerCase());
      const matchUser = filterUserId === "all" || post.userId === filterUserId;
      const matchAuthor = author?.name.toLowerCase().includes(search.toLowerCase()) ?? false;
      return matchUser && (matchText || matchAuthor || !search.trim());
    });
    return filtered.sort((a, b) => {
      if (sort === "newest") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (sort === "mostLiked") return likeCount(b.id) - likeCount(a.id);
      return commentCount(b.id) - commentCount(a.id);
    });
  }, [commentCount, data.posts, filterUserId, getUserById, likeCount, search, sort]);

  return (
    <section className="page-grid">
      <PageHero
        icon={Rss}
        title="Social feed"
        subtitle="Publish updates, attach media, and keep discussions flowing. Filters apply instantly in this static build."
      />
      <div id="post-composer">
        <PostComposer submitLabel="Publish post" />
      </div>

      <div className="panel filters">
        <h3 className="filters-title">Search and filter</h3>
        <input
          placeholder="Search by keyword or author"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={filterUserId} onChange={(event) => setFilterUserId(event.target.value)}>
          <option value="all">All users</option>
          {data.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
          <option value="newest">Newest</option>
          <option value="mostLiked">Most liked</option>
          <option value="mostCommented">Most commented</option>
        </select>
      </div>

      <div className="panel stack-sm">
        <h3>Feed</h3>
        {feed.length === 0 && <p className="subtle">No posts match your filters.</p>}
        {feed.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
