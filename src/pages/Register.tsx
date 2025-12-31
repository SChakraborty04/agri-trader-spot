import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, User, Phone } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await register(name, email, phone || undefined);
      setMessage(res.message || "Registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
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
              Create Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Register to start trading with VBOX
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10 h-11 rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="10-digit phone number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
              {isLoading ? "Creating Account..." : "Register"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="text-primary font-medium h-auto p-0 hover:underline"
                onClick={() => navigate("/login")}
              >
                Sign in here
              </Button>
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
