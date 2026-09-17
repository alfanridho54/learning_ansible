# Tutorial lab vs deployment on-prem

Course ini fokus **pola reusable on-prem** — lab Docker mensimulasikan banyak cabang; produksi memakai inventory IP LAN/VPN.

| Aspek | Lab tutorial | On-prem produksi |
|-------|--------------|------------------|
| Inventory | `inventories/lab/hosts.yml` | `inventories/examples/onprem-outlets.yaml.example` → IP cabang |
| Playbook | `playbooks/tutorial/01-installation-server.yml` | Playbook sama (struktur roles serupa) |
| Web POS | Nginx + Vite static | Nginx (+ PM2 jika app Node — lihat `docs/examples`) |
| Deploy POS | Ansible `copy` `dist/` dari control node | Sama |
| Secrets | `config.enc` + ansible-vault | vault / secret store perusahaan |
| PostgreSQL | Single node + `cinema_pos_lab.sql` | HA/backup sesuai kebijakan |

**Prinsip:** ganti **inventory** dan **variabel cabang**, bukan mengubah logika role inti setiap outlet.
