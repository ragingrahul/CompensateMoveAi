"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { WalletControls, WalletProviderWrapper } from "@/components/wallet";

// Mapping of paths to user-friendly names
const pathMap: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  transactions: "Transactions",
  payslip: "Payslips",
  pools: "Treasury Yield Pools",
  help: "Help & Center",
};

function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Extract the current page name from the pathname
  const currentPage = useMemo(() => {
    if (!pathname) return "Dashboard";

    // Extract the last segment of the path
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "dashboard";

    // Return the friendly name or the segment if not found
    return (
      pathMap[lastSegment] ||
      lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
    );
  }, [pathname]);

  return (
    <WalletProviderWrapper>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 justify-between items-center gap-2 border-purple-border-secondary border-b px-4">
            <div className="flex h-16 shrink-0 items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4 bg-purple-bg-dark2"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Main menu</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex flex-row items-center space-x-2">
              <WalletControls />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </WalletProviderWrapper>
  );
}

export default EmployerLayout;
