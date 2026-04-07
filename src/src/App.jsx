import { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  BarChart3, Calendar, BookOpen, Target, FileText, Plus, TrendingUp, TrendingDown,
  DollarSign, Activity, Award, Clock, ChevronLeft, ChevronRight, X, Upload, Download,
  Filter, Search, Edit3, Trash2, Eye, CheckCircle, AlertTriangle, Zap, 
  LayoutDashboard, ArrowUpRight, ArrowDownRight, Percent, 
  Brain, Shield, Settings, Play, Square, Moon, Minus,
  Check, AlertCircle, Clipboard, Lock, Crosshair, 
  Calculator, Quote, Timer, Star, Flame, Waves
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 1: THEME & CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const C = {
  bg: "#030712", 
  bgCard: "rgba(17, 24, 39, 0.7)", 
  bgCardAlt: "rgba(31, 41, 55, 0.5)",
  border: "rgba(255, 255, 255, 0.1)", 
  borderLight: "rgba(255, 255, 255, 0.2)",
  accent: "#6366f1", 
  accentGlow: "rgba(99, 102, 241, 0.3)",
  green: "#10b981", 
  greenGlow: "rgba(16, 185, 129, 0.2)",
  red: "#ef4444", 
  redGlow: "rgba(239, 68, 68, 0.2)",
  yellow: "#f59e0b", 
  purple: "#a855f7",
  text: "#f8fafc", 
  textMuted: "#94a3b8", 
  textDim: "#64748b",
};

const SYMBOLS = ["MNQ", "MES", "ES", "NQ"];
const SETUPS = ["ICT Silver Bullet", "Judas Swing", "Fair Value Gap", "Order Block", "Liquidity Sweep", "Breaker Block", "Scalp", "Trend Follow"];
const MISTAKES = ["Overtrading", "Moved Stop", "FOMO Entry", "No Setup", "Early Exit", "Revenge Trade", "Ignored Plan"];
const MARKET_CONDITIONS = ["Trending", "Ranging", "Volatile", "Uncertain"];
const QUOTES = ["Trade the chart, not your P&L.", "Consistency is the only bridge between a strategy and a profit.", "Protect your capital first, the profits will follow."];

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 2: UTILITIES & DEMO DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const fmt = (n) => (n >= 0 ? "+" : "") + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pnlColor = (n) => (n >= 0 ? C.green : C.red);
const today = () => new Date().toISOString().split("T")[0];
const uid = () => Date.now() + Math.random();

function calcReadiness(sleep, market, stress) {
  const sleepScore = (sleep / 5) * 40;
  const marketScore = market === "Trending" ? 30 : market === "Ranging" ? 20 : market === "Volatile" ? 10 : 5;
  const stressScore = ((6 - stress) / 5) * 30;
  return Math.round(sleepScore + marketScore + stressScore);
}

function calcStreak(trades) {
  if (!trades.length) return 0;
  const dailyPnl = {};
  trades.forEach(t => { dailyPnl[t.date] = (dailyPnl[t.date] || 0) + t.netPnl; });
  const dates = Object.keys(dailyPnl).sort().reverse();
  let streak = 0;
  for (let d of dates) {
    if (dailyPnl[d] > 0) streak++; else break;
  }
  return streak;
}

function generateDemoData() {
  const trades = [];
  const sessions = [];
  const notebook = [];
  let tId = 1, sId = 1;
  const now = new Date(2026, 3, 6);

  for (let d = 60; d >= 0; d--) {
    const date = new Date(now); date.setDate(date.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const sleep = Math.floor(Math.random() * 3) + 3;
    const market = MARKET_CONDITIONS[Math.floor(Math.random() * 4)];
    const stress = Math.floor(Math.random() * 3) + 1;
    const readiness = calcReadiness(sleep, market, stress);
    const numTrades = Math.floor(Math.random() * 4) + 1;
    const sessionTrades = [];

    for (let t = 0; t < numTrades; t++) {
      const symbol = Math.random() > 0.4 ? "MNQ" : "MES";
      const side = Math.random() > 0.45 ? "Long" : "Short";
      const hour = 9 + Math.floor(Math.random() * 6);
      const min = Math.floor(Math.random() * 60);
      const pv = symbol === "MNQ" ? 2 : 5;
      const entry = symbol === "MNQ" ? 19500 + Math.random() * 1000 : 5200 + Math.random() * 200;
      const moveTicks = Math.floor(Math.random() * 80) - 30;
      const exit = side === "Long" ? entry + moveTicks * 0.25 : entry - moveTicks * 0.25;
      const qty = Math.floor(Math.random() * 3) + 1;
      const pnl = side === "Long" ? (exit - entry) * pv * qty : (entry - exit) * pv * qty;
      const fees = qty * 4.50;
      const setup = SETUPS[Math.floor(Math.random() * SETUPS.length)];
      const mistakes = pnl < -30 && Math.random() > 0.5 ? [MISTAKES[Math.floor(Math.random() * MISTAKES.length)]] : [];
      const trade = {
        id: tId++, sessionId: sId, date: dStr, time: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
        symbol, side, entryPrice: Math.round(entry * 100) / 100, exitPrice: Math.round(exit * 100) / 100, quantity: qty,
        pnl: Math.round(pnl * 100) / 100, fees: Math.round(fees * 100) / 100, netPnl: Math.round((pnl - fees) * 100) / 100,
        setup, mistakes, notes: "", rating: Math.floor(Math.random() * 5) + 1
      };
      trades.push(trade);
      sessionTrades.push(trade);
    }

    const discScore = Math.floor(Math.random() * 30) + 70;
    sessions.push({
      id: sId++, date: dStr, status: "completed",
      readiness: { sleep, market, stress, score: readiness },
      rules: { maxTrades: 4, maxLoss: 300 },
      disciplineScore: discScore,
      tradeIds: sessionTrades.map(t => t.id),
      lesson: discScore >= 80 ? "Followed the plan." : "Need to tighten discipline."
    });

    notebook.push({ id: uid(), date: dStr, preMarket: "Key levels identified. Looking for ICT setups today.", postMarket: "Executed well, stuck to the plan.", tags: ["ict", "discipline"] });
  }
  return { trades, sessions, notebook, riskSettings: { startingCapital: 25000 } };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 3: STYLES
   ═══════════════════════════════════════════════════════════════════════════ */

const S = {
  glassCard: { 
    background: C.bgCard, 
    backdropFilter: "blur(12px)", 
    borderRadius: 20, 
    border: `1px solid ${C.border}`, 
    padding: 24, 
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
  },
  input: { 
    background: "rgba(0,0,0,0.3)", 
    border: `1px solid ${C.border}`, 
    borderRadius: 10, 
    padding: "10px 14px", 
    color: C.text, 
    fontSize: 13, 
    outline: "none", 
    width: "100%", 
  },
  btn: (v = "primary") => ({
    padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600,
    display: "inline-flex", alignItems: "center", gap: 8, 
    background: v === "primary" ? `linear-gradient(135deg, ${C.accent}, ${C.purple})` : 
               v === "danger" ? C.red : v === "success" ? C.green : "rgba(255,255,255,0.05)",
    color: C.white, border: "none", boxShadow: v === "primary" ? `0 4px 12px ${C.accentGlow}` : "none",
  }),
  badge: (color) => ({ 
    display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, 
    fontSize: 10, fontWeight: 700, background: `${color}20`, color: color, border: `1px solid ${color}30` 
  }),
  label: { fontSize: 12, color: C.textDim, marginBottom: 6, display: "block", fontWeight: 500 },
  grid: (cols) => ({ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }),
  between: { display: "flex", justifyContent: "space-between", alignItems: "center" },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 4: V3 COMPONENTS (JOURNAL, CALC, TIMER)
   ═══════════════════════════════════════════════════════════════════════════ */

function RRCalculator() {
  const [cap, setCap] = useState(25000);
  const [risk, setRisk] = useState(1);
  const [stop, setStop] = useState(10);
  const riskAmount = (cap * (risk / 100));
  const contracts = Math.floor(riskAmount / (stop * 2));

  return (
    <div style={S.glassCard}>
      <div style={{ ...S.between, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
          <Calculator size={18} color={C.accent} /> Position Calc
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <span style={S.label}>Account Capital ($)</span>
          <input type="number" value={cap} onChange={(e)=>setCap(e.target.value)} style={S.input} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <span style={S.label}>Risk %</span>
            <input type="number" value={risk} onChange={(e)=>setRisk(e.target.value)} style={S.input} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={S.label}>Stop (Ticks)</span>
            <input type="number" value={stop} onChange={(e)=>setStop(e.target.value)} style={S.input} />
          </div>
        </div>
        <div style={{ marginTop: 8, padding: 16, borderRadius: 12, background: "rgba(99, 102, 241, 0.1)", border: `1px solid ${C.accentGlow}`, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: C.textDim }}>Suggested Size</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.accent }}>{contracts} Contracts</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Max Risk: ${fmt(riskAmount)}</div>
        </div>
      </div>
    </div>
  );
}

function SessionTimer() {
  const [time, setTime] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let interval;
    if (active) interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [active]);

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ ...S.glassCard, padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <Timer size={18} color={active ? C.green : C.textDim} />
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace" }}>{format(time)}</div>
      <button onClick={() => setActive(!active)} style={{ ...S.btn("ghost"), padding: "6px 12px", fontSize: 11 }}>
        {active ? <Square size={12} /> : <Play size={12} />} {active ? "Stop" : "Start"}
      </button>
    </div>
  );
}

function ZenQuote() {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  return (
    <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "center" }}>
      <Quote size={18} color={C.accent} />
      <div style={{ fontSize: 12, fontStyle: "italic", color: C.textMuted }}>"{quote}"</div>
    </div>
  );
}

function UnifiedJournal({ trades, sessions, notebook, setNotebook }) {
  const [selectedDate, setSelectedDate] = useState(today());
  const [editMode, setEditMode] = useState(false);
  const [note, setNote] = useState("");

  const dayData = useMemo(() => {
    const session = sessions.find(s => s.date === selectedDate);
    const dayTrades = trades.filter(t => t.date === selectedDate);
    const entry = notebook.find(n => n.date === selectedDate);
    return { session, dayTrades, entry };
  }, [selectedDate, trades, sessions, notebook]);

  const saveNote = () => {
    setNotebook(prev => {
      const filtered = prev.filter(n => n.date !== selectedDate);
      return [...filtered, { id: uid(), date: selectedDate, preMarket: note, tags: [] }];
    });
    setEditMode(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ ...S.between, padding: "0 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Calendar size={20} color={C.accent} />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ ...S.input, width: 160 }} />
        </div>
        <button onClick={() => setEditMode(!editMode)} style={S.btn("primary")}><Edit3 size={14} /> Edit Journal</button>
      </div>

      <div style={{ ...S.glassCard, minHeight: "60vh" }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Daily Command Center</div>
        
        <div style={S.grid(2)}>
          {/* Left Col: Psychology & Prep */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 600 }}>
                <Brain size={18} color={C.purple} /> Mental Readiness
              </div>
              {dayData.session ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: C.textMuted }}>Score: {dayData.session.readiness?.score}</span>
                  <span style={S.badge(C.green)}>Ready</span>
                </div>
              ) : <div style={{ fontSize: 12, color: C.textDim }}>No readiness check logged for this day.</div>}
            </div>

            <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 600 }}>
                <FileText size={18} color={C.yellow} /> Daily Journal
              </div>
              {editMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <textarea value={note} onChange={(e)=>setNote(e.target.value)} style={{ ...S.input, height: 150 }} placeholder="Log your thoughts, levels, and bias..." />
                  <button onClick={saveNote} style={S.btn("success")}>Save Entry</button>
                </div>
              ) : (
                <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {dayData.entry?.preMarket || "No notes for today. Click edit to start journaling."}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Trade Performance */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 600 }}>
                <Activity size={18} color={C.green} /> Day Performance
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: pnlColor(dayData.dayTrades.reduce((s,t)=>s+t.netPnl, 0)) }}>
                ${fmt(dayData.dayTrades.reduce((s,t)=>s+t.netPnl, 0))}
              </div>
              <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{dayData.dayTrades.length} trades executed</div>
            </div>

            <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 600 }}>
                <Shield size={18} color={C.accent} /> Discipline Grade
              </div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>
                {dayData.session ? `${dayData.session.disciplineScore}/100` : "N/A"}
              </div>
            </div>
            
            <ZenQuote />
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={18} color={C.accent} /> Trade History
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dayData.dayTrades.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.textDim, fontSize: 13 }}>No trades logged for this date.</div>
            ) : (
              dayData.dayTrades.map(t => (
                <div key={t.id} style={{ ...S.between, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={S.badge(t.side === "Long" ? C.green : C.red)}>{t.side}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{t.symbol}</span>
                    <span style={{ fontSize: 11, color: C.textDim }}>{t.time}</span>
                    <span style={{ fontSize: 11, color: C.accent }}>{t.setup}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: pnlColor(t.netPnl) }}>${fmt(t.netPnl)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 5: MAIN APP
   ═══════════════════════════════════════════════════════════════════════════ */

export default function App() {
  const [page, setPage] = useState("dashboard");
  const demoData = useMemo(() => generateDemoData(), []);
  const [trades, setTrades] = useState(demoData.trades); 
  const [sessions, setSessions] = useState(demoData.sessions);
  const [notebook, setNotebook] = useState(demoData.notebook);
  const [riskSettings, setRiskSettings] = useState(demoData.riskSettings);
  const [activeSession, setActiveSession] = useState(null);

  const navSections = [
    { label: "OPERATIONS", items: [
      { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
      { id: "journal", label: "Unified Journal", icon: BookOpen },
      { id: "session", label: "Active Session", icon: Zap, badge: activeSession ? "LIVE" : null },
    ]},
    { label: "ANALYSIS", items: [
      { id: "trades", label: "Trade Log", icon: FileText },
      { id: "analytics", label: "Deep Analytics", icon: BarChart3 },
      { id: "coach", label: "AI Performance Coach", icon: Brain },
    ]},
    { label: "STRATEGY", items: [
      { id: "playbook", label: "Playbook", icon: Target },
      { id: "settings", label: "Risk Management", icon: Settings },
    ]},
  ];

  return (
    <div style={{ 
      fontFamily: "'Inter', sans-serif", 
      background: C.bg, 
      color: C.text, 
      minHeight: "100vh", 
      display: "flex",
      backgroundImage: `radial-gradient(circle at 0% 0%, ${C.accentGlow} 0%, transparent 25%), radial-gradient(circle at 100% 100%, ${C.purple}10 0%, transparent 25%)`
    }}>
      {/* SIDEBAR */}
      <div style={{ 
        width: 260, 
        background: C.bgCard, 
        backdropFilter: "blur(20px)", 
        borderRight: `1px solid ${C.border}`, 
        position: "fixed", 
        top: 0, left: 0, bottom: 0, 
        display: "flex", flexDirection: "column",
        zIndex: 1000
      }}>
        <div style={{ padding: "30px 24px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 24, fontWeight: 900, background: `linear-gradient(to right, ${C.accent}, ${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            EightSeven <span style={{ fontSize: 12, fontWeight: 400, color: C.textDim, display: "block" }}>TRADING OS V3</span>
          </div>
        </div>

        <div style={{ flex: 1, padding: "20px 0", overflowY: "auto" }}>
          {navSections.map(sec => (
            <div key={sec.label} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim, padding: "0 24px 8px", letterSpacing: 1 }}>{sec.label}</div>
              {sec.items.map(item => (
                <div key={item.id} onClick={() => setPage(item.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", cursor: "pointer",
                  color: page === item.id ? C.white : C.textDim,
                  background: page === item.id ? `rgba(99, 102, 241, 0.15)` : "transparent",
                  borderLeft: page === item.id ? `4px solid ${C.accent}` : "4px solid transparent",
                  fontSize: 13, fontWeight: page === item.id ? 600 : 400,
                  transition: "all 0.2s"
                }}>
                  <item.icon size={18} color={page === item.id ? C.accent : C.textDim} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && <span style={{ fontSize: 9, background: C.green, color: "white", padding: "2px 6px", borderRadius: 4 }}>{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: "20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: C.textDim }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }}></div>
            System Online
          </div>
        </div>
      </div>

      {/* MAIN VIEW */}
      <div style={{ marginLeft: 260, flex: 1, padding: "40px" }}>
        <div style={{ ...S.between, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{
              page === "dashboard" ? "Command Center" : 
              page === "journal" ? "Daily Journal" : 
              page === "session" ? "Live Session" : 
              page === "trades" ? "Trade Log" :
              page === "analytics" ? "Deep Analytics" :
              page === "coach" ? "AI Coach" :
              page === "playbook" ? "Playbook" : "Settings"
            }</h1>
            <p style={{ color: C.textDim, fontSize: 14 }}>Welcome back, Trader. Stay disciplined.</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <SessionTimer />
          </div>
        </div>

        {/* PAGE ROUTING */}
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          {page === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ ...S.glassCard, flex: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <span style={{ fontWeight: 700 }}>Equity Performance</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={S.badge(C.green)}>1W</span>
                      <span style={S.badge(C.purple)}>1M</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trades.reduce((acc, t) => {
                      const last = acc.length ? acc[acc.length-1].v : 0;
                      return [...acc, {d: t.date, v: last + t.netPnl}];
                    }, [])}>
                      <defs><linearGradient id="col" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.accent} stopOpacity={0.3} /><stop offset="95%" stopColor={C.accent} stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                      <XAxis dataKey="d" hide />
                      <YAxis tick={{ fontSize: 10, fill: C.textDim }} />
                      <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }} />
                      <Area type="monotone" dataKey="v" stroke={C.accent} fill="url(#col)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ ...S.glassCard, flex: 1 }}>
                   <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 12, color: C.textDim, textTransform: "uppercase" }}>Current Streak</div>
                        <div style={{ fontSize: 48, fontWeight: 900, color: C.green }}>{calcStreak(trades)} Days</div>
                        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                          {[1,2,3,4,5].map(i => <Flame key={i} size={16} color={i <= calcStreak(trades) ? C.yellow : C.border} fill={i <= calcStreak(trades) ? C.yellow : "transparent"} />)}
                        </div>
                      </div>
                      <ZenQuote />
                      <RRCalculator />
                   </div>
                </div>
              </div>
            </div>
          )}
          {page === "journal" && <UnifiedJournal trades={trades} sessions={sessions} notebook={notebook} setNotebook={setNotebook} />}
          
          {page === "session" && (
            <div style={S.glassCard}>
              <div style={{ textAlign: "center" }}>
                <Zap size={48} color={C.accent} />
                <h2>Session Control Center</h2>
                <p style={{color: C.textMuted}}>Start your session here. The pre-flight checklist will ensure you are ready to trade.</p>
              </div>
            </div>
          )}
          
          {page === "trades" && (
            <div style={S.glassCard}>
              <div style={{...S.between, marginBottom: 20}}>
                <h3 style={{margin: 0}}>Recent Trades</h3>
                <button style={S.btn("primary")}><Plus size={14} /> Log Trade</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {trades.slice(0, 10).map(t => (
                  <div key={t.id} style={{ ...S.between, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={S.badge(t.side === "Long" ? C.green : C.red)}>{t.side}</span>
                      <span style={{ fontWeight: 600 }}>{t.symbol}</span>
                      <span style={{ fontSize: 12, color: C.textDim }}>{t.date}</span>
                      <span style={{ fontSize: 12, color: C.accent }}>{t.setup}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: pnlColor(t.netPnl) }}>${fmt(t.netPnl)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === "analytics" && (
            <div style={S.glassCard}>
              <h3 style={{margin: 0}}>Deep Analytics</h3>
              <p style={{color: C.textMuted}}>Advanced statistical breakdown of your edge.</p>
              {/* Recharts components would go here, simplified for V3 structure */}
            </div>
          )}

          {page === "coach" && (
            <div style={S.glassCard}>
              <div style={{textAlign: 'center'}}>
                <Brain size={48} color={C.accent} />
                <h3>AI Performance Coach</h3>
                <p style={{color: C.textMuted}}>Analyzing your journal, discipline, and setups...</p>
                <button style={S.btn("primary")}><Brain size={14} /> Generate Report</button>
              </div>
            </div>
          )}

          {page === "playbook" && (
            <div style={S.glassCard}>
              <h3>ICT Playbooks</h3>
              <p style={{color: C.textMuted}}>Define your setups and entry conditions.</p>
            </div>
          )}

          {page === "settings" && (
            <div style={S.glassCard}>
              <h3>Risk Management</h3>
              <div style={{marginTop: 16}}>
                <RRCalculator />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .pulse-anim { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        * { scrollbar-width: thin; scrollbar-color: ${C.border} transparent; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 10px; }
      `}</style>
    </div>
  );
}
