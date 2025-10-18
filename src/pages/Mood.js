import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useSpace } from "@/contexts/SpaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/Integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
const moods = [
    { emoji: "😊", label: "Happy", value: "happy" },
    { emoji: "😍", label: "In Love", value: "in_love" },
    { emoji: "😔", label: "Sad", value: "sad" },
    { emoji: "😴", label: "Tired", value: "tired" },
    { emoji: "🥰", label: "Loving", value: "loving" },
    { emoji: "😤", label: "Frustrated", value: "frustrated" },
    { emoji: "😌", label: "Peaceful", value: "peaceful" },
    { emoji: "🤗", label: "Excited", value: "excited" },
];
export default function Mood() {
    const { user } = useAuth();
    const { spaceId, partnerId } = useSpace();
    const [selectedMood, setSelectedMood] = useState(null);
    const [history, setHistory] = useState([]);
    const [partnerHistory, setPartnerHistory] = useState([]);
    useEffect(() => {
        if (!spaceId || !user)
            return;
        const fetchMoodHistory = async () => {
            const sevenDaysAgo = subDays(new Date(), 7);
            const { data: myMoods } = await supabase
                .from("moods")
                .select("*")
                .eq("space_id", spaceId)
                .eq("user_id", user.id)
                .gte("created_at", sevenDaysAgo.toISOString())
                .order("created_at", { ascending: false });
            const { data: partnerMoods } = await supabase
                .from("moods")
                .select("*")
                .eq("space_id", spaceId)
                .eq("user_id", partnerId)
                .gte("created_at", sevenDaysAgo.toISOString())
                .order("created_at", { ascending: false });
            setHistory(myMoods || []);
            setPartnerHistory(partnerMoods || []);
            if (myMoods && myMoods.length > 0) {
                setSelectedMood(myMoods[0].mood_value);
            }
        };
        fetchMoodHistory();
    }, [spaceId, user, partnerId]);
    const handleMoodSelect = async (moodValue) => {
        if (!spaceId || !user)
            return;
        try {
            const { error } = await supabase.from("moods").insert({
                space_id: spaceId,
                user_id: user.id,
                mood_value: moodValue,
            });
            if (error)
                throw error;
            setSelectedMood(moodValue);
            toast.success("Mood updated!");
            // Refresh history
            const { data } = await supabase
                .from("moods")
                .select("*")
                .eq("space_id", spaceId)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(7);
            setHistory(data || []);
        }
        catch {
            toast.error("Failed to update mood");
        }
    };
    return (_jsxs("div", { className: "min-h-screen pb-20 bg-gradient-to-br from-background via-background to-secondary/20", children: [_jsxs("div", { className: "max-w-md mx-auto p-4 space-y-6", children: [_jsxs("div", { className: "text-center py-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Mood Tracker" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "How are you feeling today?" })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Select Your Mood" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-4 gap-4", children: moods.map((mood) => (_jsxs("button", { onClick: () => handleMoodSelect(mood.value), className: `flex flex-col items-center justify-center p-4 rounded-xl transition-all ${selectedMood === mood.value
                                            ? "bg-primary text-primary-foreground scale-110"
                                            : "bg-secondary hover:bg-secondary/80"}`, children: [_jsx("span", { className: "text-4xl mb-2", children: mood.emoji }), _jsx("span", { className: "text-xs text-center", children: mood.label })] }, mood.value))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Your Mood History (7 Days)" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: history.length === 0 ? (_jsx("p", { className: "text-center text-muted-foreground py-4", children: "No mood entries yet" })) : (history.map((mood) => {
                                        const moodData = moods.find((m) => m.value === mood.mood_value);
                                        return (_jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-3xl", children: moodData?.emoji }), _jsx("span", { className: "font-medium", children: moodData?.label })] }), _jsx("span", { className: "text-sm text-muted-foreground", children: format(new Date(mood.created_at), "MMM d, HH:mm") })] }, mood.created_at));
                                    })) }) })] }), partnerHistory.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Partner's Mood History" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: partnerHistory.map((mood) => {
                                        const moodData = moods.find((m) => m.value === mood.mood_value);
                                        return (_jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-3xl", children: moodData?.emoji }), _jsx("span", { className: "font-medium", children: moodData?.label })] }), _jsx("span", { className: "text-sm text-muted-foreground", children: format(new Date(mood.created_at), "MMM d, HH:mm") })] }, mood.created_at));
                                    }) }) })] }))] }), _jsx(Navigation, {})] }));
}
