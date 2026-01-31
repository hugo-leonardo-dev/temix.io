// 1. ATUALIZE o layout.tsx pra tema dark consistente (glassmorphism precisa de fundo escuro)
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../globals.css";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-blue-950/20 to-zinc-950 antialiased ">
      <Header />
      <main className="flex-1 pb-12 md:pb-16 container mx-auto px-4 py-8 space-y-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
