export function csvCell(value: unknown): string {
  const text = String(value ?? '');
  const safe = /^[\s]*[=+\-@\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function makeCsv(headers: string[], rows: Record<string, unknown>[]): string {
  return '﻿' + [headers.map(csvCell).join(','), ...rows.map(row => headers.map(key => csvCell(row[key])).join(','))].join('\r\n');
}
