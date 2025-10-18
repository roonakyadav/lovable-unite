import { useEffect, useState } from "react"
import { useSpace } from "@/contexts/SpaceContext"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/Integrations/supabase/client"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Upload } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Memory {
    id: string
    file_url: string
    caption: string | null
    created_at: string
    profiles?: { name: string }
}

export default function Memories() {
    const { user } = useAuth()
    const { spaceId } = useSpace()
    const [memories, setMemories] = useState<Memory[]>([])
    const [caption, setCaption] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!spaceId) return

        const fetchMemories = async () => {
            const { data, error } = await supabase
                .from("memories")
                .select("*, profiles(name)")
                .eq("space_id", spaceId)
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching memories:", error)
                return
            }

            setMemories(data || [])
        }

        fetchMemories()

        const channel = supabase
            .channel(`memories:${spaceId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "memories",
                    filter: `space_id=eq.${spaceId}`,
                },
                () => {
                    fetchMemories()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [spaceId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !spaceId || !user) return

        setLoading(true)
        try {
            const fileExt = file.name.split(".").pop()
            const fileName = `${spaceId}_${user.id}_${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from("memories")
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const {
                data: { publicUrl },
            } = supabase.storage.from("memories").getPublicUrl(fileName)

            const { error: dbError } = await supabase.from("memories").insert({
                space_id: spaceId,
                uploader_id: user.id,
                file_url: publicUrl,
                caption: caption || null,
            })

            if (dbError) throw dbError

            setCaption("")
            setFile(null)
            setIsOpen(false)
            toast.success("Memory added!")
        } catch {
            toast.error("Failed to upload memory")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen pb-20 bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="flex items-center justify-between py-6">
                    <div>
                        <h1 className="text-3xl font-bold">Memory Board</h1>
                        <p className="text-muted-foreground mt-1">Your special moments</p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
                                <Plus className="h-6 w-6" />
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Memory</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="file">Photo</Label>
                                    <div className="mt-2">
                                        <label
                                            htmlFor="file"
                                            className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                                        >
                                            {file ? (
                                                <span className="text-sm">{file.name}</span>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                                    <span className="text-sm text-muted-foreground">
                                                        Click to upload
                                                    </span>
                                                </div>
                                            )}
                                        </label>
                                        <input
                                            id="file"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="caption">Caption (optional)</Label>
                                    <Input
                                        id="caption"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Add a caption..."
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading || !file}
                                >
                                    {loading ? "Uploading..." : "Add Memory"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {memories.length === 0 ? (
                        <div className="col-span-2 text-center py-12 text-muted-foreground">
                            No memories yet. Start creating!
                        </div>
                    ) : (
                        memories.map((memory) => (
                            <div
                                key={memory.id}
                                className="group relative aspect-square rounded-lg overflow-hidden shadow-lg"
                            >
                                <img
                                    src={memory.file_url}
                                    alt={memory.caption || "Memory"}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                                {memory.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                        <p className="text-white text-sm">{memory.caption}</p>
                                        <p className="text-white/70 text-xs mt-1">
                                            {format(new Date(memory.created_at), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Navigation />
        </div>
    )
}
