// app/api/smart-budget/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, total_budget } = body;

    const resp = await fetch("http://127.0.0.1:8000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, total_budget }),
    });

    const text = await resp.text();
    try {
      const json = JSON.parse(text || "{}");
      if (!resp.ok) {
        return NextResponse.json({ error: json?.detail || json?.error || text }, { status: resp.status });
      }
      return NextResponse.json(json);
    } catch (e) {
      // invalid json
      return NextResponse.json({ error: text || "Invalid response from ml-service" }, { status: 500 });
    }
  } catch (err) {
    console.error("api/smart-budget error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
