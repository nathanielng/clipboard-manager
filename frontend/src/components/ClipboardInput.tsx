import { useState, FormEvent } from 'react';
import './ClipboardInput.css';

interface ClipboardInputProps {
  onAdd: (content: string) => Promise<void>;
}

function ClipboardInput({ onAdd }: ClipboardInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to add entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert('Please grant clipboard permissions or paste manually (Ctrl+V / Cmd+V)');
    }
  };

  return (
    <div className="clipboard-input">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or type content here..."
            className="input-textarea"
            rows={4}
            disabled={isSubmitting}
          />
        </div>
        <div className="input-actions">
          <button
            type="button"
            onClick={handlePaste}
            className="btn btn-paste"
            disabled={isSubmitting}
          >
            📋 Paste from Clipboard
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? '⏳ Saving...' : '💾 Save to History'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClipboardInput;
