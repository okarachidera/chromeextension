#!/usr/bin/env sh
set -eu

OUT_DIR="dist"
OUT_FILE="$OUT_DIR/lead-vault-extension.zip"

mkdir -p "$OUT_DIR"
rm -f "$OUT_FILE"

zip -r "$OUT_FILE" \
  manifest.json \
  index.html \
  index.css \
  index.js \
  js \
  icon.png \
  logo.png

echo "Created $OUT_FILE"
