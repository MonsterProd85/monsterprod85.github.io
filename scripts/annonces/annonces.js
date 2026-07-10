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
      
      if (currentAd.calendar) {
        const cal = currentAd.calendar;
        const calContainer = document.createElement("div");
        calContainer.className = "calendar-container";
        
        const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isChromeOrAndroid = /Chrome|Android/i.test(navigator.userAgent);

        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(cal.title)}&dates=${cal.start}/${cal.end}&details=${encodeURIComponent(cal.description)}&location=${encodeURIComponent(cal.location)}`;
        
        const triggerIcsDownload = (e) => {
          e.preventDefault();
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
        };

        if (isApple) {
          const appleBtn = document.createElement("a");
          appleBtn.href = "#";
          appleBtn.className = "cal-link-discret";
          appleBtn.innerHTML = `<i class="fa-solid fa-calendar-plus"></i> Ajouter à mon calendrier Apple`;
          appleBtn.addEventListener("click", triggerIcsDownload);
          calContainer.appendChild(appleBtn);
        } else if (isChromeOrAndroid) {
          const googleBtn = document.createElement("a");
          googleBtn.href = googleUrl;
          googleBtn.target = "_blank";
          googleBtn.rel = "noopener noreferrer";
          googleBtn.className = "cal-link-discret";
          googleBtn.innerHTML = `<i class="fa-solid fa-calendar-plus"></i> Ajouter à Google Calendar`;
          calContainer.appendChild(googleBtn);
        } else {
          calContainer.innerHTML = `<span class="cal-label"><i class="fa-solid fa-calendar-plus"></i> Ajouter à l'agenda :</span>`;
          
          const gLink = document.createElement("a");
          gLink.href = googleUrl;
          gLink.target = "_blank";
          gLink.className = "cal-link-choice";
          gLink.textContent = "Google";
          
          const aLink = document.createElement("a");
          aLink.href = "#";
          aLink.className = "cal-link-choice";
          aLink.textContent = "Apple / Outlook";
          aLink.addEventListener("click", triggerIcsDownload);
          
          calContainer.appendChild(gLink);
          calContainer.appendChild(aLink);
        }

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