import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Package,
  Building2,
  FlaskConical,
  FileText,
  ClipboardList,
  BarChart3,
  LogOut,
  Plus,
  CheckSquare,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserType } from "@shared/schema";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: "Products", href: "/admin/products", icon: <Package className="h-4 w-4" /> },
  { title: "MSMEs", href: "/admin/msmes", icon: <Building2 className="h-4 w-4" /> },
  { title: "Agencies", href: "/admin/agencies", icon: <FlaskConical className="h-4 w-4" /> },
  { title: "Job Reviews", href: "/admin/reviews", icon: <CheckSquare className="h-4 w-4" /> },
  { title: "All Jobs", href: "/admin/jobs", icon: <FileText className="h-4 w-4" /> },
  { title: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

const msmeNav: NavItem[] = [
  { title: "Dashboard", href: "/msme", icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: "My Jobs", href: "/msme/jobs", icon: <FileText className="h-4 w-4" /> },
  { title: "Create Job", href: "/msme/jobs/new", icon: <Plus className="h-4 w-4" /> },
];

const agencyNav: NavItem[] = [
  { title: "Dashboard", href: "/agency", icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: "Available Jobs", href: "/agency/jobs", icon: <ClipboardList className="h-4 w-4" /> },
  { title: "My Submissions", href: "/agency/submissions", icon: <FileText className="h-4 w-4" /> },
];

function getNavItems(userType: UserType): NavItem[] {
  switch (userType) {
    case "ADMIN":
      return adminNav;
    case "MSME":
      return msmeNav;
    case "AGENCY":
      return agencyNav;
    default:
      return [];
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const navItems = getNavItems(user.type);

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <Link href={`/${user.type.toLowerCase()}`}>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <FlaskConical className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg">MotorTest</span>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.href}
                      >
                        <Link href={item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                          {item.icon}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={logout} data-testid="button-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 border-b h-16 px-4 bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </div>
            <div className="flex items-center gap-3">
              <RoleBadge role={user.type} />
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
