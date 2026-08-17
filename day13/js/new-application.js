const availableJobsState = createWatchable({
    jobs: [],
    selectedJob: null,
    loading: true
});

class NewApplicationButton extends WatchableComponent {

    constructor() {
        super();

        this.jobsStore = getDataStores().jobsStore;
        this.userStore = getDataStores().userStore;
    }

    async connectedCallback() {

        this.initComponent(
            availableJobsState,
            (s) => this.renderTemplate(s)
        );

        await this.loadJobs();

        this.addEventListener(
            "click",
            event => this.handleClick(event)
        );
    }

    async loadJobs() {

        availableJobsState.loading = true;

        const data =
            await this.jobsStore.defaultValue();

        availableJobsState.jobs =
            data.jobs || data || [];

        availableJobsState.loading = false;
    }
    handleClick(event) {

        const jobButton =
            event.target.closest("[data-job-id]");

        if (jobButton) {
            this.selectJob(jobButton.dataset.jobId);
            return;
        }

        const confirmButton =
            event.target.closest("[data-confirm]");

        if (confirmButton) {
            this.applyForJob();
            return;
        }

        const cancelButton =
            event.target.closest("[data-cancel]");

        if (cancelButton) {
            this.closeDialogs();
        }
    }

    selectJob(jobId) {

        const job =
            availableJobsState.jobs.find(
                item => item.id === jobId
            );

        if (!job) return;

        availableJobsState.selectedJob = job;

        // this.querySelector("#availableJobsDialog")
        //     ?.close();
        console.log(this.querySelector("#confirmApplicationDialog"));

        this.querySelector("#confirmApplicationDialog")
            ?.showModal();
    }

    showConfirmation() {

        console.log('show confirmation')
        if (!availableJobsState.selectedJob) return;

        this.querySelector("#confirmApplicationDialog")
            ?.showModal();
    }

    async applyForJob() {

        const job =
            availableJobsState.selectedJob;

        if (!job) return;

        const application = {
            id: `job_${Date.now()}`,
            companyName: job.companyName,
            title: job.title,
            department: job.department,
            location: job.location,
            salaryOffered: this.extractSalary(job.salaryRange),
            status: "Applied",
            appliedDate: new Date()
                .toISOString()
                .split("T")[0],
            lastUpdated: new Date()
                .toISOString()
                .split("T")[0],
            stage: "Screening",
            notes: "",
            timeline: [
                {
                    stage: "Applied",
                    date: new Date()
                        .toISOString()
                        .split("T")[0],
                    completed: true
                },
                {
                    stage: "Screening",
                    date: null,
                    completed: false
                }
            ]
        };

        this.userStore.create(
            "applications",
            application
        );

        this.dispatchEvent(
            new CustomEvent("application-created", {
                bubbles: true,
                detail: application
            })
        );

        this.closeDialogs();

        availableJobsState.selectedJob = null;
    }

    extractSalary(salaryRange) {

        if (!salaryRange) return null;

        const match =
            salaryRange.match(/₹[\d,]+/);

        return match
            ? match[0]
            : salaryRange;
    }

    closeDialogs() {

        this.querySelector("#availableJobsDialog")
            ?.close();

        this.querySelector("#confirmApplicationDialog")
            ?.close();
    }

    renderTemplate(state) {

        return `
            <button
                type="button"
                class="btn btn-primary shadow-sm"
                data-open
                onclick="this.parentElement.querySelector('#availableJobsDialog').showModal()"
            >
                <i class="bi bi-plus-circle me-2"></i>
                New Application
            </button>

            <!-- Available Jobs Dialog -->
            <dialog
                id="availableJobsDialog"
                class="border-0 rounded-3 shadow p-0"
                style="width: min(900px, 95vw);"
            >

                <div class="modal-header border-bottom px-4 py-3">

                    <div>
                        <h5 class="modal-title fw-bold mb-1">
                            Available Jobs
                        </h5>

                        <p class="text-muted small mb-0">
                            Select a position you want to apply for.
                        </p>
                    </div>

                    <button
                        type="button"
                        class="btn-close"
                        data-cancel
                    ></button>

                </div>

                <div class="modal-body p-4">

                    ${state.loading
                ? `
                                <div class="text-center py-5">
                                    <div
                                        class="spinner-border text-primary"
                                        role="status"
                                    ></div>

                                    <p class="text-muted mt-3 mb-0">
                                        Loading available jobs...
                                    </p>
                                </div>
                            `
                : state.jobs.length
                    ? `
                                    <div class="row g-3">

                                        ${state.jobs.map(job => `
                                            <div class="col-md-6">

                                                <div class="
                                                    card
                                                    border
                                                    h-100
                                                ">

                                                    <div class="card-body">

                                                        <div class="
                                                            d-flex
                                                            justify-content-between
                                                            align-items-start
                                                            gap-3
                                                        ">

                                                            <div>
                                                                <h6 class="
                                                                    fw-bold
                                                                    mb-1
                                                                ">
                                                                    ${job.title}
                                                                </h6>

                                                                <div class="
                                                                    text-muted
                                                                    small
                                                                ">
                                                                    ${job.companyName}
                                                                </div>
                                                            </div>

                                                            <span class="
                                                                badge
                                                                bg-light
                                                                text-dark
                                                                border
                                                            ">
                                                                ${job.workMode}
                                                            </span>

                                                        </div>

                                                        <div class="
                                                            small
                                                            text-muted
                                                            mt-3
                                                        ">
                                                            <div class="mb-1">
                                                                <i class="
                                                                    bi
                                                                    bi-geo-alt
                                                                    me-2
                                                                "></i>
                                                                ${job.location}
                                                            </div>

                                                            <div class="mb-1">
                                                                <i class="
                                                                    bi
                                                                    bi-cash-stack
                                                                    me-2
                                                                "></i>
                                                                ${job.salaryRange}
                                                            </div>

                                                            <div>
                                                                <i class="
                                                                    bi
                                                                    bi-briefcase
                                                                    me-2
                                                                "></i>
                                                                ${job.experience}
                                                            </div>
                                                        </div>

                                                        <div class="mt-3">
                                                            ${job.skills.map(skill => `
                                                                <span class="
                                                                    badge
                                                                    bg-primary-subtle
                                                                    text-primary
                                                                    me-1
                                                                    mb-1
                                                                ">
                                                                    ${skill}
                                                                </span>
                                                            `).join("")}
                                                        </div>

                                                    </div>

                                                    <div class="
                                                        card-footer
                                                        bg-white
                                                        border-0
                                                        pt-0
                                                    ">
                                                        <button
                                                            type="button"
                                                            class="
                                                                btn
                                                                btn-primary
                                                                btn-sm
                                                                w-100
                                                            "
                                                            data-job-id="${job.id}"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>

                                                </div>

                                            </div>
                                        `).join("")}

                                    </div>
                                `
                    : `
                                    <div class="text-center py-5">
                                        <i class="
                                            bi
                                            bi-briefcase
                                            fs-1
                                            text-muted
                                        "></i>

                                        <p class="
                                            text-muted
                                            mt-3
                                            mb-0
                                        ">
                                            No jobs are currently available.
                                        </p>
                                    </div>
                                `
            }

                </div>

            </dialog>


            <!-- Confirmation Dialog -->
            <dialog
                id="confirmApplicationDialog"
                class="border-0 rounded-3 shadow p-0"
                style="width: min(500px, 95vw);"
            >

                ${state.selectedJob
                ? `
                            <div class="modal-header border-bottom px-4 py-3">

                                <h5 class="modal-title fw-bold">
                                    Confirm Application
                                </h5>

                                <button
                                    type="button"
                                    class="btn-close"
                                    data-cancel
                                ></button>

                            </div>

                            <div class="modal-body p-4">

                                <p class="mb-3">
                                    Are you sure you want to apply for:
                                </p>

                                <div class="
                                    bg-light
                                    rounded-3
                                    p-3
                                ">

                                    <div class="fw-bold">
                                        ${state.selectedJob.title}
                                    </div>

                                    <div class="text-muted small">
                                        ${state.selectedJob.companyName}
                                    </div>

                                    <div class="text-muted small mt-2">
                                        ${state.selectedJob.location}
                                        ·
                                        ${state.selectedJob.workMode}
                                    </div>

                                </div>

                            </div>

                            <div class="
                                modal-footer
                                border-top
                                px-4
                                py-3
                            ">

                                <button
                                    type="button"
                                    class="btn btn-light border"
                                    data-cancel
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    data-confirm
                                >
                                    Confirm Application
                                </button>

                            </div>
                        `
                : ""
            }

            </dialog>
        `;
    }
}

customElements.define(
    "new-application-button",
    NewApplicationButton
);