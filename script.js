const slides = Array.from(document.querySelectorAll('.slide'));
const bar = document.getElementById('bar');
const counter = document.getElementById('counter');
const hud = document.getElementById('hud');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const fullscreenButton = document.getElementById('fullscreen');

let index = 0;
let pointerStart = null;
let wheelLocked = false;
let hudTimer = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashIndex() {
  const n = Number(location.hash.replace('#', ''));
  return Number.isFinite(n) && n >= 1 && n <= slides.length ? n - 1 : 0;
}

function show(i, { updateHash = true } = {}) {
  index = clamp(i, 0, slides.length - 1);

  slides.forEach((slide, n) => {
    const active = n === index;
    slide.classList.toggle('active', active);
    slide.classList.toggle('prev', n < index);
    slide.setAttribute('aria-hidden', String(!active));
  });

  const percent = ((index + 1) / slides.length) * 100;
  bar.style.width = `${percent}%`;
  counter.textContent = `${index + 1} / ${slides.length}`;

  const title = slides[index].dataset.title || 'Asteria';
  document.title = `${title} — Asteria`;

  if (updateHash) {
    history.replaceState(null, '', `#${index + 1}`);
  }

  wakeHud();
}

function next() {
  show(index + 1);
}

function prev() {
  show(index - 1);
}

function wakeHud() {
  hud.classList.remove('idle');

  clearTimeout(hudTimer);

  hudTimer = setTimeout(() => {
    hud.classList.add('idle');
  }, 2200);
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (_) {
    // Fullscreen may be blocked by the browser.
  }
}

prevButton.addEventListener('click', prev);
nextButton.addEventListener('click', next);
fullscreenButton.addEventListener('click', toggleFullscreen);

document.addEventListener('keydown', (event) => {
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    next();
  }

  if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) {
    event.preventDefault();
    prev();
  }

  if (event.key === 'Home') {
    show(0);
  }

  if (event.key === 'End') {
    show(slides.length - 1);
  }

  if (event.key.toLowerCase() === 'f') {
    toggleFullscreen();
  }
});

document.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button')) {
    return;
  }

  pointerStart = {
    x: event.clientX,
    y: event.clientY
  };
});

document.addEventListener('pointerup', (event) => {
  if (!pointerStart || event.target.closest('button')) {
    pointerStart = null;
    return;
  }

  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;

  if (
    Math.abs(dx) > 60 &&
    Math.abs(dx) > Math.abs(dy) * 1.25
  ) {
    dx < 0 ? next() : prev();
  } else if (
    Math.abs(dx) < 8 &&
    Math.abs(dy) < 8
  ) {
    const x = event.clientX / window.innerWidth;

    if (x > 0.72) {
      next();
    } else if (x < 0.28) {
      prev();
    }
  }

  pointerStart = null;
});

document.addEventListener(
  'wheel',
  (event) => {
    if (
      wheelLocked ||
      Math.abs(event.deltaY) < 16
    ) {
      return;
    }

    wheelLocked = true;

    event.deltaY > 0 ? next() : prev();

    setTimeout(() => {
      wheelLocked = false;
    }, 650);
  },
  {
    passive: true
  }
);

document.addEventListener(
  'mousemove',
  wakeHud,
  {
    passive: true
  }
);

document.addEventListener(
  'touchstart',
  wakeHud,
  {
    passive: true
  }
);

window.addEventListener('hashchange', () => {
  show(hashIndex(), {
    updateHash: false
  });
});

show(hashIndex(), {
  updateHash: false
});

wakeHud();
