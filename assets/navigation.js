// An in-flow disclosure menu: normal navigation remains available without JS.
(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('navToggle');
  const navigation = document.getElementById('site-navigation');
  if (!header || !toggle || !navigation) return;
  const mobile = matchMedia('(max-width: 650px)');

  function setOpen(open, restoreFocus = false) {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (restoreFocus) toggle.focus();
  }

  toggle.hidden = false;
  header.classList.add('navigation-ready');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) navigation.querySelector('a')?.focus();
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  mobile.addEventListener('change', () => setOpen(false));
})();
