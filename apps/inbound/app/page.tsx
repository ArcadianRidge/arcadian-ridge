"use client";

import { useState } from "react";

export default function InboundPage() {
  const [reply, setReply] = useState("");
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const ref = params?.get("ref") ?? "";

  async function send(text: string) {
    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, attributionRef: ref }),
    });
    const data = await res.json();
    setReply(data.reply);
  }

  return (
    <main style={{ padding: 24, maxWidth: 480, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1>Arcadian Ridge</h1>
      <p>Ridgepoint Group, LLC — surplus recovery intake</p>
      {ref && <p style={{ fontSize: 12, color: "#666" }}>Ref: {ref}</p>}
      <button
        type="button"
        onClick={() => send("Hello, I received your letter")}
        style={{ padding: "12px 20px", minHeight: 44, marginTop: 16 }}
      >
        Start intake
      </button>
      {reply && (
        <blockquote style={{ marginTop: 16, padding: 12, background: "#f4f4f5", borderRadius: 8 }}>
          {reply}
        </blockquote>
      )}
    </main>
  );
}
