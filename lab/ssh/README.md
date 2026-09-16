# SSH keys lab (local only)

Folder ini **hanya untuk key lab Ansible** di laptop Anda. File di sini:

- Dibuat oleh `lab/scripts/setup-lab-ssh.sh`
- **Tidak di-commit** ke Git (lihat `.gitignore`)
- **Bukan** key `~/.ssh/id_ed25519` pribadi Anda — script tidak menyentuh `~/.ssh`

Nama key default: `ansible_lab_ed25519` (+ `.pub`, `authorized_keys`, `known_hosts`).

Jika key sudah ada, script **tidak menimpa** kecuali:

```bash
LAB_FORCE_REGENERATE_KEY=1 ./lab/scripts/setup-lab-ssh.sh
```
