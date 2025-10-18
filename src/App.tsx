import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SpaceProvider } from "./contexts/SpaceContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import SpaceSetup from "./pages/SpaceSetup";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Mood from "./pages/Mood";
import Journal from "./pages/Journal";
import Memories from "./pages/Memories";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <AuthProvider>
                    <SpaceProvider>
                        <Routes>
                            <Route path="/" element={<Navigate to="/auth" replace />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route
                                path="/space-setup"
                                element={
                                    <ProtectedRoute>
                                        <SpaceSetup />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/chat"
                                element={
                                    <ProtectedRoute>
                                        <Chat />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/mood"
                                element={
                                    <ProtectedRoute>
                                        <Mood />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/journal"
                                element={
                                    <ProtectedRoute>
                                        <Journal />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/memories"
                                element={
                                    <ProtectedRoute>
                                        <Memories />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <Settings />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </SpaceProvider>
                </AuthProvider>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
