let agents = [
  { id: 'buddy', name: 'Buddy', emoji: '🦞', role: 'Primary continuity, coding, workspace ops', status: 'Online', note: 'Ready to build, test, and keep the thread together.' },
  { id: 'codi', name: 'Codi', emoji: '⚡', role: 'CEO brain, pressure-testing, focused execution', status: 'Standby', note: 'Good for second opinions and pushing ideas into shape.' },
  { id: 'euro', name: 'Euro', emoji: '🛻', role: 'Better Beds / Roadie business context', status: 'Idle', note: 'Truck bed knowledge, local customer flow, quote context.' },
  { id: 'stella', name: 'Stella', emoji: '⭐', role: 'LoneStar archive and website-control persona', status: 'Idle', note: 'Useful if the LoneStar idea wakes up again later.' },
  { id: 'grok', name: 'Codi-Grok', emoji: '𝕏', role: 'Grok 4.3 outside perspective through Codi/Hermes', status: 'On demand', note: 'Useful for X/Twitter search, blunt reasoning, outside takes.' }
];

const projects = [
  { name: 'AI Lab', desc: 'Fun experiments, demos, dashboards, and weird useful tools.', tag: 'Active playground' },
  { name: 'Better Beds', desc: 'Roadie, lead capture, inventory helper ideas, and local business automation.', tag: 'Real business' },
  { name: 'SparePhone', desc: 'Old-phone utility app: camera, intercom, recorder, sync, and remote tools.', tag: 'Android' },
  { name: 'Swipe Clean', desc: 'Photo review app with swipe keep/delete/favorite flows and duplicate cleanup.', tag: 'Android' },
  { name: 'Chibi / NanoMe', desc: 'Stylized figure pipeline, Meshy/Blender cleanup, and print-color workflow.', tag: 'Creative' },
  { name: 'LoneStar Archive', desc: 'Paused business idea, saved assets, demos, and possible future reboot.', tag: 'Parked' }
];

const tasks = [
  { title: 'Mission Control prototype', owner: 'Buddy', detail: 'Static dashboard UI, theme controls, logo controls, and simulated messaging.', progress: 72 },
  { title: 'Private backend wrapper', owner: 'Buddy', detail: 'Login, protected page/API, safe place for future OpenClaw/AgentBus bridge.', progress: 48 },
  { title: 'Daily briefing flow', owner: 'Crew', detail: 'Ask each agent for open loops and compress into one human-readable report.', progress: 35 }
];

const defaults = {
  bgA: '#040816', bgB: '#111a3b', bgAngle: 135,
  textA: '#f7fbff', textB: '#aebfff', textGlow: 34,
  accentA: '#2f86ff', accentB: '#ff4655', accentGlow: 58,
  logoOpacity: 16, logoSize: 78, cardOpacity: 62,
  logoUrl: 'assets/images/ls-star-rounded-gradient.png'
};

let state = loadTheme();
let selected = new Set(['buddy']);
let backendAvailable = false;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function loadTheme() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem('missionTheme') || '{}') }; }
  catch { return { ...defaults }; }
}

function saveTheme() { localStorage.setItem('missionTheme', JSON.stringify(state)); }

function applyTheme() {
  const root = document.documentElement;
  root.style.setProperty('--bg-a', state.bgA);
  root.style.setProperty('--bg-b', state.bgB);
  root.style.setProperty('--bg-angle', `${state.bgAngle}deg`);
  root.style.setProperty('--text-a', state.textA);
  root.style.setProperty('--text-b', state.textB);
  root.style.setProperty('--text-glow', state.textGlow);
  root.style.setProperty('--accent-a', state.accentA);
  root.style.setProperty('--accent-b', state.accentB);
  root.style.setProperty('--accent-glow', state.accentGlow);
  root.style.setProperty('--logo-opacity', String(Number(state.logoOpacity) / 100));
  root.style.setProperty('--logo-size', `${state.logoSize}vmin`);
  root.style.setProperty('--card-opacity', String(Number(state.cardOpacity) / 100));
  const backdropLogo = $('#backdropLogoImg');
  if (backdropLogo && state.logoUrl) backdropLogo.src = state.logoUrl;
  syncSettingsInputs();
}

function syncSettingsInputs() {
  $$('[data-setting]').forEach(input => {
    const key = input.dataset.setting;
    if (state[key] !== undefined) input.value = state[key];
  });
  const logoUrl = $('#logoUrl');
  if (logoUrl) logoUrl.value = state.logoUrl?.startsWith('data:') ? 'Custom uploaded image stored locally' : state.logoUrl;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function refreshAgents({ announce = false, keepSelection = true } = {}) {
  const previous = new Set(selected);
  const data = await api('/api/agents');
  if (!Array.isArray(data.agents)) return data;
  backendAvailable = true;
  document.body.classList.add('backend-connected');
  $('#modeReadout').textContent = data.openclaw?.enabled ? 'Live agents' : 'Private';
  $('#backendReadout').textContent = data.openclaw?.enabled ? 'OpenClaw live' : 'Connected';
  $('#connectionPill').innerHTML = '<i></i> Backend live';
  agents = data.agents.map(agent => ({
    ...agent,
    note: agent.currentWork || agent.note || 'Ready.'
  }));
  const routableAgents = agents.filter(agent => agent.routable !== false);
  selected = keepSelection
    ? new Set([...previous].filter(id => agents.some(agent => agent.id === id)))
    : new Set();
  if (!selected.size) selected.add((routableAgents[0] || agents[0])?.id || 'buddy');
  renderAgents();
  $('#crewReadout').textContent = `${routableAgents.length}/${agents.length} live`;
  if (announce) addBubble('Mission Control', `<b>Agent roster refreshed.</b> ${routableAgents.length} live agent${routableAgents.length === 1 ? '' : 's'} available.`);
  return data;
}

async function hydrateFromBackend() {
  try {
    const data = await refreshAgents({ keepSelection: false });
    await hydrateMessages();
    const liveNote = data.openclaw?.enabled
      ? '<b>Backend connected.</b> Live OpenClaw routing is enabled for mapped/discovered agents. Sends may take a few seconds because real agents are answering.'
      : '<b>Backend connected.</b> Login/API wrapper is active. Agent messages use safe prototype replies until OpenClaw/AgentBus routing is enabled.';
    addBubble('Mission Control', liveNote);
  } catch {
    backendAvailable = false;
    $('#modeReadout').textContent = 'Prototype';
    $('#backendReadout').textContent = 'Static UI';
    addBubble('Mission Control', '<b>Frontend prototype mode.</b> Open through the private backend to enable login/API routing.');
  }
}

async function hydrateMessages() {
  try {
    const data = await api('/api/messages');
    if (!Array.isArray(data.messages) || !data.messages.length) return;
    const transcript = $('#transcript');
    transcript.innerHTML = '';
    data.messages.slice().reverse().forEach(message => {
      const author = message.type === 'outbound'
        ? `${message.from} → ${message.recipients?.join(', ') || 'agents'}`
        : (message.from || message.agentId || 'Agent');
      addBubble(author, message.text || '', message.type === 'outbound' ? 'clint' : 'agent', false);
    });
  } catch {
    // Message history is a convenience; the dashboard still works without it.
  }
}

function renderAgents() {
  $('#agentCards').innerHTML = agents.map(agent => `
    <article class="agent-card ${agent.routable === false ? 'unmapped' : 'routable'}">
      <div class="avatar" aria-hidden="true">${escapeHtml(agent.emoji)}</div>
      <div class="agent-main">
        <strong>${escapeHtml(agent.name)}</strong>
        <small>${escapeHtml(agent.role)}</small>
        <small>${escapeHtml(agent.note || agent.currentWork || '')}</small>
      </div>
      <div class="agent-status"><b>${escapeHtml(agent.status)}</b><span>${escapeHtml(agent.mappedAgent || agent.id)}</span></div>
    </article>
  `).join('');

  $('#recipientRow').innerHTML = agents.map(agent => `
    <button class="recipient-chip ${selected.has(agent.id) ? 'active' : ''} ${agent.routable === false ? 'unmapped' : ''}" type="button" data-agent="${escapeHtml(agent.id)}" title="${escapeHtml(agent.routable === false ? 'Visible but not directly routed yet' : 'Live route available')}">${escapeHtml(agent.emoji)} ${escapeHtml(agent.name)}</button>
  `).join('') + '<button class="recipient-chip" type="button" data-agent="all">All live agents</button>';

  $$('.recipient-chip').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.agent;
    if (id === 'all') selected = new Set(agents.filter(a => a.routable !== false).map(a => a.id));
    else if (selected.has(id)) { selected.delete(id); if (!selected.size) selected.add(id); }
    else selected.add(id);
    renderAgents();
  }));
}

function renderProjects() {
  $('#projectGrid').innerHTML = projects.map(project => `
    <article class="project-card"><strong>${escapeHtml(project.name)}</strong><p>${escapeHtml(project.desc)}</p><span>${escapeHtml(project.tag)}</span></article>
  `).join('');
}

function renderTasks() {
  $('#taskList').innerHTML = tasks.map(task => `
    <article class="task-item"><strong>${escapeHtml(task.title)} · ${escapeHtml(task.owner)}</strong><p>${escapeHtml(task.detail)}</p><div class="progress-bar" aria-label="${task.progress}% complete"><span style="--progress:${task.progress}%"></span></div></article>
  `).join('');
}

function addBubble(author, text, type = 'agent', trustedHtml = true, id = '') {
  const transcript = $('#transcript');
  const bubble = document.createElement('div');
  bubble.className = `bubble ${type}`;
  if (id) bubble.dataset.bubbleId = id;
  bubble.innerHTML = `<small>${escapeHtml(author)}</small><p>${trustedHtml ? text : escapeHtml(text)}</p>`;
  transcript.prepend(bubble);
}

function removeBubble(id) {
  const bubble = document.querySelector(`[data-bubble-id="${CSS.escape(id)}"]`);
  if (bubble) bubble.remove();
}

async function sendMessage(textOverride) {
  const input = $('#messageInput');
  const text = (textOverride || input.value).trim();
  if (!text) return;
  const recipients = agents.filter(a => selected.has(a.id));
  const names = recipients.map(a => a.name);
  addBubble('Clint → ' + names.join(', '), text, 'clint', false);
  input.value = '';

  if (backendAvailable) {
    try {
      const pendingId = `pending-${Date.now()}`;
      addBubble('Mission Control', `Sending to ${escapeHtml(names.join(', '))}…`, 'agent', false, pendingId);
      const data = await api('/api/message', {
        method: 'POST',
        body: JSON.stringify({ recipients: recipients.map(a => a.id), message: text })
      });
      removeBubble(pendingId);
      (data.replies || []).forEach(reply => addBubble(reply.from || reply.agentId || 'Agent', reply.text || '', 'agent', false));
      return;
    } catch (err) {
      addBubble('Mission Control', `<b>Backend send failed:</b> ${escapeHtml(err.message)}. Falling back to local prototype reply.`);
    }
  }

  setTimeout(() => {
    names.forEach((name, idx) => {
      setTimeout(() => addBubble(name, '<b>Prototype reply:</b> I received the Mission Control command. When the backend bridge is connected, this would become a live agent response routed back here.'), idx * 180);
    });
  }, 260);
}

function setupSettings() {
  $('#settingsBtn').addEventListener('click', () => $('#settingsPanel').showModal());
  $$('[data-setting]').forEach(input => input.addEventListener('input', () => {
    const key = input.dataset.setting;
    state[key] = input.type === 'range' ? Number(input.value) : input.value;
    applyTheme();
    saveTheme();
  }));

  $('#logoFile').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { state.logoUrl = reader.result; applyTheme(); saveTheme(); };
    reader.readAsDataURL(file);
  });

  $('#logoUrl').addEventListener('change', (event) => {
    const value = event.target.value.trim();
    if (!value || value === 'Custom uploaded image stored locally') return;
    state.logoUrl = value;
    applyTheme();
    saveTheme();
  });

  $('#resetThemeBtn').addEventListener('click', () => {
    state = { ...defaults };
    saveTheme();
    applyTheme();
  });
}

function setupActions() {
  $('#sendBtn').addEventListener('click', () => sendMessage());
  $('#messageInput').addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') sendMessage();
  });
  $('#refreshAgentsBtn').addEventListener('click', async () => {
    try {
      await refreshAgents({ announce: true });
    } catch (err) {
      addBubble('Mission Control', `<b>Refresh failed:</b> ${escapeHtml(err.message)}`);
    }
  });
  $('#allBtn').addEventListener('click', () => {
    selected = new Set(agents.filter(a => a.routable !== false).map(a => a.id));
    renderAgents();
    sendMessage('Crew status check: what are you working on, what is blocked, and what needs Clint’s attention?');
  });
  $('#briefingBtn').addEventListener('click', () => {
    selected = new Set(agents.map(a => a.id));
    renderAgents();
    sendMessage('Generate a daily briefing: summarize useful work, open loops, and the next best thing for Clint to look at.');
  });
  $('#clearLogBtn').addEventListener('click', () => $('#transcript').innerHTML = '');
}

applyTheme();
renderAgents();
renderTasks();
renderProjects();
setupSettings();
setupActions();
hydrateFromBackend();
