"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();

  return (
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
          <Button className="shadow-lg shadow-primary/20" asChild>
            <Link href="/rooms/create">
              <Plus className="mr-2 h-4 w-4" />
              New Room
            </Link>
          </Button>

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
                  New room
                </Link>
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
  );
}
