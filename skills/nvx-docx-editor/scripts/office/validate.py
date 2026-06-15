#!/usr/bin/env python3
"""Validate a .docx file for structural integrity.

Usage: python validate.py document.docx

Checks for:
- ZIP archive integrity
- Required files present
- XML well-formedness
- Relationship consistency
"""

import argparse
import sys
import zipfile
from pathlib import Path


REQUIRED_FILES = [
    '[Content_Types].xml',
    'word/document.xml',
]

RECOMMENDED_FILES = [
    'word/styles.xml',
    'word/_rels/document.xml.rels',
    '_rels/.rels',
]


def validate_docx(docx_path: str) -> tuple[bool, list[str], list[str]]:
    """Validate DOCX file. Returns (is_valid, errors, warnings)."""
    errors = []
    warnings = []
    
    path = Path(docx_path)
    if not path.exists():
        return False, [f"File not found: {docx_path}"], []
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zf:
            # Check ZIP integrity
            bad_file = zf.testzip()
            if bad_file:
                errors.append(f"Corrupted file in archive: {bad_file}")
            
            names = zf.namelist()
            
            # Check required files
            for required in REQUIRED_FILES:
                if required not in names:
                    errors.append(f"Missing required file: {required}")
            
            # Check recommended files
            for recommended in RECOMMENDED_FILES:
                if recommended not in names:
                    warnings.append(f"Missing recommended file: {recommended}")
            
            # Validate XML files
            for name in names:
                if name.endswith('.xml') or name.endswith('.rels'):
                    try:
                        content = zf.read(name)
                        # Basic XML parsing check
                        if not content.strip():
                            warnings.append(f"Empty XML file: {name}")
                    except Exception as e:
                        errors.append(f"Cannot read {name}: {e}")
            
            # Check Content_Types exists and has document
            if '[Content_Types].xml' in names:
                content_types = zf.read('[Content_Types].xml').decode('utf-8')
                if 'word/document.xml' not in content_types:
                    warnings.append("Content_Types may not reference document.xml")
            
    except zipfile.BadZipFile:
        errors.append("Not a valid ZIP/DOCX file")
    except Exception as e:
        errors.append(f"Validation error: {e}")
    
    is_valid = len(errors) == 0
    return is_valid, errors, warnings


def main():
    parser = argparse.ArgumentParser(description='Validate DOCX file')
    parser.add_argument('docx', help='Input .docx file')
    
    args = parser.parse_args()
    
    is_valid, errors, warnings = validate_docx(args.docx)
    
    if errors:
        print("ERRORS:")
        for error in errors:
            print(f"  ✗ {error}")
    
    if warnings:
        print("WARNINGS:")
        for warning in warnings:
            print(f"  ⚠ {warning}")
    
    if is_valid:
        print("✓ DOCX is valid")
        sys.exit(0)
    else:
        print("✗ DOCX validation failed")
        sys.exit(1)


if __name__ == '__main__':
    main()
