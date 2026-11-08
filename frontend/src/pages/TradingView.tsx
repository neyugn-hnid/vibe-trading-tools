import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { LineChart } from "lucide-react";
import i18n from "@/i18n";
import { useThemeDark } from "@/lib/theme-store";
import { normalizeTradingViewSymbol } from "@/lib/tradingView";

const INTERVALS = [
  { id: "1", label: "1m" },
  { id: "5", label: "5m" },
  { id: "15", label: "15m" },
  { id: "60", label: "1h" },
  { id: "240", label: "4h" },
  { id: "D", label: "1D" },
  { id: "W", label: "1W" },
  { id: "M", label: "1M" },
] as const;

export function TradingView() {
  const dark = useThemeDark();
  const [searchParams] = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "BINANCE:BTCUSDT";
  const [rawSymbol, setRawSymbol] = useState(initialSymbol);
  const [interval, setInterval] = useState<string>("D");

  const symbol = useMemo(() => normalizeTradingViewSymbol(rawSymbol), [rawSymbol]);
  const theme = dark ? "dark" : "light";
  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      symbol,
      interval,
      theme,
      style: "1",
      locale: i18n.language === "vi" ? "vi_VN" : "en",
      timezone: "Etc/UTC",
      withdateranges: "1",
      hide_side_toolbar: "0",
      allow_symbol_change: "1",
      save_image: "0",
      studies: "[]",
      show_popup_button: "1",
      popup_width: "1000",
      popup_height: "650",
    });
    return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
  }, [symbol, interval, theme]);

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <LineChart className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{i18n.t("tradingView.title")}</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tv-symbol" className="text-sm font-medium">
            {i18n.t("tradingView.symbol")}
          </label>
          <input
            id="tv-symbol"
            type="text"
            value={rawSymbol}
            onChange={(e) => setRawSymbol(e.target.value)}
            placeholder="BINANCE:BTCUSDT"
            className="h-9 w-64 rounded-md border bg-background px-3 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {i18n.t("tradingView.symbolHint")}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tv-interval" className="text-sm font-medium">
            {i18n.t("tradingView.interval")}
          </label>
          <select
            id="tv-interval"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="h-9 rounded-md border bg-background px-2 text-sm"
          >
            {INTERVALS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 overflow-hidden rounded-lg border bg-card">
        {symbol ? (
          <iframe
            key={`${symbol}-${interval}-${theme}`}
            src={embedUrl}
            title={i18n.t("tradingView.chartTitle")}
            className="h-full w-full border-0"
            allow="clipboard-write"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {i18n.t("tradingView.enterSymbol")}
          </div>
        )}
      </div>
    </div>
  );
}
