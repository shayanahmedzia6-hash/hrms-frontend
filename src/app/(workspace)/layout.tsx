import { AppShell } from "@/components/layout/app-shell";
import { ProtectedWorkspace } from "@/components/auth/protected-workspace";
import { UiProvider } from "@/components/layout/ui-provider";

export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedWorkspace>
      <UiProvider>
        <AppShell>{children}</AppShell>
      </UiProvider>
    </ProtectedWorkspace>
  );
}
