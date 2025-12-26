import * as React from 'react';

interface ExportButtonProps {
  content: string;
  filename?: string;
  format?: 'txt' | 'json' | 'md';
  label?: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  content,
  filename = 'pacsec-export',
  format = 'txt',
  label = 'Export',
  className = ''
}) => {
  const handleExport = () => {
    let mimeType: string;
    let processedContent = content;
    
    switch (format) {
      case 'json':
        mimeType = 'application/json';
        try {
          // Try to prettify if it's valid JSON
          processedContent = JSON.stringify(JSON.parse(content), null, 2);
        } catch {
          // If not valid JSON, wrap as text
          processedContent = JSON.stringify({ content, exportedAt: new Date().toISOString() }, null, 2);
        }
        break;
      case 'md':
        mimeType = 'text/markdown';
        processedContent = `# PACSEC Export\n\n*Exported: ${new Date().toLocaleString()}*\n\n---\n\n${content}`;
        break;
      default:
        mimeType = 'text/plain';
        processedContent = `PACSEC Export - ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n${content}`;
    }
    
    const blob = new Blob([processedContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className={`inline-flex items-center gap-1 px-2 py-1 text-[9px] font-arcade bg-gray-800 text-gray-300 hover:bg-pac-ghostCyan hover:text-black rounded transition-colors ${className}`}
      title={`Export as ${format.toUpperCase()}`}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
    </button>
  );
};

// Multi-format export dropdown
export const ExportDropdown: React.FC<{ content: string; filename?: string }> = ({ 
  content, 
  filename = 'pacsec-export' 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-arcade bg-gray-800 text-gray-300 hover:bg-gray-700 rounded transition-colors"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        EXPORT
        <svg className={`w-2 h-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 bg-gray-900 border border-gray-700 rounded shadow-lg z-10 min-w-[100px]">
          {(['txt', 'json', 'md'] as const).map((format) => (
            <ExportButton
              key={format}
              content={content}
              filename={filename}
              format={format}
              label={format.toUpperCase()}
              className="w-full justify-center rounded-none border-none hover:bg-gray-800"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
