var planData;

async function loadAllPlanData() {
    const response = await fetch('assets/prices.json');
    const data = await response.json();
    planData = data;
    console.log('plan data loaded', planData);
    return data;
}

function loadAllPlansIntoContainer(plans) {
    let container = document.getElementById('plan-container');
    const allPlans = plans.map(plan => getPlanCardHtml(plan));
    console.log(allPlans);
    container.innerHTML = "".concat(...allPlans);
}

function getFeatures(features) {
    const allFeatureString = features.map(feature => `
        <li>
            <i class="fa-solid fa-circle-check" style="color: rgb(11, 244, 5);"></i>
            <span class="feature-text ${feature.isHighlighted ? 'highlight' : ''}">${feature.cardLabel}</span>
        </li>
    `)
    return "".concat(...allFeatureString);
}

function getPlanCardHtml(plan) {
    const popular = plan.isPopular ?
        `<span class="popular-tag">
            Most Popular
        </span>` :
        ``;
    return `
        
        <div class="card price-card ${plan.id} m-2">
        ${popular}
            <div class="card-body">
                
                <div class="details">
                    <h2 class="stack-sans-text">${plan.title}</h2>
                    <p class="stack-sans-text">
                        <em>${plan.subTitle}</em>
                    </p>
                    <p class="price-tag">
                        <em class="carattere-regular">${plan.pricing.monthly} </em>
                        <span>/month</span>
                    </p>
                </div>
                <ul class="features">
                    ${getFeatures(plan.features)}
                </ul>
                <div class="row align-center">
                    <button class="btn btn-primary px-5" >Buy Plan</button>
                </div>
            </div>
        </div>
    `
}


document.addEventListener(
    'readystatechange',
    ($e) => {
        if (document.readyState === 'complete') {
            loadAllPlanData()
                .then(data => {
                    loadAllPlansIntoContainer(planData.plans);
                });


        }
    }
)