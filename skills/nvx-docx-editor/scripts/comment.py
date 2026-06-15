#!/usr/bin/env python3
"""Add comments to an unpacked DOCX document.

Usage: 
  python comment.py unpacked/ 0 "Comment text"
  python comment.py unpacked/ 1 "Reply text" --parent 0
  python comment.py unpacked/ 0 "Text" --author "Custom Author"

Handles comment XML generation across multiple files.
"""

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path


def get_next_comment_id(comments_xml: str) -> int:
    """Find the next available comment ID."""
    import re
    ids = re.findall(r'w:id="(\d+)"', comments_xml)
    return max(int(id) for id in ids) + 1 if ids else 0


def add_comment_to_xml(xml_path: Path, comment_id: int, text: str, author: str, date: str, parent_id: int = None):
    """Add comment markers to document.xml."""
    content = xml_path.read_text(encoding='utf-8')
    
    # Find a suitable insertion point (after first paragraph)
    import re
    
    # Create comment range markers
    start_marker = f'<w:commentRangeStart w:id="{comment_id}"/>'
    end_marker = f'<w:commentRangeEnd w:id="{comment_id}"/>'
    ref_marker = f'<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="{comment_id}"/></w:r>'
    
    # Insert after first <w:p> opening
    first_para = re.search(r'<w:p[>\s]', content)
    if first_para:
        insert_pos = first_para.end()
        markers = f'{start_marker}{end_marker}{ref_marker}'
        content = content[:insert_pos] + markers + content[insert_pos:]
    
    xml_path.write_text(content, encoding='utf-8')


def create_comment_entry(comment_id: int, text: str, author: str, date: str, parent_id: int = None) -> str:
    """Create a single comment XML entry."""
    parent_attr = f' w:id="{parent_id}"' if parent_id is not None else ''
    return f'''<w:comment w:id="{comment_id}" w:author="{author}" w:date="{date}"{parent_attr}>
  <w:p>
    <w:r>
      <w:t xml:space="preserve">{text}</w:t>
    </w:r>
  </w:p>
</w:comment>'''


def main():
    parser = argparse.ArgumentParser(description='Add comments to DOCX')
    parser.add_argument('dir', help='Unpacked DOCX directory')
    parser.add_argument('id', type=int, help='Comment ID')
    parser.add_argument('text', help='Comment text (pre-escaped XML)')
    parser.add_argument('--parent', type=int, help='Parent comment ID for replies')
    parser.add_argument('--author', default='Claude', help='Author name')
    
    args = parser.parse_args()
    
    unpacked_dir = Path(args.dir)
    comments_xml = unpacked_dir / 'word' / 'comments.xml'
    document_xml = unpacked_dir / 'word' / 'document.xml'
    
    if not document_xml.exists():
        print(f"Error: {document_xml} not found")
        sys.exit(1)
    
    date = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    
    # Create or update comments.xml
    if comments_xml.exists():
        content = comments_xml.read_text(encoding='utf-8')
        # Insert before closing tag
        new_entry = create_comment_entry(args.id, args.text, args.author, date, args.parent)
        content = content.replace('</w:comments>', f'{new_entry}\n</w:comments>')
    else:
        content = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
{create_comment_entry(args.id, args.text, args.author, date, args.parent)}
</w:comments>'''
    
    comments_xml.write_text(content, encoding='utf-8')
    
    # Add markers to document.xml
    add_comment_to_xml(document_xml, args.id, args.text, args.author, date, args.parent)
    
    print(f"Added comment {args.id}: {args.text[:50]}...")


if __name__ == '__main__':
    main()
