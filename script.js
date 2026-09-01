/* ============================================================
   FROM STABILITY TO INTELLIGENCE — deck controller
   Vanilla JS. No dependencies. Keyboard + swipe + fullscreen.
   ============================================================ */
(function () {
  'use strict';

  const deck      = document.getElementById('deck');
  const slides     = Array.from(document.querySelectorAll('.slide'));
  const total      = slides.length;
  const fill       = document.getElementById('progressFill');
  const indexLabel = document.getElementById('slideIndex');

  let current = 0;
  let slide8Timer = null;

  function pad(n) { return String(n).padStart(2, '0'); }

  function goTo(i) {
    i = Math.max(0, Math.min(total - 1, i));
    if (i === current) return;

    slides[current].classList.remove('is-active');
    slides[current].classList.add('is-prev');

    // Force reflow so re-entering a slide replays its CSS transitions.
    slides[i].classList.remove('is-active');
    void slides[i].offsetWidth;
    slides[i].classList.add('is-active');

    slides.forEach((s, idx) => { if (idx !== i) s.classList.remove('is-prev'); });

    current = i;
    fill.style.width = ((current + 1) / total * 100) + '%';
    indexLabel.textContent = pad(current + 1) + ' / ' + pad(total);

    const isDark = slides[current].dataset.dark === 'true';
    deck.setAttribute('data-dark-active', isDark ? 'true' : 'false');

    if (current === 7) runFinalSlide();
    else clearFinalSlideTimers();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // -------------------------------------------------------------
  // Slide 8 — sequential reveal of the three closing statements
  // -------------------------------------------------------------
  function clearFinalSlideTimers() {
    if (slide8Timer) { slide8Timer.forEach(clearTimeout); slide8Timer = null; }
    document.querySelectorAll('#slide-8 .final-line').forEach(l => l.classList.remove('active'));
  }

  function runFinalSlide() {
    clearFinalSlideTimers();
    const lines = document.querySelectorAll('#slide-8 .final-line');
    slide8Timer = [];
    slide8Timer.push(setTimeout(() => lines[0].classList.add('active'), 300));
    slide8Timer.push(setTimeout(() => lines[0].classList.remove('active'), 3600));
    slide8Timer.push(setTimeout(() => lines[1].classList.add('active'), 4000));
    slide8Timer.push(setTimeout(() => lines[1].classList.remove('active'), 7600));
    slide8Timer.push(setTimeout(() => lines[2].classList.add('active'), 8000));
  }

  // -------------------------------------------------------------
  // Keyboard
  // -------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); goTo(0); break;
      case 'End':
        e.preventDefault(); goTo(total - 1); break;
      case 'f':
      case 'F':
        toggleFullscreen(); break;
    }
  });

  // -------------------------------------------------------------
  // Touch / swipe
  // -------------------------------------------------------------
  let touchStartX = 0;
  deck.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  // Click zones: right half advances, left half retreats.
  deck.addEventListener('click', (e) => {
    const rect = deck.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) next(); else prev();
  });

  // -------------------------------------------------------------
  // Fullscreen
  // -------------------------------------------------------------
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // -------------------------------------------------------------
  // Init — activate slide 1 the same way goTo() does, so its
  // opacity/transform transitions actually have a state change
  // to animate from (a class present at parse time never fires
  // a CSS transition, since there was no prior state to move from).
  // -------------------------------------------------------------
  indexLabel.textContent = pad(1) + ' / ' + pad(total);
  const firstIsDark = slides[0].dataset.dark === 'true';
  deck.setAttribute('data-dark-active', firstIsDark ? 'true' : 'false');

  requestAnimationFrame(() => {
    slides[0].classList.remove('is-active');
    void slides[0].offsetWidth;
    slides[0].classList.add('is-active');
  });
})();
