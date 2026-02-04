import type { Session } from '../types';
import { formatDatum, formatBedrag } from '../utils';

interface SessionListProps {
  sessions: Session[];
  onDelete: (id: string) => void;
}

export default function SessionList({ sessions, onDelete }: SessionListProps) {
  // Show most recent first
  const sorted = [...sessions].sort((a, b) => b.datum.localeCompare(a.datum));
  const recent = sorted.slice(0, 20);

  if (recent.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Nog geen oplaadsessies geregistreerd.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-1">
        Recente sessies
      </h3>
      {recent.map(session => (
        <div
          key={session.id}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900">
              {formatDatum(session.datum)}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {session.type === 'volledig' ? '100%' : `${Math.round(session.percentage * 100)}%`}
              {' '}
              &middot; {session.kWh} kWh
              {session.bron === 'csv' && (
                <span className="ml-1 text-gray-400">&middot; csv</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">
              {formatBedrag(session.bedrag)}
            </span>
            <button
              onClick={() => onDelete(session.id)}
              className="text-gray-300 active:text-red-500 p-1"
              aria-label="Verwijderen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      {sorted.length > 20 && (
        <p className="text-xs text-gray-400 text-center pt-2">
          {sorted.length - 20} oudere sessies niet getoond
        </p>
      )}
    </div>
  );
}
