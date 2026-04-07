"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plus,
  LogIn,
  Loader2,
  ChevronDown,
  Gamepad2,
  Sparkles,
  User,
  LogOut,
  PanelsTopLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: roomCode.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join room");
      }

      router.push(`/rooms/${data.room.id}`);
      setIsJoinDialogOpen(false);
      setRoomCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="header-root">
        <div className="header-container">
          {/* Logo */}
          <Link
            href="/"
            className="header-logo"
          >
            <Gamepad2 className="h-5 w-5" />
            <span className="header-logo-text">
              Temix<span className="text-muted-foreground">.io</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-nav hidden md:flex items-center gap-4">
            {/* Play dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="btn-play">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Play
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dropdown-menu">
                <DropdownMenuItem asChild>
                  <Link href="/rooms/create" className="dropdown-item">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Room
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsJoinDialogOpen(true)}
                  className="dropdown-item"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User avatar + dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="user-avatar-btn">
                  <Avatar className="user-avatar">
                    <AvatarImage src={session?.user?.image ?? ""} />
                    <AvatarFallback className="text-foreground bg-primary/20">
                      {session?.user?.name?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="user-name hidden lg:inline">
                    {session?.user?.name ?? "User"}
                  </span>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground hidden lg:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="dropdown-menu">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="dropdown-item">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="dropdown-separator" />

                <DropdownMenuItem
                  className="dropdown-item-destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden text-muted-foreground hover:text-foreground"
              >
                <PanelsTopLeft className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="sheet-root">
              <SheetHeader className="sheet-header">
                <span className="text-primary font-bold text-xl">Temix</span>
                <span className="text-muted-foreground text-xl">.io</span>
              </SheetHeader>

              <div className="flex flex-col gap-4 mt-6">
                <Link
                  href="/dashboard"
                  className="sheet-link"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>

                <Button asChild className="sheet-btn-create">
                  <Link href="/rooms/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Room
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsJoinDialogOpen(true)}
                  className="sheet-btn-join"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Room
                </Button>

                <div className="border-t border-border my-2" />

                <Button
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="sheet-btn-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Bottom glow bar */}
        <div className="header-glow" />
      </header>

      {/* Join Room Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="dialog-root sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join a Room</DialogTitle>
            <DialogDescription>
              Enter the room code to join an existing game
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Room Code</Label>
              <Input
                id="code"
                placeholder="ABC1234"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                maxLength={7}
                className="dialog-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoinRoom();
                  }
                }}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsJoinDialogOpen(false);
                  setRoomCode("");
                  setError(null);
                }}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinRoom}
                className="flex-1 btn-join-confirm"
                disabled={isLoading || !roomCode.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Join
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
