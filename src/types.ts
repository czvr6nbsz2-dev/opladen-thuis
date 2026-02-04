export interface Session {
  id: string;
  datum: string; // ISO date YYYY-MM-DD
  type: 'volledig' | 'gedeeltelijk';
  percentage: number; // 0-1 (1 = 100%)
  kWh: number;
  tarief: number;
  bedrag: number;
  bron: 'handmatig' | 'csv';
}

export interface Settings {
  tarief: number;
  standaardKWhVolledig: number;
  valuta: string;
}

export type TabId = 'home' | 'overzicht' | 'instellingen';
