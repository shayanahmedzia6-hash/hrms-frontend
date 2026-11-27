import { AppShell } from "@/components/layout/app-shell";
import { ProtectedWorkspace } from "@/components/auth/protected-workspace";

export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ProtectedWorkspace><AppShell>{children}</AppShell></ProtectedWorkspace>;
}
