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

interface JournalEntry {
    id: string;
    content: string;
    author_id: string;
    created_at: string;
    profiles?: { name: string };
}

export default function Journal() {
    const { user } = useAuth();
    const { spaceId } = useSpace();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [newEntry, setNewEntry] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!spaceId) return;

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
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "journal_entries",
                    filter: `space_id=eq.${spaceId}`,
                },
                () => {
                    fetchEntries();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [spaceId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntry.trim() || !spaceId || !user) return;

        setLoading(true);
        try {
            const { error } = await supabase.from("journal_entries").insert({
                space_id: spaceId,
                author_id: user.id,
                content: newEntry,
            });

            if (error) throw error;

            setNewEntry("");
            setIsOpen(false);
            toast.success("Journal entry added!");
        } catch (error: any) {
            toast.error("Failed to add entry");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center justify-between py-6">
                    <div>
                        <h1 className="text-3xl font-bold">Shared Journal</h1>
                        <p className="text-muted-foreground mt-1">Your story together</p>

                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
                                <Plus className="h-6 w-6" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>New Journal Entry</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Textarea
                                    value={newEntry}
                                    onChange={(e) => setNewEntry(e.target.value)}
                                    placeholder="Write your thoughts..."
                                    rows={6}
                                    required
                                />
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Adding..." : "Add Entry"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-4">
                    {entries.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <p className="text-muted-foreground">
                                    No journal entries yet. Start writing!
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        entries.map((entry) => (
                            <Card key={entry.id} className="overflow-hidden">
                                <CardHeader className="bg-secondary/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">
                                            {(entry.profiles as any)?.name || "Unknown"}
                                        </CardTitle>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(entry.created_at), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="whitespace-pre-wrap">{entry.content}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <Navigation />
        </div>
    );
}
