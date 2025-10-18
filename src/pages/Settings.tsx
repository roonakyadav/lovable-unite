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

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ name })
                .eq("id", user.id);

            if (error) throw error;

            toast.success("Profile updated!");
            setName("");
        } catch (error: any) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 bg-gradient-to-br from-background via-background to-secondary20">
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="text-center py-6">
                    <h1 className="text-3xl font-bold">Settings</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-primary" />
                            Your Space
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Space Name</p>
                            <p className="font-medium">{spaceName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Partner</p>
                            <p className="font-medium">{partnerName || "No partner yet"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={user?.email || ""} disabled />
                            </div>
                            <div>
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter new name"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
                                {loading ? "Updating..." : "Update Name"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Button
                            onClick={signOut}
                            variant="destructive"
                            className="w-full"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Navigation />
        </div>
    );
}
