import { ClipboardEntry } from '../App';
import ClipboardItem from './ClipboardItem';
import './ClipboardHistory.css';

interface ClipboardHistoryProps {
  entries: ClipboardEntry[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onCopy: (content: string) => Promise<void>;
}

function ClipboardHistory({ entries, loading, onDelete, onCopy }: ClipboardHistoryProps) {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading clipboard history...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No clipboard entries yet</h3>
        <p>Start by pasting or typing content above to build your clipboard history.</p>
      </div>
    );
  }

  return (
    <div className="clipboard-history">
      <div className="history-header">
        <h2>Clipboard History ({entries.length})</h2>
      </div>
      <div className="history-list">
        {entries.map((entry) => (
          <ClipboardItem
            key={entry.id}
            entry={entry}
            onDelete={onDelete}
            onCopy={onCopy}
          />
        ))}
      </div>
    </div>
  );
}

export default ClipboardHistory;
