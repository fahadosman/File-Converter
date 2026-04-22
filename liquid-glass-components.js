(function () {
  function createGlassButton(options = {}) {
    const button = document.createElement("button");
    button.type = options.type || "button";
    button.className = `glass-btn ${options.primary ? "glass-btn--primary" : ""}`.trim();
    button.textContent = options.label || "Button";
    if (typeof options.onClick === "function") button.addEventListener("click", options.onClick);
    return button;
  }

  function createGlassCard(options = {}) {
    const card = document.createElement("article");
    card.className = "glass-surface";
    card.style.borderRadius = "20px";
    card.style.padding = "20px";

    if (options.title) {
      const title = document.createElement("h3");
      title.textContent = options.title;
      title.style.margin = "0 0 8px";
      card.appendChild(title);
    }

    if (options.body) {
      const body = document.createElement("p");
      body.textContent = options.body;
      body.style.margin = "0";
      card.appendChild(body);
    }

    return card;
  }

  function createGlassPricingCard(options = {}) {
    const card = document.createElement("article");
    card.className = `glass-pricing-card ${options.featured ? "glass-pricing-card--featured" : ""}`.trim();

    card.innerHTML = `
      <p class="glass-pricing-card__tag">${options.tag || "Plan"}</p>
      <h3>${options.title || "Standard"}</h3>
      <p class="glass-pricing-card__price">${options.price || "$0"}<span>${options.period || "/month"}</span></p>
      <ul>${(options.features || []).map((item) => `<li>${item}</li>`).join("")}</ul>
    `;

    card.appendChild(
      createGlassButton({
        label: options.buttonLabel || "Choose Plan",
        primary: Boolean(options.featured),
        onClick: options.onClick,
      })
    );

    return card;
  }

  window.LiquidGlassUI = {
    createGlassButton,
    createGlassCard,
    createGlassPricingCard,
  };
})();
