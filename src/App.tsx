import { useState, useCallback } from 'react';
import type { TabId, Session, Settings as SettingsType } from './types';
import { getSessions, saveSessions, addSession, deleteSession, getSettings, saveSettings } from './store';
import AddSession from './components/AddSession';
import SessionList from './components/SessionList';
import QuarterOverview from './components/QuarterOverview';
import Settings from './components/Settings';
import ConfirmDialog from './components/ConfirmDialog';

function App() {
  const [tab, setTab] = useState<TabId>('home');
  const [sessions, setSessions] = useState<Session[]>(getSessions);
  const [settings, setSettings] = useState<SettingsType>(getSettings);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleAdd = useCallback((session: Session) => {
    setSessions(addSession(session));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSessions(deleteSession(id));
  }, []);

  const handleSettingsSave = useCallback((s: SettingsType) => {
    saveSettings(s);
    setSettings(s);
  }, []);

  const handleImportCsv = useCallback((imported: Session[]) => {
    const current = getSessions();
    const merged = [...current, ...imported];
    merged.sort((a, b) => a.datum.localeCompare(b.datum));
    saveSessions(merged);
    setSessions(merged);
  }, []);

  const handleClearData = useCallback(() => {
    saveSessions([]);
    setSessions([]);
    setConfirmClear(false);
  }, []);

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-[#2B4570] text-white px-5 pt-12 pb-4 safe-area-top">
        <h1 className="text-xl font-bold">Opladen Thuis</h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 space-y-5">
        {tab === 'home' && (
          <>
            <AddSession sessions={sessions} settings={settings} onAdd={handleAdd} />
            <SessionList sessions={sessions} onDelete={handleDelete} />
          </>
        )}
        {tab === 'overzicht' && <QuarterOverview sessions={sessions} />}
        {tab === 'instellingen' && (
          <Settings
            settings={settings}
            onSave={handleSettingsSave}
            onImportCsv={handleImportCsv}
            sessionCount={sessions.length}
            onClearData={() => setConfirmClear(true)}
          />
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="max-w-lg mx-auto flex">
          <TabButton
            active={tab === 'home'}
            onClick={() => setTab('home')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            label="Opladen"
          />
          <TabButton
            active={tab === 'overzicht'}
            onClick={() => setTab('overzicht')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            label="Overzicht"
          />
          <TabButton
            active={tab === 'instellingen'}
            onClick={() => setTab('instellingen')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            label="Instellingen"
          />
        </div>
      </nav>

      {/* Confirm clear data dialog */}
      {confirmClear && (
        <ConfirmDialog
          title="Data wissen"
          message="Weet je zeker dat je alle oplaadsessies wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
          confirmLabel="Ja, alles wissen"
          cancelLabel="Annuleren"
          onConfirm={handleClearData}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-2 pt-3 ${
        active ? 'text-cyan-500' : 'text-gray-400'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

export default App;
