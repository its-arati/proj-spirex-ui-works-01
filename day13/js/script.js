function formatDate(value) {
    if (!value) return "";

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date(`${value}T00:00:00`));
}

function formatStage(value) {
    if (!value) return "";

    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, char => char.toUpperCase());
}

function computeAnalytics(applications) {
    const totalApplied = applications.length;

    const interviewing = applications.filter(
        application => application.status === "Interviewing"
    ).length;

    const offersReceived = applications.filter(
        application => application.status === "Offer"
    ).length;

    const rejections = applications.filter(
        application => application.status === "Rejected"
    ).length;

    const conversionRatePercentage = totalApplied
        ? Number(((offersReceived / totalApplied) * 100).toFixed(1))
        : 0;

    const funnelBreakdown = {
        screening: applications.filter(
            application =>
                application.timeline?.some(
                    step => step.stage === "Screening"
                )
        ).length,

        technicalRound: applications.filter(
            application =>
                application.timeline?.some(
                    step => step.stage === "TechnicalRound"
                )
        ).length,

        managerRound: applications.filter(
            application =>
                application.timeline?.some(
                    step => step.stage === "ManagerRound"
                )
        ).length,

        hrRound: applications.filter(
            application =>
                application.timeline?.some(
                    step => step.stage === "HRRound"
                )
        ).length
    };

    const applicationsByMonth = applications.reduce(
        (result, application) => {

            const month = new Date(
                `${application.appliedDate}T00:00:00`
            ).toLocaleString("en-US", {
                month: "long"
            });

            const existing = result.find(
                item => item.month === month
            );

            if (existing) {
                existing.count++;
            } else {
                result.push({
                    month,
                    count: 1
                });
            }

            return result;
        },
        []
    );

    return {
        totalApplied,
        interviewing,
        offersReceived,
        rejections,
        conversionRatePercentage,
        applicationsByMonth,
        funnelBreakdown
    };
}

function statusClass(status) {
    switch (status) {
        case "Interviewing":
            return "bg-warning-subtle text-warning";

        case "Offer":
            return "bg-success-subtle text-success";

        case "Applied":
            return "bg-primary-subtle text-primary";

        case "Rejected":
            return "bg-danger-subtle text-danger";

        default:
            return "bg-secondary-subtle text-secondary";
    }
}

const navbarState  = createWatchable({
    userProfile: {name: ''}
});

class AppNavbar extends WatchableComponent {

    async connectedCallback() {

        this.initComponent(navbarState, (s) => `
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div class="container">
                    <a class="navbar-brand fw-bold" href="#">
                        <i class="bi bi-briefcase-fill me-2"></i>CareerPulse
                    </a>

                    <span class="navbar-text text-white-50 ms-auto">
                        Welcome, <span class="text-white fw-semibold">${s.userProfile.name}</span>
                    </span>
                </div>
            </nav>
        `);
    }
}

customElements.define("app-navbar", AppNavbar);

const statsState = createWatchable({
    analytics: {}
})
class AppDashboardStats extends WatchableComponent {
    async connectedCallback() {
        this.initComponent(statsState, (s) => {
            return `
                <div class="row g-3 mb-4">

                    <div class="col-6 col-lg-3">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-body d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small text-uppercase mb-1 fw-semibold">
                                        Total Applied
                                    </p>
                                    <h3 class="fw-bold m-0 text-dark">${s.analytics.totalApplied}</h3>
                                </div>

                                <div class="bg-primary bg-opacity-10 text-primary p-3 rounded-3 fs-3">
                                    <i class="bi bi-send-fill"></i>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="col-6 col-lg-3">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-body d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small text-uppercase mb-1 fw-semibold">
                                        Interviewing
                                    </p>
                                    <h3 class="fw-bold m-0 text-warning">${s.analytics.interviewing}</h3>
                                </div>

                                <div class="bg-warning bg-opacity-10 text-warning p-3 rounded-3 fs-3">
                                    <i class="bi bi-person-video3"></i>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="col-6 col-lg-3">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-body d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small text-uppercase mb-1 fw-semibold">
                                        Offers Extended
                                    </p>
                                    <h3 class="fw-bold m-0 text-success">${s.analytics.offersReceived}</h3>
                                </div>

                                <div class="bg-success bg-opacity-10 text-success p-3 rounded-3 fs-3">
                                    <i class="bi bi-trophy-fill"></i>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="col-6 col-lg-3">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-body d-flex align-items-center justify-content-between">

                                <div>
                                    <p class="text-muted small text-uppercase mb-1 fw-semibold">
                                        Conversion
                                    </p>
                                    <h3 class="fw-bold m-0 text-info">${s.analytics.conversionRatePercentage}%</h3>
                                </div>

                                <div class="bg-info bg-opacity-10 text-info p-3 rounded-3 fs-3">
                                    <i class="bi bi-pie-chart-fill"></i>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            `
        })
    }
}

customElements.define('app-dashboard-stats', AppDashboardStats);

const applicationsState = createWatchable({
    applications: []
});

class ApplicationTable extends WatchableComponent {

    connectedCallback() {

        this.initComponent(applicationsState, (s) => `
            <div class="card-body px-0">
                <div class="table-responsive">

                    <table class="table table-hover align-middle mb-0">

                        <thead class="table-light text-muted small">
                            <tr>
                                <th class="ps-4">Company & Role</th>
                                <th>Date Applied</th>
                                <th>Current Stage</th>
                                <th>Status</th>
                                <th class="pe-4 text-end">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${
                                s.applications.length
                                    ? s.applications
                                        .map(application => this.renderRow(application))
                                        .join("")
                                    : `
                                        <tr>
                                            <td colspan="5" class="text-center text-muted py-5">
                                                No applications found.
                                            </td>
                                        </tr>
                                    `
                            }
                        </tbody>

                    </table>

                </div>
            </div>
        `);

        this.addEventListener("click", (event) => {

            const button = event.target.closest("[data-edit]");

            if (!button) return;

            this.dispatchEvent(
                new CustomEvent("edit-application", {
                    bubbles: true,
                    detail: {
                        id: button.dataset.edit
                    }
                })
            );
        });
    }

    renderRow(application) {
        return `
            <tr>

                <td class="ps-4">
                    <div class="fw-bold text-dark">
                        ${application.companyName}
                    </div>

                    <div class="text-muted small">
                        ${application.title}

                        ${
                            application.location === "Remote"
                                ? `
                                    <span class="badge bg-light text-dark border ms-1">
                                        Remote
                                    </span>
                                `
                                : ""
                        }
                    </div>
                </td>

                <td class="text-secondary small">
                    ${formatDate(application.appliedDate)}
                </td>

                <td>
                    <span class="badge bg-secondary-subtle text-secondary rounded-pill px-2">
                        ${formatStage(application.stage)}
                    </span>
                </td>

                <td>
                    <span class="badge ${statusClass(application.status)} rounded-pill px-2">
                        ${application.status}
                    </span>
                </td>

                <td class="pe-4 text-end">
                    <button
                        type="button"
                        class="btn btn-sm btn-light border"
                        data-edit="${application.id}"
                        title="Edit Application"
                    >
                        <i class="bi bi-pencil-square"></i>
                    </button>
                </td>

            </tr>
        `;
    }
}

customElements.define("application-table", ApplicationTable);

const applicationFilterState = createWatchable({
    status: "All"
});

class ApplicationFilter extends WatchableComponent {

    connectedCallback() {

        this.initComponent(applicationFilterState, (s) => `
            <div class="btn-group btn-group-sm" role="group">

                <button
                    type="button"
                    class="btn btn-outline-secondary ${s.status === "All" ? "active" : ""}"
                    data-status="All"
                >
                    All
                </button>

                <button
                    type="button"
                    class="btn btn-outline-secondary ${s.status === "Interviewing" ? "active" : ""}"
                    data-status="Interviewing"
                >
                    Interviewing
                </button>

                <button
                    type="button"
                    class="btn btn-outline-secondary ${s.status === "Offer" ? "active" : ""}"
                    data-status="Offer"
                >
                    Offers
                </button>

            </div>
        `);

        this.addEventListener("click", (event) => {
            const button = event.target.closest("[data-status]");

            if (!button) return;

            this.filter(button.dataset.status);
        });

        applicationFilterState.status =
            new URLSearchParams(window.location.search)
                .get("status") || "All";
    }

    filter(status) {
        const url = new URL(window.location.href);

        if (status === "All") {
            url.searchParams.delete("status");
        } else {
            url.searchParams.set("status", status);
        }

        window.location.href = url.toString();
    }
}

function filterApplication(applications) {
    const params = new URLSearchParams(
        window.location.search
    );

    const filters = Object.fromEntries(params.entries());

    return applications.filter(application =>
        Object.entries(filters).every(
            ([key, value]) =>
                String(application[key]) === value
        )
    );
}

customElements.define(
    "application-filter",
    ApplicationFilter
);

function initDataStores() {
    
    const userStore = new FakeDatastore(
        "careerpulse",
        "assets/db.json"
    );

    const jobsStore = new FakeDatastore(
        "available-jobs",
        "assets/jobs.json"
    );

    return {
        userStore,
        jobsStore
    }
}

var dataStores = initDataStores();

function getDataStores() {
    if(!dataStores) {
        dataStores = initDataStores();
    }
    return dataStores;
}

(async() => {
    
    const { jobsStore, userStore } = getDataStores();

    const jobsData = await jobsStore.defaultValue();

    const data = await userStore.defaultValue();

    navbarState.userProfile.name = data.userProfile.name;
    statsState.analytics = computeAnalytics(data.applications);
    applicationsState.applications = filterApplication(data.applications);

    userStore.addEventListener(
        'mutation',
        (data) => {
            console.log('event', data);
        }
    )
})();