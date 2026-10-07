// Dashboard logic and charts
let bedChartInstance = null;
let priorityChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        const data = await response.json();

        // Update stat counters
        document.getElementById('statTotalPatients').textContent = data.totalPatients;
        document.getElementById('statAdmittedPatients').textContent = data.admittedPatients;
        document.getElementById('statAvailableBeds').textContent = data.availableBeds;
        document.getElementById('statOccupiedBeds').textContent = data.occupiedBeds;
        document.getElementById('statWaitingPatients').textContent = data.waitingPatients;

        // Render charts
        renderBedChart(data);
        renderPriorityChart(data);
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    }
}

function renderBedChart(data) {
    const ctx = document.getElementById('bedOccupancyChart');
    if (!ctx) return;

    if (bedChartInstance) {
        bedChartInstance.destroy();
    }

    bedChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['General', 'Private', 'ICU'],
            datasets: [
                {
                    label: 'Available Beds',
                    data: [data.generalAvailable, data.privateAvailable, data.icuAvailable],
                    backgroundColor: '#10b981',
                    borderRadius: 6
                },
                {
                    label: 'Occupied Beds',
                    data: [data.generalOccupied, data.privateOccupied, data.icuOccupied],
                    backgroundColor: '#ef4444',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderPriorityChart(data) {
    const ctx = document.getElementById('patientPriorityChart');
    if (!ctx) return;

    if (priorityChartInstance) {
        priorityChartInstance.destroy();
    }

    priorityChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Critical', 'High', 'Medium', 'Low'],
            datasets: [{
                data: [data.criticalCount, data.highCount, data.mediumCount, data.lowCount],
                backgroundColor: ['#ef4444', '#f97316', '#eab308', '#38bdf8'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}
