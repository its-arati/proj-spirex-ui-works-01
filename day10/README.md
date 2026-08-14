# Day 10 — Subscription Pricing Cards

A front-end exercise that displays a set of pricing plans using data loaded from a JSON file. The page renders a responsive layout with highlighted pricing cards and feature lists.

## Description

This project builds a subscription-style pricing page where each plan includes:

- a plan title and subtitle
- a monthly price
- a highlighted popular plan badge
- a checklist of features
- a visually separated card layout with Bootstrap styling

The page is generated dynamically from `assets/prices.json`, making it easy to update plan data without changing the page structure.

## Files

- `index.html` — main pricing page container and script includes
- `css/style.css` — custom card styling, typography, and layout adjustments
- `js/script.js` — loads plan data and renders pricing cards
- `assets/prices.json` — all pricing plan data used by the page

## How to run

Open the folder and load `index.html` in a browser, or use a VS Code Live Server extension:

1. Open the folder in VS Code.
2. Right-click `index.html` and choose "Open with Live Server" (if installed), or open the file directly in a browser.

## Notes

- The plans are rendered from JSON after the page loads.
- The `isPopular` property adds the highlighted "Most Popular" badge.
- Feature items include check marks and optional highlighted emphasis.
- Bootstrap is used for layout and buttons, while custom CSS refinements shape the final appearance.
