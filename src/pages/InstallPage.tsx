import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4 space-y-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">App Installed!</h1>
            <p className="text-muted-foreground">
              RV Nomad is installed and ready to use
            </p>
          </div>

          <Button onClick={() => navigate("/")} className="w-full" size="lg">
            Open App
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🚐</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Install RV Nomad</h1>
          <p className="text-muted-foreground">
            Add to your home screen for the best experience
          </p>
        </div>

        {/* Benefits */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Why Install?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Works offline - track trips without internet",
              "Faster loading - instant app startup",
              "Full screen experience - no browser bars",
              "Home screen icon - easy access anytime",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Install Button or Instructions */}
        {deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full" size="lg">
            <Download className="w-5 h-5 mr-2" />
            Install App
          </Button>
        ) : isIOS ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Install on iPhone/iPad
              </CardTitle>
              <CardDescription>Follow these steps:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">1</span>
                  <p className="text-sm text-muted-foreground">
                    Tap the <strong>Share</strong> button in Safari (square with arrow)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">2</span>
                  <p className="text-sm text-muted-foreground">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">3</span>
                  <p className="text-sm text-muted-foreground">
                    Tap <strong>"Add"</strong> to confirm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Install on Desktop/Android
              </CardTitle>
              <CardDescription>Follow these steps:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">1</span>
                  <p className="text-sm text-muted-foreground">
                    Look for the <strong>install icon</strong> in your browser's address bar (or menu)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">2</span>
                  <p className="text-sm text-muted-foreground">
                    Click <strong>"Install"</strong> or <strong>"Add to Home Screen"</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="w-full"
        >
          Continue in Browser
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default InstallPage;
