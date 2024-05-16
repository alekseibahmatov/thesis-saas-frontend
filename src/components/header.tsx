"use client";

import Link from "next/link";
import { CircleUser, Menu, Package2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import useActivePath from "~/hooks/useActivePath";
import { useUserRole } from "~/hooks/useUserRole";
import { usePathname } from "next/navigation";

export const Header = () => {
  const activePath = useActivePath();
  const { role, isLoading: roleLoads } = useUserRole();

  const navItems = {
    ADMIN: [
      {
        label: "Dashboard",
        link: "/dashboard",
      },
      {
        label: "Companies",
        link: "/dashboard/company",
      },
      {
        label: "Users",
        link: "/dashboard/user",
      },
    ],
    MANAGER: [
      {
        label: "Dashboard",
        link: "/dashboard",
      },
      {
        label: "Machines",
        link: "/dashboard/machines",
      },
      {
        label: "Workers",
        link: "/dashboard/workers",
      },
      {
        label: "Voice pools",
        link: "/dashboard/voice-pools",
      },
    ],
  };

  return (
    <header className="bg-background sticky top-0 flex h-16 items-center gap-4 border-b px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Saas</span>
        </Link>
        {!roleLoads &&
          navItems[role].map(({ label, link }) => (
            <Link
              href={link}
              key={label}
              className={`${usePathname() === link ? "text-foreground" : "text-muted-foreground"} hover:text-foreground text-nowrap transition-colors`}
            >
              {label}
            </Link>
          ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            {!roleLoads &&
              navItems[role].map(({ label, link }) => (
                <Link
                  href={link}
                  key={label}
                  className={`${activePath === link ? "" : "text-muted-foreground"} hover:text-foreground text-nowrap`}
                >
                  {label}
                </Link>
              ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
