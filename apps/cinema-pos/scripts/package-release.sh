#!/usr/bin/env bash
# Build Vite POS and package GitHub artifacts (zip + version.json).
# CI is not documented here — run on your laptop then upload to private GitHub.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${APP_DIR}/artifacts"
VERSION_FILE="${OUT_DIR}/cinema-pos-version.json"
ZIP_FILE="${OUT_DIR}/cinema-pos.zip"

mkdir -p "${OUT_DIR}"
cd "${APP_DIR}"

echo "==> npm install & build..."
npm install
npm run build

if [[ ! -f "${APP_DIR}/dist/index.html" ]]; then
  echo "ERROR: dist/index.html missing after build" >&2
  exit 1
fi

CURRENT=0
if [[ -f "${VERSION_FILE}" ]]; then
  CURRENT="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' "${VERSION_FILE}" | head -n1)"
  CURRENT="${CURRENT:-0}"
fi

if [[ -n "${POS_VERSION:-}" ]]; then
  NEW_VERSION="${POS_VERSION}"
else
  NEW_VERSION=$((CURRENT + 1))
fi

echo "{\"version\":${NEW_VERSION}}" > "${VERSION_FILE}"

echo "==> Packing dist/ -> ${ZIP_FILE} (version ${NEW_VERSION})..."
rm -f "${ZIP_FILE}"
(
  cd "${APP_DIR}/dist"
  zip -qr "${ZIP_FILE}" .
)

echo ""
echo "Artifacts ready:"
echo "  ${VERSION_FILE}"
echo "  ${ZIP_FILE}"
echo ""
echo "Upload both to your private GitHub paths, e.g.:"
echo "  artifacts/cinema-pos-version.json"
echo "  artifacts/cinema-pos.zip"
echo "Then bump is picked up by cinema-pos-version.timer (every 5 min) on each outlet."
