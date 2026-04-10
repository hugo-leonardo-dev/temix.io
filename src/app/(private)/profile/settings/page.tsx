"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { User, Lock, Link2, Save } from "lucide-react";

interface UserData {
  name: string;
  image: string;
  email: string;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    image: "",
    email: "",
  });

  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || "",
        image: session.user.image || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          image: userData.image,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();

      // Atualiza a session com os novos dados do usuário
      await update({ user: { ...session?.user, name: data.user.name, image: data.user.image } });

      // Força refresh para recarregar a página com dados atualizados
      window.location.href = "/profile";
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const currentPassword = (e.target as HTMLFormElement).currentPassword
        .value;
      const newPassword = (e.target as HTMLFormElement).newPassword.value;

      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error("Failed to change password");
      }

      setMessage({ type: "success", text: "Password changed successfully!" });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
            <Button variant="outline" asChild size="sm">
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Back to Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Settings */}
        <Card className="bg-zinc-900/40 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleProfileUpdate}>
              <div className="flex items-center gap-6 mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                  {userData.name?.[0] ?? "U"}
                </div>
                <div className="flex-1">
                  <Label htmlFor="image" className="text-sm font-medium">
                    Profile Picture URL
                  </Label>
                  <Input
                    id="image"
                    value={userData.image}
                    onChange={(e) =>
                      setUserData({ ...userData, image: e.target.value })
                    }
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1"
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    Enter a URL to your profile picture
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) =>
                      setUserData({ ...userData, name: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    disabled
                    className="mt-1 bg-zinc-800"
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Separator className="bg-border/40" />

        {/* Security Settings */}
        <Card className="bg-zinc-900/40 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator className="bg-border/40" />

        {/* Connected Accounts */}
        <Card className="bg-zinc-900/40 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Connected Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
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
                  <div>
                    <p className="font-medium text-zinc-200">Google</p>
                    <p className="text-sm text-zinc-500">
                      {session?.user?.email ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {session?.user?.email ? (
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" asChild>
                    <Link href="/api/auth/signin?provider=google">Connect</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-border/40" />

        {/* Danger Zone */}
        <Card className="bg-zinc-900/40 border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-200">Delete Account</p>
                  <p className="text-sm text-zinc-500">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
