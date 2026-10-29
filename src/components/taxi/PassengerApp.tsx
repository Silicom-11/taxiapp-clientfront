import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, Menu, Search, MapPin, Home, Briefcase, Star, Clock, Route as RouteIcon, Banknote, Smartphone,
  AlertTriangle, Phone, Send, X, ShieldAlert, MessageCircle, User, History, HeartPulse, HelpCircle, FileText,
  Car, LogOut, Trash2, Camera, CheckCircle2, ChevronRight, FastForward, Flag,
} from "lucide-react";
import { Btn, Field, Chip, Sheet, Status, StaticMap } from "./ui";
import { PLACES, SAVED, makeOffers, soles, START, type Place, type Offer } from "./data";
import { cn } from "@/lib/utils";

type Screen =
  | "welcome" | "phone" | "otp" | "role" | "register" | "emergency"
  | "home" | "search" | "confirm" | "searching" | "offers" | "noOffers"
  | "enroute" | "arrived" | "ontrip" | "finished";

const SIMULATE_NEXT: Partial<Record<Screen, Screen>> = {
  searching: "offers", offers: "noOffers", enroute: "arrived", arrived: "ontrip", ontrip: "finished",
};

export function PassengerApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState<[number, number]>(START);
  const [dest, setDest] = useState<Place | null>(null);
  const [price, setPrice] = useState(0);
  const [pay, setPay] = useState<"Efectivo" | "Yape">("Efectivo");
  const [ref, setRef] = useState("");
  const [driver, setDriver] = useState<Offer | null>(null);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [emContact, setEmContact] = useState({ name: "", phone: "" });

  const say = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2200); };
  const go = (s: Screen) => setScreen(s);
  const pick = (p: Place) => { setDest(p); setPrice(p.price); go("confirm"); };
  const reset = () => { setDest(null); setDriver(null); setRef(""); go("home"); };

  const next = SIMULATE_NEXT[screen];
  const common = { go, say };

  let body: ReactNode;
  switch (screen) {
    case "welcome": body = <Welcome onNext={() => go("phone")} />; break;
    case "phone": body = <PhoneStep phone={phone} setPhone={setPhone} back={() => go("welcome")} onNext={() => go("otp")} />; break;
    case "otp": body = <Otp phone={phone} back={() => go("phone")} onNext={() => go("role")} say={say} />; break;
    case "role": body = <Role onPassenger={() => go("register")} say={say} />; break;
    case "register": body = <Register name={name} setName={setName} back={() => go("role")} onNext={() => go("emergency")} />; break;
    case "emergency": body = <Emergency value={emContact} set={setEmContact} onNext={() => go("home")} />; break;
    case "home": body = <HomeView origin={origin} setOrigin={setOrigin} pick={pick} openMenu={() => setMenu(true)} openSearch={() => go("search")} />; break;
    case "search": body = <SearchView back={() => go("home")} pick={pick} />; break;
    case "confirm": body = dest && <Confirm origin={origin} dest={dest} price={price} setPrice={setPrice} pay={pay} setPay={setPay} refText={ref} setRef={setRef} back={() => go("home")} onRequest={() => go("searching")} />; break;
    case "searching": body = <Searching origin={origin} price={price} cancel={reset} onDone={() => go("offers")} />; break;
    case "offers": body = <Offers origin={origin} price={price} cancel={reset} choose={(o) => { setDriver(o); go("enroute"); }} />; break;
    case "noOffers": body = <NoOffers origin={origin} price={price} retry={() => go("searching")} raise={() => { setPrice((p) => p + 1); go("searching"); }} cancel={reset} />; break;
    case "enroute": case "arrived": body = driver && dest && <EnRoute arrived={screen === "arrived"} origin={origin} driver={driver} cancel={() => { say("Viaje cancelado"); reset(); }} {...common} />; break;
    case "ontrip": body = driver && dest && <OnTrip origin={origin} dest={dest} driver={driver} contact={emContact.name} say={say} />; break;
    case "finished": body = driver && dest && <Finished dest={dest} driver={driver} pay={pay} done={() => { say("¡Gracias por viajar con Taxi App!"); reset(); }} say={say} />; break;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="relative h-[100dvh] max-h-[844px] w-full max-w-[390px] overflow-hidden bg-background sm:rounded-[28px] sm:border sm:border-border sm:shadow-float">
        {body}
        {menu && <MenuDrawer name={name || "Pasajero"} phone={phone} close={() => setMenu(false)} say={say} logout={() => { setMenu(false); go("welcome"); }} />}
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

/* ---------- Onboarding ---------- */
function Top({ back, title }: { back?: () => void; title?: string }) {
  return <div className="flex h-14 items-center gap-2 px-2">
    {back && <button onClick={back} aria-label="Volver" className="flex h-12 w-12 items-center justify-center rounded-full"><ArrowLeft className="h-6 w-6" /></button>}
    {title && <h2 className="text-lg font-semibold">{title}</h2>}
  </div>;
}
function Page({ children }: { children: ReactNode }) { return <div className="flex h-full flex-col">{children}</div>; }

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
      <p className="mt-2 text-sm text-muted-foreground">Te enviaremos un código por SMS.</p>
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
      <p className="mt-2 text-sm text-muted-foreground">Enviado al +51 {phone}. (Demo: cualquier código de 6 dígitos)</p>
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
          : <button className="font-semibold text-primary-deep" onClick={() => { setLeft(30); say("Código reenviado"); }}>Reenviar código</button>}
      </div>
    </div>
    <div className="p-4"><Btn disabled={code.length !== 6} onClick={onNext}>Verificar</Btn></div>
  </Page>;
}

function Role({ onPassenger, say }: { onPassenger: () => void; say: (t: string) => void }) {
  const Opt = ({ icon, title, desc, onClick, soon }: { icon: ReactNode; title: string; desc: string; onClick: () => void; soon?: boolean }) => (
    <button onClick={onClick} className={cn("flex w-full items-center gap-4 rounded-[20px] border-2 bg-card p-5 text-left", soon ? "border-border opacity-70" : "border-primary")}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary-deep">{icon}</div>
      <div className="flex-1"><div className="flex items-center gap-2 text-lg font-semibold">{title}{soon && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Próximamente</span>}</div>
        <div className="text-sm text-muted-foreground">{desc}</div></div>
    </button>);
  return <Page><div className="h-14" />
    <div className="flex-1 space-y-3 px-4">
      <h1 className="mb-6 text-2xl font-semibold">¿Cómo usarás la app?</h1>
      <Opt icon={<User className="h-7 w-7" />} title="Pasajero" desc="Pide taxis y viaja seguro" onClick={onPassenger} />
      <Opt icon={<Car className="h-7 w-7" />} title="Conductor" desc="Recibe viajes y gana dinero" onClick={() => say("Próximamente")} soon />
    </div>
  </Page>;
}

function Register({ name, setName, back, onNext }: { name: string; setName: (v: string) => void; back: () => void; onNext: () => void }) {
  const [ok, setOk] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  return <Page><Top back={back} />
    <div className="flex-1 px-4">
      <h1 className="text-2xl font-semibold">Crea tu cuenta</h1>
      <button onClick={() => fileRef.current?.click()} className="mx-auto mt-6 flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-full bg-primary-soft text-primary-deep">
        {photo ? <img src={photo} alt="Tu foto" className="h-full w-full object-cover" /> : <><Camera className="h-7 w-7" /><span className="mt-1 text-xs">Foto (opcional)</span></>}
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
      <label className="mt-6 block text-sm font-medium">Nombre y apellido</label>
      <Field className="mt-2" placeholder="Ej. María Torres" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="mt-6 flex items-start gap-3 text-sm">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 h-5 w-5 accent-primary" />
        <span>Acepto los <b className="text-primary-deep">Términos y condiciones</b> y la <b className="text-primary-deep">Política de privacidad</b>.</span>
      </label>
    </div>
    <div className="p-4"><Btn disabled={!ok || name.trim().length < 2} onClick={onNext}>Continuar</Btn></div>
  </Page>;
}

function Emergency({ value, set, onNext }: { value: { name: string; phone: string }; set: (v: { name: string; phone: string }) => void; onNext: () => void }) {
  return <Page><div className="flex h-14 items-center justify-end px-4"><button onClick={onNext} className="h-12 font-medium text-primary-deep">Omitir</button></div>
    <div className="flex-1 px-4">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary-deep"><HeartPulse className="h-7 w-7" /></div>
      <h1 className="text-2xl font-semibold">Contacto de emergencia</h1>
      <p className="mt-2 text-sm text-muted-foreground">Podrás enviarle tu ubicación durante un viaje si lo necesitas.</p>
      <label className="mt-6 block text-sm font-medium">Nombre</label>
      <Field className="mt-2" placeholder="Ej. Carlos Torres" value={value.name} onChange={(e) => set({ ...value, name: e.target.value })} />
      <label className="mt-4 block text-sm font-medium">Celular</label>
      <div className="mt-2 flex gap-2"><div className="flex h-12 items-center rounded-xl border border-input bg-card px-4">+51</div>
        <Field inputMode="numeric" placeholder="987 654 321" value={value.phone} onChange={(e) => set({ ...value, phone: e.target.value.replace(/\D/g, "").slice(0, 9) })} /></div>
    </div>
    <div className="p-4"><Btn disabled={!value.name || value.phone.length !== 9} onClick={onNext}>Guardar</Btn></div>
  </Page>;
}

/* ---------- Home & destination ---------- */
function HomeView({ origin, setOrigin, pick, openMenu, openSearch }: { origin: [number, number]; setOrigin: (p: [number, number]) => void; pick: (p: Place) => void; openMenu: () => void; openSearch: () => void }) {
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
        {SAVED.map((p) => <button key={p.name} onClick={() => pick(p)} className="flex h-14 w-full items-center gap-3 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-deep">{p.name === "Casa" ? <Home className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}</span>
          <span className="flex-1"><span className="block font-medium">{p.name}</span><span className="block text-sm text-muted-foreground">{p.detail}</span></span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" /></button>)}
      </div>
    </Sheet>
  </div>;
}

function SearchView({ back, pick }: { back: () => void; pick: (p: Place) => void }) {
  const [q, setQ] = useState("");
  const list = [...SAVED, ...PLACES].filter((p) => (p.name + p.detail).toLowerCase().includes(q.toLowerCase()));
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

function Confirm({ origin, dest, price, setPrice, pay, setPay, refText, setRef, back, onRequest }: {
  origin: [number, number]; dest: Place; price: number; setPrice: (n: number) => void; pay: "Efectivo" | "Yape"; setPay: (p: "Efectivo" | "Yape") => void; refText: string; setRef: (s: string) => void; back: () => void; onRequest: () => void;
}) {
  return <div className="relative h-full">
    <StaticMap origin={origin} dest={dest.pos} route={dest.outOfZone ? undefined : routeFor(origin, dest.pos)} />
    <button onClick={back} aria-label="Volver" className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-float"><ArrowLeft className="h-6 w-6" /></button>
    <Sheet>
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
          <div><p className="text-sm text-muted-foreground">Precio sugerido</p><p className="text-xl font-semibold text-accent">{soles(price)}</p></div>
          <div className="flex items-center gap-2">
            <button aria-label="Bajar precio" onClick={() => setPrice(Math.max(dest.price - 1, price - 0.5))} className="h-12 w-12 rounded-full border-2 border-primary text-xl font-semibold text-primary-deep">−</button>
            <button aria-label="Subir precio" onClick={() => setPrice(price + 0.5)} className="h-12 w-12 rounded-full border-2 border-primary text-xl font-semibold text-primary-deep">+</button>
          </div>
        </div>
        <Field className="mt-4" placeholder="Referencia para el conductor (ej. puerta verde)" value={refText} onChange={(e) => setRef(e.target.value)} />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["Efectivo", "Yape"] as const).map((m) => <button key={m} onClick={() => setPay(m)} className={cn("flex h-12 items-center justify-center gap-2 rounded-xl border-2 font-medium", pay === m ? "border-primary bg-primary-soft text-primary-deep" : "border-border")}>
            {m === "Efectivo" ? <Banknote className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}{m}</button>)}
        </div>
      </>}
      <Btn className="mt-4" disabled={dest.outOfZone} onClick={onRequest}>Pedir taxi</Btn>
    </Sheet>
  </div>;
}

/* ---------- Matching ---------- */
function Searching({ origin, price, cancel, onDone }: { origin: [number, number]; price: number; cancel: () => void; onDone: () => void }) {
  const [s, setS] = useState(0);
  useEffect(() => { const t = setInterval(() => setS((x) => x + 1), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (s >= 6) onDone(); }, [s, onDone]);
  return <div className="relative h-full"><StaticMap origin={origin} />
    <Sheet>
      <Status tone="warning">Solicitado</Status>
      <h2 className="mt-3 text-xl font-semibold">Buscando conductor…</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tu oferta: <b className="text-foreground">{soles(price)}</b></p>
      <div className="my-6 text-center text-4xl font-semibold tabular-nums">0:{String(s).padStart(2, "0")}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (s / 6) * 100)}%` }} /></div>
      <Btn variant="danger" className="mt-4" onClick={cancel}>Cancelar</Btn>
    </Sheet>
  </div>;
}

function Avatar({ text, size = "h-12 w-12" }: { text: string; size?: string }) {
  return <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-primary-deep font-semibold text-primary-foreground", size)}>{text}</div>;
}

function Offers({ origin, price, choose, cancel }: { origin: [number, number]; price: number; choose: (o: Offer) => void; cancel: () => void }) {
  return <div className="relative h-full"><StaticMap origin={origin} />
    <Sheet className="max-h-[85%]">
      <h2 className="text-xl font-semibold">Ofertas de conductores</h2>
      <div className="mt-3 space-y-3">
        {makeOffers(price).map((o) => <div key={o.id} className="rounded-[20px] border border-border p-4">
          <div className="flex gap-3">
            <Avatar text={o.photo} />
            <div className="flex-1 text-sm">
              <div className="flex items-center justify-between"><b className="text-base">{o.name}</b><span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" />{o.rating}</span></div>
              <div className="text-muted-foreground">{o.car} · {o.color} · <b className="text-foreground">{o.plate}</b></div>
              <div className="text-muted-foreground">Llega en {o.eta} min</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>{o.price === price ? <span className="text-sm font-medium text-primary-deep">Acepta tu precio</span> : <span className="text-sm text-muted-foreground">Contraoferta</span>}
              <div className="text-lg font-semibold">{soles(o.price)}</div></div>
            <Btn className="h-12 w-32" onClick={() => choose(o)}>Elegir</Btn>
          </div>
        </div>)}
      </div>
      <Btn variant="danger" className="mt-2" onClick={cancel}>Cancelar</Btn>
    </Sheet>
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
        <Btn variant="danger" onClick={cancel}>Cancelar</Btn>
      </div>
    </Sheet>
  </div>;
}

/* ---------- Trip ---------- */
function DriverCard({ d }: { d: Offer }) {
  return <div className="flex gap-3">
    <Avatar text={d.photo} size="h-14 w-14" />
    <div className="flex-1 text-sm">
      <div className="flex items-center gap-2"><b className="text-base">{d.name}</b><span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" />{d.rating}</span></div>
      <div className="text-muted-foreground">{d.car} · {d.color}</div>
      <div className="mt-1 inline-block rounded-md border-2 border-foreground px-2 font-mono font-bold tracking-wider">{d.plate}</div>
    </div>
  </div>;
}

const CANCEL_REASONS = ["El conductor tarda mucho", "Ya no necesito el viaje", "Pedí por error", "El conductor me pidió cancelar", "Otro motivo"];

function EnRoute({ arrived, origin, driver, cancel, say }: { arrived: boolean; origin: [number, number]; driver: Offer; cancel: () => void; go: (s: Screen) => void; say: (t: string) => void }) {
  const [t, setT] = useState(0);
  const [chat, setChat] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([{ me: false, text: "Hola, ya voy en camino 🚕" }]);
  const [draft, setDraft] = useState("");
  useEffect(() => { const i = setInterval(() => setT((x) => Math.min(1, x + 0.08)), 800); return () => clearInterval(i); }, []);
  const k = arrived ? 1 : t;
  const start: [number, number] = [88, 15];
  const car: [number, number] = [start[0] + (origin[0] + 4 - start[0]) * k, start[1] + (origin[1] - 3 - start[1]) * k];
  const send = (text: string) => { if (text.trim()) { setMsgs((m) => [...m, { me: true, text }]); setDraft(""); } };
  return <div className="relative h-full">
    <StaticMap origin={origin} car={car} route={arrived ? undefined : routeFor(car, origin)} />
    {arrived && <div className="absolute inset-x-4 top-12 z-30 flex gap-3 rounded-[20px] bg-success p-4 text-primary-foreground shadow-float">
      <CheckCircle2 className="h-6 w-6 shrink-0" /><div><b>Tu conductor llegó</b><p className="text-sm">Verifica la placa <b>{driver.plate}</b> y el color <b>{driver.color.toLowerCase()}</b>.</p></div></div>}
    <Sheet>
      <div className="flex items-center justify-between">
        <Status tone={arrived ? "success" : "primary"}>{arrived ? "Llegó" : "En camino"}</Status>
        {!arrived && <span className="text-sm text-muted-foreground">Llega en {Math.max(1, Math.round(driver.eta * (1 - t)))} min</span>}
      </div>
      <div className="mt-3"><DriverCard d={driver} /></div>
      <div className="mt-4 rounded-[20px] bg-primary-soft p-4 text-center">
        <p className="text-sm text-primary-deep">Dale este PIN al conductor</p>
        <p className="text-5xl font-bold tracking-[0.3em] text-primary-deep">4827</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Btn variant="secondary" onClick={() => setChat(true)}><MessageCircle className="h-5 w-5" />Chat</Btn>
        <Btn variant="secondary" onClick={() => say("Llamando al conductor…")}><Phone className="h-5 w-5" />Llamar</Btn>
      </div>
      <Btn variant="danger" className="mt-1" onClick={() => setCancelOpen(true)}>Cancelar viaje</Btn>
    </Sheet>

    {chat && <div className="absolute inset-0 z-40 flex flex-col bg-background">
      <div className="flex h-14 items-center gap-3 border-b border-border px-2">
        <button onClick={() => setChat(false)} aria-label="Cerrar chat" className="flex h-12 w-12 items-center justify-center"><ArrowLeft className="h-6 w-6" /></button>
        <Avatar text={driver.photo} size="h-9 w-9 text-sm" /><b>{driver.name}</b>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {msgs.map((m, i) => <div key={i} className={cn("max-w-[75%] rounded-2xl px-4 py-2 text-sm", m.me ? "ml-auto bg-primary text-primary-foreground" : "bg-card shadow-float")}>{m.text}</div>)}
      </div>
      <div className="flex gap-2 px-4 pb-2">{["Ya bajo", "Estoy afuera"].map((q) => <Chip key={q} onClick={() => send(q)}>{q}</Chip>)}</div>
      <div className="flex gap-2 border-t border-border p-3">
        <Field placeholder="Escribe un mensaje" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(draft)} />
        <button aria-label="Enviar" onClick={() => send(draft)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Send className="h-5 w-5" /></button>
      </div>
    </div>}

    {cancelOpen && <Modal close={() => setCancelOpen(false)} title="¿Por qué cancelas?">
      <div className="divide-y divide-border">{CANCEL_REASONS.map((r) => <button key={r} onClick={cancel} className="flex h-12 w-full items-center text-left">{r}</button>)}</div>
      <Btn variant="ghost" className="mt-2" onClick={() => setCancelOpen(false)}>Volver</Btn>
    </Modal>}
  </div>;
}

function OnTrip({ origin, dest, driver, contact, say }: { origin: [number, number]; dest: Place; driver: Offer; contact: string; say: (t: string) => void }) {
  const [t, setT] = useState(0);
  const [sos, setSos] = useState(false);
  useEffect(() => { const i = setInterval(() => setT((x) => Math.min(0.9, x + 0.05)), 800); return () => clearInterval(i); }, []);
  const car: [number, number] = [origin[0] + (dest.pos[0] - origin[0]) * t, origin[1] + (dest.pos[1] - origin[1]) * t];
  return <div className="relative h-full">
    <StaticMap dest={dest.pos} car={car} route={routeFor(car, dest.pos)} />
    <button onClick={() => setSos(true)} className="absolute left-4 top-4 z-10 flex h-12 items-center gap-2 rounded-full bg-destructive px-4 font-semibold text-destructive-foreground shadow-float"><ShieldAlert className="h-5 w-5" />Emergencia</button>
    <Sheet>
      <div className="flex items-center justify-between"><Status tone="info">En curso</Status><span className="text-sm text-muted-foreground">Llegada en {Math.max(1, Math.round(dest.min * (1 - t)))} min</span></div>
      <p className="mt-3 flex items-center gap-2 font-semibold"><Flag className="h-4 w-4 text-accent" />{dest.name}</p>
      <div className="mt-4"><DriverCard d={driver} /></div>
    </Sheet>
    {sos && <Modal close={() => setSos(false)} title="Emergencia">
      <div className="space-y-2">
        <Btn className="bg-destructive text-destructive-foreground" onClick={() => { setSos(false); say("Llamando al 105…"); }}><Phone className="h-5 w-5" />Llamar al 105</Btn>
        <Btn variant="secondary" onClick={() => { setSos(false); say(contact ? `Ubicación enviada a ${contact}` : "Agrega un contacto de emergencia en el menú"); }}><Send className="h-5 w-5" />Enviar mi ubicación a mi contacto</Btn>
        <Btn variant="ghost" onClick={() => setSos(false)}>Cerrar</Btn>
      </div>
    </Modal>}
  </div>;
}

function Finished({ dest, driver, pay, done, say }: { dest: Place; driver: Offer; pay: string; done: () => void; say: (t: string) => void }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  return <Page>
    <div className="flex-1 overflow-y-auto px-4 pt-10">
      <div className="text-center"><Status tone="success">Finalizado</Status>
        <h1 className="mt-3 text-2xl font-semibold">Llegaste a {dest.name}</h1></div>
      <div className="mt-6 rounded-[20px] bg-card p-4 shadow-float">
        <p className="text-center text-sm text-muted-foreground">Precio acordado</p>
        <p className="text-center text-3xl font-bold">{soles(driver.price)}</p>
        <div className="mt-3 flex justify-around text-sm text-muted-foreground"><span>{dest.km} km</span><span>{dest.min} min</span><span>{pay}</span></div>
        <p className="mt-3 rounded-xl bg-primary-soft p-3 text-center text-sm font-medium text-primary-deep">Paga al conductor en efectivo o Yape</p>
      </div>
      <p className="mt-6 text-center font-semibold">¿Cómo estuvo tu viaje con {driver.name.split(" ")[0]}?</p>
      <div className="mt-3 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => <button key={n} aria-label={`${n} estrellas`} onClick={() => setStars(n)}><Star className={cn("h-11 w-11", n <= stars ? "fill-accent text-accent" : "text-border")} /></button>)}
      </div>
      <textarea placeholder="Deja un comentario (opcional)" value={comment} onChange={(e) => setComment(e.target.value)} className="mt-4 h-24 w-full rounded-xl border border-input bg-card p-3 outline-none focus:border-primary" />
      <button onClick={() => say("Reporte enviado. Te contactaremos por WhatsApp.")} className="mt-2 flex h-12 w-full items-center justify-center gap-2 text-sm font-medium text-destructive"><AlertTriangle className="h-4 w-4" />Reportar un problema</button>
    </div>
    <div className="space-y-1 p-4"><Btn disabled={!stars} onClick={done}>Enviar calificación</Btn><Btn variant="ghost" onClick={done}>Omitir</Btn></div>
  </Page>;
}

/* ---------- Menu ---------- */
function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  return <div className="absolute inset-0 z-40 flex items-end bg-foreground/40" onClick={close}>
    <div className="w-full rounded-t-[20px] bg-card p-4 pb-6" onClick={(e) => e.stopPropagation()}>
      <div className="mb-2 flex items-center justify-between"><h3 className="text-lg font-semibold">{title}</h3><button aria-label="Cerrar" onClick={close} className="flex h-10 w-10 items-center justify-center"><X className="h-5 w-5" /></button></div>
      {children}
    </div>
  </div>;
}

function MenuDrawer({ name, phone, close, say, logout }: { name: string; phone: string; close: () => void; say: (t: string) => void; logout: () => void }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const items: [ReactNode, string][] = [
    [<User key="u" />, "Mi perfil"], [<MapPin key="m" />, "Mis lugares"], [<History key="h" />, "Historial de viajes"],
    [<HeartPulse key="e" />, "Contacto de emergencia"], [<HelpCircle key="w" />, "Ayuda por WhatsApp"], [<FileText key="t" />, "Términos y privacidad"],
    [<Car key="c" />, "Quiero ser conductor"],
  ];
  return <div className="absolute inset-0 z-40 flex bg-foreground/40" onClick={close}>
    <div className="flex h-full w-[82%] flex-col bg-card" onClick={(e) => e.stopPropagation()}>
      <div className="bg-primary-deep px-4 pb-5 pt-10 text-primary-foreground">
        <Avatar text={name.slice(0, 1).toUpperCase()} size="h-14 w-14 bg-primary text-xl" />
        <p className="mt-3 text-lg font-semibold">{name}</p><p className="text-sm opacity-80">+51 {phone || "987 654 321"}</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {items.map(([icon, label]) => <button key={label} onClick={() => say(label === "Quiero ser conductor" ? "Próximamente" : `${label} (demo)`)} className="flex h-12 w-full items-center gap-4 px-4 text-left [&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-primary-deep">{icon}{label}</button>)}
        <div className="my-2 border-t border-border" />
        <button onClick={logout} className="flex h-12 w-full items-center gap-4 px-4 text-left"><LogOut className="h-5 w-5 text-muted-foreground" />Cerrar sesión</button>
        <button onClick={() => setConfirmDel(true)} className="flex h-12 w-full items-center gap-4 px-4 text-left text-destructive"><Trash2 className="h-5 w-5" />Eliminar mi cuenta</button>
      </div>
    </div>
    {confirmDel && <div onClick={(e) => e.stopPropagation()} className="contents"><Modal title="¿Eliminar tu cuenta?" close={() => setConfirmDel(false)}>
      <p className="text-sm text-muted-foreground">Se borrarán tus datos, lugares e historial. Esta acción no se puede deshacer.</p>
      <div className="mt-4 space-y-1"><Btn className="bg-destructive text-destructive-foreground" onClick={() => { say("Cuenta eliminada"); logout(); }}>Sí, eliminar</Btn><Btn variant="ghost" onClick={() => setConfirmDel(false)}>Cancelar</Btn></div>
    </Modal></div>}
  </div>;
}
