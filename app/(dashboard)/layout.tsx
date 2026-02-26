// app/(dashboard)/layout.tsx
import { OtpGate } from "./components/OtpGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <OtpGate>{children}</OtpGate>;
}
