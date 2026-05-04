import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, ResponsiveContainer, Legend
} from "recharts";

const API = "";

const COLORS = [
  "#f97316", "#3b82f6", "#10b981", "#a855f7",
  "#ef4444", "#eab308", "#06b6d4", "#ec4899",
  "#84cc16", "#f59e0b"
];

// fix timestamp → readable date
function formatDate(val) {
  if (!val) return "";
  const d = new Date(typeof val === "number" ? val : Number(val));
  if (isNaN(d)) return String(val).slice(0, 10);
  return d.toLocaleDateString("fr-MA", { day: "2-digit", month: "short" });
}

// custom tooltip for line chart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1a2e", border: "1px solid #333",
      borderRadius: 8, padding: "10px 14px", fontSize: 12
    }}>
      <p style={{ color: "#aaa", margin: "0 0 6px" }}>{formatDate(label)}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0", fontWeight: 500 }}>
          {p.name}: <span style={{ color: "#fff" }}>{Math.round(p.value).toLocaleString()} MAD</span>
        </p>
      ))}
    </div>
  );
}

export default function App() {
  const [counts, setCounts]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery]           = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]   = useState(false);
  const [searched, setSearched]     = useState(false);

  useEffect(() => {
    fetch(`${API}/category-count`)
      .then(r => r.json()).then(setCounts)
      .catch(console.error);

    fetch(`${API}/categories`)
      .then(r => r.json()).then(setCounts2 => {
        // normalize dates
        const fixed = setCounts2.map(row => ({
          ...row,
          date: formatDate(row.date)
        }));
        setCategories(fixed);
      })
      .catch(console.error);
  }, []);

  // category line keys
  const lineKeys = categories.length > 0
    ? Object.keys(categories[0]).filter(k => k !== "date")
    : [];

  // search handler
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const res = await fetch(`${API}/product-search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      // group by title
      const grouped = {};
      data.forEach(row => {
        if (!grouped[row.title]) grouped[row.title] = [];
        grouped[row.title].push({
          date: formatDate(row.date),
          price: parseFloat(String(row.price).replace(/[^\d.]/g, "")) || null,
          rawDate: row.date
        });
      });
      // sort each group by date
      Object.keys(grouped).forEach(t =>
        grouped[t].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))
      );
      // build unified date axis
      const allDates = [...new Set(data.map(r => formatDate(r.date)))];
      allDates.sort((a, b) => new Date(a) - new Date(b));

      // build chart data: one row per date, one key per product title
      const titles = Object.keys(grouped).slice(0, 6);
      const chartData = allDates.map(date => {
        const row = { date };
        titles.forEach(t => {
          const entry = grouped[t].find(e => e.date === date);
          row[t] = entry ? entry.price : null;
        });
        return row;
      });

      setSearchResults({ titles, chartData, grouped });
    } catch (e) {
      console.error(e);
      setSearchResults(null);
    }
    setSearching(false);
  }, [query]);

  const styles = {
    app: {
      minHeight: "100vh",
      background: "#0f0f1a",
      color: "#e2e8f0",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "32px 24px"
    },
    header: {
      textAlign: "center",
      marginBottom: 36
    },
    h1: {
      fontSize: 28,
      fontWeight: 700,
      color: "#fff",
      margin: 0
    },
    subtitle: {
      fontSize: 13,
      color: "#666",
      marginTop: 6
    },
    section: {
      background: "#16213e",
      borderRadius: 12,
      padding: "24px",
      marginBottom: 28,
      border: "1px solid #1e2a4a"
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: 600,
      color: "#94a3b8",
      marginBottom: 20,
      textTransform: "uppercase",
      letterSpacing: "0.08em"
    },
    searchRow: {
      display: "flex",
      gap: 10,
      marginBottom: 24
    },
    input: {
      flex: 1,
      background: "#0f0f1a",
      border: "1px solid #2d3748",
      borderRadius: 8,
      color: "#fff",
      fontSize: 14,
      padding: "10px 14px",
      outline: "none"
    },
    btn: {
      background: "#f97316",
      border: "none",
      borderRadius: 8,
      color: "#fff",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 600,
      padding: "10px 22px"
    },
    tag: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "#1e2a4a",
      borderRadius: 20,
      fontSize: 12,
      padding: "4px 12px",
      marginRight: 8,
      marginBottom: 8
    },
    dot: (color) => ({
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: color,
      flexShrink: 0
    }),
    noResult: {
      textAlign: "center",
      color: "#666",
      fontSize: 14,
      padding: "32px 0"
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1 style={styles.h1}>📊 Jumia Dashboard</h1>
        <p style={styles.subtitle}>Moroccan market price tracker</p>
      </div>

      {/* BAR CHART */}
      <div style={styles.section}>
        <p style={styles.sectionTitle}>Category distribution</p>
        {counts.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={counts} barCategoryGap="30%">
              <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
                labelStyle={{ color: "#aaa" }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {counts.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={styles.noResult}>Loading category data...</p>
        )}
      </div>

      {/* LINE CHART */}
      <div style={styles.section}>
        <p style={styles.sectionTitle}>Category price evolution</p>
        {categories.length > 0 ? (
          <>
            <div style={{ marginBottom: 12 }}>
              {lineKeys.map((k, i) => (
                <span key={k} style={styles.tag}>
                  <span style={styles.dot(COLORS[i % COLORS.length])} />
                  {k}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={categories}>
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {lineKeys.map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[i % COLORS.length]}
                    dot={false}
                    strokeWidth={2}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p style={styles.noResult}>Loading evolution data...</p>
        )}
      </div>

      {/* PRODUCT SEARCH */}
      <div style={styles.section}>
        <p style={styles.sectionTitle}>Product price evolution</p>
        <div style={styles.searchRow}>
          <input
            style={styles.input}
            placeholder="Search a product… e.g. samsung, iphone, sneakers"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button style={styles.btn} onClick={handleSearch} disabled={searching}>
            {searching ? "…" : "Search"}
          </button>
        </div>

        {searched && !searching && !searchResults && (
          <p style={styles.noResult}>Could not reach the server. Is Flask running?</p>
        )}

        {searched && !searching && searchResults?.chartData?.length === 0 && (
          <p style={styles.noResult}>No products found for "{query}".</p>
        )}

        {searchResults?.chartData?.length > 0 && (
          <>
            <div style={{ marginBottom: 12 }}>
              {searchResults.titles.map((t, i) => (
                <span key={t} style={styles.tag}>
                  <span style={styles.dot(COLORS[i % COLORS.length])} />
                  {t.length > 45 ? t.slice(0, 43) + "…" : t}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={searchResults.chartData}>
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => Math.round(v).toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                {searchResults.titles.map((t, i) => (
                  <Line
                    key={t}
                    type="monotone"
                    dataKey={t}
                    stroke={COLORS[i % COLORS.length]}
                    dot={false}
                    strokeWidth={2}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
