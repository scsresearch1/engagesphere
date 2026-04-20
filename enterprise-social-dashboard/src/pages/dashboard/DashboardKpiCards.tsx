import { MessageCircle, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";

type Spark = { name: string; v: number };

type Kpi = {
  totalPosts: number;
  totalComments: number;
  totalUsers: number;
  activeUsers: number;
  trends: { posts: string; comments: string; users: string; active: string };
  sparkPosts: Spark[];
};

type Props = { kpis: Kpi };

function MiniSpark({ data, color, gradId }: { data: Spark[]; color: string; gradId: string }) {
  return (
    <div className="dash-kpi-spark">
      <ResponsiveContainer width="100%" height={44}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <RTooltip contentStyle={{ fontSize: 11 }} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={`url(#${gradId})`}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DashboardKpiCards({ kpis }: Props) {
  const cards = [
    {
      key: "posts",
      title: "Total posts",
      value: kpis.totalPosts,
      subtitle: "Published across the platform",
      trend: kpis.trends.posts,
      icon: Sparkles,
      grad: "dash-kpi--purple",
      sparkColor: "#6c63ff",
    },
    {
      key: "comments",
      title: "Total comments",
      value: kpis.totalComments,
      subtitle: "Discussion depth",
      trend: kpis.trends.comments,
      icon: MessageCircle,
      grad: "dash-kpi--sunset",
      sparkColor: "#ff7a18",
    },
    {
      key: "users",
      title: "Total users",
      value: kpis.totalUsers,
      subtitle: "Registered accounts",
      trend: kpis.trends.users,
      icon: Users,
      grad: "dash-kpi--teal",
      sparkColor: "#00c9a7",
    },
    {
      key: "active",
      title: "Active users",
      value: kpis.activeUsers,
      subtitle: "With any engagement",
      trend: kpis.trends.active,
      icon: Zap,
      grad: "dash-kpi--cyan",
      sparkColor: "#3f8cff",
    },
  ] as const;

  return (
    <div className="dash-kpi-row">
      {cards.map((c) => (
        <article key={c.key} className={`dash-kpi-card ${c.grad}`}>
          <div className="dash-kpi-head">
            <div>
              <p className="dash-kpi-title">{c.title}</p>
              <p className="dash-kpi-sub">{c.subtitle}</p>
            </div>
            <span className="dash-kpi-icon">
              <c.icon size={22} />
            </span>
          </div>
          <p className="dash-kpi-value">{c.value}</p>
          <p className="dash-kpi-trend">
            <TrendingUp size={14} /> {c.trend} this week
          </p>
          <MiniSpark data={kpis.sparkPosts} color={c.sparkColor} gradId={`mini-${c.key}`} />
        </article>
      ))}
    </div>
  );
}
