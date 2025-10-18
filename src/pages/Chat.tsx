import { useEffect, useState, useRef } from "react"
import { useSpace } from "@/contexts/SpaceContext"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/Integrations/supabase/client"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Message {
    id: string
    body: string
    sender_id: string
    created_at: string
    attachments?: any
}

export default function Chat() {
    const { user } = useAuth()
    const { spaceId, partnerName } = useSpace()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (!spaceId) return

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("space_id", spaceId)
                .order("created_at", { ascending: true })

            if (error) {
                console.error("Error fetching messages:", error)
                return
            }

            setMessages(data || [])
            setTimeout(scrollToBottom, 100)
        }

        fetchMessages()

        const channel = supabase
            .channel(`messages:${spaceId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `space_id=eq.${spaceId}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message])
                    setTimeout(scrollToBottom, 100)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [spaceId])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !spaceId || !user) return

        setLoading(true)
        try {
            const { error } = await supabase.from("messages").insert({
                space_id: spaceId,
                sender_id: user.id,
                body: newMessage.trim(),
            })

            if (error) throw error

            setNewMessage("")
        } catch {
            toast.error("Failed to send message")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-background">
            <div className="bg-card border-b border-border p-4">
                <h1 className="text-xl font-bold text-center">
                    {partnerName || "Chat"}
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 ${message.sender_id === user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                                }`}
                        >
                            <p className="break-words">{message.body}</p>
                            <p
                                className={`text-xs mt-1 ${message.sender_id === user?.id
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                {format(new Date(message.created_at), "HH:mm")}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-border p-4">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={loading}
                    />
                    <Button type="submit" size="icon" disabled={loading || !newMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>

            <Navigation />
        </div>
    )
}
