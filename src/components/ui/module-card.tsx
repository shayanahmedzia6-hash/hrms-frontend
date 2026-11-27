import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type ModuleCardProps = { slug: string; name: string; description: string; icon: LucideIcon };
export function ModuleCard({ slug, name, description, icon: Icon }: ModuleCardProps) {
  return (
    <Link href={`/${slug}`} className="module-card">
      <div className="card-icon"><Icon size={20} /></div>
      <h3 className="card-title">{name}</h3>
      <p className="card-description">{description}</p>
      <span className="card-bottom">Explore module →</span>
    </Link>
  );
}
