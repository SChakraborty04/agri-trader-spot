import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register, verifyOtp, resendOtp, getProfile, getAuthToken, clearAuthToken, AuthUser } from "@/lib/api";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";

type AuthStep = "idle" | "register" | "otp";

export function AuthWidget() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [step, setStep] = useState<AuthStep>("idle");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");

  // Check for existing session on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      getProfile()
        .then(setUser)
        .catch(() => clearAuthToken());
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter name and email");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim());
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
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
        resetForm();
      }
    } catch (err: any) {
      toast.error(err?.message || "Verification failed");
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
    setOtp("");
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {user.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-9 w-9 rounded-xl"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setStep("register")}
        className="rounded-xl h-9 px-3"
      >
        <User className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Login</span>
      </Button>

      <Dialog open={step !== "idle"} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {step === "register" ? "Register / Login" : "Verify OTP"}
            </DialogTitle>
          </DialogHeader>

          {step === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
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
