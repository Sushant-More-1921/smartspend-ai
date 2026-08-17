import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as XLSX from "xlsx";

dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);

function sanitizePdfText(str) {
  if (!str) return "";
  return String(str)
    .replace(/₹/g, "Rs. ")
    .replace(/—/g, "-")
    .replace(/•/g, "*")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
}

async function getReportData(filter, dateStr) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const date = dayjs(dateStr);
  let start, end;
  switch (filter) {
    case "day":
      start = date.startOf("day").toDate();
      end = date.endOf("day").toDate();
      break;
    case "week":
      start = date.startOf("week").toDate();
      end = date.endOf("week").toDate();
      break;
    case "year":
      start = date.startOf("year").toDate();
      end = date.endOf("year").toDate();
      break;
    default:
      start = date.startOf("month").toDate();
      end = date.endOf("month").toDate();
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      transactions: {
        where: {
          date: { gte: start, lte: end },
        },
        orderBy: { date: "asc" },
        select: {
          id: true,
          type: true,
          amount: true,
          date: true,
          category: true,
          description: true,
        },
      },
    },
  });

  if (!user) throw new Error("User not found in database");

  const txns = user.transactions || [];

  const normalized = (txns || []).map((t) => ({
    ...t,
    amountNum: Number(t.amount) || 0,
  }));

  const totalIncome = normalized
    .filter((t) => String(t.type).toLowerCase() === "income")
    .reduce((sum, t) => sum + t.amountNum, 0);

  const totalExpenses = normalized
    .filter((t) => String(t.type).toLowerCase() === "expense")
    .reduce((sum, t) => sum + t.amountNum, 0);

  const savings = totalIncome - totalExpenses;

  // Sorted transactions
  const sorted = [...normalized].sort((a, b) => b.amountNum - a.amountNum);

  // Top & bottom 5
  const highestTransactions = sorted.slice(0, 5).map((t) => ({
    category: t.category || "Unknown",
    amount: t.amountNum,
  }));
  const lowestTransactions = sorted
    .slice(-5)
    .reverse()
    .map((t) => ({
      category: t.category || "Unknown",
      amount: t.amountNum,
    }));

  // Trend aggregation
  const trendMap = {};
  normalized.forEach((t) => {
    let key, label;
    if (filter === "year") {
      key = dayjs(t.date).format("MM");
      label = dayjs(t.date).format("MMM");
    } else {
      key = dayjs(t.date).format("YYYY-MM-DD");
      label = dayjs(t.date).format("DD MMM");
    }

    if (!trendMap[key])
      trendMap[key] = { income: 0, expense: 0, date: key, dateLabel: label };

    const trendKey = String(t.type).toLowerCase() === "income" ? "income" : "expense";
    trendMap[key][trendKey] += t.amountNum;
  });

  const trend = Object.values(trendMap).sort((a, b) =>
    a.date > b.date ? 1 : -1
  );

  // Basic insights
  const insights = [];
  if (savings > 0) insights.push("You saved more than you spent");
  if (totalExpenses > totalIncome) insights.push("Expenses exceeded income");
  if (highestTransactions.length > 0) {
    insights.push(
      `Your highest spend category was ${highestTransactions[0].category} (Rs. ${highestTransactions[0].amount})`
    );
  }

  return {
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    savings: Number(savings.toFixed(2)),
    netChange: Number(savings.toFixed(2)),
    trend,
    highestTransactions,
    lowestTransactions,
    insights,
  };
}

/* ---------------------- API HANDLERS ---------------------- */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const filter = url.searchParams.get("filter") || "month";
    const date = url.searchParams.get("date") || new Date().toISOString();
    const report = await getReportData(filter, date);
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/reports error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error generating report" }),
      { status: 400 }
    );
  }
}

/* ---------------------- PDF Generator ---------------------- */
async function generatePDF(report, filter, dateStr) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const title = sanitizePdfText(`SmartSpend Report - ${filter.toUpperCase()} - ${dateStr}`);
  page.drawText(title, {
    x: 40,
    y: height - 50,
    size: 18,
    font,
    color: rgb(0.85, 0.4, 0.9),
  });

  const leftX = 40;
  let y = height - 90;
  const addLine = (text, size = 12, offset = 18) => {
    const cleanText = sanitizePdfText(text);
    if (cleanText) {
      page.drawText(cleanText, { x: leftX, y, size, font, color: rgb(0.1, 0.1, 0.1) });
      y -= offset;
    }
  };

  addLine(`Total Income: Rs. ${report.totalIncome.toLocaleString("en-IN")}`);
  addLine(`Total Expenses: Rs. ${report.totalExpenses.toLocaleString("en-IN")}`);
  addLine(`Savings: Rs. ${report.savings.toLocaleString("en-IN")}`);
  addLine(`Net Change: Rs. ${report.netChange.toLocaleString("en-IN")}`);

  // Safe loops
  y -= 10;
  page.drawText("Top Transactions (Highest):", {
    x: leftX,
    y,
    size: 13,
    font,
    color: rgb(0.4, 0.2, 0.6),
  });
  y -= 20;
  (report.highestTransactions || []).forEach((t) => {
    addLine(`* ${t.category} - Rs. ${t.amount}`, 11, 16);
  });

  y -= 10;
  page.drawText("Top Transactions (Lowest):", {
    x: leftX,
    y,
    size: 13,
    font,
    color: rgb(0.4, 0.2, 0.6),
  });
  y -= 20;
  (report.lowestTransactions || []).forEach((t) => {
    addLine(`* ${t.category} - Rs. ${t.amount}`, 11, 16);
  });

  y -= 10;
  page.drawText("Insights:", {
    x: leftX,
    y,
    size: 13,
    font,
    color: rgb(0.4, 0.2, 0.6),
  });
  y -= 20;
  (report.insights || []).forEach((ins) => addLine(`* ${ins}`, 11, 16));

  const pdfBytes = await pdfDoc.save();
  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=SmartReport-${filter}-${dateStr}.pdf`,
    },
  });
}

/* ---------------------- Excel Generator ---------------------- */
async function generateExcel(report, filter, dateStr) {
  const sheetData = [
    ["SmartSpend Report", `${filter} - ${dateStr}`],
    [],
    ["Total Income", report.totalIncome],
    ["Total Expenses", report.totalExpenses],
    ["Savings", report.savings],
    ["Net Change", report.netChange],
    [],
    ["Highest Transactions"],
    ["Category", "Amount"],
    ...(report.highestTransactions || []).map((t) => [t.category, t.amount]),
    [],
    ["Lowest Transactions"],
    ["Category", "Amount"],
    ...(report.lowestTransactions || []).map((t) => [t.category, t.amount]),
    [],
    ["Insights"],
    ...(report.insights || []).map((i) => [i]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  const excelBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

  return new Response(Buffer.from(excelBuffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=SmartReport-${filter}-${dateStr}.xlsx`,
    },
  });
}

/* ---------------------- POST Handler ---------------------- */
export async function POST(req) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "pdf";
    const filter = url.searchParams.get("filter") || "month";
    const date = url.searchParams.get("date") || new Date().toISOString();

    const report = await getReportData(filter, date);

    if (format === "pdf") return await generatePDF(report, filter, date);
    if (["excel", "xlsx"].includes(format))
      return await generateExcel(report, filter, date);

    return new Response(JSON.stringify({ error: "Invalid format" }), {
      status: 400,
    });
  } catch (err) {
    console.error("POST /api/reports/export error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
