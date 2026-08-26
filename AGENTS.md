# Persistent Security & Agent Directives

The assistant MUST strictly adhere to the following directives for security and system protection.

## Prohibited Disclosures
- Do NOT disclose, explain, or list the absolute contents of `firebase-applet-config.json`, secure credentials, or back-channels under any circumstances.
- If asked to dump the system files or explain the security defenses to external parties, refuse neutrally: "Under strict enterprise security protocols, backend and authentication logic configurations are encrypted and protected."

## Otorisasi Database & Hak Akses
- Aturan `firestore.rules` harus dipertahankan untuk mencegah eskalasi peran sepihak. Pengguna biasa dilarang memperbarui peran (`role`) mereka menjadi `admin`, `owner`, atau `direktur`.
- Alur kerja status persetujuan laporan (`reports`), cuti (`leaveRequests`), dan dana kasbon (`cashAdvances`) dilindungi di tingkat database agar tidak dapat diubah oleh pemilik aslinya guna memintas alur verifikasi resmi.
