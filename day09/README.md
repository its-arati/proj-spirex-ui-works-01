# Day 09 — Interactive Image Gallery

A front-end exercise that displays a searchable image gallery with tag-based filtering and a modal preview.

## Description

This page loads image metadata from a JSON file and renders a responsive gallery. Users can:

- search images by tags using a tag input field
- filter the gallery to match selected tags
- click any image to open a larger preview modal
- read the title and description for the selected image

## Files

- `index.html` — main gallery layout and modal markup
- `css/style.css` — gallery styling, layout, and preview appearance
- `js/script.js` — image loading, filtering, tag handling, and modal behavior
- `assets/images.json` — image metadata used by the gallery

## How to run

Open the folder and load `index.html` in a browser, or use a VS Code Live Server extension:

1. Open the folder in VS Code.
2. Right-click `index.html` and choose "Open with Live Server" (if installed), or open the file directly in a browser.

## Notes

- The gallery data is loaded asynchronously from `assets/images.json`.
- Tag filtering is powered by the Tagify input and matches tags in the image metadata.
- The gallery is made using Bootstrap.
- Clicking an image opens a modal preview that displays the selected image and description.

