// Allocation History and Discharge Management
let historyList = [];
let equipmentMap = {}; // patientId -> array of equipment names

document.addEventListener('DOMContentLoaded', () => {
    loadAllocations();

    document.getElementById('statusFilter').addEventListener('change', filterHistory);
    document.getElementById('searchInput').addEventListener('input', filterHistory);
});

async function loadAllocations() {
    try {
        const [allocRes, eqRes] = await Promise.all([
            fetch('/api/allocations'),
            fetch('/api/equipment')
        ]);
        historyList = await allocRes.json();
        
        equipmentMap = {};
        if (eqRes.ok) {
            const equipments = await eqRes.json();
            equipments.forEach(eq => {
                if (eq.patient && eq.patient.id) {
                    if (!equipmentMap[eq.patient.id]) {
                        equipmentMap[eq.patient.id] = [];
                    }
                    equipmentMap[eq.patient.id].push(eq.name);
                }
            });
        }

        renderHistoryTable(historyList);
    } catch (err) {
        console.error('Error fetching history:', err);
        showAlert('danger', 'Failed to load allocation history.');
    }
}

function renderHistoryTable(list) {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No allocation records found.</td></tr>`;
        return;
    }

    list.forEach(a => {
        const tr = document.createElement('tr');
        const isActive = (a.status || '').toUpperCase() === 'ACTIVE';

        const actionBtn = isActive ? `
            <button class="btn btn-sm btn-outline-danger" onclick="dischargePatient(${a.id}, '${escapeHtml(a.patient ? a.patient.name : 'Patient')}', '${escapeHtml(a.bed ? a.bed.bedNumber : 'Bed')}')">
                <i class="bi bi-box-arrow-right me-1"></i> Discharge
            </button>
        ` : `
            <span class="badge bg-light text-muted border">Completed</span>
        `;

        const patientId = a.patient ? a.patient.id : null;
        let equipmentBadges = '<span class="text-muted small">None</span>';
        if (isActive && patientId && equipmentMap[patientId] && equipmentMap[patientId].length > 0) {
            equipmentBadges = equipmentMap[patientId].map(name => 
                `<span class="badge bg-info text-dark me-1 mb-1"><i class="bi bi-tools me-1"></i>${escapeHtml(name)}</span>`
            ).join('');
        }

        tr.innerHTML = `
            <td class="fw-bold">#${a.id}</td>
            <td>
                <div class="fw-semibold text-dark">${escapeHtml(a.patient ? a.patient.name : 'Unknown')}</div>
                <small class="text-muted">Patient ID: #${a.patient ? a.patient.id : '-'}</small>
            </td>
            <td><span class="bed-tag">${escapeHtml(a.bed ? a.bed.bedNumber : '-')}</span></td>
            <td>${getBedTypeBadge(a.bed ? a.bed.bedType : '-')}</td>
            <td>${getPriorityBadge(a.priority)}</td>
            <td>${equipmentBadges}</td>
            <td><small class="text-muted">${formatDate(a.allocationDate)}</small></td>
            <td>${getAllocationStatusBadge(a.status)}</td>
            <td class="text-end">${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterHistory() {
    const statusVal = document.getElementById('statusFilter').value;
    const query = document.getElementById('searchInput').value.toLowerCase().trim();

    let filtered = historyList;

    if (statusVal && statusVal !== 'ALL') {
        filtered = filtered.filter(a => (a.status || '').toUpperCase() === statusVal);
    }

    if (query) {
        filtered = filtered.filter(a =>
            (a.patient && a.patient.name.toLowerCase().includes(query)) ||
            (a.bed && a.bed.bedNumber.toLowerCase().includes(query)) ||
            (a.priority && a.priority.toLowerCase().includes(query))
        );
    }

    renderHistoryTable(filtered);
}

async function dischargePatient(allocationId, patientName, bedNumber) {
    if (!confirm(`Are you sure you want to discharge "${patientName}"? Bed ${bedNumber} will become Available.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/allocation/discharge/${allocationId}`, {
            method: 'POST'
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showAlert('success', data.message || `Patient discharged. Bed ${bedNumber} is now available.`);
            loadAllocations();
        } else {
            showAlert('danger', data.message || 'Discharge operation failed.');
        }
    } catch (err) {
        console.error('Discharge error:', err);
        showAlert('danger', 'Error connecting to server.');
    }
}

function showAlert(type, msg) {
    const alertBox = document.getElementById('pageAlert');
    if (alertBox) {
        alertBox.className = `alert alert-${type} alert-dismissible fade show`;
        alertBox.innerHTML = `
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertBox.classList.remove('d-none');
        setTimeout(() => { alertBox.classList.add('d-none'); }, 5000);
    }
}

function getPriorityBadge(priority) {
    switch ((priority || '').toUpperCase()) {
        case 'CRITICAL': return '<span class="badge badge-critical">CRITICAL</span>';
        case 'HIGH': return '<span class="badge badge-high">HIGH</span>';
        case 'MEDIUM': return '<span class="badge badge-medium">MEDIUM</span>';
        case 'LOW': return '<span class="badge badge-low">LOW</span>';
        default: return `<span class="badge bg-secondary">${priority}</span>`;
    }
}

function getBedTypeBadge(type) {
    switch ((type || '').toUpperCase()) {
        case 'ICU': return '<span class="badge badge-bed-icu">ICU</span>';
        case 'PRIVATE': return '<span class="badge badge-bed-private">PRIVATE</span>';
        case 'GENERAL': return '<span class="badge badge-bed-general">GENERAL</span>';
        default: return `<span class="badge bg-secondary">${type}</span>`;
    }
}

function getAllocationStatusBadge(status) {
    if ((status || '').toUpperCase() === 'ACTIVE') {
        return '<span class="badge badge-available">ACTIVE</span>';
    } else {
        return '<span class="badge badge-discharged">COMPLETED</span>';
    }
}

function formatDate(isoStr) {
    if (!isoStr) return '-';
    try {
        const d = new Date(isoStr);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return isoStr;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}
