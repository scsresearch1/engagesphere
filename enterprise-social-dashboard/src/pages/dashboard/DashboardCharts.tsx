import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#6c63ff", "#3f8cff", "#00c9a7", "#ff7a18", "#ff3d68"];

type Props = {
  barTriple: { name: string; value: number }[];
  lineWeekly: { label: string; count: number }[];
  areaEngagement: { name: string; engagement: number }[];
  rolePie: { name: string; value: number }[];
  notificationDonut: { name: string; value: number }[];
};

export function DashboardCharts({
  barTriple,
  lineWeekly,
  areaEngagement,
  rolePie,
  notificationDonut,
}: Props) {
  const lineData = lineWeekly.map((d) => ({ name: d.label, activity: d.count }));

  return (
    <div className="dash-charts-grid">
      <div className="dash-chart-card">
        <div className="dash-chart-head">
          <h3>Posts vs comments vs likes</h3>
          <p className="dash-muted">Volume comparison</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barTriple} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-grid)" />
            <XAxis dataKey="name" tick={{ fill: "var(--dash-axis)", fontSize: 12 }} />
            <YAxis tick={{ fill: "var(--dash-axis)", fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12 }} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
              {barTriple.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dash-chart-card">
        <div className="dash-chart-head">
          <h3>Weekly activity trend</h3>
          <p className="dash-muted">Events per day</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-grid)" />
            <XAxis dataKey="name" tick={{ fill: "var(--dash-axis)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--dash-axis)", fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="activity"
              stroke="#6c63ff"
              strokeWidth={3}
              dot={{ fill: "#6c63ff", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dash-chart-card">
        <div className="dash-chart-head">
          <h3>Posts by role</h3>
          <p className="dash-muted">Authorship mix</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={rolePie.length ? rolePie : [{ name: "None", value: 1 }]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
            >
              {(rolePie.length ? rolePie : [{ name: "None", value: 1 }]).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="dash-chart-card">
        <div className="dash-chart-head">
          <h3>Notification status</h3>
          <p className="dash-muted">Read vs unread</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={notificationDonut}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={80}
            >
              <Cell fill="#94a3b8" />
              <Cell fill="#ff5f7b" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="dash-chart-card dash-chart-card-wide">
        <div className="dash-chart-head">
          <h3>Engagement by day</h3>
          <p className="dash-muted">Weighted activity index</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={areaEngagement} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="engFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3f8cff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3f8cff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-grid)" />
            <XAxis dataKey="name" tick={{ fill: "var(--dash-axis)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--dash-axis)", fontSize: 11 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="#3f8cff"
              fill="url(#engFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
