export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-blue-950/20 to-zinc-950">
      {children}
    </div>
  );
}
