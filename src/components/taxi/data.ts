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

export type Offer = { id: number; name: string; photo: string; rating: number; car: string; color: string; plate: string; eta: number; price: number };
export const makeOffers = (p: number): Offer[] => [
  { id: 1, name: "Jorge Quispe", photo: "JQ", rating: 4.9, car: "Toyota Yaris", color: "Blanco", plate: "PAS-482", eta: 3, price: p },
  { id: 2, name: "Rosa Huamán", photo: "RH", rating: 4.8, car: "Hyundai Accent", color: "Plata", plate: "PAS-127", eta: 5, price: p + 1 },
  { id: 3, name: "Luis Ccori", photo: "LC", rating: 4.6, car: "Kia Rio", color: "Rojo", plate: "PAS-903", eta: 2, price: p + 2 },
];
export const soles = (n: number) => `S/ ${n.toFixed(2)}`;
export const START: [number, number] = [42, 40];
