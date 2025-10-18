import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useSpace } from "@/contexts/SpaceContext";
import { supabase } from "@/Integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle, BookOpen, Image as ImageIcon, } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
export default function Dashboard() {
    const { user } = useAuth();
    const { spaceId, spaceName, partnerName, loading } = useSpace();
    const [stats, setStats] = useState({
        messages: 0,
        journals: 0,
        memories: 0,
        myMood: null,
        partnerMood: null,
    });
    useEffect(() => {
        if (!spaceId || !user)
            return;
        const fetchStats = async () => {
            const [messagesRes, journalsRes, memoriesRes, myMoodRes, partnerMoodRes,] = await Promise.all([
                supabase
                    .from("messages")
                    .select("id", { count: "exact", head: true })
                    .eq("space_id", spaceId),
                supabase
                    .from("journal_entries")
                    .select("id", { count: "exact", head: true })
                    .eq("space_id", spaceId),
                supabase
                    .from("memories")
                    .select("id", { count: "exact", head: true })
                    .eq("space_id", spaceId),
                supabase
                    .from("moods")
                    .select("mood_value")
                    .eq("space_id", spaceId)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                supabase
                    .from("moods")
                    .select("mood_value")
                    .eq("space_id", spaceId)
                    .neq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle(),
            ]);
            setStats({
                messages: messagesRes.count || 0,
                journals: journalsRes.count || 0,
                memories: memoriesRes.count || 0,
                myMood: myMoodRes.data?.mood_value || null,
                partnerMood: partnerMoodRes.data?.mood_value || null,
            });
        };
        fetchStats();
    }, [spaceId, user]);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary" }) }));
    }
    if (!spaceId) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen p-4", children: _jsxs(Card, { className: "max-w-md", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "No Space Found" }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "You need to create or join a couple space first." }), _jsx(Link, { to: "/space-setup", className: "inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2", children: "Setup Space" })] })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen pb-20 bg-gradient-to-br from-background via-background to-secondary/20", children: [_jsxs("div", { className: "max-w-md mx-auto p-4 space-y-6", children: [_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg mb-4", children: _jsx(Heart, { className: "w-8 h-8 text-primary-foreground fill-current" }) }), _jsx("h1", { className: "text-3xl font-bold", children: spaceName }), _jsx("p", { className: "text-muted-foreground mt-1", children: partnerName ? `You & ${partnerName}` : "Waiting for partner..." })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Card, { className: "bg-gradient-to-br from-card to-secondary/20", children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: stats.myMood || "😊" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Your Mood" })] }) }), _jsx(Card, { className: "bg-gradient-to-br from-card to-secondary/20", children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: stats.partnerMood || "❤️" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Partner's Mood" })] }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Link, { to: "/chat", children: _jsx(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", children: _jsxs(CardContent, { className: "flex items-center p-4", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4", children: _jsx(MessageCircle, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold", children: "Messages" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [stats.messages, " messages"] })] })] }) }) }), _jsx(Link, { to: "/journal", children: _jsx(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", children: _jsxs(CardContent, { className: "flex items-center p-4", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4", children: _jsx(BookOpen, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold", children: "Journal" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [stats.journals, " entries"] })] })] }) }) }), _jsx(Link, { to: "/memories", children: _jsx(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", children: _jsxs(CardContent, { className: "flex items-center p-4", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4", children: _jsx(ImageIcon, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold", children: "Memories" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [stats.memories, " photos"] })] })] }) }) })] })] }), _jsx(Navigation, {})] }));
}
