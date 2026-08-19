"use client";

// Shared primitives for the admin dashboard panels: layout chrome, number
// formatting, and two tiny inline-SVG charts. Kept here so every panel reads
// as one surface instead of four separately-invented tables.

import type { CSSProperties, ReactNode } from "react";

export const COLORS = {
  ink: "#1a1a1a",
  muted: "#6b6b6b",
  faint: "#9a9a9a",
  line: "#e8e8e8",
  good: "#1a7f37",
  warn: "#9a6700",
  bad: "#c93838",
  accent: "#2f6fed",
  surface: "#fafafa",
};

export const cell: CSSProperties = {
  padding: "9px 12px",
  borderBottom: `1px solid ${COLORS.line}`,
  fontSize: 13.5,
  verticalAlign: "top",
  textAlign: "left",
};

export const head: CSSProperties = {
  ...cell,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: COLORS.muted,
  borderBottom: `2px solid ${COLORS.line}`,
  whiteSpace: "nowrap",
  fontWeight: 600,
};

export const numCell: CSSProperties = {
  ...cell,
  textAlign: "right",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
};

export const numHead: CSSProperties = { ...head, textAlign: "right" };

export function money(v: number | null | undefined, dp = 0): string {
  if (v === null || v === undefined) return "—";
  return `$${v.toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })}`;
}

export function pct(v: number | null | undefined, dp = 1): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v.toFixed(dp)}%`;
}

export function rate(numerator: number, denominator: number): number | null {
  if (!denominator) return null;
  return (numerator / denominator) * 100;
}

export function Section({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: COLORS.muted,
              margin: 0,
              fontWeight: 700,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 12.5, color: COLORS.faint, margin: "4px 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${COLORS.line}`,
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  emphasis = false,
  tone,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  emphasis?: boolean;
  tone?: string;
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRight: `1px solid ${COLORS.line}`,
        flex: "1 1 150px",
        minWidth: 150,
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: COLORS.muted,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: emphasis ? 30 : 22,
          fontWeight: emphasis ? 700 : 600,
          color: tone ?? COLORS.ink,
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: COLORS.faint, marginTop: 5 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>{children}</div>
  );
}

/** Filled area sparkline. Values are plotted oldest-to-newest, left to right. */
export function Sparkline({
  values,
  width = 240,
  height = 44,
  color = COLORS.accent,
  baselineZero = true,
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  baselineZero?: boolean;
}) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = baselineZero ? 0 : Math.min(...values);
  const span = max - min || 1;
  const pad = 3;
  const x = (i: number) => (i / (values.length - 1)) * (width - pad * 2) + pad;
  const y = (v: number) =>
    height - pad - ((v - min) / span) * (height - pad * 2);

  const line = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${x(0)},${height} ${line} ${x(values.length - 1)},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", maxWidth: "100%" }}
      aria-hidden="true"
    >
      <polygon points={area} fill={color} opacity={0.1} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={2.8} fill={color} />
    </svg>
  );
}

/** Horizontal proportion bar used for funnel + completion rates. */
export function Bar({
  value,
  max,
  tone = COLORS.accent,
}: {
  value: number;
  max: number;
  tone?: string;
}) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      style={{
        background: COLORS.line,
        borderRadius: 999,
        height: 6,
        width: "100%",
        minWidth: 60,
        overflow: "hidden",
      }}
    >
      <div style={{ width: `${width}%`, background: tone, height: "100%" }} />
    </div>
  );
}

export function PanelError({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "#fdecec",
        color: COLORS.bad,
        borderRadius: 10,
        fontSize: 13.5,
      }}
    >
      {message}
    </div>
  );
}

export function PanelNote({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: COLORS.surface,
        border: `1px solid ${COLORS.line}`,
        color: COLORS.muted,
        borderRadius: 10,
        fontSize: 13.5,
      }}
    >
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <div style={{ padding: "16px 2px", color: COLORS.faint, fontSize: 13.5 }}>
      Loading…
    </div>
  );
}
