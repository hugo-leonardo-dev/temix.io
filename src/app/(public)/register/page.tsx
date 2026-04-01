// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error || "Erro no registro");
        return;
      }

      // Login automático
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Falha no login após registro");
      }
    } catch (err) {
      setError("Erro de rede");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setLoading(true);
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-pink-950/20 to-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Temix.io
          </h1>
        </div>

        <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800 shadow-2xl shadow-pink-500/10 p-8">
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-zinc-100 mb-1">
              Join the game
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-zinc-300">
                Name
              </Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-pink-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="seu@email.com"
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-pink-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Min. 6 characters"
                  className="pl-10 pr-12 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-pink-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-1.5">
                Use at least 6 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/25 text-white font-semibold"
              size="lg"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="text-zinc-500 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              variant="outline"
              className="w-full border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 border-dashed"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-zinc-400 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-pink-400 hover:text-pink-300 font-semibold transition"
            >
              Sign in
            </Link>
          </p>
        </Card>

        <p className="text-center text-xs text-zinc-500 mt-6">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="text-zinc-400 hover:text-zinc-300 underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-zinc-400 hover:text-zinc-300 underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
