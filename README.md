# 03 — Deep Dive: Automasi Instalasi dengan Ansible (On-Prem)

Standarisasi Ansible playbook **remote SSH (SSH key)** untuk server **on-prem multi-cabang cinema outlet**. Lab Docker hanya simulasi; inventory produksi menunjuk IP LAN/VPN.

## Stack lab tutorial

| Komponen | Role / path |
|----------|-------------|
| Baseline OS | `commons` |
| PostgreSQL + seed | `postgres`, `postgres_import` |
| Web server | `nginx` |
| POS static (Vite) | `cinema_pos_static` + `apps/cinema-pos/` |
| POS updater | GitHub ZIP + `cinema-pos-version.json` + systemd timer / cron 5 menit |
| Lab nodes | `lab/` (3 container Docker + sshd) |

## Quick start

```bash
cd 03-ansible-deep-dive

./lab/scripts/setup-lab-ssh.sh

# 1) Build + package artifact (di laptop Anda)
./apps/cinema-pos/scripts/package-release.sh
# Upload artifacts/cinema-pos.zip + cinema-pos-version.json ke GitHub private

# 2) Vault secrets (token GitHub, encryption key, DB password)
cp inventories/lab/group_vars/vault.yml.example inventories/lab/group_vars/vault.yml
# edit vault.yml → ansible-vault encrypt inventories/lab/group_vars/vault.yml
# Set pos_github_owner / pos_github_repo di inventories/lab/group_vars/all.yml

ansible -i inventories/lab/hosts.yml outlets -m ping

ansible-playbook -i inventories/lab/hosts.yml playbooks/tutorial/site.yml --ask-vault-pass
```

Browser: http://localhost:8081 (JKT), :8082 (BDG), :8083 (SBY)

## On-prem nyata

Salin template cabang:

```bash
# Inventories/examples/onprem-outlets.yaml.example → inventories/onprem/hosts.yml
ansible-playbook -i inventories/onprem/hosts.yml playbooks/tutorial/site.yml --ask-vault-pass
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
│   └── cinema_pos_static/    # bootstrap updater + config.enc
└── apps/cinema-pos/
```

## Keamanan

- `GITHUB_TOKEN`, encryption key (32 char), password DB: **ansible-vault** (`vault.yml`).
- Secret runtime: `/opt/cinema-pos/config.enc` (AES-256-CBC) — **bukan** di web root / ZIP.
- Key lab SSH: `lab/ssh/ansible_lab_ed25519` (gitignored, tidak menimpa `~/.ssh`).

## Teardown

```bash
cd lab && docker compose down -v
```
