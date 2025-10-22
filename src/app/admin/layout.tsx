"use client";

import { 
  Home as HomeIcon, 
  Building2,
  FolderKanban,
  IdCardLanyard,
  Handshake,
  Briefcase,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "../../components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dados",
      path: "/admin/dashboard",
      icon: HomeIcon,
      isActive: true,
    },
    {
      title: "Demandas",
      path: "#",
      icon: FolderKanban,
    },
    {
      title: "Add Colaborador",
      path: "#",
      icon: Handshake,
    },
    {
      title: "Add Operador",
      path: "#",
      icon: IdCardLanyard,
    },
    {
      title: "Add Empresas Terceiras",
      path: "#",
      icon: Building2,
    },
    {
      title: "Add Tipo Demanda",
      path: "#",
      icon: Briefcase,
    },
    {
      title: "Sair",
      path: "#",
      icon: LogOut,
    }
  ]
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarContent>
          <div className="p-4">
            <h1 className="text-xl font-bold text-[var(--global-text-primary)]">VILHENA+PÚBLICA</h1>
            <p className="text-xs text-[var(--global-text-secondary)]">Dashboard Administrativo</p>
          </div>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                    {item.title === "Sair" ? (
                      <SidebarMenuButton
                        asChild
                        onClick={() => logout()}
                        className="cursor-pointer"
                      >
                        <button className="flex items-center gap-2 w-full text-left">
                          <item.icon />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <a href={item.path}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                </SidebarMenuItem>
                ))}

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      
      </Sidebar>
      
      <SidebarInset>
          <div className="flex flex-1 flex-col">
            <header className="flex h-16 shrink-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-lg text-[var(--global-text-secondary)] font-semibold">Dados</h1>
              </div>
            </header>
            
            <div className="flex-1 p-4">
              {children}
            </div>
          </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

