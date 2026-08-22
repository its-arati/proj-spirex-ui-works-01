
const DATA_URL = "assets/events.json";
const BOOKINGS_KEY = "eventhub_bookings";


function getBookings() {
  const raw = localStorage.getItem(BOOKINGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function isBooked(eventId) {
  return getBookings().some(b => b.id === eventId);
}

function addBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
}

function removeBooking(eventId) {
  saveBookings(getBookings().filter(b => b.id !== eventId));
}

function updateBookingBadge() {
  const badge = document.getElementById("bookingCountBadge");
  if (!badge) return;
  const count = getBookings().length;
  badge.textContent = count;
  badge.classList.toggle("d-none", count === 0);
}


function showToast(message) {
  const toastEl = document.getElementById("Toast");
  const bodyEl = document.getElementById("ToastBody");
  if (!toastEl || !bodyEl) return;
  bodyEl.textContent = message;
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2200 });
  toast.show();
}


function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}


async function loadEvents() {
  const res = await fetch(DATA_URL);
  const data = await res.json();
  return data.events;
}

function buildEventCard(event) {
  const booked = isBooked(event.id);
  const soldOut = event.registered >= event.capacity && !booked;

  const col = document.createElement("div");
  col.className = "col-sm-6 col-lg-4";

  col.innerHTML = `
    <div class="ticket-card">
      <div class="ticket-image" style="background-image:url('${event.image}')">
        <span class="ticket-category">${event.category}</span>
      </div>
      <div class="ticket-body">
        <h3 class="ticket-title">${event.title}</h3>
        <h4 class="ticket-info">${event.description}</h4>
        <p class="ticket-meta"><i class="bi bi-calendar3"></i>${formatDate(event.date)}</p>
        <p class="ticket-meta"><i class="bi bi-geo-alt-fill"></i>${event.venue.city}</p>
      </div>
      <div class="ticket-footer">
        <button
          class="btn-register ${booked ? "registered" : ""}"
          data-id="${event.id}"
          data-title="${event.title}"
          ${soldOut ? "disabled" : ""}
        >${soldOut ? "Sold out" : booked ? "Registered" : "Register"}</button>
      </div>
    </div>
  `;
  return col;
}


function handleRegisterClick(e) {
  const btn = e.target.closest(".btn-register");
  if (!btn || btn.disabled) return;
  const id = btn.dataset.id;

  if (isBooked(id)) {
    removeBooking(id);
    btn.classList.remove("registered");
    btn.textContent = "Register";
    showToast("Booking cancelled.");
    updateBookingBadge();
    return;
  }

  openRegisterModal(id, btn.dataset.title);
}


function openRegisterModal(eventId, eventTitle) {
  const modalEl = document.getElementById("registerModal");
  if (!modalEl) return;

  const form = document.getElementById("registerForm");
  form.reset();
  form.classList.remove("was-validated");
  document.getElementById("regEventId").value = eventId;
  document.getElementById("regEventName").textContent = eventTitle;

  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const eventId = document.getElementById("regEventId").value;
    const booking = {
      id: eventId,
      name: document.getElementById("regName").value.trim(),
      email: document.getElementById("regEmail").value.trim(),
      phone: document.getElementById("regPhone").value.trim(),
      bookedAt: new Date().toISOString()
    };
    addBooking(booking);

    const btn = document.querySelector(`.btn-register[data-id="${eventId}"]`);
    if (btn) {
      btn.classList.add("registered");
      btn.textContent = "Registered";
    }

    bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
    showToast("You're registered! Check My Registrations for details.");
    updateBookingBadge();
  });
}

async function initExplorePage() {
  const grid = document.getElementById("eventGrid");
  const emptyState = document.getElementById("emptyState");
  const resultCount = document.getElementById("resultCount");
  const filterRow = document.getElementById("categoryFilters");

  const events = await loadEvents();
  let activeCategory = "all";

 
  const categories = [...new Set(events.map(e => e.category))];
  categories.forEach(cat => {
    const filter = document.createElement("button");
    filter.className = "filter";
    filter.dataset.category = cat;
    filter.textContent = cat;
    filterRow.appendChild(filter);
  });

  function render() {
    const filtered = events.filter(ev => activeCategory === "all" || ev.category === activeCategory);

    grid.innerHTML = "";
    filtered.forEach(ev => grid.appendChild(buildEventCard(ev)));

    resultCount.textContent = `${filtered.length} event${filtered.length !== 1 ? "s" : ""}`;
    emptyState.classList.toggle("d-none", filtered.length !== 0);
    grid.classList.toggle("d-none", filtered.length === 0);
  }

  filterRow.addEventListener("click", e => {
    const filter = e.target.closest(".filter");
    if (!filter) return;
    filterRow.querySelectorAll(".filter").forEach(c => c.classList.remove("active"));
    filter.classList.add("active");
    activeCategory = filter.dataset.category;
    render();
  });

  grid.addEventListener("click", handleRegisterClick);

  render();
  updateBookingBadge();
}


function buildBookingCard(event, booking) {
  const wrapper = document.createElement("div");
  wrapper.className = "booking-card";
  wrapper.innerHTML = `
    <div class="booking-image" style="background-image:url('${event.image}')"></div>
    <div class="booking-body">
      <h3>${event.title}</h3>
      <p class="booking-meta"><i class="bi bi-calendar3"></i>${formatDate(event.date)} · ${event.time}</p>
      <p class="booking-meta"><i class="bi bi-geo-alt-fill"></i>${event.venue.name}, ${event.venue.city}</p>
      <p class="booking-meta"><i class="bi bi-person-fill"></i>${booking.name}</p>
      <p class="booking-meta"><i class="bi bi-envelope-fill"></i>${booking.email}</p>
    </div>
    <div class="booking-actions">
      <button class="btn-cancel" data-id="${event.id}">Cancel booking</button>
    </div>
  `;
  return wrapper;
}

async function initBookingsPage() {
  const list = document.getElementById("bookingsList");
  const emptyState = document.getElementById("bookingsEmpty");

  const events = await loadEvents();

  function render() {
    const bookings = getBookings();

    list.innerHTML = "";
    bookings.forEach(booking => {
      const event = events.find(ev => ev.id === booking.id);
      if (event) list.appendChild(buildBookingCard(event, booking));
    });

    emptyState.classList.toggle("d-none", bookings.length !== 0);
    list.classList.toggle("d-none", bookings.length === 0);
    updateBookingBadge();
  }

  list.addEventListener("click", e => {
    const btn = e.target.closest(".btn-cancel");
    if (!btn) return;
    removeBooking(btn.dataset.id);
    showToast("Booking cancelled.");
    render();
  });

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("eventGrid")) {
    initExplorePage();
    initRegisterForm();
  }
  if (document.getElementById("bookingsList")) {
    initBookingsPage();
  }
});