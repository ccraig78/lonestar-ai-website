const painPoints = {
  repeat: {
    label: 'Recommended first feature',
    title: 'FAQ Assistant',
    copy: 'Answers common customer questions from approved business info, then points people toward the next step.',
    price: 'Base Assistant Setup — $500',
    note: 'Includes assistant foundation plus one starter feature.',
    customer: 'Are you open Saturday and what do I need to send for a quote?',
    assistant: 'Yes — I can help with the first step. Please send your name, phone number, a few photos, and a short description of what you need so the owner can review it.',
    owner: 'New lead summary: customer asked about Saturday availability and quote requirements. Photos and contact info requested.'
  },
  details: {
    label: 'Best fit when leads are vague',
    title: 'Lead Intake Assistant',
    copy: 'Collects the details the owner needs before calling back: name, phone, service need, photos, location, timeline, and missing information.',
    price: 'Often best in the $899 Starter Web Assistant Pack',
    note: 'Base setup is counted once. Lead intake can be bundled with FAQ, callback help, and website chat.',
    customer: 'Can I get a price on this job?',
    assistant: 'I can help gather the details for the owner. What type of job is it, where are you located, when do you need it done, and can you upload a few photos?',
    owner: 'New lead summary: customer wants pricing. Job type, location, timeline, photos, and callback details collected before owner review.'
  },
  reply: {
    label: 'Good first step for missed calls',
    title: 'Callback Request Helper',
    copy: 'Gives customers a simple way to request a call back and tells the owner why they called, how urgent it is, and when to respond.',
    price: 'Base Assistant Setup — $500',
    note: 'Can be the included starter feature. AI phone answering is advanced and quoted after review.',
    customer: 'I tried calling. Can someone call me back?',
    assistant: 'Yes. Please share your name, phone number, what you need help with, and your preferred callback time. If it is urgent, tell me that too.',
    owner: 'Callback request: customer needs help, preferred call time provided, urgency captured, reason for call summarized.'
  },
  followup: {
    label: 'Best for owner organization',
    title: 'Follow-Up Helper',
    copy: 'Drafts polite follow-up messages and helps organize which leads, quotes, and open opportunities need attention.',
    price: 'Standard workflow usually starts around $300–$500 after base setup',
    note: 'If combined with lead tracking and daily summaries, a value pack may be a better fit.',
    customer: 'I never heard back about my quote.',
    assistant: 'I can help prepare a follow-up for the owner. What name was the quote under, what was the job, and what is the best number or email to reach you?',
    owner: 'Follow-up needed: prior quote lead returned. Customer contact info and job context captured so the owner can respond cleanly.'
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

setPainPoint('repeat');
