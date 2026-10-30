import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  User, MapPin, History, HeartPulse, HelpCircle, FileText, Car, LogOut, Trash2, ShieldCheck, Plus, Lock, Upload, MessageCircle,
  ArrowLeftRight, Star,
} from "lucide-react";
import { Btn, Field, LinkBtn, Modal, Page, Top, Label, Avatar, Status } from "./ui";
import { PLACES, SUPPORT_PHONE, soles, waLink, type Offer, type Place, type Trip } from "./data";
import { cn } from "@/lib/utils";

export type Contact = { name: string; phone: string };
export type UserData = { first: string; last: string; dni: string; phone: string; email: string; photo: string | null };
export type Debt = { amount: number; trip: string } | null;
export type AccountScreen = "profile" | "places" | "history" | "contacts" | "termsView" | "driverMode";

/* ---------- Términos: el botón Acepto se activa al llegar al final ---------- */
const TERMS: [string, string][] = [
  ["1. Qué es Taxi App", "Taxi App es una plataforma que conecta a pasajeros con conductores de Cerro de Pasco. El servicio de transporte lo presta el conductor; Taxi App no es una empresa de transporte ni cobra los viajes."],
  ["2. Tu cuenta", "Para usar la app necesitas un celular verificado y tu DNI. Cada DNI puede tener una sola cuenta. Eres responsable de que tus datos sean reales."],
  ["3. Precio y pago", "Antes de pedir el viaje ves un precio sugerido según la distancia, que puedes ajustar. Los conductores aceptan tu precio o hacen una contraoferta. Pagas directo al conductor, en efectivo o por Yape. La app no procesa pagos ni guarda dinero."],
  ["4. PIN de inicio y de fin", "Al subir le das al conductor el PIN de inicio. Al llegar, después de pagar, le das el PIN de fin. Así queda registrado que el viaje se pagó."],
  ["5. Cancelaciones", "Puedes cancelar mientras buscas conductor. Una vez que aceptas una oferta, el viaje no se puede cancelar, salvo que el auto o el conductor no coincidan con la app; en ese caso el viaje queda en revisión."],
  ["6. Deudas", "Si no pagas un viaje, se registra una deuda y tu cuenta se bloquea hasta que la regularices."],
  ["7. Seguridad", "Durante el viaje puedes usar el botón de emergencia para llamar al 105 y enviar tu ubicación a tus contactos. La central de Taxi App también recibe el aviso."],
  ["8. Tus datos personales", "Tratamos tus datos conforme a la Ley N.° 29733 de Protección de Datos Personales, solo para prestar el servicio, tu seguridad y la atención de reclamos. Puedes pedir la eliminación de tu cuenta desde el menú."],
  ["9. Calificaciones y reportes", "Al final de cada viaje puedes calificar al conductor y reportar problemas. El operador revisa cada reporte y puede suspender cuentas."],
];

export function TermsView({ back, onAccept }: { back?: () => void; onAccept?: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [end, setEnd] = useState(false);
  const check = () => { const b = box.current; if (b && b.scrollTop + b.clientHeight >= b.scrollHeight - 8) setEnd(true); };
  useEffect(check, []);
  return <Page><Top back={back} title="Términos y privacidad" />
    <div ref={box} onScroll={check} className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 text-sm leading-relaxed">
      {TERMS.map(([t, p]) => <div key={t}><h3 className="font-semibold">{t}</h3><p className="mt-1 text-muted-foreground">{p}</p></div>)}
      <p className="text-xs text-muted-foreground">Versión de prueba. El texto final lo redacta el Cliente con su asesoría legal.</p>
    </div>
    {onAccept && <div className="border-t border-border p-4">
      {!end && <p className="mb-2 text-center text-xs text-muted-foreground">Desliza hasta el final para aceptar</p>}
      <Btn disabled={!end} onClick={onAccept}>Acepto los términos</Btn>
    </div>}
  </Page>;
}

/* ---------- Contactos de emergencia (hasta 2) ---------- */
export function ContactsForm({ value, onSave, onSkip, back }: { value: Contact[]; onSave: (c: Contact[]) => void; onSkip?: () => void; back?: () => void }) {
  const [list, setList] = useState<Contact[]>(value.length ? value : [{ name: "", phone: "" }]);
  const set = (i: number, c: Contact) => setList(list.map((x, j) => (j === i ? c : x)));
  const valid = list.every((c) => c.name.trim() && c.phone.length === 9);
  return <Page>
    <div className="flex h-14 shrink-0 items-center justify-between px-2">
      {back ? <Top back={back} /> : <span />}
      {onSkip && <button onClick={onSkip} className="h-12 px-2 font-medium text-primary-deep">Omitir</button>}
    </div>
    <div className="flex-1 overflow-y-auto px-4">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary-deep"><HeartPulse className="h-7 w-7" /></div>
      <h1 className="text-2xl font-semibold">Contactos de emergencia</h1>
      <p className="mt-2 text-sm text-muted-foreground">Puedes agregar hasta 2. Si tienes una emergencia en un viaje, les enviaremos tu ubicación por WhatsApp.</p>
      {list.map((c, i) => <div key={i} className="mt-4 rounded-[20px] border border-border p-4">
        <div className="flex items-center justify-between"><p className="text-sm font-semibold">Contacto {i + 1}</p>
          {list.length > 1 && <button onClick={() => setList(list.filter((_, j) => j !== i))} className="text-sm text-destructive">Quitar</button>}</div>
        <Field className="mt-3" placeholder="Nombre (ej. Carlos Torres)" value={c.name} onChange={(e) => set(i, { ...c, name: e.target.value })} />
        <div className="mt-2 flex gap-2"><div className="flex h-12 items-center rounded-xl border border-input bg-card px-4">+51</div>
          <Field inputMode="numeric" placeholder="987 654 321" value={c.phone} onChange={(e) => set(i, { ...c, phone: e.target.value.replace(/\D/g, "").slice(0, 9) })} /></div>
      </div>)}
      {list.length < 2 && <button onClick={() => setList([...list, { name: "", phone: "" }])} className="mt-3 flex h-12 items-center gap-2 font-medium text-primary-deep"><Plus className="h-5 w-5" />Agregar otro contacto</button>}
    </div>
    <div className="p-4"><Btn disabled={!valid} onClick={() => onSave(list)}>Guardar</Btn></div>
  </Page>;
}

/* ---------- Mi perfil: nombre y DNI vienen del DNI validado, no se editan ---------- */
export function ProfileView({ user, setUser, back, say }: { user: UserData; setUser: (u: UserData) => void; back: () => void; say: (t: string) => void }) {
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  return <Page><Top back={back} title="Mi perfil" />
    <div className="flex-1 overflow-y-auto px-4">
      <div className="flex flex-col items-center">
        {user.photo ? <img src={user.photo} alt="Tu foto" className="h-24 w-24 rounded-full object-cover" /> : <Avatar text={user.first.slice(0, 1).toUpperCase() || "P"} size="h-24 w-24 text-3xl" />}
        <p className="mt-3 text-lg font-semibold">{user.first} {user.last}</p>
        <span className="mt-1 flex items-center gap-1 text-sm text-primary-deep"><ShieldCheck className="h-4 w-4" />Verificado con tu DNI</span>
      </div>
      <div className="mt-6 divide-y divide-border rounded-[20px] border border-border text-sm">
        {[["Nombres", user.first], ["Apellidos", user.last], ["DNI", user.dni]].map(([k, v]) => <div key={k} className="flex items-center justify-between px-4 py-3">
          <span className="text-muted-foreground">{k}</span><span className="flex items-center gap-1.5 font-medium">{v}<Lock className="h-3.5 w-3.5 text-muted-foreground" /></span></div>)}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Tu nombre y DNI no se pueden cambiar porque los validamos con tu documento.</p>
      <Label>Celular</Label>
      <div className="flex gap-2"><div className="flex h-12 items-center rounded-xl border border-input bg-card px-4">+51</div>
        <Field inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} /></div>
      <Label>Correo (opcional)</Label>
      <Field type="email" placeholder="tucorreo@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
    </div>
    <div className="p-4"><Btn disabled={phone.length !== 9} onClick={() => { setUser({ ...user, phone, email }); say("Datos guardados"); back(); }}>Guardar cambios</Btn></div>
  </Page>;
}

/* ---------- Mis lugares ---------- */
export function PlacesView({ saved, setSaved, back }: { saved: Place[]; setSaved: (p: Place[]) => void; back: () => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const add = () => {
    setSaved([...saved, { name, detail, pos: [55, 70], km: 2.5, min: 8, price: 6 }]);
    setName(""); setDetail(""); setAdding(false);
  };
  return <Page><Top back={back} title="Mis lugares" />
    <div className="flex-1 overflow-y-auto px-4">
      <Label className="mt-0">Guardados</Label>
      <div className="divide-y divide-border rounded-[20px] border border-border">
        {saved.map((p) => <div key={p.name} className="flex items-center gap-3 px-4 py-3">
          <MapPin className="h-5 w-5 text-primary-deep" /><span className="flex-1"><b className="block font-medium">{p.name}</b><span className="text-sm text-muted-foreground">{p.detail}</span></span>
          <button aria-label={`Quitar ${p.name}`} onClick={() => setSaved(saved.filter((x) => x !== p))} className="flex h-10 w-10 items-center justify-center text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
        </div>)}
        {!saved.length && <p className="p-4 text-sm text-muted-foreground">Aún no guardas lugares.</p>}
      </div>
      {adding ? <div className="mt-3 space-y-2 rounded-[20px] border border-primary p-4">
        <Field autoFocus placeholder="Nombre (ej. Casa de mamá)" value={name} onChange={(e) => setName(e.target.value)} />
        <Field placeholder="Dirección o referencia" value={detail} onChange={(e) => setDetail(e.target.value)} />
        <Btn disabled={!name.trim() || !detail.trim()} onClick={add}>Guardar lugar</Btn>
      </div> : <button onClick={() => setAdding(true)} className="mt-3 flex h-12 items-center gap-2 font-medium text-primary-deep"><Plus className="h-5 w-5" />Agregar lugar</button>}
      <Label>Lugares frecuentes de la ciudad</Label>
      <div className="flex flex-wrap gap-2 pb-4">{PLACES.filter((p) => !p.outOfZone).map((p) => <span key={p.name} className="rounded-full bg-primary-soft px-3 py-1.5 text-sm text-primary-deep">{p.name}</span>)}</div>
    </div>
  </Page>;
}

/* ---------- Historial ---------- */
const TONE = { "Finalizado": "success", "Cancelado": "destructive", "En revisión": "warning" } as const;
export function HistoryView({ trips, back }: { trips: Trip[]; back: () => void }) {
  return <Page><Top back={back} title="Historial de viajes" />
    <div className="flex-1 space-y-3 overflow-y-auto px-4">
      {trips.map((t, i) => <div key={i} className="rounded-[20px] border border-border p-4 text-sm">
        <div className="flex items-center justify-between"><span className="text-muted-foreground">{t.date}</span><Status tone={TONE[t.status]}>{t.status}</Status></div>
        <p className="mt-2 font-semibold">{t.from} → {t.to}</p>
        <div className="mt-1 flex justify-between text-muted-foreground"><span>{t.driver}</span><b className="text-foreground">{soles(t.price)}</b></div>
      </div>)}
    </div>
    <div className="p-4">
      <p className="mb-2 text-center text-sm text-muted-foreground">¿Olvidaste algo o tuviste un problema?</p>
      <LinkBtn variant="secondary" href={waLink(SUPPORT_PHONE, "Hola, tengo un problema con un viaje de Taxi App.")}><MessageCircle className="h-5 w-5" />Escribir a soporte</LinkBtn>
    </div>
  </Page>;
}

/* ---------- Mini perfil del conductor ---------- */
export function DriverProfile({ d, close }: { d: Offer; close: () => void }) {
  return <Modal title="Perfil del conductor" close={close}>
    <div className="flex flex-col items-center text-center">
      <Avatar text={d.photo} size="h-20 w-20 text-2xl" />
      <p className="mt-2 text-lg font-semibold">{d.name}</p>
      <p className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-accent text-accent" />{d.rating} · {d.trips} viajes</p>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
      <div className="rounded-xl bg-muted p-2"><p className="text-muted-foreground">Auto</p><b>{d.car}</b></div>
      <div className="rounded-xl bg-muted p-2"><p className="text-muted-foreground">Color</p><b>{d.color}</b></div>
      <div className="rounded-xl bg-muted p-2"><p className="text-muted-foreground">Asientos</p><b>{d.seats}</b></div>
    </div>
    <Label>Últimos comentarios</Label>
    <div className="space-y-2">{d.reviews.map((r) => <div key={r.name} className="rounded-xl border border-border p-3 text-sm">
      <div className="flex justify-between"><b>{r.name}</b><span className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={cn("h-3.5 w-3.5", n <= r.stars ? "fill-accent text-accent" : "text-border")} />)}</span></div>
      <p className="mt-1 text-muted-foreground">"{r.text}"</p></div>)}</div>
  </Modal>;
}

/* ---------- Cambiar de rol con un clic ---------- */
export function DriverModeView({ back, say }: { back: () => void; say: (t: string) => void }) {
  return <Page><Top back={back} />
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-soft text-primary-deep"><Car className="h-12 w-12" /></div>
      <h1 className="mt-6 text-2xl font-semibold">Modo conductor</h1>
      <p className="mt-2 text-muted-foreground">Tu cuenta es la misma: tu historial y tus datos de pasajero se mantienen. Para recibir viajes, registra tus documentos y tu auto.</p>
    </div>
    <div className="space-y-1 p-4">
      <Btn onClick={() => say("Aquí se abre el registro del conductor")}>Registrarme como conductor</Btn>
      <Btn variant="ghost" onClick={back}><ArrowLeftRight className="h-5 w-5" />Volver a modo pasajero</Btn>
    </div>
  </Page>;
}

/* ---------- Cuenta bloqueada por deuda ---------- */
export function DebtView({ debt, onPaid }: { debt: NonNullable<Debt>; onPaid: () => void }) {
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  return <Page>
    <div className="flex-1 overflow-y-auto px-4 pt-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive"><Lock className="h-10 w-10" /></div>
      <h1 className="mt-4 text-center text-2xl font-semibold">Tu cuenta está bloqueada</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">El conductor reportó que no recibió el pago del viaje a <b className="text-foreground">{debt.trip}</b>. Regulariza tu deuda para volver a pedir taxis.</p>
      <div className="mt-6 rounded-[20px] bg-card p-4 text-center shadow-float">
        <p className="text-sm text-muted-foreground">Deuda pendiente</p>
        <p className="text-3xl font-bold text-destructive">{soles(debt.amount)}</p>
        <p className="mt-2 text-sm">Yape a <b>{SUPPORT_PHONE.replace(/(\d{3})(?=\d)/g, "$1 ")}</b> · Taxi App</p>
      </div>
      {sent ? <div className="mt-4 rounded-xl bg-primary-soft p-4 text-center text-sm text-primary-deep">Comprobante enviado. El operador lo validará y te avisaremos.</div>
        : <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground"><li>Paga el monto por Yape.</li><li>Sube la captura del pago.</li><li>El operador la valida y se desbloquea tu cuenta.</li></ol>}
    </div>
    <div className="space-y-1 p-4">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files?.length) setSent(true); }} />
      {sent ? <Btn variant="secondary" onClick={onPaid}>Simular: el operador validó el pago</Btn>
        : <Btn onClick={() => fileRef.current?.click()}><Upload className="h-5 w-5" />Subir comprobante de pago</Btn>}
      <LinkBtn variant="ghost" href={waLink(SUPPORT_PHONE, "Hola, quiero consultar sobre la deuda de mi cuenta de Taxi App.")}>¿No estás de acuerdo? Escríbenos</LinkBtn>
    </div>
  </Page>;
}

/* ---------- Menú lateral ---------- */
export function MenuDrawer({ user, debt, close, open, logout, onDelete }: {
  user: UserData; debt: Debt; close: () => void; open: (s: AccountScreen) => void; logout: () => void; onDelete: () => void;
}) {
  const [modal, setModal] = useState<"delete" | "role" | null>(null);
  const items: [ReactNode, string, AccountScreen][] = [
    [<User key="u" />, "Mi perfil", "profile"], [<MapPin key="m" />, "Mis lugares", "places"], [<History key="h" />, "Historial de viajes", "history"],
    [<HeartPulse key="e" />, "Contactos de emergencia", "contacts"], [<FileText key="t" />, "Términos y privacidad", "termsView"],
  ];
  const row = "flex h-12 w-full items-center gap-4 px-4 text-left [&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-primary-deep";
  return <div className="absolute inset-0 z-40 flex bg-foreground/40" onClick={close}>
    <div className="flex h-full w-[82%] flex-col bg-card" onClick={(e) => e.stopPropagation()}>
      <div className="bg-primary-deep px-4 pb-5 pt-10 text-primary-foreground">
        {user.photo ? <img src={user.photo} alt="" className="h-14 w-14 rounded-full object-cover" /> : <Avatar text={user.first.slice(0, 1).toUpperCase() || "P"} size="h-14 w-14 bg-primary text-xl" />}
        <p className="mt-3 text-lg font-semibold">{user.first} {user.last}</p><p className="text-sm opacity-80">+51 {user.phone}</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {items.map(([icon, label, s]) => <button key={label} onClick={() => open(s)} className={row}>{icon}{label}</button>)}
        <a href={waLink(SUPPORT_PHONE, "Hola, necesito ayuda con Taxi App.")} target="_blank" rel="noreferrer" className={row}><HelpCircle />Ayuda por WhatsApp</a>
        <button onClick={() => setModal("role")} className={row}><ArrowLeftRight />Cambiar a modo conductor</button>
        <div className="my-2 border-t border-border" />
        <button onClick={logout} className="flex h-12 w-full items-center gap-4 px-4 text-left"><LogOut className="h-5 w-5 text-muted-foreground" />Cerrar sesión</button>
        <button onClick={() => setModal("delete")} className="flex h-12 w-full items-center gap-4 px-4 text-left text-destructive"><Trash2 className="h-5 w-5" />Eliminar mi cuenta</button>
      </div>
    </div>
    {modal === "role" && <div onClick={(e) => e.stopPropagation()} className="contents"><Modal title="¿Cambiar a modo conductor?" close={() => setModal(null)}>
      <p className="text-sm text-muted-foreground">Usarás la misma cuenta. Puedes volver a modo pasajero cuando quieras.</p>
      <div className="mt-4 space-y-1"><Btn onClick={() => open("driverMode")}>Cambiar a conductor</Btn><Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn></div>
    </Modal></div>}
    {modal === "delete" && <div onClick={(e) => e.stopPropagation()} className="contents">{debt
      ? <Modal title="No puedes eliminar tu cuenta" close={() => setModal(null)}>
        <p className="text-sm text-muted-foreground">Tienes una deuda pendiente de <b className="text-foreground">{soles(debt.amount)}</b>. Cuando la regularices podrás eliminar tu cuenta.</p>
        <Btn variant="ghost" className="mt-4" onClick={() => setModal(null)}>Entendido</Btn>
      </Modal>
      : <Modal title="¿Eliminar tu cuenta?" close={() => setModal(null)}>
        <p className="text-sm text-muted-foreground">Se eliminarán tus datos, lugares e historial. Esta acción no se puede deshacer.</p>
        <div className="mt-4 space-y-1"><Btn variant="sos" onClick={onDelete}>Sí, eliminar</Btn><Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn></div>
      </Modal>}</div>}
  </div>;
}
