"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  Heart,
  History, 
  Settings,
  CreditCard,
  Plus,
  LogOut
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const mainNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Quick Fix",
    href: "/generate",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    label: "Dating Studio",
    href: "/dating-studio",
    icon: <Heart className="w-5 h-5" />,
    badge: "NEW",
  },
  {
    label: "History",
    href: "/history",
    icon: <History className="w-5 h-5" />,
  },
];

const bottomNav: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

interface SidebarProps {
  credits: number;
}

export function Sidebar({ credits }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#FFFEF5] border-r border-[#2D4A3E]/10 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-[#2D4A3E]/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span 
            className="text-xl font-bold text-[#2D4A3E]" 
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ESPRESSO
          </span>
        </Link>
      </div>

      {/* New Generation Button */}
      <div className="p-4">
        <Link href="/generate">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2D4A3E] text-white rounded-xl font-medium hover:bg-[#1f352d] transition-colors">
            <Plus className="w-5 h-5" />
            New Generation
          </button>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-[#2D4A3E] text-white" 
                    : "text-[#2D4A3E]/70 hover:bg-[#2D4A3E]/5 hover:text-[#2D4A3E]"
                )}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FFE066] text-[#2D4A3E] rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Credits Card */}
      <div className="px-4 pb-4">
        <div className="p-4 rounded-xl bg-[#2D4A3E]/5 border border-[#2D4A3E]/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2D4A3E]/60" />
              <span className="text-sm font-medium text-[#2D4A3E]">Credits</span>
            </div>
            <span className="text-lg font-bold text-[#2D4A3E]">{credits}</span>
          </div>
          <Link href="/pricing">
            <button className="w-full py-2 text-sm font-medium text-[#2D4A3E] border border-[#2D4A3E]/20 rounded-lg hover:bg-[#2D4A3E]/5 transition-colors">
              Buy More
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-3 pb-2">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-[#2D4A3E] text-white" 
                  : "text-[#2D4A3E]/70 hover:bg-[#2D4A3E]/5 hover:text-[#2D4A3E]"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[#2D4A3E]/10">
        <div className="flex items-center gap-3">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#2D4A3E] truncate">Account</p>
            <p className="text-xs text-[#2D4A3E]/50">Manage profile</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
