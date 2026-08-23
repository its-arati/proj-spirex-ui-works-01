# Day 16 — Event Registration Portal

A small event discovery and booking app built for browsing upcoming events, registering for them, and tracking saved bookings in one place. The project includes an event listing page and a dedicated registrations page for managing booked events.

## Features

- Browse a grid of events with title, date, venue, and category
- Filter events by category using interactive buttons
- Register for an event from a modal form
- Validate form inputs for name, email, and phone number
- Show booking count in the top navigation
- View and cancel saved bookings from a separate page
- Keep registration data in `localStorage`

## Tech / Libraries

- HTML
- CSS
- JavaScript
- Bootstrap 5 for layout and modal components
- Bootstrap Icons for UI visuals

## How to Run

1. Open [index.html](index.html) in a browser, or launch the folder with Live Server in VS Code.
2. Browse available events and use the category filters to narrow the list.
3. Click “Register” on any event and complete the booking form.
4. Open [bookings.html](bookings.html) to review your registrations and cancel any booking.

## Files of Interest

- [index.html](index.html) — event listing page
- [bookings.html](bookings.html) — saved registrations page
- [js/script.js](js/script.js) — loading events, booking logic, and filtering behavior
- [assets/events.json](assets/events.json) — event dataset
- [css/style.css](css/style.css) — page styling and layout

## Notes

- Booking records are stored in `localStorage` using the key `eventhub_bookings`.
- If an event reaches capacity, the register button is disabled and labeled as “Sold out”.
- A user can cancel a booking either from the event card or from the bookings page.
