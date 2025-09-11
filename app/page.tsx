import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

        <div className="flex gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
        <div className="flex gap-3">
          <span className="font-normal">Regular</span>{" "}
          <span className="font-semibold">Semibold</span>{" "}
          <span className="font-[150]">150 weight</span>
          <span className="font-[250]">250 weight</span>
          <span className="font-[350]">350 weight</span>
          <span className="font-[450]">450 weight</span>
          <span className="font-[550]">550 weight</span>
          <span className="font-[650]">650 weight</span>
          <span className="font-[750]">750 weight</span>
          <span className="font-[850]">850 weight</span>
          <span className="font-[950]">950 weight</span>
        </div>
      </main>
    </div>
  );
}
