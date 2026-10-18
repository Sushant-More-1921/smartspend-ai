// app/api/smart-budget/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, total_budget } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid Email" }, { status: 400 });
    }

    const ML_SERVICE_URL = (
      process.env.ML_SERVICE_URL || "http://localhost:8000"
    ).replace(/\/$/, "");

    const resp = await fetch(`${ML_SERVICE_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), total_budget }),
    });

    const text = await resp.text();
    try {
      const json = JSON.parse(text || "{}");
      if (!resp.ok) {
        return NextResponse.json(
          { error: json?.detail || json?.error || "Recommendation service error" },
          { status: resp.status }
        );
      }
      return NextResponse.json(json);
    } catch {
      return NextResponse.json(
        { error: "Recommendation service unavailable or invalid response" },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("api/smart-budget error:", err);
    return NextResponse.json(
      { error: "Failed to connect to recommendation service" },
      { status: 500 }
    );
  }
}
