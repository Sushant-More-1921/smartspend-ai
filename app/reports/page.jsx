"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const currencyINR = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

export default function ReportsPage() {
  const [filter, setFilter] = useState("month"); // day, week, month, year
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null); // 'pdf' | 'excel' | null
  const [error, setError] = useState(null);

  async function fetchReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/reports?filter=${filter}&date=${date}`);
      setReport(res.data);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(err?.response?.data?.error || err.message || "Fetch failed");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, date]);

  async function exportReport(format) {
    try {
      setExportingFormat(format);
      const res = await axios.post(
        `/api/reports?format=${format}&filter=${filter}&date=${date}`,
        {},
        { responseType: "blob" }
      );

      const ext = format === "pdf" ? "pdf" : "xlsx";
      const filename = `SmartReport-${filter}-${date}.${ext}`;
      const blob = new Blob([res.data], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, filename);
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExportingFormat(null);
    }
  }

  const chartData =
    report?.trend?.map((d) => ({
      ...d,
      income: Number(d.income),
      expense: Number(d.expense),
      date: d.dateLabel || d.date,
    })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0326] via-[#1a0033] to-[#1a1630] p-8 text-gray-200">
      <motion.div
        className="max-w-6xl mx-auto rounded-2xl p-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
            Reports
          </h1>

          <div className="flex gap-3 items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#1e1027] border border-[#2d2036] px-3 py-2 rounded-lg text-sm"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#1e1027] border border-[#2d2036] px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
            />
          </div>
        </header>

        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <div className="text-gray-400">Generating report...</div>
          </div>
        ) : error ? (
          <div className="p-6 bg-[#2a1830] rounded-xl border border-[#3b2347]">
            <strong className="text-red-400">Error:</strong> {error}
          </div>
        ) : !report ? (
          <div className="py-24 flex items-center justify-center text-gray-400">
            No data found for this period.
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card color="blue">
                <h3 className="text-sm opacity-80">Total Income</h3>
                <div className="text-2xl font-bold mt-2">{currencyINR(Number(report.totalIncome))}</div>
              </Card>
              <Card color="red">
                <h3 className="text-sm opacity-80">Total Expenses</h3>
                <div className="text-2xl font-bold mt-2">{currencyINR(Number(report.totalExpenses))}</div>
              </Card>
              <Card color="green">
                <h3 className="text-sm opacity-80">Savings</h3>
                <div className="text-2xl font-bold mt-2">{currencyINR(Number(report.savings))}</div>
              </Card>
              <Card color="yellow">
                <h3 className="text-sm opacity-80">Net Change</h3>
                <div className="text-2xl font-bold mt-2">{currencyINR(Number(report.netChange))}</div>
              </Card>
            </div>

            {/* Chart */}
            <div className="mb-8 p-6 bg-[#191021] rounded-xl border border-[#2d2036]">
              <h2 className="text-lg font-semibold mb-4 text-white">Income vs Expenses Overview</h2>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid stroke="#2b2336" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#cfc1ea" }}
                      tickFormatter={(v) => (filter === "year" ? v : v)}
                    />
                    <YAxis tick={{ fill: "#cfc1ea" }} />
                    <Tooltip
                      cursor={false}
                      formatter={(val, name) => [
                        currencyINR(Number(val)),
                        name === "income" ? "Income" : "Expense",
                      ]}
                      contentStyle={{ background: "#0f0914", borderRadius: 8, borderColor: "#2d2036" }}
                    />
                    <Legend
                      formatter={(value) => (value === "income" ? "Income (₹)" : "Expense (₹)")}
                      wrapperStyle={{ color: "#cfc1ea", paddingTop: 10 }}
                    />
                    <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
                    <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Export */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => exportReport("pdf")}
                disabled={!!exportingFormat}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#6d28d9] to-[#ec4899] hover:opacity-95 disabled:opacity-50 transition-opacity"
              >
                {exportingFormat === "pdf" ? "Exporting PDF..." : "Export PDF"}
              </button>
              <button
                onClick={() => exportReport("excel")}
                disabled={!!exportingFormat}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#059669] to-[#10b981] hover:opacity-95 disabled:opacity-50 transition-opacity"
              >
                {exportingFormat === "excel" ? "Exporting Excel..." : "Export Excel"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function Card({ children, color = "blue" }) {
  const colorMap = {
    blue: "border-blue-800",
    red: "border-red-800",
    green: "border-green-800",
    yellow: "border-yellow-800",
  };
  return (
    <div className={`p-6 rounded-xl bg-[#15101a] border ${colorMap[color]} shadow-sm`}>
      {children}
    </div>
  );
}
