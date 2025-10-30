export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(1000px_600px_at_120%_-10%,rgba(16,94,62,.35),transparent_55%)]">
      <div className="mx-auto max-w-7xl lg:px-6">
        {children}
      </div>
    </div>
  );
}