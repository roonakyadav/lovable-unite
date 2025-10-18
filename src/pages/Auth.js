import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { Navigate } from "react-router-dom";
export default function Auth() {
    const { user, signUp, signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [signUpData, setSignUpData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [signInData, setSignInData] = useState({
        email: "",
        password: "",
    });
    if (user) {
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await signUp(signUpData.email, signUpData.password, signUpData.name);
            if (error) {
                toast.error(error.message || "Failed to sign up");
            }
            else {
                toast.success("Welcome to Unite!");
            }
        }
        catch (error) {
            toast.error(error.message || "An error occurred");
        }
        finally {
            setLoading(false);
        }
    };
    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await signIn(signInData.email, signInData.password);
            if (error) {
                toast.error(error.message || "Failed to sign in");
            }
            else {
                toast.success("Welcome back!");
            }
        }
        catch (error) {
            toast.error(error.message || "An error occurred");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 mb-4", children: _jsx(Heart, { className: "w-10 h-10 text-primary-foreground fill-current" }) }), _jsx("h1", { className: "text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent", children: "Unite" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Your private space to stay close, no matter the distance" })] }), _jsxs(Card, { className: "shadow-xl", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Welcome" }), _jsx(CardDescription, { children: "Sign in or create an account to get started" })] }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "signin", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "signin", children: "Sign In" }), _jsx(TabsTrigger, { value: "signup", children: "Sign Up" })] }), _jsx(TabsContent, { value: "signin", children: _jsxs("form", { onSubmit: handleSignIn, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "signin-email", children: "Email" }), _jsx(Input, { id: "signin-email", type: "email", value: signInData.email, onChange: (e) => setSignInData({ ...signInData, email: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signin-password", children: "Password" }), _jsx(Input, { id: "signin-password", type: "password", value: signInData.password, onChange: (e) => setSignInData({ ...signInData, password: e.target.value }), required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Signing in..." : "Sign In" })] }) }), _jsx(TabsContent, { value: "signup", children: _jsxs("form", { onSubmit: handleSignUp, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-name", children: "Name" }), _jsx(Input, { id: "signup-name", type: "text", value: signUpData.name, onChange: (e) => setSignUpData({ ...signUpData, name: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-email", children: "Email" }), _jsx(Input, { id: "signup-email", type: "email", value: signUpData.email, onChange: (e) => setSignUpData({ ...signUpData, email: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-password", children: "Password" }), _jsx(Input, { id: "signup-password", type: "password", value: signUpData.password, onChange: (e) => setSignUpData({ ...signUpData, password: e.target.value }), required: true, minLength: 6 })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Creating account..." : "Create Account" })] }) })] }) })] })] }) }));
}
