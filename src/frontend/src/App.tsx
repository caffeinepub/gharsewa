import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Role } from "./backend.d";
import type { UserProfile } from "./backend.d";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import CustomerDashboard from "./pages/CustomerDashboard";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProviderDashboard from "./pages/ProviderDashboard";

type AppView = "landing" | "onboarding" | "customer" | "provider" | "loading";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [view, setView] = useState<AppView>("loading");

  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  useEffect(() => {
    if (isInitializing) {
      setView("loading");
      return;
    }
    if (!identity) {
      setView("landing");
      return;
    }
    if (isFetching || profileQuery.isLoading) {
      setView("loading");
      return;
    }
    const profile = profileQuery.data;
    if (!profile) {
      setView("onboarding");
      return;
    }
    if (profile.role === Role.customer) {
      setView("customer");
    } else {
      setView("provider");
    }
  }, [
    identity,
    isInitializing,
    isFetching,
    profileQuery.data,
    profileQuery.isLoading,
  ]);

  const handleProfileSaved = (profile: UserProfile) => {
    if (profile.role === Role.customer) {
      setView("customer");
    } else {
      setView("provider");
    }
  };

  if (view === "loading") {
    return (
      <div className="min-h-screen pattern-bg flex items-center justify-center">
        <div className="text-center" data-ocid="app.loading_state">
          <div className="w-16 h-16 rounded-2xl terracotta-gradient flex items-center justify-center mx-auto mb-4 shadow-card">
            <span className="text-2xl">🏠</span>
          </div>
          <p className="text-muted-foreground font-medium">
            Loading GharSewa...
          </p>
          <div className="mt-3 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-terracotta animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      {view === "landing" && <LandingPage />}
      {view === "onboarding" && (
        <OnboardingPage onProfileSaved={handleProfileSaved} />
      )}
      {view === "customer" && (
        <CustomerDashboard onLogout={() => setView("landing")} />
      )}
      {view === "provider" && (
        <ProviderDashboard onLogout={() => setView("landing")} />
      )}
    </>
  );
}
