import { lazy, Suspense } from "react";
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
const MapPage = lazy(() => import("./pages/MapPage"));
const TripsPage = lazy(() => import("./pages/TripsPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ActiveTripPage = lazy(() => import("./pages/ActiveTripPage"));
const TripDetailPage = lazy(() => import("./pages/TripDetailPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const FollowersPage = lazy(() => import("./pages/FollowersPage"));
const WrappedPage = lazy(() => import("./pages/WrappedPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
import AuthPage from "./pages/AuthPage";
const InstallPage = lazy(() => import("./pages/InstallPage"));
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

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
                  <Suspense fallback={<PageLoading />}>
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
                  </Suspense>
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
