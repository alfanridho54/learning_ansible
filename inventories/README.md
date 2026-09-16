# Inventories

| Path | Kegunaan |
|------|----------|
| `lab/hosts.yml` | Tutorial — 3 outlet Docker (SSH key, port 2221–2223) |
| `lab/group_vars/all.yml` | Path GitHub artifact + non-secret POS settings |
| `lab/group_vars/vault.yml.example` | Template secrets → copy ke `vault.yml` + encrypt |
| `examples/onprem-outlets.yaml.example` | Template cabang on-prem (IP LAN/VPN) |

Deep Dive ini **fully on-prem** — tidak ada inventory cloud.

```bash
cp inventories/lab/group_vars/vault.yml.example inventories/lab/group_vars/vault.yml
# edit token/keys, lalu:
ansible-vault encrypt inventories/lab/group_vars/vault.yml
ansible-playbook -i inventories/lab/hosts.yml playbooks/tutorial/site.yml --ask-vault-pass
```
