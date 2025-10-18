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
        return <Navigate to="/dashboard" replace />;
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await signUp(signUpData.email, signUpData.password, signUpData.name);
            if (error) {
                toast.error(error.message || "Failed to sign up");
            } else {
                toast.success("Welcome to Unite!");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await signIn(signInData.email, signInData.password);
            if (error) {
                toast.error(error.message || "Failed to sign in");
            } else {
                toast.success("Welcome back!");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 mb-4">
                        <Heart className="w-10 h-10 text-primary-foreground fill-current" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Unite
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Your private space to stay close, no matter the distance
                    </p>
                </div>

                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle>Welcome</CardTitle>
                        <CardDescription>Sign in or create an account to get started</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="signin">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="signin">Sign In</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="signin">
                                <form onSubmit={handleSignIn} className="space-y-4">
                                    <div>
                                        <Label htmlFor="signin-email">Email</Label>
                                        <Input
                                            id="signin-email"
                                            type="email"
                                            value={signInData.email}
                                            onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="signin-password">Password</Label>
                                        <Input
                                            id="signin-password"
                                            type="password"
                                            value={signInData.password}
                                            onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup">
                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div>
                                        <Label htmlFor="signup-name">Name</Label>
                                        <Input
                                            id="signup-name"
                                            type="text"
                                            value={signUpData.name}
                                            onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            value={signUpData.email}
                                            onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            value={signUpData.password}
                                            onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Creating account..." : "Create Account"}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
