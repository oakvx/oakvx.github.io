const tabs = [...document.querySelectorAll('[data-fo-go]')];
const slides = [...document.querySelectorAll('.fo-slide')];
let selected = 0;
function choose(index, focus = false) {
  selected = (index + tabs.length) % tabs.length;
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === selected));
    tab.tabIndex = i === selected ? 0 : -1;
    slides[i].hidden = i !== selected;
  });
  if (focus) tabs[selected].focus();
}
tabs.forEach((tab, i) => {
  tab.id = `fo-lang-${i}`; tab.setAttribute('aria-controls', slides[i].id);
  slides[i].setAttribute('role', 'tabpanel'); slides[i].setAttribute('aria-labelledby', tab.id);
  tab.addEventListener('click', () => choose(i));
  tab.addEventListener('keydown', event => {
    const move = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (move) { event.preventDefault(); choose(i + move, true); }
  });
});
document.querySelector('[data-fo-prev]').onclick = () => choose(selected - 1);
document.querySelector('[data-fo-next]').onclick = () => choose(selected + 1);
choose(document.documentElement.lang === 'en' ? 1 : 0);
