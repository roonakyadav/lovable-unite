import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSpace } from "../contexts/SpaceContext";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { LogOut, User, Heart } from "lucide-react";
import { supabase } from "../Integrations/supabase/client";
import { toast } from "sonner";
export default function Settings() {
    const { user, signOut } = useAuth();
    const { spaceName, partnerName } = useSpace();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user || !name.trim())
            return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ name })
                .eq("id", user.id);
            if (error)
                throw error;
            toast.success("Profile updated!");
            setName("");
        }
        catch (error) {
            toast.error("Failed to update profile");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen pb-20 bg-gradient-to-br from-background via-background to-secondary20", children: [_jsxs("div", { className: "max-w-md mx-auto p-4 space-y-6", children: [_jsx("div", { className: "text-center py-6", children: _jsx("h1", { className: "text-3xl font-bold", children: "Settings" }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Heart, { className: "h-5 w-5 text-primary" }), "Your Space"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Space Name" }), _jsx("p", { className: "font-medium", children: spaceName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Partner" }), _jsx("p", { className: "font-medium", children: partnerName || "No partner yet" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-5 w-5 text-primary" }), "Profile"] }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleUpdateProfile, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: user?.email || "", disabled: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Display Name" }), _jsx(Input, { id: "name", type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "Enter new name" })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading || !name.trim(), children: loading ? "Updating..." : "Update Name" })] }) })] }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs(Button, { onClick: signOut, variant: "destructive", className: "w-full", children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), "Sign Out"] }) }) })] }), _jsx(Navigation, {})] }));
}
