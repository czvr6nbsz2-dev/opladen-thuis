import type { Session, Settings } from './types';

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function berekenKWh(percentage: number, settings: Settings): number {
  return round2(percentage * settings.standaardKWhVolledig);
}

export function berekenBedrag(kWh: number, tarief: number): number {
  return round2(kWh * tarief);
}

export function createSession(
  percentage: number,
  settings: Settings,
  bron: 'handmatig' | 'csv' = 'handmatig',
  datum?: string,
): Session {
  const kWh = berekenKWh(percentage, settings);
  const bedrag = berekenBedrag(kWh, settings.tarief);
  return {
    id: crypto.randomUUID(),
    datum: datum ?? todayISO(),
    type: percentage >= 1 ? 'volledig' : 'gedeeltelijk',
    percentage,
    kWh,
    tarief: settings.tarief,
    bedrag,
    bron,
  };
}

export function getQuarter(datum: string): { year: number; quarter: number } {
  const d = new Date(datum);
  const month = d.getMonth(); // 0-11
  return {
    year: d.getFullYear(),
    quarter: Math.floor(month / 3) + 1,
  };
}

export function quarterLabel(year: number, quarter: number): string {
  return `Q${quarter} ${year}`;
}

export function formatDatum(datum: string): string {
  const d = new Date(datum);
  return d.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatBedrag(bedrag: number, valuta: string = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: valuta,
  }).format(bedrag);
}

export function sessionsOnDate(sessions: Session[], datum: string): Session[] {
  return sessions.filter(s => s.datum === datum);
}

// CSV parsing for the specific format:
// Datum;Procent;KW; €
// 4-7-2025;0,33;5,94; 1,66
export function parseCsv(csvText: string): Session[] {
  const lines = csvText.trim().split('\n');
  const sessions: Session[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(';').map(s => s.trim());
    const datumRaw = parts[0];

    // Skip header row
    if (datumRaw === 'Datum') continue;
    // Skip quarterly summary rows (e.g. "Q3 2025")
    if (datumRaw.startsWith('Q')) continue;
    // Skip empty datum
    if (!datumRaw) continue;

    const percentageRaw = parts[1];
    const kWhRaw = parts[2];
    const bedragRaw = parts[3];

    // Parse Dutch decimal format
    const percentage = parseFloat(percentageRaw.replace(',', '.'));
    const kWh = parseFloat(kWhRaw.replace(',', '.'));
    const bedrag = parseFloat(bedragRaw.replace(',', '.'));

    if (isNaN(percentage) || isNaN(kWh) || isNaN(bedrag)) continue;

    // Parse date: d-m-yyyy → YYYY-MM-DD
    const datumParts = datumRaw.split('-');
    if (datumParts.length !== 3) continue;
    const day = datumParts[0].padStart(2, '0');
    const month = datumParts[1].padStart(2, '0');
    const year = datumParts[2];
    const datum = `${year}-${month}-${day}`;

    const tarief = kWh > 0 ? round2(bedrag / kWh) : 0.28;

    sessions.push({
      id: crypto.randomUUID(),
      datum,
      type: percentage >= 1 ? 'volledig' : 'gedeeltelijk',
      percentage,
      kWh,
      tarief,
      bedrag,
      bron: 'csv',
    });
  }

  return sessions;
}

export interface QuarterSummary {
  year: number;
  quarter: number;
  label: string;
  sessies: number;
  totalKWh: number;
  totalBedrag: number;
}

export function getQuarterSummaries(sessions: Session[]): QuarterSummary[] {
  const map = new Map<string, QuarterSummary>();

  for (const s of sessions) {
    const { year, quarter } = getQuarter(s.datum);
    const key = `${year}-Q${quarter}`;
    if (!map.has(key)) {
      map.set(key, {
        year,
        quarter,
        label: quarterLabel(year, quarter),
        sessies: 0,
        totalKWh: 0,
        totalBedrag: 0,
      });
    }
    const summary = map.get(key)!;
    summary.sessies++;
    summary.totalKWh = round2(summary.totalKWh + s.kWh);
    summary.totalBedrag = round2(summary.totalBedrag + s.bedrag);
  }

  return Array.from(map.values()).sort(
    (a, b) => a.year - b.year || a.quarter - b.quarter,
  );
}

export function getCurrentQuarterKey(): string {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${q}`;
}
