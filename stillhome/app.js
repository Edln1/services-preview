(() => {
  'use strict';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let storedMotion = null;
  try { storedMotion = localStorage.getItem('still-motion'); } catch {}
  let reduced = storedMotion === 'off' || (storedMotion === null && preference.matches);
  const motionButton = $('#motion-toggle');
  function applyMotion() {
    document.body.classList.toggle('reduce-motion', reduced);
    document.body.classList.toggle('force-motion', !reduced && !(!storedMotion && preference.matches));
    document.documentElement.style.scrollBehavior = reduced ? 'auto' : 'smooth';
    motionButton.setAttribute('aria-pressed', String(!reduced));
    motionButton.innerHTML = '<span aria-hidden="true">◉</span> Motion ' + (reduced ? 'off' : 'on');
  }
  applyMotion();
  motionButton.addEventListener('click', () => {
    reduced = !reduced; storedMotion = reduced ? 'off' : 'on';
    try { localStorage.setItem('still-motion', storedMotion); } catch {}
    applyMotion(); updateScroll();
  });
  preference.addEventListener('change', event => {
    if (storedMotion === null) { reduced = event.matches; applyMotion(); updateScroll(); }
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } });
  }, { threshold: .1 });
  $$('.reveal').forEach(element => observer.observe(element));
  const wordsHeading = $('.scroll-words');
  wordsHeading.textContent.trim().split(/\s+/).forEach((word, index) => {
    if (index === 0) wordsHeading.textContent = '';
    const span = document.createElement('span'); span.className = 'word'; span.textContent = word; wordsHeading.append(span, document.createTextNode(' '));
  });
  const words = $$('.word', wordsHeading);
  const photoShell = $('.hero-photo-shell');
  const photo = $('#hero-photo');
  const header = $('#header');
  let ticking = false;
  function updateScroll() {
    const height = innerHeight;
    header.classList.toggle('scrolled', scrollY > 35);
    if (!reduced) {
      const rect = photo.getBoundingClientRect();
      if (rect.bottom > -100 && rect.top < height + 100) {
        const progress = Math.max(0, Math.min(1, (height - rect.top) / (height + rect.height)));
        photoShell.style.setProperty('--photo-inset', Math.max(0, 25 * (1 - progress * 2)) + 'px');
        photo.style.setProperty('--photo-y', ((progress - .5) * 45) + 'px');
      }
    }
    const wordRect = wordsHeading.getBoundingClientRect();
    const litCount = Math.ceil(Math.max(0, Math.min(1, (height * .85 - wordRect.top) / (height * .42))) * words.length);
    words.forEach((word, index) => word.classList.toggle('lit', reduced || index < litCount));
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
  const menuButton = $('.menu-button');
  const mobileNav = $('#mobile-nav');
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    mobileNav.hidden = isOpen;
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', () => {
    mobileNav.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation');
  }));
  const rooms = {
    kitchen: { number: '01 / 03', image: 'kitchen.jpg', alt: 'A bright kitchen illustrating the spaces included in a clean', title: 'A kitchen you<br>want to come back to.', items: ['Worktops and accessible surfaces wiped', 'Sink and taps cleaned and polished', 'Appliance exteriors wiped down', 'Floors vacuumed and mopped', 'Rubbish emptied and bins refreshed'], note: 'Inside ovens, fridges and cabinets? Just ask. Extras are quoted before your clean.' },
    bathroom: { number: '02 / 03', image: 'details.jpg', alt: 'A calm, light-filled interior with considered finishes', title: 'The small details.<br>The fresh feeling.', items: ['Toilets cleaned inside and out', 'Baths and showers washed down', 'Sinks and taps cleaned and polished', 'Mirrors and accessible surfaces wiped', 'Floors vacuumed and mopped'], note: 'Heavy scale, grout restoration or specialist treatments are discussed separately before a clean.' },
    living: { number: '03 / 03', image: 'living-room.jpg', alt: 'A sunlit living room with clear floors and cared-for surfaces', title: 'Room for living.<br>Room to breathe.', items: ['Accessible surfaces dusted', 'Furniture surfaces wiped with care', 'Floors and carpets vacuumed', 'Hard floors mopped', 'A final tidy of the spaces we clean'], note: 'Delicate items, high areas and anything needing special handling are agreed in advance.' }
  };
  const roomTabs = $$('.room-tabs [role="tab"]');
  let imageTimer;
  function activateRoom(tab) {
    const key = tab.dataset.room, room = rooms[key];
    roomTabs.forEach(button => { const selected = button === tab; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
    const panel = $('#room-content'); panel.setAttribute('aria-labelledby', tab.id);
    panel.innerHTML = '<span class="room-number" aria-hidden="true">' + room.number + '</span><h3>' + room.title + '</h3><ul class="checklist">' + room.items.map(item => '<li>' + item + '</li>').join('') + '</ul><p class="room-footnote">' + room.note + '</p>';
    const image = $('#room-photo'); image.classList.add('changing');
    clearTimeout(imageTimer);
    imageTimer = setTimeout(() => { image.onload = () => image.classList.remove('changing'); image.onerror = () => image.classList.remove('changing'); image.src = 'assets/' + room.image; image.alt = room.alt; if (image.complete) image.classList.remove('changing'); }, reduced ? 0 : 170);
  }
  roomTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateRoom(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % roomTabs.length;
      if (event.key === 'ArrowLeft') next = (index + roomTabs.length - 1) % roomTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = roomTabs.length - 1;
      if (next !== undefined) { event.preventDefault(); roomTabs[next].focus(); activateRoom(roomTabs[next]); }
    });
  });
  $$('.faq-list details').forEach(detail => detail.addEventListener('toggle', () => {
    if (detail.open) $$('.faq-list details').forEach(other => { if (other !== detail) other.open = false; });
  }));
  const quoteDialog = $('#quote-dialog'), privacyDialog = $('#privacy-dialog'), form = $('#quote-form');
  let returnFocus;
  function openDialog(dialog) { returnFocus = document.activeElement; dialog.showModal(); document.body.classList.add('modal-open'); dialog.scrollTop = 0; }
  $$('dialog').forEach(dialog => {
    $('.close-dialog', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (returnFocus) returnFocus.focus({ preventScroll: true }); });
  });
  function quoteValues() {
    const data = new FormData(form), bedrooms = Number(data.get('bedrooms')), bathrooms = Number(data.get('bathrooms')), size = Number(data.get('size'));
    const service = data.get('service'), large = size > 2300 || bedrooms >= 5 || bathrooms >= 4;
    const sizeExtra = Math.max(0, Math.ceil((size - 1500) / 500)) * 40;
    const regular = Math.round(99 + 20 * bedrooms + 16 * bathrooms + sizeExtra);
    const deep = Math.round(159 + 30 * bedrooms + 28 * bathrooms + sizeExtra);
    return { bedrooms, bathrooms, size, city: data.get('city'), service, large, regular, deep, standalone: deep + 50 };
  }
  function updateEstimate() {
    const q = quoteValues(), custom = q.service === 'move' || q.large;
    $('#estimate-label').textContent = custom ? 'A little more detail needed' : q.service === 'recurring' ? 'First deep reset' : 'Your one-time deep reset';
    $('#estimate-price').textContent = custom ? 'Custom quote' : 'CA$' + (q.service === 'recurring' ? q.deep : q.standalone);
    $('#estimate-price').style.fontSize = custom ? '26px' : '';
    $('#estimate-follow').textContent = custom ? 'Share your home details for a tailored flat quote.' : q.service === 'recurring' ? 'Then CA$' + q.regular + ' per biweekly visit' : 'Supplies included · One-time care';
  }
  form.addEventListener('change', updateEstimate);
  function openQuote(service, city) {
    $('#quote-result').hidden = true; form.hidden = false; $('.quote-intro').hidden = false;
    if (service && ['recurring', 'deep', 'move'].includes(service)) $('input[name="service"][value="' + service + '"]', form).checked = true;
    if (city) $('#city').value = city;
    updateEstimate(); openDialog(quoteDialog);
  }
  $$('[data-quote]').forEach(button => button.addEventListener('click', () => openQuote(button.dataset.quote)));
  $$('[data-city]').forEach(button => button.addEventListener('click', () => openQuote(null, button.dataset.city)));
  $('#privacy-button').addEventListener('click', () => openDialog(privacyDialog));
  let estimateText = '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    const q = quoteValues(), custom = q.service === 'move' || q.large;
    const service = q.service === 'recurring' ? 'Deep reset + biweekly care' : q.service === 'deep' ? 'One-time deep reset' : 'Move-in / move-out clean';
    const sizeLabel = $('#size').selectedOptions[0].textContent;
    estimateText = 'STILL HOME — MY CLEANING ESTIMATE\n\n' + service + '\n' + q.bedrooms + ' bedroom' + (q.bedrooms === 1 ? '' : 's') + ' · ' + q.bathrooms + ' bathroom' + (q.bathrooms === 1 ? '' : 's') + '\n' + sizeLabel + ' · ' + q.city + '\n\n' + (custom ? 'Please provide a tailored flat quote.' : q.service === 'recurring' ? 'First deep reset: CA$' + q.deep + '\nBiweekly care: CA$' + q.regular + ' per visit' : 'One-time deep reset: CA$' + q.standalone) + '\nSupplies included.\n\nIndicative only. Final scope, price, applicable taxes and cleaner availability to be confirmed.\n\nHi! Could we confirm the details and check available dates?';
    $('#estimate-summary').textContent = estimateText; form.hidden = true; $('.quote-intro').hidden = true; $('#quote-result').hidden = false;
    $('#copy-status').textContent = 'Your estimate stays on this device. No booking has been submitted.';
    quoteDialog.scrollTop = 0; $('#copy-estimate').focus({ preventScroll: true });
  });
  $('#edit-estimate').addEventListener('click', () => { form.hidden = false; $('#quote-result').hidden = true; $('.quote-intro').hidden = false; quoteDialog.scrollTop = 0; $('input:checked', form).focus({ preventScroll: true }); });
  $('#copy-estimate').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(estimateText); $('#copy-status').textContent = 'Copied. Paste it into our chat whenever you’re ready.'; }
    catch { $('#copy-status').textContent = 'Copying is unavailable here. Select the summary above, or download it below.'; const range = document.createRange(); range.selectNodeContents($('#estimate-summary')); const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); }
  });
  $('#download-estimate').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([estimateText], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Still-Home-Estimate.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#copy-status').textContent = 'Your estimate file is ready. Share it in our chat to check dates.';
  });
  $('#year').textContent = '2026';
  updateEstimate();
})();
