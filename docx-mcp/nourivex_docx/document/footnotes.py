"""Footnotes mixin: get, add, validate."""

from __future__ import annotations

import contextlib

from lxml import etree

from .base import W14, W, _preserve

_RELS_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
_HYPERLINK_REL_TYPE = (
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"
)
_R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


class FootnotesMixin:
    """Footnote operations."""

    def _next_global_markup_id(self) -> int:
        """Return max bookmark/markup w:id across all loaded parts + 1."""
        max_id = 0
        markup_tags = (
            f"{W}bookmarkStart",
            f"{W}bookmarkEnd",
            f"{W}ins",
            f"{W}del",
            f"{W}commentRangeStart",
            f"{W}commentRangeEnd",
        )
        for tree in self._trees.values():
            for tag in markup_tags:
                for el in tree.iter(tag):
                    eid = el.get(f"{W}id")
                    if eid:
                        with contextlib.suppress(ValueError):
                            max_id = max(max_id, int(eid))
        return max_id + 1

    def get_footnotes(self) -> list[dict]:
        fn_tree = self._tree("word/footnotes.xml")
        if fn_tree is None:
            return []
        result = []
        for fn in self._real_footnotes(fn_tree):
            result.append(
                {
                    "id": int(fn.get(f"{W}id", "0")),
                    "text": self._text(fn),
                }
            )
        return result

    def _get_or_create_footnotes_rels(self) -> etree._Element:
        """Return the root of word/_rels/footnotes.xml.rels, creating it if absent."""
        rels_path = "word/_rels/footnotes.xml.rels"
        root = self._tree(rels_path)
        if root is not None:
            return root
        root = etree.Element(
            f"{{{_RELS_NS}}}Relationships",
            nsmap={None: _RELS_NS},
        )
        self._trees[rels_path] = root
        fp = self.workdir / rels_path
        fp.parent.mkdir(parents=True, exist_ok=True)
        etree.ElementTree(root).write(
            str(fp), xml_declaration=True, encoding="UTF-8", standalone=True
        )
        return root

    def _add_external_hyperlink_rel(self, rels_path: str, url: str) -> str:
        """Add an External hyperlink relationship for url; return its rId."""
        if rels_path == "word/_rels/footnotes.xml.rels":
            root = self._get_or_create_footnotes_rels()
        else:
            root = self._tree(rels_path)
        max_rid = 0
        for rel in root.findall(f"{{{_RELS_NS}}}Relationship"):
            rid = rel.get("Id", "")
            if rid.startswith("rId"):
                with contextlib.suppress(ValueError):
                    max_rid = max(max_rid, int(rid[3:]))
        new_rid = f"rId{max_rid + 1}"
        rel_el = etree.SubElement(root, f"{{{_RELS_NS}}}Relationship")
        rel_el.set("Id", new_rid)
        rel_el.set("Type", _HYPERLINK_REL_TYPE)
        rel_el.set("Target", url)
        rel_el.set("TargetMode", "External")
        self._mark(rels_path)
        return new_rid

    def add_footnote(self, para_id: str, text: str, url: str = "") -> dict:
        """Add a footnote to a paragraph. Returns the new footnote ID."""
        doc = self._require("word/document.xml")
        fn_tree = self._require("word/footnotes.xml")
        para = self._find_para(doc, para_id)
        if para is None:
            raise ValueError(f"Paragraph '{para_id}' not found")

        # Next ID
        existing = {int(f.get(f"{W}id", "0")) for f in fn_tree.findall(f"{W}footnote")}
        next_id = max(existing | {0}) + 1
        anchor = f"_Fn{next_id}"

        # ── Build footnote definition in footnotes.xml ────────────────────────
        fn_el = etree.SubElement(fn_tree, f"{W}footnote")
        fn_el.set(f"{W}id", str(next_id))

        fn_para = etree.SubElement(fn_el, f"{W}p")
        fn_para.set(f"{W14}paraId", self._new_para_id())
        fn_para.set(f"{W14}textId", "77777777")

        # Bookmark so the body hyperlink can navigate here (also enables PDF export links)
        bm_id = self._next_global_markup_id()
        bm_start = etree.SubElement(fn_para, f"{W}bookmarkStart")
        bm_start.set(f"{W}id", str(bm_id))
        bm_start.set(f"{W}name", anchor)

        ppr = etree.SubElement(fn_para, f"{W}pPr")
        ps = etree.SubElement(ppr, f"{W}pStyle")
        ps.set(f"{W}val", "FootnoteText")

        # Footnote ref mark
        ref_run = etree.SubElement(fn_para, f"{W}r")
        ref_rpr = etree.SubElement(ref_run, f"{W}rPr")
        ref_style = etree.SubElement(ref_rpr, f"{W}rStyle")
        ref_style.set(f"{W}val", "FootnoteReference")
        etree.SubElement(ref_run, f"{W}footnoteRef")

        # Space
        sp_run = etree.SubElement(fn_para, f"{W}r")
        sp_t = etree.SubElement(sp_run, f"{W}t")
        _preserve(sp_t, " ")

        # Label text (if provided)
        if text:
            txt_run = etree.SubElement(fn_para, f"{W}r")
            txt_t = etree.SubElement(txt_run, f"{W}t")
            _preserve(txt_t, text + (" " if url else ""))

        # Hotlinked URL (if provided)
        if url:
            r_id = self._add_external_hyperlink_rel("word/_rels/footnotes.xml.rels", url)
            url_hl = etree.SubElement(fn_para, f"{W}hyperlink")
            url_hl.set(f"{{{_R_NS}}}id", r_id)
            url_run = etree.SubElement(url_hl, f"{W}r")
            url_rpr = etree.SubElement(url_run, f"{W}rPr")
            url_rs = etree.SubElement(url_rpr, f"{W}rStyle")
            url_rs.set(f"{W}val", "Hyperlink")
            url_t = etree.SubElement(url_run, f"{W}t")
            _preserve(url_t, url)

        bm_end = etree.SubElement(fn_para, f"{W}bookmarkEnd")
        bm_end.set(f"{W}id", str(bm_id))

        self._mark("word/footnotes.xml")

        # ── Add in-body reference ─────────────────────────────────────────────
        # Comma delimiter: if the last substantive child (run or hyperlink) already
        # contains a footnoteReference, insert a superscript comma first.
        self._insert_fn_ref(para, next_id, anchor)
        self._mark("word/document.xml")

        result: dict = {"footnote_id": next_id, "para_id": para_id}
        if url:
            result["url"] = url
        return result

    def _insert_fn_ref(self, para: etree._Element, footnote_id: int, anchor: str) -> None:
        """Append a hyperlink-wrapped footnoteReference run to para, with comma if needed."""
        last_elem = next(
            (c for c in reversed(list(para)) if c.tag in (f"{W}r", f"{W}hyperlink")),
            None,
        )
        needs_comma = last_elem is not None and bool(list(last_elem.iter(f"{W}footnoteReference")))
        if needs_comma:
            comma_r = etree.SubElement(para, f"{W}r")
            comma_rpr = etree.SubElement(comma_r, f"{W}rPr")
            comma_rs = etree.SubElement(comma_rpr, f"{W}rStyle")
            comma_rs.set(f"{W}val", "FootnoteReference")
            comma_t = etree.SubElement(comma_r, f"{W}t")
            comma_t.text = ","

        hl = etree.SubElement(para, f"{W}hyperlink")
        hl.set(f"{W}anchor", anchor)
        r = etree.SubElement(hl, f"{W}r")
        rpr = etree.SubElement(r, f"{W}rPr")
        rs = etree.SubElement(rpr, f"{W}rStyle")
        rs.set(f"{W}val", "FootnoteReference")
        fref = etree.SubElement(r, f"{W}footnoteReference")
        fref.set(f"{W}id", str(footnote_id))

    def add_footnote_ref(self, para_id: str, footnote_id: int) -> dict:
        """Add a subsequent reference to an existing footnote without creating a new definition.

        Inserts a hyperlink anchored to the footnote's bookmark (_FnN), wrapping a
        footnoteReference run. Use this when the same source needs to be cited again
        in a different paragraph — no new footnote definition is created.
        """
        doc = self._require("word/document.xml")
        fn_tree = self._require("word/footnotes.xml")

        existing_ids = {int(f.get(f"{W}id", "0")) for f in self._real_footnotes(fn_tree)}
        if footnote_id not in existing_ids:
            raise ValueError(f"Footnote id {footnote_id} not found")

        para = self._find_para(doc, para_id)
        if para is None:
            raise ValueError(f"Paragraph '{para_id}' not found")

        anchor = f"_Fn{footnote_id}"

        # Ensure the target footnote has a bookmark (retroactively add if missing)
        target_fn = next(
            fn for fn in fn_tree.findall(f"{W}footnote") if fn.get(f"{W}id") == str(footnote_id)
        )
        has_bookmark = any(
            el.get(f"{W}name") == anchor for el in target_fn.iter(f"{W}bookmarkStart")
        )
        if not has_bookmark:
            fn_para = target_fn.find(f"{W}p")
            if fn_para is not None:
                bm_id = self._next_global_markup_id()
                bm_start = etree.Element(f"{W}bookmarkStart")
                bm_start.set(f"{W}id", str(bm_id))
                bm_start.set(f"{W}name", anchor)
                fn_para.insert(0, bm_start)
                bm_end = etree.SubElement(fn_para, f"{W}bookmarkEnd")
                bm_end.set(f"{W}id", str(bm_id))
                self._mark("word/footnotes.xml")

        self._insert_fn_ref(para, footnote_id, anchor)
        self._mark("word/document.xml")
        return {"footnote_id": footnote_id, "para_id": para_id}

    def update_footnote(self, footnote_id: int, text: str) -> dict:
        """Update the text of an existing footnote.

        Replaces the content of the first non-reference text run in the footnote.
        Built-in footnotes (id < 1) are rejected.
        """
        if footnote_id < 1:
            raise ValueError(f"Footnote id {footnote_id} not found")
        fn_tree = self._require("word/footnotes.xml")
        # Find the target footnote element
        target = None
        for fn in fn_tree.findall(f"{W}footnote"):
            if fn.get(f"{W}id") == str(footnote_id):
                target = fn
                break
        if target is None:
            raise ValueError(f"Footnote id {footnote_id} not found")
        # Find all w:r elements inside the footnote paragraphs
        # Skip the reference run (has w:rStyle[@w:val="FootnoteReference"])
        # Update (or create) the first text run after the reference run
        for para in target.findall(f"{W}p"):
            text_run = None
            for run in para.findall(f"{W}r"):
                rpr = run.find(f"{W}rPr")
                is_ref = False
                if rpr is not None:
                    rs = rpr.find(f"{W}rStyle")
                    if rs is not None and rs.get(f"{W}val") == "FootnoteReference":
                        is_ref = True
                if is_ref:
                    continue
                # First non-ref run with real content (skip whitespace separators)
                t_el = run.find(f"{W}t")
                if t_el is not None and t_el.text and t_el.text.strip():
                    text_run = run
                    break
            if text_run is not None:
                t_el = text_run.find(f"{W}t")
                _preserve(t_el, text)
                self._mark("word/footnotes.xml")
                return {"footnote_id": footnote_id, "text": text}
            # No text run found — add one to this para
            new_run = etree.SubElement(para, f"{W}r")
            new_t = etree.SubElement(new_run, f"{W}t")
            _preserve(new_t, text)
            self._mark("word/footnotes.xml")
            return {"footnote_id": footnote_id, "text": text}
        # Footnote has no paragraphs — add one
        para = etree.SubElement(target, f"{W}p")
        new_run = etree.SubElement(para, f"{W}r")
        new_t = etree.SubElement(new_run, f"{W}t")
        _preserve(new_t, text)
        self._mark("word/footnotes.xml")
        return {"footnote_id": footnote_id, "text": text}

    def delete_footnote(self, footnote_id: int) -> dict:
        """Delete a footnote definition and its in-body reference run.

        Removes w:footnote from word/footnotes.xml and removes the w:r
        containing w:footnoteReference[@w:id="{footnote_id}"] from document.xml.
        """
        if footnote_id < 1:
            raise ValueError(f"Footnote id {footnote_id} not found")
        fn_tree = self._require("word/footnotes.xml")
        target = None
        for fn in fn_tree.findall(f"{W}footnote"):
            if fn.get(f"{W}id") == str(footnote_id):
                target = fn
                break
        if target is None:
            raise ValueError(f"Footnote id {footnote_id} not found")
        fn_tree.remove(target)
        self._mark("word/footnotes.xml")
        # Remove in-body reference: the run may be wrapped in a <w:hyperlink> container
        doc = self._tree("word/document.xml")
        if doc is not None:
            for ref_el in doc.iter(f"{W}footnoteReference"):
                if ref_el.get(f"{W}id") == str(footnote_id):
                    ref_run = ref_el.getparent()
                    if ref_run is not None:
                        container = ref_run.getparent()
                        if container is not None:
                            if container.tag == f"{W}hyperlink":
                                # Remove the entire hyperlink wrapper from its parent
                                grandparent = container.getparent()
                                if grandparent is not None:
                                    grandparent.remove(container)
                            else:
                                container.remove(ref_run)
                    self._mark("word/document.xml")
                    break
        return {"deleted": footnote_id}

    def validate_footnotes(self) -> dict:
        """Cross-reference footnote IDs between document.xml and footnotes.xml."""
        doc = self._tree("word/document.xml")
        fn_tree = self._tree("word/footnotes.xml")
        if doc is None:
            return {"error": "No document open"}
        if fn_tree is None:
            return {"valid": True, "references": 0, "definitions": 0}

        ref_ids = set()
        for ref in doc.iter(f"{W}footnoteReference"):
            fid = ref.get(f"{W}id")
            if fid:
                ref_ids.add(int(fid))

        def_ids = {int(f.get(f"{W}id", "0")) for f in self._real_footnotes(fn_tree)}

        missing = sorted(ref_ids - def_ids)
        orphans = sorted(def_ids - ref_ids)
        return {
            "valid": not missing and not orphans,
            "references": len(ref_ids),
            "definitions": len(def_ids),
            "missing_definitions": missing,
            "orphan_definitions": orphans,
        }
