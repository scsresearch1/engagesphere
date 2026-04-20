export function DashboardHeatmap({
  days,
}: {
  days: { label: string; count: number; intensity: number }[];
}) {
  return (
    <div className="dash-card dash-heat-card">
      <div className="dash-card-head">
        <h3>Weekly contribution</h3>
        <p className="dash-muted">Posts, comments, and likes per day</p>
      </div>
      <div className="dash-heat-row">
        {days.map((d) => (
          <div key={d.label} className="dash-heat-cell-wrap">
            <div
              className="dash-heat-cell"
              data-intensity={d.intensity}
              title={`${d.label}: ${d.count} events`}
            />
            <span className="dash-heat-label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
