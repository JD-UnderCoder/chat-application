export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="post-login w-full h-dvh max-h-dvh flex bg-black">
      {children}
    </div>
  );
}
