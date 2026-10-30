import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, Menu, Search, MapPin, Home, Briefcase, Star, Clock, Route as RouteIcon, Banknote, Smartphone,
  AlertTriangle, Phone, User, Car, Camera, CheckCircle2, ChevronRight, FastForward, Flag, Pencil,
  ShieldAlert, MessageCircle, Users, KeyRound, Siren, ShieldCheck, ClipboardList,
} from "lucide-react";
import { Btn, LinkBtn, Field, Chip, Sheet, Status, StaticMap, Top, Page, Label, Avatar, Modal } from "./ui";
import {
  PLACES, SAVED, HISTORY, makeOffers, soles, waLink, START, PIN_START, PIN_END, TAKEN_ID, DEMO_LOCATION,
  type Place, type Offer, type Trip,
} from "./data";
import {
  TermsView, ContactsForm, ProfileView, PlacesView, HistoryView, DriverProfile, DriverModeView, DebtView, MenuDrawer,
  type Contact, type UserData, type Debt, type AccountScreen,
} from "./account";
import { cn } from "@/lib/utils";

type Screen =
  | "welcome" | "phone" | "otp" | "role" | "register" | "terms" | "emergency"
  | "home" | "search" | "confirm" | "searching" | "offers" | "noOffers"
  | "enroute" | "arrived" | "ontrip" | "payment" | "finished" | "review" | "debt"
  | AccountScreen;

const SIMULATE_NEXT: Partial<Record<Screen, Screen>> = {
  searching: "offers", offers: "noOffers", enroute: "arrived", arrived: "ontrip", ontrip: "payment", payment: "finished",
};
const nowLabel = () => `Hoy · ${new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;

export function PassengerApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [user, setUser] = useState<UserData>({ first: "", last: "", dni: "", phone: "", email: "", photo: null });
  const [origin, setOrigin] = useState<[number, number]>(START);
  const [dest, setDest] = useState<Place | null>(null);
  const [price, setPrice] = useState(0);
  const [pax, setPax] = useState(1);
  const [pay, setPay] = useState<"Efectivo" | "Yape">("Efectivo");
  const [ref, setRef] = useState("");
  const [notes, setNotes] = useState("");
  const [driver, setDriver] = useState<Offer | null>(null);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [saved, setSaved] = useState<Place[]>(SAVED);
  const [trips, setTrips] = useState<Trip[]>(HISTORY);
  const [debt, setDebt] = useState<Debt>(null);
  const [reported, setReported] = useState("");

  const say = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2400); };
  const go = (s: Screen) => setScreen(s);
  const pick = (p: Place) => { setDest(p); setPrice(p.price); go("confirm"); };
  const reset = () => { setDest(null); setDriver(null); setRef(""); setNotes(""); setPax(1); go("home"); };
  const logTrip = (status: Trip["status"]) => dest && driver && setTrips((t) => [{ date: nowLabel(), from: "Mi ubicación", to: dest.name, price: driver.price, driver: driver.name, status }, ...t]);
  const openAccount = (s: AccountScreen) => { setMenu(false); go(s); };
  const home = () => go("home");

  const next = SIMULATE_NEXT[screen];

  let body: ReactNode;
  switch (screen) {
    case "welcome": body = <Welcome onNext={() => go("phone")} />; break;
    case "phone": body = <PhoneStep phone={user.phone} setPhone={(phone) => setUser({ ...user, phone })} back={() => go("welcome")} onNext={() => go("otp")} />; break;
    case "otp": body = <Otp phone={user.phone} back={() => go("phone")} onNext={() => go("role")} say={say} />; break;
    case "role": body = <Role onPassenger={() => go("register")} onDriver={() => go("driverMode")} />; break;
    case "register": body = <Register user={user} setUser={setUser} back={() => go("role")} onNext={() => go("terms")} />; break;
    case "terms": body = <TermsView back={() => go("register")} onAccept={() => go("emergency")} />; break;
    case "emergency": body = <ContactsForm value={contacts} onSave={(c) => { setContacts(c); home(); }} onSkip={home} />; break;
    case "home": body = <HomeView origin={origin} setOrigin={setOrigin} saved={saved} pick={pick} openMenu={() => setMenu(true)} openSearch={() => go("search")} />; break;
    case "search": body = <SearchView saved={saved} back={home} pick={pick} />; break;
    case "confirm": body = dest && <Confirm origin={origin} dest={dest} price={price} setPrice={setPrice} pax={pax} setPax={setPax} pay={pay} setPay={setPay}
      refText={ref} setRef={setRef} notes={notes} setNotes={setNotes} back={home} say={say} onRequest={() => go("searching")} />; break;
    case "searching": body = <Searching origin={origin} price={price} pax={pax} cancel={reset} onDone={() => go("offers")} />; break;
    case "offers": body = <Offers origin={origin} price={price} pax={pax} cancel={reset} say={say} choose={(o) => { setDriver(o); go("enroute"); }} />; break;
    case "noOffers": body = <NoOffers origin={origin} price={price} retry={() => go("searching")} raise={() => { setPrice((p) => p + 1); go("searching"); }} cancel={reset} />; break;
    case "enroute": case "arrived": body = driver && <EnRoute arrived={screen === "arrived"} origin={origin} driver={driver}
      onMismatch={(reason) => { setReported(reason); logTrip("En revisión"); go("review"); }} />; break;
    case "ontrip": body = driver && dest && <OnTrip origin={origin} dest={dest} driver={driver} contacts={contacts} addContact={() => go("contacts")} />; break;
    case "payment": body = driver && dest && <Payment dest={dest} driver={driver} pay={pay}
      notPaid={() => { setDebt({ amount: driver.price, trip: dest.name }); logTrip("En revisión"); go("debt"); }} />; break;
    case "finished": body = driver && dest && <Finished dest={dest} driver={driver} pay={pay} say={say} done={() => { logTrip("Finalizado"); say("¡Gracias por viajar con Taxi App!"); reset(); }} />; break;
    case "review": body = <Review reason={reported} retry={() => { setDriver(null); go("confirm"); }} done={reset} />; break;
    case "debt": body = debt && <DebtView debt={debt} onPaid={() => { setDebt(null); say("Pago validado. Tu cuenta está activa."); reset(); }} />; break;
    case "profile": body = <ProfileView user={user} setUser={setUser} back={home} say={say} />; break;
    case "places": body = <PlacesView saved={saved} setSaved={setSaved} back={home} />; break;
    case "history": body = <HistoryView trips={trips} back={home} />; break;
    case "contacts": body = <ContactsForm value={contacts} back={home} onSave={(c) => { setContacts(c); say("Contactos guardados"); home(); }} />; break;
    case "termsView": body = <TermsView back={home} />; break;
    case "driverMode": body = <DriverModeView back={() => go(user.first ? "home" : "role")} say={say} />; break;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="relative h-[100dvh] max-h-[844px] w-full max-w-[390px] overflow-hidden bg-background sm:rounded-[28px] sm:border sm:border-border sm:shadow-float">
        {body}
        {menu && <MenuDrawer user={{ ...user, first: user.first || "Pasajero" }} debt={debt} close={() => setMenu(false)} open={openAccount}
          logout={() => { setMenu(false); go("welcome"); }} onDelete={() => { setMenu(false); say("Cuenta eliminada"); go("welcome"); }} />}
        {next && (
          <button onClick={() => go(next)} className="absolute right-3 top-3 z-50 flex items-center gap-1 rounded-full border border-border bg-card/90 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <FastForward className="h-3 w-3" />Simular
          </button>
        )}
        {toast && <div className="absolute inset-x-6 top-14 z-50 rounded-xl bg-foreground px-4 py-3 text-center text-sm text-background shadow-float">{toast}</div>}
      </div>
    </div>
  );
}

/* ---------- Registro ---------- */
function Welcome({ onNext }: { onNext: () => void }) {
  return <div className="flex h-full flex-col bg-primary-deep px-4 pb-8 text-primary-foreground">
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-primary"><Car className="h-12 w-12" /></div>
      <h1 className="text-3xl font-bold">Taxi App</h1>
      <p className="mt-3 max-w-[260px] text-base opacity-90">Tu taxi seguro en Cerro de Pasco, al precio que acuerdas.</p>
    </div>
    <Btn onClick={onNext}>Comenzar</Btn>
  </div>;
}

function PhoneStep({ phone, setPhone, back, onNext }: { phone: string; setPhone: (v: string) => void; back: () => void; onNext: () => void }) {
  return <Page><Top back={back} />
    <div className="flex-1 px-4">
      <h1 className="text-2xl font-semibold">Ingresa tu celular</h1>
      <p className="mt-2 text-sm text-muted-foreground">Te enviaremos un código por WhatsApp.</p>
      <div className="mt-6 flex gap-2">
        <div className="flex h-12 items-center rounded-xl border border-input bg-card px-4 font-medium">🇵🇪 +51</div>
        <Field inputMode="numeric" placeholder="987 654 321" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} autoFocus />
      </div>
    </div>
    <div className="p-4"><Btn disabled={phone.length !== 9} onClick={onNext}>Enviar código</Btn></div>
  </Page>;
}

function Otp({ phone, back, onNext, say }: { phone: string; back: () => void; onNext: () => void; say: (t: string) => void }) {
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(30);
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [left]);
  return <Page><Top back={back} />
    <div className="flex-1 px-4">
      <h1 className="text-2xl font-semibold">Código de verificación</h1>
      <p className="mt-2 text-sm text-muted-foreground">Te lo enviamos por WhatsApp al +51 {phone}. (Demo: cualquier código de 6 dígitos)</p>
      <div className="relative mt-6">
        <div className="flex justify-between gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn("flex h-14 w-12 items-center justify-center rounded-xl border bg-card text-2xl font-semibold", code.length === i ? "border-primary" : "border-input")}>{code[i] ?? ""}</div>
          ))}
        </div>
        <input aria-label="Código" inputMode="numeric" autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="absolute inset-0 opacity-0" />
      </div>
      <div className="mt-6 text-center text-sm">
        {left > 0 ? <span className="text-muted-foreground">Reenviar código en 0:{String(left).padStart(2, "0")}</span>
          : <button className="font-semibold text-primary-deep" onClick={() => { setLeft(30); say("Código reenviado por WhatsApp"); }}>Reenviar código</button>}
      </div>
    </div>
    <div className="p-4"><Btn disabled={code.length !== 6} onClick={onNext}>Verificar</Btn></div>
  </Page>;
}

function Role({ onPassenger, onDriver }: { onPassenger: () => void; onDriver: () => void }) {
  const Opt = ({ icon, title, desc, onClick }: { icon: ReactNode; title: string; desc: string; onClick: () => void }) => (
    <button onClick={onClick} className="flex w-full items-center gap-4 rounded-[20px] border-2 border-primary bg-card p-5 text-left">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary-deep">{icon}</div>
      <div className="flex-1"><div className="text-lg font-semibold">{title}</div><div className="text-sm text-muted-foreground">{desc}</div></div>
    </button>);
  return <Page><div className="h-14" />
    <div className="flex-1 space-y-3 px-4">
      <h1 className="text-2xl font-semibold">¿Cómo usarás la app?</h1>
      <p className="mb-6 text-sm text-muted-foreground">Es una sola cuenta: luego puedes cambiar de modo desde el menú.</p>
      <Opt icon={<User className="h-7 w-7" />} title="Pasajero" desc="Pide taxis y viaja seguro" onClick={onPassenger} />
      <Opt icon={<Car className="h-7 w-7" />} title="Conductor" desc="Recibe viajes y gana dinero" onClick={onDriver} />
    </div>
  </Page>;
}

function Register({ user, setUser, back, onNext }: { user: UserData; setUser: (u: UserData) => void; back: () => void; onNext: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const ok = user.first.trim().length >= 2 && user.last.trim().length >= 2 && user.dni.length === 8;
  return <Page><Top back={back} />
    <div className="flex-1 overflow-y-auto px-4">
      <h1 className="text-2xl font-semibold">Crea tu cuenta</h1>
      <button onClick={() => fileRef.current?.click()} className="mx-auto mt-6 flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-full bg-primary-soft text-primary-deep">
        {user.photo ? <img src={user.photo} alt="Tu foto" className="h-full w-full object-cover" /> : <><Camera className="h-7 w-7" /><span className="mt-1 text-xs">Tu foto</span></>}
      </button>
      <p className="mt-2 text-center text-xs text-muted-foreground">Recomendado: tu conductor te reconocerá por tu foto.</p>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setUser({ ...user, photo: URL.createObjectURL(f) }); }} />
      <Label>Nombres</Label>
      <Field placeholder="Ej. María Elena" value={user.first} onChange={(e) => setUser({ ...user, first: e.target.value })} />
      <Label>Apellidos</Label>
      <Field placeholder="Ej. Torres Rojas" value={user.last} onChange={(e) => setUser({ ...user, last: e.target.value })} />
      <Label>DNI</Label>
      <Field inputMode="numeric" placeholder="8 dígitos" value={user.dni} onChange={(e) => setUser({ ...user, dni: e.target.value.replace(/\D/g, "").slice(0, 8) })} />
      <p className="mt-2 flex gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-primary-deep" />Validamos tu DNI para que cada persona tenga una sola cuenta.</p>
    </div>
    <div className="p-4"><Btn disabled={!ok} onClick={onNext}>Continuar</Btn></div>
  </Page>;
}

/* ---------- Inicio y destino ---------- */
function SavedIcon({ name }: { name: string }) {
  return name === "Casa" ? <Home className="h-4 w-4" /> : name === "Trabajo" ? <Briefcase className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
}

function HomeView({ origin, setOrigin, saved, pick, openMenu, openSearch }: { origin: [number, number]; setOrigin: (p: [number, number]) => void; saved: Place[]; pick: (p: Place) => void; openMenu: () => void; openSearch: () => void }) {
  return <div className="relative h-full">
    <StaticMap origin={origin} draggableOrigin onOriginMove={setOrigin} />
    <button onClick={openMenu} aria-label="Menú" className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-float"><Menu className="h-6 w-6" /></button>
    <Sheet>
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-primary" />Origen: Mi ubicación · Jr. Lima, Chaupimarca</div>
      <button onClick={openSearch} className="flex h-14 w-full items-center gap-3 rounded-xl bg-muted px-4 text-left text-lg font-semibold"><Search className="h-5 w-5 text-primary-deep" />¿A dónde vas?</button>
      <p className="mt-4 text-sm font-medium text-muted-foreground">Frecuentes</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {PLACES.slice(0, 3).map((p) => <Chip key={p.name} onClick={() => pick(p)}><MapPin className="h-4 w-4" />{p.name}</Chip>)}
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">Guardados</p>
      <div className="mt-1 divide-y divide-border">
        {saved.map((p) => <button key={p.name} onClick={() => pick(p)} className="flex h-14 w-full items-center gap-3 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-deep"><SavedIcon name={p.name} /></span>
          <span className="flex-1"><span className="block font-medium">{p.name}</span><span className="block text-sm text-muted-foreground">{p.detail}</span></span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" /></button>)}
      </div>
    </Sheet>
  </div>;
}

function SearchView({ saved, back, pick }: { saved: Place[]; back: () => void; pick: (p: Place) => void }) {
  const [q, setQ] = useState("");
  const list = [...saved, ...PLACES].filter((p) => (p.name + p.detail).toLowerCase().includes(q.toLowerCase()));
  return <Page><Top back={back} title="¿A dónde vas?" />
    <div className="px-4"><Field autoFocus placeholder="Busca un lugar o dirección" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    <div className="mt-2 flex-1 divide-y divide-border overflow-y-auto px-4">
      {list.map((p) => <button key={p.name} onClick={() => pick(p)} className="flex h-16 w-full items-center gap-3 text-left">
        <MapPin className="h-5 w-5 text-muted-foreground" /><span><span className="block font-medium">{p.name}</span><span className="block text-sm text-muted-foreground">{p.detail}</span></span></button>)}
      {!list.length && <p className="py-8 text-center text-sm text-muted-foreground">Sin resultados</p>}
    </div>
  </Page>;
}

const routeFor = (a: [number, number], b: [number, number]): [number, number][] => [a, [a[0], (a[1] + b[1]) / 2], [b[0], (a[1] + b[1]) / 2], b];

function Confirm({ origin, dest, price, setPrice, pax, setPax, pay, setPay, refText, setRef, notes, setNotes, back, say, onRequest }: {
  origin: [number, number]; dest: Place; price: number; setPrice: (n: number) => void; pax: number; setPax: (n: number) => void;
  pay: "Efectivo" | "Yape"; setPay: (p: "Efectivo" | "Yape") => void; refText: string; setRef: (s: string) => void;
  notes: string; setNotes: (s: string) => void; back: () => void; say: (t: string) => void; onRequest: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const min = Math.max(1, dest.price - 1);
  const commit = (raw: string) => {
    setEditing(false);
    const v = Math.round(parseFloat(raw.replace(",", ".")) * 10) / 10;
    if (Number.isNaN(v)) return;
    if (v < min) { setPrice(min); say(`El precio mínimo para este viaje es ${soles(min)}`); } else setPrice(v);
  };
  return <div className="relative h-full">
    <StaticMap origin={origin} dest={dest.pos} route={dest.outOfZone ? undefined : routeFor(origin, dest.pos)} />
    <button onClick={back} aria-label="Volver" className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-float"><ArrowLeft className="h-6 w-6" /></button>
    <Sheet className="max-h-[85%]">
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-primary" />Mi ubicación</div>
        <div className="flex items-center gap-3 font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-accent" />{dest.name} <span className="font-normal text-muted-foreground">· {dest.detail}</span></div>
      </div>
      {dest.outOfZone ? (
        <div className="mt-4 flex gap-3 rounded-xl border border-warning bg-warning/10 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <div><b>Destino fuera de la zona de servicio.</b><p className="mt-1 text-muted-foreground">Por ahora solo atendemos viajes dentro de Cerro de Pasco.</p></div>
        </div>
      ) : <>
        <div className="mt-4 flex justify-between rounded-xl bg-muted px-4 py-3 text-sm">
          <span className="flex items-center gap-1.5"><RouteIcon className="h-4 w-4 text-primary-deep" />{dest.km} km</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary-deep" />{dest.min} min</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Tu oferta · toca el precio para escribirlo</p>
            {editing
              ? <input autoFocus inputMode="decimal" aria-label="Precio" defaultValue={price.toFixed(2)} onBlur={(e) => commit(e.target.value)} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                className="mt-1 h-10 w-28 rounded-lg border-2 border-primary px-2 text-xl font-semibold text-accent outline-none" />
              : <button onClick={() => setEditing(true)} className="mt-1 flex h-10 items-center gap-1.5 text-xl font-semibold text-accent">{soles(price)}<Pencil className="h-4 w-4" /></button>}
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Bajar precio" onClick={() => setPrice(Math.max(min, price - 0.5))} className="h-12 w-12 rounded-full border-2 border-primary text-xl font-semibold text-primary-deep">−</button>
            <button aria-label="Subir precio" onClick={() => setPrice(price + 0.5)} className="h-12 w-12 rounded-full border-2 border-primary text-xl font-semibold text-primary-deep">+</button>
          </div>
        </div>
        <Label>¿Cuántos viajan?</Label>
        <div className="flex gap-2">{[1, 2, 3, 4, 5, 6].map((n) => <Chip key={n} active={pax === n} onClick={() => setPax(n)}>{n}</Chip>)}</div>
        <Label>Referencia para el conductor</Label>
        <Field placeholder="Ej. frente a la botica, puerta verde" value={refText} onChange={(e) => setRef(e.target.value)} />
        <Label>Observaciones (opcional)</Label>
        <Field placeholder="Ej. llevo maletas, voy con una silla de ruedas" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Label>Método de pago</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["Efectivo", "Yape"] as const).map((m) => <button key={m} onClick={() => setPay(m)} className={cn("flex h-12 items-center justify-center gap-2 rounded-xl border-2 font-medium", pay === m ? "border-primary bg-primary-soft text-primary-deep" : "border-border")}>
            {m === "Efectivo" ? <Banknote className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}{m}</button>)}
        </div>
      </>}
      <Btn className="mt-4" disabled={dest.outOfZone} onClick={onRequest}>Pedir taxi</Btn>
    </Sheet>
  </div>;
}

/* ---------- Búsqueda y ofertas ---------- */
const paxLabel = (n: number) => `${n} ${n === 1 ? "pasajero" : "pasajeros"}`;

function Searching({ origin, price, pax, cancel, onDone }: { origin: [number, number]; price: number; pax: number; cancel: () => void; onDone: () => void }) {
  const [s, setS] = useState(0);
  useEffect(() => { const t = setInterval(() => setS((x) => x + 1), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (s >= 6) onDone(); }, [s, onDone]);
  return <div className="relative h-full"><StaticMap origin={origin} />
    <Sheet>
      <Status tone="warning">Solicitado</Status>
      <h2 className="mt-3 text-xl font-semibold">Buscando conductor…</h2>
      <p className="mt-1 text-sm text-muted-foreground">Autos para <b className="text-foreground">{paxLabel(pax)}</b> · tu oferta <b className="text-foreground">{soles(price)}</b></p>
      <div className="my-6 text-center text-4xl font-semibold tabular-nums">0:{String(s).padStart(2, "0")}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (s / 6) * 100)}%` }} /></div>
      <Btn variant="danger" className="mt-4" onClick={cancel}>Cancelar solicitud</Btn>
    </Sheet>
  </div>;
}

function Offers({ origin, price, pax, choose, cancel, say }: { origin: [number, number]; price: number; pax: number; choose: (o: Offer) => void; cancel: () => void; say: (t: string) => void }) {
  const [list, setList] = useState(() => makeOffers(price, pax));
  const [profile, setProfile] = useState<Offer | null>(null);
  const [picked, setPicked] = useState<Offer | null>(null);
  const accept = (o: Offer) => {
    setPicked(null);
    // Condición de carrera: se consulta si el conductor sigue libre antes de asignarlo.
    if (o.id === TAKEN_ID) { setList((l) => l.filter((x) => x.id !== o.id)); say(`${o.name.split(" ")[0]} acaba de tomar otro viaje. Elige otra oferta.`); return; }
    choose(o);
  };
  return <div className="relative h-full"><StaticMap origin={origin} />
    <Sheet className="max-h-[85%]">
      <h2 className="text-xl font-semibold">Ofertas de conductores</h2>
      <p className="mt-1 text-sm text-muted-foreground">Solo autos con espacio para {paxLabel(pax)}</p>
      <div className="mt-3 space-y-3">
        {list.map((o) => <div key={o.id} className="rounded-[20px] border border-border p-4">
          <button onClick={() => setProfile(o)} className="flex w-full gap-3 text-left">
            <Avatar text={o.photo} />
            <div className="flex-1 text-sm">
              <div className="flex items-center justify-between"><b className="text-base">{o.name}</b><span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" />{o.rating}</span></div>
              <div className="text-muted-foreground">{o.car} · {o.color} · <b className="text-foreground">{o.plate}</b></div>
              <div className="flex items-center gap-3 text-muted-foreground"><span className="flex items-center gap-1"><Users className="h-4 w-4" />{o.seats} asientos</span><span>Llega en {o.eta} min</span></div>
              <span className="text-xs font-medium text-primary-deep">Ver perfil y comentarios</span>
            </div>
          </button>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>{o.price === price ? <span className="text-sm font-medium text-primary-deep">Acepta tu precio</span> : <span className="text-sm text-muted-foreground">Contraoferta</span>}
              <div className="text-lg font-semibold">{soles(o.price)}</div></div>
            <Btn className="h-12 w-32" onClick={() => setPicked(o)}>Elegir</Btn>
          </div>
        </div>)}
        {!list.length && <p className="py-4 text-center text-sm text-muted-foreground">No quedan ofertas. Espera unos segundos o vuelve a buscar.</p>}
      </div>
      <Btn variant="danger" className="mt-2" onClick={cancel}>Cancelar solicitud</Btn>
    </Sheet>
    {profile && <DriverProfile d={profile} close={() => setProfile(null)} />}
    {picked && <Modal title="¿Aceptar este viaje?" close={() => setPicked(null)}>
      <p className="text-sm">Viajarás con <b>{picked.name}</b> en un {picked.car} {picked.color.toLowerCase()} por <b>{soles(picked.price)}</b>.</p>
      <div className="mt-3 flex gap-3 rounded-xl bg-warning/10 p-3 text-sm"><AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
        <span>Una vez aceptado ya no podrás cancelarlo. Solo podrás reportar si el auto o el conductor no coinciden con la app.</span></div>
      <div className="mt-4 space-y-1"><Btn onClick={() => accept(picked)}>Aceptar viaje</Btn><Btn variant="ghost" onClick={() => setPicked(null)}>Volver a las ofertas</Btn></div>
    </Modal>}
  </div>;
}

function NoOffers({ origin, price, retry, raise, cancel }: { origin: [number, number]; price: number; retry: () => void; raise: () => void; cancel: () => void }) {
  return <div className="relative h-full"><StaticMap origin={origin} />
    <Sheet>
      <h2 className="text-xl font-semibold">Nadie respondió todavía</h2>
      <p className="mt-1 text-sm text-muted-foreground">Puedes intentarlo otra vez o subir tu oferta ({soles(price)}).</p>
      <div className="mt-4 space-y-2">
        <Btn onClick={retry}>Buscar de nuevo</Btn>
        <Btn variant="secondary" onClick={raise}>Subir precio a {soles(price + 1)}</Btn>
        <Btn variant="danger" onClick={cancel}>Cancelar solicitud</Btn>
      </div>
    </Sheet>
  </div>;
}

/* ---------- Viaje ---------- */
function DriverCard({ d, onOpen }: { d: Offer; onOpen?: () => void }) {
  return <button onClick={onOpen} className="flex w-full gap-3 text-left">
    <Avatar text={d.photo} size="h-14 w-14" />
    <div className="flex-1 text-sm">
      <div className="flex items-center gap-2"><b className="text-base">{d.name}</b><span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" />{d.rating}</span></div>
      <div className="text-muted-foreground">{d.car} · {d.color} · {d.seats} asientos</div>
      <div className="mt-1 inline-block rounded-md border-2 border-foreground px-2 font-mono font-bold tracking-wider">{d.plate}</div>
    </div>
  </button>;
}

function PinBox({ label, pin }: { label: string; pin: string }) {
  return <div className="mt-4 rounded-[20px] bg-primary-soft p-4 text-center">
    <p className="flex items-center justify-center gap-1.5 text-sm text-primary-deep"><KeyRound className="h-4 w-4" />{label}</p>
    <p className="text-5xl font-bold tracking-[0.3em] text-primary-deep">{pin}</p>
  </div>;
}

const MISMATCH = ["La placa no coincide", "El auto (marca o color) no coincide", "El conductor no es el de la foto", "Otro motivo"];

function EnRoute({ arrived, origin, driver, onMismatch }: { arrived: boolean; origin: [number, number]; driver: Offer; onMismatch: (reason: string) => void }) {
  const [t, setT] = useState(0);
  const [profile, setProfile] = useState(false);
  const [report, setReport] = useState(false);
  const [reason, setReason] = useState("");
  useEffect(() => { const i = setInterval(() => setT((x) => Math.min(1, x + 0.08)), 800); return () => clearInterval(i); }, []);
  const k = arrived ? 1 : t;
  const start: [number, number] = [88, 15];
  const car: [number, number] = [start[0] + (origin[0] + 4 - start[0]) * k, start[1] + (origin[1] - 3 - start[1]) * k];
  return <div className="relative h-full">
    <StaticMap origin={origin} car={car} route={arrived ? undefined : routeFor(car, origin)} />
    {arrived && <div className="absolute inset-x-4 top-12 z-30 flex gap-3 rounded-[20px] bg-success p-4 text-primary-foreground shadow-float">
      <CheckCircle2 className="h-6 w-6 shrink-0" /><div><b>Tu conductor llegó</b><p className="text-sm">Verifica la placa <b>{driver.plate}</b>, el color <b>{driver.color.toLowerCase()}</b> y su foto antes de subir.</p></div></div>}
    <Sheet className="max-h-[85%]">
      <div className="flex items-center justify-between">
        <Status tone={arrived ? "success" : "primary"}>{arrived ? "Llegó" : "En camino"}</Status>
        {!arrived && <span className="text-sm text-muted-foreground">Llega en {Math.max(1, Math.round(driver.eta * (1 - t)))} min</span>}
      </div>
      <div className="mt-3"><DriverCard d={driver} onOpen={() => setProfile(true)} /></div>
      <p className="mt-3 flex gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-primary-deep" />Revisa que sea tu conductor: la foto, la placa y el color deben coincidir con la app.</p>
      <PinBox label="Al subir, dale este PIN al conductor" pin={PIN_START} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <LinkBtn variant="secondary" href={waLink(driver.phone, "Hola, soy tu pasajero de Taxi App.")}><MessageCircle className="h-5 w-5" />WhatsApp</LinkBtn>
        <LinkBtn variant="secondary" href={`tel:+51${driver.phone}`} target="_self"><Phone className="h-5 w-5" />Llamar</LinkBtn>
      </div>
      <Btn variant="danger" className="mt-1 text-sm" onClick={() => setReport(true)}>¿El auto o el conductor no coinciden?</Btn>
    </Sheet>
    {profile && <DriverProfile d={driver} close={() => setProfile(false)} />}
    {report && <Modal title="Reportar al conductor" close={() => setReport(false)}>
      <p className="text-sm text-muted-foreground">No subas al auto. Se cancelará el viaje y el operador revisará tu reporte.</p>
      <div className="mt-3 space-y-2">{MISMATCH.map((r) => <button key={r} onClick={() => setReason(r)}
        className={cn("flex h-12 w-full items-center rounded-xl border-2 px-4 text-left text-sm", reason === r ? "border-primary bg-primary-soft text-primary-deep" : "border-border")}>{r}</button>)}</div>
      <div className="mt-4 space-y-1"><Btn variant="sos" disabled={!reason} onClick={() => onMismatch(reason)}>Cancelar viaje y reportar</Btn><Btn variant="ghost" onClick={() => setReport(false)}>Volver</Btn></div>
    </Modal>}
  </div>;
}

function OnTrip({ origin, dest, driver, contacts, addContact }: { origin: [number, number]; dest: Place; driver: Offer; contacts: Contact[]; addContact: () => void }) {
  const [t, setT] = useState(0);
  const [sos, setSos] = useState(false);
  useEffect(() => { const i = setInterval(() => setT((x) => Math.min(0.9, x + 0.05)), 800); return () => clearInterval(i); }, []);
  const car: [number, number] = [origin[0] + (dest.pos[0] - origin[0]) * t, origin[1] + (dest.pos[1] - origin[1]) * t];
  const msg = `🚨 Estoy en una emergencia en un taxi de Taxi App. Mi ubicación: https://maps.google.com/?q=${DEMO_LOCATION} · Conductor: ${driver.name} · ${driver.car} ${driver.color} · Placa ${driver.plate}`;
  return <div className="relative h-full">
    <StaticMap dest={dest.pos} car={car} route={routeFor(car, dest.pos)} />
    <button onClick={() => setSos(true)} className="absolute left-4 top-4 z-10 flex h-12 items-center gap-2 rounded-full bg-destructive px-4 font-semibold text-destructive-foreground shadow-float"><ShieldAlert className="h-5 w-5" />Emergencia</button>
    <Sheet>
      <div className="flex items-center justify-between"><Status tone="info">En curso</Status><span className="text-sm text-muted-foreground">Llegada en {Math.max(1, Math.round(dest.min * (1 - t)))} min</span></div>
      <p className="mt-3 flex items-center gap-2 font-semibold"><Flag className="h-4 w-4 text-accent" />{dest.name}</p>
      <div className="mt-4"><DriverCard d={driver} /></div>
    </Sheet>
    {sos && <Modal close={() => setSos(false)} title="Emergencia">
      <p className="mb-3 flex gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"><Siren className="h-5 w-5 shrink-0" />Avisamos a la central de Taxi App con tu ubicación y los datos del viaje.</p>
      <div className="space-y-2">
        <LinkBtn variant="sos" href="tel:105" target="_self"><Phone className="h-5 w-5" />Llamar al 105</LinkBtn>
        {contacts.map((c) => <LinkBtn key={c.phone} variant="secondary" href={waLink(c.phone, msg)}><MessageCircle className="h-5 w-5" />Enviar ubicación a {c.name}</LinkBtn>)}
        {!contacts.length && <Btn variant="secondary" onClick={addContact}>Agregar un contacto de emergencia</Btn>}
        <Btn variant="ghost" onClick={() => setSos(false)}>Cerrar</Btn>
      </div>
    </Modal>}
  </div>;
}

function Payment({ dest, driver, pay, notPaid }: { dest: Place; driver: Offer; pay: string; notPaid: () => void }) {
  return <Page>
    <div className="flex-1 overflow-y-auto px-4 pt-12">
      <div className="text-center"><Status tone="info">Llegaste</Status>
        <h1 className="mt-3 text-2xl font-semibold">Llegaste a {dest.name}</h1></div>
      <div className="mt-6 rounded-[20px] bg-card p-4 text-center shadow-float">
        <p className="text-sm text-muted-foreground">Paga a {driver.name.split(" ")[0]} por {pay}</p>
        <p className="text-3xl font-bold">{soles(driver.price)}</p>
      </div>
      <PinBox label="Después de pagar, dale este PIN al conductor" pin={PIN_END} />
      <p className="mt-3 text-center text-sm text-muted-foreground">El viaje termina cuando el conductor ingresa este PIN. Así queda registrado que pagaste.</p>
    </div>
    <div className="p-4"><button onClick={notPaid} className="h-10 w-full text-xs text-muted-foreground underline">Demo: simular que el pasajero se fue sin pagar</button></div>
  </Page>;
}

const REPORT_TYPES = ["Cobro incorrecto", "El auto o el conductor no coincidían", "Trato o seguridad", "Olvidé un objeto", "Otro"];

function Finished({ dest, driver, pay, done, say }: { dest: Place; driver: Offer; pay: string; done: () => void; say: (t: string) => void }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [report, setReport] = useState(false);
  const [type, setType] = useState("");
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState(false);
  return <Page>
    <div className="flex-1 overflow-y-auto px-4 pt-10">
      <div className="text-center"><Status tone="success">Finalizado</Status>
        <h1 className="mt-3 text-2xl font-semibold">Viaje finalizado</h1></div>
      <div className="mt-6 rounded-[20px] bg-card p-4 shadow-float">
        <p className="text-center text-sm text-muted-foreground">Pagaste</p>
        <p className="text-center text-3xl font-bold">{soles(driver.price)}</p>
        <div className="mt-3 flex justify-around text-sm text-muted-foreground"><span>{dest.km} km</span><span>{dest.min} min</span><span>{pay}</span></div>
      </div>
      <p className="mt-6 text-center font-semibold">¿Cómo estuvo tu viaje con {driver.name.split(" ")[0]}?</p>
      <div className="mt-3 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => <button key={n} aria-label={`${n} estrellas`} onClick={() => setStars(n)}><Star className={cn("h-11 w-11", n <= stars ? "fill-accent text-accent" : "text-border")} /></button>)}
      </div>
      <textarea placeholder="Deja un comentario (opcional)" value={comment} onChange={(e) => setComment(e.target.value)} className="mt-4 h-24 w-full rounded-xl border border-input bg-card p-3 outline-none focus:border-primary" />
      {sent ? <p className="mt-2 flex h-12 items-center justify-center gap-2 text-sm font-medium text-primary-deep"><ClipboardList className="h-4 w-4" />Reporte enviado al operador</p>
        : <button onClick={() => setReport(true)} className="mt-2 flex h-12 w-full items-center justify-center gap-2 text-sm font-medium text-destructive"><AlertTriangle className="h-4 w-4" />Reportar un problema</button>}
    </div>
    <div className="space-y-1 p-4"><Btn disabled={!stars} onClick={done}>Enviar calificación</Btn><Btn variant="ghost" onClick={done}>Omitir</Btn></div>
    {report && <Modal title="Reportar un problema" close={() => setReport(false)}>
      <div className="flex flex-wrap gap-2">{REPORT_TYPES.map((r) => <Chip key={r} active={type === r} onClick={() => setType(r)}>{r}</Chip>)}</div>
      <Label>Describe tu inconveniente</Label>
      <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Cuéntanos qué pasó" className="h-24 w-full rounded-xl border border-input bg-card p-3 outline-none focus:border-primary" />
      <div className="mt-4 space-y-1"><Btn disabled={!type || detail.trim().length < 5} onClick={() => { setReport(false); setSent(true); say("Reporte enviado. El operador te contactará por WhatsApp."); }}>Enviar reporte</Btn>
        <Btn variant="ghost" onClick={() => setReport(false)}>Cancelar</Btn></div>
    </Modal>}
  </Page>;
}

function Review({ reason, retry, done }: { reason: string; retry: () => void; done: () => void }) {
  return <Page>
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/15 text-warning"><ClipboardList className="h-10 w-10" /></div>
      <div className="mt-4"><Status tone="warning">En revisión</Status></div>
      <h1 className="mt-3 text-2xl font-semibold">Viaje cancelado</h1>
      <p className="mt-2 text-sm text-muted-foreground">Reportaste: <b className="text-foreground">{reason}</b>. El operador revisará el caso y te contactará por WhatsApp. No se te cobrará este viaje.</p>
    </div>
    <div className="space-y-1 p-4"><Btn onClick={retry}>Pedir otro taxi al mismo destino</Btn><Btn variant="ghost" onClick={done}>Volver al inicio</Btn></div>
  </Page>;
}
