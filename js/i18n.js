const SUPPORTED = ['el', 'en', 'it', 'de'];
const DEFAULT = 'el';
const STORAGE_KEY = 'pp:lang';

const LABELS = { el: 'EL', en: 'EN', it: 'IT', de: 'DE' };

function resolveInitialLang() {
  const qs = new URLSearchParams(location.search).get('lang');
  if (qs && SUPPORTED.includes(qs)) return qs;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch {}

  const nav = (navigator.language || '').slice(0, 2).toLowerCase();
  if (SUPPORTED.includes(nav)) return nav;

  return DEFAULT;
}

function getKey(dict, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
}

async function loadDict(lang) {
  const res = await fetch(`/i18n/${lang}.json`, { cache: 'default' });
  if (!res.ok) throw new Error(`i18n: failed to load ${lang}`);
  return res.json();
}

function applyDict(dict) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const raw = el.dataset.i18n;
    const isHtml = raw.startsWith('[html]');
    const key = raw.replace(/^\[html\]/, '');
    const value = getKey(dict, key);
    if (value == null) return;
    if (isHtml) el.innerHTML = value;
    else el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const spec = el.dataset.i18nAttr;
    spec.split(',').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim());
      const value = getKey(dict, key);
      if (value != null) el.setAttribute(attr, value);
    });
  });
}

async function setLanguage(lang) {
  if (!SUPPORTED.includes(lang)) lang = DEFAULT;

  let dict;
  try {
    dict = await loadDict(lang);
  } catch {
    if (lang === DEFAULT) return;
    dict = await loadDict(DEFAULT);
    lang = DEFAULT;
  }

  document.documentElement.lang = lang;
  applyDict(dict);

  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) {
    const map = { el: 'el_GR', en: 'en_US', it: 'it_IT', de: 'de_DE' };
    ogLocale.setAttribute('content', map[lang] || map[DEFAULT]);
  }

  const label = document.querySelector('[data-lang-label]');
  if (label) label.textContent = LABELS[lang];

  document.querySelectorAll('#lang-menu [data-lang]').forEach(btn => {
    btn.setAttribute('aria-current', String(btn.dataset.lang === lang));
  });

  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}

  document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang } }));
}

function wireSwitcher() {
  const toggle = document.querySelector('.lang-switcher__current');
  const menu = document.getElementById('lang-menu');
  if (!toggle || !menu) return;

  const close = () => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    menu.hidden ? open() : close();
  });

  menu.addEventListener('click', e => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    setLanguage(btn.dataset.lang);
    close();
  });

  document.addEventListener('click', e => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== toggle) close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) { close(); toggle.focus(); }
  });
}

export function initI18n() {
  wireSwitcher();
  setLanguage(resolveInitialLang());
}
