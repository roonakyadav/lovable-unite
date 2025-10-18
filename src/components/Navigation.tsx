import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Heart, BookOpen, Image, Settings } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/chat", icon: MessageCircle, label: "Chat" },
    { path: "/mood", icon: Heart, label: "Mood" },
    { path: "/journal", icon: BookOpen, label: "Journal" },
    { path: "/memories", icon: Image, label: "Memories" },
    { path: "/settings", icon: Settings, label: "Settings" },
];

export const Navigation = () => {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:max-w-md md:mx-auto z-50">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5 mb-1" />
                            <span className="text-xs">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
