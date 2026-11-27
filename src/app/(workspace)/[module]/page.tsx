import { notFound } from "next/navigation";
import { modules } from "@/lib/navigation";
import { ModuleView } from "@/components/layout/module-view";

export function generateStaticParams() {
  return modules.filter(({ slug }) => slug !== "dashboard").map(({ slug }) => ({ module: slug }));
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  const feature = modules.find((item) => item.slug === slug && slug !== "dashboard");
  if (!feature) notFound();
  return <ModuleView slug={slug} />;
}
