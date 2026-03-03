// app/messages/layout.tsx
export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {children}
    </div>
  );
}
