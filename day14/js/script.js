const STORAGE_KEY = "stacksBooks";
const DATA_VERSION = "2";

const spineColor = {
  "Fiction": "#ef30d9",
  "Non-fiction": "#33f075",
  "Sci-fi": "#ef5330",
  "Biography": "#1abbe8"
};

const statusClass = {
  "Read": "status-read",
  "Unread": "status-unread"
};

let books = [];
let activeGenre = "all";
let pendingDeleteId = null;
let tagify = null;

const grid = document.getElementById("bookGrid");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");
const filterRow = document.getElementById("filterRow");
const genreFilter = document.getElementById("genreFilter");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const detailsModalEl = document.getElementById("detailsModal");
const detailsModal = new bootstrap.Modal(detailsModalEl);
const detailsBody = document.getElementById("detailsBody");

const bookFormModalEl = document.getElementById("bookFormModal");
const bookFormModal = new bootstrap.Modal(bookFormModalEl);
const bookForm = document.getElementById("bookForm");
const formModalTitle = document.getElementById("formModalTitle");

const deleteModalEl = document.getElementById("deleteModal");
const deleteModal = new bootstrap.Modal(deleteModalEl);


async function loadBooks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    books = JSON.parse(saved);
    afterLoad();
    return;
  }
  try {
    const res = await fetch("assests/books.json");
    books = await res.json();
  } catch (err) {
    books = [];
    console.error("Could not load assets/books.json", err);
  }
  persist();
  afterLoad();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function afterLoad() {
  buildGenreControls();
  buildStatusControl();
  render();
}


function buildGenreControls() {
  const genres = [...new Set(books.map(b => b.genre))].sort();
 
  genreFilter.innerHTML = `<option value="all">All genres</option>` +
    genres.map(g => `<option value="${g}">${g}</option>`).join("");
  genreFilter.value = activeGenre;
 
  filterRow.innerHTML = `<span class="filter ${activeGenre === "all" ? "active" : ""}" data-genre="all">All (${books.length})</span>` +
    genres.map(g => {
      const count = books.filter(b => b.genre === g).length;
      return `<span class="filter ${activeGenre === g ? "active" : ""}" data-genre="${g}">${g} (${count})</span>`;
    }).join("");
 
  filterRow.querySelectorAll(".filter").forEach(filter => {
    filter.addEventListener("click", () => {
      activeGenre = filter.dataset.genre;
      genreFilter.value = activeGenre;
      buildGenreControls();
      render();
    });
  });
}

function buildStatusControl() {
  const statuses = [...new Set(books.map(b => b.status))].sort();
  statusFilter.innerHTML = `<option value="all">Any status</option>` +
    statuses.map(s => `<option value="${s}">${s}</option>`).join("");
}


function getFiltered() {
  const q = searchInput.value.trim().toLowerCase();
  const genre = genreFilter.value;
  const status = statusFilter.value;

  let list = books.filter(b => {
    const matchesQuery = !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.isbn || "").toLowerCase().includes(q);
    const matchesGenre = genre === "all" || b.genre === genre;
    const matchesStatus = status === "all" || b.status === status;
    return matchesQuery && matchesGenre && matchesStatus;
  });

  const sortKey = sortSelect.value;
  list = list.slice().sort((a, b) => {
    if (sortKey === "title") return a.title.localeCompare(b.title);
    if (sortKey === "author") return a.author.localeCompare(b.author);
    if (sortKey === "year") return (b.year || 0) - (a.year || 0);
    if (sortKey === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return list;
}

function stars(n) {
  const full = n || 0;
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function initials(title) {
  return title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function render() {
  const list = getFiltered();

  resultCount.textContent = `${list.length} book${list.length === 1 ? "" : "s"} in your catalog`;

  emptyState.classList.toggle("d-none", list.length !== 0);
  grid.classList.toggle("d-none", list.length === 0);

  grid.innerHTML = list.map(b => `
    <div class="col">
      <div class="book-card p-3" tabindex="0" role="button"
           style="--spine:${spineColor[b.genre] || "#A8813C"}" data-id="${b.id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="genre-tag">${b.genre}</span>
          <span class="status-stamp ${statusClass[b.status] || ""}">${b.status}</span>
        </div>
        <div class="book-title mb-1">${b.title}</div>
        <div class="book-author mb-2">${b.author}</div>
        <div class="stars mb-2">${stars(b.rating)}</div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="call-number font-mono">${b.callNumber || ""}</span>
          <i class="fa-solid fa-arrow-up-right-from-square" style="color:#8b8371;font-size:.85rem;"></i>
        </div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".book-card").forEach(card => {
    const open = () => openDetails(Number(card.dataset.id));
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
}


function openDetails(id) {
  const b = books.find(x => x.id === id);
  if (!b) return;

  detailsBody.innerHTML = `
    <div class="d-flex gap-3">
      <div class="cover-block flex-shrink-0" style="width:90px;height:130px;font-size:1.5rem;background:${spineColor[b.genre] || "#22314A"}">${initials(b.title)}</div>
      <div>
        <div class="genre-tag mb-1">${b.genre}</div>
        <div class="book-title fs-5">${b.title}</div>
        <div class="book-author mb-2">${b.author}</div>
        <span class="status-stamp ${statusClass[b.status] || ""}">${b.status}</span>
      </div>
    </div>
    <hr>
    <div class="row font-mono small mb-2" style="color:#6b6357;">
      <div class="col-6">ISBN: ${b.isbn || "—"}</div>
      <div class="col-6">Published: ${b.year || "—"}</div>
    </div>
    <p class="small">${b.description || "No description yet."}</p>
    <div class="d-flex gap-2 mt-3">
      <button class="btn btn-brass btn-sm flex-grow-1" id="toggleStatusBtn">
        <i class="fa-solid ${b.status === "Unread" ? "fa-check" : "fa-rotate-left"} me-1"></i>
        ${b.status === "Unread" ? "Mark as read" : "Mark as unread"}
      </button>
      <button class="btn btn-outline-secondary btn-sm" id="editBtn"><i class="fa-solid fa-pen"></i></button>
      <button class="btn btn-outline-danger btn-sm" id="deleteBtn"><i class="fa-solid fa-trash-can"></i></button>
    </div>
  `;

  document.getElementById("toggleStatusBtn").addEventListener("click", () => {
    b.status = b.status === "Unread" ? "Read" : "Unread";
    persist();
    buildStatusControl();
    render();
    openDetails(id);
  });

  document.getElementById("editBtn").addEventListener("click", () => {
    detailsModal.hide();
    openForm(b);
  });

  document.getElementById("deleteBtn").addEventListener("click", () => {
    pendingDeleteId = id;
    detailsModal.hide();
    deleteModal.show();
  });

  detailsModal.show();
}


function initTagify() {
  tagify = new Tagify(document.getElementById("fTags"), {
    delimiters: ",",
    maxTags: 8,
    dropdown: { enabled: 0 }
  });
}

function openForm(book) {
  bookForm.classList.remove("was-validated");
  document.getElementById("bookId").value = book ? book.id : "";
  document.getElementById("fTitle").value = book ? book.title : "";
  document.getElementById("fAuthor").value = book ? book.author : "";
  document.getElementById("fIsbn").value = book ? book.isbn : "";
  document.getElementById("fGenre").value = book ? book.genre : "Fiction";
  document.getElementById("fStatus").value = book ? book.status : "Unread";
  document.getElementById("fYear").value = book ? book.year : "";
  document.getElementById("fDescription").value = book ? book.description : "";

  tagify.removeAllTags();
  if (book && book.tags) tagify.addTags(book.tags);

  formModalTitle.textContent = book ? "Edit book" : "Add a book";
  bookFormModal.show();
}

document.getElementById("openAddBtn").addEventListener("click", () => openForm(null));

bookForm.addEventListener("submit", e => {
  e.preventDefault();

  if (!bookForm.checkValidity()) {
    bookForm.classList.add("was-validated");
    return;
  }

  const id = document.getElementById("bookId").value;
  const tagValues = tagify.value.map(t => t.value);

  const payload = {
    title: document.getElementById("fTitle").value.trim(),
    author: document.getElementById("fAuthor").value.trim(),
    isbn: document.getElementById("fIsbn").value.trim(),
    genre: document.getElementById("fGenre").value,
    status: document.getElementById("fStatus").value,
    year: Number(document.getElementById("fYear").value) || null,
    description: document.getElementById("fDescription").value.trim(),
    tags: tagValues
  };

  if (id) {
    const existing = books.find(b => b.id === Number(id));
    Object.assign(existing, payload);
  } else {
    const newId = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
    books.push({
      id: newId,
      ...payload,
      rating: 0,
      callNumber: genreCallNumber(payload.genre, payload.author, newId)
    });
  }

  persist();
  buildGenreControls();
  buildStatusControl();
  render();
  bookFormModal.hide();
});

function genreCallNumber(genre, author, id) {
  const prefix = { "Fiction": "FIC", "Non-fiction": "NF", "Sci-fi": "SF", "Biography": "BIO" }[genre] || "GEN";
  const authorCode = (author || "XXX").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "XXX";
  return `${prefix}-${authorCode}-${String(id).padStart(2, "0")}`;
}


document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
  books = books.filter(b => b.id !== pendingDeleteId);
  pendingDeleteId = null;
  persist();
  buildGenreControls();
  buildStatusControl();
  render();
  deleteModal.hide();
});


searchInput.addEventListener("input", render);
genreFilter.addEventListener("change", () => { activeGenre = genreFilter.value; buildGenreControls(); render(); });
statusFilter.addEventListener("change", render);
sortSelect.addEventListener("change", render);


initTagify();
loadBooks();