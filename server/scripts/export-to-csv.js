import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '..', 'logs');
const chatFiles = fs.readdirSync(logsDir).filter(f => f.startsWith('chat-'));

let csv = 'Timestamp,Query,Confidence,Category,ResponseTime,Sources\n';

chatFiles.forEach(file => {
  const content = fs.readFileSync(path.join(logsDir, file), 'utf-8');
  const lines = content.split('\n').filter(Boolean);
  
  lines.forEach(line => {
    const data = JSON.parse(line);
    csv += `"${data.timestamp}","${data.query}","${data.confidence}","${data.queryCategory}","${data.metadata?.duration}","${data.sources?.join(', ')}"\n`;
  });
});

const outputFile = path.join(logsDir, 'analytics-export.csv');
fs.writeFileSync(outputFile, csv);

console.log(`✅ Exported to: ${outputFile}`);
console.log('📊 Open in Excel/Google Sheets for analysis');