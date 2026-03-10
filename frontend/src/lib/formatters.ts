export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);

export const formatChange = (change: number, pct: number) => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatPrice(change)} (${sign}${pct.toFixed(2)}%)`;
};

export const formatWAT = (date: Date | string) =>
  new Date(date).toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatWATShort = (date: Date | string) =>
  new Date(date).toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit' });

export const formatRR = (rr: number) => `1:${Math.abs(rr).toFixed(1)}`;
