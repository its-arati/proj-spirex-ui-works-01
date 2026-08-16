# Day 12 — Typing Speed Test

A small JavaScript typing challenge that measures how quickly and accurately a user types a sample paragraph. The app shows a random paragraph, tracks each key press, and calculates typing speed, word count, and accuracy when the user clicks the result button.

## Description

This project simulates a typing test with:

- a random paragraph loaded from a JSON file
- keyboard tracking for each typed key
- time-based word and speed calculation
- accuracy analysis based on expected text and typed words
- a results panel showing WPM and summary metrics

The app is built with plain HTML, CSS, Bootstrap styling, and JavaScript logic for tracking and evaluation.

## Files

- `index.html` — page structure for the typing test and results panel
- `css/style.css` — styling for the main typing interface
- `js/script.js` — key tracking, sample loading, result computation, and rendering logic
- `assets/samples.json` — paragraph dataset used to generate typing prompts

## How to run

Open the folder and load `index.html` in a browser, or use a VS Code Live Server extension:

1. Open the folder in VS Code.
2. Right-click `index.html` and choose "Open with Live Server" or open it directly in a browser.

## Notes

- The app picks a random paragraph from the JSON file each time the page loads.
- Timing is measured from the first keystroke to the last keystroke in the session.
- Accuracy is calculated by comparing the typed words with the expected paragraph text.
- The result card displays WPM, accuracy, correct and incorrect words, and other summary statistics.
