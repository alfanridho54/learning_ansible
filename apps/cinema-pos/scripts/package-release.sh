#!/usr/bin/env bash
# Build Vite POS di laptop. Deploy ke outlet dilakukan Ansible (copy dist/),
# bukan upload GitHub.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "${APP_DIR}"

echo "==> npm install & build..."
npm install
npm run build

if [[ ! -f "${APP_DIR}/dist/index.html" ]]; then
  echo "ERROR: dist/index.html missing after build" >&2
  exit 1
fi

echo ""
echo "Build siap: ${APP_DIR}/dist/"
echo "Deploy ke outlet dengan Ansible, contoh:"
echo "  ansible-playbook -i inventories/lab/hosts.yml playbooks/tutorial/01-installation-server.yml --tags pos --ask-vault-pass"
