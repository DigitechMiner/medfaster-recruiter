import { EmptyJobState } from "./components/empty";
import { AppLayout } from "@/components/global/app-layout";


export default function JobsPage() {
  return (
    <AppLayout>
      <EmptyJobState />
    </AppLayout>
  );  
}
