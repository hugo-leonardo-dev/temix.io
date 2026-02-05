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
import { Plus, LogIn, Loader2, ChevronDown } from "lucide-react";
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

      // Redirecionar para a sala
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
      <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-1 font-black text-xl tracking-tight"
          >
            <span className="text-primary">Temix</span>
            <span className="text-muted-foreground">.io</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="shadow-lg shadow-primary/20">
                  Play
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/rooms/create" className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Room
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsJoinDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 transition hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image ?? ""} />
                    <AvatarFallback className="bg-muted text-foreground">
                      {session?.user?.name?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-40 border-border bg-popover"
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Profile</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden text-muted-foreground hover:text-foreground"
              >
                ☰
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="border-border bg-background">
              <SheetHeader className="mb-6 text-lg font-black tracking-tight">
                <span className="text-primary">Temix</span>
                <span className="text-muted-foreground">.io</span>
              </SheetHeader>

              <div className="flex flex-col gap-4">
                <Link
                  href="/dashboard"
                  className="font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Profile
                </Link>

                <Link
                  href="/rooms"
                  className="font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Rooms
                </Link>

                <Button asChild>
                  <Link href="/rooms/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Room
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsJoinDialogOpen(true)}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Room
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
                className="text-center text-xl font-bold tracking-wider"
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
                className="flex-1"
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
