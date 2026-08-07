

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const openMenu = document.getElementById('openMenu');
  const closeMenu = document.getElementById('closeMenu');
  const overlay = document.getElementById('overlay');

  if (openMenu) {
    openMenu.addEventListener('click', () => {
      sidebar.classList.add('active');
      if (overlay) overlay.classList.add('active');
    });
  }

  const handleClose = () => {
    sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  };

  if (closeMenu) closeMenu.addEventListener('click', handleClose);
  if (overlay) overlay.addEventListener('click', handleClose);
});


const regionalZonesData = [
  { name: "Thakdari", fillLevel: 85 },
  { name: "Kestopur", fillLevel: 42 },
  { name: "Chinar Park", fillLevel: 92 },
  { name: "Rajarhat", fillLevel: 15 },
  { name: "Krishnapur", fillLevel: 68 }
];

const ctxTrend = document.getElementById('weeklyTrendChart').getContext('2d');
const weeklyTrendChart = new Chart(ctxTrend, {
  type: 'line',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Waste Volume Collected (Tons)',
      data: [8.4, 9.2, 7.8, 11.4, 9.6, 6.2, 5.8],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      fill: true,
      tension: 0.3,
      borderWidth: 3
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false } } }
});


const ctxDist = document.getElementById('wasteDistributionChart').getContext('2d');
const wasteDistChart = new Chart(ctxDist, {
  type: 'doughnut',
  data: {
    labels: ['Organic', 'Plastic', 'Paper', 'Metal'],
    datasets: [{
      data: [40, 25, 20, 15],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
      borderWidth: 0
    }]
  },
  options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
});


function renderDashboardMetrics() {
  const areaContainer = document.getElementById('area-status-list');
  areaContainer.innerHTML = ''; 
  
  let criticalBinsCounter = 0;

  regionalZonesData.forEach(zone => {
    
    let elementColor = '#008000';
    if (zone.fillLevel >= 80) {
      elementColor = '#FF0000';
      criticalBinsCounter++;
    } else if (zone.fillLevel >= 50) {
      elementColor = '#0936d9';
    }

    
    const row = document.createElement('div');
    row.className = 'area-row';
    row.innerHTML = `
      <div class="area-meta">
        <span><i class="fa-solid fa-location-dot" style="color: #000"></i> ${zone.name}</span>
        <span style="color:${elementColor}">${zone.fillLevel}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${zone.fillLevel}%; background-color: ${elementColor};"></div>
      </div>
    `;
    areaContainer.appendChild(row);
  });

  document.getElementById('full-bins-count').textContent = criticalBinsCounter;
}


function simulateLiveIoTActivity() {
  regionalZonesData.forEach(zone => {
    
    let fillShift = Math.floor(Math.random() * 14) - 4; 
    zone.fillLevel = Math.max(0, Math.min(100, zone.fillLevel + fillShift));

    if (zone.fillLevel >= 98) {
      zone.fillLevel = 10;
    }
  });

  renderDashboardMetrics();
}

document.addEventListener('DOMContentLoaded', () => {
  renderDashboardMetrics();

  setInterval(simulateLiveIoTActivity, 4000);

  setInterval(() => {
    document.getElementById('live-clock').textContent = new Date().toLocaleString();
  }, 1000);
});