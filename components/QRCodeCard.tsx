import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

interface QRCodeCardProps {
  data?: string;
  label?: string;
  size?: number;
}

// Simple QR Code generator using a canvas-based approach
// For production, consider using a library like 'qrcode' for better QR generation
export const QRCodeCard: React.FC<QRCodeCardProps> = ({ data: initialData = '', label = 'QR Code', size = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (canvasRef.current && data) {
      generateQR(canvasRef.current, data, size);
    }
  }, [data, size]);

  // Simple QR-like pattern generator (visual placeholder)
  // In production, use a proper QR library
  const generateQR = (canvas: HTMLCanvasElement, text: string, qrSize: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = qrSize;
    canvas.height = qrSize;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, qrSize, qrSize);

    // Simple pattern based on text hash
    const moduleCount = 25;
    const moduleSize = qrSize / moduleCount;
    
    // Create a deterministic pattern from the data
    const hash = simpleHash(text);
    
    ctx.fillStyle = '#000000';
    
    // Draw position patterns (corners)
    drawPositionPattern(ctx, 0, 0, moduleSize * 7);
    drawPositionPattern(ctx, qrSize - moduleSize * 7, 0, moduleSize * 7);
    drawPositionPattern(ctx, 0, qrSize - moduleSize * 7, moduleSize * 7);
    
    // Draw data modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip position patterns
        if (isPositionPattern(row, col, moduleCount)) continue;
        
        // Use hash to determine if module is filled
        const index = row * moduleCount + col;
        const shouldFill = ((hash >> (index % 32)) & 1) === 1 || 
                          text.charCodeAt(index % text.length) % 2 === 0;
        
        if (shouldFill) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize - 1, moduleSize - 1);
        }
      }
    }
  };

  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const drawPositionPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const module = size / 7;
    // Outer square
    ctx.fillRect(x, y, size, size);
    // Inner white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + module, y + module, size - module * 2, size - module * 2);
    // Inner black
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + module * 2, y + module * 2, size - module * 4, size - module * 4);
  };

  const isPositionPattern = (row: number, col: number, moduleCount: number): boolean => {
    // Top-left
    if (row < 8 && col < 8) return true;
    // Top-right
    if (row < 8 && col >= moduleCount - 8) return true;
    // Bottom-left
    if (row >= moduleCount - 8 && col < 8) return true;
    return false;
  };

  const handleDownload = () => {
    if (!canvasRef.current || !data) return;
    const link = document.createElement('a');
    link.download = `pacsec-qr-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    if (!canvasRef.current || !data) return;
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((b) => resolve(b!), 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR code:', err);
    }
  };

  return (
    <div className="bg-black/50 border border-pac-yellow/30 rounded-lg p-4 flex flex-col items-center gap-4">
      <div className="text-xs font-arcade text-pac-yellow uppercase tracking-widest">
        {label}
      </div>
      
      {/* Input field when no data is provided */}
      <div className="w-full">
        <input
          type="text"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter text or URL to encode..."
          className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:border-pac-yellow focus:outline-none"
        />
      </div>
      
      {data ? (
        <>
          <div className="bg-white p-3 rounded-lg shadow-lg">
            <canvas ref={canvasRef} className="block" />
          </div>
          
          <div className="text-[10px] font-mono text-gray-500 max-w-[200px] truncate text-center">
            {data.length > 40 ? data.substring(0, 40) + '...' : data}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-pac-blue text-white text-[10px] font-arcade rounded hover:bg-pac-blue/80 transition-colors"
            >
              DOWNLOAD
            </button>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-[10px] font-arcade rounded transition-colors ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </>
      ) : (
        <div className="text-xs text-gray-500 text-center py-8">
          Enter text above to generate QR code
        </div>
      )}
    </div>
  );
};

export default QRCodeCard;
