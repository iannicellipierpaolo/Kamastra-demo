"use strict";

/* ========================================
   PREFERENZE E RIFERIMENTI GENERALI
========================================= */

const mobileQuery = window.matchMedia(
  "(max-width: 760px)"
);

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const navigation = document.querySelector(
  "#navigation"
);

const navigationToggle = document.querySelector(
  ".nav-toggle"
);


/* ========================================
   MENU MOBILE
========================================= */

function closeNavigation() {
  if (!navigation || !navigationToggle) {
    return;
  }

  navigation.classList.remove("open");

  navigationToggle.setAttribute(
    "aria-expanded",
    "false"
  );

  const icon = navigationToggle.querySelector("span");

  if (icon) {
    icon.textContent = "☰";
  }
}

if (navigation && navigationToggle) {
  navigationToggle.addEventListener("click", () => {
    const isOpen =
      navigationToggle.getAttribute("aria-expanded") === "true";

    navigation.classList.toggle("open", !isOpen);

    navigationToggle.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );

    const icon = navigationToggle.querySelector("span");

    if (icon) {
      icon.textContent = isOpen ? "☰" : "×";
    }
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeNavigation();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header")) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    const isOpen = navigation.classList.contains("open");

    if (event.key === "Escape" && isOpen) {
      closeNavigation();
      navigationToggle.focus();
    }
  });

  mobileQuery.addEventListener(
    "change",
    closeNavigation
  );
}


/* ========================================
   CATEGORIE DEL MENU
========================================= */

const menuTabs = Array.from(
  document.querySelectorAll(".menu-tabs [role='tab']")
);

function selectMenuTab(selectedTab, moveFocus = false) {
  menuTabs.forEach((tab) => {
    const isSelected = tab === selectedTab;

    tab.setAttribute(
      "aria-selected",
      String(isSelected)
    );

    tab.tabIndex = isSelected ? 0 : -1;

    const panelId = tab.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);

    if (panel) {
      panel.hidden = !isSelected;
    }
  });

  if (moveFocus) {
    selectedTab.focus();
  }
}

menuTabs.forEach((tab, currentIndex) => {
  tab.addEventListener("click", () => {
    selectMenuTab(tab);
  });

  tab.addEventListener("keydown", (event) => {
    let nextIndex;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % menuTabs.length;
        break;

      case "ArrowLeft":
        nextIndex =
          (currentIndex - 1 + menuTabs.length) % menuTabs.length;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = menuTabs.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    selectMenuTab(
      menuTabs[nextIndex],
      true
    );
  });
});


/* ========================================
   FINESTRA CONTATTI
========================================= */

const contactDialog = document.querySelector(
  "#contact-dialog"
);

const phoneNumber = "+390981XXXXX";

if (contactDialog) {
  const closeButton = contactDialog.querySelector(
    ".contact-close"
  );

  const copyButton = contactDialog.querySelector(
    ".contact-copy"
  );

  const status = contactDialog.querySelector(
    ".contact-status"
  );

  let previousFocus = null;
  let pageWasLocked = false;

  const phoneLinks = document.querySelectorAll(
    'a[href^="tel:"]'
  );

  function openContactDialog() {
    if (contactDialog.open) {
      return;
    }

    previousFocus = document.activeElement;
    pageWasLocked = document.body.classList.contains("locked");

    closeNavigation();

    if (status) {
      status.textContent = "";
    }

    contactDialog.showModal();
    document.body.classList.add("locked");
  }

  phoneLinks.forEach((link) => {
    /*
     * Il link "Chiama ora" dentro la finestra
     * mantiene il suo comportamento telefonico.
     */
    if (contactDialog.contains(link)) {
      return;
    }

    link.addEventListener("click", (event) => {
      if (typeof contactDialog.showModal !== "function") {
        return;
      }

      event.preventDefault();
      openContactDialog();
    });
  });

  closeButton?.addEventListener("click", () => {
    contactDialog.close();
  });

  contactDialog.addEventListener("click", (event) => {
    if (event.target !== contactDialog) {
      return;
    }

    const bounds = contactDialog.getBoundingClientRect();

    const clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedOutside) {
      contactDialog.close();
    }
  });

  contactDialog.addEventListener("close", () => {
    if (!pageWasLocked) {
      document.body.classList.remove("locked");
    }

    if (previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  });

  copyButton?.addEventListener("click", async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        throw new Error("Clipboard non disponibile");
      }

      await navigator.clipboard.writeText(phoneNumber);

      if (status) {
        status.textContent = "Numero copiato negli appunti.";
      }
    } catch {
      if (status) {
        status.textContent =
          "Puoi selezionare e copiare il numero mostrato qui sopra.";
      }

      const numberElement = contactDialog.querySelector(
        ".contact-number"
      );

      const selection = window.getSelection();

      if (numberElement && selection) {
        const range = document.createRange();

        range.selectNodeContents(numberElement);

        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  });
}


/* ========================================
   ANIMAZIONI DI TESTI E FOTOGRAFIE
========================================= */

document.documentElement.classList.remove("js-motion");

let revealObserver = null;

function initializeRevealAnimations() {
  revealObserver?.disconnect();

  if (reducedMotion.matches) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    return;
  }

  const textSelectors = [
    ".hero-copy > .eyebrow",
    ".hero-copy > h1",
    ".hero-copy > .lead",
    ".hero-copy > .actions",
    ".hero-copy > .hero-foot",
    ".story .eyebrow",
    ".story h2",
    ".story p:not(.eyebrow)",
    ".story .signature",
    ".section-top .eyebrow",
    ".section-top h2",
    ".section-top > p",
    ".food-aside > h3",
    ".food-aside > p",
    ".menu-intro",
    ".menu-tabs",
    ".menu-bottom",
    ".wine-copy > .eyebrow",
    ".wine-copy > h2",
    ".wine-copy > p:not(.eyebrow)",
    ".wine-copy > .piretto",
    ".visit-grid > div",
    ".booking"
  ];

  const textElements = document.querySelectorAll(
    textSelectors.join(", ")
  );

  const photoElements = document.querySelectorAll(
    [
      ".hero-photo",
      ".food-photo",
      ".food-aside figure",
      ".wine-figure",
      ".panorama"
    ].join(", ")
  );

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -20px 0px"
    }
  );

  textElements.forEach((element, index) => {
    element.classList.add("animate-in");

    element.style.setProperty(
      "--reveal-delay",
      `${(index % 3) * 70}ms`
    );

    revealObserver.observe(element);
  });

  photoElements.forEach((element) => {
    element.classList.add("photo-in");
    revealObserver.observe(element);
  });

  document.documentElement.classList.add("motion-ready");
}

initializeRevealAnimations();

reducedMotion.addEventListener("change", (event) => {
  if (!event.matches) {
    initializeRevealAnimations();
    return;
  }

  revealObserver?.disconnect();

  document.documentElement.classList.remove(
    "motion-ready"
  );

  document.querySelectorAll(
    ".animate-in, .photo-in"
  ).forEach((element) => {
    element.classList.add("is-visible");
  });
});


/* ========================================
   VOCE ATTIVA NELLA NAVIGAZIONE
========================================= */

if (
  navigation &&
  "IntersectionObserver" in window
) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const currentHash = `#${entry.target.id}`;

        navigation.querySelectorAll("a").forEach((link) => {
          if (link.hash === currentHash) {
            link.setAttribute(
              "aria-current",
              "location"
            );
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      rootMargin: "-15% 0px -65% 0px"
    }
  );

  document.querySelectorAll(
    "main > section"
  ).forEach((section) => {
    sectionObserver.observe(section);
  });
}


/* ========================================
   VIDEO AUTOMATICO SENZA PULSANTE PAUSA
========================================= */

const wineVideo = document.querySelector(
  "#wine-video"
);

if (wineVideo) {
  let videoLoaded = false;
  let videoInView = false;

  wineVideo.muted = true;

  function loadWineVideo() {
    if (videoLoaded) {
      return;
    }

    const source = wineVideo.querySelector("source");

    if (!source) {
      return;
    }

    if (source.dataset.src) {
      source.src = source.dataset.src;
    }

    wineVideo.load();
    videoLoaded = true;
  }

  function updateWinePlayback() {
    const shouldPlay =
      videoInView &&
      !document.hidden &&
      !reducedMotion.matches &&
      !contactDialog?.open &&
      !document.body.classList.contains("editorial-modal-open");

    if (!shouldPlay) {
      wineVideo.pause();
      return;
    }

    loadWineVideo();

    const playRequest = wineVideo.play();

    if (playRequest) {
      playRequest.catch(() => {
        /*
         * Se l'autoplay è bloccato dal dispositivo,
         * resta disponibile la copertina del video.
         */
      });
    }
  }

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        videoInView = entries[0].isIntersecting;
        updateWinePlayback();
      },
      {
        threshold: 0.2
      }
    );

    videoObserver.observe(wineVideo);
  } else {
    // Fallback per browser privi di IntersectionObserver.
    videoInView = true;
    updateWinePlayback();
  }

  document.addEventListener(
    "visibilitychange",
    updateWinePlayback
  );

  document.addEventListener(
    "editorial-modal-change",
    updateWinePlayback
  );

  reducedMotion.addEventListener(
    "change",
    updateWinePlayback
  );

  if (contactDialog) {
    const dialogObserver = new MutationObserver(
      updateWinePlayback
    );

    dialogObserver.observe(contactDialog, {
      attributes: true,
      attributeFilter: ["open"]
    });
  }
}


/* ========================================
   SIMBOLI CON PRESENTAZIONE TESTUALE
========================================= */

const symbolSelectors = [
  ".tiny-sun",
  ".sun",
  ".booking-symbol",
  ".piretto > span",
  ".button > span",
  ".underlink > span",
  ".light-link > span",
  ".nav-toggle > span"
];

document.querySelectorAll(
  symbolSelectors.join(", ")
).forEach((element) => {
  element.childNodes.forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) {
      return;
    }

    node.textContent = node.textContent.replace(
      /[✳↗▶][\uFE0E\uFE0F]?/gu,
      (symbol) => `${symbol[0]}\uFE0E`
    );
  });
});
/* ========================================
   POPUP PROPOSTA E FONTI
========================================= */

(() => {
  function initializeEditorialModals() {
    const configurations = [
      {
        modalId: "demo-modal",
        openButtonId: "btn-open-proposal",
        closeButtonId: "btn-close-proposal"
      },
      {
        modalId: "notes-modal",
        openButtonId: "btn-open-notes",
        closeButtonId: "btn-close-notes"
      }
    ];

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])'
    ].join(", ");

    let activeModal = null;
    let previousFocus = null;

    const backgroundStates = new Map();

    /*
     * Rende temporaneamente non interattivo
     * il contenuto esterno al popup.
     *
     * Gli stati precedenti vengono conservati
     * e ripristinati alla chiusura.
     */
    function disableBackground(modal) {
      backgroundStates.clear();

      Array.from(document.body.children).forEach((element) => {
        if (!(element instanceof HTMLElement)) {
          return;
        }

        if (element === modal) {
          return;
        }

        if (element.matches("script, style, link")) {
          return;
        }

        backgroundStates.set(
          element,
          element.inert
        );

        element.inert = true;
      });
    }

    function restoreBackground() {
      backgroundStates.forEach((wasInert, element) => {
        element.inert = wasInert;
      });

      backgroundStates.clear();
    }

    function getFocusableElements(modal) {
      return Array.from(
        modal.querySelectorAll(focusableSelector)
      ).filter((element) => {
        return (
          element.getClientRects().length > 0 &&
          !element.closest("[inert]")
        );
      });
    }

    function closeActiveModal(restoreFocus = true) {
      if (!activeModal) {
        return;
      }

      const modalToClose = activeModal;
      const elementToFocus = previousFocus;

      activeModal = null;
      previousFocus = null;

      modalToClose.setAttribute(
        "aria-hidden",
        "true"
      );

      modalToClose.inert = true;

      document.body.classList.remove(
        "editorial-modal-open"
      );

      restoreBackground();

      document.dispatchEvent(
        new Event("editorial-modal-change")
      );

      if (
        restoreFocus &&
        elementToFocus instanceof HTMLElement &&
        elementToFocus.isConnected
      ) {
        elementToFocus.focus({
          preventScroll: true
        });
      }
    }

    function openModal(modal, trigger) {
      if (activeModal === modal) {
        return;
      }

      if (activeModal) {
        closeActiveModal(false);
      }

      previousFocus = trigger;
      activeModal = modal;

      modal.inert = false;

      modal.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "editorial-modal-open"
      );

      disableBackground(modal);

      document.dispatchEvent(
        new Event("editorial-modal-change")
      );

      const dialog = modal.querySelector(
        '[role="dialog"]'
      );

      /*
       * Attende che il popup sia visibile
       * prima di spostare il focus.
       */
      window.requestAnimationFrame(() => {
        if (activeModal !== modal) {
          return;
        }

        const focusableElements =
          getFocusableElements(modal);

        const focusTarget =
          focusableElements[0] || dialog;

        focusTarget?.focus({
          preventScroll: true
        });
      });
    }

    configurations.forEach((configuration) => {
      const modal = document.getElementById(
        configuration.modalId
      );

      const openButton = document.getElementById(
        configuration.openButtonId
      );

      const closeButton = document.getElementById(
        configuration.closeButtonId
      );

      if (!modal) {
        return;
      }

      const dialog = modal.querySelector(
        '[role="dialog"]'
      );

      if (!dialog) {
        return;
      }

      /*
       * Porta il popup direttamente sotto body,
       * evitando interferenze con contenitori
       * animati o con overflow nascosto.
       */
      document.body.appendChild(modal);

      modal.setAttribute(
        "aria-hidden",
        "true"
      );

      modal.inert = true;

      dialog.setAttribute(
        "aria-modal",
        "true"
      );

      dialog.setAttribute(
        "tabindex",
        "-1"
      );

      if (openButton) {
        openButton.setAttribute(
          "aria-haspopup",
          "dialog"
        );

        openButton.setAttribute(
          "aria-controls",
          configuration.modalId
        );

        openButton.addEventListener("click", (event) => {
          event.preventDefault();

          openModal(
            modal,
            openButton
          );
        });
      }

      closeButton?.addEventListener("click", () => {
        if (activeModal === modal) {
          closeActiveModal();
        }
      });

      modal.addEventListener("click", (event) => {
        /*
         * Chiude solo cliccando sullo sfondo,
         * non sul contenuto della finestra.
         */
        if (
          event.target === modal &&
          activeModal === modal
        ) {
          closeActiveModal();
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (!activeModal) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeActiveModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        getFocusableElements(activeModal);

      const dialog = activeModal.querySelector(
        '[role="dialog"]'
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const firstElement = focusableElements[0];

      const lastElement =
        focusableElements[focusableElements.length - 1];

      const focusedElement = document.activeElement;

      const focusIsOutside =
        !activeModal.contains(focusedElement);

      if (
        event.shiftKey &&
        (
          focusedElement === firstElement ||
          focusedElement === dialog ||
          focusIsOutside
        )
      ) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (
        !event.shiftKey &&
        (
          focusedElement === lastElement ||
          focusedElement === dialog ||
          focusIsOutside
        )
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeEditorialModals,
      {
        once: true
      }
    );
  } else {
    initializeEditorialModals();
  }
})();