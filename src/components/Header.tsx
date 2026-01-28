// src/components/Header.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:scale-105 transition-transform"
          >
            <div className="text-4xl">🎮</div>
            <span className="text-2xl font-black tracking-tight">
              Temix<span className="text-purple-300">.io</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {session ? (
              <>
                {/* User Info */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2 transition-all"
                >
                  <img
                    src={
                      session.user?.image ||
                      `https://ui-avatars.com/api/?name=${session.user?.name}`
                    }
                    alt={session.user?.name || "User"}
                    className="w-8 h-8 rounded-full border-2 border-purple-300"
                  />
                  <div className="text-left">
                    <p className="font-bold text-sm leading-tight">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-purple-200">Ver perfil</p>
                  </div>
                </Link>

                {/* Navigation Links */}
                <Link
                  href="/rooms"
                  className="flex items-center gap-2 hover:text-purple-200 transition-colors font-medium"
                >
                  <span className="text-xl">🏠</span>
                  Salas
                </Link>

                <Link
                  href="/create-room"
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg font-bold transition-all hover:scale-105"
                >
                  <span className="text-xl">➕</span>
                  Criar Sala
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400/50 px-4 py-2 rounded-lg font-bold transition-all hover:scale-105"
                >
                  <span className="text-xl">🚪</span>
                  Sair
                </button>
              </>
            ) : (
              <>
                {/* Guest Links */}
                <Link
                  href="/login"
                  className="flex items-center gap-2 hover:text-purple-200 transition-colors font-medium"
                >
                  <span className="text-xl">🔑</span>
                  Entrar
                </Link>

                <Link
                  href="/register"
                  className="flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 px-6 py-2 rounded-lg font-bold transition-all hover:scale-105 shadow-lg"
                >
                  <span className="text-xl">✨</span>
                  Criar Conta
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-3xl hover:scale-110 transition-transform"
          >
            {mobileMenuOpen ? "✖️" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-purple-500/30 py-4 space-y-3 animate-slideDown">
            {session ? (
              <>
                {/* User Info Mobile */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img
                    src={
                      session.user?.image ||
                      `https://ui-avatars.com/api/?name=${session.user?.name}`
                    }
                    alt={session.user?.name || "User"}
                    className="w-10 h-10 rounded-full border-2 border-purple-300"
                  />
                  <div>
                    <p className="font-bold">{session.user?.name}</p>
                    <p className="text-xs text-purple-200">Ver perfil</p>
                  </div>
                </Link>

                <Link
                  href="/rooms"
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-2xl">🏠</span>
                  Salas
                </Link>

                <Link
                  href="/create-room"
                  className="flex items-center gap-3 bg-purple-500 hover:bg-purple-600 rounded-xl p-3 transition-all font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-2xl">➕</span>
                  Criar Sala
                </Link>

                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400/50 rounded-xl p-3 transition-all font-bold"
                >
                  <span className="text-2xl">🚪</span>
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-2xl">🔑</span>
                  Entrar
                </Link>

                <Link
                  href="/register"
                  className="flex items-center gap-3 bg-white text-purple-700 hover:bg-purple-50 rounded-xl p-3 transition-all font-bold shadow-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-2xl">✨</span>
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
