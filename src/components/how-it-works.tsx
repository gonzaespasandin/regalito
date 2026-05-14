import { Card, CardContent } from "@/components/ui/card";
import { Search, ListChecks, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Buscá por zona",
    description:
      "Filtrá los regalitos por ciudad y categoría para encontrar los que te quedan cerca.",
  },
  {
    icon: ListChecks,
    title: "Mirá los requisitos",
    description:
      "Cada regalito muestra qué necesitás: app del local, tarjeta de fidelidad, DNI, etc.",
  },
  {
    icon: PartyPopper,
    title: "Cobrate tu regalo",
    description:
      "Vas al local en tu cumpleaños, mostrás lo que piden y te llevás tu regalito.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-28">
      <h2 className="text-center text-3xl font-bold tracking-tight">
        Cómo funciona
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
        Tres pasos para no dejar pasar ningún regalito este año.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title} className="rounded-2xl border-border bg-card">
            <CardContent className="flex flex-col gap-4 p-7">
              <span className="gradient-brand flex size-11 items-center justify-center rounded-xl text-white">
                <step.icon className="size-5" />
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
