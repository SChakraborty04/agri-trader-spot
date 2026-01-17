import { useState, useEffect, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register, verifyOtp, resendOtp, getProfile, getAuthToken, clearAuthToken, AuthUser, FPOOfferAPI } from "@/lib/api";
import { User, LogOut, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { getAuthDialogState, subscribeAuthDialog, closeAuthDialog, getPendingOffer, clearPendingOffer } from "@/hooks/useAuthDialog";
import { QuoteFormDialog } from "./QuoteFormDialog";

type AuthMode = "login" | "register";
type AuthStep = "idle" | "form" | "otp";

export function AuthWidget() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<AuthStep>("idle");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  // Quote form state for post-login flow
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [pendingQuoteOffer, setPendingQuoteOffer] = useState<FPOOfferAPI | null>(null);

  // Subscribe to global auth dialog state
  const externalState = useSyncExternalStore(subscribeAuthDialog, getAuthDialogState);
  
  // Sync external open requests to local state
  useEffect(() => {
    if (externalState.isOpen && step === "idle") {
      setMode(externalState.mode);
      setStep("form");
    }
  }, [externalState.isOpen, externalState.mode, step]);

  // Check for existing session on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      getProfile()
        .then(setUser)
        .catch(() => clearAuthToken());
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter email");
      return;
    }
    if (mode === "register" && !name.trim()) {
      toast.error("Please enter name");
      return;
    }
    if (mode === "register" && !phone.trim()) {
      toast.error("Please enter phone number");
      return;
    }
    setLoading(true);
    try {
      await register(mode === "register" ? name.trim() : "User", email.trim(), mode === "register" ? phone.trim() : undefined);
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(email, otp.trim());
      if (res.user) {
        setUser(res.user);
        toast.success("Logged in successfully");
        
        // Check for pending offer and open quote dialog
        const offer = getPendingOffer();
        if (offer) {
          setPendingQuoteOffer(offer);
          clearPendingOffer();
          // Small delay to ensure auth state is updated
          setTimeout(() => setQuoteDialogOpen(true), 100);
        }
        
        resetForm();
      }
    } catch (err: any) {
      toast.error("Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await resendOtp(email);
      toast.success("OTP resent");
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    toast.success("Logged out");
  };

  const resetForm = () => {
    setStep("idle");
    setEmail("");
    setName("");
    setPhone("");
    setOtp("");
    closeAuthDialog();
  };

  const openDialog = (authMode: AuthMode) => {
    setMode(authMode);
    setStep("form");
  };

  if (user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
            className="rounded-xl h-9 px-3"
          >
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{user.name}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-9 w-9 rounded-xl"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quote dialog for post-login flow */}
        {pendingQuoteOffer && (
          <QuoteFormDialog
            open={quoteDialogOpen}
            onOpenChange={(open) => {
              setQuoteDialogOpen(open);
              if (!open) setPendingQuoteOffer(null);
            }}
            offer={pendingQuoteOffer}
            onQuoteGenerated={() => {
              setQuoteDialogOpen(false);
              setPendingQuoteOffer(null);
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openDialog("login")}
          className="rounded-xl h-9 px-3"
        >
          <User className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Login</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openDialog("register")}
          className="rounded-xl h-9 px-3"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Register</span>
        </Button>
      </div>

      <Dialog open={step !== "idle"} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {step === "otp" ? "Verify OTP" : mode === "register" ? "Register" : "Login"}
            </DialogTitle>
          </DialogHeader>

          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="h-11 rounded-xl"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                      className="h-11 rounded-xl"
                      disabled={loading}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 rounded-xl"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Continue"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {mode === "register" ? (
                  <>Already have an account? <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline">Login</button></>
                ) : (
                  <>New here? <button type="button" onClick={() => setMode("register")} className="text-primary hover:underline">Register</button></>
                )}
              </p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the OTP sent to <span className="font-medium text-foreground">{email}</span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="h-11 rounded-xl text-center text-lg tracking-widest"
                  maxLength={6}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendOtp}
                disabled={loading}
              >
                Resend OTP
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}