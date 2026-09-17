# 03 — Deep Dive: Automasi Instalasi dengan Ansible (On-Prem)

Standarisasi Ansible playbook **remote SSH (SSH key)** untuk server **on-prem multi-cabang cinema outlet**. Lab Docker hanya simulasi; inventory produksi menunjuk IP LAN/VPN.

## Stack lab tutorial

| Komponen | Role / path |
|----------|-------------|
| Baseline OS | `commons` |
| PostgreSQL + seed | `postgres`, `postgres_import` |
| Web server | `nginx` |
| POS static (Vite) | `cinema_pos_static` + `apps/cinema-pos/` |
| Deploy POS | Ansible build + `copy` `dist/` (bukan download GitHub) |
| Lab nodes | `lab/` (3 container Docker + sshd) |

## Quick start

```bash
cd 03-ansible-deep-dive

./lab/scripts/setup-lab-ssh.sh

# Opsional: build POS di laptop (role juga bisa build otomatis)
./apps/cinema-pos/scripts/package-release.sh

# Vault secrets (encryption key + DB password)
cp inventories/lab/group_vars/vault.yml.example inventories/lab/group_vars/vault.yml
# edit vault.yml → ansible-vault encrypt inventories/lab/group_vars/vault.yml

# Prefix ANSIBLE_ROLES_PATH agar roles course dipakai
# (config Ansible global / project lain tidak diubah)
ANSIBLE_ROLES_PATH="$PWD/roles" ansible -i inventories/lab/hosts.yml outlets -m ping

ANSIBLE_ROLES_PATH="$PWD/roles" ansible-playbook -i inventories/lab/hosts.yml \
  playbooks/tutorial/01-installation-server.yml --ask-vault-pass
```

Browser: http://localhost:8081 (JKT), :8082 (BDG), :8083 (SBY)

## On-prem nyata

```bash
# Inventories/examples/onprem-outlets.yaml.example → inventories/onprem/hosts.yml
ANSIBLE_ROLES_PATH="$PWD/roles" ansible-playbook -i inventories/onprem/hosts.yml \
  playbooks/tutorial/01-installation-server.yml --ask-vault-pass
```

Playbook & roles **tidak diubah** — hanya inventory (IP LAN/VPN, hostname outlet).

## Struktur

```text
03-ansible-deep-dive/
├── ansible.cfg
├── lab/
├── inventories/lab/          # Tutorial Docker
├── inventories/examples/     # Template on-prem
├── playbooks/tutorial/
├── roles/
│   ├── commons/
│   ├── postgres/
│   ├── postgres_import/
│   ├── nginx/
│   └── cinema_pos_static/    # build + copy dist + config.enc
└── apps/cinema-pos/
```

## Keamanan

- Encryption key (32 char) + password DB: **ansible-vault** (`vault.yml`).
- Secret runtime: `/opt/cinema-pos/config.enc` (AES-256-CBC) — **bukan** di web root.
- Key lab SSH: `lab/ssh/ansible_lab_ed25519` (gitignored, tidak menimpa `~/.ssh`).

## Teardown

```bash
cd lab && docker compose down -v
```
