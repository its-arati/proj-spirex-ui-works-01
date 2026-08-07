# Day 06 - Smart Waste Management Dashboard

This task is a dashboard-style UI built with HTML, CSS, and JavaScript. It visualizes weekly collection trends, waste distribution, and area-wise bin fill levels with live updates.

## How To Open

Open [index.html](index.html) in a browser, or launch it with VS Code Live Server from the `day06` folder.

## Task Structure

- [index.html](index.html) - main dashboard page
- [css/](css/) - dashboard styling
  - [style.css](css/style.css) - layout, cards, chart and status panel styles
- [js/](js/) - dashboard behavior and chart rendering
  - [script.js](js/script.js) - Chart.js setup, area status rendering, and periodic data simulation

## Notes

- The dashboard uses [Chart.js](https://www.chartjs.org/) from a CDN for line and doughnut charts.
- Font Awesome icons are loaded from CDN in the page head.
- Area fill status values are simulated in the browser every few seconds for practice purposes.
