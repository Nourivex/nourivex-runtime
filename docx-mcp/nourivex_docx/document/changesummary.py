"""Change summary mixin: scan w:ins/w:del and write an email-ready .txt."""

from __future__ import annotations

from pathlib import Path

from lxml import etree

from .base import W


def _del_text(el: etree._Element) -> str:
    return "".join(t.text or "" for t in el.iter(f"{W}delText"))


def _ins_text(el: etree._Element) -> str:
    return "".join(t.text or "" for t in el.iter(f"{W}t"))


def _author(el: etree._Element) -> str:
    return el.get(f"{W}author", "Unknown")


def _date(el: etree._Element) -> str:
    return el.get(f"{W}date", "")


def _collect_changes(doc: etree._Element) -> list[dict]:
    """Walk the document tree and collect insertion/deletion/replacement events."""
    changes: list[dict] = []
    children = list(doc.iter())

    i = 0
    while i < len(children):
        el = children[i]
        if el.tag == f"{W}del":
            # Peek forward: if the very next sibling element in the same parent is w:ins,
            # treat del+ins as a replacement.
            parent = el.getparent()
            if parent is not None:
                siblings = list(parent)
                idx = siblings.index(el)
                if idx + 1 < len(siblings) and siblings[idx + 1].tag == f"{W}ins":
                    ins_el = siblings[idx + 1]
                    changes.append(
                        {
                            "type": "replacement",
                            "old": _del_text(el),
                            "new": _ins_text(ins_el),
                            "author": _author(el),
                            "date": _date(el),
                        }
                    )
                    i += 1  # skip the paired w:ins on next iteration
                else:
                    changes.append(
                        {
                            "type": "deletion",
                            "text": _del_text(el),
                            "author": _author(el),
                            "date": _date(el),
                        }
                    )
        elif el.tag == f"{W}ins":
            # Only record standalone insertions; paired ones are consumed above.
            parent = el.getparent()
            if parent is not None:
                siblings = list(parent)
                idx = siblings.index(el)
                if idx > 0 and siblings[idx - 1].tag == f"{W}del":
                    pass  # already recorded as replacement
                else:
                    changes.append(
                        {
                            "type": "insertion",
                            "text": _ins_text(el),
                            "author": _author(el),
                            "date": _date(el),
                        }
                    )
        i += 1

    return changes


def _render_summary(changes: list[dict]) -> str:
    lines = ["Document Change Summary", "=" * 40, ""]
    if not changes:
        lines.append("No tracked changes found.")
        return "\n".join(lines)

    for n, ch in enumerate(changes, 1):
        kind = ch["type"].upper()
        author = ch["author"]
        date = ch["date"]
        header = f"{n}. {kind}  (author: {author}, date: {date})"
        lines.append(header)
        if kind == "REPLACEMENT":
            lines.append(f'   Old: "{ch["old"]}"')
            lines.append(f'   New: "{ch["new"]}"')
        elif kind == "INSERTION":
            lines.append(f'   Added: "{ch["text"]}"')
        elif kind == "DELETION":
            lines.append(f'   Removed: "{ch["text"]}"')
        lines.append("")

    return "\n".join(lines)


class ChangeSummaryMixin:
    """Summarise tracked changes in the open document as a plain-text file."""

    def generate_change_summary(self, output_path: str = "") -> dict:
        """Scan w:ins/w:del in the open document and write an email-ready .txt.

        Adjacent w:del + w:ins siblings in the same parent are reported as a
        single REPLACEMENT rather than a separate deletion and insertion.

        Args:
            output_path: Destination .txt path. Auto-generated from the source
                         document stem (``<stem>_changes.txt``) when empty.

        Returns:
            ``{"path": str, "change_count": int}``
        """
        if not output_path:
            output_path = str(self.source_path.with_name(self.source_path.stem + "_changes.txt"))

        doc = self._require("word/document.xml")
        changes = _collect_changes(doc)
        summary = _render_summary(changes)
        Path(output_path).write_text(summary, encoding="utf-8")
        return {"path": output_path, "change_count": len(changes)}
