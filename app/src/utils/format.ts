export function formatUsd(value: string | number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatToken(value: string | number, symbol: string): string {
  const amount = Number(value);
  const maximumFractionDigits = amount >= 1 ? 4 : 8;
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(amount)} ${symbol}`;
}

export function formatPercent(value: string | number): string {
  const numeric = Number(value);
  const sign = numeric > 0 ? '+' : '';
  return `${sign}${numeric.toFixed(2)}%`;
}
