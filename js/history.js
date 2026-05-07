// ============================================================
// HISTORY — LocalStorage operation log
// ============================================================

const STORAGE_KEY = 'cf_history';
const MAX_ENTRIES = 50;

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveHistory(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function addHistoryEntry(tool, inputPreview, output) {
  const entries = getHistory();
  entries.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    tool,
    input: (inputPreview || '').slice(0, 100),
    output: (output || '').slice(0, 200)
  });
  saveHistory(entries);
}

export function getHistoryEntries() {
  return getHistory();
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportHistory(format = 'json') {
  const entries = getHistory();
  let content, filename, mime;

  if (format === 'csv') {
    const header = 'Timestamp,Tool,Input,Output\n';
    const rows = entries.map(e =>
      `"${e.timestamp}","${e.tool}","${e.input.replace(/"/g, '""')}","${e.output.replace(/"/g, '""')}"`
    ).join('\n');
    content = header + rows;
    filename = 'cryptoforge-history.csv';
    mime = 'text/csv';
  } else {
    content = JSON.stringify(entries, null, 2);
    filename = 'cryptoforge-history.json';
    mime = 'application/json';
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
