export function parseRoughInr(text: string): number | null {
  const m = text.match(/₹\s*([\d,]+)/);
  if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  const lakhs = text.match(/([\d.]+)\s*lakh/i);
  if (lakhs) return Math.round(parseFloat(lakhs[1]) * 100000);
  return null;
}

export function titleFromInput(raw: string) {
  const line = raw.trim().split("\n")[0]?.slice(0, 80) ?? "Untitled decision";
  return line.length < raw.trim().length ? `${line}...` : line;
}
