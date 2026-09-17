import React from "react";
import { AlertTriangle, X, CheckCircle2, Loader2, Info } from "lucide-react";
import { cx, STATUS, SEVERITY, SERVICES } from "../../utils/constants";

/* ── buttons ─────────────────────────────────────────────────────────
   One consistent button system with three roles:
     • primary   – the main action (official green)
     • outline   – secondary action (aliased as "secondary")
     • danger    – emergency / destructive (solid red)
   plus an optional low-emphasis "ghost" for icon/inline actions.
   All variants share the same height, padding, radius, font, icon
   alignment, hover, focus, disabled and transition treatment. */
const BTN_VARIANTS = {
  primary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
  ghost: "text-slate-600 hover:bg-slate-100",
};
const BTN_SIZES = {
  sm: "px-3.5 py-2 text-sm",   // 14px — meets the minimum button text size
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base", // 16px
};
export const Btn = ({ children, onClick, variant = "primary", size = "md", className = "", disabled, type = "button", ...rest }) => {
  const v = BTN_VARIANTS[variant] || BTN_VARIANTS.primary;
  const s = BTN_SIZES[size] || BTN_SIZES.md;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white",
        "disabled:opacity-50 disabled:cursor-not-allowed", v, s, className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = "" }) => (
  <div className={cx("bg-white border border-slate-200 rounded-xl shadow-card", className)}>{children}</div>
);

export const Pill = ({ className = "", children }) => (
  <span className={cx("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide", className)}>
    {children}
  </span>
);
export const StatusPill = ({ status }) => <Pill className={STATUS[status]?.pill}>{STATUS[status]?.label || status}</Pill>;
export const SeverityPill = ({ sev }) => (
  <Pill className={SEVERITY[sev]?.pill}>
    <span className={cx("w-1.5 h-1.5 rounded-full", SEVERITY[sev]?.dot)} />
    {sev}
  </Pill>
);
export const ServicePill = ({ svc }) => {
  const S = SERVICES[svc];
  if (!S) return null;
  const Icon = S.icon;
  return (
    <Pill className={S.pill}>
      <Icon size={12} /> {S.label}
    </Pill>
  );
};

export const Eyebrow = ({ children, className = "" }) => (
  <div className={cx("text-xs font-bold tracking-[0.18em] uppercase text-emerald-600 inline-flex items-center gap-1.5", className)}>{children}</div>
);

export const StatCard = ({ icon: Icon, label, value, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    info: "bg-emerald-50 text-emerald-700",
  };
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className={cx("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", tones[tone] || tones.slate)}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold font-mono text-slate-900 leading-none">{value}</div>
        <div className="text-xs font-medium text-slate-500 mt-1.5 truncate uppercase tracking-wide">{label}</div>
      </div>
    </Card>
  );
};

export const Field = ({ label, hint, error, children }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}
    {children}
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    {error && <p className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertTriangle size={12} /> {error}</p>}
  </div>
);
export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500";
export const TextInput = (props) => <input {...props} className={cx(inputCls, props.className)} />;
export const TextArea = (props) => <textarea {...props} className={cx(inputCls, "min-h-[96px] leading-relaxed", props.className)} />;
export const Select = ({ options, children, ...props }) => (
  <select {...props} className={cx(inputCls, "appearance-none bg-no-repeat", props.className)}
    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C636A' stroke-width='2.2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: "right 12px center", paddingRight: 36 }}>
    {options ? options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    )) : children}
  </select>
);

export const Spinner = ({ size = 18, className = "" }) => (
  <Loader2 size={size} className={cx("animate-spin", className)} />
);

export const Skeleton = ({ className = "" }) => (
  <div className={cx("animate-pulse bg-slate-200 rounded-lg", className)} />
);

export const EmptyState = ({ icon: Icon = Info, title, note }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
    <div className="w-13 h-13 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3" style={{ width: 52, height: 52 }}>
      <Icon size={22} />
    </div>
    <div className="text-sm font-semibold text-slate-700">{title}</div>
    {note && <div className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">{note}</div>}
  </div>
);

export const Alert = ({ tone = "error", children }) => {
  const tones = {
    error: "bg-red-50 border-red-200 text-red-700",
    red: "bg-red-50 border-red-200 text-red-700",
    danger: "bg-red-50 border-red-200 text-red-700",
    info: "bg-emerald-50 border-emerald-200 text-emerald-700",
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    warn: "bg-amber-50 border-amber-200 text-amber-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  };
  const Icon = tone === "info" || tone === "green" || tone === "success" ? Info : AlertTriangle;
  return (
    <div className={cx("flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium", tones[tone] || tones.error)}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
};

export const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-xl shadow-pop w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Toasts = ({ toasts }) => (
  <div className="fixed bottom-4 right-4 z-[60] space-y-2 w-72" role="status" aria-live="polite">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={cx(
          "rounded-lg px-4 py-3 text-sm font-semibold shadow-pop border flex items-center gap-2 bg-white",
          t.tone === "success" && "border-emerald-200 text-emerald-700",
          t.tone === "error" && "border-red-200 text-red-700",
          (!t.tone || t.tone === "info") && "border-slate-200 text-slate-700"
        )}
      >
        {t.tone === "success" ? <CheckCircle2 size={16} className="text-emerald-500" /> : t.tone === "error" ? <AlertTriangle size={16} className="text-red-500" /> : <Info size={16} className="text-slate-500" />}
        <span>{t.msg}</span>
      </div>
    ))}
  </div>
);
