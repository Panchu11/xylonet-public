const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { marked } = require('marked');
const { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType } = require('docx');

const rootDir = path.join(__dirname, '..');
const markdownPath = path.join(rootDir, 'WHITEPAPER.md');
const docxPath = path.join(rootDir, 'WHITEPAPER.docx');
const pdfPath = path.join(rootDir, 'WHITEPAPER.pdf');

if (!fs.existsSync(markdownPath)) {
  console.error('WHITEPAPER.md not found at', markdownPath);
  process.exit(1);
}

const markdown = fs.readFileSync(markdownPath, 'utf8');

// ========== DOCX Generation (Professional Structured) ==========
async function generateDocx() {
  const lines = markdown.split(/\r?\n/);
  const children = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      children.push(new Paragraph({ text: '' }));
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: line.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    }
    // H2
    else if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: line.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    }
    // H3
    else if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: line.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    }
    // Bold (simple **text**)
    else if (trimmed.includes('**')) {
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const runs = parts.map((part) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return new TextRun({ text: part.slice(2, -2), bold: true });
        }
        return new TextRun({ text: part });
      });
      children.push(new Paragraph({ children: runs }));
    }
    // Bullet list
    else if (line.startsWith('- ')) {
      children.push(
        new Paragraph({
          text: line.slice(2),
          bullet: { level: 0 },
        })
      );
    }
    // Regular paragraph
    else {
      children.push(new Paragraph({ text: line }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log('✅ Written DOCX to', docxPath);
}

// ========== PDF Generation (Clean, Professional Whitepaper) ==========
async function generatePdf() {
  // Convert markdown to HTML using marked
  const bodyHtml = marked(markdown);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>XyloNet Technical Whitepaper</title>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: #ffffff;
  color: #1f2937;
  font-size: 11pt;
  line-height: 1.6;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 20mm 25mm;
  background: #ffffff;
  position: relative;
}

/* Header with gradient overlay (no boxes) */
.header {
  position: relative;
  text-align: center;
  padding: 30px 0 40px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.06) 100%);
  border-radius: 8px;
}

.header h1 {
  font-size: 28pt;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1f2937 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header .subtitle {
  font-size: 11pt;
  color: #6b7280;
  font-weight: 400;
}

.header .date {
  font-size: 9pt;
  color: #9ca3af;
  margin-top: 6px;
}

/* Body content */
.content {
  max-width: 170mm;
  margin: 0 auto;
}

.content h1 {
  font-size: 20pt;
  font-weight: 700;
  color: #111827;
  margin-top: 24px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 6px;
  page-break-after: avoid;
}

.content h2 {
  font-size: 16pt;
  font-weight: 700;
  color: #1f2937;
  margin-top: 20px;
  margin-bottom: 10px;
  page-break-after: avoid;
}

.content h3 {
  font-size: 13pt;
  font-weight: 700;
  color: #374151;
  margin-top: 16px;
  margin-bottom: 8px;
  page-break-after: avoid;
}

.content h4 {
  font-size: 12pt;
  font-weight: 600;
  color: #4b5563;
  margin-top: 14px;
  margin-bottom: 6px;
  page-break-after: avoid;
}

.content p {
  margin-bottom: 10px;
  color: #374151;
  text-align: justify;
  page-break-inside: avoid;
}

.content ul, .content ol {
  margin: 8px 0 12px 20px;
  padding-left: 0;
}

.content li {
  margin-bottom: 6px;
  color: #4b5563;
  page-break-inside: avoid;
}

.content code {
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  background: #f3f4f6;
  color: #1f2937;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 10pt;
  border: 1px solid #e5e7eb;
}

.content pre {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
  margin: 12px 0;
  page-break-inside: avoid;
}

.content pre code {
  background: none;
  border: none;
  padding: 0;
}

.content strong {
  font-weight: 700;
  color: #111827;
}

.content em {
  font-style: italic;
  color: #4b5563;
}

.content a {
  color: #4f46e5;
  text-decoration: underline;
}

.content blockquote {
  border-left: 3px solid #e5e7eb;
  padding-left: 16px;
  margin: 12px 0;
  color: #6b7280;
  font-style: italic;
}

.content table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  page-break-inside: avoid;
}

.content table th,
.content table td {
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  text-align: left;
}

.content table th {
  background: #f9fafb;
  font-weight: 600;
  color: #111827;
}

.content table td {
  color: #374151;
}

/* Footer */
.footer {
  margin-top: 40px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  font-size: 9pt;
  color: #9ca3af;
}

/* Page break control */
@media print {
  .page {
    margin: 0;
    page-break-after: always;
  }
}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>XyloNet Technical Whitepaper</h1>
    <p class="subtitle">Stablecoin-Native DeFi & Social Payments on Arc Network</p>
    <p class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="content">
${bodyHtml}
  </div>

  <div class="footer">
    <p>Built by ForgeLabs | Arc Testnet | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</div>
</body>
</html>`;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 500));
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();

  console.log('✅ Written PDF to', pdfPath);
}

// ========== Main Execution ==========
(async () => {
  try {
    console.log('\n📄 Generating XyloNet Whitepaper...\n');
    await generatePdf();
    try {
      await generateDocx();
    } catch (err) {
      if (err && err.code === 'EBUSY') {
        console.error('⚠️  WHITEPAPER.docx is open in another program; skipped regenerating DOCX.');
      } else {
        throw err;
      }
    }
    console.log('\n✅ Whitepaper exports generated successfully.\n');
  } catch (err) {
    console.error('❌ Failed to generate exports:', err);
    process.exit(1);
  }
})();
