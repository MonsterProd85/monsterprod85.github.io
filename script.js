const content = document.querySelectorAll('.card, .about-text, .about-image');
function revealOnScroll() {
  content.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add('in-view');
    }
  });
}
// const cards = document.querySelectorAll('.card');
// function checkCards() {
//   cards.forEach(card => {
//     const rect = card.getBoundingClientRect();
//     if (rect.top < window.innerHeight - 100) {
//       card.classList.add('in-view');
//     }
//   });
// }
// window.addEventListener('scroll', checkCards);
// window.addEventListener('load', checkCards);

// Mise à jour de l'année
document.getElementById('year').textContent = new Date().getFullYear();


window.addEventListener('load', () => {
  let lastKnownScrollPosition = currentScrollY();
  const scrollCheckIntervalMs = 100;
  if (typeof toggleHeaderClass === 'function') {
    toggleHeaderClass();
  } else {
    console.error("toggleHeaderClass function is not defined by the time 'load' event fires or is not a function.");
  }
  function handleScrollChange() {
    const scrollY = currentScrollY();
    if (scrollY !== lastKnownScrollPosition) {
      if (typeof toggleHeaderClass === 'function') {
        toggleHeaderClass();
        addAnimationToCardsOnScroll()
      }
      lastKnownScrollPosition = scrollY;
    }
  }
  setInterval(handleScrollChange, scrollCheckIntervalMs);
});


window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

const header = document.querySelector('.header');
// the page scrolls inside <body>, not the window. Take the largest offset: a rubber-band
// bounce past the bottom moves the window by a few pixels, and picking that up with ||
// made the header jump back to its top-of-page style.
function currentScrollY() {
  return Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);
}

function toggleHeaderClass() {
  const scrollPosition = currentScrollY();
  if (scrollPosition > 10) {
    header.classList.add('header-scrolled');
  } else {
    header.classList.remove('header-scrolled');
  }
}

function addAnimationToCardsOnScroll() {
  const cards = document.querySelectorAll('.cards');

  if (window.scrollY > 400) {
    cards.classList.add('card-animation');
  }
}

const taglines = [
  "Faites briller vos évènements",
  "Son, lumière, action !",
  "Des événements inoubliables",
  "Créons ensemble des moments magiques"
];
const mainTitleElement = document.getElementById('mainTitle');
const randomIndex = Math.floor(Math.random() * taglines.length);
const selectedTagline = taglines[randomIndex];
mainTitleElement.textContent = `${selectedTagline}`;

// swap the tagline text and animate the title height, so a tagline that wraps
// onto two lines eases the text below down instead of making it jump
function setTaglineSmoothly(text) {
  const from = mainTitleElement.offsetHeight;
  mainTitleElement.style.height = '';
  mainTitleElement.textContent = text;
  const to = mainTitleElement.offsetHeight;
  if (from === to) return;
  mainTitleElement.style.height = from + 'px';
  mainTitleElement.offsetHeight; // apply the start height before transitioning
  mainTitleElement.style.height = to + 'px';
}
mainTitleElement.addEventListener('transitionend', e => {
  if (e.propertyName === 'height') mainTitleElement.style.height = '';
});

// animation for cycling through taglines
const cycleTaglines = () => {
  let currentIndex = randomIndex;

  // keyframe animation
  const keyframes = `
    @keyframes fadeOut {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-20px); }
    }
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  
  const styleElement = document.createElement('style');
  styleElement.innerHTML = keyframes;
  document.head.appendChild(styleElement);

  const updateTagline = () => {
    // fade out
    mainTitleElement.style.animation = 'fadeOut 1s forwards';
    
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % taglines.length;
      setTaglineSmoothly(taglines[currentIndex]);
      
      // fade in
      mainTitleElement.style.animation = 'fadeIn 1s forwards';
    }, 1000);
  };
  
  setInterval(updateTagline, 7000);
};

document.addEventListener('DOMContentLoaded', cycleTaglines);

// scale about-image when hovering about button
document.querySelector('.btn-secondary').addEventListener('mouseenter', function() {
  const aboutImage = document.querySelector('.about-image img');
  if (aboutImage) {
    aboutImage.classList.add('about-image-scaled');
  }
});

document.querySelector('.btn-secondary').addEventListener('mouseleave', function() {
  const aboutImage = document.querySelector('.about-image img');
  if (aboutImage) {
    aboutImage.classList.remove('about-image-scaled');
  }
});


// label color in contact form
document.addEventListener('DOMContentLoaded', function() {
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            const label = document.querySelector(`label[for="${this.id}"]`);
            if (label) {
              label.classList.add('contact-label-focus');
            }
        });
        input.addEventListener('blur', function() {
            const label = document.querySelector(`label[for="${this.id}"]`);
            if (label) {
              label.classList.remove('contact-label-focus');
            }
        });
    });
});


/* touch screen input */
if ('ontouchstart' in window) {
  try {
    for (let sheet of document.styleSheets) {
      for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
        if (sheet.cssRules[i].selectorText?.includes(':hover')) {
          sheet.deleteRule(i);
        }
      }
    }
  } catch(e) {}
}