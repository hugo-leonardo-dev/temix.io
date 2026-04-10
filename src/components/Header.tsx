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
import {
  ChevronDown,
  Gamepad2,
  User,
  LogOut,
  PanelsTopLeft,
  TrendingUp,
  Settings,
} from "lucide-react";

export default function Header() {
  const { data: session } = useSession();

  return (
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
                <Link href="/profile" className="dropdown-item">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/settings" className="dropdown-item">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
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
                href="/profile"
                className="sheet-link"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              <Link
                href="/profile/settings"
                className="sheet-link"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>

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
  );
}
