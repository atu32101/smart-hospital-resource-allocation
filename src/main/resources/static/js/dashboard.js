// Dashboard logic and charts
let bedChartInstance = null;
let priorityChartInstance = null;
let dashAllocateModalInstance = null;
let dashAddEquipModalInstance = null;
let dashboardEquipmentList = [];

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadDashboardEquipment();

    const allocateModalEl = document.getElementById('dashAllocateModal');
    if (allocateModalEl) {
        dashAllocateModalInstance = new bootstrap.Modal(allocateModalEl);
    }
    const addEquipModalEl = document.getElementById('dashAddEquipModal');
    if (addEquipModalEl) {
        dashAddEquipModalInstance = new bootstrap.Modal(addEquipModalEl);
    }
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
        const equipEl = document.getElementById('statAvailableEquipment');
        if (equipEl) {
            equipEl.textContent = (data.availableEquipment != null ? data.availableEquipment : 0) + ' Avail';
        }

        // Render charts
        renderBedChart(data);
        renderPriorityChart(data);
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    }
}

async function loadDashboardEquipment() {
    try {
        const response = await fetch('/api/equipment');
        if (!response.ok) return;
        dashboardEquipmentList = await response.json();
        renderDashboardEquipmentTable(dashboardEquipmentList);
    } catch (e) {
        console.error('Error fetching equipment for dashboard:', e);
    }
}

function renderDashboardEquipmentTable(list) {
    const tbody = document.getElementById('dashboardEquipmentTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No equipment items found.</td></tr>`;
        return;
    }

    list.forEach(eq => {
        const tr = document.createElement('tr');
        const isAvail = (eq.status || '').toUpperCase() === 'AVAILABLE';

        const statusBadge = isAvail
            ? `<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle-fill me-1"></i>Available</span>`
            : `<span class="badge bg-primary-subtle text-primary border border-primary-subtle"><i class="bi bi-person-fill me-1"></i>In Use</span>`;

        let patientInfo = '<span class="text-muted small">None</span>';
        if (!isAvail && eq.patient) {
            patientInfo = `<div class="fw-semibold text-dark">${escapeHtml(eq.patient.name)}</div><small class="text-muted">ID: #${eq.patient.id}</small>`;
        }

        const actionBtn = isAvail
            ? `<button class="btn btn-sm btn-primary" onclick="openDashboardAllocateModal(${eq.id}, '${escapeHtml(eq.name)}', '${escapeHtml(eq.type)}', '${escapeHtml(eq.locationOrRoom || '')}')">
                <i class="bi bi-link-45deg me-1"></i> Allocate
               </button>`
            : `<button class="btn btn-sm btn-outline-danger" onclick="dashboardReleaseEquipment(${eq.id}, '${escapeHtml(eq.name)}')">
                <i class="bi bi-x-circle me-1"></i> Release
               </button>`;

        tr.innerHTML = `
            <td class="fw-bold">#${eq.id}</td>
            <td>
                <div class="fw-bold text-dark">${escapeHtml(eq.name)}</div>
            </td>
            <td><span class="badge bg-light text-dark border">${escapeHtml(formatEquipType(eq.type))}</span></td>
            <td><small class="text-secondary">${escapeHtml(eq.locationOrRoom || 'Central Storage')}</small></td>
            <td>${statusBadge}</td>
            <td>${patientInfo}</td>
            <td class="text-end">${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function formatEquipType(t) {
    if (!t) return '-';
    switch (t.toUpperCase()) {
        case 'VENTILATOR': return 'Ventilator';
        case 'OXYGEN_CONCENTRATOR': return 'Oxygen Concentrator';
        case 'PATIENT_MONITOR': return 'Patient Monitor';
        case 'INFUSION_PUMP': return 'Infusion Pump';
        default: return t;
    }
}

async function openDashboardAllocateModal(eqId, name, type, location) {
    document.getElementById('dashAllocateEquipId').value = eqId;
    document.getElementById('dashAllocateEquipName').textContent = name;
    document.getElementById('dashAllocateEquipMeta').textContent = `Type: ${formatEquipType(type)} | Location: ${location || 'Central Storage'}`;

    const select = document.getElementById('dashPatientSelect');
    select.innerHTML = '<option value="">Loading admitted patients...</option>';

    if (dashAllocateModalInstance) {
        dashAllocateModalInstance.show();
    }

    try {
        const res = await fetch('/api/patients/admitted');
        const admitted = await res.json();
        select.innerHTML = '<option value="">-- Choose Admitted Patient --</option>';

        if (!admitted || admitted.length === 0) {
            select.innerHTML = '<option value="">No patients currently admitted (admit a patient first via Bed Allocation)</option>';
            return;
        }

        admitted.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (Age: ${p.age}, Priority: ${p.priority}, Required: ${p.requiredBedType})`;
            select.appendChild(opt);
        });
    } catch (e) {
        select.innerHTML = '<option value="">Error loading patients</option>';
    }
}

async function submitDashboardAllocate() {
    const eqId = document.getElementById('dashAllocateEquipId').value;
    const patientId = document.getElementById('dashPatientSelect').value;

    if (!patientId) {
        alert('Please select an admitted patient to allocate this device.');
        return;
    }

    const btn = document.getElementById('dashConfirmAllocateBtn');
    btn.disabled = true;

    try {
        const res = await fetch('/api/equipment/allocate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipmentId: parseInt(eqId), patientId: parseInt(patientId) })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            if (dashAllocateModalInstance) dashAllocateModalInstance.hide();
            loadDashboardStats();
            loadDashboardEquipment();
        } else {
            alert(data.message || 'Failed to allocate equipment.');
        }
    } catch (e) {
        alert('Connection error occurred.');
    } finally {
        btn.disabled = false;
    }
}

async function dashboardReleaseEquipment(eqId, name) {
    if (!confirm(`Are you sure you want to release "${name}" back to the available inventory?`)) {
        return;
    }

    try {
        const res = await fetch(`/api/equipment/release/${eqId}`, { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success) {
            loadDashboardStats();
            loadDashboardEquipment();
        } else {
            alert(data.message || 'Failed to release equipment.');
        }
    } catch (e) {
        alert('Error connecting to server.');
    }
}

function openDashboardAddEquipmentModal() {
    document.getElementById('dashAddEquipForm').reset();
    if (dashAddEquipModalInstance) {
        dashAddEquipModalInstance.show();
    }
}

async function submitDashboardAddEquipment() {
    const name = document.getElementById('dashEquipName').value.trim();
    const type = document.getElementById('dashEquipType').value;
    const location = document.getElementById('dashEquipLocation').value.trim();

    if (!name || !location) {
        alert('Please fill in device name and location.');
        return;
    }

    try {
        const res = await fetch('/api/equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, locationOrRoom: location })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            if (dashAddEquipModalInstance) dashAddEquipModalInstance.hide();
            loadDashboardStats();
            loadDashboardEquipment();
        } else {
            alert(data.message || 'Failed to add equipment.');
        }
    } catch (e) {
        alert('Connection error.');
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
