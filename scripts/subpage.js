// Shared behaviour for the secondary pages (legal, credits, 404):
// the same floating header and footer year as the home page.
const header = document.querySelector('.header');

function toggleHeaderClass() {
  if (!header) return;
  header.classList.toggle('header-scrolled', window.scrollY > 10);
}

window.addEventListener('scroll', toggleHeaderClass, { passive: true });
window.addEventListener('load', toggleHeaderClass);
toggleHeaderClass();

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// touch screens: drop :hover styles, as on the home page
if ('ontouchstart' in window) {
  try {
    for (const sheet of document.styleSheets) {
      for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
        if (sheet.cssRules[i].selectorText?.includes(':hover')) {
          sheet.deleteRule(i);
        }
      }
    }
  } catch (e) {}
}
