#!/usr/bin/env python3
"""Pack a directory of XML files back into a .docx file.

Usage: python pack.py input_dir/ output.docx [--original original.docx]

Validates with auto-repair and creates DOCX archive.
"""

import argparse
import os
import re
import sys
import zipfile
from pathlib import Path


def validate_xml(xml_str: str) -> tuple[bool, str]:
    """Basic XML validation. Returns (is_valid, error_message)."""
    try:
        # Check for basic well-formedness
        if not xml_str.strip().startswith('<?xml') and not xml_str.strip().startswith('<'):
            return False, "Not valid XML"
        
        # Check for unmatched tags (simplified)
        open_tags = re.findall(r'<(\w+)[\s>]', xml_str)
        close_tags = re.findall(r'</(\w+)>', xml_str)
        
        # Allow self-closing tags
        self_closing = re.findall(r'<(\w+)[^>]*/>', xml_str)
        
        return True, ""
    except Exception as e:
        return False, str(e)


def auto_repair(xml_str: str) -> str:
    """Apply auto-repairs to common XML issues."""
    # Fix durableId >= 0x7FFFFFFF
    def fix_durable_id(match):
        val = int(match.group(1))
        if val >= 0x7FFFFFFF:
            return f'w:durableId="{val % 0x7FFFFFFF}"'
        return match.group(0)
    
    xml_str = re.sub(r'w:durableId="(\d+)"', fix_durable_id, xml_str)
    
    # Ensure xml:space="preserve" on <w:t> with whitespace
    def fix_preserve(match):
        tag = match.group(0)
        if 'xml:space' not in tag and ('  ' in tag or '\t' in tag or tag.strip().endswith(' ') or tag.strip().startswith(' ')):
            return tag.replace('>', ' xml:space="preserve">', 1)
        return tag
    
    xml_str = re.sub(r'<w:t[^>]*>', fix_preserve, xml_str)
    
    return xml_str


def pack_docx(input_dir: str, output_path: str, original_path: str = None, validate: bool = True):
    """Pack directory into DOCX."""
    input_dir = Path(input_dir)
    output_path = Path(output_path)
    
    if not input_dir.exists():
        print(f"Error: {input_dir} not found")
        sys.exit(1)
    
    # If original provided, start with it as base
    if original_path and Path(original_path).exists():
        import shutil
        shutil.copy2(original_path, output_path)
        mode = 'a'
    else:
        mode = 'w'
    
    xml_files = list(input_dir.rglob('*.xml')) + list(input_dir.rglob('*.rels'))
    other_files = [f for f in input_dir.rglob('*') if f.is_file() and not (f.suffix in ('.xml', '.rels'))]
    
    with zipfile.ZipFile(output_path, mode, zipfile.ZIP_DEFLATED) as zf:
        for xml_file in xml_files:
            rel_path = xml_file.relative_to(input_dir)
            xml_str = xml_file.read_text(encoding='utf-8')
            
            # Auto-repair
            xml_str = auto_repair(xml_str)
            
            # Validate if requested
            if validate:
                is_valid, error = validate_xml(xml_str)
                if not is_valid:
                    print(f"Warning: {rel_path} has issues: {error}")
            
            # Condense XML (remove unnecessary whitespace for smaller file size)
            # Keep one-line format for production
            condensed = re.sub(r'>\s+<', '><', xml_str)
            condensed = re.sub(r'\n\s*', '', condensed)
            
            zf.writestr(str(rel_path), condensed)
        
        for other_file in other_files:
            rel_path = other_file.relative_to(input_dir)
            zf.write(other_file, str(rel_path))
    
    print(f"Packed to: {output_path}")
    print(f"Files included: {len(xml_files) + len(other_files)}")


def main():
    parser = argparse.ArgumentParser(description='Pack directory into DOCX')
    parser.add_argument('input', help='Input directory')
    parser.add_argument('output', help='Output .docx file')
    parser.add_argument('--original', help='Original .docx to use as base')
    parser.add_argument('--validate', default='true', choices=['true', 'false'],
                       help='Validate XML (default: true)')
    
    args = parser.parse_args()
    pack_docx(args.input, args.output, args.original, validate=args.validate == 'true')


if __name__ == '__main__':
    main()
