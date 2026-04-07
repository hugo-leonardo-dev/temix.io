"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Gamepad2,
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    } catch {
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
    <div className="login-root min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated mesh blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 login-grid" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="logo-icon-wrapper relative">
              <div className="logo-icon-glow" />
              <Gamepad2 className="logo-icon relative z-10" />
            </div>
          </div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-pink-400 gradient-shift">
            Temix
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">
              .io
            </span>
          </h1>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="card-inner">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-zinc-100">
                Join the game
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Create your account to get started
              </p>
            </div>

            {error && (
              <div className="error-box">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="input-label">
                  Name
                </Label>
                <div className="relative mt-2">
                  <User className="input-icon" />
                  <Input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    className="input-field pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="input-label">
                  Email
                </Label>
                <div className="relative mt-2">
                  <Mail className="input-icon" />
                  <Input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    className="input-field pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="input-label">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="input-icon" />
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
                    className="input-field pl-10 pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="btn-primary"
                size="lg"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <Button
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              className="btn-google"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.27 9.76A7.18 7.18 0 0 1 12 4.84c1.72 0 3.27.59 4.5 1.57l3.39-3.39C17.78 1.19 15.07 0 12 0 7.27 0 3.2 2.7 1.24 6.65l4.03 3.11Z"
                />
                <path
                  fill="#34A853"
                  d="M16.17 17.08A6.83 6.83 0 0 1 12 18.32c-4.08 0-7.5-2.74-8.57-6.46l-4.03 3.11C1.2 18.87 6.19 22.56 12 22.56c3.04 0 5.6-1.01 7.35-2.72l-3.18-2.76Z"
                />
                <path
                  fill="#4A90D9"
                  d="M19.35 19.84C21.3 17.94 22.56 15.13 22.56 11.68c0-.74-.07-1.45-.19-2.16H12v4.64h5.92a5.13 5.13 0 0 1-2.08 3.04l3.18 2.76Z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.43 11.88a7.3 7.3 0 0 1 0-3.66L-6.9-7.94Zm4.79-7.83-4.03-1.8A7.11 7.11 0 0 0 2.18 5.54l4.03 3.11A7.11 7.11 0 0 1 8.22 2.05Z"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="register-link">
              Already have an account?{" "}
              <Link href="/login" className="register-link-a">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
