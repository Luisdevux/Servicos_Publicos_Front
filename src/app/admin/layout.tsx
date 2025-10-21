"use client";

import { 
  Home as HomeIcon, 
  Users, 
  Building2,
  FolderKanban,
  IdCardLanyard,
  Handshake,
  Briefcase,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "../../components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dados",
      url: "/admin/dashboard",
      icon: HomeIcon,
      isActive: true,
    },
    {
      title: "Demandas",
      url: "#",
      icon: FolderKanban,
    },
    {
      title: "Add Colaborador",
      url: "#",
      icon: Handshake,
    },
    {
      title: "Add Operador",
      url: "#",
      icon: IdCardLanyard,
    },
    {
      title: "Add Empresas Terceiras",
      url: "#",
      icon: Building2,
    },
    {
      title: "Add Tipo Demanda",
      url: "#",
      icon: Briefcase,
    }
  ]
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarContent>
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-[var(--global-text-primary)]">VILHENA+PÚBLICA</h1>
            <p className="text-sm text-[var(--global-text-secondary)]">Dashboard Administrativo</p>
          </div>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={item.isActive}  
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      
      </Sidebar>
      
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="p-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

