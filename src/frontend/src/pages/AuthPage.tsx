import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Brain, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, useSaveProfile } from "../hooks/useQueries";
import type { ThemeConfig } from "../utils/seasonalTheme";

interface AuthPageProps {
  theme: ThemeConfig;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

function calculateAge(dob: string): number {
  const dobDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - dobDate.getFullYear();
  const m = today.getMonth() - dobDate.getMonth();
  return m < 0 || (m === 0 && today.getDate() < dobDate.getDate())
    ? age - 1
    : age;
}

function ProfileSetup({
  theme,
  onComplete,
}: {
  theme: ThemeConfig;
  onComplete: () => void;
}) {
  const { actor } = useActor();
  const saveProfile = useSaveProfile();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [ageError, setAgeError] = useState("");

  const handleSave = async () => {
    if (!username.trim() || !email.trim() || !dob) {
      toast.error("Please fill in all fields");
      return;
    }
    const age = calculateAge(dob);
    if (age < 18) {
      setAgeError("You must be 18 or older to create courses on EduAI.");
      return;
    }
    setAgeError("");
    const dobNs = BigInt(new Date(dob).getTime()) * BigInt(1_000_000);
    try {
      // Create user first
      if (actor) {
        try {
          await actor.createUser({
            username: username.trim(),
            email: email.trim(),
            dateOfBirth: dobNs,
          });
        } catch {
          // User may already exist, try saving profile
        }
        await saveProfile.mutateAsync({
          username: username.trim(),
          email: email.trim(),
          dateOfBirth: dobNs,
          createdAt: BigInt(Date.now()) * BigInt(1_000_000),
        });
      }
      toast.success("Profile saved!");
      onComplete();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-xl font-bold text-foreground mb-1">
          Complete Your Profile
        </h3>
        <p className="text-sm text-muted-foreground">
          Set up your profile to start learning and creating courses.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="signup-username" className="text-sm font-medium">
            Username *
          </Label>
          <Input
            data-ocid="auth.username_input"
            id="signup-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="coollearner"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="signup-email" className="text-sm font-medium">
            Email *
          </Label>
          <Input
            data-ocid="auth.email_input"
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="signup-dob" className="text-sm font-medium">
            Date of Birth *
          </Label>
          <Input
            data-ocid="auth.dob_input"
            id="signup-dob"
            type="date"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              setAgeError("");
            }}
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                .toISOString()
                .split("T")[0]
            }
            className="mt-1.5"
          />
          {ageError && (
            <div
              data-ocid="auth.error_state"
              className="flex items-center gap-2 mt-2 text-sm text-destructive"
            >
              <AlertCircle className="w-4 h-4" />
              {ageError}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Must be 18+ to create courses
          </p>
        </div>
      </div>

      <Button
        onClick={() => void handleSave()}
        disabled={saveProfile.isPending}
        className="w-full h-11 font-semibold"
        style={{ background: theme.primaryColor }}
      >
        {saveProfile.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
          </>
        ) : (
          "Save Profile & Start Learning"
        )}
      </Button>
    </div>
  );
}

export default function AuthPage({ theme, onNavigate }: AuthPageProps) {
  const { login, clear, isLoggingIn, identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const isLoggedIn = !!identity;

  // If logged in but no profile, show profile setup
  if (isLoggedIn && !profileLoading && !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="p-8 rounded-2xl bg-card border border-border/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: theme.primaryColor }}
              >
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Edu<span style={{ color: theme.primaryColor }}>AI</span>
              </span>
            </div>
            <ProfileSetup theme={theme} onComplete={() => onNavigate("home")} />
          </div>
        </div>
      </main>
    );
  }

  // If logged in with profile, redirect
  if (isLoggedIn && profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: theme.primaryColor }}
          />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Welcome back, {profile.username}!
          </h2>
          <p className="text-muted-foreground mb-6">
            You are already signed in.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => onNavigate("home")}
              style={{ background: theme.primaryColor }}
            >
              Browse Courses
            </Button>
            <Button variant="outline" onClick={clear}>
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${theme.primaryColor}15, transparent)`,
          }}
        />

        <div className="relative p-8 rounded-2xl bg-card border border-border/50 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-glow"
              style={{ background: theme.primaryColor }}
            >
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Edu<span style={{ color: theme.primaryColor }}>AI</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Free AI-powered learning platform
            </p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="w-full bg-muted/30 border border-border/50 mb-6">
              <TabsTrigger
                data-ocid="auth.login_tab"
                value="login"
                className="flex-1"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                data-ocid="auth.signup_tab"
                value="signup"
                className="flex-1"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Sign in with Internet Identity — secure, decentralized
                  authentication with no passwords.
                </p>
                <Button
                  data-ocid="auth.login_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full h-12 font-semibold"
                  style={{ background: theme.primaryColor }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Connecting...
                    </>
                  ) : (
                    "Sign In with Internet Identity"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Create your account with Internet Identity, then set up your
                  profile.
                </p>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-sm text-muted-foreground space-y-1">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />{" "}
                    Completely free courses
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />{" "}
                    AI-powered quizzes & doubt solving
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />{" "}
                    Create and share your courses (18+)
                  </p>
                </div>
                <Button
                  data-ocid="auth.login_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full h-12 font-semibold"
                  style={{ background: theme.primaryColor }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Connecting...
                    </>
                  ) : (
                    "Get Started with Internet Identity"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in you agree to our terms. All courses are 100% free.
          </p>
        </div>
      </div>
    </main>
  );
}
