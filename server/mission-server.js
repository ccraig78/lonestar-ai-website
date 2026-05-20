#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');
const { execFile } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const LOCAL_ENV_FILE = path.join(ROOT, '.env.mission.local');

function loadLocalEnv(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadLocalEnv(LOCAL_ENV_FILE);

const PORT = Number(process.env.MISSION_PORT || 8787);
const HOST = process.env.MISSION_HOST || '127.0.0.1';
const USERNAME = process.env.MISSION_USER || 'Clint';
const PASSWORD_HASH = process.env.MISSION_PASSWORD_HASH || '';
const SESSION_SECRET = process.env.MISSION_SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const COOKIE_NAME = 'mission_session';
const SESSION_TTL_MS = Number(process.env.MISSION_SESSION_TTL_MS || 1000 * 60 * 60 * 12);
const OPENCLAW_ENABLED = process.env.MISSION_OPENCLAW_ENABLED === '1';
const OPENCLAW_BIN = process.env.MISSION_OPENCLAW_BIN || '/home/clint-craig/.npm-global/bin/openclaw';
const OPENCLAW_AGENT_MAP = {
  buddy: process.env.MISSION_AGENT_BUDDY || 'main',
  stella: process.env.MISSION_AGENT_STELLA || 'lonestar',
  codi: process.env.MISSION_AGENT_CODI || '',
  euro: process.env.MISSION_AGENT_EURO || '',
  grok: process.env.MISSION_AGENT_GROK || ''
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary'
};

const AGENT_PROFILES = {
  buddy: { name: 'Buddy', emoji: '🦞', role: 'Primary continuity, coding, workspace ops' },
  stella: { name: 'Stella', emoji: '⭐', role: 'LoneStar archive and website-control persona' },
  codi: { name: 'Codi', emoji: '⚡', role: 'CEO brain, pressure-testing, focused execution' },
  euro: { name: 'Euro', emoji: '🛻', role: 'Better Beds / Roadie business context' },
  grok: { name: 'Codi-Grok', emoji: '𝕏', role: 'Grok 4.3 outside perspective through Codi/Hermes' }
};

const AGENT_ID_ALIASES = {
  main: 'buddy',
  buddy: 'buddy',
  lonestar: 'stella',
  stella: 'stella',
  codi: 'codi',
  euro: 'euro',
  grok: 'grok',
  'codi-grok': 'grok'
};

const conversations = [];

function send(res, status, body, headers = {}) {
  const content = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  res.writeHead(status, {
    'Content-Length': content.length,
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(content);
}

function json(res, status, data) {
  send(res, status, JSON.stringify(data, null, 2), { 'Content-Type': 'application/json; charset=utf-8' });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 128) reject(new Error('Request too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(part => {
    const idx = part.indexOf('=');
    return [part.slice(0, idx).trim(), decodeURIComponent(part.slice(idx + 1))];
  }));
}

function sign(value) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
}

function makeSession(username) {
  const payload = Buffer.from(JSON.stringify({ username, exp: Date.now() + SESSION_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifySession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  try {
    const expected = sign(payload);
    if (Buffer.byteLength(sig) !== Buffer.byteLength(expected)) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  if (!stored.startsWith('scrypt:')) return false;
  const [, salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

function extractOpenClawText(stdout) {
  const fallback = stdout.trim() || 'OpenClaw returned no visible text.';
  try {
    const data = JSON.parse(stdout);
    const payloadText = data?.result?.payloads?.map(payload => payload?.text).filter(Boolean).join('\n\n');
    const directText = data.reply || data.response || data.message || data.text || data?.result?.text || payloadText;
    return String(directText || fallback).trim();
  } catch {
    return fallback;
  }
}

function execOpenClaw(args, options = {}) {
  return new Promise((resolve) => {
    execFile(OPENCLAW_BIN, args, {
      cwd: ROOT,
      timeout: options.timeout || 25000,
      maxBuffer: options.maxBuffer || 1024 * 1024 * 4,
      env: { ...process.env, PATH: `${path.dirname(OPENCLAW_BIN)}:${process.env.PATH || ''}` }
    }, (err, stdout, stderr) => {
      if (err) return resolve({ ok: false, stdout, stderr: stderr || err.message });
      resolve({ ok: true, stdout, stderr });
    });
  });
}

function agentProfileFor(publicId, fallback = {}) {
  const profile = AGENT_PROFILES[publicId] || {};
  return {
    id: publicId,
    name: profile.name || fallback.identityName || fallback.name || publicId,
    emoji: profile.emoji || fallback.identityEmoji || '🤖',
    role: profile.role || fallback.role || `OpenClaw agent ${fallback.id || publicId}`
  };
}

async function discoverAgents() {
  const byPublicId = new Map();
  const add = (agent) => {
    if (!agent?.id) return;
    byPublicId.set(agent.id, { ...(byPublicId.get(agent.id) || {}), ...agent });
  };

  const configured = Object.entries(OPENCLAW_AGENT_MAP).filter(([, mapped]) => Boolean(mapped));
  for (const [publicId, mappedAgent] of configured) {
    const profile = agentProfileFor(publicId);
    add({
      ...profile,
      mappedAgent,
      routable: OPENCLAW_ENABLED,
      status: OPENCLAW_ENABLED ? 'Live' : 'Configured',
      currentWork: OPENCLAW_ENABLED ? `Live via OpenClaw agent ${mappedAgent}` : `Configured as ${mappedAgent}; live routing is off`
    });
  }

  const listed = await execOpenClaw(['agents', 'list', '--json'], { timeout: 20000 });
  if (listed.ok) {
    try {
      const localAgents = JSON.parse(listed.stdout);
      if (Array.isArray(localAgents)) {
        for (const local of localAgents) {
          const publicId = AGENT_ID_ALIASES[local.id] || local.id;
          const profile = agentProfileFor(publicId, local);
          const mappedAgent = Object.entries(OPENCLAW_AGENT_MAP).find(([, id]) => id === local.id)?.[1] || local.id;
          add({
            ...profile,
            mappedAgent,
            routable: OPENCLAW_ENABLED,
            status: OPENCLAW_ENABLED ? 'Live' : 'Available',
            model: local.model,
            workspace: local.workspace,
            currentWork: OPENCLAW_ENABLED ? `Live via OpenClaw agent ${local.id}` : `Local OpenClaw agent ${local.id} discovered`
          });
        }
      }
    } catch {
      // Discovery is best effort; configured agents still work.
    }
  }

  for (const publicId of ['codi', 'euro', 'grok']) {
    if (!byPublicId.has(publicId)) {
      const profile = agentProfileFor(publicId);
      add({
        ...profile,
        mappedAgent: '',
        routable: false,
        status: publicId === 'grok' ? 'On demand' : 'Unmapped',
        currentWork: publicId === 'grok'
          ? 'Available through Codi/Hermes; direct Mission Control routing not configured yet'
          : 'Visible here; direct Mission Control routing not configured yet'
      });
    }
  }

  return Array.from(byPublicId.values());
}

async function runOpenClawAgent(agentId, message) {
  const args = ['agent', '--agent', agentId, '--message', message, '--json', '--timeout', '180'];
  const result = await execOpenClaw(args, { timeout: 190000 });
  if (!result.ok) return { ok: false, text: `OpenClaw call failed for ${agentId}: ${result.stderr}` };
  return { ok: true, text: extractOpenClawText(result.stdout) };
}

function loginPage(error = '') {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LoneStar Mission Login</title><style>
:root{color-scheme:dark;--a:#2f86ff;--b:#ff4655}*{box-sizing:border-box}body{min-height:100vh;margin:0;display:grid;place-items:center;font-family:Inter,system-ui,sans-serif;color:#f7fbff;background:radial-gradient(circle at 20% 10%,rgba(47,134,255,.35),transparent 32%),radial-gradient(circle at 82% 15%,rgba(255,70,85,.25),transparent 30%),linear-gradient(135deg,#040816,#111a3b)}.card{width:min(440px,calc(100% - 28px));border:1px solid rgba(255,255,255,.16);border-radius:30px;background:rgba(8,14,32,.74);box-shadow:0 28px 90px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.09);backdrop-filter:blur(22px);padding:28px}.logo{width:88px;height:88px;object-fit:contain;display:block;margin:0 auto 18px;filter:drop-shadow(0 0 36px rgba(47,134,255,.5))}h1{margin:0 0 8px;text-align:center;font-size:2rem;letter-spacing:-.06em}p{margin:0 0 20px;text-align:center;color:#b9c6dc;line-height:1.5}label{display:grid;gap:7px;margin:13px 0;color:#cbd7ea;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}input{width:100%;border:1px solid rgba(255,255,255,.15);border-radius:17px;background:rgba(0,0,0,.28);color:white;padding:13px 14px;font:inherit;outline:none}input:focus{border-color:#6aa8ff;box-shadow:0 0 0 4px rgba(47,134,255,.18)}button{width:100%;border:0;border-radius:999px;margin-top:12px;padding:13px 16px;color:white;font-weight:950;background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 18px 42px rgba(47,134,255,.25);cursor:pointer}.error{border:1px solid rgba(255,70,85,.45);background:rgba(255,70,85,.12);color:#ffd8dc;border-radius:16px;padding:10px;margin-bottom:14px;text-align:left;font-size:13px}.note{font-size:12px;margin-top:16px}</style></head>
<body><form class="card" method="post" action="/login"><img class="logo" src="/assets/images/ls-star-rounded-gradient.png" alt=""><h1>Mission Control</h1><p>Private cockpit login</p>${error ? `<div class="error">${error}</div>` : ''}<label>Username<input name="username" autocomplete="username" value="Clint"></label><label>Password<input name="password" type="password" autocomplete="current-password" autofocus></label><button type="submit">Enter Mission Control</button><p class="note">Password is checked server-side. Nothing secret goes into the website JavaScript.</p></form></body></html>`;
}

function requireAuth(req, res) {
  if (!PASSWORD_HASH) {
    json(res, 503, { error: 'Mission Control password is not configured. Set MISSION_PASSWORD_HASH before exposing this server.' });
    return null;
  }
  const session = verifySession(req);
  if (!session) {
    if (req.url.startsWith('/api/')) json(res, 401, { error: 'not_authenticated' });
    else send(res, 302, '', { Location: '/login' });
    return null;
  }
  return session;
}

function safeStaticPath(urlPath) {
  let pathname = decodeURIComponent(urlPath);
  if (pathname === '/') pathname = '/mission.html';
  const file = path.resolve(ROOT, pathname.replace(/^\/+/, ''));
  if (!file.startsWith(ROOT)) return null;
  return file;
}

async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') return json(res, 200, { ok: true, service: 'mission-control' });

  if (url.pathname === '/login' && req.method === 'GET') return send(res, 200, loginPage(), { 'Content-Type': 'text/html; charset=utf-8' });
  if (url.pathname === '/login' && req.method === 'POST') {
    const raw = await readBody(req);
    const form = new URLSearchParams(raw);
    const username = String(form.get('username') || '');
    const password = String(form.get('password') || '');
    if (!PASSWORD_HASH) return send(res, 503, loginPage('Password is not configured yet. Set MISSION_PASSWORD_HASH on the server.'), { 'Content-Type': 'text/html; charset=utf-8' });
    if (username === USERNAME && verifyPassword(password, PASSWORD_HASH)) {
      return send(res, 302, '', {
        Location: '/mission.html',
        'Set-Cookie': `${COOKIE_NAME}=${encodeURIComponent(makeSession(username))}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
      });
    }
    return send(res, 401, loginPage('That username/password did not work.'), { 'Content-Type': 'text/html; charset=utf-8' });
  }

  if (url.pathname === '/logout') {
    return send(res, 302, '', { Location: '/login', 'Set-Cookie': `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0` });
  }

  if (url.pathname === '/api/me') {
    const session = requireAuth(req, res); if (!session) return;
    return json(res, 200, { username: session.username, authenticated: true });
  }

  if (url.pathname === '/api/agents') {
    const session = requireAuth(req, res); if (!session) return;
    const discoveredAgents = await discoverAgents();
    return json(res, 200, {
      agents: discoveredAgents,
      openclaw: {
        enabled: OPENCLAW_ENABLED,
        binary: OPENCLAW_BIN,
        wiredAgents: Object.fromEntries(Object.entries(OPENCLAW_AGENT_MAP).filter(([, value]) => Boolean(value)))
      }
    });
  }

  if (url.pathname === '/api/messages' && req.method === 'GET') {
    const session = requireAuth(req, res); if (!session) return;
    return json(res, 200, { messages: conversations.slice(-80).reverse() });
  }

  if (url.pathname === '/api/message' && req.method === 'POST') {
    const session = requireAuth(req, res); if (!session) return;
    const body = JSON.parse((await readBody(req)) || '{}');
    const recipients = Array.isArray(body.recipients) ? body.recipients : ['buddy'];
    const text = String(body.message || '').trim();
    if (!text) return json(res, 400, { error: 'message_required' });
    const now = new Date().toISOString();
    const outbound = { id: crypto.randomUUID(), time: now, from: session.username, recipients, text, type: 'outbound' };
    conversations.push(outbound);

    const discoveredAgents = await discoverAgents();
    const replies = [];
    for (const id of recipients) {
      const agent = discoveredAgents.find(a => a.id === id) || { id, name: id };
      let replyText = 'Prototype backend received this command. Set MISSION_OPENCLAW_ENABLED=1 and configure agent mappings to send live OpenClaw turns.';
      const mappedAgent = agent.mappedAgent || OPENCLAW_AGENT_MAP[id];
      if (OPENCLAW_ENABLED && mappedAgent) {
        const prompt = `Message from Clint via private LoneStar Mission Control. Reply for Mission Control, concise unless Clint asks for detail.\n\nClint says: ${text}`;
        const result = await runOpenClawAgent(mappedAgent, prompt);
        replyText = result.text;
      } else if (OPENCLAW_ENABLED && !mappedAgent) {
        replyText = `${agent.name} is visible in Mission Control, but is not mapped to a local OpenClaw agent yet. Configure MISSION_AGENT_${id.toUpperCase()} to enable live routing.`;
      }
      replies.push({
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        from: agent.name,
        agentId: agent.id,
        text: replyText,
        type: 'reply'
      });
    }
    conversations.push(...replies);
    return json(res, 200, { ok: true, sent: outbound, replies });
  }

  // Protect Mission Control and its assets when served through this backend.
  const protectedPaths = ['/mission.html', '/assets/css/mission-control.css', '/assets/js/mission-control.js'];
  if (url.pathname === '/' || protectedPaths.includes(url.pathname)) {
    const session = requireAuth(req, res); if (!session) return;
  }

  const file = safeStaticPath(url.pathname);
  if (!file) return send(res, 403, 'Forbidden');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, data, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  });
}

if (process.argv.includes('--hash-password')) {
  const password = process.argv[process.argv.indexOf('--hash-password') + 1];
  if (!password) {
    console.error('Usage: node server/mission-server.js --hash-password "your password"');
    process.exit(1);
  }
  console.log(hashPassword(password));
  process.exit(0);
}

http.createServer((req, res) => {
  handle(req, res).catch(err => {
    console.error(err);
    json(res, 500, { error: 'server_error' });
  });
}).listen(PORT, HOST, () => {
  console.log(`Mission Control server: http://${HOST}:${PORT}`);
  if (!PASSWORD_HASH) console.log('WARNING: MISSION_PASSWORD_HASH is not set. Login will remain disabled until configured.');
});
