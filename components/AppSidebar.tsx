'use client';

import Link from 'next/link';
import { Home, List, Settings, Search, LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/signOut';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
    const pathname = usePathname();

    const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
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
        <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border h-screen flex-col fixed left-0 top-0">
            <div className="p-6 h-16 flex items-center border-b border-sidebar-border">
                <h1 className="text-xl font-bold text-primary">SEO Researcher</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <NavLink href="/" icon={Home} label="Dashboard" />
                <NavLink href="/quick-check" icon={Search} label="Site Check" />
                <NavLink href="/settings" icon={Settings} label="Settings" />
            </nav>
            <div className="p-4 border-t border-sidebar-border space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground border border-sidebar-border/50">
                        U
                    </div>
                    <div className="text-sm text-sidebar-foreground">
                        <p className="font-medium">Admin User</p>
                        <p className="text-xs opacity-70">admin@example.com</p>
                    </div>
                </div>

                <form action={signOut}>
                    <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                    >
                        <LogOut size={18} />
                        ログアウト
                    </button>
                </form>
            </div>
        </aside>
    );
}
