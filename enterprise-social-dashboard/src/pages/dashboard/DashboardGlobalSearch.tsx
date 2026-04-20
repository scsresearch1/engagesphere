import { Filter, Search } from "lucide-react";
import type { Role } from "../../types";

type DateRange = "all" | "7d" | "30d";

type Props = {
  query: string;
  onQuery: (q: string) => void;
  roleFilter: "all" | Role;
  onRole: (r: "all" | Role) => void;
  sort: "latest" | "popular";
  onSort: (s: "latest" | "popular") => void;
  dateRange: DateRange;
  onDateRange: (d: DateRange) => void;
};

export function DashboardGlobalSearch({
  query,
  onQuery,
  roleFilter,
  onRole,
  sort,
  onSort,
  dateRange,
  onDateRange,
}: Props) {
  return (
    <div className="dash-global-search">
      <div className="dash-search-field">
        <Search size={18} className="dash-search-icon" />
        <input
          type="search"
          placeholder="Search posts or people…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>
      <div className="dash-search-filters">
        <span className="dash-filter-label">
          <Filter size={14} /> Role
        </span>
        <select value={roleFilter} onChange={(e) => onRole(e.target.value as "all" | Role)}>
          <option value="all">All roles</option>
          <option value="Student">Student</option>
          <option value="Faculty">Faculty</option>
          <option value="Admin">Admin</option>
        </select>
        <select value={sort} onChange={(e) => onSort(e.target.value as "latest" | "popular")}>
          <option value="latest">Latest</option>
          <option value="popular">Most popular</option>
        </select>
        <select value={dateRange} onChange={(e) => onDateRange(e.target.value as DateRange)}>
          <option value="all">All dates</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
    </div>
  );
}
