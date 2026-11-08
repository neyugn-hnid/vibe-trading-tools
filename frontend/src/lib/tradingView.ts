// Shared TradingView symbol normalization so both the standalone
// /trading-view page and the RunDetail "open in TradingView" action map
// app-native symbols to TradingView `EXCHANGE:SYMBOL` form identically.

export function normalizeTradingViewSymbol(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  // Already in TradingView `EXCHANGE:SYMBOL` form — return as-is.
  if (value.includes(":")) return value.toUpperCase();
  // Common app suffixes -> TradingView exchange prefixes.
  if (/\.SH$/i.test(value)) return `SSE:${value.slice(0, -3)}`;
  if (/\.SZ$/i.test(value)) return `SZSE:${value.slice(0, -3)}`;
  if (/\.US$/i.test(value)) return `NASDAQ:${value.slice(0, -3)}`;
  if (/\.HK$/i.test(value)) return `HKEX:${value.slice(0, -3)}`;
  // Bare crypto pairs like BTCUSDT -> BINANCE:BTCUSDT.
  if (/^[A-Z0-9]{3,12}(USDT|USD|USDC|BUSD)$/i.test(value)) {
    return `BINANCE:${value.toUpperCase()}`;
  }
  return value.toUpperCase();
}
