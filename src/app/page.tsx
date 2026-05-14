import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <HowItWorks />
    </main>
  );
}
