const TAGS = ["AI", "ProjectReview", "ClassDiscussion", "CampusUpdate", "Research", "Lab"];

type Props = {
  selected: string | null;
  onSelect: (tag: string | null) => void;
};

export function DashboardTrendingTags({ selected, onSelect }: Props) {
  return (
    <div className="dash-card dash-tags-card">
      <div className="dash-card-head">
        <h3>Trending topics</h3>
        <p className="dash-muted">Filter preview & highlights</p>
      </div>
      <div className="dash-tag-row">
        <button
          type="button"
          className={`dash-tag ${selected == null ? "dash-tag-active" : ""}`}
          onClick={() => onSelect(null)}
        >
          All
        </button>
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            className={`dash-tag ${selected === t ? "dash-tag-active" : ""}`}
            onClick={() => onSelect(selected === t ? null : t)}
          >
            #{t}
          </button>
        ))}
      </div>
    </div>
  );
}
