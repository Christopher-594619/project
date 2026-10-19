// Writes .env.android with this laptop's current network address, so the
// Android app can reach the backend running here on port 5000.
// "localhost" inside the app would mean the phone itself, not this laptop.
//
// Override the detected address if needed:
//   set API_HOST=192.168.43.10 && npm run build:android     (cmd)
//   $env:API_HOST="192.168.43.10"; npm run build:android    (PowerShell)
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = process.env.API_PORT || 5000;

function detectHost() {
  if (process.env.API_HOST) return process.env.API_HOST;

  const candidates = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family !== 'IPv4' || a.internal) continue;
      // Skip virtual adapters (VMware, VirtualBox, Hyper-V, WSL, Docker)
      if (/vmware|virtualbox|vethernet|hyper-v|wsl|docker|loopback/i.test(name)) continue;
      // Prefer Wi-Fi, then Ethernet, then anything else
      const rank = /wi-?fi|wlan|wireless/i.test(name) ? 0 : /ethernet/i.test(name) ? 1 : 2;
      candidates.push({ name, address: a.address, rank });
    }
  }
  candidates.sort((x, y) => x.rank - y.rank);
  return candidates[0] && candidates[0].address;
}

// API_URL points the app at a backend hosted online instead of this laptop:
//   $env:API_URL="https://tutor-finder-api.onrender.com"; npm run build:android
let url = process.env.API_URL && process.env.API_URL.replace(/\/+$/, '');
if (!url) {
  const host = detectHost();
  if (!host) {
    console.error('Could not find this laptop\'s network address. Connect to Wi-Fi, or set API_HOST or API_URL.');
    process.exit(1);
  }
  url = `http://${host}:${PORT}`;
}
fs.writeFileSync(path.join(__dirname, '..', '.env.android'), `VITE_ENDPOINT_URL=${url}\n`);
console.log(`Android app will use the backend at ${url}`);
