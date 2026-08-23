# Day 17 — Virtual Keyboard

A small interactive virtual keyboard that types into a textarea. The keyboard supports character input, Delete, Space, Enter, and a Shift toggle that switches between uppercase and lowercase.

## Features

- Clickable virtual keys that append characters to the textarea
- `Delete` button that removes the last character
- `Space` and `Enter` controls
- `Shift` toggle to switch between upper- and lowercase input
- Simple, responsive layout with a background image and accessible controls

## Tech / Libraries

- HTML
- CSS
- JavaScript (vanilla)

## How to Run

1. Open [index.html](index.html) in a browser, or use Live Server from VS Code.
2. Click the virtual keys to type into the textarea. Use `Shift` to toggle case, `Delete` to remove characters, `Space` to add spaces, and `Enter` to insert line breaks.

## Files of Interest

- [index.html](index.html) — keyboard layout and textarea
- [js/script.js](js/script.js) — key handling and input logic
- [css/style.css](css/style.css) — UI styling

## Notes

- The keyboard is built with plain DOM event listeners and stores no persistent data.
- The `Shift` button toggles a simple case transform by rewriting key labels.
- This is a front-end-only widget designed for practice and demonstration purposes.
