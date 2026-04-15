const SCHEDULE = {
  0: [],
  1: [['08:00', '14:00'], ['17:30', '21:00']],
  2: [['08:00', '14:00'], ['17:30', '21:00']],
  3: [['08:00', '14:00'], ['17:30', '21:00']],
  4: [['08:00', '14:00'], ['17:30', '21:00']],
  5: [['08:00', '14:00'], ['17:30', '21:00']],
  6: [['08:30', '14:00']]
};

const toMins = hhmm => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

function athensNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Athens',
    hour12: false,
    weekday: 'short',
    hour: '2-digit', minute: '2-digit'
  }).formatToParts(new Date());

  const get = t => parts.find(p => p.type === t)?.value;
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const day = map[get('weekday')] ?? new Date().getDay();
  const hh = Number(get('hour'));
  const mm = Number(get('minute'));
  return { day, mins: hh * 60 + mm };
}

function formatHM(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function nextOpening({ day, mins }) {
  for (let offset = 0; offset < 7; offset++) {
    const d = (day + offset) % 7;
    const blocks = SCHEDULE[d];
    for (const [open] of blocks) {
      const o = toMins(open);
      if (offset === 0 && o <= mins) continue;
      return { day: d, mins: o, daysAhead: offset };
    }
  }
  return null;
}

export function currentStatus(nowOverride) {
  const { day, mins } = nowOverride ?? athensNow();
  for (const [open, close] of SCHEDULE[day]) {
    const o = toMins(open), c = toMins(close);
    if (mins >= o && mins < c) {
      const minsLeft = c - mins;
      return {
        state: minsLeft <= 30 ? 'closing' : 'open',
        closesAt: close,
        minsLeft
      };
    }
  }
  const next = nextOpening({ day, mins });
  return { state: 'closed', next };
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function render(pill, status, dict) {
  const textEl = pill.querySelector('[data-status-text]');
  if (!textEl) return;
  pill.setAttribute('data-status', status.state);

  const t = dict?.status ?? {};

  if (status.state === 'open') {
    const label = t.open_closes_at ?? `Ανοιχτά · κλείνει στις ${status.closesAt}`;
    textEl.textContent = label.replace('{{time}}', status.closesAt);
  } else if (status.state === 'closing') {
    const label = t.closing_soon ?? `Κλείνει σε ${status.minsLeft} λεπτά`;
    textEl.textContent = label.replace('{{mins}}', String(status.minsLeft));
  } else if (status.state === 'closed') {
    if (!status.next) {
      textEl.textContent = t.closed ?? 'Κλειστά';
      return;
    }
    const dayKey = DAY_KEYS[status.next.day];
    const dayLabel = t.days?.[dayKey] ?? dayKey;
    const timeStr = formatHM(status.next.mins);
    if (status.next.daysAhead === 0) {
      const label = t.closed_opens_today ?? `Κλειστά · ανοίγει στις ${timeStr}`;
      textEl.textContent = label.replace('{{time}}', timeStr);
    } else {
      const label = t.closed_opens_on ?? `Κλειστά · ανοίγει ${dayLabel} ${timeStr}`;
      textEl.textContent = label.replace('{{day}}', dayLabel).replace('{{time}}', timeStr);
    }
  }
}

let cachedDict = null;

async function fetchDict() {
  const lang = document.documentElement.lang || 'el';
  try {
    const res = await fetch(`i18n/${lang}.json`, { cache: 'default' });
    if (res.ok) return res.json();
  } catch {}
  return null;
}

async function tick() {
  const pills = document.querySelectorAll('[data-status-pill]');
  if (!pills.length) return;
  const status = currentStatus();
  cachedDict ??= await fetchDict();
  pills.forEach(p => render(p, status, cachedDict));

  const nextEl = document.querySelector('[data-status-next]');
  if (nextEl && status.state === 'closed' && status.next) {
    const dayKey = DAY_KEYS[status.next.day];
    const dayLabel = cachedDict?.status?.days?.[dayKey] ?? dayKey;
    nextEl.textContent = `Ανοίγει ${status.next.daysAhead === 0 ? '' : dayLabel + ' '}στις ${formatHM(status.next.mins)}`;
  } else if (nextEl) {
    nextEl.textContent = '';
  }
}

export function initLiveStatus() {
  tick();
  setInterval(tick, 60_000);
  document.addEventListener('i18n:change', () => {
    cachedDict = null;
    tick();
  });
}
