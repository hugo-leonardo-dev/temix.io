import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../globals.css";
import { SessionProvider } from "next-auth/react";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-blue-950/20 to-zinc-950 antialiased ">
      <SessionProvider>
        <Header />

        <main className="flex-1 pb-12 md:pb-16 container mx-auto px-4 py-8 space-y-8">
          {children}
        </main>
        <Footer />
      </SessionProvider>
    </div>
  );
}
