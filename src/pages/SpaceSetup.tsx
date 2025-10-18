import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/Integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"
import { Heart, Copy, Check } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function SpaceSetup() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [spaceName, setSpaceName] = useState("")
    const [joinCode, setJoinCode] = useState("")
    const [createdCode, setCreatedCode] = useState("")
    const [copied, setCopied] = useState(false)

    const generateCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        let code = ""
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)]
        }
        return code
    }

    const handleCreateSpace = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            const code = generateCode()

            const { data: spaceData, error: spaceError } = await supabase
                .from("spaces")
                .insert({
                    name: spaceName,
                    join_code: code,
                })
                .select()
                .single()

            if (spaceError) throw spaceError

            const { error: memberError } = await supabase
                .from("space_members")
                .insert({
                    space_id: spaceData.id,
                    user_id: user.id,
                    role: "creator",
                })

            if (memberError) throw memberError

            setCreatedCode(code)
            toast.success("Space created! Share the code with your partner.")
        } catch (error: any) {
            toast.error(error.message || "Failed to create space")
        } finally {
            setLoading(false)
        }
    }

    const handleJoinSpace = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            const { data: spaceData, error: spaceError } = await supabase
                .from("spaces")
                .select("id")
                .eq("join_code", joinCode.toUpperCase())
                .single()

            if (spaceError) throw new Error("Invalid join code")

            const { error: memberError } = await supabase
                .from("space_members")
                .insert({
                    space_id: spaceData.id,
                    user_id: user.id,
                    role: "member",
                })

            if (memberError) throw memberError

            toast.success("Successfully joined the space!")
            navigate("/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Failed to join space")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(createdCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success("Code copied to clipboard!")
    }

    if (createdCode) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg mb-4 mx-auto">
                            <Heart className="w-8 h-8 text-primary-foreground fill-current" />
                        </div>
                        <CardTitle>Space Created!</CardTitle>
                        <CardDescription>Share this code with your partner</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="p-6 bg-secondary rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">Join Code</p>
                            <p className="text-4xl font-bold tracking-wider text-primary">
                                {createdCode}
                            </p>
                        </div>

                        <Button onClick={copyToClipboard} variant="outline" className="w-full">
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Code
                                </>
                            )}
                        </Button>

                        <Button onClick={() => navigate("/dashboard")} className="w-full">
                            Continue to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg mb-4">
                        <Heart className="w-8 h-8 text-primary-foreground fill-current" />
                    </div>
                    <CardTitle>Create Your Couple Space</CardTitle>
                    <CardDescription>
                        Start your journey together by creating or joining a space
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="create">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="create">Create Space</TabsTrigger>
                            <TabsTrigger value="join">Join Space</TabsTrigger>
                        </TabsList>

                        <TabsContent value="create">
                            <form onSubmit={handleCreateSpace} className="space-y-4">
                                <div>
                                    <Label htmlFor="space-name">Space Name</Label>
                                    <Input
                                        id="space-name"
                                        placeholder="Our Love Story"
                                        value={spaceName}
                                        onChange={(e) => setSpaceName(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Creating..." : "Create Space"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="join">
                            <form onSubmit={handleJoinSpace} className="space-y-4">
                                <div>
                                    <Label htmlFor="join-code">Join Code</Label>
                                    <Input
                                        id="join-code"
                                        placeholder="Enter 6-digit code"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Joining..." : "Join Space"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
