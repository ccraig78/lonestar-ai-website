const painPoints = {
  repeat: {
    label: 'Recommended first feature',
    title: 'FAQ Assistant',
    copy: 'Answers common customer questions from approved business info, then points people toward the right next step.',
    price: 'Base Assistant Setup — $500',
    note: 'Includes assistant foundation plus one starter feature.',
    customer: 'Are you open Saturday, and what do I need to send to get started?',
    assistant: 'Yes — Saturday hours are 9:00 AM to 1:00 PM. To get started, please send your name, phone number, what you need help with, and 2–3 photos if photos would help the owner review it.',
    owner: 'Customer asked about Saturday hours and how to get started. Assistant answered the hours, requested contact info, and asked for helpful photos before owner review.'
  },
  details: {
    label: 'Best fit when leads are vague',
    title: 'Lead Intake Assistant',
    copy: 'Collects the details the owner needs before calling back: name, phone, service need, photos, location, timeline, and missing information.',
    price: 'Often best in the $899 Starter Web Assistant Pack',
    note: 'Base setup is counted once. Lead intake can be bundled with FAQ, callback help, and website chat.',
    customer: 'Can I get a price on this job?',
    assistant: 'I can help the owner review it faster. What service do you need, what city are you in, when do you need it done, and can you send 2–3 photos? Please include your name and best callback number too.',
    owner: 'Price request captured with service type, city, timing, photos requested, name, and callback number — fewer missing details before the owner responds.'
  },
  reply: {
    label: 'Good first step for missed calls',
    title: 'Callback Request Helper',
    copy: 'Gives customers a simple way to request a call back and tells the owner why they called, how urgent it is, and when to respond.',
    price: 'Base Assistant Setup — $500',
    note: 'Can be the included starter feature. AI phone answering is advanced and quoted after review.',
    customer: 'I called earlier but nobody answered. Can someone call me back today?',
    assistant: 'Yes. Please send your name, phone number, what you need help with, and the best time to call today. If this is urgent, tell me that too so the owner sees it clearly.',
    owner: 'Callback request captured: customer wants a call today. Assistant collected name, phone, reason for calling, preferred time, and urgency.'
  },
  followup: {
    label: 'Best for owner organization',
    title: 'Follow-Up Helper',
    copy: 'Drafts polite follow-up messages and helps organize which leads, quotes, and open opportunities need attention.',
    price: 'Standard workflow usually starts around $300–$500 after base setup',
    note: 'If combined with lead tracking and daily summaries, a value pack may be a better fit.',
    customer: 'I got a quote last week but I still have a question before I decide.',
    assistant: 'No problem. What name was the quote under, what question do you have, and what is the best phone or email for the owner to follow up? I’ll summarize it clearly for review.',
    owner: 'Follow-up needed on prior quote. Assistant captured the quote name, customer question, and best contact method so the owner can reply without digging through old messages.'
  }
};

function setPainPoint(key) {
  const data = painPoints[key] || painPoints.repeat;
  document.querySelectorAll('[data-pain]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.pain === key);
  });
  const select = document.querySelector('[data-pain-select]');
  if (select && select.value !== key) select.value = key;

  const set = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  set('[data-solution-label]', data.label);
  set('[data-solution-title]', data.title);
  set('[data-solution-copy]', data.copy);
  set('[data-solution-price]', data.price);
  set('[data-solution-note]', data.note);
  set('[data-demo-customer]', data.customer);
  set('[data-demo-assistant]', data.assistant);
  set('[data-demo-owner]', data.owner);
}

document.querySelectorAll('[data-pain]').forEach((btn) => {
  btn.addEventListener('click', () => setPainPoint(btn.dataset.pain));
});

document.querySelector('[data-pain-select]')?.addEventListener('change', (event) => {
  setPainPoint(event.target.value);
});

document.querySelector('[data-lead-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const lines = [
    'LoneStar AI demo request',
    '',
    `Name: ${data.get('name') || ''}`,
    `Business: ${data.get('business') || ''}`,
    `Email: ${data.get('email') || ''}`,
    `Phone: ${data.get('phone') || ''}`,
    `Need: ${data.get('need') || ''}`,
    '',
    'What customers ask / notes:',
    `${data.get('notes') || ''}`
  ];
  const subject = encodeURIComponent('LoneStar AI demo request');
  const body = encodeURIComponent(lines.join('\n'));
  window.location.href = `mailto:hello@lonestaraiassistants.com?subject=${subject}&body=${body}`;
});

const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('[data-menu-toggle]');
const primaryNav = document.querySelector('[data-primary-nav]');

function setMenuOpen(isOpen) {
  siteHeader?.classList.toggle('menu-open', isOpen);
  menuToggle?.setAttribute('aria-expanded', String(isOpen));
  menuToggle?.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
}

menuToggle?.addEventListener('click', () => {
  const isOpen = siteHeader?.classList.contains('menu-open') || false;
  setMenuOpen(!isOpen);
});

primaryNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

const chatForm = document.querySelector('[data-chat-form]');
const chatInput = document.querySelector('[data-chat-input]');
const chatWindow = document.querySelector('[data-chat-window]');
const chatBusiness = document.querySelector('[data-chat-business]');
const chatIndustry = document.querySelector('[data-chat-industry]');

function addChatBubble(message, role = 'assistant') {
  if (!chatWindow) return;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = message;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function contextLine() {
  const business = chatBusiness?.value.trim();
  const industry = chatIndustry?.value.trim();
  if (business && industry) return ` For ${business} (${industry}), `;
  if (business) return ` For ${business}, `;
  if (industry) return ` For a ${industry} business, `;
  return ' ';
}

function lonestarReply(question) {
  const q = question.toLowerCase();
  const context = contextLine();

  if (/lead|quote|customer info|details|capture|form/.test(q)) {
    return `${context}a strong first workflow is a lead intake assistant. It can ask the customer what they need, collect name/phone/email, location, timing, photos or job details, then send the owner a clean summary instead of a vague “how much?” message. This usually fits the Starter Web Assistant Pack when paired with FAQ and callback help.`;
  }

  if (/faq|question|answer|hours|price|pricing|service|open|customer support|support/.test(q)) {
    return `${context}the FAQ assistant is usually the cleanest starter feature. It answers approved questions about services, hours, process, what info to send, and next steps. When it does not know something, it should collect the customer's contact info and hand the question to the owner instead of guessing.`;
  }

  if (/follow|review|cold|remind|message|text|email/.test(q)) {
    return `${context}a follow-up helper can draft polite messages, organize open leads, and remind the owner who still needs a response. This is useful when quotes, calls, and messages get scattered across the day.`;
  }

  if (/call|callback|phone|missed|answering/.test(q)) {
    return `${context}a callback request helper can collect who called, what they need, how urgent it is, and the best time to call back. Full AI phone answering is more advanced, but callback capture is a practical starter workflow.`;
  }

  if (/cost|price|pricing|much|monthly|pay/.test(q)) {
    return `LoneStar usually starts with Base Assistant Setup at $500, which includes the assistant foundation and one starter feature. The Starter Web Assistant Pack is $899 for a stronger first bundle. Monthly Assistant Care starts at $97/month. Hosting, AI provider usage, SMS/phone, and advanced integrations are reviewed before launch so there are no surprise tech costs.`;
  }

  if (/website|site|look at|analyze|review/.test(q)) {
    return `${context}the future version of this guide should be able to review a business website and suggest specific assistant ideas. This starter website version does not browse live websites yet, but a good first review would look for repeat questions, missing lead details, service pages, contact friction, quote requests, and follow-up gaps.`;
  }

  if (/auto|repair|collision|truck|bed|shop|salon|restaurant|roofer|plumb|hvac|contractor|lawn|service/.test(q)) {
    return `${context}I would look for three starter opportunities: 1) answer repeat customer questions, 2) capture better lead details before the owner calls back, and 3) summarize requests so nothing gets lost. If the business already gets quote requests, lead intake is probably the first feature to demo.`;
  }

  return `${context}a practical LoneStar assistant usually starts with one of four workflows: FAQ answers, lead intake, callback requests, or follow-up help. Tell me whether the biggest problem is repeat questions, vague leads, missed calls, or slow follow-up, and I’ll point you to the best starter feature.`;
}

function submitChatQuestion(question) {
  const clean = question.trim();
  if (!clean) return;
  addChatBubble(clean, 'user');
  addChatBubble(lonestarReply(clean), 'assistant');
}

chatForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  submitChatQuestion(chatInput?.value || '');
  if (chatInput) chatInput.value = '';
});

document.querySelectorAll('[data-chat-prompt]').forEach((button) => {
  button.addEventListener('click', () => submitChatQuestion(button.dataset.chatPrompt || button.textContent || ''));
});

setPainPoint('repeat');
