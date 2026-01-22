import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { TripProvider } from "@/context/TripContext";
import { SocialProvider } from "@/context/SocialContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SubscriptionProvider>
        <TripProvider>
          <SocialProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<FeedPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/trips" element={<TripsPage />} />
                  <Route path="/trip/active" element={<ActiveTripPage />} />
                  <Route path="/trip/:id" element={<TripDetailPage />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/user/:id" element={<UserProfilePage />} />
                  <Route path="/friends" element={<FollowersPage />} />
                  <Route path="/wrapped" element={<WrappedPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <BottomNav />
              </div>
            </BrowserRouter>
          </SocialProvider>
        </TripProvider>
      </SubscriptionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
