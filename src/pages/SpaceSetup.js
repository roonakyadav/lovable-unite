import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/Integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Heart, Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
export default function SpaceSetup() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [spaceName, setSpaceName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [createdCode, setCreatedCode] = useState("");
    const [copied, setCopied] = useState(false);
    const generateCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    };
    const handleCreateSpace = async (e) => {
        e.preventDefault();
        if (!user)
            return;
        setLoading(true);
        try {
            const code = generateCode();
            const { data: spaceData, error: spaceError } = await supabase
                .from("spaces")
                .insert({
                name: spaceName,
                join_code: code,
            })
                .select()
                .single();
            if (spaceError)
                throw spaceError;
            const { error: memberError } = await supabase
                .from("space_members")
                .insert({
                space_id: spaceData.id,
                user_id: user.id,
                role: "creator",
            });
            if (memberError)
                throw memberError;
            setCreatedCode(code);
            toast.success("Space created! Share the code with your partner.");
        }
        catch (error) {
            toast.error(error.message || "Failed to create space");
        }
        finally {
            setLoading(false);
        }
    };
    const handleJoinSpace = async (e) => {
        e.preventDefault();
        if (!user)
            return;
        setLoading(true);
        try {
            const { data: spaceData, error: spaceError } = await supabase
                .from("spaces")
                .select("id")
                .eq("join_code", joinCode.toUpperCase())
                .single();
            if (spaceError)
                throw new Error("Invalid join code");
            const { error: memberError } = await supabase
                .from("space_members")
                .insert({
                space_id: spaceData.id,
                user_id: user.id,
                role: "member",
            });
            if (memberError)
                throw memberError;
            toast.success("Successfully joined the space!");
            navigate("/dashboard");
        }
        catch (error) {
            toast.error(error.message || "Failed to join space");
        }
        finally {
            setLoading(false);
        }
    };
    const copyToClipboard = () => {
        navigator.clipboard.writeText(createdCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Code copied to clipboard!");
    };
    if (createdCode) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20", children: _jsxs(Card, { className: "w-full max-w-md shadow-xl", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg mb-4 mx-auto", children: _jsx(Heart, { className: "w-8 h-8 text-primary-foreground fill-current" }) }), _jsx(CardTitle, { children: "Space Created!" }), _jsx(CardDescription, { children: "Share this code with your partner" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "p-6 bg-secondary rounded-lg text-center", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "Join Code" }), _jsx("p", { className: "text-4xl font-bold tracking-wider text-primary", children: createdCode })] }), _jsx(Button, { onClick: copyToClipboard, variant: "outline", className: "w-full", children: copied ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "mr-2 h-4 w-4" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Copy Code"] })) }), _jsx(Button, { onClick: () => navigate("/dashboard"), className: "w-full", children: "Continue to Dashboard" })] })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20", children: _jsxs(Card, { className: "w-full max-w-md shadow-xl", children: [_jsxs(CardHeader, { children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg mb-4", children: _jsx(Heart, { className: "w-8 h-8 text-primary-foreground fill-current" }) }), _jsx(CardTitle, { children: "Create Your Couple Space" }), _jsx(CardDescription, { children: "Start your journey together by creating or joining a space" })] }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "create", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "create", children: "Create Space" }), _jsx(TabsTrigger, { value: "join", children: "Join Space" })] }), _jsx(TabsContent, { value: "create", children: _jsxs("form", { onSubmit: handleCreateSpace, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "space-name", children: "Space Name" }), _jsx(Input, { id: "space-name", placeholder: "Our Love Story", value: spaceName, onChange: (e) => setSpaceName(e.target.value), required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Creating..." : "Create Space" })] }) }), _jsx(TabsContent, { value: "join", children: _jsxs("form", { onSubmit: handleJoinSpace, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "join-code", children: "Join Code" }), _jsx(Input, { id: "join-code", placeholder: "Enter 6-digit code", value: joinCode, onChange: (e) => setJoinCode(e.target.value.toUpperCase()), maxLength: 6, required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Joining..." : "Join Space" })] }) })] }) })] }) }));
}
