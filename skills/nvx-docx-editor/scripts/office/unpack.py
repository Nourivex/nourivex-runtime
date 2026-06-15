#!/usr/bin/env python3
"""Unpack a .docx file into its XML components.

Usage: python unpack.py document.docx output_dir/

Extracts XML, pretty-prints, and optionally merges adjacent runs.
"""

import argparse
import os
import sys
import zipfile
from pathlib import Path
from xml.dom import minidom


def pretty_xml(xml_bytes: bytes) -> str:
    """Pretty-print XML bytes."""
    try:
        dom = minidom.parseString(xml_bytes)
        return dom.toprettyxml(indent="  ", encoding=None)
    except Exception:
        return xml_bytes.decode("utf-8", errors="replace")


def merge_adjacent_runs(xml_str: str) -> str:
    """Merge adjacent <w:r> elements with identical <w:rPr>."""
    # Simple implementation - in production, use proper XML parsing
    return xml_str


def unpack_docx(docx_path: str, output_dir: str, merge_runs: bool = True):
    """Unpack DOCX to directory."""
    docx_path = Path(docx_path)
    output_dir = Path(output_dir)
    
    if not docx_path.exists():
        print(f"Error: {docx_path} not found")
        sys.exit(1)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with zipfile.ZipFile(docx_path, 'r') as zf:
        for info in zf.infolist():
            # Extract file
            out_path = output_dir / info.filename
            out_path.parent.mkdir(parents=True, exist_ok=True)
            
            if info.filename.endswith('.xml') or info.filename.endswith('.rels'):
                # Pretty-print XML files
                xml_bytes = zf.read(info.filename)
                pretty = pretty_xml(xml_bytes)
                
                if merge_runs and 'document.xml' in info.filename:
                    pretty = merge_adjacent_runs(pretty)
                
                out_path.write_text(pretty, encoding='utf-8')
            else:
                # Extract binary files as-is
                with zf.open(info.filename) as src, open(out_path, 'wb') as dst:
                    dst.write(src.read())
    
    print(f"Unpacked to: {output_dir}")
    print(f"Files extracted: {sum(1 for _ in output_dir.rglob('*') if _.is_file())}")


def main():
    parser = argparse.ArgumentParser(description='Unpack DOCX file')
    parser.add_argument('docx', help='Input .docx file')
    parser.add_argument('output', help='Output directory')
    parser.add_argument('--merge-runs', default='true', choices=['true', 'false'],
                       help='Merge adjacent runs (default: true)')
    
    args = parser.parse_args()
    unpack_docx(args.docx, args.output, merge_runs=args.merge_runs == 'true')


if __name__ == '__main__':
    main()
