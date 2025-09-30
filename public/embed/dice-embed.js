(function () {
  const currentScript = document.currentScript;
  if (!currentScript) {
    console.error("Dice Embed: unable to locate current script element.");
    return;
  }

  const gameUrl = currentScript.getAttribute("data-game-url") || "/game.html";
  const buttonText = currentScript.getAttribute("data-button-text") || "Play Dice Game";
  const targetSelector = currentScript.getAttribute("data-target");
  const buttonClasses = currentScript.getAttribute("data-button-class");

  function createStyles() {
    if (document.getElementById("dice-embed-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "dice-embed-styles";
    style.textContent = `
      .dice-embed__button {
        padding: 0.6rem 1.2rem;
        border-radius: 999px;
        border: none;
        font-family: inherit;
        font-size: 1rem;
        background: linear-gradient(135deg, #ffae00, #ff5a36);
        color: #fff;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .dice-embed__button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
      }

      .dice-embed__overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9999;
      }

      .dice-embed__modal {
        width: min(900px, 90vw);
        height: min(600px, 90vh);
        background: #0f172a;
        border-radius: 18px;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.45);
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
      }

      .dice-embed__close {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(15, 23, 42, 0.85);
        color: #fff;
        border: none;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        font-size: 1.4rem;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }

      .dice-embed__close:hover {
        transform: scale(1.05);
      }

      .dice-embed__iframe {
        flex: 1;
        border: none;
        width: 100%;
        height: 100%;
        background: #000;
      }

      @media (max-width: 600px) {
        .dice-embed__modal {
          width: 95vw;
          height: 85vh;
          border-radius: 12px;
        }

        .dice-embed__close {
          width: 36px;
          height: 36px;
          font-size: 1.2rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = buttonText;
    button.className = "dice-embed__button";

    if (buttonClasses) {
      button.className += ` ${buttonClasses}`;
    }

    button.addEventListener("click", openModal);
    return button;
  }

  function openModal() {
    const overlay = document.createElement("div");
    overlay.className = "dice-embed__overlay";

    const modal = document.createElement("div");
    modal.className = "dice-embed__modal";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "dice-embed__close";
    closeButton.setAttribute("aria-label", "Close Dice Game");
    closeButton.innerHTML = "&times;";

    const iframe = document.createElement("iframe");
    iframe.className = "dice-embed__iframe";
    iframe.src = gameUrl;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

    function closeModal() {
      document.body.removeChild(overlay);
      document.removeEventListener("keydown", handleKeydown);
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    closeButton.addEventListener("click", closeModal);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeModal();
      }
    });

    document.addEventListener("keydown", handleKeydown);

    modal.appendChild(closeButton);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  function mount() {
    createStyles();

    const button = createButton();
    if (targetSelector) {
      const target = document.querySelector(targetSelector);
      if (target) {
        target.appendChild(button);
        return;
      }
      console.warn(`Dice Embed: target '${targetSelector}' not found. Appending button to body.`);
    }
    document.body.appendChild(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
