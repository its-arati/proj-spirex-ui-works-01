# Day 11 — Shopping Cart Product Listing

A front-end shopping UI built with HTML, CSS, JavaScript, Bootstrap, and dynamic product data. The page displays products from a JSON catalog and lets users add or remove items from a cart.

## Description

This project simulates an online storefront with:

- a top navigation bar and search form
- product cards rendered from a JSON data source
- filter logic based on product tags and search query
- a slide-out shopping cart panel
- quantities and total price tracking in local storage

The interface uses a product catalog for clothing and electronics and loads the related data dynamically from the JSON files in the `assets` folder.

## Files

- `index.html` — storefront layout, navigation, and cart panel structure
- `css/style.css` — custom shopping page styling and cart appearance
- `js/script.js` — product loading, cart logic, search handling, and rendering
- `assets/products_cms_extended.json` — full product catalog used by the store
- `assets/clothing.json` — clothing product data
- `assets/laptops.json` — laptop product data

## How to run

Open the folder and load `index.html` in a browser, or use a VS Code Live Server extension:

1. Open the folder in VS Code.
2. Right-click `index.html` and choose "Open with Live Server" (if installed), or open the file directly in a browser.

## Notes

- Product data is loaded from JSON files using `fetch()`.
- The cart persists across page reloads using `localStorage`.
- Search and filtering logic can switch product sets by URL query input.
- Bootstrap provides layout and styling, while custom JavaScript manages the storefront behavior.
