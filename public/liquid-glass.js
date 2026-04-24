(function () {
  function initGlassNavbar() {
    const navbar = document.querySelector("[data-glass-navbar]");
    if (!navbar) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset || 0;
        navbar.classList.toggle("is-scrolled", y > 12);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initGlassModal() {
    const openerNodes = document.querySelectorAll("[data-glass-open-modal]");
    const closers = document.querySelectorAll("[data-glass-close-modal]");
    if (!openerNodes.length) return;

    function openModalById(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }

    openerNodes.forEach((node) => {
      node.addEventListener("click", () => openModalById(node.getAttribute("data-glass-open-modal")));
    });

    closers.forEach((node) => {
      node.addEventListener("click", () => closeModal(node.closest(".glass-modal")));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      document.querySelectorAll(".glass-modal.is-open").forEach(closeModal);
    });
  }

  function initButtonRipple() {
    const targets = document.querySelectorAll(".glass-btn");
    targets.forEach((button) => {
      button.addEventListener("click", (event) => {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "glass-ripple";
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        button.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 620);
      });
    });
  }

  initGlassNavbar();
  initGlassModal();
  initButtonRipple();
})();
