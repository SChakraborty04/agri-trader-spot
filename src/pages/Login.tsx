import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await verifyOtp(email, otp);
      setMessage(res.success ? "Logged in successfully!" : "Failed to verify");
      if (res.success) {
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await resendOtp(email);
      setMessage(res.message || "OTP resent successfully");
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 vibrancy border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-secondary/80 press-effect"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md p-8 border border-border/50">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and OTP to access your account
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">OTP</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  maxLength={6}
                  required
                  className="pl-10 h-11 rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="rounded-xl bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <AlertDescription className="text-green-800 dark:text-green-200">{message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 press-effect text-base font-medium"
            >
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </Button>

            <Button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              variant="ghost"
              className="w-full h-11 rounded-xl hover:bg-secondary/80 press-effect text-primary font-medium"
            >
              Resend OTP
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="text-primary font-medium h-auto p-0 hover:underline"
                onClick={() => navigate("/register")}
              >
                Register here
              </Button>
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
