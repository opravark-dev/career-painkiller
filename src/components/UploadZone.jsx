import { useState, useRef } from 'react';

export function UploadZone({ onFileSelect, resumeText, loading, err, t }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect({ target: { files } });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !loading && fileInputRef.current?.click()}
      style={{
        border: `2px dashed ${isDragging ? t.accent : t.borderSub}`,
        borderRadius: 20,
        padding: '60px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        cursor: loading ? 'default' : 'pointer',
        background: isDragging ? t.accentBg : t.elevated,
        transition: 'all 0.2s ease',
        textAlign: 'center'
      }}
    >
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        background: t.accentBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        transition: 'transform 0.2s',
        transform: isDragging ? 'scale(1.1)' : 'scale(1)'
      }}>📄</div>

      <div style={{ maxWidth: 240 }}>
        <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 6px', color: t.text }}>
          {resumeText ? '✓ Resume uploaded' : 'Upload your resume'}
        </p>
        <p style={{ fontSize: 13, color: t.textSub, margin: 0, lineHeight: 1.4 }}>
          Drag and drop your file here or <span style={{ color: t.accent, fontWeight: 600 }}>browse</span>
        </p>
        <div style={{
          marginTop: 12,
          fontSize: 11,
          color: t.textMuted,
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          opacity: 0.7
        }}>
          <span style={{ fontWeight: 600 }}>PDF</span> • <span style={{ fontWeight: 600 }}>TXT</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf"
        style={{ display: 'none' }}
        onChange={onFileSelect}
      />
    </div>
  );
}
