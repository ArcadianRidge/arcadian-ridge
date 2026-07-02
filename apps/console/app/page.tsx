"use client";

import { useEffect, useState } from "react";

export default function ConsolePage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/command")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <main style={{ padding: 24 }}>Loading Arcadian Ridge…</main>;

  const command = data.command as {
    metrics: Record<string, number>;
    mondayQueue: { pendingCount: number };
  };
  const items = data.workItems as Array<{ title: string; stage: string; grade?: string }>;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>Arcadian Ridge Command</h1>
      <p>Surplus recovery deal-flow engine — Ridgepoint Group, LLC</p>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, margin: "24px 0" }}>
        <Metric label="Queue depth" value={command.metrics.queueDepth} />
        <Metric label="Kill rate" value={`${Math.round(command.metrics.killRate * 100)}%`} />
        <Metric label="Monday pending" value={command.mondayQueue.pendingCount} />
      </section>
      <h2>Pipeline</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li key={item.title} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <strong>{item.title}</strong>
            <div style={{ fontSize: 14, color: "#555" }}>
              {item.stage} {item.grade ? `· Grade ${item.grade}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: "#f4f4f5", borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
