import Link from 'next/link';
import { Home, List, Settings, Search } from 'lucide-react';

export function AppSidebar() {
    return (
        <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border h-screen flex-col fixed left-0 top-0">
            <div className="p-6 h-16 flex items-center border-b border-sidebar-border">
                <h1 className="text-xl font-bold text-primary">SEO Researcher</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground transition-colors">
                    <Home size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link href="/sites" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground transition-colors">
                    <List size={20} />
                    <span>Sites</span>
                </Link>
                <Link href="/quick-check" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground transition-colors">
                    <Search size={20} />
                    <span>Site Check</span>
                </Link>
                <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground transition-colors">
                    <Settings size={20} />
                    <span>Settings</span>
                </Link>
            </nav>
            <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
                        U
                    </div>
                    <div className="text-sm text-sidebar-foreground">
                        <p className="font-medium">Admin User</p>
                        <p className="text-xs opacity-70">admin@example.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
