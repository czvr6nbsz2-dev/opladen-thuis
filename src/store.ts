import type { Session, Settings } from './types';

const SESSIONS_KEY = 'opladen-thuis-sessions';
const SETTINGS_KEY = 'opladen-thuis-settings';

const DEFAULT_SETTINGS: Settings = {
  tarief: 0.28,
  standaardKWhVolledig: 18,
  valuta: 'EUR',
};

export function getSessions(): Session[] {
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export function saveSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function addSession(session: Session): Session[] {
  const sessions = getSessions();
  sessions.push(session);
  sessions.sort((a, b) => a.datum.localeCompare(b.datum));
  saveSessions(sessions);
  return sessions;
}

export function deleteSession(id: string): Session[] {
  const sessions = getSessions().filter(s => s.id !== id);
  saveSessions(sessions);
  return sessions;
}

export function getSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
