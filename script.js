/* ============================================================
   Abdur Rafay — portfolio behaviour
   Four small jobs, no dependencies:
     1. theme toggle (persisted)
     2. scroll spy for the rail
     3. reveal-on-scroll
     4. reading progress bar
   Anchor scrolling is CSS (scroll-behavior + scroll-padding-top).
   ============================================================ */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Theme ──────────────────────────────────────────── */
  const toggle = document.getElementById('theme-toggle');

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.content = theme === 'dark' ? '#08090a' : '#fbfbfa';
  };

  applyTheme(root.getAttribute('data-theme') || 'dark');

  toggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
  });

  /* ── 2. Scroll spy ─────────────────────────────────────── */
  const links = [...document.querySelectorAll('.rail__nav a')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const visible = new Set();

    const setActive = () => {
      // The topmost section currently on screen wins.
      let current = null;
      for (const section of sections) {
        if (visible.has(section)) { current = section; break; }
      }
      links.forEach((link) => {
        const isActive = current !== null && link.getAttribute('href') === '#' + current.id;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };

    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      setActive();
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => spy.observe(section));
  }

  /* ── 3. Reveal on scroll ───────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    reveals.forEach((el) => revealer.observe(el));
  }

  /* ── 4. Reading progress ───────────────────────────────── */
  const bar = document.getElementById('progress-bar');

  if (bar) {
    let queued = false;
    const paint = () => {
      const scrollable = document.documentElement.scrollHeight - innerHeight;
      const ratio = scrollable > 0 ? scrollY / scrollable : 0;
      bar.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
      queued = false;
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    };

    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    paint();
  }
})();
