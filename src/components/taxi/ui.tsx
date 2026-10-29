import type { ButtonHTMLAttributes, ReactNode, InputHTMLAttributes } from "react";
import { Car, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

type BtnVariant = "primary" | "secondary" | "danger" | "ghost" | "accent";
const btn: Record<BtnVariant, string> = {
  primary: "bg-primary text-primary-foreground font-semibold active:bg-primary-deep disabled:opacity-40",
  secondary: "border-2 border-primary bg-card text-primary-deep font-semibold",
  danger: "text-destructive font-semibold",
  ghost: "text-primary-deep font-medium",
  accent: "bg-accent text-accent-foreground font-semibold",
};
export function Btn({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return <button {...p} className={cn("flex h-[52px] w-full items-center justify-center gap-2 rounded-xl text-base transition-colors", btn[variant], className)} />;
}

export function Field({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn("h-12 w-full rounded-xl border border-input bg-card px-4 text-base outline-none focus:border-primary", className)} />;
}

export function Chip({ children, onClick, active }: { children: ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={cn("flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium", active ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary-deep")}>
      {children}
    </button>
  );
}

export function Sheet({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("absolute inset-x-0 bottom-0 z-20 max-h-[78%] overflow-y-auto rounded-t-[20px] bg-card px-4 pb-6 pt-3 shadow-sheet", className)}>
    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
    {children}
  </div>;
}

export function Status({ tone, children }: { tone: "info" | "success" | "warning" | "primary" | "destructive"; children: ReactNode }) {
  const m = { info: "bg-info", success: "bg-success", warning: "bg-warning", primary: "bg-primary", destructive: "bg-destructive" };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground", m[tone])}>{children}</span>;
}

/** Static street map with pins. Positions in % of the map box. */
export function StaticMap({ origin, dest, car, route, draggableOrigin, onOriginMove }: {
  origin?: [number, number]; dest?: [number, number]; car?: [number, number]; route?: [number, number][];
  draggableOrigin?: boolean; onOriginMove?: (p: [number, number]) => void;
}) {
  const handle = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggableOrigin || !onOriginMove || e.buttons !== 1) return;
    const r = e.currentTarget.getBoundingClientRect();
    onOriginMove([((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100]);
  };
  return (
    <div className="absolute inset-0 overflow-hidden bg-map-bg" onPointerDown={handle} onPointerMove={handle} style={{ touchAction: draggableOrigin ? "none" : undefined }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {Array.from({ length: 6 }).map((_, i) => Array.from({ length: 9 }).map((_, j) => (
          <rect key={`${i}-${j}`} x={i * 17 + 2} y={j * 11.5 + 2} width={13} height={8.5} rx={1} className={(i + j) % 7 === 3 ? "fill-map-park" : "fill-map-block"} />
        )))}
        <path d="M0 62 L100 38" strokeWidth={3} className="stroke-map-road" fill="none" />
        <path d="M30 0 Q42 50 58 100" strokeWidth={2.5} className="stroke-map-road" fill="none" />
        {route && <polyline points={route.map((p) => p.join(",")).join(" ")} fill="none" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" className="stroke-primary" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 5 }} />}
      </svg>
      {origin && <Pin at={origin}><span className="relative flex h-6 w-6 items-center justify-center"><span className="halo absolute inset-0 rounded-full bg-primary" /><span className="h-5 w-5 rounded-full border-4 border-card bg-primary shadow-float" /></span></Pin>}
      {dest && <Pin at={dest} bottom><div className="flex h-8 w-8 items-center justify-center rounded-full rounded-br-none rotate-45 bg-accent shadow-float"><span className="h-2.5 w-2.5 rounded-full bg-card" /></div></Pin>}
      {car && <Pin at={car}><span className="relative flex h-10 w-10 items-center justify-center transition-all"><span className="halo absolute inset-0 rounded-full bg-primary/40" /><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float"><Car className="h-5 w-5" /></span></span></Pin>}
      {draggableOrigin && <div className="pointer-events-none absolute right-3 top-20 flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-float"><Navigation className="h-3.5 w-3.5 text-primary-deep" />Toca el mapa para mover tu origen</div>}
    </div>
  );
}
function Pin({ at, children, bottom }: { at: [number, number]; children: ReactNode; bottom?: boolean }) {
  return <div className="pointer-events-none absolute transition-all duration-700" style={{ left: `${at[0]}%`, top: `${at[1]}%`, transform: bottom ? "translate(-50%,-110%)" : "translate(-50%,-50%)" }}>{children}</div>;
}
