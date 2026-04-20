import type { LucideIcon } from "lucide-react";

type PageHeroProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
};

export function PageHero({ icon: Icon, title, subtitle }: PageHeroProps) {
  return (
    <header className="app-page-hero">
      <div className="app-page-hero-icon" aria-hidden>
        <Icon size={26} strokeWidth={2} />
      </div>
      <div>
        <h2 className="app-page-title">{title}</h2>
        <p className="app-page-sub">{subtitle}</p>
      </div>
    </header>
  );
}
