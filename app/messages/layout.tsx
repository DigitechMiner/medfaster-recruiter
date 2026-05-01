// app/messages/layout.tsx
export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      {children}
    </div>
  );
}
