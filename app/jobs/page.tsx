import { EmptyJobState } from "./components/jobs/empty-job-state";
import { Footer } from "./components/jobs/footer";
import { Navbar } from "./components/jobs/navbar";


export default function JobsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <EmptyJobState />
      </main>
      <Footer />
    </div>
  );
}
