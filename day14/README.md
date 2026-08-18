# Day 14 — Online Book Library

A small single-page app that demonstrates a client-side book catalog with search, filters, and basic CRUD.

Features
- Browse a grid of books with genre and status tags
- Search by title, author, or ISBN
- Filter by genre and read/unread status
- Sort by title, author, year, or rating
- Add, edit, and delete books (saved to `localStorage`)
- Tag input using Tagify for book keywords

Tech / libraries
- HTML, CSS, JavaScript
- Bootstrap 5 for layout and modals
- Tagify for tag input

How to run
1. Open [index.html](index.html) in a browser (or use Live Server in VS Code).
2. The app loads initial data from `assests/books.json` and then saves changes to `localStorage`.

Notes
- The initial dataset is stored in `assests/books.json` inside this folder.
- Data persists in your browser; to reset the catalog clear the `stacksBooks` key from `localStorage`.
