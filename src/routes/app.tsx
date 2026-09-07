import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/sim/Shell";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
