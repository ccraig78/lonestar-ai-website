const painPoints = {
  repeat: {
    label: 'Useful workflow example',
    title: 'FAQ Assistant',
    copy: 'Answers common customer questions from approved business info, then points people toward the right next step.',
    price: 'Included in the AI Advantage Package — starting at $1,997',
    note: 'A simple one-workflow setup can still start at $497 when a smaller first step fits better.',
    customer: 'Are you open Saturday, and what do I need to send to get started?',
    assistant: 'Yes — Saturday hours are 9:00 AM to 1:00 PM. To get started, please send your name, phone number, what you need help with, and 2–3 photos if photos would help the owner review it.',
    owner: 'Customer asked about Saturday hours and how to get started. Assistant answered the hours, requested contact info, and asked for helpful photos before owner review.'
  },
  details: {
    label: 'Best fit when leads are vague',
    title: 'Lead Intake Assistant',
    copy: 'Collects the details the owner needs before calling back: name, phone, service need, photos, location, timeline, and missing information.',
    price: 'Included in the AI Advantage Package — starting at $1,997',
    note: 'Bundled with FAQ, callback help, website chat, drafts, owner summaries, training, and one tune-up.',
    customer: 'Can I get a price on this job?',
    assistant: 'I can help the owner review it faster. What service do you need, what city are you in, when do you need it done, and can you send 2–3 photos? Please include your name and best callback number too.',
    owner: 'Price request captured with service type, city, timing, photos requested, name, and callback number — fewer missing details before the owner responds.'
  },
  reply: {
    label: 'Good first step for missed calls',
    title: 'Callback Request Helper',
    copy: 'Collects missed-call details, urgency, reason for calling, and best callback time so the owner can respond without losing the lead.',
    price: 'Included in the AI Advantage Package — starting at $1,997',
    note: 'For launch, the practical first step is website chat and callback-request capture. Full AI receptionist service is not offered at launch.',
    customer: 'My phone rings constantly and I miss real customers. Can AI help?',
    assistant: 'Yes. The assistant can collect name, number, reason for calling, urgency, and best callback time, then send the owner a clean summary instead of letting the opportunity disappear.',
    owner: 'Missed-call lead captured: customer contact info, reason for calling, urgency, and callback timing are organized for owner follow-up.'
  },
  followup: {
    label: 'Best for owner organization',
    title: 'Follow-Up Helper',
    copy: 'Drafts polite follow-up messages and helps organize which leads, quotes, and open opportunities need attention.',
    price: 'Included in the AI Advantage Package — starting at $1,997',
    note: 'Best when combined with lead tracking, owner summaries, and draft-based follow-up workflows.',
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
    `${data.get('notes') || ''}`,
    '',
    'Website assistant lead context:',
    `${sessionStorage.getItem('lonestarChatLead') || 'No website assistant questions captured in this session.'}`
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
const chatName = document.querySelector('[data-chat-name]');
const chatContact = document.querySelector('[data-chat-contact]');
const chatBusiness = document.querySelector('[data-chat-business]');
const chatIndustry = document.querySelector('[data-chat-industry]');
const chatWebsite = document.querySelector('[data-chat-website]');
const chatFollowup = document.querySelector('[data-chat-followup]');

const GUIDE_CAPTURE_ENDPOINT = (() => {
  try {
    const params = new URLSearchParams(window.location.search);
    return window.LONESTAR_GUIDE_CAPTURE_ENDPOINT
      || params.get('guideCaptureEndpoint')
      || localStorage.getItem('lonestarGuideCaptureEndpoint')
      || 'https://chat.lonestaraiassistants.com/lonestar-guide-capture';
  } catch (_) {
    return window.LONESTAR_GUIDE_CAPTURE_ENDPOINT || 'https://chat.lonestaraiassistants.com/lonestar-guide-capture';
  }
})();

const guideSessionId = (() => {
  try {
    const existing = sessionStorage.getItem('lonestarGuideSessionId');
    if (existing) return existing;
    const generated = `ls-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem('lonestarGuideSessionId', generated);
    return generated;
  } catch (_) {
    return `ls-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
})();

const featureMatches = [
  {
    feature: 'Customer FAQ Assistant',
    triggers: ['faq', 'same question', 'repeat question', 'common question', 'answer questions', 'hours', 'open', 'policy', 'service area', 'what do i need', 'basic questions'],
    summary: 'answers approved repeat customer questions and sends unsure questions to the owner instead of guessing.'
  },
  {
    feature: 'Email Assistant',
    triggers: ['email', 'inbox', 'emails', 'reply to email', 'email summary', 'sort email', 'customer emails'],
    summary: 'reviews incoming emails, summarizes them, classifies what matters, and drafts owner-approved replies.'
  },
  {
    feature: 'Lead Inquiry Tracking',
    triggers: ['track leads', 'lead tracker', 'spreadsheet', 'crm', 'lead list', 'organize leads', 'lost leads', 'lead status'],
    summary: 'turns customer inquiries into clean lead tracker rows with source, status, notes, and next step.'
  },
  {
    feature: 'Website Content Update Assistant',
    triggers: ['update website', 'website copy', 'site content', 'change my website', 'service page', 'homepage copy', 'web content'],
    summary: 'drafts owner-approved website copy updates for services, FAQs, contact pages, and landing pages before publishing.'
  },
  {
    feature: 'Social Media Draft Assistant',
    triggers: ['facebook post', 'social media', 'instagram', 'post ideas', 'content calendar', 'caption', 'ad copy', 'marketing post'],
    summary: 'drafts social posts, captions, and simple promotional ideas in the business voice for owner review.'
  },
  {
    feature: 'Review Response Draft Assistant',
    triggers: ['review', 'google review', 'facebook review', 'bad review', 'respond to review', 'ratings', 'complaint response'],
    summary: 'drafts professional responses to public reviews and escalates serious complaints instead of arguing online.'
  },
  {
    feature: 'Business Document Organizer',
    triggers: ['organize files', 'organize documents', 'messy folders', 'file names', 'folder structure', 'paperwork', 'documents are scattered'],
    summary: 'helps plan and draft clearer organization for approved business files, folders, and document categories.'
  },
  {
    feature: 'Simple Reminder Check-In Workflow',
    triggers: ['remind me', 'reminders', 'check in', 'forget', 'weekly reminder', 'monthly reminder', 'follow up reminder'],
    summary: 'creates simple approved reminders or check-ins so owners remember recurring tasks and open items.'
  },
  {
    feature: 'Internal Document Search Assistant',
    triggers: ['search documents', 'find documents', 'sop', 'manual', 'policies', 'knowledge base', 'staff questions', 'internal docs'],
    summary: 'helps staff find answers from approved manuals, SOPs, policies, notes, and documents with source boundaries.'
  },
  {
    feature: 'After-Hours Voice FAQ / Lead Capture',
    status: 'coming-soon',
    triggers: ['answer phones', 'phone answering', 'answer calls', 'after hours calls', 'voice agent', 'receptionist', 'calls at night', 'phone rings', 'rings constantly', 'miss calls', 'missed calls', 'miss real customers', 'busy phone', 'call triage', 'call and text triage', 'text triage'],
    summary: 'is planned as an after-hours phone FAQ and lead-capture feature after LoneStar proves the workflow internally. Full AI receptionist service is not offered at launch.'
  },
  {
    feature: 'Appointment Scheduling Reminder Assistant',
    triggers: ['appointment', 'schedule', 'calendar', 'booking', 'reschedule', 'confirm appointment', 'appointment reminder'],
    summary: 'collects scheduling requests, checks missing information, and drafts confirmations or reminders for approval.'
  },
  {
    feature: 'Quote Estimate Drafting Assistant',
    triggers: ['quote', 'estimate', 'pricing', 'price request', 'how much', 'bid', 'cost to', 'rough estimate'],
    summary: 'collects the details needed before a quote and drafts an estimate summary without making unapproved final pricing promises.'
  },
  {
    feature: 'Customer Follow-Up Sequence',
    triggers: ['follow up', 'leads go cold', 'sequence', 'nurture', 'check back', 'not responding', 'follow-up messages'],
    summary: 'drafts timed follow-up messages and stop rules so interested customers do not fall through the cracks.'
  },
  {
    feature: 'Job Intake Assistant',
    triggers: ['job intake', 'new job', 'work order', 'job details', 'customer details', 'photos', 'intake form', 'start a job'],
    summary: 'collects structured job details, missing information, photos/notes, and an internal summary before the owner reviews.'
  },
  {
    feature: 'Website Contact Form Lead Routing',
    triggers: ['contact form', 'website form', 'form submissions', 'route leads', 'notify owner', 'web lead', 'form lead'],
    summary: 'routes website contact-form submissions into owner notifications, draft replies, and lead-tracker handoff steps.'
  },
  {
    feature: 'Photo Job Summary Generation',
    triggers: ['photos', 'pictures', 'photo summary', 'before and after', 'job photos', 'image notes', 'photo updates'],
    summary: 'turns approved job photos and notes into internal summaries, customer update drafts, or social/website draft copy.'
  },
  {
    feature: 'Multi-Agent Role Workflow',
    triggers: ['multiple agents', 'team of agents', 'handoff', 'roles', 'manager agent', 'agent workflow', 'approval gates'],
    summary: 'plans clear handoffs between specialized assistants with defined roles, permissions, and owner approval gates.'
  },
  {
    feature: 'Business Dashboard Report Summary',
    triggers: ['dashboard', 'report', 'summary report', 'business summary', 'daily report', 'weekly report', 'owner report', 'metrics'],
    summary: 'summarizes leads, follow-ups, appointments, website activity, priorities, and data gaps into an owner-ready report.'
  },
  {
    feature: 'Local SEO / Service Page Assistant',
    triggers: ['seo', 'local seo', 'google search', 'rank on google', 'service page', 'near me', 'google business profile', 'gbp', 'meta title'],
    summary: 'reviews local search opportunities and drafts service-page, FAQ, title/meta, internal-link, and Google Business Profile recommendations.'
  }
];

const chatLead = { questions: [], matchedFeatures: [], intentLevels: [] };

function addChatBubble(message, role = 'assistant') {
  if (!chatWindow) return;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = message;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function prospectContext() {
  return {
    name: chatName?.value.trim() || '',
    contact: chatContact?.value.trim() || '',
    business: chatBusiness?.value.trim() || '',
    industry: chatIndustry?.value.trim() || '',
    website: chatWebsite?.value.trim() || '',
    permissionToFollowUp: Boolean(chatFollowup?.checked)
  };
}

function contextLeadIn() {
  const { business, industry } = prospectContext();
  if (business && industry) return `For ${business} (${industry}),`;
  if (business) return `For ${business},`;
  if (industry) return `For a ${industry} business,`;
  return 'Based on that problem,';
}

function scoreFeature(feature, question) {
  const q = question.toLowerCase();
  return feature.triggers.reduce((score, trigger) => {
    if (q.includes(trigger)) return score + 10 + Math.max(2, trigger.split(' ').length + 1);
    const words = trigger.split(/\s+/).filter((word) => word.length > 3);
    return score + words.filter((word) => q.includes(word)).length;
  }, 0);
}

function matchFeature(question) {
  const scored = featureMatches
    .map((feature) => ({ ...feature, score: scoreFeature(feature, question) }))
    .sort((a, b) => b.score - a.score);

  if (scored[0]?.score > 0) return scored[0];
  return {
    feature: 'Customer FAQ Assistant',
    summary: 'is the most practical first match when a visitor asks a broad question because it answers approved common questions and escalates anything uncertain.'
  };
}

function classifyIntent(question, match, context) {
  const q = question.toLowerCase();
  const hasContact = Boolean(context.contact || context.name);
  const askedForHelp = /demo|call|contact|help me|talk|hire|start|setup|set up|quote|price|pricing|cost|interested|follow up|consult|review/.test(q);
  const spam = /crypto|casino|porn|loan|backlink|seo spam|viagra/.test(q);
  const contentGap = /how does|what happens|included|not included|privacy|data|wrong|mistake|contract|cancel|timeline|how long/.test(q);
  const featureSignal = match?.status === 'coming-soon' || /phone|sms|crm|payment|schedule|calendar|integration|voice|dashboard|automation/.test(q);

  if (spam) return 'Support/noise/spam';
  if (hasContact && (context.permissionToFollowUp || askedForHelp)) return 'Lead — follow up now';
  if (featureSignal) return 'Feature signal';
  if (contentGap) return 'FAQ/content gap';
  if (askedForHelp || context.business || context.website) return 'Warm interest — review soon';
  return 'Warm interest — review soon';
}

function followUpStatusFor(intentLevel, context) {
  if (intentLevel === 'Support/noise/spam') return 'spam';
  if (intentLevel === 'Lead — follow up now') return 'new';
  if (context.contact || context.name) return 'needs_review';
  return 'no_contact_info';
}

function nextActionFor(intentLevel, context) {
  if (intentLevel === 'Lead — follow up now') return 'Clint/Codi review and follow up.';
  if (intentLevel === 'FAQ/content gap') return 'Review for website FAQ/copy improvement.';
  if (intentLevel === 'Feature signal') return 'Review for future offer or add-on signal.';
  if (context.business || context.website) return 'Review business context; invite contact info if useful.';
  return 'Include in daily Stella log review.';
}

function summarizeAnswer(answer) {
  return String(answer || '').replace(/\s+/g, ' ').trim().slice(0, 280);
}

function rememberInteraction(question, feature, answer) {
  const context = prospectContext();
  const intentLevel = classifyIntent(question, feature, context);
  chatLead.name = context.name || chatLead.name || '';
  chatLead.contact = context.contact || chatLead.contact || '';
  chatLead.business = context.business || chatLead.business || '';
  chatLead.industry = context.industry || chatLead.industry || '';
  chatLead.website = context.website || chatLead.website || '';
  chatLead.permissionToFollowUp = context.permissionToFollowUp || chatLead.permissionToFollowUp || false;
  chatLead.questions.push(question);
  if (feature?.feature) chatLead.matchedFeatures.push(feature.feature);
  chatLead.intentLevels.push(intentLevel);
  try {
    sessionStorage.setItem('lonestarChatLead', JSON.stringify(chatLead));
  } catch (_) {}
  return {
    context,
    intentLevel,
    followUpStatus: followUpStatusFor(intentLevel, context),
    nextAction: nextActionFor(intentLevel, context),
    contentGapFlag: intentLevel === 'FAQ/content gap',
    featureSignalFlag: intentLevel === 'Feature signal',
    stellaAnswerSummary: summarizeAnswer(answer),
    assignedTo: intentLevel === 'Lead — follow up now' ? 'Clint/Codi' : 'Codi/Buddy daily review'
  };
}

function captureGuideInteraction({ question, answer, match, leadMeta }) {
  if (!GUIDE_CAPTURE_ENDPOINT) return;
  const payload = {
    source: 'stella-website-assistant',
    assistantName: 'Stella',
    sessionId: guideSessionId,
    page: window.location.href,
    context: leadMeta.context,
    question,
    answer,
    stellaAnswerSummary: leadMeta.stellaAnswerSummary,
    matchedFeature: match?.feature || '',
    matchStatus: match?.status || '',
    matchScore: match?.score || null,
    intentLevel: leadMeta.intentLevel,
    permissionToFollowUp: leadMeta.context.permissionToFollowUp,
    contentGapFlag: leadMeta.contentGapFlag,
    featureSignalFlag: leadMeta.featureSignalFlag,
    assignedTo: leadMeta.assignedTo,
    followUpStatus: leadMeta.followUpStatus,
    nextAction: leadMeta.nextAction,
    allQuestionsThisSession: chatLead.questions,
    matchedFeaturesThisSession: chatLead.matchedFeatures,
    intentLevelsThisSession: chatLead.intentLevels,
    userAgent: navigator.userAgent
  };

  fetch(GUIDE_CAPTURE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {
    // Logging should never break the visitor-facing guide.
  });
}

function pricingReply() {
  return 'The recommended LoneStar offer is the Small Business AI Advantage Package, starting at $1,997. It bundles practical starter workflows like FAQ/business info, website chat, lead intake, callback requests, reply drafts, review/social/SEO drafts, owner summaries, training, and one tune-up. Monthly Assistant Care starts at $247/month for support and improvements. Very small one-workflow setups can still start at $497 when that fits better. Hosting, AI provider usage, SMS/phone, and advanced integrations are reviewed before launch so there are no surprise tech costs.';
}

function buildGuideResponse(question) {
  if (/cost|price|pricing|much|monthly|pay|charge|fee/.test(question.toLowerCase())) {
    return {
      match: { feature: 'Pricing / Package Question', score: 99 },
      answer: pricingReply()
    };
  }

  const match = matchFeature(question);
  const answer = match.status === 'coming-soon'
    ? `${contextLeadIn()} best future match: ${match.feature}. It ${match.summary} For launch, LoneStar can start with practical website chat, FAQ, lead intake, and callback-request capture so the owner stays in control.`
    : `${contextLeadIn()} best practical workflow match: ${match.feature}. It ${match.summary}`;
  return { match, answer };
}

function addFollowUpNudge(answer, leadMeta) {
  if (leadMeta.intentLevel === 'Lead — follow up now') {
    return `${answer}\n\nThanks — I’ll save this for LoneStar to review. Clint can follow up, and you can also email hello@lonestaraiassistants.com or call/text 214-470-8099 if you want to move faster.`;
  }
  if (!leadMeta.context.contact && leadMeta.intentLevel !== 'Support/noise/spam') {
    return `${answer}\n\nIf you want a practical recommendation for your business, leave your name and phone or email and check the follow-up box.`;
  }
  return answer;
}

function submitChatQuestion(question) {
  const clean = question.trim();
  if (!clean) return;
  const { match, answer: baseAnswer } = buildGuideResponse(clean);
  const leadMeta = rememberInteraction(clean, match, baseAnswer);
  const answer = addFollowUpNudge(baseAnswer, leadMeta);
  leadMeta.stellaAnswerSummary = summarizeAnswer(answer);
  addChatBubble(clean, 'user');
  addChatBubble(answer, 'assistant');
  captureGuideInteraction({ question: clean, answer, match, leadMeta });
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
