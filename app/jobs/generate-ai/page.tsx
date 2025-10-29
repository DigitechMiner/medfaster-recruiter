import { Footer } from "../components/jobs/footer";
import { GenerateAIForm } from "../components/gen-ai/generative-ai-form";
import { Navbar } from "../components/jobs/navbar";


export default function GenerateAIPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <GenerateAIForm />
      </main>
      <Footer />
    </div>
  );
}
