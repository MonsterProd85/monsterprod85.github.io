const modal = document.getElementById("announcement-modal");
const titleEl = document.getElementById("announcement-title");
const descEl = document.getElementById("announcement-desc");
const imgEl = document.getElementById("announcement-img");
const btnContainer = document.getElementById("announcement-btn-container");

async function loadAnnouncement() {
  try {
    const response = await fetch("/scripts/annonces/annonces.json");
    if (!response.ok) return;
    
    const data = await response.json();
    
    if (data && data.length > 1) {
      const currentAd = data[1];
      
      if (!currentAd || !currentAd.picture) return;

      const dismissedAdTitle = localStorage.getItem("dismissedAnnouncementTitle");
      if (dismissedAdTitle === currentAd.title) {
        console.log("Annonce déjà consultée et fermée par l'utilisateur.");
        return; 
      }

      titleEl.textContent = currentAd.title;
      descEl.textContent = currentAd.description;
      imgEl.src = currentAd.picture;
      
      btnContainer.innerHTML = ""; 
      if (currentAd.button && currentAd.button.text && currentAd.button.link) {
        const adButton = document.createElement("a");
        adButton.href = currentAd.button.link;
        
        // Sécurité : Ouvre dans un nouvel onglet UNIQUEMENT si ce n'est pas une ancre locale (ex: #contact)
        if (!currentAd.button.link.startsWith('#')) {
          adButton.target = "_blank";
          adButton.rel = "noopener noreferrer"; // Bonne pratique de sécurité pour les liens externes
        }
        
        adButton.className = "btn-primary";
        adButton.innerHTML = `${currentAd.button.text} <i class="fa-solid fa-arrow-right"></i>`;
        
        adButton.addEventListener("click", () => {
          localStorage.setItem("dismissedAnnouncementTitle", currentAd.title);
          modal.style.display = "none";
        });
        
        btnContainer.appendChild(adButton);
      }
      
      modal.style.display = "flex";
      
      setupCloseEvents(currentAd.title);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des annonces :", error);
  }
}

function setupCloseEvents(adTitle) {
  const closeBtn = document.getElementById("close-announcement");

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      localStorage.setItem("dismissedAnnouncementTitle", adTitle);
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        localStorage.setItem("dismissedAnnouncementTitle", adTitle);
        modal.style.display = "none";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncement();
});