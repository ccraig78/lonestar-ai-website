const painPoints = {
  repeat: {
    label: 'Best fit when your site is hard to update',
    title: 'Website Update Assistant',
    copy: 'Helps turn plain-English requests into owner-approved website changes: hours, services, specials, photos, page copy, and FAQs.',
    price: 'Included in the Website Control Package — starting at $1,997',
    note: 'A smaller focused setup can still start at $497 when you only need one website-control improvement first.',
    customer: 'Can you change our Saturday hours and add a spring special to the homepage?',
    assistant: 'Yes — I can help draft the hours update, homepage special, and mobile-friendly wording for owner approval before it goes live.',
    owner: 'Website update request captured: Saturday hours, spring special, homepage placement, and approval needed before publishing.'
  },
  details: {
    label: 'Best fit when website leads are vague',
    title: 'Website Lead Capture Assistant',
    copy: 'Turns website visitors into clearer requests by asking for name, phone/email, service need, timeline, location, photos, or other details the owner needs.',
    price: 'Included in the Website Control Package — starting at $1,997',
    note: 'Bundled with website updates, FAQ/business info, local SEO help, owner summaries, training, and one tune-up.',
    customer: 'Can I get a price for this job?',
    assistant: 'I can help the owner review it faster. What service do you need, what city are you in, when do you need it done, and what is the best callback number?',
    owner: 'Website lead captured with service type, city, timing, and callback number — fewer missing details before the owner responds.'
  },
  reply: {
    label: 'Best fit for repeat website questions',
    title: 'Website FAQ Assistant',
    copy: 'Answers common website questions from approved business info, then routes unsure or sensitive questions to the owner instead of guessing.',
    price: 'Included in the Website Control Package — starting at $1,997',
    note: 'For launch, this works best as website chat/FAQ support with owner-approved information and clear escalation rules.',
    customer: 'Are you open Saturday, and do I need an appointment?',
    assistant: 'Yes — Saturday hours are 9:00 AM to 1:00 PM. Appointments are recommended for faster service. I can collect your name and best contact number for the owner.',
    owner: 'FAQ interaction captured: customer asked about Saturday hours and appointments; assistant answered approved info and offered to collect contact details.'
  },
  followup: {
    label: 'Best fit for Google/search clarity',
    title: 'Local SEO Improvement Assistant',
    copy: 'Reviews local search opportunities and drafts service-page, FAQ, title/meta, internal-link, and Google Business Profile recommendations with honest expectations.',
    price: 'Included in the Website Control Package — starting at $1,997',
    note: 'SEO help improves website content and structure, but LoneStar does not guarantee a #1 ranking.',
    customer: 'Can you help us show up better for brake repair near Oak Cliff?',
    assistant: 'Yes — I can suggest clearer service-page wording, FAQs, page title/description ideas, and local signals that help customers and Google understand the service area.',
    owner: 'SEO improvement idea captured: brake repair near Oak Cliff, service-page copy, FAQ opportunities, and local metadata recommendations.'
  }
}

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
    'LoneStar AI website control demo request',
    '',
    `Name: ${data.get('name') || ''}`,
    `Business: ${data.get('business') || ''}`,
    `Email: ${data.get('email') || ''}`,
    `Phone: ${data.get('phone') || ''}`,
    `Need: ${data.get('need') || ''}`,
    '',
    'Website changes or notes:',
    `${data.get('notes') || ''}`,
    '',
    'Website assistant lead context:',
    `${sessionStorage.getItem('lonestarChatLead') || 'No website assistant questions captured in this session.'}`
  ];
  const subject = encodeURIComponent('LoneStar AI website control demo request');
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
    feature: 'Website Control / Update Assistant',
    triggers: ['update website', 'website copy', 'site content', 'change my website', 'change website', 'website by text', 'text my website', 'website control', 'control my website', 'site control', 'service page', 'homepage copy', 'web content', 'hours', 'specials', 'photos'],
    summary: 'turns plain-English website requests into owner-approved updates for services, hours, specials, FAQs, contact pages, and landing pages before publishing.'
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
    feature: 'Website SEO / Service Page Assistant',
    triggers: ['seo', 'local seo', 'google search', 'rank on google', 'service page', 'near me', 'google business profile', 'gbp', 'meta title'],
    summary: 'reviews local search opportunities and drafts service-page, FAQ, title/meta, internal-link, and Google Business Profile recommendations.'
  }
];

const chatLead = { questions: [], matchedFeatures: [], intentLevels: [] };

function appendMessageWithHighlight(node, message, highlightText) {
  const text = String(message || '');
  if (!highlightText || !text.includes(highlightText)) {
    node.textContent = text;
    return;
  }

  const parts = text.split(highlightText);
  parts.forEach((part, index) => {
    if (part) node.appendChild(document.createTextNode(part));
    if (index < parts.length - 1) {
      const highlight = document.createElement('span');
      highlight.className = 'feature-highlight';
      highlight.textContent = highlightText;
      node.appendChild(highlight);
    }
  });
}

function addChatBubble(message, role = 'assistant', options = {}) {
  if (!chatWindow) return;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  appendMessageWithHighlight(bubble, message, role === 'assistant' ? options.highlightText : '');
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
    feature: 'Website Control / Update Assistant',
    summary: 'is the best starting point for most owners because it turns plain-English website requests into owner-approved updates and helps keep the site current.'
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
  if (intentLevel === 'Lead — follow up now') return 'Clint review and follow up; Codi may help triage/draft internally.';
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
    assignedTo: intentLevel === 'Lead — follow up now' ? 'Clint' : 'Codi/Buddy daily review'
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
  return 'The recommended LoneStar offer is the Small Business Website Control Package, starting at $1,997. It helps small business owners take control of their website with plain-English update requests, website improvements, FAQ/business info, lead capture, local SEO help, owner summaries, training, and one tune-up. Monthly Website Control Care starts at $247/month for ongoing access to the update assistant/service, light updates, troubleshooting, and content/SEO tune-ups. Very small focused setups can still start at $497 when that fits better. Major redesigns, hosting needs, AI provider usage, SMS/phone, and deep integrations are reviewed before launch so there are no surprise tech costs. SEO help improves content and structure, but nobody can honestly guarantee a #1 Google ranking.';
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
    ? `${contextLeadIn()} best future match: ${match.feature}. It ${match.summary} For launch, LoneStar starts with practical website control: update requests, website chat, FAQs, lead capture, and local SEO improvements while the owner stays in control.`
    : `${contextLeadIn()} best website-control match: ${match.feature}. It ${match.summary}`;
  return { match, answer };
}

function addFollowUpNudge(answer, leadMeta) {
  if (leadMeta.intentLevel === 'Lead — follow up now') {
    return `${answer}\n\nThanks — I’ll pass this to LoneStar AI so Clint can review it and follow up if appropriate. You can also reach LoneStar AI at hello@lonestaraiassistants.com or call/text 214-470-8099 if you want to move faster.`;
  }
  if (!leadMeta.context.contact && leadMeta.intentLevel !== 'Support/noise/spam') {
    return `${answer}\n\nIf you want a practical website-control recommendation for your business, leave your name and phone or email and check the follow-up box.`;
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
  const highlightText = match?.feature && match.feature !== 'Pricing / Package Question' ? match.feature : '';
  addChatBubble(answer, 'assistant', { highlightText });
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
