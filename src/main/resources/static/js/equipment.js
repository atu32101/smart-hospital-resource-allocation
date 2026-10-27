// Hospital Equipment Management & Allocation for Staff
let equipmentList = [];
let admittedPatients = [];
let allocateModal = null;
let addEquipmentModal = null;
let selectedEquipmentId = null;

document.addEventListener('DOMContentLoaded', () => {
    allocateModal = new bootstrap.Modal(document.getElementById('allocateEquipmentModal'));
    addEquipmentModal = new bootstrap.Modal(document.getElementById('addEquipmentModal'));

    loadEquipment();

    document.getElementById('typeFilter').addEventListener('change', loadEquipment);
    document.getElementById('statusFilter').addEventListener('change', loadEquipment);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('confirmAllocateBtn').addEventListener('click', confirmEquipmentAllocation);
    document.getElementById('saveEquipmentBtn').addEventListener('click', saveNewEquipment);
});

async function loadEquipment() {
    const type = document.getElementById('typeFilter').value;
    const status = document.getElementById('statusFilter').value;

    let url = '/api/equipment';
    const params = new URLSearchParams();
    if (type && type !== 'ALL') params.append('type', type);
    if (status && status !== 'ALL') params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    try {
        const response = await fetch(url);
        equipmentList = await response.json();
        renderEquipmentTable(equipmentList);
    } catch (err) {
        console.error('Error fetching equipment:', err);
        showAlert('danger', 'Failed to load equipment inventory.');
    }
}

function renderEquipmentTable(list) {
    const tbody = document.getElementById('equipmentTableBody');
    tbody.innerHTML = '';

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No equipment found matching criteria.</td></tr>`;
        return;
    }

    list.forEach(eq => {
        const tr = document.createElement('tr');
        const isAllocated = (eq.status || '').toUpperCase() === 'ALLOCATED';

        const patientInfo = eq.patient ? `
            <div class="fw-semibold text-primary">${escapeHtml(eq.patient.name)}</div>
            <small class="text-muted">Patient ID: #${eq.patient.id}</small>
        ` : `<span class="text-muted fst-italic">None (Ready for use)</span>`;

        const actionButtons = isAllocated ? `
            <button class="btn btn-sm btn-outline-warning me-1" onclick="releaseEquipment(${eq.id}, '${escapeHtml(eq.name)}')">
                <i class="bi bi-arrow-counterclockwise me-1"></i> Release
            </button>
        ` : `
            <button class="btn btn-sm btn-outline-primary me-1" onclick="openAllocateModal(${eq.id}, '${escapeHtml(eq.name)}', '${eq.type}')">
                <i class="bi bi-box-arrow-in-right me-1"></i> Allocate
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteEquipment(${eq.id}, '${escapeHtml(eq.name)}')">
                <i class="bi bi-trash"></i>
            </button>
        `;

        tr.innerHTML = `
            <td class="fw-bold">#${eq.id}</td>
            <td>
                <div class="fw-bold text-dark">${escapeHtml(eq.name)}</div>
                <small class="text-muted"><i class="bi bi-geo-alt me-1"></i>${escapeHtml(eq.locationOrRoom || 'Central Storage')}</small>
            </td>
            <td>${getEquipmentTypeBadge(eq.type)}</td>
            <td>${getEquipmentStatusBadge(eq.status)}</td>
            <td>${patientInfo}</td>
            <td><small class="text-muted">${formatDate(eq.allocationDate)}</small></td>
            <td class="text-end">${actionButtons}</td>
        `;
        tbody.appendChild(tr);
    });
}

function handleSearch(e) {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
        renderEquipmentTable(equipmentList);
        return;
    }
    const filtered = equipmentList.filter(eq =>
        eq.name.toLowerCase().includes(q) ||
        eq.type.toLowerCase().includes(q) ||
        eq.status.toLowerCase().includes(q) ||
        (eq.locationOrRoom && eq.locationOrRoom.toLowerCase().includes(q)) ||
        (eq.patient && eq.patient.name.toLowerCase().includes(q))
    );
    renderEquipmentTable(filtered);
}

async function openAllocateModal(equipmentId, equipmentName, equipmentType) {
    selectedEquipmentId = equipmentId;
    document.getElementById('modalEquipmentName').textContent = equipmentName;
    document.getElementById('modalEquipmentType').innerHTML = getEquipmentTypeBadge(equipmentType);
    document.getElementById('allocateError').classList.add('d-none');

    const select = document.getElementById('admittedPatientSelect');
    select.innerHTML = '<option value="">-- Loading Admitted Patients... --</option>';

    try {
        const response = await fetch('/api/patients');
        const allPatients = await response.json();
        admittedPatients = allPatients.filter(p => (p.status || '').toUpperCase() === 'ADMITTED');

        select.innerHTML = '<option value="">-- Select Admitted Patient --</option>';
        if (admittedPatients.length === 0) {
            select.innerHTML = '<option value="">No admitted patients currently available</option>';
        } else {
            admittedPatients.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.name} (ID: #${p.id} - ${p.priority})`;
                select.appendChild(opt);
            });
        }
        allocateModal.show();
    } catch (err) {
        console.error('Error loading admitted patients:', err);
        showAlert('danger', 'Failed to fetch admitted patient list.');
    }
}

async function confirmEquipmentAllocation() {
    const patientId = document.getElementById('admittedPatientSelect').value;
    const errorDiv = document.getElementById('allocateError');

    if (!patientId) {
        errorDiv.textContent = 'Please select a patient to allocate this equipment to.';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const response = await fetch('/api/equipment/allocate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipmentId: selectedEquipmentId, patientId: parseInt(patientId) })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            allocateModal.hide();
            showAlert('success', data.message);
            loadEquipment();
        } else {
            errorDiv.textContent = data.message || 'Failed to allocate equipment.';
            errorDiv.classList.remove('d-none');
        }
    } catch (err) {
        console.error('Allocate error:', err);
        errorDiv.textContent = 'Server error during allocation.';
        errorDiv.classList.remove('d-none');
    }
}

async function releaseEquipment(equipmentId, name) {
    if (!confirm(`Are you sure you want to release "${name}"? It will become Available for other patients.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/equipment/release/${equipmentId}`, { method: 'POST' });
        const data = await response.json();
        if (response.ok && data.success) {
            showAlert('success', data.message);
            loadEquipment();
        } else {
            showAlert('danger', data.message || 'Failed to release equipment.');
        }
    } catch (err) {
        console.error('Release error:', err);
        showAlert('danger', 'Error connecting to server.');
    }
}

function openAddEquipmentModal() {
    document.getElementById('equipmentForm').reset();
    document.getElementById('addEquipmentError').classList.add('d-none');
    addEquipmentModal.show();
}

async function saveNewEquipment() {
    const name = document.getElementById('newEquipName').value.trim();
    const type = document.getElementById('newEquipType').value;
    const locationOrRoom = document.getElementById('newEquipLocation').value.trim();
    const errorDiv = document.getElementById('addEquipmentError');

    if (!name) {
        errorDiv.textContent = 'Equipment name is required.';
        errorDiv.classList.remove('d-none');
        return;
    }
    if (!type) {
        errorDiv.textContent = 'Please select equipment category/type.';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const response = await fetch('/api/equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, locationOrRoom })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            addEquipmentModal.hide();
            showAlert('success', data.message);
            loadEquipment();
        } else {
            errorDiv.textContent = data.message || 'Failed to add equipment.';
            errorDiv.classList.remove('d-none');
        }
    } catch (err) {
        console.error('Save equipment error:', err);
        errorDiv.textContent = 'Server error while saving equipment.';
        errorDiv.classList.remove('d-none');
    }
}

async function deleteEquipment(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (response.ok && data.success) {
            showAlert('success', data.message);
            loadEquipment();
        } else {
            showAlert('danger', data.message || 'Failed to delete equipment.');
        }
    } catch (err) {
        console.error('Delete error:', err);
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

function getEquipmentTypeBadge(type) {
    switch ((type || '').toUpperCase()) {
        case 'VENTILATOR': return '<span class="badge badge-equip-ventilator"><i class="bi bi-lungs me-1"></i>VENTILATOR</span>';
        case 'OXYGEN': return '<span class="badge badge-equip-oxygen"><i class="bi bi-droplet-half me-1"></i>OXYGEN</span>';
        case 'MONITOR': return '<span class="badge badge-equip-monitor"><i class="bi bi-activity me-1"></i>CARDIAC MONITOR</span>';
        case 'PUMP': return '<span class="badge badge-equip-pump"><i class="bi bi-prescription2 me-1"></i>INFUSION PUMP</span>';
        default: return `<span class="badge bg-secondary">${type}</span>`;
    }
}

function getEquipmentStatusBadge(status) {
    if ((status || '').toUpperCase() === 'AVAILABLE') {
        return '<span class="badge badge-available"><i class="bi bi-check-circle me-1"></i> AVAILABLE</span>';
    } else {
        return '<span class="badge badge-occupied"><i class="bi bi-person-fill me-1"></i> ALLOCATED</span>';
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
