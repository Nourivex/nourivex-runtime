#!/usr/bin/env python3
"""LibreOffice wrapper for DOCX/PDF conversion.

Usage:
  python soffice.py --headless --convert-to pdf document.docx
  python soffice.py --headless --convert-to docx document.doc

Auto-configured for sandboxed environments.
"""

import argparse
import os
import subprocess
import sys
import shutil
from pathlib import Path


def find_libreoffice():
    """Find LibreOffice executable."""
    # Common paths
    candidates = [
        'soffice',
        'libreoffice',
        '/usr/bin/soffice',
        '/usr/bin/libreoffice',
        '/Applications/LibreOffice.app/Contents/MacOS/soffice',
        r'C:\Program Files\LibreOffice\program\soffice.exe',
        r'C:\Program Files (x86)\LibreOffice\program\soffice.exe',
    ]
    
    for candidate in candidates:
        if shutil.which(candidate):
            return candidate
    
    return None


def convert(input_path: str, output_format: str, output_dir: str = None):
    """Convert document using LibreOffice."""
    input_path = Path(input_path)
    if not input_path.exists():
        print(f"Error: {input_path} not found")
        sys.exit(1)
    
    soffice = find_libreoffice()
    if not soffice:
        print("Error: LibreOffice not found. Install it or add to PATH.")
        sys.exit(1)
    
    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    else:
        output_dir = input_path.parent
    
    cmd = [
        soffice,
        '--headless',
        '--convert-to', output_format,
        '--outdir', str(output_dir),
        str(input_path)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            sys.exit(1)
        
        output_file = output_dir / f"{input_path.stem}.{output_format}"
        print(f"Converted: {input_path} → {output_file}")
        return str(output_file)
    except subprocess.TimeoutExpired:
        print("Error: Conversion timed out")
        sys.exit(1)
    except FileNotFoundError:
        print(f"Error: Could not run {soffice}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description='LibreOffice conversion wrapper')
    parser.add_argument('--headless', action='store_true', help='Run in headless mode')
    parser.add_argument('--convert-to', required=True, help='Output format (pdf, docx, etc.)')
    parser.add_argument('--outdir', help='Output directory')
    parser.add_argument('input', help='Input file')
    
    args = parser.parse_args()
    convert(args.input, args.convert_to, args.outdir)


if __name__ == '__main__':
    main()
