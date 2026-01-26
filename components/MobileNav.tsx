'use client';

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import Link from "next/link";
import { Home, List, Settings, Search, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/actions/signOut';

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
            >
                <Icon size={20} />
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:hidden sticky top-0 z-40">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col w-64 p-0">
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle className="text-left text-xl font-bold text-primary">SEO Researcher</SheetTitle>
                    </SheetHeader>
                    <nav className="flex-1 p-4 space-y-2">
                        <NavLink href="/" icon={Home} label="Dashboard" />

                        <NavLink href="/quick-check" icon={Search} label="Site Check" />
                        <NavLink href="/settings" icon={Settings} label="Settings" />
                    </nav>
                    <div className="p-4 border-t">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
                                U
                            </div>
                            <div className="text-sm text-sidebar-foreground">
                                <p className="font-medium">Admin User</p>
                                <p className="text-xs opacity-70">admin@example.com</p>
                            </div>
                        </div>
                        <form action={signOut} className="mt-4">
                            <button
                                type="submit"
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                            >
                                <LogOut size={18} />
                                ログアウト
                            </button>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>
            <div className="flex-1">
                <h1 className="text-lg font-semibold">SEO Researcher</h1>
            </div>
        </header>
    );
}
