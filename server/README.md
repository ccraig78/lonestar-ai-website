# LoneStar Mission Control Backend

This is the private backend wrapper for `mission.html`.

It is intentionally dependency-free Node.js for now. It provides:

- login page
- signed HTTP-only session cookie
- protected Mission Control page/API
- placeholder agent status/message endpoints
- no password or OpenClaw token in frontend JavaScript

## Set your password

Generate a password hash locally:

```bash
cd /home/clint-craig/lonestar-ai-website
node server/mission-server.js --hash-password 'YOUR_PASSWORD_HERE'
```

Copy the printed `scrypt:...` value into a local environment file or service config.
Do **not** commit the real hash if you care about keeping the login private.

Example local run:

```bash
export MISSION_USER='Clint'
export MISSION_PASSWORD_HASH='scrypt:PASTE_HASH_HERE'
export MISSION_SESSION_SECRET="$(openssl rand -hex 32)"
node server/mission-server.js
```

Then open:

```text
http://127.0.0.1:8787/mission.html
```

The server also auto-loads `/home/clint-craig/lonestar-ai-website/.env.mission.local` when present.

## Run as Clint's user service

The local user service is:

```text
~/.config/systemd/user/mission-control-v2.service
```

Useful commands:

```bash
systemctl --user daemon-reload
systemctl --user restart mission-control-v2.service
systemctl --user status mission-control-v2.service --no-pager
curl http://127.0.0.1:8787/health
```

Current local backend URL:

```text
http://127.0.0.1:8787/mission.html
```

## OpenClaw live routing

By default, `POST /api/message` returns safe prototype replies.

To let the backend call local OpenClaw agents, set:

```bash
export MISSION_OPENCLAW_ENABLED=1
export MISSION_OPENCLAW_BIN=/home/clint-craig/.npm-global/bin/openclaw
export MISSION_AGENT_BUDDY=main
export MISSION_AGENT_STELLA=lonestar
# Optional, only if these OpenClaw agent ids exist locally:
# export MISSION_AGENT_CODI=codi
# export MISSION_AGENT_EURO=euro
# export MISSION_AGENT_GROK=codi-grok
```

Current local live routing:

- Buddy → OpenClaw agent `main`
- Stella → OpenClaw agent `lonestar`
- Codi / Euro / Grok stay visible in the UI, but return an unmapped notice until real OpenClaw agent ids are configured.

The server then runs `openclaw agent --agent <id> --message ... --json` from the backend. This keeps browser JavaScript free of OpenClaw tokens/secrets, but it does mean every live send can spend model tokens and may take several seconds.

## Public access / security

GitHub Pages can only serve the static prototype. Real login and live agent routing require traffic to reach this Node backend.

Recommended final public setup:

1. Put Cloudflare in front of `lonestaraiassistants.com`.
2. Run a Cloudflare Tunnel from this computer or a VPS to `http://127.0.0.1:8787`.
3. Keep Mission Control behind the Node login, and optionally add Cloudflare Access as a second lock.

Until that routing is done, `https://lonestaraiassistants.com/mission.html` is a static visual prototype and the working private version is local at `http://127.0.0.1:8787/mission.html`.
