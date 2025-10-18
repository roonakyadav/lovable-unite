import { useEffect, useState } from "react"
import { useSpace } from "@/contexts/SpaceContext"
import { supabase } from "@/Integrations/supabase/client"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Heart,
    MessageCircle,
    BookOpen,
    Image as ImageIcon,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function Dashboard() {
    const { user } = useAuth()
    const { spaceId, spaceName, partnerName, loading } = useSpace()
    const [stats, setStats] = useState({
        messages: 0,
        journals: 0,
        memories: 0,
        myMood: null as string | null,
        partnerMood: null as string | null,
    })

    useEffect(() => {
        if (!spaceId || !user) return

        const fetchStats = async () => {
            const [
                messagesRes,
                journalsRes,
                memoriesRes,
                myMoodRes,
                partnerMoodRes,
            ] = await Promise.all([
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
            ])

            setStats({
                messages: messagesRes.count || 0,
                journals: journalsRes.count || 0,
                memories: memoriesRes.count || 0,
                myMood: myMoodRes.data?.mood_value || null,
                partnerMood: partnerMoodRes.data?.mood_value || null,
            })
        }

        fetchStats()
    }, [spaceId, user])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        )
    }

    if (!spaceId) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>No Space Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            You need to create or join a couple space first.
                        </p>
                        <Link
                            to="/space-setup"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2"
                        >
                            Setup Space
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20 bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg mb-4">
                        <Heart className="w-8 h-8 text-primary-foreground fill-current" />
                    </div>
                    <h1 className="text-3xl font-bold">{spaceName}</h1>
                    <p className="text-muted-foreground mt-1">
                        {partnerName ? `You & ${partnerName}` : "Waiting for partner..."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-card to-secondary/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-4xl mb-2">{stats.myMood || "😊"}</div>
                            <p className="text-sm text-muted-foreground">Your Mood</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-card to-secondary/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-4xl mb-2">{stats.partnerMood || "❤️"}</div>
                            <p className="text-sm text-muted-foreground">Partner's Mood</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-3">
                    <Link to="/chat">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="flex items-center p-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                    <MessageCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Messages</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {stats.messages} messages
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/journal">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="flex items-center p-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Journal</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {stats.journals} entries
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/memories">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="flex items-center p-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                    <ImageIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Memories</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {stats.memories} photos
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>

            <Navigation />
        </div>
    )
}
