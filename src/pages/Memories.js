import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useSpace } from "@/contexts/SpaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/Integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
export default function Memories() {
    const { user } = useAuth();
    const { spaceId } = useSpace();
    const [memories, setMemories] = useState([]);
    const [caption, setCaption] = useState("");
    const [file, setFile] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!spaceId)
            return;
        const fetchMemories = async () => {
            const { data, error } = await supabase
                .from("memories")
                .select("*, profiles(name)")
                .eq("space_id", spaceId)
                .order("created_at", { ascending: false });
            if (error) {
                console.error("Error fetching memories:", error);
                return;
            }
            setMemories(data || []);
        };
        fetchMemories();
        const channel = supabase
            .channel(`memories:${spaceId}`)
            .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "memories",
            filter: `space_id=eq.${spaceId}`,
        }, () => {
            fetchMemories();
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [spaceId]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !spaceId || !user)
            return;
        setLoading(true);
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${spaceId}_${user.id}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from("memories")
                .upload(fileName, file);
            if (uploadError)
                throw uploadError;
            const { data: { publicUrl }, } = supabase.storage.from("memories").getPublicUrl(fileName);
            const { error: dbError } = await supabase.from("memories").insert({
                space_id: spaceId,
                uploader_id: user.id,
                file_url: publicUrl,
                caption: caption || null,
            });
            if (dbError)
                throw dbError;
            setCaption("");
            setFile(null);
            setIsOpen(false);
            toast.success("Memory added!");
        }
        catch {
            toast.error("Failed to upload memory");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen pb-20 bg-gradient-to-br from-background via-background to-secondary/20", children: [_jsxs("div", { className: "max-w-md mx-auto p-4 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between py-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Memory Board" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Your special moments" })] }), _jsxs(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { size: "icon", className: "rounded-full h-14 w-14 shadow-lg", children: _jsx(Plus, { className: "h-6 w-6" }) }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Add Memory" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "file", children: "Photo" }), _jsxs("div", { className: "mt-2", children: [_jsx("label", { htmlFor: "file", className: "flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors", children: file ? (_jsx("span", { className: "text-sm", children: file.name })) : (_jsxs("div", { className: "text-center", children: [_jsx(Upload, { className: "mx-auto h-8 w-8 text-muted-foreground mb-2" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "Click to upload" })] })) }), _jsx("input", { id: "file", type: "file", accept: "image/*", onChange: (e) => setFile(e.target.files?.[0] || null), className: "hidden", required: true })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "caption", children: "Caption (optional)" }), _jsx(Input, { id: "caption", value: caption, onChange: (e) => setCaption(e.target.value), placeholder: "Add a caption..." })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading || !file, children: loading ? "Uploading..." : "Add Memory" })] })] })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: memories.length === 0 ? (_jsx("div", { className: "col-span-2 text-center py-12 text-muted-foreground", children: "No memories yet. Start creating!" })) : (memories.map((memory) => (_jsxs("div", { className: "group relative aspect-square rounded-lg overflow-hidden shadow-lg", children: [_jsx("img", { src: memory.file_url, alt: memory.caption || "Memory", className: "w-full h-full object-cover transition-transform group-hover:scale-110" }), memory.caption && (_jsxs("div", { className: "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3", children: [_jsx("p", { className: "text-white text-sm", children: memory.caption }), _jsx("p", { className: "text-white/70 text-xs mt-1", children: format(new Date(memory.created_at), "MMM d, yyyy") })] }))] }, memory.id)))) })] }), _jsx(Navigation, {})] }));
}
