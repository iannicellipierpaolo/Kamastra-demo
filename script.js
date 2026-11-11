import { settings, dishes, categories, spreads } from "./content.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
const svgCache = new Map();
let svgInstance = 0;

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

async function getArtwork(name) {
  if (!svgCache.has(name)) {
    svgCache.set(
      name,
      fetch(`assets/${name}.svg`).then((response) => {
        if (!response.ok) {
          throw new Error(`Illustrazione non disponibile: ${name}`);
        }
        return response.text();
      }),
    );
  }
  const text = await svgCache.get(name);
  const suffix = `-${svgInstance++}`;
  return text.replace(/mask-([a-z-]+)/g, (match) => `${match}${suffix}`);
}

function initializeDialogs() {
  $$("dialog").forEach((dialog) => {
    dialog.addEventListener("close", () => {
      if (!document.querySelector("dialog[open]")) {
        document.body.classList.remove("modal-open");
      }
    });
    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      if (
        event.target === dialog &&
        (event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom)
      ) {
        dialog.close();
      }
    });
  });
  $$("[data-close]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
}

function openDialog(dialog) {
  if (!dialog.open) {
    document.body.classList.add("modal-open");
    dialog.showModal();
  }
}

function showContent(html) {
  $("#dialog-body").innerHTML = html;
  openDialog($("#content-dialog"));
}

function showCategory(id, initial = true) {
  const category = categories.find((item) => item.id === id);
  if (!category) return;
  $("#dialog-body").innerHTML = `
    <p class="dialog-eyebrow">Il menù di Kamastra</p>
    <h2 id="dialog-title">${escapeHtml(category.title)}</h2>
    <p class="dialog-intro">${escapeHtml(category.introduction)}</p>
    <p class="demo-message">
      Anteprima dei contenuti. Menù, prezzi e allergeni sono da aggiornare
      e confermare con il ristorante. Questa vista non è il menù in vigore.
    </p>
    <div class="menu-items">
      ${category.items
        .map(
          (item) => `
        <article class="menu-item">
          <div class="menu-item-top">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              ${item.localName ? `<p class="local-name">${escapeHtml(item.localName)}</p>` : ""}
            </div>
            <span class="price">
              ${
                item.price == null
                  ? "Prezzo da aggiornare"
                  : new Intl.NumberFormat("it-IT", {
                      style: "currency",
                      currency: "EUR",
                    }).format(item.price)
              }
            </span>
          </div>
          <p>${escapeHtml(item.description)}</p>
          <small>
            Allergeni: ${item.allergens ? escapeHtml(item.allergens.join(", ")) : "informazioni da confermare con il ristorante"}.
          </small>
        </article>
      `,
        )
        .join("")}
    </div>
    <nav class="dialog-categories" aria-label="Altre categorie del menù">
      ${categories
        .map(
          (item) => `
        <button data-switch-category="${item.id}" aria-pressed="${item.id === id}">
          ${escapeHtml(item.title)}
        </button>
      `,
        )
        .join("")}
    </nav>
  `;
  $$("[data-switch-category]").forEach((button) => {
    button.addEventListener("click", () => {
      showCategory(button.dataset.switchCategory, false);
      const title = $("#dialog-title");
      title.tabIndex = -1;
      title.focus();
      $("#content-dialog").scrollTop = 0;
    });
  });
  if (initial) openDialog($("#content-dialog"));
}

async function initializeMenu() {
  $("#menu-categories").innerHTML = categories
    .map(
      (category) => `
    <button class="category" data-category="${category.id}" aria-haspopup="dialog">
      <span class="category-art illustration" data-art="${category.illustration}"></span>
      <h3>${escapeHtml(category.title)}</h3>
      <span class="category-link">Scopri i piatti <span aria-hidden="true">↗</span></span>
    </button>
  `,
    )
    .join("");
  $$(".category").forEach((button) => {
    button.addEventListener("click", () =>
      showCategory(button.dataset.category),
    );
  });
}

class DishCarousel {
  constructor() {
    this.track = $("#dish-track");
    this.viewport = $(".carousel-window");
    this.position = dishes.length;
    this.busy = false;
    this.hovered = false;
    this.focused = false;
    this.visible = false;
    this.paused = motion.matches;
    this.holdUntil = 0;
    this.lastDrag = 0;
    this.render();
    this.bind();
    this.resize();
    this.timer = window.setInterval(() => this.autoAdvance(), 4600);
  }

  render() {
    this.track.innerHTML = [...dishes, ...dishes, ...dishes]
      .map(
        (dish, index) => `
      <button
        class="dish-card"
        data-dish="${index % dishes.length}"
        aria-label="${escapeHtml(dish.title.replace("\n", " "))}: apri la categoria del menù"
        ${index < dishes.length || index >= dishes.length * 2 ? 'tabindex="-1" aria-hidden="true"' : ""}
      >
        <img src="${dish.image}" alt="${escapeHtml(dish.alt)}" width="735" height="927" loading="lazy" draggable="false">
        <span>${escapeHtml(dish.title)}</span>
      </button>
    `,
      )
      .join("");
    $(".carousel-dots").innerHTML = dishes
      .map(
        (dish, index) => `
      <button data-dot="${index}" aria-label="Mostra ${escapeHtml(dish.title.replace("\n", " "))}" aria-pressed="${index === 0}"></button>
    `,
      )
      .join("");
    this.updatePause();
  }

  bind() {
    $("#dish-prev").addEventListener("click", () => this.step(-1, true));
    $("#dish-next").addEventListener("click", () => this.step(1, true));
    $("#dish-pause").addEventListener("click", () => {
      this.paused = !this.paused;
      this.updatePause();
    });
    $$("[data-dot]").forEach((dot) => {
      dot.addEventListener("click", () => {
        if (this.busy) return;
        this.holdUntil = Date.now() + 10000;
        this.move(dishes.length + Number(dot.dataset.dot), true);
      });
    });
    $$(".dish-card").forEach((card) => {
      card.addEventListener("click", (event) => {
        if (Date.now() - this.lastDrag < 400) {
          event.preventDefault();
          return;
        }
        showCategory(dishes[Number(card.dataset.dish)].category);
      });
    });
    this.viewport.addEventListener("mouseenter", () => {
      this.hovered = true;
    });
    this.viewport.addEventListener("mouseleave", () => {
      this.hovered = false;
    });
    $(".carousel").addEventListener("focusin", () => {
      this.focused = true;
    });
    $(".carousel").addEventListener("focusout", (event) => {
      this.focused = $(".carousel").contains(event.relatedTarget);
      this.holdUntil = Date.now() + 8000;
    });
    this.track.addEventListener("transitionend", (event) => {
      if (event.target === this.track) this.finishMove();
    });
    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(this.viewport);
    const observer = new IntersectionObserver((entries) => {
      this.visible = entries[0].isIntersecting;
    });
    observer.observe(this.viewport);
    this.viewport.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || this.busy) return;
      this.drag = {
        x: event.clientX,
        y: event.clientY,
        id: event.pointerId,
        active: false,
      };
    });
    this.viewport.addEventListener("pointermove", (event) => {
      if (!this.drag) return;
      const dx = event.clientX - this.drag.x;
      const dy = event.clientY - this.drag.y;
      if (
        !this.drag.active &&
        Math.abs(dy) > Math.abs(dx) &&
        Math.abs(dy) > 12
      ) {
        this.drag = null;
        return;
      }
      if (Math.abs(dx) > 10 && !this.drag.active) {
        this.drag.active = true;
        this.viewport.setPointerCapture(event.pointerId);
        this.viewport.classList.add("dragging");
        this.track.style.transition = "none";
      }
      if (this.drag.active) {
        this.track.style.transform = `translate3d(${-this.position * this.unit + dx}px, 0, 0)`;
      }
    });
    const finishDrag = (event) => {
      if (!this.drag) return;
      const dx = event.clientX - this.drag.x;
      const active = this.drag.active;
      this.drag = null;
      this.viewport.classList.remove("dragging");
      if (this.viewport.hasPointerCapture(event.pointerId)) {
        this.viewport.releasePointerCapture(event.pointerId);
      }
      if (active) {
        this.lastDrag = Date.now();
        this.holdUntil = Date.now() + 10000;
        this.move(
          this.position + (Math.abs(dx) > 45 ? (dx < 0 ? 1 : -1) : 0),
          true,
        );
      }
    };
    this.viewport.addEventListener("pointerup", finishDrag);
    this.viewport.addEventListener("pointercancel", () => {
      this.drag = null;
      this.viewport.classList.remove("dragging");
      this.move(this.position, false);
    });
  }

  resize() {
    this.unit = this.track.firstElementChild.getBoundingClientRect().width + 12;
    this.move(this.position, false);
  }

  move(position, animate) {
    this.position = position;
    this.busy = animate && !motion.matches;
    this.track.style.transition = this.busy
      ? "transform 750ms cubic-bezier(.22, 1, .36, 1)"
      : "none";
    this.track.style.transform = `translate3d(${-position * this.unit}px, 0, 0)`;
    this.update();
    if (!this.busy) this.finishMove();
  }

  finishMove() {
    this.busy = false;
    const count = dishes.length;
    if (this.position < count || this.position >= count * 2) {
      this.position = (((this.position % count) + count) % count) + count;
      this.track.style.transition = "none";
      this.track.style.transform = `translate3d(${-this.position * this.unit}px, 0, 0)`;
      this.update();
    }
  }

  step(direction, manual = false) {
    if (this.busy) return;
    if (manual) this.holdUntil = Date.now() + 10000;
    this.move(this.position + direction, true);
    if (manual) {
      const index = this.position % dishes.length;
      $("#dish-status").textContent =
        `Piatto ${index + 1} di ${dishes.length}: ${dishes[index].title.replace("\n", " ")}`;
    }
  }

  update() {
    const index = this.position % dishes.length;
    $$("[data-dot]").forEach((dot, i) =>
      dot.setAttribute("aria-pressed", String(i === index)),
    );
    $$(".dish-card").forEach((card, i) => {
      const shown =
        i >= this.position &&
        i < this.position + (window.innerWidth <= 760 ? 1 : 4);
      card.tabIndex = shown ? 0 : -1;
      card.setAttribute("aria-hidden", String(!shown));
    });
  }

  updatePause() {
    $("#dish-pause").textContent = this.paused ? "▷" : "Ⅱ";
    $("#dish-pause").setAttribute("aria-pressed", String(this.paused));
    $("#dish-pause").setAttribute(
      "aria-label",
      this.paused
        ? "Avvia scorrimento automatico"
        : "Ferma scorrimento automatico",
    );
  }

  autoAdvance() {
    if (
      !this.visible ||
      this.paused ||
      this.hovered ||
      this.focused ||
      this.drag ||
      document.hidden ||
      document.querySelector("dialog[open]")
    )
      return;
    if (Date.now() < this.holdUntil) return;
    this.step(1);
  }
}

class CivitaAlbum {
  constructor() {
    this.current = 0;
    this.busy = false;
    this.lastDrag = 0;
    this.book = $("#album-book");
    this.pages = $("#book-pages");
    this.photos = spreads.flatMap((spread) => spread.images);
    this.render();
    this.bind();
  }

  page(index, side) {
    const spread = spreads[index];
    const offset = side === "left" ? 0 : 2;
    return `
      <div class="page-layout">
        ${spread.images
          .slice(offset, offset + 2)
          .map(
            ([src, caption], i) => `
          <button class="album-photo" data-photo="${index * 4 + offset + i}" aria-label="Ingrandisci: ${escapeHtml(caption)}">
            <img src="${src}" alt="${escapeHtml(caption)}" width="600" height="400" loading="lazy" draggable="false">
          </button>
        `,
          )
          .join("")}
        ${
          side === "left"
            ? `
          <div class="album-note">
            <strong>${escapeHtml(spread.title)}</strong>
            <span class="note-prose">${escapeHtml(spread.note)}</span>
          </div>
        `
            : `
          <p class="album-annotation">${escapeHtml(spread.annotation)}</p>
          <div class="mini-sketch" data-mini-art></div>
        `
        }
        <span class="page-number">${index * 2 + (side === "left" ? 1 : 2)}</span>
      </div>
    `;
  }

  render() {
    this.pages.innerHTML = `
      <div class="album-page left">${this.page(this.current, "left")}</div>
      <div class="album-page right">${this.page(this.current, "right")}</div>
    `;
    this.decorate();
    $("#album-count").textContent = `${this.current + 1} / ${spreads.length}`;
    $("#album-prev").disabled = this.current === 0;
    $("#album-next").disabled = this.current === spreads.length - 1;
    $("#album-browse").innerHTML =
      this.current === spreads.length - 1
        ? 'Ricomincia l’album <span aria-hidden="true">↺</span>'
        : 'Sfoglia l’album <span aria-hidden="true">→</span>';
    this.book.setAttribute(
      "aria-label",
      `Album di Civita. Doppia pagina ${this.current + 1} di ${spreads.length}: ${spreads[this.current].title}. Usa le frecce per sfogliare.`,
    );
  }

  async decorate() {
    const mini = $("[data-mini-art]", this.pages);
    if (mini) mini.innerHTML = await getArtwork("civita");
  }

  startTurn(direction) {
    const target = this.current + direction;
    if (this.busy || target < 0 || target >= spreads.length) return false;
    this.busy = true;
    this.target = target;
    this.direction = direction;
    const old = this.current;
    if (direction > 0) {
      $(".album-page.right", this.pages).innerHTML = this.page(target, "right");
    } else {
      $(".album-page.left", this.pages).innerHTML = this.page(target, "left");
    }
    this.sheet = document.createElement("div");
    this.sheet.className = "flip-sheet";
    this.sheet.setAttribute("aria-hidden", "true");
    this.sheet.inert = true;
    this.sheet.innerHTML = `
      <div class="flip-face front right">
        ${this.page(direction > 0 ? old : target, "right")}
      </div>
      <div class="flip-face back left">
        ${this.page(direction > 0 ? target : old, "left")}
      </div>
    `;
    this.pages.append(this.sheet);
    this.angle = direction > 0 ? 0 : -180;
    this.sheet.style.transform = `rotateY(${this.angle}deg)`;
    return true;
  }

  async finishTurn(commit = true) {
    if (!this.sheet) return;
    const from = this.angle;
    const to = commit
      ? this.direction > 0
        ? -180
        : 0
      : this.direction > 0
        ? 0
        : -180;
    if (!motion.matches) {
      const animation = this.sheet.animate(
        [
          { transform: `rotateY(${from}deg)`, "--page-shadow": ".1" },
          {
            transform: `rotateY(${(from + to) / 2}deg)`,
            "--page-shadow": ".75",
            offset: 0.5,
          },
          { transform: `rotateY(${to}deg)`, "--page-shadow": ".05" },
        ],
        {
          duration: Math.max(360, (900 * Math.abs(to - from)) / 180),
          easing: "cubic-bezier(.32, .05, .22, 1)",
          fill: "forwards",
        },
      );
      await animation.finished;
    }
    if (commit) this.current = this.target;
    this.sheet = null;
    this.busy = false;
    this.render();
  }

  turn(direction) {
    if (this.startTurn(direction)) this.finishTurn();
  }

  bind() {
    $("#album-prev").addEventListener("click", () => this.turn(-1));
    $("#album-next").addEventListener("click", () => this.turn(1));
    $("#album-browse").addEventListener("click", () => {
      if (this.current === spreads.length - 1 && !this.busy) {
        this.current = 0;
        this.render();
      } else {
        this.turn(1);
      }
    });
    this.book.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        this.turn(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.turn(-1);
      }
    });
    this.pages.addEventListener("click", (event) => {
      const button = event.target.closest("[data-photo]");
      if (!button || this.busy || Date.now() - this.lastDrag < 400) return;
      this.openPhoto(Number(button.dataset.photo));
    });
    this.book.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || this.busy) return;
      this.drag = { x: event.clientX, y: event.clientY, active: false };
    });
    this.book.addEventListener("pointermove", (event) => {
      if (!this.drag) return;
      const dx = event.clientX - this.drag.x;
      const dy = event.clientY - this.drag.y;
      if (
        !this.drag.active &&
        Math.abs(dy) > Math.abs(dx) &&
        Math.abs(dy) > 10
      ) {
        this.drag = null;
        return;
      }
      if (!this.drag.active && Math.abs(dx) > 14) {
        if (!this.startTurn(dx < 0 ? 1 : -1)) {
          this.drag = null;
          return;
        }
        this.drag.active = true;
        this.book.setPointerCapture(event.pointerId);
      }
      if (this.drag.active) {
        const progress = Math.min(
          1,
          Math.abs(dx) / (this.book.clientWidth * 0.5),
        );
        this.drag.progress = progress;
        this.angle =
          this.direction > 0 ? -180 * progress : -180 + 180 * progress;
        this.sheet.style.transform = `rotateY(${this.angle}deg)`;
        this.sheet.style.setProperty(
          "--page-shadow",
          String(Math.sin(progress * Math.PI) * 0.65),
        );
      }
    });
    this.book.addEventListener("pointerup", (event) => {
      if (!this.drag) return;
      const drag = this.drag;
      this.drag = null;
      if (this.book.hasPointerCapture(event.pointerId))
        this.book.releasePointerCapture(event.pointerId);
      if (drag.active) {
        this.lastDrag = Date.now();
        this.finishTurn(drag.progress > 0.15);
      }
    });
    this.book.addEventListener("pointercancel", () => {
      if (this.drag?.active) this.finishTurn(false);
      this.drag = null;
    });
    $("#photo-prev").addEventListener("click", () => this.changePhoto(-1));
    $("#photo-next").addEventListener("click", () => this.changePhoto(1));
    $("#photo-dialog").addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        this.changePhoto(event.key === "ArrowRight" ? 1 : -1);
      }
    });
  }

  openPhoto(index) {
    this.photoIndex = index;
    this.displayPhoto();
    openDialog($("#photo-dialog"));
  }

  displayPhoto() {
    const [src, caption] = this.photos[this.photoIndex];
    $("#lightbox-image").src = src;
    $("#lightbox-image").alt = caption;
    $("#lightbox-caption").textContent = caption;
  }

  changePhoto(direction) {
    this.photoIndex =
      (this.photoIndex + direction + this.photos.length) % this.photos.length;
    this.displayPhoto();
  }
}

function initializeNavigation() {
  $(".menu-toggle").addEventListener("click", () =>
    openDialog($("#mobile-nav")),
  );
  $$("#mobile-nav a").forEach((link) => {
    link.addEventListener("click", () => $("#mobile-nav").close());
  });
  const header = $(".site-header");
  window.addEventListener(
    "scroll",
    () => {
      header.classList.toggle("scrolled", window.scrollY > 15);
    },
    { passive: true },
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );
  $$(".section").forEach((section) => observer.observe(section));
}

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function initializeBooking() {
  const dateField = $("#booking-date");
  dateField.min = localDate();
  dateField.value = localDate();
  $("#booking-form").addEventListener("submit", (event) => {
    event.preventDefault();
    dateField.min = localDate();
    if (!event.currentTarget.reportValidity()) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.date < localDate()) {
      dateField.setCustomValidity("Scegli una data a partire da oggi.");
      dateField.reportValidity();
      return;
    }
    if (settings.booking.mode === "external" && settings.booking.url) {
      const url = new URL(settings.booking.url);
      if (url.protocol !== "https:")
        throw new Error("La piattaforma richiede HTTPS.");
      for (const [key, value] of Object.entries(data)) {
        url.searchParams.set(settings.booking.parameterNames[key], value);
      }
      window.location.assign(url.href);
      return;
    }
    const formattedDate = new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${data.date}T12:00:00`));
    showContent(`
      <p class="dialog-eyebrow">Ti aspettiamo a Civita</p>
      <h2 id="dialog-title">Parliamone a tavola.</h2>
      <p>Hai scelto <strong>${escapeHtml(formattedDate)}</strong>,
      alle <strong>${escapeHtml(data.time)}</strong>, per
      <strong>${escapeHtml(data.guests)} ${data.guests === "1" ? "persona" : "persone"}</strong>.</p>
      <p class="demo-message">
        Nessuna richiesta è stata inviata e nessun tavolo è stato prenotato.
        La piattaforma online deve ancora essere collegata.
      </p>
      <p>Per verificare la disponibilità e prenotare, contatta direttamente Kamastra.</p>
      <a class="button" href="tel:${settings.phoneLink}">Chiama ${settings.phone}</a>
    `);
  });
  dateField.addEventListener("input", () => dateField.setCustomValidity(""));
}

function initializeVideo() {
  const video = $("#hero-video");
  const toggle = $("#video-toggle");
  const source =
    window.innerWidth <= 760
      ? settings.video.mobile || settings.video.desktop
      : settings.video.desktop;
  if (!source) return;
  video.src = source;
  video.hidden = false;
  $("#hero-poster").hidden = true;
  $(".media-credit").hidden = true;
  toggle.hidden = false;
  const update = () => {
    toggle.textContent = video.paused ? "Riproduci" : "Pausa";
    toggle.setAttribute(
      "aria-label",
      video.paused ? "Riproduci il video" : "Metti in pausa il video",
    );
  };
  let userPaused = motion.matches;
  if (motion.matches) {
    video.autoplay = false;
    video.pause();
    update();
  } else {
    video.play().catch(update);
  }
  toggle.addEventListener("click", () => {
    if (video.paused) {
      userPaused = false;
      video.play().catch(update);
    } else {
      userPaused = true;
      video.pause();
    }
  });
  video.addEventListener("play", update);
  video.addEventListener("pause", update);
  video.addEventListener("error", () => {
    video.hidden = true;
    $("#hero-poster").hidden = false;
    toggle.hidden = true;
    $(".media-credit").hidden = false;
  });
  new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (!userPaused) video.play().catch(update);
    },
    { threshold: 0.15 },
  ).observe(video);
}

function initializeEditorialPanels() {
  $("#story-more").addEventListener("click", () =>
    showContent(`
    <p class="dialog-eyebrow">Le nostre radici · Civita</p>
    <h2 id="dialog-title">Un luogo da condividere.</h2>
    <p class="dialog-intro">Dalla filanda alla tavola, nel cuore di Civita.</p>
    <p>Il ristorante Kamastra nasce nel <strong>luglio 1995</strong>,
    da un’intuizione di <strong>Enzo Filardi</strong>, avvocato e compositore
    per diletto di musica etnica arbëreshe.</p>
    <p>La sala occupa ambienti che negli anni Cinquanta erano adibiti a
    <strong>filanda</strong>. Archi in mattoni e travi di legno custodiscono
    il carattere di questo luogo.</p>
    <p>La cucina racconta il legame tra le risorse locali e le tradizioni
    <strong>arbëreshe</strong>: un incontro tra la terra calabrese e
    le influenze balcaniche.</p>
    <p class="demo-message">Testo basato sul sito ufficiale Kamastra.
    La storia della famiglia e le fotografie d’archivio saranno integrate
    dopo la verifica del ristorante.</p>
    <a class="button" href="#prenota" data-go-booking>Ci vediamo a tavola</a>
  `),
  );
  $("#dialog-body").addEventListener("click", (event) => {
    if (event.target.closest("[data-go-booking]")) $("#content-dialog").close();
  });
  $("#project-info").addEventListener("click", () =>
    showContent(`
    <p class="dialog-eyebrow">Prima versione navigabile</p>
    <h2 id="dialog-title">Un progetto, in divenire.</h2>
    <p>Questa anteprima presenta le sei sezioni e le interazioni del nuovo
    sito Kamastra.</p>
    <p>Le immagini della nonna e della famiglia sono <strong>generate e
    dimostrative</strong>. Le altre fotografie provengono dal sito Kamastra;
    l’autorizzazione alla nuova pubblicazione va confermata.</p>
    <p>Il lettering usa il <strong>font Sloop fornito</strong> come testo reale
    e modificabile, sovrapposto ai titoli in Bebas Neue. Georgia è il carattere
    di lettura provvisorio, da approvare.</p>
    <p>Menù, prezzi, allergeni, orari ufficiali e fotografie storiche sono
    da validare. Il video, il CMS e la piattaforma di prenotazione
    <strong>non sono ancora collegati</strong>.</p>
    <p class="demo-message">Questa versione non installa cookie analitici
    o di marketing e non invia i dati del modulo. Le richieste di prenotazione
    si gestiscono direttamente per telefono.</p>
  `),
  );
}

async function main() {
  initializeDialogs();
  await initializeMenu();
  const illustrations = $$("[data-art]");
  await Promise.all([
    ...illustrations.map(async (element) => {
      try {
        element.innerHTML = await getArtwork(element.dataset.art);
      } catch (error) {
        console.error(error);
      }
    }),
  ]);
  document.body.classList.add("motion-ready");
  initializeNavigation();
  const carousel = new DishCarousel();
  new CivitaAlbum();
  initializeBooking();
  initializeVideo();
  initializeEditorialPanels();
  motion.addEventListener("change", () => {
    carousel.paused = motion.matches;
    carousel.updatePause();
  });
}

main().catch((error) => {
  document.body.classList.remove("motion-ready");
  console.error("Inizializzazione incompleta:", error);
});
