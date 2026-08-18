import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Sun,
  Moon,
  MessageCircle,
  Instagram,
  Download,
  TrendingDown,
  IndianRupee,
  Info,
  ChevronDown,
  Coffee,
  Fuel,
  Film,
  Home as HomeIcon,
} from "lucide-react";

/* ----------------------------- constants ----------------------------- */

const COUNTRY_RATES = {
  India: 6,
  USA: 3,
  UK: 3,
  Australia: 3,
  Canada: 3,
  Custom: null,
};

const QUICK_AMOUNTS = [
  { label: "₹1 Lakh", value: 100000 },
  { label: "₹5 Lakhs", value: 500000 },
  { label: "₹10 Lakhs", value: 1000000 },
  { label: "₹25 Lakhs", value: 2500000 },
  { label: "₹50 Lakhs", value: 5000000 },
  { label: "₹1 Crore", value: 10000000 },
];

const EVERYDAY_ITEMS = [
  { name: "Coffee", base: 100, icon: Coffee },
  { name: "Petrol (per L)", base: 110, icon: Fuel },
  { name: "Movie Ticket", base: 300, icon: Film },
  { name: "Monthly Rent", base: 20000, icon: HomeIcon },
];

const COMPARISON_RATES = [4, 6, 8];
const COMPARISON_COLORS = { 4: "#22c55e", 6: "#f59e0b", 8: "#ef4444" };

/* ----------------------------- helpers ----------------------------- */

function formatINR(num, opts = {}) {
  const { decimals = 0 } = opts;
  const n = Number(num) || 0;
  return (
    "₹" +
    n.toLocaleString("en-IN", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    })
  );
}

function formatCompact(num) {
  const n = Number(num) || 0;
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2) + " L";
  return formatINR(n);
}

function purchasingPower(amount, rate, years) {
  return amount / Math.pow(1 + rate / 100, years);
}

function equivalentFutureCost(amount, rate, years) {
  return amount * Math.pow(1 + rate / 100, years);
}

function inflationMultiplier(rate, years) {
  return Math.pow(1 + rate / 100, years);
}

function realReturn(nominal, inflation) {
  return ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100;
}

/* ----------------------------- animated number ----------------------------- */

function useAnimatedNumber(target, duration = 700) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = target;
    const start = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = from + (to - from) * eased;
      setDisplay(val);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}

function AnimatedCurrency({ value, className = "", compact = false }) {
  const animated = useAnimatedNumber(value);
  return (
    <span className={className}>
      {compact ? formatCompact(animated) : formatINR(animated)}
    </span>
  );
}

function AnimatedPercent({ value, className = "", decimals = 1 }) {
  const animated = useAnimatedNumber(value);
  return <span className={className}>{animated.toFixed(decimals)}%</span>;
}

/* ----------------------------- main component ----------------------------- */

export default function InflationCalculator() {
  const [isDark, setIsDark] = useState(true);
  const [amountRaw, setAmountRaw] = useState(1000000);
  const [amountText, setAmountText] = useState("10,00,000");
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(20);
  const [country, setCountry] = useState("India");
  const [investReturn, setInvestReturn] = useState(12);
  const [compareMode, setCompareMode] = useState(false);

  const shareCanvasRef = useRef(null);

  const theme = isDark
    ? {
        bg: "bg-slate-950",
        bgGradient:
          "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950",
        card: "bg-slate-900/60 border-slate-800",
        cardSolid: "bg-slate-900",
        text: "text-slate-100",
        textMuted: "text-slate-400",
        textSubtle: "text-slate-500",
        accent: "text-amber-400",
        accentBg: "bg-amber-400",
        accentBorder: "border-amber-400",
        border: "border-slate-800",
        input:
          "bg-slate-800/60 border-slate-700 text-slate-100 placeholder-slate-500",
        tableHeader: "bg-slate-900 text-slate-300",
        tableRowAlt: "bg-slate-900/40",
        chip: "bg-slate-800/70 border-slate-700 text-slate-200 hover:bg-slate-700",
        chipActive: "bg-amber-400 border-amber-400 text-slate-950",
        divide: "divide-slate-800",
      }
    : {
        bg: "bg-stone-50",
        bgGradient: "bg-gradient-to-b from-stone-50 via-white to-stone-50",
        card: "bg-white border-stone-200",
        cardSolid: "bg-white",
        text: "text-slate-900",
        textMuted: "text-slate-600",
        textSubtle: "text-slate-400",
        accent: "text-amber-600",
        accentBg: "bg-amber-500",
        accentBorder: "border-amber-500",
        border: "border-stone-200",
        input: "bg-white border-stone-300 text-slate-900 placeholder-slate-400",
        tableHeader: "bg-stone-100 text-slate-600",
        tableRowAlt: "bg-stone-50",
        chip: "bg-white border-stone-300 text-slate-700 hover:bg-stone-100",
        chipActive: "bg-amber-500 border-amber-500 text-white",
        divide: "divide-stone-200",
      };

  /* ------------- derived values ------------- */

  const amount = amountRaw || 0;

  const futurePP = useMemo(
    () => purchasingPower(amount, rate, years),
    [amount, rate, years]
  );
  const equivFuture = useMemo(
    () => equivalentFutureCost(amount, rate, years),
    [amount, rate, years]
  );
  const lost = amount - futurePP;
  const lostPct = amount > 0 ? (lost / amount) * 100 : 0;
  const multiplier = useMemo(
    () => inflationMultiplier(rate, years),
    [rate, years]
  );
  const ppRatio = amount > 0 ? Math.max(0, Math.min(1, futurePP / amount)) : 1;
  const nominalReal = realReturn(investReturn, rate);

  const graphData = useMemo(() => {
    const points = [];
    const step = years > 30 ? 5 : years > 15 ? 2 : 1;
    for (let y = 0; y <= years; y += step) {
      points.push({
        year: y,
        currentValue: amount,
        purchasingPower: purchasingPower(amount, rate, y),
      });
    }
    if (points[points.length - 1]?.year !== years) {
      points.push({
        year: years,
        currentValue: amount,
        purchasingPower: futurePP,
      });
    }
    return points;
  }, [amount, rate, years, futurePP]);

  const comparisonData = useMemo(() => {
    const points = [];
    const step = years > 30 ? 5 : years > 15 ? 2 : 1;
    for (let y = 0; y <= years; y += step) {
      const point = { year: y };
      COMPARISON_RATES.forEach((r) => {
        point[`pp${r}`] = purchasingPower(amount, r, y);
      });
      points.push(point);
    }
    return points;
  }, [amount, years]);

  const tableRows = useMemo(() => {
    const rows = [];
    for (let y = 1; y <= years; y++) {
      const pp = purchasingPower(amount, rate, y);
      const eq = equivalentFutureCost(amount, rate, y);
      rows.push({ year: y, pp, eq, diff: eq - amount });
    }
    return rows;
  }, [amount, rate, years]);

  const insights = useMemo(() => {
    const list = [];
    list.push(
      `Inflation has silently reduced your purchasing power by ${lostPct.toFixed(
        0
      )}%.`
    );
    list.push(
      "If your salary grows slower than inflation, you become poorer every year."
    );
    list.push(
      `You'll need over ${formatCompact(
        equivFuture
      )} in ${years} years just to match today's ${formatCompact(amount)}.`
    );
    if (nominalReal < 0) {
      list.push(
        `At ${investReturn}% returns against ${rate}% inflation, your real wealth is actually shrinking.`
      );
    } else {
      list.push(
        `At ${investReturn}% returns, your real (inflation-adjusted) growth is only ${nominalReal.toFixed(
          1
        )}% a year.`
      );
    }
    return list;
  }, [lostPct, equivFuture, years, amount, nominalReal, investReturn, rate]);

  /* ------------- handlers ------------- */

  const handleAmountChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    const num = digits ? parseInt(digits, 10) : 0;
    setAmountRaw(num);
    setAmountText(num ? num.toLocaleString("en-IN") : "");
  };

  const handleQuickSelect = (val) => {
    setAmountRaw(val);
    setAmountText(val.toLocaleString("en-IN"));
  };

  const handleCountryChange = (e) => {
    const val = e.target.value;
    setCountry(val);
    if (COUNTRY_RATES[val] !== null && COUNTRY_RATES[val] !== undefined) {
      setRate(COUNTRY_RATES[val]);
    }
  };

  const handleDownloadPNG = () => {
    const canvas = document.createElement("canvas");
    const W = 1080,
      H = 1350;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const bgTop = "#0f172a",
      bgBottom = "#020617";
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, bgTop);
    grad.addColorStop(1, bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "600 34px Inter, sans-serif";
    ctx.fillText("Inflation Insights", 70, 110);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 26px Inter, sans-serif";
    ctx.fillText("Inflation Calculator", 70, 150);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 190);
    ctx.lineTo(W - 70, 190);
    ctx.stroke();

    const rows = [
      ["Current Amount", formatINR(amount)],
      ["Inflation Rate", rate + "%"],
      ["Time Period", years + " years"],
      ["Future Purchasing Power", formatINR(futurePP)],
      ["Equivalent Future Cost", formatINR(equivFuture)],
    ];

    let y = 270;
    rows.forEach(([label, val]) => {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "400 26px Inter, sans-serif";
      ctx.fillText(label, 70, y);
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "600 30px Inter, sans-serif";
      ctx.fillText(val, 70, y + 42);
      y += 110;
    });

    ctx.fillStyle = "#f43f5e";
    ctx.font = "700 64px 'Fraunces', serif";
    ctx.fillText(formatINR(lost), 70, y + 40);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 24px Inter, sans-serif";
    ctx.fillText(`Purchasing Power Lost (${lostPct.toFixed(1)}%)`, 70, y + 80);

    ctx.fillStyle = "#64748b";
    ctx.font = "400 22px Inter, sans-serif";
    ctx.fillText("@fintechanurag  ·  topmate.io/anuraggiri", 70, H - 60);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "myfirstcrore-inflation-result.png";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  /* ------------- render ------------- */

  return (
    <div
      className={`min-h-screen w-full ${theme.bgGradient} ${theme.text} transition-colors duration-500`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono-num { font-family: 'JetBrains Mono', monospace; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in-up { animation: fadeInUp 0.6s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .fade-in-up { animation: none; }
          * { transition-duration: 0.01ms !important; }
        }
        input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 9999px; }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px; border-radius: 9999px;
          background: #f59e0b; cursor: pointer; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 9999px; background: #f59e0b; cursor: pointer; border: 3px solid white;
        }
      `}</style>

      <div className="font-body">
        {/* ---------- Header ---------- */}
        <header
          className={`sticky top-0 z-30 backdrop-blur-md ${
            isDark ? "bg-slate-950/70" : "bg-white/70"
          } border-b ${theme.border}`}
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl ${theme.accentBg} flex items-center justify-center`}
              >
                <IndianRupee
                  size={18}
                  className={isDark ? "text-slate-950" : "text-white"}
                  strokeWidth={2.5}
                />
              </div>
              <span className="font-display text-lg sm:text-xl font-semibold tracking-tight">
                Inflation Insights
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="https://topmate.io/anuraggiri"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-full ${
                  theme.accentBg
                } ${
                  isDark ? "text-slate-950" : "text-white"
                } hover:opacity-90 transition-opacity whitespace-nowrap`}
              >
                <MessageCircle size={15} /> <span>Talk with Anurag</span>
              </a>
              <button
                onClick={() => setIsDark((d) => !d)}
                aria-label="Toggle dark mode"
                className={`w-9 h-9 rounded-full border ${theme.border} flex items-center justify-center hover:opacity-80 transition-opacity`}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-5 sm:px-8 pb-24">
          {/* ---------- Hero ---------- */}
          <section className="pt-12 sm:pt-16 pb-8 text-center fade-in-up">
            <p
              className={`uppercase tracking-[0.2em] text-xs font-semibold ${theme.accent} mb-3`}
            >
              Inflation Calculator
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-3xl mx-auto">
              See how inflation quietly eats your money
            </h1>
            <p
              className={`mt-4 max-w-xl mx-auto text-sm sm:text-base ${theme.textMuted}`}
            >
              Enter an amount and find out what it will really be worth in the
              future — and how much you'll need to keep up.
            </p>
          </section>

          {/* ---------- Calculator Card ---------- */}
          <section
            className={`rounded-2xl border ${theme.card} p-5 sm:p-8 shadow-xl shadow-black/5 fade-in-up`}
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: inputs */}
              <div className="space-y-7">
                <div>
                  <label
                    htmlFor="amount"
                    className={`block text-sm font-medium mb-2 ${theme.textMuted}`}
                  >
                    Current Amount
                  </label>
                  <div
                    className={`flex items-center rounded-xl border ${theme.input} px-4 py-3`}
                  >
                    <span className="text-lg font-semibold mr-1">₹</span>
                    <input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      value={amountText}
                      onChange={handleAmountChange}
                      placeholder="10,00,000"
                      className="bg-transparent outline-none w-full text-lg font-semibold font-mono-num"
                      aria-label="Current amount in rupees"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {QUICK_AMOUNTS.map((q) => (
                      <button
                        key={q.value}
                        onClick={() => handleQuickSelect(q.value)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                          amountRaw === q.value ? theme.chipActive : theme.chip
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="rate"
                      className={`text-sm font-medium ${theme.textMuted}`}
                    >
                      Inflation Rate
                    </label>
                    <span
                      className={`font-mono-num font-semibold ${theme.accent}`}
                    >
                      {rate}%
                    </span>
                  </div>
                  <input
                    id="rate"
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={rate}
                    onChange={(e) => {
                      setRate(parseFloat(e.target.value));
                      setCountry("Custom");
                    }}
                    className={`w-full ${
                      isDark ? "bg-slate-700" : "bg-stone-200"
                    }`}
                  />
                  <div
                    className={`flex justify-between text-xs ${theme.textSubtle} mt-1`}
                  >
                    <span>1%</span>
                    <span>15%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="years"
                      className={`text-sm font-medium ${theme.textMuted}`}
                    >
                      Time Period
                    </label>
                    <span
                      className={`font-mono-num font-semibold ${theme.accent}`}
                    >
                      {years} Years
                    </span>
                  </div>
                  <input
                    id="years"
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={years}
                    onChange={(e) => setYears(parseInt(e.target.value, 10))}
                    className={`w-full ${
                      isDark ? "bg-slate-700" : "bg-stone-200"
                    }`}
                  />
                  <div
                    className={`flex justify-between text-xs ${theme.textSubtle} mt-1`}
                  >
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className={`block text-sm font-medium mb-2 ${theme.textMuted}`}
                  >
                    Country (Optional)
                  </label>
                  <div className="relative">
                    <select
                      id="country"
                      value={country}
                      onChange={handleCountryChange}
                      className={`w-full appearance-none rounded-xl border ${theme.input} px-4 py-3 text-sm font-medium outline-none cursor-pointer`}
                    >
                      {Object.keys(COUNTRY_RATES).map((c) => (
                        <option key={c} value={c}>
                          {c}
                          {COUNTRY_RATES[c] !== null
                            ? ` (${COUNTRY_RATES[c]}%)`
                            : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${theme.textMuted}`}
                    />
                  </div>
                </div>
              </div>

              {/* Right: erosion visual */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative w-44 h-44 mb-4">
                  <div
                    className={`absolute inset-0 rounded-full border-2 border-dashed ${
                      isDark ? "border-slate-700" : "border-stone-300"
                    }`}
                  />
                  <div
                    className={`absolute inset-0 rounded-full ${theme.accentBg} flex items-center justify-center transition-transform duration-700 ease-out`}
                    style={{
                      transform: `scale(${0.35 + ppRatio * 0.65})`,
                      opacity: 0.5 + ppRatio * 0.5,
                    }}
                  >
                    <IndianRupee
                      size={48}
                      className={isDark ? "text-slate-950" : "text-white"}
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <p className={`font-mono-num text-3xl font-bold ${theme.text}`}>
                  <AnimatedCurrency value={multiplier} className="" />×
                </p>
                <p className={`text-sm ${theme.textMuted} mt-1`}>
                  Prices become this many times more expensive
                </p>
              </div>
            </div>
          </section>

          {/* ---------- Result Cards ---------- */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <ResultCard theme={theme} label="Today's Value">
              <AnimatedCurrency
                value={amount}
                className="font-display text-3xl font-semibold"
              />
            </ResultCard>

            <ResultCard theme={theme} label="Future Purchasing Power">
              <AnimatedCurrency
                value={futurePP}
                className="font-display text-3xl font-semibold"
              />
              <p className={`text-xs mt-2 ${theme.textMuted}`}>
                Your {formatCompact(amount)} today will only buy what{" "}
                {formatCompact(futurePP)} buys after {years} years.
              </p>
            </ResultCard>

            <ResultCard
              theme={theme}
              label="Purchasing Power Lost"
              accentText="text-rose-500"
            >
              <AnimatedCurrency
                value={lost}
                className="font-display text-3xl font-semibold text-rose-500"
              />
              <p className="text-xs mt-2 font-semibold text-rose-500/80">
                <AnimatedPercent value={lostPct} /> Lost
              </p>
            </ResultCard>

            <ResultCard theme={theme} label="Equivalent Future Cost">
              <AnimatedCurrency
                value={equivFuture}
                className="font-display text-3xl font-semibold"
              />
              <p className={`text-xs mt-2 ${theme.textMuted}`}>
                You would need this much money in the future to maintain the
                same lifestyle.
              </p>
            </ResultCard>

            <ResultCard theme={theme} label="Inflation Multiplier">
              <p className="font-display text-3xl font-semibold">
                <AnimatedCurrency
                  value={multiplier}
                  className=""
                  compact={false}
                />
                ×
              </p>
              <p className={`text-xs mt-2 ${theme.textMuted}`}>
                Prices become {multiplier.toFixed(2)}× more expensive.
              </p>
            </ResultCard>

            <div
              className={`rounded-2xl border ${theme.card} p-6 flex flex-col justify-center items-start gap-2`}
            >
              <div className="flex items-center gap-2">
                <TrendingDown size={18} className="text-rose-500" />
                <span className={`text-sm font-semibold ${theme.textMuted}`}>
                  Quick take
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Every year you wait, inflation compounds. Acting sooner keeps
                more of your money's power in your hands.
              </p>
            </div>
          </section>

          {/* ---------- Graph ---------- */}
          <section
            className={`rounded-2xl border ${theme.card} p-5 sm:p-8 mt-8`}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="font-display text-xl font-semibold">
                Value Over Time
              </h2>
              <button
                onClick={() => setCompareMode((c) => !c)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  compareMode ? theme.chipActive : theme.chip
                }`}
              >
                Compare Inflation Rates
              </button>
            </div>

            <div className="h-72 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                {compareMode ? (
                  <LineChart
                    data={comparisonData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#1e293b" : "#e7e5e4"}
                    />
                    <XAxis
                      dataKey="year"
                      tick={{
                        fontSize: 12,
                        fill: isDark ? "#94a3b8" : "#78716c",
                      }}
                      label={{
                        value: "Years",
                        position: "insideBottom",
                        offset: -3,
                        fontSize: 12,
                        fill: isDark ? "#94a3b8" : "#78716c",
                      }}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCompact(v)}
                      tick={{
                        fontSize: 11,
                        fill: isDark ? "#94a3b8" : "#78716c",
                      }}
                      width={70}
                    />
                    <Tooltip
                      formatter={(v) => formatINR(v)}
                      contentStyle={{
                        background: isDark ? "#0f172a" : "#fff",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {COMPARISON_RATES.map((r) => (
                      <Line
                        key={r}
                        type="monotone"
                        dataKey={`pp${r}`}
                        name={`${r}% inflation`}
                        stroke={COMPARISON_COLORS[r]}
                        strokeWidth={2.5}
                        dot={false}
                        animationDuration={900}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <LineChart
                    data={graphData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#1e293b" : "#e7e5e4"}
                    />
                    <XAxis
                      dataKey="year"
                      tick={{
                        fontSize: 12,
                        fill: isDark ? "#94a3b8" : "#78716c",
                      }}
                      label={{
                        value: "Years",
                        position: "insideBottom",
                        offset: -3,
                        fontSize: 12,
                        fill: isDark ? "#94a3b8" : "#78716c",
                      }}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCompact(v)}
                      tick={{
                        fontSize: 11,
                        fill: isDark ? "#94a3b8" : "#78716c",
                      }}
                      width={70}
                    />
                    <Tooltip
                      formatter={(v) => formatINR(v)}
                      contentStyle={{
                        background: isDark ? "#0f172a" : "#fff",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="currentValue"
                      name="Current Value"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={false}
                      animationDuration={900}
                    />
                    <Line
                      type="monotone"
                      dataKey="purchasingPower"
                      name="Purchasing Power"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={false}
                      animationDuration={900}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </section>

          {/* ---------- Year by Year Table ---------- */}
          <section
            className={`rounded-2xl border ${theme.card} p-5 sm:p-8 mt-8`}
          >
            <h2 className="font-display text-xl font-semibold mb-5">
              Year-by-Year Breakdown
            </h2>
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className={theme.tableHeader}>
                    <th className="text-left font-semibold px-4 py-3 rounded-l-lg">
                      Year
                    </th>
                    <th className="text-right font-semibold px-4 py-3">
                      Purchasing Power
                    </th>
                    <th className="text-right font-semibold px-4 py-3">
                      Equivalent Amount Needed
                    </th>
                    <th className="text-right font-semibold px-4 py-3 rounded-r-lg">
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.divide}`}>
                  {tableRows.map((row) => (
                    <tr
                      key={row.year}
                      className={row.year % 2 === 0 ? theme.tableRowAlt : ""}
                    >
                      <td className="px-4 py-2.5 font-medium">{row.year}</td>
                      <td className="px-4 py-2.5 text-right font-mono-num">
                        {formatINR(row.pp)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono-num">
                        {formatINR(row.eq)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono-num text-rose-500">
                        +{formatINR(row.diff)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---------- Everyday Examples ---------- */}
          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold mb-5">
              Everyday Examples
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EVERYDAY_ITEMS.map((item) => {
                const future = item.base * multiplier;
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className={`rounded-2xl border ${theme.card} p-5`}
                  >
                    <Icon size={20} className={theme.accent} />
                    <p
                      className={`text-sm font-medium mt-3 ${theme.textMuted}`}
                    >
                      {item.name}
                    </p>
                    <p className="font-display text-lg font-semibold mt-1">
                      {formatINR(item.base)} →{" "}
                      <span className="text-rose-500">{formatINR(future)}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- Real Return Calculator ---------- */}
          <section
            className={`rounded-2xl border ${theme.card} p-5 sm:p-8 mt-8`}
          >
            <h2 className="font-display text-xl font-semibold mb-1">
              Real Return Calculator
            </h2>
            <p className={`text-sm ${theme.textMuted} mb-6`}>
              See what your investments actually earn after inflation.
            </p>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="investReturn"
                    className={`text-sm font-medium ${theme.textMuted}`}
                  >
                    Expected Investment Return
                  </label>
                  <span
                    className={`font-mono-num font-semibold ${theme.accent}`}
                  >
                    {investReturn}%
                  </span>
                </div>
                <input
                  id="investReturn"
                  type="range"
                  min={0}
                  max={30}
                  step={0.5}
                  value={investReturn}
                  onChange={(e) => setInvestReturn(parseFloat(e.target.value))}
                  className={`w-full ${
                    isDark ? "bg-slate-700" : "bg-stone-200"
                  }`}
                />
                <div
                  className={`flex justify-between text-xs ${theme.textSubtle} mt-1`}
                >
                  <span>0%</span>
                  <span>30%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>
                    Nominal Return
                  </p>
                  <p className="font-mono-num font-semibold">{investReturn}%</p>
                </div>
                <div>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>Inflation</p>
                  <p className="font-mono-num font-semibold">{rate}%</p>
                </div>
                <div>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>
                    Real Return
                  </p>
                  <p
                    className={`font-mono-num font-semibold ${
                      nominalReal >= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {nominalReal.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            <p className={`text-xs mt-5 ${theme.textMuted}`}>
              Real Wealth Growth: your money's actual buying power grows at
              roughly{" "}
              <span
                className={`font-semibold ${
                  nominalReal >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {nominalReal.toFixed(2)}%
              </span>{" "}
              per year, once inflation is accounted for.
            </p>
          </section>

          {/* ---------- Insights ---------- */}
          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold mb-5 flex items-center gap-2">
              <Info size={18} className={theme.accent} /> Insights
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {insights.map((text, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border ${theme.card} p-5 text-sm leading-relaxed`}
                >
                  {text}
                </div>
              ))}
            </div>
          </section>

          {/* ---------- Result Summary Card ---------- */}
          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold mb-5">
              Result Summary
            </h2>
            <div className={`rounded-2xl border ${theme.card} p-6 sm:p-8`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg ${theme.accentBg} flex items-center justify-center`}
                  >
                    <IndianRupee
                      size={14}
                      className={isDark ? "text-slate-950" : "text-white"}
                    />
                  </div>
                  <span className="font-display font-semibold">
                    Inflation Insights
                  </span>
                </div>
                <span className={`text-xs ${theme.textSubtle}`}>
                  Inflation Report
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <MiniStat
                  theme={theme}
                  label="Amount"
                  value={formatCompact(amount)}
                />
                <MiniStat theme={theme} label="Rate" value={`${rate}%`} />
                <MiniStat theme={theme} label="Years" value={years} />
                <MiniStat
                  theme={theme}
                  label="Lost"
                  value={formatCompact(lost)}
                  valueClass="text-rose-500"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownloadPNG}
                  className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full ${
                    theme.accentBg
                  } ${
                    isDark ? "text-slate-950" : "text-white"
                  } hover:opacity-90 transition-opacity`}
                >
                  <Download size={15} /> Download PNG
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* ---------- Footer ---------- */}
        <footer className={`border-t ${theme.border} py-8`}>
          <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col items-center gap-3 text-center">
            <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
              Copyright 2026 Anurag Giri |{" "}
              <a
                href="https://www.instagram.com/fintechanurag/"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-medium ${theme.accent} hover:underline inline-flex items-center gap-1`}
              >
                <Instagram size={13} /> @fintechanurag
              </a>{" "}
              | All rights reserved.
            </p>
            <a
              href="https://topmate.io/anuraggiri"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium ${theme.accent} hover:underline inline-flex items-center gap-1.5`}
            >
              {/* <MessageCircle size={14} /> Talk with Anurag */}
            </a>
            <p className={`text-xs ${theme.textSubtle}`}>
              This calculator is for educational purposes only and does not
              constitute financial advice.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ----------------------------- subcomponents ----------------------------- */

function ResultCard({ theme, label, children }) {
  return (
    <div className={`rounded-2xl border ${theme.card} p-6 fade-in-up`}>
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted} mb-2`}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function MiniStat({ theme, label, value, valueClass = "" }) {
  return (
    <div>
      <p className={`text-xs ${theme.textMuted} mb-1`}>{label}</p>
      <p className={`font-mono-num font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
