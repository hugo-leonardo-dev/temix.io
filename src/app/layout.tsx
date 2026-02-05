import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "Temix.io",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
