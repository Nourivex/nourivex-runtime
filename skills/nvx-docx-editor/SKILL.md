---
name: nvx-docx-editor
description: "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation."
metadata:
  version: 1.0.0
  author: Nourivex
  parent: nourivex-runtime
  opencode: true
---

# NVX DOCX Editor - Professional Document Creation & Editing

## Overview

A .docx file is a ZIP archive containing XML files. This skill enables creating professional Indonesian academic reports, business documents, and formatted Word files using docx-js.

---

## Quick Reference

| Task | Approach |
|------|----------|
| Read/analyze content | `extract-text`, or unpack for raw XML |
| Create new document | Use `docx-js` - see Creating New Documents below |
| Edit existing document | Unpack → edit XML → repack - see Editing Existing Documents below |

---

## Creating New Documents (docx-js)

Generate .docx files with JavaScript, then validate. Install: `npm install -g docx`

### Setup & Constants

```javascript
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, Footer, AlignmentType, LevelFormat, SectionType,
  HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber,
  PageBreak, NumberFormat, TabStopType, TabStopPosition,
} = require('docx');
const fs = require('fs');

// A4 in DXA: 1 cm = 567.17 DXA
const A4_W = 11906, A4_H = 16838;
const ML = 2268, MR = 1701, MT = 2268, MB = 1701; // margins in DXA

// Content width = A4_W - ML - MR = 7937 DXA
const CW = 7937;

// Fonts
const TNR = 'Times New Roman';
const COURIER = 'Courier New';

// Spacing: double = 480 twips (lineRule "auto")
const DBL = { line: 480, lineRule: 'auto', before: 0, after: 0 };
const SGL = { line: 240, lineRule: 'auto', before: 0, after: 0 };
```

### Helper Functions (Indonesian Academic Standard)

```javascript
// TextRun helper with Times New Roman 12pt
function tnr(text, opts = {}) {
  return new TextRun({
    text,
    font: TNR,
    size: 24, // 12pt
    bold: opts.bold || false,
    italics: opts.italic || false,
    ...opts,
  });
}

// Paragraph helper with justified alignment & double spacing
function para(children, opts = {}) {
  return new Paragraph({
    spacing: DBL,
    alignment: opts.align || AlignmentType.JUSTIFIED,
    ...opts,
    children: Array.isArray(children) ? children : [children],
  });
}

// BAB headings: centered, bold, with pageBreak before
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: DBL,
    children: [tnr(text, { bold: true })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
    spacing: DBL,
    children: [tnr(text, { bold: true })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    alignment: AlignmentType.LEFT,
    spacing: DBL,
    children: [tnr(text, { bold: true })],
  });
}

function heading4(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_4,
    alignment: AlignmentType.LEFT,
    spacing: DBL,
    children: [tnr(text, { bold: true })],
  });
}

// Bullet with numbering config (NEVER use unicode bullets)
function bullet(children) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: DBL,
    alignment: AlignmentType.JUSTIFIED,
    children: Array.isArray(children) ? children : [children],
  });
}

function empty() {
  return new Paragraph({ spacing: DBL, children: [tnr('')] });
}

function pageBreakPara() {
  return new Paragraph({
    spacing: SGL,
    children: [new PageBreak()],
  });
}

// Code paragraph (Courier New 10pt, single spacing)
function codeLine(text) {
  return new Paragraph({
    spacing: SGL,
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text, font: COURIER, size: 20 })],
  });
}
```

### Table Builder

```javascript
const bdr = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
const headerShading = { fill: 'D9D9D9', type: ShadingType.CLEAR };

function makeTableRow(cells, isHeader = false) {
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map(({ text, width }) =>
      new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: isHeader ? headerShading : undefined,
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({
          spacing: SGL,
          alignment: AlignmentType.CENTER,
          children: [tnr(text, { bold: isHeader })],
        })],
      })
    ),
  });
}

// Usage:
// new Table({
//   width: { size: CW, type: WidthType.DXA },
//   columnWidths: [2400, 5537],
//   rows: [
//     makeTableRow([{ text: 'Header 1', width: 2400 }, { text: 'Header 2', width: 5537 }], true),
//     makeTableRow([{ text: 'Data 1', width: 2400 }, { text: 'Data 2', width: 5537 }]),
//   ],
// })
```

### Image Helper

```javascript
// Fit image to content width, preserving aspect ratio
function fitImage(origW, origH, maxWidthDxa) {
  const maxEmu = (maxWidthDxa / 1440) * 914400;
  const ratio = origH / origW;
  const cx = maxEmu;
  const cy = Math.round(maxEmu * ratio);
  return { cx, cy };
}

// Image with centered caption
function imageBlock(imgData, imgType, captionText, widthEmu, heightEmu) {
  return [
    new Paragraph({
      spacing: SGL,
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          data: imgData,
          transformation: { width: Math.round(widthEmu / 9144), height: Math.round(heightEmu / 9144) },
          type: imgType,
        }),
      ],
    }),
    new Paragraph({
      spacing: DBL,
      alignment: AlignmentType.CENTER,
      children: [tnr(captionText)],
    }),
  ];
}
```

### Daftar Isi (Table of Contents) with Tab Stops

```javascript
function daftarIsi(items) {
  // items = [['Title', 'pageNumber'], ...]
  const rows = items.map(([title, page]) =>
    new Paragraph({
      spacing: DBL,
      tabStops: [{ type: TabStopType.RIGHT, position: CW, leader: TabStopType.DOT }],
      children: [
        tnr(title),
        new TextRun({ text: '\t', font: TNR, size: 24 }),
        tnr(page),
      ],
    })
  );

  return [
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr('DAFTAR ISI', { bold: true })] }),
    empty(),
    ...rows,
  ];
}
```

### Document Structure (Indonesian Academic Report)

```javascript
function createDocument(frontMatter, chapters, numbering) {
  return new Document({
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
      ],
    },
    styles: {
      default: { document: { run: { font: TNR, size: 24 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: TNR },
          paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 28, bold: true, font: TNR },
          paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: TNR },
          paragraph: { spacing: { before: 120, after: 120 }, outlineLevel: 2 } },
      ],
    },
    sections: [
      // Front matter (cover, approval, etc.) - no page numbers
      {
        properties: {
          page: {
            size: { width: A4_W, height: A4_H },
            margin: { top: MT, right: MR, bottom: MB, left: ML },
          },
        },
        children: frontMatter,
      },
      // Main content with page numbers
      ...chapters.map(chapter => ({
        properties: {
          page: {
            size: { width: A4_W, height: A4_H },
            margin: { top: MT, right: MR, bottom: MB, left: ML },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              spacing: SGL,
              alignment: AlignmentType.CENTER,
              children: [tnr('Laporan PKL', { size: 20, italics: true })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              spacing: SGL,
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ children: [PageNumber.CURRENT], font: TNR, size: 20 }),
              ],
            })],
          }),
        },
        children: chapter,
      })),
    ],
  });
}

// Generate the file
async function generateDocx(filename, frontMatter, chapters) {
  const doc = createDocument(frontMatter, chapters);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filename, buffer);
  console.log(`Generated: ${filename}`);
}
```

---

## Front Matter Templates (Indonesian Academic Standard)

### Cover Page (Halaman Sampul)

```javascript
function coverPage(title, subtitle, programStudi, fakultas, universitas, tahun) {
  return [
    empty(), empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr(title, { bold: true })] }),
    empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr(subtitle, { bold: true })] }),
    empty(), empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr('Laporan ini disusun sebagai salah satu syarat untuk memenuhi tugas')] }),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr('Praktik Kerja Lapangan (PKL)')] }),
    empty(), empty(), empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr('[LOGO UNIVERSITAS]', { bold: true })] }),
    empty(), empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr(programStudi, { bold: true })] }),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr(fakultas, { bold: true })] }),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr(universitas, { bold: true })] }),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr(tahun, { bold: true })] }),
  ];
}
```

### Lembar Persetujuan (Approval Page)

```javascript
function lembarPersetujuan(judul, nama, nim, programStudi, kota, tahun) {
  return [
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr('LEMBAR PERSETUJUAN PEMBIMBING', { bold: true })] }),
    empty(),
    para([tnr('Laporan Praktik Kerja Lapangan dengan judul ')]),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr(`"${judul}"`, { bold: true })] }),
    empty(),
    para([tnr('Disusun oleh:')]),
    para([tnr(`Nama\t\t: ${nama}`)]),
    para([tnr(`NIM\t\t: ${nim}`)]),
    para([tnr(`Program Studi\t: ${programStudi}`)]),
    empty(),
    para([tnr('Telah disetujui dan dinyatakan layak untuk diujikan.')]),
    empty(), empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.RIGHT, children: [tnr(`${kota}, __________ ${tahun}`)] }),
    empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.RIGHT, children: [tnr('Pembimbing,')] }),
    empty(), empty(), empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.RIGHT, children: [tnr('[NAMA PEMBIMBING]', { bold: true })] }),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.RIGHT, children: [tnr('NIP/NIDN: ___________')] }),
  ];
}
```

### Kata Pengantar (Foreword)

```javascript
function kataPengantar(paragraphs, acknowledgments, kota, tahun, penulis) {
  return [
    new Paragraph({ spacing: DBL, alignment: AlignmentType.CENTER, children: [tnr('KATA PENGANTAR', { bold: true })] }),
    empty(),
    ...paragraphs.map(p => para([tnr(p)])),
    ...acknowledgments.map(a => bullet([tnr(a)])),
    empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.RIGHT, children: [tnr(`${kota}, __________ ${tahun}`)] }),
    empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.RIGHT, children: [tnr('Penulis,')] }),
    empty(), empty(), empty(),
    new Paragraph({ spacing: DBL, alignment: AlignmentType.RIGHT, children: [tnr(penulis)] }),
  ];
}
```

---

## Editing Existing Documents

### Step 1: Unpack

```bash
python scripts/office/unpack.py document.docx unpacked/
```

### Step 2: Edit XML

Edit files in `unpacked/word/`. Use "Claude" as author for tracked changes.

**Smart quotes for new content:**
| Entity | Character |
|--------|-----------|
| `&#x2018;` | ' (left single) |
| `&#x2019;` | ' (right single / apostrophe) |
| `&#x201C;` | " (left double) |
| `&#x201D;` | " (right double) |

### Step 3: Pack

```bash
python scripts/office/pack.py unpacked/ output.docx --original document.docx
```

---

## XML Reference

### Tracked Changes

**Insertion:**
```xml
<w:ins w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:t>inserted text</w:t></w:r>
</w:ins>
```

**Deletion:**
```xml
<w:del w:id="2" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>deleted text</w:delText></w:r>
</w:del>
```

### Images

1. Add image file to `word/media/`
2. Add relationship to `word/_rels/document.xml.rels`
3. Add content type to `[Content_Types].xml`
4. Reference in document.xml

---

## Critical Rules

| Rule | Reason |
|------|--------|
| Always set page size explicitly | docx-js defaults to A4 |
| Never use `\n` | Use separate Paragraph elements |
| Never use unicode bullets | Use `LevelFormat.BULLET` with numbering config |
| PageBreak must be in Paragraph | Standalone creates invalid XML |
| ImageRun requires `type` | Always specify png/jpg/etc |
| Always set table `width` with DXA | Never use `WidthType.PERCENTAGE` |
| Tables need dual widths | `columnWidths` array AND cell `width` |
| Use `ShadingType.CLEAR` | Never SOLID for table shading |
| Use smart quotes | `&#x2019;` for apostrophes, `&#x201C;`/`&#x201D;` for quotes |

---

## Dependencies

- **docx**: `npm install -g docx` (new documents)
- **pandoc**: Text extraction
- **LibreOffice**: PDF conversion
- **Poppler**: `pdftoppm` for images

---

## Integration with Nourivex Workflow

When creating documents as part of a larger engineering task:

```typescript
// Load this skill when document generation is needed
task(category="deep", load_skills=["nvx-docx-editor", "nvx-goal-preservation"], 
  run_in_background=false,
  prompt="Create a professional PKL report following Indonesian academic standards. Include: cover page, approval page, foreword, table of contents, and 6 chapters. Use the nvx-docx-editor skill patterns.")
```
