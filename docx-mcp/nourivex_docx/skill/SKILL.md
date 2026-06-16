---
name: nourivex-docx-server
description: "Use when creating or editing Word (.docx) documents — from scratch, from markdown, or from templates. Triggers: creating documents, converting markdown to docx, reviewing contracts, marking up reports, adding revision comments, validating document structure, removing watermarks, auditing OOXML integrity, bulk text replacement with revisions, footnote management, paragraph-level edits. Requires the nourivex-docx-server MCP server to be running."
---

# Creating and Editing Word Documents with nourivex-docx-server

## Overview

The `nourivex-docx-server` MCP server provides tools for creating, reading, and editing .docx files with proper OOXML markup. Create documents from scratch or from markdown. Edits appear as real revisions in Microsoft Word — red strikethrough for deletions, green underline for insertions, comments in the sidebar.

A .docx file is a ZIP archive of XML files. This server unpacks the archive, parses all XML parts with lxml, edits the cached DOM trees directly, and repacks modified XML back into a valid .docx archive. This gives full control over OOXML markup — essential for track changes, comments, and structural validation that higher-level libraries don't expose.

## When to Use

- Creating new .docx documents from scratch or from templates
- Converting markdown to .docx with full formatting (headings, tables, lists, images, footnotes, code blocks)
- Editing existing .docx files with tracked changes
- Adding comments or footnotes to documents
- Reviewing/auditing document structure
- Removing watermarks
- Bulk find-and-replace with revision marks
- Any task where changes must be visible as Word revisions

**Do NOT use for:** PDFs, spreadsheets, or `.doc` (legacy binary format — convert to .docx first).

## Workflows

### Creating Documents from Markdown

```
1. create_from_markdown(output_path, markdown="# Title\n\nContent with **bold**.")
2. audit_document()                          → verify integrity
3. save_document()                           → save to disk
```

Supports: headings, bold/italic/strikethrough, links, images, bullet/numbered/nested lists, code blocks, blockquotes, tables, footnotes, task lists. Smart typography (curly quotes, em/en dashes, ellipses) is applied automatically.

### Creating Blank Documents

```
1. create_document("/path/to/new.docx")      → blank document
2. create_document("/path/to/new.docx", template_path="/path/to/template.dotx")  → from template
```

### Editing Existing Documents

```
1. open_document("/path/to/file.docx")
2. get_headings() or get_document_info()     → understand structure
3. search_text("clause text")                → find target paragraphs
4. get_paragraph(para_id)                    → verify exact text before editing
5. delete_text(para_id, "old text")          → tracked deletion
6. insert_text(para_id, "new text")          → tracked insertion
7. add_comment(para_id, "Reason for change") → explain the edit
8. audit_document()                          → verify integrity
9. save_document("/path/to/output.docx")     → save (or omit path to overwrite)
```

**Always `audit_document()` before saving** to catch structural issues (orphaned footnotes, duplicate paraIds, unpaired bookmarks, missing relationship targets).

### Generating a Change Log from an Edited Document

After making tracked edits, export a human-readable summary:

```
1. open_document("/path/to/file.docx")
2. ... make edits with tracked=True (default) ...
3. save_document("/path/to/output.docx")
4. generate_change_summary("/path/to/output_changes.txt")
   → {"path": "..._changes.txt", "change_count": N}
```

The `.txt` lists each change as a numbered entry — INSERTION, DELETION, or REPLACEMENT — with author, date, and text. Paste it into an email, a PR description, or a client handover note.

Use `generate_change_summary` when you **have the open document** with tracked edits.  
Use `diff_to_text` when you **have two separate files** you want to compare.

### Comparing Two DOCX Files

When you have an original and a revised file (not the same editing session):

```
1. diff_to_text("original.docx", "revised.docx")
   → {"docx_path": "original_diff.docx", "text_path": "original_diff.txt", "change_count": N}
```

`diff_to_text` runs a paragraph-level diff, writes a tracked-change DOCX, and writes the same numbered plain-text summary as `generate_change_summary`. To get only the DOCX without the .txt, use `compare_documents` instead.

### Direct Edits Without Revision Markup

When you want to apply edits silently (no accept/reject required by the reviewer):

```
replace_text(para_id, find="DRAFT", replace="FINAL", tracked=False)
insert_text(para_id, " (Amended)", tracked=False)
modify_cell(0, 0, 0, "Updated value", tracked=False)
```

All five editing tools (`insert_text`, `delete_text`, `replace_text`, `modify_cell`, `edit_header_footer`) support `tracked=False`. The default is always `tracked=True`.

## Tool Quick Reference

### Document Lifecycle

| Tool | Purpose | Key args |
|------|---------|----------|
| `open_document` | Open .docx for editing | `path` |
| `create_document` | Create blank .docx or from template | `output_path`, `template_path` |
| `create_from_markdown` | Create .docx from markdown | `output_path`, `markdown` or `md_path`, `template_path` |
| `close_document` | Close and clean up | — |
| `get_document_info` | Stats overview | — |
| `save_document` | Save to .docx | `output_path` (optional) |

### Reading

| Tool | Purpose | Key args |
|------|---------|----------|
| `get_headings` | Heading tree with paraIds | — |
| `search_text` | Find text in body/footnotes/comments | `query`, `regex` |
| `get_paragraph` | Full text of one paragraph | `para_id` |

### Track Changes

All five editing tools default to `tracked=True`. Pass `tracked=False` to any of them when you want the edit applied directly with no revision markup (useful for programmatic transforms the reviewer doesn't need to accept).

| Tool | Purpose | Key args |
|------|---------|----------|
| `insert_text` | Tracked insertion (underlined in Word) | `para_id`, `text`, `position`, `tracked` |
| `delete_text` | Tracked deletion (red strikethrough) | `para_id`, `text`, `tracked` |
| `replace_text` | Tracked del+ins pair — preferred for one-step replacement | `para_id`, `find`, `replace`, `tracked` |
| `modify_cell` | Modify table cell text | `table_index`, `row`, `col`, `text`, `tracked` |
| `edit_header_footer` | Edit header/footer text | `location`, `old_text`, `new_text`, `tracked` |
| `set_formatting` | Bold/italic/underline/color with tracked markup | `para_id`, `text`, `bold`, `italic`, `underline`, `color` |
| `set_track_changes` | Toggle Word's track-changes recording flag | `enabled` |
| `get_tracked_changes` | List pending changes (author, date, type, text) | — |
| `accept_changes` | Accept tracked changes | `author` (optional) |
| `reject_changes` | Reject tracked changes | `author` (optional) |

### Change Log

| Tool | Purpose | Key args |
|------|---------|----------|
| `generate_change_summary` | Export tracked changes in the open doc as .txt | `output_path` (optional) |
| `compare_documents` | Diff two files → tracked-change DOCX | `base_path`, `revised_path`, `output_path` |
| `diff_to_text` | Diff two files → tracked-change DOCX + .txt | `base_path`, `revised_path`, `docx_output`, `text_output` |

### Tables

| Tool | Purpose | Key args |
|------|---------|----------|
| `get_tables` | List all tables with cell content | — |
| `add_table` | Insert table after paragraph | `para_id`, `rows`, `cols` |
| `modify_cell` | Modify cell text with tracked changes | `table_index`, `row`, `col`, `text` |
| `add_table_row` | Add row to table | `table_index`, `cells` (optional), `row_idx` (optional) |
| `delete_table_row` | Delete row with tracked changes | `table_index`, `row_index` |

### Lists

| Tool | Purpose | Key args |
|------|---------|----------|
| `add_list` | Apply bullet/numbered list formatting | `para_ids`, `style` |

### Comments

| Tool | Purpose | Key args |
|------|---------|----------|
| `get_comments` | List all comments | — |
| `add_comment` | Comment anchored to paragraph | `para_id`, `text` |
| `reply_to_comment` | Threaded reply | `parent_id`, `text` |

### Footnotes & Endnotes

| Tool | Purpose | Key args |
|------|---------|----------|
| `get_footnotes` | List all footnotes | — |
| `add_footnote` | Footnote with superscript ref | `para_id`, `text`, `url` (optional hotlink) |
| `add_footnote_ref` | Subsequent ref to existing footnote | `para_id`, `footnote_id` |
| `validate_footnotes` | Cross-ref footnote IDs | — |
| `get_endnotes` | List all endnotes | — |
| `add_endnote` | Endnote with superscript ref | `para_id`, `text` |
| `validate_endnotes` | Cross-ref endnote IDs | — |

### Headers, Footers & Styles

| Tool | Purpose | Key args |
|------|---------|----------|
| `get_headers_footers` | List all headers/footers with text | — |
| `edit_header_footer` | Edit header/footer text with tracked changes | `location`, `old_text`, `new_text` |
| `get_styles` | List all defined styles | — |

### Properties & Images

| Tool | Purpose | Key args |
|------|---------|----------|
| `get_properties` | Get core properties (title, creator, dates) | — |
| `set_properties` | Set core properties | `title`, `creator`, `subject`, `description` |
| `get_images` | List embedded images with dimensions | — |
| `insert_image` | Insert image after paragraph | `para_id`, `image_path` |

### Sections & Cross-References

| Tool | Purpose | Key args |
|------|---------|----------|
| `add_page_break` | Insert page break after paragraph | `para_id` |
| `add_section_break` | Add section break | `para_id`, `break_type` |
| `set_section_properties` | Set page size/orientation/margins | `width`, `height`, `orientation`, `para_id` (optional) |
| `add_cross_reference` | Internal hyperlink between paragraphs | `source_para_id`, `target_para_id`, `text` |

### Protection & Merge

| Tool | Purpose | Key args |
|------|---------|----------|
| `set_document_protection` | Set edit protection with optional password | `edit_type`, `password` (optional) |
| `merge_documents` | Merge content from another DOCX | `source_path` |

### Validation & Audit

| Tool | Purpose | Key args |
|------|---------|----------|
| `validate_paraids` | Check paraId uniqueness | — |
| `remove_watermark` | Remove DRAFT watermarks | — |
| `audit_document` | Full structural audit | — |

### PII Scrubbing ⚠️ Experimental

| Tool | Purpose | Key args |
|------|---------|----------|
| `scrub_pii` | Detect and permanently redact PII (EXPERIMENTAL — see warning) | `output_path`, `dry_run`, `entities`, `confidence_threshold` |
| `sanitize_metadata` | Strip author/session metadata from document properties | `output_path`, `level` |

**WARNING: `scrub_pii` is experimental and NOT suitable for production use.** It will miss PII. Never use it as the sole control for privileged, regulated, or legally sensitive documents.

Known NER gaps:
- Names in ALL-CAPS (ledger headers, table cells) — frequently missed
- Single-token names with no surrounding context — unreliable
- Non-English names (Arabic, CJK, African) — low recall on this English model
- Names in legal boilerplate patterns (`Lender: Jane Doe`) — often skipped

Pattern-based detectors (email, phone, SSN, credit card, IBAN) are reliable. The NER gaps apply only to PERSON and similar named-entity types.

Always run `dry_run=True` first and review every detected entity manually before committing a redacted file.

## Essential Patterns

### Replace Text

**Preferred — one-step:**

```
1. search_text("30 days")                              → find the paragraph
2. get_paragraph(para_id)                              → verify exact text
3. replace_text(para_id, find="30 days", replace="60 days")
```

`replace_text` produces the same del+ins pair as the two-step approach but as a single call. It only marks the actually-changed portion, leaving common leading/trailing text as plain runs.

**Two-step alternative** (use when you need to insert at a specific position relative to other content):

```
1. delete_text(para_id, "30 days")     → tracked deletion (red strikethrough)
2. insert_text(para_id, "60 days")     → tracked insertion (underlined)
```

Word shows both marks side by side: ~~30 days~~ **60 days**.

### Batch Edits Across Multiple Paragraphs

```
1. search_text("Net 30", regex=False)  → returns all matches with paraIds
2. For each match:
   a. get_paragraph(para_id)           → verify context
   b. delete_text(para_id, "Net 30")
   c. insert_text(para_id, "Net 60")
   d. add_comment(para_id, "Updated payment terms per Amendment 3")
3. audit_document()                    → verify no structural damage
```

### Add Explanatory Footnote

```
1. search_text("force majeure")        → find the clause
2. add_footnote(para_id, "Force majeure includes acts of God, war, pandemic, and other events beyond reasonable control.")
3. validate_footnotes()                → verify cross-references
```

### Full Document Review

```
1. open_document("/path/to/contract.docx")
2. get_document_info()                 → paragraph count, headings, footnotes
3. get_headings()                      → see structure at a glance
4. audit_document()                    → check for pre-existing issues
5. ... make edits ...
6. audit_document()                    → verify edits didn't break anything
7. save_document("/path/to/contract_reviewed.docx")
```

## Tips

- **paraId** is an 8-char hex string (e.g., `"1A2B3C4D"`). Get them from `get_headings()` or `search_text()`.
- **position** in `insert_text`: `"start"`, `"end"`, or a substring to insert after.
- **author** defaults to `"Claude"` for all tracked changes and comments.
- **Save to new file** to preserve the original: `save_document("/path/to/revised.docx")`.
- **Always verify before editing**: Use `get_paragraph()` to see the exact text before calling `delete_text()`. The text must match exactly within a single run.

## OOXML Pitfalls (Critical Knowledge)

These hard-won lessons prevent silent document corruption. Word may "repair" broken documents by silently rewriting your edits.

### ParaId Rules

Every `<w:p>` and `<w:tr>` element has a `w14:paraId` attribute.

| Rule | Detail |
|------|--------|
| Must be unique | Across ALL XML parts: document.xml, footnotes.xml, headers, footers, endnotes |
| Must be < 0x80000000 | Word reserves the high bit internally — values >= 0x80000000 cause validation failure |
| 8 hex digits | Always uppercase, zero-padded (e.g., `1A2B3C4D`) |
| Duplicates from copy-paste | Duplicating content creates duplicate paraIds — fix the second occurrence |

The `validate_paraids()` tool checks all of these. Run it after any structural edits.

### Footnote Rules

| Rule | Detail |
|------|--------|
| 1:1 mapping | Each footnote ID must be referenced **exactly once** in document.xml. Multiple references to the same ID corrupt footnotes 1 and 2 |
| IDs must be sequential | No gaps — Word may silently renumber on recovery |
| Reserved IDs | id="-1" (separator) and id="0" (continuation) are reserved — real footnotes start at id="1" |
| Each paragraph needs paraId | Every `<w:p>` inside a footnote needs its own unique paraId |

The `validate_footnotes()` tool checks reference/definition matching. Always run after adding footnotes.

**Word Recovery Warning:** When Word recovers/repairs a file, it renumbers ALL footnotes sequentially by document position, not by original ID. After any Word recovery, re-examine footnotes before further edits.

### Non-Breaking Spaces

Word uses non-breaking spaces (`\xa0`, U+00A0) and narrow no-break spaces (`\u202f`, U+202F) throughout. **Direct string matching fails silently.** The `search_text()` tool handles this internally, but if you're checking text returned by `get_paragraph()`, be aware that what looks like a space may be `\xa0`.

### Text Inside Hyperlinks

Text inside `w:hyperlink` elements may not appear in `paragraph.text` from some parsers. The docx-mcp tools handle this correctly, but be aware when working with documents containing many hyperlinks — the visible text in Word may differ from what a naive text extraction shows.

### Tracked Changes: Key Rules

| Rule | Detail |
|------|--------|
| Default is `tracked=True` | All five editing tools (`insert_text`, `delete_text`, `replace_text`, `modify_cell`, `edit_header_footer`) emit revision markup by default. Pass `tracked=False` for immediate, silent edits. |
| Use `w:delText` inside `w:del` | Never `w:t` — causes validation errors |
| Preserve `w:rPr` formatting | Copy the original run's formatting into tracked change runs |
| Minimal edits only | Mark only what changes — don't wrap entire paragraphs |
| Deleting entire paragraphs | Must also mark the paragraph mark as deleted via `<w:del/>` inside `<w:pPr><w:rPr>`, otherwise accepting changes leaves empty paragraphs |

### Smart Quotes

When adding text, use smart quotes for professional typography:

| Entity | Character |
|--------|-----------|
| `\u2018` | ' (left single) |
| `\u2019` | ' (right single / apostrophe) |
| `\u201C` | " (left double) |
| `\u201D` | " (right double) |
| `\u2013` | -- (en dash) |

The docx-mcp tools accept Unicode text directly — pass the actual characters, not XML entities.

### Element Order in `<w:pPr>`

The OOXML schema requires a specific element order: `<w:pStyle>`, `<w:numPr>`, `<w:spacing>`, `<w:ind>`, `<w:jc>`, `<w:rPr>` last. Out-of-order elements cause validation warnings and may trigger Word recovery.

### Heading Numbering

**NEVER embed literal section numbers in heading text** (e.g., "1.1 Background"). Heading numbers must come from Word's multilevel list numbering system. If you need to insert a heading via `insert_text()`, insert only the heading text — the numbering comes from the document's styles.

## Markdown-to-DOCX Conversion Pitfalls

When converting markdown content to DOCX edits via docx-mcp, watch for:

### Soft-Wrapped Lines

A long line in markdown may display across multiple lines in an editor. If you're extracting text from markdown to feed into `insert_text()` or `delete_text()`, ensure you're working with the logical line, not the display line. A `[bracketed construct]` that wraps across source lines must be treated as one unit.

### Fake Footnotes in Markdown

Markdown doesn't have real footnotes — `[^1]` syntax is a convention that some parsers support. When converting markdown with footnote-style references to DOCX:

1. Use `add_footnote()` to create real OOXML footnotes — don't insert `[1]` as plain text
2. Map each markdown `[^N]` reference to an `add_footnote()` call on the appropriate paragraph
3. Remove the footnote definition text from the body (it now lives in footnotes.xml)

### Superscript Numbers Concatenate

When extracting text from paragraphs that contain footnote references, the superscript reference numbers are invisible in the XML text but adjacent characters concatenate. Example: "File #8" followed by superscript footnote "73" extracts as "File #873". Account for this when using `search_text()` with regex patterns on footnoted text.

### Multi-Source Citations Are Comma-Delimited

Calling `add_footnote()` twice on the same paragraph produces comma-delimited superscripts (¹,²,³). `add_footnote()` automatically inserts a superscript comma run when the last run of the target paragraph is already a footnote reference — no extra steps needed.

### Clickable Superscript Cross-References

Every footnote reference superscript created by `add_footnote()` is wrapped in `<w:hyperlink w:anchor="_FnN">` pointing to a bookmark in the footnote definition. Clicking the superscript navigates to the footnote in Word and in PDF exports.

**Subsequent reference to the same footnote** — use `add_footnote_ref(para_id, footnote_id)`:

```
fn_id = add_footnote("00000004", "Source")["footnote_id"]
add_footnote_ref("00000009", fn_id)   # second citation → same footnote
```

Do NOT call `add_footnote()` twice with the same content — that duplicates the definition. `add_footnote_ref` retroactively adds the anchor bookmark if the footnote predates this feature.

### Hotlinked URLs in Footnotes

Pass `url="https://..."` to `add_footnote()` to render the URL as a clickable hyperlink inside the footnote body:

```
add_footnote(para_id, "SWGDE Best Practices for Mobile Device Evidence Collection", url="https://www.swgde.org/documents")
```

- The label text is added as a plain run; the URL is appended as a `<w:hyperlink>` with `Hyperlink` character style.
- A relationship entry (`TargetMode="External"`) is automatically registered in `word/_rels/footnotes.xml.rels`.
- Multiple footnotes with different URLs each get a distinct `rId`.
- If `url` is omitted the behavior is unchanged (backward-compatible).

## Audit Checklist

Before delivering any edited document, run through this checklist:

```
1. audit_document()              → comprehensive structural check
2. validate_footnotes()          → if any footnotes were added/modified
3. validate_paraids()            → if any structural changes were made
4. save_document("new.docx")     → save to new file (preserve original)
5. generate_change_summary()     → (optional) produce .txt change log for handover
```

The `audit_document()` tool checks all of the following in one call:
- XML well-formedness of all parts
- Footnote cross-references (references vs definitions, duplicates, gaps)
- ParaId uniqueness and range validity (< 0x80000000)
- Heading level continuity (no skips like H2 -> H4)
- Bookmark pairing (start/end matching)
- Relationship targets (all referenced files exist)
- Image references (all embedded images exist in word/media/)
- Content type registration (all media extensions have entries)
- Residual artifacts (DRAFT, TODO, FIXME, PLACEHOLDER, TBD markers)
