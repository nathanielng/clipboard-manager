import { useState, useEffect } from 'react';
import ClipboardInput from './components/ClipboardInput';
import ClipboardHistory from './components/ClipboardHistory';
import './App.css';

export interface ClipboardEntry {
  id: string;
  content: string;
  createdAt: string;
  device?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [entries, setEntries] = useState<ClipboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/clipboard`);
      if (!response.ok) throw new Error('Failed to fetch clipboard entries');
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (content: string) => {
    try {
      const device = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        ? 'Mobile'
        : 'Desktop';

      const response = await fetch(`${API_URL}/clipboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, device }),
      });

      if (!response.ok) throw new Error('Failed to save clipboard entry');

      const newEntry = await response.json();
      setEntries([newEntry, ...entries]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
      console.error('Error adding entry:', err);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/clipboard/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      setEntries(entries.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      console.error('Error deleting entry:', err);
    }
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all clipboard history?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/clipboard`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear entries');

      setEntries([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear entries');
      console.error('Error clearing entries:', err);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const filteredEntries = searchQuery
    ? entries.filter(entry =>
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>📋 Clipboard Manager</h1>
          <p className="subtitle">Track your clipboard history across all devices</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="error-close">×</button>
            </div>
          )}

          <ClipboardInput onAdd={addEntry} />

          <div className="controls">
            <input
              type="text"
              placeholder="Search clipboard history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div className="button-group">
              <button onClick={fetchEntries} className="btn btn-secondary">
                🔄 Refresh
              </button>
              {entries.length > 0 && (
                <button onClick={clearAll} className="btn btn-danger">
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>

          <ClipboardHistory
            entries={filteredEntries}
            loading={loading}
            onDelete={deleteEntry}
            onCopy={copyToClipboard}
          />
        </div>
      </main>

      <footer className="footer">
        <p>Clipboard Manager • Cross-platform • Open Source</p>
      </footer>
    </div>
  );
}

export default App;
