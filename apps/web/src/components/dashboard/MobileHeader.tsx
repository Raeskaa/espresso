"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileHeaderProps {
    credits: number;
}

export function MobileHeader({ credits }: MobileHeaderProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Parse breadcrumbs from pathname
    // e.g. /dating-studio -> Dating Studio
    // /dashboard -> Dashboard
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const label = segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        return { href, label };
    });

    return (
        <header className="flex h-16 items-center border-b border-[#2D4A3E]/10 bg-white px-4 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2 -ml-2 text-[#2D4A3E]">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-r-0 w-64 bg-[#FFFEF5]">
                    <Sidebar credits={credits} isMobile={true} onNavigate={() => setOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex items-center text-sm font-medium text-[#2D4A3E]">
                <Link href="/dashboard" className="hover:text-[#2D4A3E]/80 transition-colors">
                    Espresso
                </Link>
                {breadcrumbs.length > 0 && (
                    <ChevronRight className="h-4 w-4 mx-1 text-[#2D4A3E]/40" />
                )}
                {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.href} className="flex items-center">
                        {index > 0 && (
                            <ChevronRight className="h-4 w-4 mx-1 text-[#2D4A3E]/40" />
                        )}
                        <Link
                            href={crumb.href}
                            className={index === breadcrumbs.length - 1 ? "font-bold" : "text-[#2D4A3E]/60 hover:text-[#2D4A3E]"}
                        >
                            {crumb.label}
                        </Link>
                    </div>
                ))}
            </div>
        </header>
    );
}
