import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useSpace } from "@/contexts/SpaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/Integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
export default function Journal() {
    const { user } = useAuth();
    const { spaceId } = useSpace();
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!spaceId)
            return;
        const fetchEntries = async () => {
            const { data, error } = await supabase
                .from("journal_entries")
                .select("*, profiles(name)")
                .eq("space_id", spaceId)
                .order("created_at", { ascending: false });
            if (error) {
                console.error("Error fetching entries:", error);
                return;
            }
            setEntries(data || []);
        };
        fetchEntries();
        const channel = supabase
            .channel(`journal:${spaceId}`)
            .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "journal_entries",
            filter: `space_id=eq.${spaceId}`,
        }, () => {
            fetchEntries();
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [spaceId]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEntry.trim() || !spaceId || !user)
            return;
        setLoading(true);
        try {
            const { error } = await supabase.from("journal_entries").insert({
                space_id: spaceId,
                author_id: user.id,
                content: newEntry,
            });
            if (error)
                throw error;
            setNewEntry("");
            setIsOpen(false);
            toast.success("Journal entry added!");
        }
        catch (error) {
            toast.error("Failed to add entry");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen pb-20 bg-gradient-to-br from-background via-background to-secondary/20", children: [_jsxs("div", { className: "max-w-md mx-auto p-4 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between py-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Shared Journal" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Your story together" })] }), _jsxs(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { size: "icon", className: "rounded-full h-14 w-14 shadow-lg", children: _jsx(Plus, { className: "h-6 w-6" }) }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "New Journal Entry" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Textarea, { value: newEntry, onChange: (e) => setNewEntry(e.target.value), placeholder: "Write your thoughts...", rows: 6, required: true }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Adding..." : "Add Entry" })] })] })] })] }), _jsx("div", { className: "space-y-4", children: entries.length === 0 ? (_jsx(Card, { children: _jsx(CardContent, { className: "text-center py-12", children: _jsx("p", { className: "text-muted-foreground", children: "No journal entries yet. Start writing!" }) }) })) : (entries.map((entry) => (_jsxs(Card, { className: "overflow-hidden", children: [_jsx(CardHeader, { className: "bg-secondary/50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: entry.profiles?.name || "Unknown" }), _jsx("span", { className: "text-xs text-muted-foreground", children: format(new Date(entry.created_at), "MMM d, yyyy") })] }) }), _jsx(CardContent, { className: "pt-4", children: _jsx("p", { className: "whitespace-pre-wrap", children: entry.content }) })] }, entry.id)))) })] }), _jsx(Navigation, {})] }));
}
