import { useState } from 'react';
import { Competition } from '../types/competition';
import { X, Download, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitions: Competition[];
  onImport: (newCompetitions: Competition[]) => void;
  onResetToSample: () => void;
}

export default function ExportImportModal({
  isOpen,
  onClose,
  competitions,
  onImport,
  onResetToSample,
}: ExportImportModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(competitions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `orienteering-competitions-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMsg('Exported JSON successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleImportText = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Imported data must be an array of competitions.');
      }
      // Basic check
      for (const item of parsed) {
        if (!item.id || !item.name || typeof item.lat !== 'number' || typeof item.lng !== 'number') {
          throw new Error('Each competition must have at least an id, name, and numerical lat/lng coordinates.');
        }
      }
      onImport(parsed);
      setSuccessMsg(`Successfully imported ${parsed.length} competitions!`);
      setJsonText('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonText(text);
      } catch (err) {
        setErrorMsg('Failed to read file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-white">Data Management & Backup</h2>
            <p className="text-xs text-neutral-400">Export your race log or import from backup</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Export to JSON</div>
              <div className="text-xs text-neutral-400">
                Download all {competitions.length} logged competitions with GPS coordinates and Livelox links.
              </div>
            </div>
            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Import JSON Backup
              </div>
              <label className="text-xs text-orange-400 hover:text-orange-300 cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .json file</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={4}
              placeholder="Paste JSON array of competitions here..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 focus:outline-none focus:border-neutral-700 placeholder-neutral-600"
            />

            <button
              onClick={handleImportText}
              disabled={!jsonText.trim()}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg border border-neutral-700 transition-colors"
            >
              Import Competitions
            </button>
          </div>

          {/* Reset to Sample Section */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-neutral-300">Reset to Sample Competitions</div>
              <div className="text-[11px] text-neutral-500">
                Restore the default set of famous Swedish and Nordic events (Tiomila, O-Ringen, Jukola).
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset all competitions back to the default sample events?')) {
                  onResetToSample();
                  setSuccessMsg('Reset to sample data successfully!');
                  setTimeout(() => onClose(), 1200);
                }
              }}
              className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 rounded-lg border border-red-900/50 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
