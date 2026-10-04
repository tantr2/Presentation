const slides = Array.from(document.querySelectorAll('.slide'));
const bar = document.getElementById('bar');
const counter = document.getElementById('counter');
let index = 0;

function show(i){
  index = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((s, n) => {
    s.classList.toggle('active', n === index);
    s.classList.toggle('prev', n < index);
  });
  bar.style.width = `${((index + 1) / slides.length) * 100}%`;
  counter.textContent = `${index + 1} / ${slides.length}`;
  document.title = `${slides[index].dataset.title || 'Asteria'} - Asteria`;
}
function next(){ show(index + 1); }
function prev(){ show(index - 1); }

document.getElementById('next').addEventListener('click', next);
document.getElementById('prev').addEventListener('click', prev);
document.getElementById('fullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});

document.addEventListener('keydown', e => {
  if (['ArrowRight','PageDown',' '].includes(e.key)) { e.preventDefault(); next(); }
  if (['ArrowLeft','PageUp','Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
  if (e.key === 'Home') show(0);
  if (e.key === 'End') show(slides.length - 1);
  if (e.key.toLowerCase() === 'f') document.getElementById('fullscreen').click();
});

let startX = null;
document.addEventListener('pointerdown', e => startX = e.clientX);
document.addEventListener('pointerup', e => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 60) dx < 0 ? next() : prev();
  startX = null;
});

show(0);
