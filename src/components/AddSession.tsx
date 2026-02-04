import { useState } from 'react';
import type { Session, Settings } from '../types';
import { todayISO, createSession, sessionsOnDate } from '../utils';
import ConfirmDialog from './ConfirmDialog';

type Step = 'idle' | 'choose' | 'partial' | 'duplicate-check';

interface AddSessionProps {
  sessions: Session[];
  settings: Settings;
  onAdd: (session: Session) => void;
}

export default function AddSession({ sessions, settings, onAdd }: AddSessionProps) {
  const [step, setStep] = useState<Step>('idle');
  const [percentage, setPercentage] = useState('');
  const [pendingSession, setPendingSession] = useState<Session | null>(null);

  function handleFullSession() {
    const session = createSession(1, settings);
    checkDuplicateAndSave(session);
  }

  function handlePartialSubmit() {
    const pct = parseFloat(percentage.replace(',', '.'));
    if (isNaN(pct) || pct <= 0 || pct > 100) return;
    const session = createSession(pct / 100, settings);
    checkDuplicateAndSave(session);
  }

  function checkDuplicateAndSave(session: Session) {
    const existing = sessionsOnDate(sessions, todayISO());
    if (existing.length > 0) {
      setPendingSession(session);
      setStep('duplicate-check');
    } else {
      saveAndReset(session);
    }
  }

  function saveAndReset(session: Session) {
    onAdd(session);
    setStep('idle');
    setPercentage('');
    setPendingSession(null);
  }

  function handleCancel() {
    setStep('idle');
    setPercentage('');
    setPendingSession(null);
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('choose')}
        className="w-full py-4 px-6 bg-cyan-500 text-white text-lg font-semibold rounded-2xl shadow-lg active:bg-cyan-600 active:scale-[0.98] transition-transform"
      >
        + Oplaadsessie toevoegen
      </button>
    );
  }

  if (step === 'choose') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
        <h3 className="text-base font-semibold text-gray-900">
          Was dit een volledige (100%) oplaadsessie?
        </h3>
        <button
          onClick={handleFullSession}
          className="w-full py-3.5 px-4 bg-cyan-500 text-white font-medium rounded-xl active:bg-cyan-600"
        >
          Ja, 100%
        </button>
        <button
          onClick={() => setStep('partial')}
          className="w-full py-3.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl active:bg-gray-100"
        >
          Nee, gedeeltelijk
        </button>
        <button
          onClick={handleCancel}
          className="w-full py-2 text-gray-400 text-sm"
        >
          Annuleren
        </button>
      </div>
    );
  }

  if (step === 'partial') {
    const pctNum = parseFloat((percentage || '0').replace(',', '.'));
    const isValid = !isNaN(pctNum) && pctNum > 0 && pctNum <= 100;
    const previewKWh = isValid
      ? Math.round(pctNum / 100 * settings.standaardKWhVolledig * 100) / 100
      : 0;
    const previewBedrag = isValid
      ? Math.round(previewKWh * settings.tarief * 100) / 100
      : 0;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">
          Hoeveel procent opgeladen?
        </h3>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            autoFocus
            placeholder="bijv. 33"
            value={percentage}
            onChange={e => setPercentage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && isValid && handlePartialSubmit()}
            className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
        </div>
        {isValid && (
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            {previewKWh} kWh = <span className="font-semibold text-gray-700">&euro; {previewBedrag.toFixed(2)}</span>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium active:bg-gray-100"
          >
            Annuleren
          </button>
          <button
            onClick={handlePartialSubmit}
            disabled={!isValid}
            className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 text-white font-medium active:bg-cyan-600 disabled:opacity-40 disabled:active:bg-cyan-500"
          >
            Opslaan
          </button>
        </div>
      </div>
    );
  }

  if (step === 'duplicate-check' && pendingSession) {
    return (
      <ConfirmDialog
        title="Extra sessie"
        message="Er is vandaag al een oplaadsessie geregistreerd. Is dit bewust een extra sessie?"
        confirmLabel="Ja, toevoegen"
        cancelLabel="Nee, annuleren"
        onConfirm={() => saveAndReset(pendingSession)}
        onCancel={handleCancel}
      />
    );
  }

  return null;
}
