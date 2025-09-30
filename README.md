# Dice Game Embedding Guide

This repository now includes a lightweight embed script that lets you launch the single-player dice game from any external site inside a modal window.

## Quick start

1. Make sure this project is deployed and accessible over HTTPS (for example at `https://dreamworldpointbank.com`).
2. Add the following snippet to the page where you want the launch button to appear:

```html
<script
  src="https://dreamworldpointbank.com/embed/dice-embed.js"
  data-game-url="https://dreamworldpointbank.com/game.html"
  data-button-text="Play DreamWorld Dice"
></script>
```

When the script loads it will append a styled button to the end of the page. Clicking the button opens a modal with an iframe that displays the game.

### Optional data attributes

| Attribute | Description |
|-----------|-------------|
| `data-target` | CSS selector for an element where the button should be appended. Defaults to `body`. |
| `data-button-class` | Extra class names that will be added to the generated button so you can reuse your site's styling. |
| `data-button-text` | Text shown inside the launch button. |
| `data-game-url` | URL that will be loaded inside the iframe. Defaults to `/game.html`. |

If the `data-target` selector cannot be found, the button falls back to being appended to the `body`.

### Modal behaviour

* Clicking outside the modal content or on the close button will dismiss the game.
* The modal automatically sizes itself for desktop and mobile screens and keeps the iframe responsive.

### Styling

A minimal default style is injected for the button, modal overlay, and close button. Override the look and feel by applying your own classes through `data-button-class` or overriding the `.dice-embed__*` CSS selectors in your site's stylesheet.

## Local development

Serve the project with the existing Node.js server (for example, `npm install` then `npm run start`) and visit `/embed/dice-embed.js` to confirm the script loads correctly.
