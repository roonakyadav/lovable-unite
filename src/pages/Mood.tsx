import { useEffect, useState } from "react"
import { useSpace } from "@/contexts/SpaceContext"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/Integrations/supabase/client"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { format, subDays } from "date-fns"

const moods = [
    { emoji: "😊", label: "Happy", value: "happy" },
    { emoji: "😍", label: "In Love", value: "in_love" },
    { emoji: "😔", label: "Sad", value: "sad" },
    { emoji: "😴", label: "Tired", value: "tired" },
    { emoji: "🥰", label: "Loving", value: "loving" },
    { emoji: "😤", label: "Frustrated", value: "frustrated" },
    { emoji: "😌", label: "Peaceful", value: "peaceful" },
    { emoji: "🤗", label: "Excited", value: "excited" },
]

interface MoodData {
    created_at: string
    mood_value: string
    user_id: string
}

export default function Mood() {
    const { user } = useAuth()
    const { spaceId, partnerId } = useSpace()
    const [selectedMood, setSelectedMood] = useState<string | null>(null)
    const [history, setHistory] = useState<MoodData[]>([])
    const [partnerHistory, setPartnerHistory] = useState<MoodData[]>([])

    useEffect(() => {
        if (!spaceId || !user) return

        const fetchMoodHistory = async () => {
            const sevenDaysAgo = subDays(new Date(), 7)

            const { data: myMoods } = await supabase
                .from("moods")
                .select("*")
                .eq("space_id", spaceId)
                .eq("user_id", user.id)
                .gte("created_at", sevenDaysAgo.toISOString())
                .order("created_at", { ascending: false })

            const { data: partnerMoods } = await supabase
                .from("moods")
                .select("*")
                .eq("space_id", spaceId)
                .eq("user_id", partnerId)
                .gte("created_at", sevenDaysAgo.toISOString())
                .order("created_at", { ascending: false })

            setHistory(myMoods || [])
            setPartnerHistory(partnerMoods || [])

            if (myMoods && myMoods.length > 0) {
                setSelectedMood(myMoods[0].mood_value)
            }
        }

        fetchMoodHistory()
    }, [spaceId, user, partnerId])

    const handleMoodSelect = async (moodValue: string) => {
        if (!spaceId || !user) return

        try {
            const { error } = await supabase.from("moods").insert({
                space_id: spaceId,
                user_id: user.id,
                mood_value: moodValue,
            })

            if (error) throw error

            setSelectedMood(moodValue)
            toast.success("Mood updated!")

            // Refresh history
            const { data } = await supabase
                .from("moods")
                .select("*")
                .eq("space_id", spaceId)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(7)

            setHistory(data || [])
        } catch {
            toast.error("Failed to update mood")
        }
    }

    return (
        <div className="min-h-screen pb-20 bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="text-center py-6">
                    <h1 className="text-3xl font-bold">Mood Tracker</h1>
                    <p className="text-muted-foreground mt-2">How are you feeling today?</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Select Your Mood</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            {moods.map((mood) => (
                                <button
                                    key={mood.value}
                                    onClick={() => handleMoodSelect(mood.value)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${selectedMood === mood.value
                                            ? "bg-primary text-primary-foreground scale-110"
                                            : "bg-secondary hover:bg-secondary/80"
                                        }`}
                                >
                                    <span className="text-4xl mb-2">{mood.emoji}</span>
                                    <span className="text-xs text-center">{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Mood History (7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">
                                    No mood entries yet
                                </p>
                            ) : (
                                history.map((mood) => {
                                    const moodData = moods.find((m) => m.value === mood.mood_value)
                                    return (
                                        <div
                                            key={mood.created_at}
                                            className="flex items-center justify-between py-2"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{moodData?.emoji}</span>
                                                <span className="font-medium">{moodData?.label}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {format(new Date(mood.created_at), "MMM d, HH:mm")}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {partnerHistory.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Partner's Mood History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {partnerHistory.map((mood) => {
                                    const moodData = moods.find((m) => m.value === mood.mood_value)
                                    return (
                                        <div
                                            key={mood.created_at}
                                            className="flex items-center justify-between py-2"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{moodData?.emoji}</span>
                                                <span className="font-medium">{moodData?.label}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {format(new Date(mood.created_at), "MMM d, HH:mm")}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Navigation />
        </div>
    )
}
