import { Message } from '../types';

export interface ExportOptions {
  format: 'json' | 'text' | 'markdown' | 'html';
  includeTimestamps: boolean;
  includeSecrets: boolean;
  encrypted: boolean;
  password?: string;
}

// Simple XOR encryption for basic protection (not cryptographically secure, but obfuscates content)
const xorEncrypt = (text: string, password: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ password.charCodeAt(i % password.length));
  }
  return btoa(result);
};

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export const exportChatAsJSON = (messages: Message[], options: ExportOptions): string => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    application: 'PAC-SEC Security Assistant',
    version: '2.0.0',
    messageCount: messages.length,
    messages: messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      text: msg.text || '',
      timestamp: options.includeTimestamps ? formatTimestamp(parseInt(msg.id)) : undefined,
      toolType: options.includeSecrets && msg.toolCall ? msg.toolCall.type : undefined,
      toolConfig: options.includeSecrets ? msg.toolCall : undefined,
    }))
  };

  let jsonStr = JSON.stringify(exportData, null, 2);
  
  if (options.encrypted && options.password) {
    jsonStr = xorEncrypt(jsonStr, options.password);
    return JSON.stringify({ encrypted: true, data: jsonStr });
  }
  
  return jsonStr;
};

export const exportChatAsText = (messages: Message[], options: ExportOptions): string => {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════════════',
    '                    PAC-SEC CHAT EXPORT',
    '═══════════════════════════════════════════════════════════════',
    `Exported: ${new Date().toLocaleString()}`,
    `Messages: ${messages.length}`,
    '═══════════════════════════════════════════════════════════════',
    ''
  ];

  messages.forEach((msg, index) => {
    const role = msg.role === 'user' ? '👤 USER' : '🤖 PAC';
    const time = options.includeTimestamps ? ` [${formatTimestamp(parseInt(msg.id))}]` : '';
    
    lines.push(`--- Message ${index + 1} ---`);
    lines.push(`${role}${time}`);
    lines.push('');
    lines.push(stripHtml(msg.text || ''));
    
    if (options.includeSecrets && msg.toolCall) {
      lines.push('');
      lines.push(`[Tool: ${msg.toolCall.type}]`);
    }
    
    lines.push('');
  });

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('                      END OF EXPORT');
  lines.push('═══════════════════════════════════════════════════════════════');

  let text = lines.join('\n');
  
  if (options.encrypted && options.password) {
    text = xorEncrypt(text, options.password);
    return `[ENCRYPTED PAC-SEC EXPORT]\n${text}`;
  }
  
  return text;
};

export const exportChatAsMarkdown = (messages: Message[], options: ExportOptions): string => {
  const lines: string[] = [
    '# PAC-SEC Chat Export',
    '',
    `**Exported:** ${new Date().toLocaleString()}`,
    `**Messages:** ${messages.length}`,
    '',
    '---',
    ''
  ];

  messages.forEach((msg) => {
    const role = msg.role === 'user' ? '## 👤 User' : '## 🤖 PAC';
    const time = options.includeTimestamps ? `*${formatTimestamp(parseInt(msg.id))}*` : '';
    
    lines.push(role);
    if (time) lines.push(time);
    lines.push('');
    lines.push(stripHtml(msg.text || ''));
    
    if (options.includeSecrets && msg.toolCall) {
      lines.push('');
      lines.push(`> **Tool Used:** \`${msg.toolCall.type}\``);
    }
    
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  let md = lines.join('\n');
  
  if (options.encrypted && options.password) {
    md = xorEncrypt(md, options.password);
    return `# [ENCRYPTED PAC-SEC EXPORT]\n\n\`\`\`\n${md}\n\`\`\``;
  }
  
  return md;
};

export const exportChatAsHTML = (messages: Message[], options: ExportOptions): string => {
  const messagesHtml = messages.map(msg => {
    const roleClass = msg.role === 'user' ? 'user-message' : 'pac-message';
    const roleLabel = msg.role === 'user' ? '👤 User' : '🤖 PAC';
    const time = options.includeTimestamps 
      ? `<span class="timestamp">${formatTimestamp(parseInt(msg.id))}</span>` 
      : '';
    const tool = options.includeSecrets && msg.toolCall 
      ? `<div class="tool-badge">Tool: ${msg.toolCall.type}</div>` 
      : '';

    return `
      <div class="message ${roleClass}">
        <div class="message-header">
          <span class="role">${roleLabel}</span>
          ${time}
        </div>
        <div class="message-content">${msg.text || ''}</div>
        ${tool}
      </div>
    `;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PAC-SEC Chat Export</title>
  <style>
    :root {
      --pac-blue: #00bbd4;
      --pac-yellow: #ffde03;
      --bg-dark: #0f0f1a;
      --bg-card: #1a1a2e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: var(--bg-dark);
      color: #fff;
      padding: 2rem;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem;
      border: 2px solid var(--pac-blue);
      border-radius: 1rem;
      background: var(--bg-card);
    }
    .header h1 {
      color: var(--pac-blue);
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .header p { color: #888; font-size: 0.875rem; }
    .message {
      background: var(--bg-card);
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border-left: 4px solid var(--pac-blue);
    }
    .message.user-message { border-left-color: var(--pac-yellow); }
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .role { font-weight: 600; color: var(--pac-blue); }
    .user-message .role { color: var(--pac-yellow); }
    .timestamp { font-size: 0.75rem; color: #666; }
    .message-content { color: #ccc; }
    .tool-badge {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: var(--pac-blue);
      color: #000;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      display: inline-block;
    }
    .footer {
      text-align: center;
      padding: 2rem;
      color: #666;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎮 PAC-SEC Chat Export</h1>
    <p>Exported: ${new Date().toLocaleString()}</p>
    <p>Messages: ${messages.length}</p>
  </div>
  
  <div class="messages">
    ${messagesHtml}
  </div>
  
  <div class="footer">
    <p>Generated by PAC-SEC Security Assistant</p>
  </div>
</body>
</html>`;

  if (options.encrypted && options.password) {
    const encrypted = xorEncrypt(html, options.password);
    return `<!-- ENCRYPTED PAC-SEC EXPORT -->\n<!-- ${encrypted} -->`;
  }
  
  return html;
};

export const exportChat = (messages: Message[], options: ExportOptions): string => {
  switch (options.format) {
    case 'json':
      return exportChatAsJSON(messages, options);
    case 'text':
      return exportChatAsText(messages, options);
    case 'markdown':
      return exportChatAsMarkdown(messages, options);
    case 'html':
      return exportChatAsHTML(messages, options);
    default:
      return exportChatAsJSON(messages, options);
  }
};

export const downloadExport = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getExportFilename = (format: ExportOptions['format']): string => {
  const date = new Date().toISOString().split('T')[0];
  const extensions: Record<ExportOptions['format'], string> = {
    json: 'json',
    text: 'txt',
    markdown: 'md',
    html: 'html'
  };
  return `pacsec-chat-${date}.${extensions[format]}`;
};

export const getMimeType = (format: ExportOptions['format']): string => {
  const mimeTypes: Record<ExportOptions['format'], string> = {
    json: 'application/json',
    text: 'text/plain',
    markdown: 'text/markdown',
    html: 'text/html'
  };
  return mimeTypes[format];
};
