const esc = (s) => typeof s === "string" ? s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])) : s;

class ExamStore {
  constructor() {
    this.candidateName = localStorage.getItem("candidate_name");
    if (!this.candidateName) window.location.href = "init.html";
    document.getElementById("user-display").textContent = this.candidateName;

    this.qStore = new FakeDatastore("exam_questions_store", "questions.json");
    localStorage.removeItem("exam_answers");
    this.aStore = new FakeDatastore("exam_answers", "questions.json");

    this.questions = [];
    this.timerInterval = null;

    this.timer = createWatchable({ time: 600 });
    this.active = createWatchable({ currentIdx: -1 });
    this.stats = createWatchable({
      answers: [],
      seen: [1],
      toReview: [],
      unattended: [1]
    });
  }

  get totalQuestions() { return this.questions.length; }
  get currentQuestion() { return this.questions[this.active.currentIdx] || null; }
  get currentAnswer() { 
    const q = this.currentQuestion;
    return q ? this.stats.answers.find(a => a.qId === q.id) : null; 
  }
  get isCurrentReviewed() { 
    const q = this.currentQuestion;
    return q ? this.stats.toReview.includes(q.id) : false; 
  }

  _syncSetsAndStore() {
    const answeredIds = this.stats.answers.map(a => a.qId);
    this.stats.unattended = this.stats.seen.filter(id => !answeredIds.includes(id));
    this.aStore.update(null, this.stats.answers);
  }

  selectAnswer(qId, optionIdx) {
    const idx = this.stats.answers.findIndex(a => a.qId === qId);
    if (idx > -1) {
      this.stats.answers[idx].selectedOption = optionIdx;
    } else {
      this.stats.answers.push({ qId, selectedOption: optionIdx });
    }
    this._syncSetsAndStore();
  }

  clearAnswer() {
    const q = this.currentQuestion;
    if (!q) return;
    const idx = this.stats.answers.findIndex(a => a.qId === q.id);
    if (idx > -1) {
      this.stats.answers.splice(idx, 1);
      this._syncSetsAndStore();
    }
    this.active.currentIdx = this.active.currentIdx; 
  }

  toggleReview() {
    const q = this.currentQuestion;
    if (!q) return;
    const revIdx = this.stats.toReview.indexOf(q.id);
    if (revIdx > -1) {
      this.stats.toReview.splice(revIdx, 1);
    } else {
      this.stats.toReview.push(q.id);
    }
    this._syncSetsAndStore();
  }

  goTo(idx) {
    if (idx < 0 || idx >= this.totalQuestions) return;
    this.active.currentIdx = idx;
    
    const qId = this.questions[idx].id;
    if (!this.stats.seen.includes(qId)) {
      this.stats.seen.push(qId);
    }
    this._syncSetsAndStore();
  }

  prev() { this.goTo(this.active.currentIdx - 1); }
  next() {
    if (this.active.currentIdx < this.totalQuestions - 1) this.goTo(this.active.currentIdx + 1);
    else this.submit();
  }

  submit(force = false) {
    if (force || confirm("Are you sure you want to submit your examination?")) {
      clearInterval(this.timerInterval);
      this._syncSetsAndStore();
      window.location.href = "result.html";
    }
  }

  async init() {
    this.questions = await this.qStore.defaultValue();
    this.active.currentIdx = 0;
    if (this.questions.length > 0) {
      this.stats.seen = [this.questions[0].id];
      this._syncSetsAndStore();
      this.active.currentIdx = 0; 
    }

    this.timerInterval = setInterval(() => {
      this.timer.time--;
      if (this.timer.time <= 0) {
        clearInterval(this.timerInterval);
        alert("Time is up! Submitting your exam.");
        this.submit(true);
      }
    }, 1000);
  }
}

const store = new ExamStore();

customElements.define("active-question", class extends WatchableComponent {
  connectedCallback() {
    this.initComponent(store.active, () => {
      const q = store.currentQuestion;
      if (!q) return `<div class="p-4 text-center">Loading questions...</div>`;

      const currAns = store.currentAnswer;
      const isLast = store.active.currentIdx === store.totalQuestions - 1;

      const prev = document.getElementById("btn-prev");
      const next = document.getElementById("btn-next");
      if (prev) prev.disabled = store.active.currentIdx === 0;
      if (next) next.innerHTML = isLast ? 'Finish <i class="bi bi-check2-circle"></i>' : 'Next <i class="bi bi-arrow-right"></i>';

      return `
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">Question ${store.active.currentIdx + 1} of ${store.totalQuestions}</h5>
          <span class="badge bg-secondary">1 Mark</span>
        </div>
        <div class="card-body p-4 flex-grow-1">
          <p class="fs-5 fw-semibold mb-4">${esc(q.question)}</p>
          <div class="d-flex flex-column">
            ${q.options.map((opt, optIdx) => `
              <input type="radio" class="btn-check" name="optRadio" id="opt-${optIdx}" 
                ${currAns && currAns.selectedOption === optIdx ? "checked" : ""}
                onchange="store.selectAnswer(${q.id}, ${optIdx})">
              <label class="btn btn-outline-primary text-start p-3 w-100 mb-2" for="opt-${optIdx}">
                <strong>${String.fromCharCode(65 + optIdx)}.</strong> ${esc(opt)}
              </label>
            `).join("")}
          </div>
        </div>
      `;
    });
  }
});

customElements.define("question-palette", class extends WatchableComponent {
  connectedCallback() {
    this.initComponent(store.stats, (stats) => {
      const answeredIds = stats.answers.map(a => a.qId);

      return `
        <div class="palette-grid mb-4">
          ${store.questions.map((q, idx) => {
            const isCurrent = idx === store.active.currentIdx;
            let color = "btn-light text-dark";

            if (stats.toReview.includes(q.id)) color = "btn-warning text-dark";
            else if (answeredIds.includes(q.id)) color = "btn-success text-white";
            else if (stats.unattended.includes(q.id)) color = "btn-danger text-white";

            return `
              <button type="button" class="btn btn-sm ${color} ${isCurrent ? 'border-3 border-primary' : ''}" 
                onclick="store.goTo(${idx})">
                ${idx + 1}
              </button>
            `;
          }).join("")}
        </div>
      `;
    });
  }
});

customElements.define("palette-counters", class extends WatchableComponent {
  connectedCallback() {
    this.initComponent(store.stats, (stats) => `
      <div class="bg-light p-3 rounded">
        <div class="d-flex justify-content-between mb-2">
          <span>Attempted:</span>
          <span class="fw-bold text-success">${stats.answers.length}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span>Not Attempted:</span>
          <span class="fw-bold text-danger">${stats.unattended.length}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Marked for Review:</span>
          <span class="fw-bold text-warning">${stats.toReview.length}</span>
        </div>
      </div>
    `);
  }
});

customElements.define("exam-timer", class extends WatchableComponent {
  connectedCallback() {
    this.initComponent(store.timer, (t) => {
      const m = String(Math.floor(t.time / 60)).padStart(2, "0");
      const s = String(t.time % 60).padStart(2, "0");
      return `<div class="badge bg-danger fs-6 px-3 py-2"><i class="bi bi-clock-fill me-1"></i>${m}:${s}</div>`;
    });
  }
});

window.addEventListener("DOMContentLoaded", () => store.init());