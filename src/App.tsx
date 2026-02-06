import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { TripProvider } from "@/context/TripContext";
import { SocialProvider } from "@/context/SocialContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import FeedPage from "./pages/FeedPage";
import MapPage from "./pages/MapPage";
import TripsPage from "./pages/TripsPage";
import AchievementsPage from "./pages/AchievementsPage";
import ProfilePage from "./pages/ProfilePage";
import ActiveTripPage from "./pages/ActiveTripPage";
import TripDetailPage from "./pages/TripDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import FollowersPage from "./pages/FollowersPage";
import WrappedPage from "./pages/WrappedPage";
import PricingPage from "./pages/PricingPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AuthPage from "./pages/AuthPage";
import InstallPage from "./pages/InstallPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <TripProvider>
            <SocialProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen bg-background">
                  <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
                    <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
                    <Route path="/trips" element={<ProtectedRoute><TripsPage /></ProtectedRoute>} />
                    <Route path="/trip/active" element={<ProtectedRoute><ActiveTripPage /></ProtectedRoute>} />
                    <Route path="/trip/:id" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />
                    <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/user/:id" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                    <Route path="/friends" element={<ProtectedRoute><FollowersPage /></ProtectedRoute>} />
                    <Route path="/wrapped" element={<ProtectedRoute><WrappedPage /></ProtectedRoute>} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                    <Route path="/install" element={<InstallPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <BottomNav />
                </div>
              </BrowserRouter>
            </SocialProvider>
          </TripProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
