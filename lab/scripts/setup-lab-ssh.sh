#!/usr/bin/env bash
# Bootstrap lab Docker outlets dengan SSH key KHUSUS lab (hanya di folder project).
# TIDAK menyentuh ~/.ssh dan TIDAK menimpa key lab yang sudah ada (kecuali LAB_FORCE_REGENERATE_KEY=1).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
LAB_DIR="${ROOT_DIR}/lab"
SSH_DIR="${LAB_DIR}/ssh"
KEY_BASENAME="ansible_lab_ed25519"
PRIVATE_KEY="${SSH_DIR}/${KEY_BASENAME}"
PUBLIC_KEY="${PRIVATE_KEY}.pub"
AUTHORIZED_KEYS="${SSH_DIR}/authorized_keys"

# --- Safety: semua artefak SSH hanya di dalam repo project ---
resolve_dir="$(cd "${SSH_DIR}" 2>/dev/null && pwd || echo "${SSH_DIR}")"
case "${resolve_dir}" in
  "${ROOT_DIR}"/*) ;;
  *)
    echo "ERROR: SSH_DIR harus berada di dalam project: ${SSH_DIR}" >&2
    exit 1
    ;;
esac

if [[ -n "${HOME:-}" && "${PRIVATE_KEY}" == "${HOME}/.ssh/"* ]]; then
  echo "ERROR: Refusing to use path under ~/.ssh" >&2
  exit 1
fi

mkdir -p "${SSH_DIR}"
chmod 700 "${SSH_DIR}"

if [[ -f "${PRIVATE_KEY}" ]]; then
  if [[ "${LAB_FORCE_REGENERATE_KEY:-0}" == "1" ]]; then
    echo "==> LAB_FORCE_REGENERATE_KEY=1 — regenerate key lab (backup otomatis)..."
    ts="$(date +%Y%m%d%H%M%S)"
    mv "${PRIVATE_KEY}" "${PRIVATE_KEY}.bak.${ts}"
    [[ -f "${PUBLIC_KEY}" ]] && mv "${PUBLIC_KEY}" "${PUBLIC_KEY}.bak.${ts}"
  else
    echo "==> Key lab sudah ada (tidak di-overwrite): ${PRIVATE_KEY}"
    echo "    Hapus manual atau jalankan: LAB_FORCE_REGENERATE_KEY=1 $0"
  fi
fi

if [[ ! -f "${PRIVATE_KEY}" ]]; then
  echo "==> Generate SSH key lab (ed25519) di project saja..."
  ssh-keygen -t ed25519 -N "" -f "${PRIVATE_KEY}" -C "ansible-lab-cinema@${KEY_BASENAME}"
fi

cp "${PUBLIC_KEY}" "${AUTHORIZED_KEYS}"
chmod 600 "${PRIVATE_KEY}" "${AUTHORIZED_KEYS}" 2>/dev/null || true
chmod 644 "${PUBLIC_KEY}" 2>/dev/null || true

echo "==> Build & start 3 outlet Docker..."
cd "${LAB_DIR}"
docker compose down --remove-orphans >/dev/null 2>&1 || true
docker compose up -d --build
sleep 3

ssh -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile="${SSH_DIR}/known_hosts" \
  -i "${PRIVATE_KEY}" -p 2221 ansible@127.0.0.1 'echo SSH_OK && hostname'

echo ""
echo "Lab siap."
echo "  Private key (local only): ${PRIVATE_KEY}"
echo "  ansible -i inventories/lab/hosts.yml outlets -m ping"
