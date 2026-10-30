export type Place = { name: string; detail: string; pos: [number, number]; km: number; min: number; price: number; outOfZone?: boolean };

export const PLACES: Place[] = [
  { name: "Parque Minero", detail: "Chaupimarca", pos: [70, 22], km: 2.4, min: 8, price: 6 },
  { name: "Terminal Terrestre", detail: "Av. Los Próceres", pos: [82, 46], km: 3.8, min: 12, price: 8 },
  { name: "San Juan", detail: "Yanacancha", pos: [22, 18], km: 4.5, min: 14, price: 9 },
  { name: "Plaza Chaupimarca", detail: "Centro", pos: [64, 34], km: 1.9, min: 6, price: 5 },
  { name: "Hospital Daniel A. Carrión", detail: "Yanacancha", pos: [30, 30], km: 3.1, min: 10, price: 7 },
  { name: "Universidad Daniel A. Carrión", detail: "San Juan Pampa", pos: [18, 26], km: 4.9, min: 15, price: 10 },
  { name: "Huánuco", detail: "Fuera de Cerro de Pasco", pos: [90, 8], km: 105, min: 150, price: 0, outOfZone: true },
];
export const SAVED: Place[] = [
  { name: "Casa", detail: "Jr. Bolognesi 245", pos: [36, 80], km: 1.6, min: 6, price: 5 },
  { name: "Trabajo", detail: "Av. El Minero 1020", pos: [76, 60], km: 2.9, min: 9, price: 7 },
];

export type Review = { name: string; stars: number; text: string };
export type Offer = {
  id: number; name: string; photo: string; rating: number; trips: number; phone: string;
  car: string; color: string; plate: string; seats: number; eta: number; price: number; reviews: Review[];
};

// Mismo PIN de demo que la vista del conductor (Vista_Del_Conductor_V1: const PIN = "4821").
export const PIN_START = "4821";
// PIN de fin: el pasajero lo dicta después de pagar y el conductor lo ingresa para cerrar el viaje.
export const PIN_END = "3590";
export const SUPPORT_PHONE = "987654321";
// Centro de Cerro de Pasco, para el enlace de ubicación de emergencia.
export const DEMO_LOCATION = "-10.6833,-76.2563";

const DRIVERS: Omit<Offer, "price">[] = [
  { id: 1, name: "Jorge Quispe", photo: "JQ", rating: 4.9, trips: 412, phone: "987123456", car: "Toyota Yaris", color: "Blanco", plate: "W1A-482", seats: 4, eta: 3,
    reviews: [{ name: "Lucía P.", stars: 5, text: "Muy amable y puntual." }, { name: "Andrés M.", stars: 5, text: "Manejó con cuidado." }, { name: "Rosa T.", stars: 4, text: "Buen viaje, auto limpio." }] },
  { id: 2, name: "Rosa Huamán", photo: "RH", rating: 4.8, trips: 268, phone: "965330118", car: "Hyundai Accent", color: "Plata", plate: "W2B-127", seats: 4, eta: 5,
    reviews: [{ name: "Carlos R.", stars: 5, text: "Llegó rápido al recojo." }, { name: "María Q.", stars: 4, text: "Todo bien." }] },
  { id: 3, name: "Luis Ccori", photo: "LC", rating: 4.6, trips: 95, phone: "921447063", car: "Kia Rio", color: "Rojo", plate: "W3K-903", seats: 4, eta: 2,
    reviews: [{ name: "Jorge L.", stars: 4, text: "Buen servicio, música algo fuerte." }] },
  { id: 4, name: "Pedro Ríos", photo: "PR", rating: 4.7, trips: 183, phone: "954112870", car: "Toyota Avanza", color: "Gris", plate: "W4C-215", seats: 6, eta: 7,
    reviews: [{ name: "Familia T.", stars: 5, text: "Entramos los seis con maletas." }, { name: "Ana V.", stars: 4, text: "Puntual." }] },
];

// Solo ofertan los autos con asientos suficientes para todos los pasajeros.
export const makeOffers = (p: number, pax: number): Offer[] =>
  DRIVERS.filter((d) => d.seats >= pax).map((d, i) => ({ ...d, price: p + ([0, 1, 2, 1][i % 4] ?? 0) }));
// En la demo, Luis Ccori acaba de tomar otro viaje: muestra el error de la condición de carrera.
export const TAKEN_ID = 3;

export type Trip = { date: string; from: string; to: string; price: number; driver: string; status: "Finalizado" | "Cancelado" | "En revisión" };
export const HISTORY: Trip[] = [
  { date: "28/10 · 19:40", from: "Jr. Lima", to: "Terminal Terrestre", price: 8, driver: "Rosa Huamán", status: "Finalizado" },
  { date: "26/10 · 08:15", from: "Casa", to: "Universidad Daniel A. Carrión", price: 10, driver: "Jorge Quispe", status: "Finalizado" },
  { date: "24/10 · 21:05", from: "Parque Minero", to: "Casa", price: 6, driver: "Luis Ccori", status: "Cancelado" },
];

export const soles = (n: number) => `S/ ${n.toFixed(2)}`;
export const START: [number, number] = [42, 40];
export const waLink = (phone: string, text: string) => `https://wa.me/51${phone}?text=${encodeURIComponent(text)}`;
