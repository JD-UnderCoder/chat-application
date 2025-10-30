export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-dvh max-h-dvh flex bg-black/20">
      {children}
    </div>
  );
}