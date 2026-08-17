# Day 13 — Job Application Tracker

A front-end dashboard for managing job applications and tracking interview progress. The app presents application stats, a list of active pipelines, and a modal-based workflow for adding new applications to the tracker.

## Description

This project simulates a lightweight recruiting dashboard with:

- a navigation bar and welcome section
- summary cards for total applications, interviewing counts, offers, and conversion rate
- an application table showing company, role, applied date, stage, and status
- a status filter for viewing application categories
- a new application flow that loads available jobs and confirms a submission

The interface is built with HTML, CSS, Bootstrap, and JavaScript custom elements to organize reusable UI sections.

## Files

- `index.html` — overall dashboard structure and layout containers
- `css/style.css` — custom styling for the tracker interface
- `js/script.js` — analytics logic, dashboard cards, filters, and application data presentation
- `js/new-application.js` — Create-new-application modal and job selection workflow
- `assets/db.json` — sample user and application data
- `assets/jobs.json` — available job listings used by the new application flow

## How to run

Open the folder and load `index.html` in a browser, or use a VS Code Live Server extension:

1. Open the folder in VS Code.
2. Right-click `index.html` and choose "Open with Live Server" or open it directly in a browser.

## Notes

- The dashboard uses a fake local datastore pattern to simulate persistent application data.
- Application metrics are computed from the saved job records and are displayed in summary cards.
- The filter bar updates the URL query string so the selected status can be shared or refreshed.
- The new application modal loads available roles and lets the user confirm before adding a job to the tracker.
