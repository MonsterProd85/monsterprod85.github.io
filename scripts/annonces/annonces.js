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
        return; 
      }

      titleEl.textContent = currentAd.title;
      descEl.textContent = currentAd.description;
      imgEl.src = currentAd.picture;
      
      btnContainer.innerHTML = ""; 
      
      // 1. Bouton principal d'action
      if (currentAd.button && currentAd.button.text && currentAd.button.link) {
        const adButton = document.createElement("a");
        adButton.href = currentAd.button.link;
        if (!currentAd.button.link.startsWith('#')) {
          adButton.target = "_blank";
          adButton.rel = "noopener noreferrer";
        }
        adButton.className = "btn-primary";
        adButton.innerHTML = `${currentAd.button.text} <i class="fa-solid fa-arrow-right"></i>`;
        
        adButton.addEventListener("click", () => {
          localStorage.setItem("dismissedAnnouncementTitle", currentAd.title);
          modal.style.display = "none";
        });
        
        btnContainer.appendChild(adButton);
      }
      
      // 2. BLOC CALENDRIER (Optionnel si présent dans le JSON)
      if (currentAd.calendar) {
        const cal = currentAd.calendar;

        // Création du conteneur des liens de calendrier
        const calContainer = document.createElement("div");
        calContainer.className = "calendar-options";
        calContainer.innerHTML = `<span class="cal-trigger"><i class="fa-solid fa-calendar-plus"></i> Ajouter à mon calendrier</span>`;
        
        // Sous-menu contenant les deux choix d'importation importants
        const calMenu = document.createElement("div");
        calMenu.className = "calendar-menu";

        // Lien 1 : Google Calendar
        const googleLink = document.createElement("a");
        googleLink.target = "_blank";
        googleLink.rel = "noopener noreferrer";
        googleLink.textContent = "Google Calendar";
        googleLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(cal.title)}&dates=${cal.start}/${cal.end}&details=${encodeURIComponent(cal.description)}&location=${encodeURIComponent(cal.location)}`;

        // Lien 2 : Fichier ICS (Apple / Outlook)
        const icsLink = document.createElement("a");
        icsLink.textContent = "Apple / Outlook (.ics)";
        icsLink.href = "#";
        icsLink.addEventListener("click", (e) => {
          e.preventDefault();
          // Génération du contenu de fichier de l'événement à la volée
          const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "BEGIN:VEVENT",
            `URL:${window.location.href}`,
            `DTSTART:${cal.start}`,
            `DTEND:${cal.end}`,
            `SUMMARY:${cal.title}`,
            `DESCRIPTION:${cal.description}`,
            `LOCATION:${cal.location}`,
            "END:VEVENT",
            "END:VCALENDAR"
          ].join("\n");
          
          const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "evenement.ics");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });

        calMenu.appendChild(googleLink);
        calMenu.appendChild(icsLink);
        calContainer.appendChild(calMenu);
        btnContainer.appendChild(calContainer);
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