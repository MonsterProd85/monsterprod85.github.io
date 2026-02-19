async function loadTeam() {
  try {
    const response = await fetch("team.json");
    const data = await response.json();
    const container = document.getElementById("team-container");

    // Fonction utilitaire pour créer des cartes
    function createCard(member) {
      const card = document.createElement("div");
      card.className = "team-card";
      card.innerHTML = `
        <img src="${member.photo}" alt="${member.name}" class="team-photo">
        <h2>${member.role}</h2>
        <p>${member.name}</p>
      `;
      return card;
    }

    // Créer section
    function createSection(title, members) {
      const section = document.createElement("section");
      section.className = "section";
      const h2 = document.createElement("h2");
      h2.className = "section-title";
      h2.textContent = title;
      section.appendChild(h2);

      const cardsDiv = document.createElement("div");
      cardsDiv.className = "cards";

      members.forEach(m => cardsDiv.appendChild(createCard(m)));
      section.appendChild(cardsDiv);
      container.appendChild(section);
    }

    // Sections présidents et membres
    createSection("Bureaux", data.presidents);
    createSection("", data.membres);

    // Section bénévoles
    const volSection = document.createElement("section");
    volSection.className = "section volunteers";
    const volTitle = document.createElement("h2");
    volTitle.className = "section-title";
    volTitle.textContent = "Bénévoles";
    volSection.appendChild(volTitle);

    const ul = document.createElement("ul");
    data.benevoles.forEach(b => {
      const li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    });
    volSection.appendChild(ul);
    container.appendChild(volSection);

  } catch (e) {
    console.error("Erreur JSON équipe :", e);
  }
}

loadTeam();

const content = document.querySelectorAll('.card, .about-text, .about-image');
function revealOnScroll() {
  content.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add('in-view');
    }
  });
}

