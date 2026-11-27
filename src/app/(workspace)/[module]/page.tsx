import { notFound } from "next/navigation";
import { modules } from "@/lib/navigation";

export function generateStaticParams() {
  return modules.filter(({ slug }) => slug !== "dashboard").map(({ slug }) => ({ module: slug }));
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  const feature = modules.find((item) => item.slug === slug && slug !== "dashboard");
  if (!feature) notFound();
  return (
    <>
      <p className="eyebrow">System module</p>
      <h1 className="page-heading">{feature.name}</h1>
      <p className="page-lead">{feature.description}</p>
      <section className="empty-panel"><h2>Module boundary prepared</h2><p>This page is intentionally a placeholder until the authenticated API and tenant-scoped data model are implemented. No demo figures are presented as real records.</p></section>
    </>
  );
}
