
const modal = document.getElementById("announcement-modal");
const titleEl = document.getElementById("announcement-title");
const descEl = document.getElementById("announcement-desc");
const imgEl = document.getElementById("announcement-img");
const btnContainer = document.getElementById("announcement-btn-container");

async function loadAnnouncement() {
  try {
    const response = await fetch("/scripts/annonces/annonces.json");

    if (!response.ok) {
      console.error("Erreur HTTP :", response.status);
      return;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) return;

    const currentAd = data[0];
    if (!currentAd) return;

    const dismissedAdTitle = localStorage.getItem(
      "dismissedAnnouncementTitle"
    );

    if (dismissedAdTitle === currentAd.title) return;

    // Affichage du contenu
    titleEl.textContent = currentAd.title || "";
    descEl.textContent = currentAd.description || "";

    // Afficher l'image uniquement si elle existe
    if (currentAd.picture) {
      imgEl.src = currentAd.picture;
      imgEl.style.display = "";
    } else {
      imgEl.removeAttribute("src");
      imgEl.style.display = "none";
    }

    // Réinitialiser les boutons
    btnContainer.innerHTML = "";

    // Bouton principal
    if (currentAd.button?.text && currentAd.button?.link) {
      const adButton = document.createElement("a");
      adButton.href = currentAd.button.link;
      adButton.className = "btn-primary";

      if (!currentAd.button.link.startsWith("#")) {
        adButton.target = "_blank";
        adButton.rel = "noopener noreferrer";
      }

      adButton.innerHTML =
        `${currentAd.button.text} <i class="fa-solid fa-arrow-right"></i>`;

      adButton.addEventListener("click", () => {
        localStorage.setItem(
          "dismissedAnnouncementTitle",
          currentAd.title
        );
        modal.style.display = "none";
      });

      btnContainer.appendChild(adButton);
    }

    // Calendrier : afficher uniquement si au moins un champ est rempli
    const cal = currentAd.calendar;

    const hasCalendarInfo =
      cal &&
      typeof cal === "object" &&
      ["title", "description", "location", "start", "end"].some(
        key => String(cal[key] ?? "").trim() !== ""
      );

    if (hasCalendarInfo) {
      const calContainer = document.createElement("div");
      calContainer.className = "calendar-container";

      const isApple =
        /iPad|iPhone|iPod|Macintosh/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" &&
          navigator.maxTouchPoints > 1);

      const isChromeOrAndroid =
        /Chrome|Android/i.test(navigator.userAgent);

      // Dates attendues :
      // Google Calendar : YYYYMMDDTHHmmss / YYYYMMDDTHHmmss
      // ICS : YYYYMMDDTHHmmss (UTC recommandé avec Z)
      const formatGoogleDate = value => {
        if (!value) return "";

        // Accepte une date ISO, par exemple 2026-10-18T13:00:00
        return value.replace(/[-:]/g, "").replace(/\.\d+/, "");
      };

      const googleDates =
        `${formatGoogleDate(cal.start)}/${formatGoogleDate(cal.end)}`;

      const googleUrl =
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        `&text=${encodeURIComponent(cal.title || "")}` +
        `&dates=${encodeURIComponent(googleDates)}` +
        `&details=${encodeURIComponent(cal.description || "")}` +
        `&location=${encodeURIComponent(cal.location || "")}`;

      const escapeIcs = value =>
        String(value || "")
          .replace(/\\/g, "\\\\")
          .replace(/\n/g, "\\n")
          .replace(/,/g, "\\,")
          .replace(/;/g, "\\;");

      const triggerIcsDownload = e => {
        e.preventDefault();

        const icsLines = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Monster Prod//Annonces//FR",
          "CALSCALE:GREGORIAN",
          "BEGIN:VEVENT",
          `URL:${window.location.href}`,
          `SUMMARY:${escapeIcs(cal.title)}`,
          `DESCRIPTION:${escapeIcs(cal.description)}`,
          `LOCATION:${escapeIcs(cal.location)}`
        ];

        if (cal.start) {
          icsLines.push(`DTSTART:${formatGoogleDate(cal.start)}`);
        }

        if (cal.end) {
          icsLines.push(`DTEND:${formatGoogleDate(cal.end)}`);
        }

        icsLines.push("END:VEVENT", "END:VCALENDAR");

        const blob = new Blob(
          [icsLines.join("\r\n") + "\r\n"],
          { type: "text/calendar;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "evenement.ics";
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };

      if (isApple) {
        const appleBtn = document.createElement("a");
        appleBtn.href = "#";
        appleBtn.className = "cal-link-discret";
        appleBtn.innerHTML =
          '<i class="fa-solid fa-calendar-plus"></i> ' +
          "Ajouter à mon calendrier Apple";

        appleBtn.addEventListener("click", triggerIcsDownload);
        calContainer.appendChild(appleBtn);

      } else if (isChromeOrAndroid) {
        const googleBtn = document.createElement("a");
        googleBtn.href = googleUrl;
        googleBtn.target = "_blank";
        googleBtn.rel = "noopener noreferrer";
        googleBtn.className = "cal-link-discret";
        googleBtn.innerHTML =
          '<i class="fa-solid fa-calendar-plus"></i> ' +
          "Ajouter à Google Calendar";

        calContainer.appendChild(googleBtn);

      } else {
        const label = document.createElement("span");
        label.className = "cal-label";
        label.innerHTML =
          '<i class="fa-solid fa-calendar-plus"></i> Ajouter à l’agenda :';

        const googleBtn = document.createElement("a");
        googleBtn.href = googleUrl;
        googleBtn.target = "_blank";
        googleBtn.rel = "noopener noreferrer";
        googleBtn.className = "cal-link-choice";
        googleBtn.textContent = "Google";

        const appleBtn = document.createElement("a");
        appleBtn.href = "#";
        appleBtn.className = "cal-link-choice";
        appleBtn.textContent = "Apple / Outlook";
        appleBtn.addEventListener("click", triggerIcsDownload);

        calContainer.append(label, googleBtn, appleBtn);
      }

      btnContainer.appendChild(calContainer);
    }

    // Afficher la fenêtre
    modal.style.display = "flex";
    setupCloseEvents(currentAd.title);

  } catch (error) {
    console.error(
      "Erreur lors du chargement des annonces :",
      error
    );
  }
}

function setupCloseEvents(adTitle) {
  const closeBtn = document.getElementById("close-announcement");

  const closeModal = () => {
    localStorage.setItem("dismissedAnnouncementTitle", adTitle);
    modal.style.display = "none";
  };

  if (closeBtn && !closeBtn.dataset.listenerAdded) {
    closeBtn.addEventListener("click", closeModal);
    closeBtn.dataset.listenerAdded = "true";
  }

  if (modal && !modal.dataset.listenerAdded) {
    modal.addEventListener("click", e => {
      if (e.target === modal) {
        closeModal();
      }
    });

    modal.dataset.listenerAdded = "true";
  }
}

document.addEventListener("DOMContentLoaded", loadAnnouncement);
