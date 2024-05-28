import { TRPCReactProvider } from "~/trpc/react";
import { Header } from "~/components/header";
import { Toaster } from "~/components/ui/toaster";
import {pathGuard} from "~/utils/utils";
import {UserRole} from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    await pathGuard([UserRole.ADMIN, UserRole.MANAGER]);

  return (
    <TRPCReactProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          <div className="flex flex-col gap-4">{children}</div>
        </main>
      </div>
      <Toaster />
    </TRPCReactProvider>
  );
}
