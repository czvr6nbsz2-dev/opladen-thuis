import { useRef } from 'react';
import type { Session } from '../types';
import { parseCsv } from '../utils';

interface CsvImportProps {
  onImport: (sessions: Session[]) => void;
}

export default function CsvImport({ onImport }: CsvImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const sessions = parseCsv(text);
      if (sessions.length > 0) {
        onImport(sessions);
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be re-imported
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFile}
        className="hidden"
        id="csv-input"
      />
      <label
        htmlFor="csv-input"
        className="block w-full py-3 px-4 text-center border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium cursor-pointer active:bg-gray-50"
      >
        CSV-bestand importeren
      </label>
    </div>
  );
}
