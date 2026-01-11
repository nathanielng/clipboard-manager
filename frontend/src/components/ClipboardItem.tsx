import { useState } from 'react';
import { ClipboardEntry } from '../App';
import './ClipboardItem.css';

interface ClipboardItemProps {
  entry: ClipboardEntry;
  onDelete: (id: string) => Promise<void>;
  onCopy: (content: string) => Promise<void>;
}

function ClipboardItem({ entry, onDelete, onCopy }: ClipboardItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this clipboard entry?')) return;

    setIsDeleting(true);
    try {
      await onDelete(entry.id);
    } catch (error) {
      console.error('Failed to delete:', error);
      setIsDeleting(false);
    }
  };

  const handleCopy = async () => {
    await onCopy(entry.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const shouldTruncate = entry.content.length > 150;

  return (
    <div className={`clipboard-item ${isDeleting ? 'deleting' : ''}`}>
      <div className="item-header">
        <div className="item-meta">
          <span className="item-time">🕒 {formatDate(entry.createdAt)}</span>
          {entry.device && (
            <span className="item-device">
              {entry.device === 'Mobile' ? '📱' : '💻'} {entry.device}
            </span>
          )}
        </div>
        <div className="item-actions">
          <button
            onClick={handleCopy}
            className="btn-icon btn-copy"
            title="Copy to clipboard"
            disabled={copied}
          >
            {copied ? '✓' : '📋'}
          </button>
          <button
            onClick={handleDelete}
            className="btn-icon btn-delete"
            title="Delete entry"
            disabled={isDeleting}
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="item-content">
        <pre className="content-text">
          {expanded || !shouldTruncate
            ? entry.content
            : truncateContent(entry.content)}
        </pre>
        {shouldTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn-expand"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ClipboardItem;
