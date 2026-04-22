import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearch, useLocation } from "@tanstack/react-router";
import { ArchiveSearchBar } from "@/components/diagrams/ArchiveSearchBar";
import { useAuthStore } from "@/stores/authStore";

export const TopNavBar = () => {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();
    
    // Safely retrieve search params if they exist, without strictly typing to a specific route
    const searchParams = useSearch({ strict: false });
    const location = useLocation();
    
    // Local state for the search input
    const [searchInput, setSearchInput] = useState((searchParams as any)?.search ?? "");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync input when URL changes
    useEffect(() => {
        if (location.pathname === '/archive') {
            setSearchInput((searchParams as any)?.search ?? '');
        } else {
            setSearchInput('');
        }
    }, [location.pathname, (searchParams as any)?.search]);

    const handleSearchInput = (value: string) => {
        setSearchInput(value);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            // Trigger a navigation to the archive page with the search string
            navigate({
                to: '/archive',
                search: (prev: any) => ({
                    ...prev,
                    search: value || undefined,
                    page: 1, // Reset to first page
                }),
            });
        }, 300);
    };

    const handleLogout = async () => {
        await logout();
        navigate({ to: '/login' });
    };

    const userInitials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('.').substring(0, 3)
        : 'م.م';

    return (
        <header className="docked full-width h-16 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-6 sticky top-0 z-10 transition-all duration-300">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            <ArchiveSearchBar
                value={searchInput}
                onChange={handleSearchInput}
            />

            <div className="flex items-center gap-4">
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-on-surface-variant hover:bg-error hover:text-on-error rounded-full transition-colors"
                  title="تسجيل الخروج"
                >
                    <span className="material-symbols-outlined">logout</span>
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm" title={user?.fullName}>
                    {userInitials}
                </div>
            </div>
        </header>
    );
};