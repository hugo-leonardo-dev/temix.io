"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  return (
    <div className="p-4 bg-blue-600 text-white flex justify-between">
      <Link href="/">Temix</Link>
      <nav>
        {session ? (
          <>
            <span>{session.user?.name}</span>
            <button onClick={() => signOut()}>Sair</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </nav>
    </div>
  );
}
