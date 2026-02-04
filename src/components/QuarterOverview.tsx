import type { Session } from '../types';
import { getQuarterSummaries, formatBedrag, getCurrentQuarterKey } from '../utils';
import type { QuarterSummary } from '../utils';

interface QuarterOverviewProps {
  sessions: Session[];
}

export default function QuarterOverview({ sessions }: QuarterOverviewProps) {
  const summaries = getQuarterSummaries(sessions);
  const currentKey = getCurrentQuarterKey();

  if (summaries.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Nog geen data om weer te geven.
      </div>
    );
  }

  // Show most recent quarter first
  const reversed = [...summaries].reverse();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 px-1">Kwartaaloverzicht</h2>
      {reversed.map(s => (
        <QuarterCard key={s.label} summary={s} isCurrent={`${s.year}-Q${s.quarter}` === currentKey} />
      ))}
      <TotalCard summaries={summaries} />
    </div>
  );
}

function QuarterCard({ summary, isCurrent }: { summary: QuarterSummary; isCurrent: boolean }) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm ${isCurrent ? 'ring-2 ring-green-500' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">
          {summary.label}
          {isCurrent && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              huidig
            </span>
          )}
        </h3>
        <span className="text-lg font-bold text-green-700">
          {formatBedrag(summary.totalBedrag)}
        </span>
      </div>
      <div className="flex gap-6 text-sm text-gray-500">
        <div>
          <span className="font-medium text-gray-700">{summary.sessies}</span> sessies
        </div>
        <div>
          <span className="font-medium text-gray-700">{summary.totalKWh}</span> kWh
        </div>
      </div>
    </div>
  );
}

function TotalCard({ summaries }: { summaries: QuarterSummary[] }) {
  const totalSessies = summaries.reduce((a, s) => a + s.sessies, 0);
  const totalKWh = Math.round(summaries.reduce((a, s) => a + s.totalKWh, 0) * 100) / 100;
  const totalBedrag = Math.round(summaries.reduce((a, s) => a + s.totalBedrag, 0) * 100) / 100;

  return (
    <div className="bg-gray-900 text-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Totaal</h3>
        <span className="text-lg font-bold">{formatBedrag(totalBedrag)}</span>
      </div>
      <div className="flex gap-6 text-sm text-gray-300">
        <div>
          <span className="font-medium text-white">{totalSessies}</span> sessies
        </div>
        <div>
          <span className="font-medium text-white">{totalKWh}</span> kWh
        </div>
      </div>
    </div>
  );
}
