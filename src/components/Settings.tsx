import { useState } from 'react';
import type { Settings as SettingsType, Session } from '../types';
import CsvImport from './CsvImport';

interface SettingsProps {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onImportCsv: (sessions: Session[]) => void;
  sessionCount: number;
  onClearData: () => void;
}

export default function Settings({
  settings,
  onSave,
  onImportCsv,
  sessionCount,
  onClearData,
}: SettingsProps) {
  const [tarief, setTarief] = useState(settings.tarief.toString().replace('.', ','));
  const [kWh, setKWh] = useState(settings.standaardKWhVolledig.toString().replace('.', ','));
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const t = parseFloat(tarief.replace(',', '.'));
    const k = parseFloat(kWh.replace(',', '.'));
    if (isNaN(t) || isNaN(k) || t <= 0 || k <= 0) return;
    onSave({ ...settings, tarief: t, standaardKWhVolledig: k });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 px-1">Instellingen</h2>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tarief per kWh
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">&euro;</span>
            <input
              type="text"
              inputMode="decimal"
              value={tarief}
              onChange={e => setTarief(e.target.value)}
              className="w-full py-3 pl-9 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Standaard kWh bij 100% lading
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={kWh}
              onChange={e => setKWh(e.target.value)}
              className="w-full py-3 px-4 pr-14 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kWh</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-xl active:bg-green-700"
        >
          {saved ? 'Opgeslagen!' : 'Opslaan'}
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Data importeren</h3>
        <CsvImport onImport={onImportCsv} />
        <p className="text-xs text-gray-400">
          CSV-formaat: Datum;Procent;KW;Bedrag (met ; als scheidingsteken)
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Gegevens</h3>
        <p className="text-sm text-gray-500">
          {sessionCount} oplaadsessie{sessionCount !== 1 ? 's' : ''} opgeslagen
        </p>
        {sessionCount > 0 && (
          <button
            onClick={onClearData}
            className="w-full py-3 px-4 border border-red-300 text-red-600 font-medium rounded-xl active:bg-red-50"
          >
            Alle data wissen
          </button>
        )}
      </div>
    </div>
  );
}
