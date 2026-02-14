#!/bin/bash

# Test PDF Compression Script
API_URL="https://pdf-tools-api-0m15.onrender.com"

if [ $# -lt 1 ]; then
    echo "Usage: $0 <pdf-file> [quality]"
    echo "Quality: low, medium, high (default: medium)"
    exit 1
fi

PDF_FILE="$1"
QUALITY="${2:-medium}"

if [ ! -f "$PDF_FILE" ]; then
    echo "Error: File not found: $PDF_FILE"
    exit 1
fi

echo "Testing compression on: $PDF_FILE"
echo "Quality level: $QUALITY"
echo "Original size: $(ls -lh "$PDF_FILE" | awk '{print $5}')"
echo ""
echo "Uploading to API..."

OUTPUT_FILE="/tmp/compressed_$(basename "$PDF_FILE")"

curl -X POST \
    -F "file=@$PDF_FILE" \
    -F "quality=$QUALITY" \
    "$API_URL/api/compress" \
    -D /tmp/compress_headers.txt \
    -o "$OUTPUT_FILE" \
    --progress-bar

echo ""
echo "=== COMPRESSION RESULTS ==="
grep -E "(x-original-size|x-compressed-size|x-reduction-percent)" /tmp/compress_headers.txt

echo ""
echo "Compressed file saved to: $OUTPUT_FILE"
echo "Compressed size: $(ls -lh "$OUTPUT_FILE" | awk '{print $5}')"
