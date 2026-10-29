import { createFileRoute } from "@tanstack/react-router";
import { PassengerApp } from "@/components/taxi/PassengerApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Taxi App · Pasajero" },
      { name: "description", content: "Prototipo de la app de pasajero para pedir taxi en Cerro de Pasco." },
      { property: "og:title", content: "Taxi App · Pasajero" },
      { property: "og:description", content: "Pide tu taxi en Cerro de Pasco al precio que acuerdas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PassengerApp,
});
